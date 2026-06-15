const js = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/main.tsx', 'src/web/**/*.{ts,tsx}', 'src/domain/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },
  {
    ignores: [
      'android/**',
      'dist/**',
      'ios/**',
      'modules/**',
      'node_modules/**',
      'plugins/**',
      'src/application/**',
      'src/infrastructure/**',
      'src/ui/**',
      'App.tsx',
      'index.ts',
    ],
  },
);
