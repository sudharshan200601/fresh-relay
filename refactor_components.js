const fs = require('fs');
const path = require('path');

const targetDirs = ['components', 'context'].map(dir => path.join(__dirname, dir));

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
  
  for (let i = 0; i < 3; i++) {
    newContent = newContent.replace(replaceRules[i].regex, replaceRules[i].replacement);
  }
  for (let i = 3; i < 6; i++) {
    newContent = newContent.replace(replaceRules[i].regex, replaceRules[i].replacement);
  }

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

targetDirs.forEach(walkDir);
console.log("Refactoring components and contexts complete.");
