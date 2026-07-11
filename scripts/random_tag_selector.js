#!/usr/bin/env node
/**
 * Random Tag Selector for Mini-Game Generation
 *
 * Randomly selects tags from a CSV file and outputs them as "seeds" for game design.
 * Supports both data/tags/mechanism_tags.csv and data/tags/visual_tags.csv.
 *
 * Usage:
 *   node scripts/random_tag_selector.js [options]
 *
 * Options:
 *   --file <path>          CSV file to select from (default: data/tags/mechanism_tags.csv)
 *   -n, --count <number>   Number of tags to select (default: 3)
 *   -s, --seed <number>    Random seed (uses current time if omitted)
 *   -f, --format <type>    Output format: text, json, markdown (default: markdown)
 *   --avoid-obvious-pairs  Reject selections containing any pair listed in data/tags/obvious_pairs.json
 *   --obvious-pairs <path> JSON file defining obvious tag pairs (default: data/tags/obvious_pairs.json)
 *   --button-types         Output a seeded random button_types value (1-5) instead of tags
 *   -h, --help             Show help
 */

const fs = require("fs");
const path = require("path");

// Xorshift128 PRNG (for reproducibility)
class Xorshift128 {
  constructor(seed = Date.now()) {
    this.x = seed >>> 0;
    this.y = 362436069;
    this.z = 521288629;
    this.w = 88675123;
    for (let i = 0; i < 10; i++) this.next();
  }

  next() {
    const t = this.x ^ (this.x << 11);
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    this.w = (this.w ^ (this.w >>> 19) ^ (t ^ (t >>> 8))) >>> 0;
    return this.w / 0x100000000;
  }

  nextInt(min, max) {
    return Math.floor(min + this.next() * (max - min + 1));
  }

  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// Integer hash (lowbias32). Xorshift128 seeds its state from the raw seed
// word, so small or adjacent seeds produce correlated first draws; a single
// nextInt() call (the --button-types path) needs the seed diffused first.
function hashSeed(seed) {
  let h = seed >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x21f0aaad);
  h = Math.imul(h ^ (h >>> 15), 0x735a2d97);
  return (h ^ (h >>> 15)) >>> 0;
}

// CSV parse (handles quoted fields)
function parseCSV(content) {
  const lines = content.trim().split("\n");
  return lines.slice(1).map((line) => {
    const fields = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        fields.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    fields.push(current.trim());

    return {
      name: fields[0] || "",
      overview: fields[1] || "",
      description: fields[2] || "",
      keywords: fields[3] || "",
    };
  });
}

// Load tags from specified CSV file
function loadTags(filePath) {
  const resolved = path.isAbsolute(filePath)
    ? filePath
    : path.join(__dirname, "..", filePath);

  if (!fs.existsSync(resolved)) {
    console.error(`Error: file not found: ${resolved}`);
    process.exit(1);
  }

  const content = fs.readFileSync(resolved, "utf-8");
  return parseCSV(content);
}

// Select tags
function selectTags(tags, count, rng) {
  const shuffled = rng.shuffle(tags);
  return shuffled.slice(0, count);
}

function normalizePair(a, b) {
  return [a, b].sort().join("||");
}

function buildPairList(selectedTags) {
  const pairs = [];
  for (let i = 0; i < selectedTags.length; i++) {
    for (let j = i + 1; j < selectedTags.length; j++) {
      pairs.push({
        key: normalizePair(selectedTags[i].name, selectedTags[j].name),
        tags: [selectedTags[i].name, selectedTags[j].name],
      });
    }
  }
  return pairs;
}

function loadObviousPairs(filePath) {
  const resolved = path.isAbsolute(filePath)
    ? filePath
    : path.join(__dirname, "..", filePath);

  if (!fs.existsSync(resolved)) {
    console.error(`Error: obvious pairs file not found: ${resolved}`);
    process.exit(1);
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(resolved, "utf-8"));
  } catch (error) {
    console.error(`Error: failed to parse JSON from ${resolved}: ${error.message}`);
    process.exit(1);
  }

  if (!parsed || !Array.isArray(parsed.pairs)) {
    console.error("Error: obvious pairs JSON must contain a top-level 'pairs' array");
    process.exit(1);
  }

  const set = new Set();
  parsed.pairs.forEach((pair, index) => {
    if (!Array.isArray(pair) || pair.length !== 2) {
      console.error(
        `Error: pairs[${index}] must be a 2-item array of tag names`
      );
      process.exit(1);
    }
    set.add(normalizePair(pair[0], pair[1]));
  });

  return set;
}

function getObviousPairsIn(selectedTags, obviousPairs) {
  const allPairs = buildPairList(selectedTags);
  return allPairs.filter((pair) => obviousPairs.has(pair.key));
}

function selectTagsAvoidingObviousPairs(tags, count, rng, obviousPairs) {
  const maxAttempts = 200;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const selected = selectTags(tags, count, rng);
    if (getObviousPairsIn(selected, obviousPairs).length === 0) {
      return selected;
    }
  }

  console.error(
    "Error: Could not satisfy --avoid-obvious-pairs with current tag pool and obvious pair definitions."
  );
  process.exit(1);
}

// Extract category
function getCategory(name) {
  const parts = name.split("-");
  if (parts[0] === "on") {
    return parts.slice(0, 2).join("_");
  }
  return parts[0];
}

// Detect tag type from file name
function getTagType(filePath) {
  const basename = path.basename(filePath, ".csv");
  if (basename.includes("visual")) return "visual";
  if (basename.includes("mechanism")) return "mechanism";
  if (basename.includes("structure")) return "structure";
  return "unknown";
}

// Guide reference by tag type
function getGuideReference(tagType) {
  switch (tagType) {
    case "mechanism":
      return ".agents/skills/designing-mini-games/SKILL.md (Design Procedure) and references/mini-game-design-guide.md §5";
    case "visual":
      return ".agents/skills/directing-game-visuals/references/visual-design-guide.md §5";
    case "structure":
      return "AGENTS.md Phase 2 (Growth skeleton / game structure)";
    default:
      return "the relevant design guide";
  }
}

// Output formatting
function formatOutput(selectedTags, seed, format, tagType) {
  const guideRef = getGuideReference(tagType);
  const typeLabel =
    tagType === "visual"
      ? "Visual Tags"
      : tagType === "structure"
      ? "Structure Tags"
      : "Mechanism Tags";

  switch (format) {
    case "json":
      return JSON.stringify(
        {
          seed,
          type: tagType,
          tags: selectedTags.map((t) => ({
            name: t.name,
            category: getCategory(t.name),
            overview: t.overview,
            description: t.description,
            keywords: t.keywords,
          })),
        },
        null,
        2
      );

    case "text":
      return selectedTags
        .map((t) => `${t.name}: ${t.overview} - ${t.description}`)
        .join("\n");

    case "markdown":
    default:
      const lines = [
        `## Selected ${typeLabel}`,
        "",
        `**Seed**: ${seed}`,
        "",
        "| Tag | Category | Overview | Description |",
        "|:---|:---|:---|:---|",
      ];

      selectedTags.forEach((t) => {
        lines.push(
          `| \`${t.name}\` | ${getCategory(t.name)} | ${t.overview} | ${t.description} |`
        );
      });

      lines.push("");
      lines.push("### Keywords");
      lines.push("");
      selectedTags.forEach((t) => {
        lines.push(`- **${t.name}**: ${t.keywords}`);
      });

      lines.push("");
      lines.push("## Usage");
      lines.push("");
      lines.push("```");
      lines.push(
        "Use the above tags as inspiration starting points for game design,"
      );
      lines.push(`following the procedures in ${guideRef}.`);
      lines.push("Tags are stimuli, not constraints. Don't be afraid to deviate.");
      lines.push("```");

      return lines.join("\n");
  }
}

// Show help
function showHelp() {
  console.log(`
Random Tag Selector - Tag selection tool for mini-game generation

Usage:
  node scripts/random_tag_selector.js [options]

Options:
  --file <path>          CSV file to select from (default: data/tags/mechanism_tags.csv)
  -n, --count <number>   Number of tags to select (default: 3)
  -s, --seed <number>    Random seed (uses current time if omitted)
  -f, --format <type>    Output format: text, json, markdown (default: markdown)
  --avoid-obvious-pairs  Reject selections containing any pair listed in data/tags/obvious_pairs.json
  --obvious-pairs <path> JSON file defining obvious pairs (default: data/tags/obvious_pairs.json)
  --button-types         Output a seeded random button_types value (1-5) instead of tags
  -h, --help             Show this help

Examples:
  node scripts/random_tag_selector.js
  node scripts/random_tag_selector.js --file data/tags/visual_tags.csv -n 2
  node scripts/random_tag_selector.js --file data/tags/mechanism_tags.csv -n 3 -s 42
  node scripts/random_tag_selector.js --file data/tags/mechanism_tags.csv -n 3 --avoid-obvious-pairs
  node scripts/random_tag_selector.js --button-types -s 42
  node scripts/random_tag_selector.js -s 12345 -f json
`);
}

// Parse arguments
function parseArgs(args) {
  const options = {
    file: "data/tags/mechanism_tags.csv",
    count: 3,
    seed: Date.now(),
    format: "markdown",
    avoidObviousPairs: false,
    obviousPairsFile: "data/tags/obvious_pairs.json",
    buttonTypes: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "--file":
        options.file = args[++i];
        break;
      case "-n":
      case "--count":
        options.count = parseInt(args[++i], 10);
        break;
      case "-s":
      case "--seed":
        options.seed = parseInt(args[++i], 10);
        break;
      case "-f":
      case "--format":
        options.format = args[++i];
        break;
      case "--avoid-obvious-pairs":
        options.avoidObviousPairs = true;
        break;
      case "--obvious-pairs":
        options.obviousPairsFile = args[++i];
        break;
      case "--button-types":
        options.buttonTypes = true;
        break;
      case "-h":
      case "--help":
        showHelp();
        process.exit(0);
    }
  }

  return options;
}

// Main
function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.buttonTypes) {
    const rng = new Xorshift128(hashSeed(options.seed));
    console.log(`button_types: ${rng.nextInt(1, 5)} (seed: ${options.seed})`);
    return;
  }

  if (options.count < 1 || options.count > 10) {
    console.error("Error: count must be between 1 and 10");
    process.exit(1);
  }

  if (!["text", "json", "markdown"].includes(options.format)) {
    console.error("Error: format must be text, json, or markdown");
    process.exit(1);
  }

  const tags = loadTags(options.file);
  const tagType = getTagType(options.file);
  const rng = new Xorshift128(options.seed);
  let selected;

  if (options.avoidObviousPairs) {
    const obviousPairs = loadObviousPairs(options.obviousPairsFile);
    selected = selectTagsAvoidingObviousPairs(
      tags,
      options.count,
      rng,
      obviousPairs
    );
  } else {
    selected = selectTags(tags, options.count, rng);
  }

  console.log(formatOutput(selected, options.seed, options.format, tagType));
}

main();
