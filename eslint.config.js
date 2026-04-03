import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.nuxt/**",
      "**/.output/**",
      "**/coverage/**",
    ],
  },

  // Backend et worker
  {
    files: [
      "apps/backend/src/**/*.ts",
      "apps/worker/src/**/*.ts",
      "packages/shared/src/**/*.ts",
    ],
    extends: [...tseslint.configs.recommended],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },

  // Tests — règles plus souples car les mocks utilisent any
  {
    files: ["**/*.test.ts", "**/test/**/*.ts"],
    extends: [...tseslint.configs.recommended],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },

  // Frontend Vue
  {
    files: ["apps/frontend/**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    plugins: { vue: pluginVue },
    rules: {
      "vue/html-self-closing": [
        "warn",
        {
          html: {
            void: "never",
            normal: "always",
            component: "always",
          },
        },
      ],
    },
  },

  // Frontend TypeScript
  {
    files: ["apps/frontend/**/*.ts"],
    extends: [...tseslint.configs.recommended],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
);
