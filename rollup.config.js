import { defineConfig } from "rollup";
import ts from "rollup-plugin-typescript2";
export default defineConfig({
    input: "./src/three.ts",
    output: {
        format: "cjs",
        file: "./three.js",
    },
    plugins: [ts()],
});
