import { build as esbuild } from "esbuild";
import { readFile } from "fs/promises";
import { rm } from "fs/promises";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "openai",
  "pg",
  "zod",
  "zod-validation-error",
];

async function buildServer() {
  await rm("../dist", { recursive: true, force: true });
  
  console.log("Building server...");
  
  const serverPkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(serverPkg.dependencies || {}),
    ...Object.keys(serverPkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "../dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });
  
  console.log("Server build complete!");
}

buildServer().catch((err) => {
  console.error(err);
  process.exit(1);
});
