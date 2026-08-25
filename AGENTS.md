# Contexto del Proyecto: Gym App (Backend)

Este archivo es la fuente de verdad para el agente de IA. Define las reglas arquitectónicas, técnicas y de comunicación que deben seguirse estrictamente.

## 🎯 Objetivo del Proyecto

Backend para la gestión de gimnasios y planes de entrenamiento. La funcionalidad principal es permitir que los usuarios cambien de coaches y sedes sin perder su progreso, manteniendo un historial íntegro y consistente.

## 🛠️ Stack Tecnológico

- **Runtime:** Node.js v20+ (Alpine en Docker).
- **Lenguaje:** TypeScript (Modo estricto).
- **Gestor de Paquetes:** pnpm.
- **ORM:** Prisma (Salida del cliente: `src/generated`).
- **Base de Datos:** PostgreSQL.
- **Calidad de Código:** ESLint + Prettier.

## 🏗️ Arquitectura (Módulos + DDD + Hexagonal)

El proyecto utiliza **Screaming Architecture**. Cada módulo dentro de `src/modules/` es un contexto autónomo que encapsula su propia lógica de negocio.

### Estructura de cada Módulo:

Cada módulo debe contener las siguientes capas:

1. **domain/**: Entidades, Objetos de Valor (Value Objects), Agregados, Eventos e Interfaces de Repositorios (Driven Ports).
2. **application/**: Casos de uso (orquestación de la lógica).
3. **infrastructure/**: Persistencia (Prisma), HTTP (Express/Fastify) y Mappers.

## 📏 Reglas de Desarrollo

- **Política de Idioma:** TODO el código (clases, funciones, variables) así como los nombres de archivos y carpetas deben escribirse estrictamente en **Inglés**; los comentarios y la documentación interna deben estar en **Español**.
- **Mapeo de Conceptos:** Tomar de ejemplo a la hora de mapear conceptos (ESTO SIRVE DE EJEMPLO PARA MAPEAR LOS CONCEPTOS, NO QUIERE NI TAMPOCO DEFINE LA CANTIDAD DE MODULOS A CREAR)
  - Usuario -> `User` | Profesor -> `Coach` | Gimnasio -> `Gym` | Sede -> `Branch` | Plan -> `WorkoutPlan`
- **Regla de Dependencias:** Las dependencias siempre apuntan hacia adentro. Infrastructure -> Application -> Domain.
- **Desacoplamiento de Persistencia:** Las entidades de dominio son independientes de los modelos de Prisma. Es OBLIGATORIO usar Mappers en la capa de infraestructura.
- **Prisma:** Ejecutar siempre `pnpm exec prisma generate` tras modificar el schema.
- **Commits:** Seguir el estándar de [Conventional Commits](https://www.conventionalcommits.org/).

## 💬 Comunicación y Toma de Decisiones (CRÍTICO)

- **Búsqueda Proactiva de Contexto:** El agente NO debe suponer contexto faltante. Si una instrucción es ambigua, el agente DEBE detenerse y repreguntar.
- **Resolución de Problemas:** Ante bloqueos técnicos o dilemas arquitectónicos, proponer alternativas y esperar la decisión del usuario.
- **Ambigüedad en Nomenclatura:** Si un concepto en español tiene múltiples traducciones válidas (ej. "Sede" como `Branch`, `Location` o `Venue`), el agente DEBE preguntar cuál prefiere el usuario para mantener la consistencia.
- **Confirmación:** Confirmar con el usuario antes de realizar cambios destructivos o refactorizaciones grandes.

## 📂 Estructura de Directorios

```text
src/
├── modules/
│   ├── users/
│   ├── gyms/
│   ├── coaches/
│   └── workouts/
├── shared/
└── main/
```
