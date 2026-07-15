import { copyFileSync, cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const output = join(root, "dist");
const files = ["index.html", "styles.css", "app.js", "manifest.webmanifest", "sw.js"];

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

for (const file of files) {
  const destination = join(output, file);
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(join(root, file), destination);
}

cpSync(join(root, "assets"), join(output, "assets"), { recursive: true });
cpSync(join(root, "src"), join(output, "src"), { recursive: true });
console.log("DuoBiblia web bundle creado en dist/");
