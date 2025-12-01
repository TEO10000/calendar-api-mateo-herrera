Restricciones de la Solución Propuesta
Nombre: Mateo Herrera
Fecha: 30/11/2025
b) Restricciones de la solución propuesta
La arquitectura planteada para el servicio de calendario presenta varias restricciones derivadas de requisitos funcionales, no funcionales y decisiones tecnológicas. A continuación, se detallan de forma clara y organizada:
1. Restricción de seguridad por datos sensibles
Los calendarios, eventos y notificaciones contienen información personal, por lo que deben almacenarse cifrados. Esto implica:
- El backend es el único que puede desencriptar los datos.
- Los clientes nunca pueden ver datos sin cifrar.
- Se requiere una gestión segura de claves.
Impacto: mayor complejidad y carga en el servidor.
2. Restricción de autenticación obligatoria (JWT)
Todas las operaciones requieren autenticación mediante tokens JWT. Esto significa:
- Cada petición debe incluir Authorization: Bearer <token>.
- Tokens deben validarse en cada petición.
- No existen clientes anónimos.
Impacto: se vuelve obligatorio verificar seguridad en todos los endpoints.
3. Restricción de autorización por usuario
Cada usuario solo puede acceder a sus propios calendarios y eventos. Esto implica:
- Validar propiedad del recurso en cada llamada.
- Impedir accesos cruzados entre usuarios.
Impacto: requiere validaciones adicionales en el backend.
4. Restricción de multicliente / multiplataforma
El mismo backend debe atender web, móviles y servicios externos. Por lo tanto:
- La API debe ser 100% REST y stateless.
- El formato JSON debe ser uniforme.
Impacto: no se pueden usar sesiones en servidor, todo depende del token.
5. Restricción de consistencia en notificaciones
Las notificaciones dependen del evento y del horario. Esto restringe que:
- No se pueda crear una notificación sin evento válido.
- Deba existir una hora exacta (eventTime).
Impacto: aumenta la validación de datos y reglas de negocio.
6. Restricción de arquitectura (backend centralizado)
Toda la lógica vive en el backend:
- Autenticación
- Desencriptación
- Validaciones
- Registro de notificaciones
Impacto: los clientes son dependientes y no pueden operar sin servidor.
7. Restricción de escalabilidad
Aunque REST es escalable, hay limitaciones:
- Cifrado/desencriptado consume CPU.
- Validación de JWT en cada petición agrega carga.
- Las notificaciones requieren infraestructura adicional (cronjobs, colas de mensajes).
Impacto: puede requerir particionar en microservicios para escalar.
8. Restricción tecnológica (Node.js / Express)
El stack elegido impone:
- Node es single-thread por worker.
- Operaciones pesadas pueden bloquear el event loop.
Impacto: requiere clustering o distribución para alta carga.
Resumen:
La solución se encuentra limitada por requisitos de seguridad, autenticación, autorización, arquitectura REST, consistencia de datos, centralización del backend y limitaciones técnicas del entorno Node.js.
  
