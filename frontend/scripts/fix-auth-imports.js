#!/usr/bin/env node

/**
 * This script helps migrate Next.js API routes from NextAuth to Auth.js
 * It scans for files using the old imports and helps replace them
 *
 * Usage: node fix-auth-imports.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directories to scan
const DIRECTORIES = ['src/app/api'];

// Patterns to find
const PATTERNS = [
  "import { getServerSession } from 'next-auth';",
  "import { AuthOptions } from '@/lib/auth-options';",
  'await getServerSession(AuthOptions)',
];

// Replacements
const REPLACEMENTS = {
  "import { getServerSession } from 'next-auth';": "import { auth } from '../../../auth';",
  "import { AuthOptions } from '@/lib/auth-options';": '// AuthOptions import removed',
  'await getServerSession(AuthOptions)': 'await auth()',
  'const session = await getServerSession(AuthOptions)': 'const session = await auth()',
  '!session?.user?.isAdmin': '!session?.user?.isAdmin',
};

// Get the project root
const projectRoot = path.resolve(__dirname, '..');

// Function to find files with patterns
function findFilesWithPattern(directory, pattern) {
  try {
    const cmd = `grep -l "${pattern}" ${directory}/**/*.ts 2>/dev/null || true`;
    const result = execSync(cmd, { cwd: projectRoot, encoding: 'utf8' }).trim();
    return result ? result.split('\n') : [];
  } catch (error) {
    console.error(`Error searching for pattern: ${error.message}`);
    return [];
  }
}

// Function to replace text in a file
function replaceInFile(filePath, pattern, replacement) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(
      new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      replacement
    );
    fs.writeFileSync(filePath, content);
  } catch (error) {
    console.error(`Error replacing in ${filePath}: ${error.message}`);
  }
}

// Main function
function main() {
  console.log('Scanning for files to update...');

  // Find all files with any pattern
  const filesToUpdate = new Set();

  DIRECTORIES.forEach((directory) => {
    PATTERNS.forEach((pattern) => {
      const files = findFilesWithPattern(directory, pattern);
      files.forEach((file) => filesToUpdate.add(file));
    });
  });

  console.log(`Found ${filesToUpdate.size} files to update.`);

  // Update each file
  filesToUpdate.forEach((file) => {
    if (!file) return;

    console.log(`\nUpdating ${file}...`);
    console.log('-----------------------------------');

    // Read current content
    const content = fs.readFileSync(file, 'utf8');

    // Apply all replacements
    let newContent = content;
    Object.entries(REPLACEMENTS).forEach(([pattern, replacement]) => {
      newContent = newContent.replace(
        new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        replacement
      );
    });

    // Write new content if changed
    if (newContent !== content) {
      fs.writeFileSync(file, newContent);
      console.log(`Updated ${file}`);
    } else {
      console.log(`No changes needed in ${file}`);
    }
  });

  console.log('\nDone!');
  console.log('Please review the changes and make any additional adjustments as needed.');
  console.log(
    'Some files may require manual intervention, especially those with complex auth logic.'
  );
}

// Run the script
main();
