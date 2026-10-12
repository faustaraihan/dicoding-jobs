import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import globals from 'globals';

export default defineConfig([
    globalIgnores([
        'vendor/**',
        'node_modules/**',
        'storage/**',
        'bootstrap/cache/**',
        'public/**',
        '.agents/**',
        '.codex/**',
    ]),
    {
        files: ['**/*.{js,mjs,cjs}'],
        extends: [js.configs.recommended],
        languageOptions: { globals: globals.node },
    },
    {
        files: ['resources/js/**/*.js'],
        languageOptions: { globals: globals.browser },
    },
    prettier,
]);
