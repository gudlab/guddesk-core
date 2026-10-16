import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      // Match the previous .eslintrc.json. eslint-plugin-react-hooks v7
      // (bundled with Next 16) turns React Compiler rules into errors;
      // those were not part of the old next lint run.
      "@next/next/no-html-link-for-pages": "off",
      "react/jsx-key": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/static-components": "off",
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
    },
  },
  {
    // The widget uses Preact signals; reading .value in deps is intentional
    // and exhaustive-deps cannot model it.
    files: ["packages/widget/**"],
    rules: { "react-hooks/exhaustive-deps": "off" },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "packages/widget/dist/**",
    ".contentlayer/**",
    "node_modules/**",
    "next-env.d.ts",
  ]),
]);
