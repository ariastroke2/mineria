# Pinterest Clone - Minería de Datos

Aplicación tipo Pinterest con React (Frontend) y Node.js/Express con Neo4j (Backend).

## Requisitos

- Node.js (v18 o superior)
- npm
- Base de datos Neo4j (configurada en la nube)

## Estructura del Proyecto

```
├── mineria/                    # Frontend (React)
│   ├── src/
│   ├── public/
│   └── package.json
│
└── Social-Network-Pinterest/   # Backend (Node.js + Neo4j)
    └── backend/
        ├── index.js
        └── package.json
```

## Configuración

### 1. Variables de Entorno (Backend)

Crear archivo `.env` en la carpeta del backend (`Social-Network-Pinterest/backend/`):

```env
NEO4J_URI=neo4j+s://tu-instancia.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=tu_password
PORT=3001
```

## Iniciar la Aplicación

### Opción 1: Iniciar por separado

#### Backend (Puerto 3001)

```bash
# Ir a la carpeta del backend
cd ~/Desktop/Social-Network-Pinterest/backend

# Instalar dependencias (solo la primera vez)
npm install

# Iniciar el servidor
node index.js
```

Deberías ver: `Backend corriendo en puerto 3001`

#### Frontend (Puerto 3000)

```bash
# Ir a la carpeta del frontend
cd ~/Desktop/mineria

# Instalar dependencias (solo la primera vez)
npm install

# Iniciar la aplicación
npm start
```

Se abrirá automáticamente en [http://localhost:3000](http://localhost:3000)

### Opción 2: Iniciar ambos con un comando

```bash
# Terminal 1 - Backend
cd ~/Desktop/Social-Network-Pinterest/backend && node index.js

# Terminal 2 - Frontend
cd ~/Desktop/mineria && npm start
```

## Endpoints del Backend

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/pins` | Obtener todos los pins |
| GET | `/api/pin/:id` | Obtener detalle de un pin |
| POST | `/api/pins` | Crear un nuevo pin |
| POST | `/api/pins/:id/like` | Dar/quitar like a un pin |
| POST | `/api/pins/:id/comment` | Comentar en un pin |
| GET | `/api/boards` | Obtener todos los boards |
| POST | `/api/boards` | Crear un nuevo board |
| GET | `/api/user/:id` | Obtener perfil de usuario |
| GET | `/api/user/:id/saved-pins` | Pins guardados del usuario |
| GET | `/api/user/:id/liked-pins` | Pins que le gustan al usuario |

## Tecnologías

- **Frontend:** React 19, React Router, Axios
- **Backend:** Express 5, Neo4j Driver
- **Base de Datos:** Neo4j (Graph Database)

## Notas

- El frontend corre en el puerto `3000`
- El backend corre en el puerto `3001`
- Asegúrate de que el backend esté corriendo antes de usar el frontend
