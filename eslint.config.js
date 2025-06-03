// ESLint Flat Config (ESM)
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import flatPrettier from 'eslint-config-prettier/flat';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Ignore patterns
  {
    ignores: [
      'node_modules/',
      'dist/',
      'logs/',
      '*.log',
      'coverage/',
      '.env',
      '**/*.d.ts',
    ],
  },

  // Base JS rules
  js.configs.recommended,

  // TypeScript support
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
      globals: {
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      'no-console': 'off',
    },
  },

  // Prettier integration to disable conflicting ESLint rules
  flatPrettier,
];
