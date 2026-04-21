# 🏋️ Gym App - Backend

Backend robusto para la gestión de gimnasios y planes de entrenamiento, diseñado para permitir a los usuarios transicionar fácilmente entre diferentes profesores y sedes.

## 🚀 Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/) (v20+)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Gestor de Paquetes:** [pnpm](https://pnpm.io/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Base de Datos:** PostgreSQL
- **Arquitectura:** Clean Architecture (en proceso)

## 🛠️ Requisitos Previos

Asegurate de tener instalado:

- **Node.js** (Versión LTS recomendada)
- **pnpm** (`npm install -g pnpm`)
- **Docker** (para levantar el proyecto en cualquier entorno)

## 📦 Instalación y Setup

1. **Clonar el repositorio:**

   ```bash
   git clone [https://github.com/sebavlao/Gym-App-Backend.git](https://github.com/sebavlao/Gym-App-Backend.git)
   cd gym-app-backend
   ```

2. **Instalar dependencias:**

   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno:**
   Copia el archivo de ejemplo y completalo con tus credenciales:

   ```bash
   cp .env.example .env
   ```

4. **Levantar la base de datos (Docker):**

   ```bash
   docker-compose up -d
   ```

5. **Generar el cliente de Prisma y ejecutar migraciones:**

   ```bash
   pnpm exec prisma migrate dev
   ```

6. **Iniciar en modo desarrollo:**
   ```bash
   pnpm run dev
   ```

## 🏗️ Estructura del Proyecto (Clean Architecture)

El proyecto sigue los principios de Clean Architecture para mantener el código desacoplado y testeable:

```text
src/
├── domain/         # Entidades de negocio y reglas puras
├── application/    # Casos de uso (Lógica de la aplicación)
├── infrastructure/ # Implementaciones externas (DB, Repositorios, Express)
└── main/           # Composición y arranque del servidor
```

## 📜 Scripts Disponibles

| Comando             | Descripción                                              |
| :------------------ | :------------------------------------------------------- |
| `pnpm run dev`      | Inicia el servidor con recarga automática (tsx/nodemon). |
| `pnpm run build`    | Compila el código TypeScript a JavaScript en `/dist`.    |
| `pnpm run start`    | Ejecuta la versión compilada en producción.              |
| `pnpm run studio`   | Abre la interfaz visual para explorar la base de datos.  |
| `pnpm run lint`     | Ejecuta el linter para verificar el código.              |
| `pnpm run lint:fix` | Ejecuta el linter y corrige los errores.                 |
| `pnpm run format`   | Ejecuta el formateador para verificar el código.         |
