import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/dtos/index.ts",
    "src/exceptions/index.ts",
    "src/constants/index.ts",
  ],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  outDir: "dist",
});