import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const backend = fileURLToPath(new URL("../../../backend/", import.meta.url));
const directory = mkdtempSync(join(tmpdir(), "dicoding-playwright-"));
const database = join(directory, "database.sqlite");
writeFileSync(database, "");
const php = process.env.PLAYWRIGHT_PHP_BINARY || "php";
const env = {
  ...process.env,
  APP_ENV: "testing",
  APP_KEY: `base64:${randomBytes(32).toString("base64")}`,
  APP_URL: "http://127.0.0.1:8010",
  APP_TIMEZONE: "UTC",
  APP_CONFIG_CACHE: join(directory, "config.php"),
  DB_CONNECTION: "sqlite",
  DB_DATABASE: database,
  DB_URL: "",
  CACHE_STORE: "array",
  SESSION_DRIVER: "array",
  QUEUE_CONNECTION: "sync",
  MAIL_MAILER: "array",
};

for (const args of [
  ["artisan", "migrate", "--force", "--no-interaction"],
  ["artisan", "db:seed", "--class=LocationSeeder", "--force", "--no-interaction"],
]) {
  const result = spawnSync(php, args, { cwd: backend, env, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const server = spawn(php, ["artisan", "serve", "--host=127.0.0.1", "--port=8010", "--no-reload"], {
  cwd: backend,
  env,
  stdio: "inherit",
});
server.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
server.on("exit", (code) => process.exit(code ?? 1));
process.on("SIGTERM", () => server.kill());
process.on("SIGINT", () => server.kill());
