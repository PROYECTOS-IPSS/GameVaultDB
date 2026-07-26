# GameVaultDB

Aplicación web para gestión de videojuegos con arquitectura MVC. Permite a los usuarios registrarse, iniciar sesión, explorar un catálogo de videojuegos y mantener una colección personal.

Construida con Express, Handlebars, Prisma ORM y SQLite.

## Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express 5
- **Templating:** Handlebars (express-handlebars)
- **ORM:** Prisma 6 + SQLite
- **Validación:** Zod
- **Autenticación:** bcrypt + express-session
- **Estilos:** Bootstrap 5
- **Contenedores:** Docker + Docker Compose (opcional)

## ¿Por qué este stack?

Elegimos este stack por **simpleza** y **afinidad** — ya habíamos trabajado con estas herramientas antes, lo que redujo la curva de aprendizaje y nos permitió enfocarnos en la lógica del proyecto.

- **SQLite**: al ser una aplicación pequeña, SQLite nos permitió manejar la base de datos de forma más sencilla, sin necesidad de configurar un servidor de base de datos externo.
- **Prisma ORM**: trabajar con Prisma facilita las consultas a la base de datos, tipado fuerte y migraciones controladas.
- **Handlebars**: está bien integrado con Express, permite renderizado del servidor sin complejidad adicional.
- **bcrypt**: hashea las contraseñas antes de guardarlas en la base de datos, evitando que se almacenen en texto plano.
- **Zod**: útil para validaciones de entrada, garantiza que los datos que llegan a los controladores cumplan el esquema esperado antes de procesarlos.

## Requisitos

### Sin Docker

- Node.js >= 22
- npm o Yarn

### Con Docker

- Docker >= 20.10
- Docker Compose >= 2.0

## Configuración

Copiar `.env-example` a `.env`:

```bash
cp .env-example .env
```

Variables disponibles:

| Variable       | Descripción         | Default                |
| -------------- | ------------------- | ---------------------- |
| `PORT`         | Puerto del servidor | `3000`                 |
| `DATABASE_URL` | URL de SQLite       | `file:./prisma/dev.db` |

## Instalación y ejecución (sin Docker)

### 1. Instalar dependencias

```bash
npm install
# o
yarn install
```

### 2. Configurar base de datos

Generar cliente Prisma y crear la base de datos:

```bash
npx prisma generate
npx prisma db push
```

### 3. Poblar con datos de prueba

```bash
npm run seed
# o
yarn seed
```

El seed es idempotente — puede ejecutarse múltiples veces sin duplicar registros. Carga datos desde los CSV en `prisma/data/`.

### 4. Iniciar servidor

**Desarrollo** (con nodemon y recarga automática):

```bash
npm run dev
# o
yarn dev
```

**Producción:**

```bash
npm run build
npm start
```

El servidor corre en `http://localhost:3000`.

## Despliegue con Docker

### 1. Construir y levantar

```bash
docker compose up --build -d
```

Esto:

- Construye la imagen multi-stage (build TS → prod)
- Sincroniza el esquema de la base de datos con `prisma db push`
- Ejecuta el seed automáticamente (pobla 20 usuarios, 20 juegos, 20 relaciones)
- Inicia el servidor en puerto 3000

### 2. Verificar

```bash
docker compose logs -f
```

El servidor corre en `http://localhost:3000`.

### 3. Detener

```bash
docker compose down
```

Para borrar también la base de datos:

```bash
docker compose down -v
```

### 4. Verificar que el seed corrió

```bash
docker compose logs | grep "Seed complete"
```

Deberías ver: `Seed complete: 20 users, 20 games, 20 user-game relations`

## Estructura del proyecto

```
GameVaultDB/
├── prisma/
│   ├── schema.prisma         # Modelos de datos
│   ├── seed.ts               # Población de base de datos
│   ├── data/                 # Archivos CSV (datos de prueba)
│   ├── migrations/           # Migraciones SQL (opcional)
│   └── dev.db                # Base de datos SQLite
├── src/
│   ├── index.ts              # Punto de entrada
│   ├── app.ts                # Configuración de Express
│   ├── controllers/          # Controladores (auth, games, collection)
│   ├── models/               # Modelos (lógica Prisma)
│   ├── routes/               # Rutas (auth, games, collection)
│   ├── schemas/              # Esquemas de validación Zod
│   ├── middleware/           # Middleware (auth, sesiones)
│   └── types/                # Tipos TypeScript
├── views/
│   ├── layouts/              # Layouts Handlebars
│   ├── partials/             # Partiales (navbar, sidebar, hero, game-card)
│   ├── auth/                 # Vistas de autenticación (login, register)
│   ├── games/                # Vistas de videojuegos (index, show, form)
│   ├── collection/           # Vistas de colección de usuario
│   ├── home.hbs              # Página principal
│   ├── 403.hbs               # Acceso denegado
│   └── 404.hbs               # No encontrado
├── public/
│   ├── css/                  # Estilos
│   └── js/                   # Scripts cliente
├── Dockerfile                # Imagen multi-stage
├── docker-compose.yml        # Orquestación
└── .dockerignore             # Exclusiones Docker
```

## Arquitectura

MVC con separación de responsabilidades:

```
HTTP Request → Routes → Controllers → Models → Prisma ORM → SQLite
```

- **Routes**: reciben petición, ejecutan middlewares, llaman al controlador
- **Controllers**: validan flujo, llaman al modelo, renderizan vistas o redirigen
- **Models**: toda interacción con Prisma (consultas, transacciones)
- **Views**: plantillas Handlebars, sin lógica de negocio

## Modelos de datos

| Modelo    | Descripción                        |
| --------- | ---------------------------------- |
| User      | Usuarios del sistema               |
| Game      | Videojuegos                        |
| Genre     | Géneros (RPG, Shooter, etc.)       |
| Platform  | Plataformas (PC, PS5, etc.)        |
| Publisher | Editoriales                        |
| Developer | Desarrolladores                    |
| UserGame  | Relación usuario-juego (colección) |

## Scripts

| Comando                     | Descripción                      |
| --------------------------- | -------------------------------- |
| `npm run dev`               | Iniciar servidor en desarrollo   |
| `npm run build`             | Compilar TypeScript              |
| `npm start`                 | Ejecutar compilación             |
| `npm run seed`              | Poblar base de datos             |
| `npx prisma studio`         | Explorar base de datos (GUI)     |
| `npx prisma db push`        | Sincronizar esquema con BD       |
| `npx prisma migrate dev`    | Crear migración (desarrollo)     |

## Seguridad

- Contraseñas hasheadas con bcrypt (salt rounds)
- Sesiones con express-session
- Middleware de autenticación protege rutas privadas
- Validación de entradas con Zod en todos los endpoints
- Soft delete: registros no se eliminan físicamente (campo `deletedAt`)

## Constitución del arnés agéntico

Este proyecto se desarrolla con un arnés agéntico (**Oh My Pi + OpenCode Go**). A continuación se describe cómo se configuró.

### Archivos de contexto

- `AGENTS.md` (raíz del proyecto): contrato principal que el agente lee en cada turno. Define arquitectura MVC, stack, convenciones de nombres, seguridad, soft delete, flujo Git y criterios de calidad.
- `~/.config/opencode/AGENTS.md`: contexto global del usuario, agrega la directiva de usar Context7 para documentación actualizada de librerías.

### Reglas

- Arquitectura MVC estricta: rutas sin lógica, controladores sin Prisma, modelos sin vistas.
- TypeScript estricto, sin `any`, `async/await` en toda operación de BD.
- Prisma ORM como única fuente de acceso a datos — SQL manual solo en casos extremos.
- Validación de entradas con **Zod** (`safeParse`) en controladores.
- Contraseñas con **bcryptjs** (hash + salt), nunca texto plano.
- **Soft delete** mediante campo `deletedAt` — no hay hard delete.
- Git: nunca trabajar sobre `main`, ramas por funcionalidad (`feat/*`, `fix/*`, `docs/*`).

### Instrucciones especiales (skills activos)

- **Ponytail** (nivel full): ladder de minimalismo — YAGNI, reutilizar antes que escribir, stdlib antes que dependencia, diff más corto que funcione.
- **Caveman** (nivel ultra): comunicación comprimida, sin artículos ni relleno.
- **Frontend Design**: guía de dirección visual para vistas con Bootstrap — tipografía, espaciado y estética intencional, no templada.
- **Context7**: resolución de librerías y consulta de documentación actualizada antes de confiar en memoria del modelo.

### Flujo de trabajo con el agente

1. El agente carga `AGENTS.md` al inicio de cada sesión.
2. Lee el request, mapea archivos afectados y traza el flujo end-to-end.
3. Aplica el ladder de Ponytail antes de escribir código.
4. Edita respetando las capas MVC y las convenciones de nombres (`user.controller.ts`, `user.model.ts`, etc.).
5. Verifica el cambio (ejecución, test o smoke) antes de cerrar.
6. No hace commit automático — espera confirmación del desarrollador.
