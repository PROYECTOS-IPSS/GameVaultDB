# GameVaultDB

Aplicación web para gestión de videojuegos. Construida con Express, Handlebars, Prisma ORM y SQLite.

## Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express 5
- **Templating:** Handlebars (express-handlebars)
- **ORM:** Prisma 6 + SQLite
- **Validación:** Zod
- **Autenticación:** bcrypt

## Requisitos

- Node.js >= 18
- Yarn

## Instalación

```bash
yarn install
```

## Configuración

Copiar `.env-example` a `.env`:

```bash
cp .env-example .env
```

Variables disponibles:

| Variable       | Descripción          | Default |
|----------------|----------------------|---------|
| `PORT`         | Puerto del servidor  | `3000`  |
| `DATABASE_URL` | URL de SQLite        | `file:./prisma/dev.db` |

## Base de datos

Generar cliente Prisma y crear la base de datos:

```bash
npx prisma generate
npx prisma db push
```

Poblar con datos de prueba desde los CSV en `prisma/data/`:

```bash
yarn seed
```

El seed es idempotente — puede ejecutarse múltiples veces sin duplicar registros.

## Desarrollo

```bash
yarn dev
```

Inicia el servidor con nodemon y recarga automática en `http://localhost:3000`.

## Compilar y ejecutar

```bash
yarn build
yarn start
```

## Estructura del proyecto

```
├── prisma/
│   ├── schema.prisma      # Modelos de datos
│   ├── seed.ts            # Población de base de datos
│   ├── data/              # Archivos CSV (datos de prueba)
│   └── dev.db             # Base de datos SQLite
├── src/
│   ├── index.ts           # Punto de entrada
│   ├── app.ts             # Configuración de Express
│   ├── routes/            # Rutas (auth, games)
│   ├── controllers/       # Controladores
│   ├── schemas/           # Esquemas de validación
│   ├── middleware/        # Middleware
│   └── models/            # Modelos (Prisma Client)
├── views/                 # Plantillas Handlebars
│   ├── layouts/           # Layouts
│   ├── auth/              # Vistas de autenticación
│   ├── home.hbs           # Página principal
│   ├── 403.hbs            # Acceso denegado
│   └── 404.hbs            # No encontrado
└── public/                # Archivos estáticos (CSS, JS)
```

## Modelos de datos

| Modelo       | Descripción              |
|-------------|--------------------------|
| User        | Usuarios del sistema     |
| Game        | Videojuegos              |
| Genre       | Géneros (RPG, Shooter…)  |
| Platform    | Plataformas (PC, PS5…)   |
| Publisher   | Editoriales              |
| Developer   | Desarrolladores          |
| UserGame    | Relación usuario-juego   |

## Scripts

| Comando       | Descripción                      |
|---------------|----------------------------------|
| `yarn dev`    | Iniciar servidor en desarrollo   |
| `yarn build`  | Compilar TypeScript              |
| `yarn start`  | Ejecutar compilación             |
| `yarn seed`   | Poblar base de datos             |
| `npx prisma studio` | Explorar base de datos (GUI) |
