import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.nuxt/**',
      '**/.output/**'
    ]
  },
  {
    files: ['apps/backend/src/**/*.ts', 'apps/worker/src/**/*.ts'],
    languageOptions: { parser: tsParser },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    }
  },
  {
    files: ['apps/frontend/**/*.vue'],
    languageOptions: { parser: vueParser },
    plugins: { vue: pluginVue },
    rules: {}
  },
  {
    files: ['apps/frontend/**/*.ts'],
    languageOptions: { parser: tsParser },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {}
  }
]
