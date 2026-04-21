import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  // Usamos la configuración recomendada de TypeScript
  ...tseslint.configs.recommended,

  {
    // Definimos qué archivos queremos analizar
    files: ['src/**/*.ts'],
    rules: {
      // Aquí puedes añadir o quitar reglas a tu gusto
      '@typescript-eslint/no-explicit-any': 'warn', // Te avisa si usas "any"
      'no-console': 'off', // Permitimos consoles por ahora para debuggear
    },
  },

  // Desactiva las reglas de ESLint que choquen con Prettier
  eslintConfigPrettier,

  // Carpetas que el linter debe ignorar por completo
  {
    ignores: ['dist/', 'node_modules/', 'src/generated/'],
  },
];
