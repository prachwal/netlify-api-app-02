#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function mergeFiles(filePaths, outputPath) {
  let mergedContent = '';

  filePaths.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(process.cwd(), filePath);

      mergedContent += `################## ${relativePath} ####################\n`;
      mergedContent += content;
      mergedContent += `\n################## KONIEC ${relativePath} ###############\n\n`;
    } catch (error) {
      console.error(`Error reading file ${filePath}: ${error.message}`);
      process.exit(1);
    }
  });

  if (outputPath) {
    fs.writeFileSync(outputPath, mergedContent);
    console.log(`Merged content written to ${outputPath}`);
  } else {
    console.log(mergedContent);
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('Usage: node merge-files.js <file1> [file2 ...] [outputFile]');
    console.error('Example: node merge-files.js file1.txt file2.txt merged.txt');
    process.exit(1);
  }

  const outputPath = args[args.length - 1].endsWith('.txt') ||
                     args[args.length - 1].endsWith('.js') ||
                     args[args.length - 1].endsWith('.ts') ||
                     args[args.length - 1].endsWith('.md') ? args.pop() : null;

  const filePaths = args;

  mergeFiles(filePaths, outputPath);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
