import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

// On Railway this points at the mounted volume (e.g. /data). Locally it falls
// back to a folder inside the project so uploads work out of the box.
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), ".uploads");

export async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export function uploadDir() {
  return UPLOAD_DIR;
}

export async function saveUploadedFile(orgId: string, fileName: string, buffer: Buffer) {
  await ensureUploadDir();
  const orgFolder = path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, orgId);
  await fs.mkdir(orgFolder, { recursive: true });
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniquePrefix = crypto.randomBytes(8).toString("hex");
  const storedName = `${uniquePrefix}-${safeName}`;
  const fullPath = path.join(orgFolder, storedName);
  await fs.writeFile(fullPath, buffer);
  return { filePath: path.join(orgId, storedName), fullPath };
}

export async function readUploadedFile(relativePath: string) {
  const fullPath = path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, relativePath);
  return fs.readFile(/*turbopackIgnore: true*/ fullPath);
}
