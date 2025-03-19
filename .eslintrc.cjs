module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  plugins: ["react-hooks", "@typescript-eslint", "@tanstack/query"],
  extends: ["eslint:recommended", "plugin:@tanstack/query/recommended", "react-app", "preact"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    "max-lines": 0,
    // OFF
    "no-unused-vars": "off",
    "no-throw-literal": "off",
    "react/jsx-props-no-spreading": "off",
    "newline-before-return": "off",
    "import/order": "off",
    "one-var": "off",
    "prefer-arrow-callback": "off",
    "no-magic-numbers": "off",
    "no-shadow": "off",
    "jest/no-deprecated-functions": "off",
    // WARN RULES
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    // ERROR RULES
    "@typescript-eslint/no-shadow": "error",
    "react-hooks/rules-of-hooks": "error",
    "no-var": "error",
    "no-param-reassign": ["error", { props: true, ignorePropertyModificationsFor: ["draftState"] }],
    "@tanstack/query/exhaustive-deps": "error",
    "@tanstack/query/stable-query-client": "error",
  },
};
