#!/usr/bin/env node

import fs from "fs";
import { argv } from "node:process";
import { collectionToHTML } from "./index.js";

// Parse and validate command-line arguments
if (argv.length < 3) {
  console.error(
    "Usage: node cli.js <input-file.json> [--output=output-file.html] [--lang=language] [--logo=logo.svg]"
  );
  console.error("Options:");
  console.error(
    "  --output=file.html    Output HTML file (default: api-doc.html)"
  );
  console.error(
    "  --lang=language       Language for documentation (default: en)"
  );
  console.error("  --logo=logo.svg       SVG logo file to embed (optional)");
  console.error("Available languages: en (English), fr (French)");
  process.exit(1);
}

// Extract arguments
const inputFile = argv[2];
let outputFile = "api-doc.html";
let language = "en";
let logoPath = null;

// Parse remaining arguments
for (let i = 3; i < argv.length; i++) {
  const arg = argv[i];
  if (arg.startsWith("--lang=")) {
    language = arg.split("=")[1];
  } else if (arg.startsWith("--output=")) {
    outputFile = arg.split("=")[1];
  } else if (arg.startsWith("--logo=")) {
    logoPath = arg.split("=")[1];
  } else {
    console.error(`Unknown argument: ${arg}`);
    console.error("Use --help for usage information");
    process.exit(1);
  }
}

// Validate language
const supportedLanguages = ["en", "fr"];
if (!supportedLanguages.includes(language)) {
  console.error(`Unsupported language: ${language}`);
  console.error(`Available languages: ${supportedLanguages.join(", ")}`);
  process.exit(1);
}

try {
  let logo = null;

  if (logoPath) {
    try {
      logo = fs.readFileSync(logoPath, "utf8");
      console.log(`Found logo file: ${logoPath}, embedding it in the HTML...`);
    } catch (error) {
      console.error(
        `Error: Could not read logo file '${logoPath}': ${error.message}`
      );
      process.exit(1);
    }
  }

  collectionToHTML(inputFile, {
    outputFile,
    language,
    logo,
  });
  console.log(
    `HTML generated successfully: ${outputFile} (language: ${language})`
  );
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
