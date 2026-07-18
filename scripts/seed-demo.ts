import { config } from "dotenv";
config();

import { DemoGenerator } from "@/core/demo/DemoGenerator";
import { rajShamaniV1 } from "@/core/demo/scenarios/raj-shamani-v1";

async function main() {
  const baseScenario = rajShamaniV1;
  let scenarioArg = undefined;
  let overrideUserId = undefined;

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith("--user-id=") || arg.startsWith("--clerk-id=")) {
      overrideUserId = arg.split("=")[1];
    } else if (arg === "--user-id" || arg === "--clerk-id") {
      overrideUserId = process.argv[++i];
    } else if (!arg.startsWith("--")) {
      scenarioArg = arg;
    }
  }

  if (scenarioArg && scenarioArg !== "raj-shamani-v1") {
    console.error(`Unknown scenario: ${scenarioArg}`);
    process.exit(1);
  }

  const scenario = overrideUserId
    ? { ...baseScenario, user: { ...baseScenario.user, id: overrideUserId } }
    : baseScenario;

  try {
    const generator = new DemoGenerator(scenario);
    await generator.run();
    console.log("Demo seed complete.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed demo data:", error);
    process.exit(1);
  }
}

main();
