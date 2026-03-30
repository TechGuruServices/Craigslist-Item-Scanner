import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// esbuild compiles to CJS so __dirname is available at runtime in production.
// In ESM dev context (tsx), we derive it from import.meta.url.
function getDirname(): string {
  try {
    // This works in CJS (esbuild output) — TypeScript sees it as 'any' in ESM,
    // so we use a runtime eval trick to avoid the block-scope issue.
    // eslint-disable-next-line no-new-func
    const cjsDirname = new Function("return typeof __dirname !== 'undefined' ? __dirname : null")();
    if (cjsDirname) return cjsDirname as string;
  } catch {
    // ignore
  }
  return path.dirname(fileURLToPath(import.meta.url));
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(getDirname(), "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // Fall through to index.html for client-side routing
  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}