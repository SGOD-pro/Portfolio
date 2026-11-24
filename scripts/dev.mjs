import { networkInterfaces } from "os";
import { execSync, spawn } from "child_process";

// Discover all non-internal IPv4 LAN addresses
const addresses = [];

try {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        addresses.push({ iface: name, ip: net.address });
      }
    }
  }
} catch {}

if (addresses.length === 0) {
  try {
    const out = execSync("hostname -I 2>/dev/null", { encoding: "utf8" }).trim();
    out.split(/\s+/).forEach((ip) => {
      if (ip && !ip.startsWith("127.") && !ip.includes(":")) {
        addresses.push({ iface: "lan", ip });
      }
    });
  } catch {}
}

console.log("\n\x1b[36m=================================================================\x1b[0m");
console.log("\x1b[1m\x1b[32m  Next.js Local Network Sharing (Port 3000)\x1b[0m");
console.log("\x1b[36m=================================================================\x1b[0m");
console.log("  Local URL:    \x1b[34mhttp://localhost:3000\x1b[0m");

if (addresses.length > 0) {
  console.log("\n  \x1b[1mOpen this URL on your other PC or phone (same Wi-Fi/LAN):\x1b[0m");
  addresses.forEach(({ iface, ip }) => {
    console.log(`  ➜  \x1b[1m\x1b[32mhttp://${ip}:3000\x1b[0m  (${iface})`);
  });
} else {
  console.log("\n  ➜ Network:  \x1b[33mhttp://<your-lan-ip>:3000\x1b[0m");
  console.log("    (Run `hostname -I` in another terminal to see your IP address)");
}

console.log("\n  \x1b[33m⚠ Note: Do NOT type '0.0.0.0:3000' in another PC's browser.\x1b[0m");
console.log("    0.0.0.0 is the server listening mask, not a reachable web address.");
console.log("    Use the http://<ip>:3000 address shown above!");
console.log("\x1b[36m=================================================================\x1b[0m\n");

// Launch Next.js dev server listening on 0.0.0.0:3000
const child = spawn("next", ["dev", "-H", "0.0.0.0", "-p", "3000"], {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
