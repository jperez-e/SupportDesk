# SupportDesk

SupportDesk es una aplicación web de gestión de soporte técnico desarrollada como proyecto full stack. Permite registrar, administrar, asignar, dar seguimiento y auditar tickets de soporte mediante una API REST en ASP.NET Core y una interfaz web en React + TypeScript.

El sistema implementa autenticación con JWT, control de acceso por roles, historial de cambios, comentarios, métricas operativas, administración de usuarios y categorías, eliminación lógica de tickets y restauración.

---

## Tecnologías

### Backend

- ASP.NET Core 9
- C#
- Entity Framework Core
- SQL Server / LocalDB
- JWT Bearer Authentication
- ASP.NET Core Identity `PasswordHasher<T>`
- Swagger / OpenAPI
- Dependency Injection
- Middleware personalizado para manejo de excepciones

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Recharts
- Context API
- Fetch API

---

## Arquitectura

```text
SupportDesk.Web
React + TypeScript
        |
        | HTTP / JSON + JWT
        v
SupportDesk.API
ASP.NET Core REST API
        |
        | Entity Framework Core
        v
SQL Server
```

La aplicación sigue una arquitectura cliente-servidor con separación entre frontend, API y base de datos.

---

## Funcionalidades principales

### Autenticación

- Registro de usuarios.
- Inicio de sesión.
- Autenticación mediante JWT.
- Validación del usuario en cada token autenticado.
- Verificación de `TokenVersion`.
- Revocación de sesiones al cambiar datos sensibles.
- Bloqueo de usuarios inactivos.
- Consulta del usuario autenticado mediante `/api/Auth/me`.
- Cambio de contraseña autenticado.

### Roles y permisos

El sistema utiliza tres roles:

#### User

- Crear tickets.
- Ver sus propios tickets.
- Editar sus tickets.
- Agregar comentarios.
- Consultar historial.
- Eliminar sus tickets según las reglas del sistema.

#### Agent

- Ver tickets asignados.
- Editar tickets asignados.
- Agregar comentarios.
- Consultar historial.
- Cambiar estados permitidos.

#### Admin

- Acceso completo a tickets.
- Asignar y desasignar agentes.
- Cambiar estados.
- Administrar usuarios.
- Cambiar roles.
- Activar o desactivar usuarios.
- Administrar categorías.
- Ver tickets eliminados.
- Restaurar tickets.

---

## Gestión de tickets

Cada ticket contiene información como:

- Título.
- Descripción.
- Estado.
- Prioridad.
- Categoría.
- Usuario creador.
- Agente asignado.
- Fecha de creación.
- Fecha de resolución.

### Estados

```text
Open
  |
  v
In Progress
  |
  v
Resolved
  |
  v
Closed
```

También se permite regresar de:

```text
Resolved -> In Progress
```

Los cambios de estado son validados por el backend.

### Prioridades

```text
Low
Medium
High
Critical
```

---

## Auditoría e historial

SupportDesk registra cambios importantes realizados sobre los tickets.

Entre los eventos auditados se encuentran:

- Creación.
- Actualización.
- Cambio de estado.
- Cambio de prioridad.
- Cambio de categoría.
- Asignación.
- Reasignación.
- Desasignación.
- Eliminación.
- Restauración.

Cada registro puede almacenar:

- Ticket.
- Usuario que realizó la acción.
- Acción.
- Campo modificado.
- Valor anterior.
- Valor nuevo.
- Fecha del evento.

---

## Comentarios

Los usuarios autorizados pueden agregar comentarios a los tickets a los que tienen acceso.

Las reglas de acceso se validan en el backend y no dependen solamente de la interfaz gráfica.

---

## Eliminación lógica

Los tickets utilizan eliminación lógica mediante `IsDeleted`.

Esto permite:

- Ocultar tickets eliminados del flujo normal.
- Mantener su información en la base de datos.
- Preservar auditoría.
- Restaurarlos posteriormente por un administrador.

Entity Framework Core utiliza filtros globales para excluir tickets eliminados en las consultas normales.

---

## Dashboard

El sistema incluye un dashboard con métricas operativas.

Entre ellas:

- Total de tickets.
- Tickets abiertos.
- Tickets en progreso.
- Tickets resueltos.
- Tickets cerrados.
- Tickets sin asignar.
- Tickets creados durante los últimos 7 días.
- Distribución por prioridad.
- Distribución por categoría.
- Carga activa por agente.
- Tiempo promedio de resolución.
- Rendimiento de agentes.
- Tickets resueltos por agente.

También incluye gráficos utilizando Recharts.

---

## Experiencia de usuario

El frontend incorpora:

- Layout protegido.
- Sidebar por permisos.
- Toasts globales.
- Modales de confirmación.
- Estados de carga.
- Mensajes de error.
- Páginas 403 y 404.
- Perfil de usuario.
- Cambio de contraseña.
- Diseño responsive.

---

## Estructura general

```text
SupportDesk
|
|-- SupportDesk.API
|   |-- Constants
|   |-- Controllers
|   |-- Data
|   |-- DTOs
|   |-- Middleware
|   |-- Models
|   |-- Services
|   |-- appsettings.json
|   `-- Program.cs
|
`-- SupportDesk.Web
    |-- src
    |   |-- components
    |   |-- config
    |   |-- contexts
    |   |-- pages
    |   |-- services
    |   |-- types
    |   |-- utils
    |   |-- App.tsx
    |   |-- main.tsx
    |   `-- index.css
    |
    |-- .env
    |-- package.json
    `-- vite.config.ts
```

---

## Requisitos

Para ejecutar el proyecto se recomienda tener instalado:

- .NET SDK 9
- SQL Server, SQL Server Express o LocalDB
- Node.js 20 o superior
- npm
- Git

---

# Configuración del backend

## 1. Entrar al proyecto

```bash
cd SupportDesk.API
```

## 2. Configurar la conexión

Crea o modifica `appsettings.Development.json`.

Ejemplo:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=SupportDeskDb;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "REEMPLAZAR_POR_UNA_CLAVE_SEGURA",
    "Issuer": "SupportDesk.API",
    "Audience": "SupportDesk.Client",
    "ExpirationMinutes": 60
  }
}
```

> No publiques claves JWT, contraseñas ni secretos reales en GitHub.

## 3. Restaurar dependencias

```bash
dotnet restore
```

## 4. Aplicar migraciones

```bash
dotnet ef database update
```

Si no tienes instalada la herramienta de Entity Framework:

```bash
dotnet tool install --global dotnet-ef
```

## 5. Ejecutar API

```bash
dotnet run
```

Durante desarrollo, la API está configurada para trabajar aproximadamente en:

```text
https://localhost:7186
```

Swagger estará disponible en la ruta configurada por ASP.NET Core, normalmente:

```text
https://localhost:7186/swagger
```

---

# Configuración del frontend

## 1. Entrar al proyecto

```bash
cd SupportDesk.Web
```

## 2. Instalar dependencias

```bash
npm install
```

SupportDesk también utiliza React Router y Recharts.

Si no aparecen todavía en `package.json`, instala:

```bash
npm install react-router-dom recharts
```

## 3. Configurar URL de la API

Crea:

```text
.env
```

Contenido:

```env
VITE_API_URL=https://localhost:7186
```

## 4. Ejecutar frontend

```bash
npm run dev
```

La aplicación Vite normalmente estará disponible en:

```text
http://localhost:5173
```

---

# CORS

El backend permite durante desarrollo solicitudes desde:

```text
http://localhost:5173
```

La configuración se encuentra en `Program.cs`.

Para producción se debe cambiar este origen por el dominio real del frontend.

---

# Seguridad

SupportDesk implementa varias medidas de seguridad:

- Contraseñas almacenadas mediante hashing.
- JWT firmado.
- Validación de issuer.
- Validación de audience.
- Validación de expiración.
- Validación de firma.
- Validación del usuario en base de datos.
- Rechazo de cuentas inactivas.
- `TokenVersion` para revocar tokens.
- Autorización por roles.
- Validaciones de permisos en el backend.
- Restricciones para evitar dejar el sistema sin administradores activos.

La interfaz oculta acciones no permitidas, pero la autorización real se ejecuta en la API.

---

# Principales endpoints

## Auth

```text
POST /api/Auth/register
POST /api/Auth/login
GET  /api/Auth/me
PUT  /api/Auth/change-password
```

## Tickets

Incluye operaciones para:

```text
Crear
Listar
Consultar detalle
Editar
Cambiar estado
Asignar
Desasignar
Eliminar
Restaurar
Consultar eliminados
Consultar historial
```

## Users

Incluye administración de:

```text
Usuarios
Roles
Estado activo/inactivo
```

## Categories

Incluye:

```text
Crear
Consultar
Editar
Eliminar
```

## Dashboard

```text
GET /api/Dashboard/summary
```

---

# Compilación

## Backend

```bash
dotnet build
```

## Frontend

```bash
npm run build
```

---

# Pruebas realizadas

El sistema fue probado de extremo a extremo para los tres roles:

```text
User
Agent
Admin
```

Se verificaron:

- Inicio de sesión.
- Validación de sesión.
- Permisos.
- Creación de tickets.
- Edición.
- Categorías.
- Comentarios.
- Historial.
- Estados.
- Asignación.
- Eliminación.
- Restauración.
- Administración de usuarios.
- Dashboard.
- Perfil.
- Cambio de contraseña.
- Páginas 403 y 404.

---

# Mejoras futuras

Algunas funcionalidades que podrían agregarse en futuras versiones:

- Adjuntos.
- Notificaciones.
- Correo electrónico.
- Actualizaciones en tiempo real.
- SLA.
- Recuperación de contraseña.
- Despliegue en producción.
- Pruebas automatizadas.

Estas funcionalidades no forman parte de la versión actual.

---

# Autor

**José Pérez**

Proyecto desarrollado como parte de la formación en Ingeniería de Software y como proyecto de portafolio.

---

# Licencia

Este proyecto puede utilizarse con fines educativos y de portafolio.
