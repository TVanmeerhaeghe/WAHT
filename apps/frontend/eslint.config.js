import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";

export default [
  {
    ignores: ["node_modules/**", ".nuxt/**", ".output/**"],
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
    },
    plugins: { vue: pluginVue },
    rules: {},
  },
  {
    files: ["**/*.ts", "**/*.js"],
    rules: {},
  },
];
