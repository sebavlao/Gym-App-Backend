// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Permite usar describe, it, expect sin importarlos en cada archivo
    globals: true,
    // Indica que el entorno de ejecución es Node.js
    environment: 'node',
    // Define dónde buscar los archivos de test
    include: ['**/*.{test,spec}.ts'],
    // Cobertura de código (opcional)
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
