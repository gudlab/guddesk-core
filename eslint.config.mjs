import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  prettier,
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "react/jsx-key": "off",
      "react/no-unescaped-entities": "off",
      // eslint-plugin-react-hooks v7 (bundled with Next 16) adds compiler
      // rules that error on existing code. Keep next lint's previous bar.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/static-components": "off",
    },
  },
  {
    // The widget uses Preact signals; reading .value in deps is intentional
    // and exhaustive-deps cannot model it.
    files: ["packages/widget/**"],
    rules: { "react-hooks/exhaustive-deps": "off" },
  },
  globalIgnores([
    "packages/widget/dist/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".contentlayer/**",
    "node_modules/**",
  ]),
]);

export default eslintConfig;
