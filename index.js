const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'super-secret-demo';

app.use(express.json());
app.use(cors());

// --- Cargar el YAML de OpenAPI ---
let swaggerDocument;
try {
  const specPath = path.join(__dirname, 'calendar-api.yaml');
  console.log('Cargando OpenAPI desde:', specPath);
  swaggerDocument = yaml.load(specPath);
  console.log('✅ OpenAPI cargado correctamente');
} catch (err) {
  console.error('❌ Error cargando calendar-api.yaml:', err.message);
  // Fallback mínimo para que Swagger UI no reviente
  swaggerDocument = {
    openapi: '3.0.0',
    info: {
      title: 'API mínima de fallback',
      version: '1.0.0'
    },
    paths: {}
  };
}

// --- Swagger UI en /docs ---
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Ruta raíz: redirige a /docs
app.get('/', (req, res) => {
  res.redirect('/docs');
});

// ----- "Base de datos" en memoria -----
const users = [
  {
    id: 1,
    username: 'mateo',
    passwordHash: bcrypt.hashSync('1234', 8)
  }
];

let calendars = [
  {
    id: '1',
    userId: 1,
    name: 'Calendario Principal',
    description: 'Calendario de ejemplo',
    encryptedData: 'ENCRYPTED_DATA'
  }
];

let notifications = [];

// ----- Middleware de autenticación -----
function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ message: 'Token requerido' });

  const [type, token] = header.split(' ');
  if (type !== 'Bearer') return res.status(401).json({ message: 'Formato inválido' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

// ----- ENDPOINTS -----

// POST /auth/login
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// GET /calendars
app.get('/calendars', authMiddleware, (req, res) => {
  const list = calendars.filter(c => c.userId === req.userId);
  res.json(list);
});

// POST /calendars
app.post('/calendars', authMiddleware, (req, res) => {
  const { name, description } = req.body;

  const newCalendar = {
    id: String(calendars.length + 1),
    userId: req.userId,
    name,
    description: description || '',
    encryptedData: 'ENCRYPTED_DATA'
  };

  calendars.push(newCalendar);
  res.status(201).json(newCalendar);
});

// GET /calendars/:id
app.get('/calendars/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  const calendar = calendars.find(c => c.id === id && c.userId === req.userId);
  if (!calendar) return res.status(403).json({ message: 'No autorizado' });

  res.json(calendar);
});

// POST /notifications
app.post('/notifications', authMiddleware, (req, res) => {
  const { calendarId, eventTime, message } = req.body;

  const calendar = calendars.find(
    c => c.id === calendarId && c.userId === req.userId
  );

  if (!calendar) return res.status(403).json({ message: 'No autorizado' });

  const newNotif = {
    id: String(notifications.length + 1),
    calendarId,
    eventTime,
    message
  };

  notifications.push(newNotif);
  res.status(201).json(newNotif);
});

// ----- Levantar servidor -----
app.listen(PORT, () => {
  console.log(`API lista en http://localhost:${PORT}`);
  console.log(`Documentación Swagger: http://localhost:${PORT}/docs`);
});
