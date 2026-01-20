const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.ejs')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles(viewsDir);
let formsFixed = 0;
let fetchFixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  content = content.replace(/<form\s+([^>]*?)>/gi, (match, attributes) => {
    return match + '\n<input type="hidden" name="_csrf" value="<%= csrfToken %>">';
  });

  content = content.replace(/(<input type="hidden" name="_csrf" value="<%= csrfToken %>">\s*){2,}/g, '<input type="hidden" name="_csrf" value="<%= csrfToken %>">');

  content = content.replace(/headers:\s*\{\s*['"]Content-Type['"]\s*:\s*['"]application\/json['"]\s*\}/g, 
    "headers: {'Content-Type': 'application/json', 'CSRF-Token': document.getElementById('csrfToken').value}");
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
    if (content.includes('<form') && !originalContent.includes('_csrf')) formsFixed++;
    if (content.match(/fetch/i) && content.includes('CSRF-Token')) fetchFixed++;
  }
});

console.log(`Total Forms Fixed: ${formsFixed} (approx)`);
console.log(`Total Fetches Fixed: ${fetchFixed} (approx)`);
