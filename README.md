# Inventario Tecnológico
Matias Aedo
## Descripción
Sistema web para registrar y administrar los equipos tecnológicos de una organización.

## Tecnologías
- Vue.js
- NestJS
- MySQL
- TypeORM

## Funciones
- Registrar, consultar, editar y eliminar equipos.
- Buscar por nombre o código.
- Filtrar por tipo, ubicación y estado.
- Ver la cantidad de equipos según su estado.

## Instalación

1. Crear una base de datos llamada `inventario_tecnologico` en MySQL.
2. Entrar a la carpeta `backend` y ejecutar `npm install`.
3. Configurar el archivo `.env` usando como referencia `.env.example`.
4. Iniciar el backend con `npm run start:dev`.
5. Entrar a la carpeta `frontend`, ejecutar `npm install` y luego `npm run dev`.

Se puede utilizar XAMPP para iniciar MySQL.

## Endpoints principales

- `GET /equipos`: listar equipos.
- `GET /equipos/:id`: consultar un equipo.
- `POST /equipos`: registrar un equipo.
- `PATCH /equipos/:id`: editar un equipo.
- `DELETE /equipos/:id`: eliminar un equipo.

## Uso de inteligencia artificial

Se utilizó ChatGPT para resolver dudas, revisar errores, apoyar el desarrollo del frontend y backend, y preparar la documentación. Durante el desarrollo se probaron las funciones del sistema, como registrar, consultar, editar y eliminar equipos, además de utilizar los filtros. Los cambios se fueron revisando y ajustando según los resultados obtenidos.

## Pruebas realizadas

- Registro de equipos nuevos.
- Consulta y edición de equipos.
- Eliminación de equipos con confirmación.
- Búsqueda y filtros por nombre, código, tipo, ubicación y estado.
- Comprobación de los contadores por estado.