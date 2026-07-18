import { config } from "dotenv";
config();

import { DemoGenerator } from "@/core/demo/DemoGenerator";
import { rajShamaniV1 } from "@/core/demo/scenarios/raj-shamani-v1";

async function main() {
  const scenarioArg = process.argv[2];

  let scenario = rajShamaniV1; // default

  if (scenarioArg) {
    if (scenarioArg === "raj-shamani-v1") {
      scenario = rajShamaniV1;
    } else {
      console.error(`Unknown scenario: ${scenarioArg}`);
      process.exit(1);
    }
  }

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
