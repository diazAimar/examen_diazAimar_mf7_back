# Examen Poder Judicial - Diaz Aimar Federico

# Backend

## Instructivo instalación/ejecución del exámen:

### Pre-requisitos

- Git
- Node y npm/pnpm

### Clonar repositorio

- Clonar el repositorio https://github.com/diazAimar/examen_diazAimar_mf7_back
- En caso de no estarlo, situarse en la rama main (`git checkout main`)
- Instalar las dependencias necesarias con el comando `npm install` o `pnpm install`
- Ejecutar las migraciones y seeds para cargar la aplicación con informacion inicial con el comando `npm run db:setup` o `pnpm run db:setup`
- Por ultimo, ejecutar el comando `npm run dev` o `pnpm run dev` para inicializar el proyecto.
- La API ya se encuentra disponible en http://localhost:8000/api

### Tecnologías principales utilizadas

#### Servidor

- [joi](https://joi.dev/) para la validación del body de las peticiones
- [knex](https://knexjs.org/) para la creación de las migraciones, los seeders, y las consultas a la base de datos
- [sqlite3](https://sqlite.org/) como base de datos
