const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'app');
const prismaDir = path.join(__dirname, 'prisma');
const middlewareFile = path.join(__dirname, 'middleware.ts');

const replaceRules = [
  // First pass: donor -> receiver
  { regex: /donor/g, replacement: 'receiver' },
  { regex: /Donor/g, replacement: 'Receiver' },
  { regex: /DONOR/g, replacement: 'RECEIVER' },
  // Second pass: volunteer -> donor
  { regex: /volunteer/g, replacement: 'donor' },
  { regex: /Volunteer/g, replacement: 'Donor' },
  { regex: /VOLUNTEER/g, replacement: 'DONOR' }
];

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  // Apply pass 1 (donor -> receiver)
  for (let i = 0; i < 3; i++) {
    newContent = newContent.replace(replaceRules[i].regex, replaceRules[i].replacement);
  }
  // Apply pass 2 (volunteer -> donor)
  for (let i = 3; i < 6; i++) {
    newContent = newContent.replace(replaceRules[i].regex, replaceRules[i].replacement);
  }

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.prisma')) {
      processFile(fullPath);
    }
  }
}

console.log("Renaming files and directories...");

// 1. Rename directories safely
const pathsToRename = [
  { old: 'app/donor', new: 'app/receiver' },
  { old: 'app/api/donor', new: 'app/api/receiver' },
  { old: 'app/volunteer', new: 'app/donor' },
  { old: 'app/api/volunteer', new: 'app/api/donor' }
];

for (const p of pathsToRename) {
  const oldPath = path.join(__dirname, p.old);
  const newPath = path.join(__dirname, p.new);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed directory: ${p.old} -> ${p.new}`);
  }
}

console.log("Updating file contents...");
// 2. Process contents
walkDir(targetDir);
processFile(path.join(prismaDir, 'schema.prisma'));
processFile(middlewareFile);

console.log("Refactoring complete.");
