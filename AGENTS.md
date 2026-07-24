# AGENTS.md

# Game Vault DB - Desarrollo de Software Web II

## Objetivo del proyecto

Desarrollar una aplicación web utilizando una arquitectura MVC para la administración de usuarios y videojuegos, aplicando buenas prácticas de desarrollo de software, seguridad, validación de datos y trabajo colaborativo mediante Git.

Este proyecto está siendo desarrollado por dos integrantes utilizando un arnés agéntico (Oh My Pi + OpenCode Go), por lo que todos los agentes deben respetar estrictamente las convenciones descritas en este documento.

---

# Regla de prueba

Cuando respondas, termina siempre tu primera respuesta con:

"AGENTS.md cargado correctamente."

# Stack tecnológico

## Backend

- Node.js
- Express.js
- TypeScript

## Base de datos

- Prisma ORM
- SQLite

## Frontend

- Handlebars
- Bootstrap 5 (preferido)

## Validaciones

- Zod

## Seguridad

- bcryptjs
- express-session (si se utiliza autenticación por sesión)

## Desarrollo

- Nodemon

## Opcional

- Docker
- Docker Compose

---

# Arquitectura

El proyecto sigue una arquitectura MVC.

```
HTTP Request
      │
      ▼
Routes
      │
      ▼
Controllers
      │
      ▼
Models
      │
      ▼
Prisma ORM
      │
      ▼
SQLite
```

Cada capa tiene una responsabilidad específica.

---

# Responsabilidades de cada carpeta

## controllers/

Los controladores:

- reciben la petición
- validan el flujo
- llaman al modelo correspondiente
- renderizan vistas
- realizan redirecciones

Los controladores NO deben contener consultas SQL ni lógica de Prisma.

---

## models/

Los modelos contienen la lógica de acceso a datos.

Toda interacción con Prisma debe realizarse desde esta capa.

Los modelos NO deben renderizar vistas.

---

## routes/

Las rutas únicamente:

- reciben la petición
- ejecutan middlewares
- llaman al controlador correspondiente

Las rutas NO deben contener lógica de negocio.

---

## middleware/

Contiene middleware como:

- autenticación
- autorización
- manejo de sesiones
- protección de rutas

---

## schemas/

Contiene exclusivamente esquemas de validación Zod.

Ejemplo:

```
user.schema.ts

game.schema.ts

auth.schema.ts
```

---

## prisma/

Contiene:

- schema.prisma
- migrations
- seed.ts

---

## views/

Las vistas están organizadas por módulos.

Ejemplo:

```
views/

auth/

users/

games/

layouts/

partials/
```

---

## public/

Archivos estáticos.

```
css/

js/

images/
```

---

# Convenciones de código

## TypeScript

Siempre utilizar tipado.

Evitar el uso de:

```
any
```

Siempre que sea posible utilizar interfaces o tipos.

---

## Async

Toda operación de base de datos debe utilizar:

```
async/await
```

Evitar callbacks.

---

## Nombres

Variables

```
camelCase
```

Clases

```
PascalCase
```

Archivos

```
user.controller.ts

user.model.ts

user.routes.ts

user.schema.ts
```

---

## Funciones

Las funciones deben ser pequeñas y con una única responsabilidad.

Evitar funciones extremadamente largas.

---

# Validaciones

Toda información proveniente del usuario debe validarse mediante Zod antes de ser procesada.

Nunca confiar en:

- req.body
- req.params
- req.query

Utilizar:

```
safeParse()
```

cuando corresponda.

---

# Seguridad

Las contraseñas nunca deben almacenarse en texto plano.

Siempre utilizar:

- bcryptjs

con hash + salt.

---

# Base de datos

La aplicación utiliza Prisma ORM.

No escribir SQL manual salvo que sea absolutamente necesario.

Preferir siempre Prisma Client.

---

# Soft Delete

Los registros no deben eliminarse físicamente.

Utilizar Soft Delete mediante un campo como:

```
deletedAt DateTime?
```

Los registros eliminados no deben aparecer en consultas normales.

---

# Git

Nunca trabajar directamente sobre:

```
main
```

Las funcionalidades deben desarrollarse mediante ramas.

Ejemplos:

```
feat/login

feat/register

feat/users

feat/games

feat/auth

fix/login

refactor/models
```

Los commits deben ser pequeños y descriptivos.

---

# Trabajo colaborativo

Evitar modificar simultáneamente los mismos archivos.

Siempre que sea posible dividir el trabajo por módulos.

Ejemplo:

Desarrollador A

- Usuarios
- Autenticación

Desarrollador B

- Juegos
- Base de datos

---

# Prisma

Evitar conflictos en:

```
schema.prisma
```

Las modificaciones estructurales de la base de datos deben coordinarse entre ambos desarrolladores antes de generar nuevas migraciones.

---

# Estilo de desarrollo

Priorizar:

- código simple
- código legible
- mantenibilidad
- tipado fuerte
- separación de responsabilidades

Evitar soluciones excesivamente complejas cuando exista una alternativa más sencilla.

---

# Qué deben hacer los agentes

Siempre que generen código deben:

- respetar la arquitectura MVC
- utilizar TypeScript moderno
- utilizar async/await
- utilizar Prisma
- validar entradas con Zod
- utilizar bcrypt para contraseñas
- seguir la estructura de carpetas del proyecto
- mantener consistencia con el resto del código
- reutilizar código antes de duplicarlo
- escribir código limpio y fácil de mantener

---

# Qué NO deben hacer

No deben:

- usar `any` innecesariamente
- escribir consultas SQL manuales
- acceder a Prisma desde las rutas
- colocar lógica de negocio en las vistas
- duplicar lógica entre controladores
- eliminar registros físicamente (hard delete)
- generar código que rompa la arquitectura MVC

---

# Objetivo final

Construir una aplicación consistente, mantenible y fácil de extender, siguiendo buenas prácticas de desarrollo web moderno con Express, TypeScript y Prisma.
