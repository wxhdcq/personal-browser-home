import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [
      ".next/**",
      ".next-extension/**",
      "out/**",
      "out-extension/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
      "iphone_drop/**",
    ],
  },
];

export default eslintConfig;
