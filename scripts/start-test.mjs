import { spawn } from "node:child_process";
const child = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      ALLOW_FILE_STORAGE: "true",
      ADMIN_TOKEN: "local-test-token-only",
    },
  },
);
child.on("exit", (code) => process.exit(code || 0));
