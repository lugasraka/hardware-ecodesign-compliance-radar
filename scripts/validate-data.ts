import { validateData } from "../src/data/validate";

const result = validateData();

for (const warning of result.warnings) {
  console.warn(`warning: ${warning}`);
}

if (result.errors.length > 0) {
  console.error(`Data validation failed with ${result.errors.length} error(s):`);
  for (const error of result.errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.log(
  `Data validation passed: ${result.stats.instruments} instruments, ${result.stats.clauses} clauses, ${result.stats.products} products, ${result.stats.assessments} assessments, ${result.stats.risks} risks, ${result.stats.decisions} decisions.`,
);
