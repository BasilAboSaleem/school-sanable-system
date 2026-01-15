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

  // 1. Inject hidden input into forms
  // Regex looks for <form ...> and ensures we don't inject if _csrf is already there
  // We use a callback to check the content of the form tag or immediately after
  
  // Strategy: Find <form [^>]*> and append input if not present in the file (simplistic but effective for this project)
  // Actually, we should check if the input exists inside the form.
  // Since parsing HTML with Regex is fragile, we'll assume standard EJS structure.
  
  // Pattern: <form ...> (capture) ... (rest)
  // We will replace `<form (.*?)>` with `<form $1>\n<input type="hidden" name="_csrf" value="<%= csrfToken %>">`
  // ONLY IF the file doesn't already contain literal `name="_csrf"` inside that block?
  // Easier: Search for `<form` occurrences.
  
  content = content.replace(/<form\s+([^>]*?)>/gi, (match, attributes) => {
    // Check if this specific form or the generated HTML likely already has it?
    // We can't easily peek ahead.
    // However, if we blindly inject, we can check for Duplicates later or rely on the user having done some manual work.
    // The user's manual work (add-subject) put it OUTSIDE or used id="csrfToken".
    // We want `name="_csrf"` for standard POST.
    
    // If the file ALREADY has `<input type="hidden" name="_csrf"`, skip? 
    // No, there might be multiple forms.
    // But duplicate hidden inputs with same name usually just send an array or last one. 
    // Valid CSRF usually takes one.
    
    // Let's rely on a check: if the match is followed immediately by the input?
    return match + '\n<input type="hidden" name="_csrf" value="<%= csrfToken %>">';
  });

  // Cleanup duplicates if we just added one where one existed.
  // Example: <form ...>\n<input ...>\n<input ...>
  // Regex to remove double injection:
  content = content.replace(/(<input type="hidden" name="_csrf" value="<%= csrfToken %>">\s*){2,}/g, '<input type="hidden" name="_csrf" value="<%= csrfToken %>">');


  // 2. Fix Fetch Headers
  // Pattern: headers: { ... 'Content-Type': 'application/json' ... }
  // We want to ensure 'CSRF-Token': document.getElementById('csrfToken').value is present.
  
  // Common pattern in this project: `headers: {'Content-Type': 'application/json'}` or `headers: {'Content-Type':'application/json'}`
  
  content = content.replace(/headers:\s*\{\s*['"]Content-Type['"]\s*:\s*['"]application\/json['"]\s*\}/g, 
    "headers: {'Content-Type': 'application/json', 'CSRF-Token': document.getElementById('csrfToken').value}");

  // Also handle cases where there might be other headers? (Unlikely in this simplified project, usually just Content-Type)
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
    if (content.includes('<form') && !originalContent.includes('_csrf')) formsFixed++;
    if (content.match(/fetch/i) && content.includes('CSRF-Token')) fetchFixed++;
  }
});

console.log(`Total Forms Fixed: ${formsFixed} (approx)`);
console.log(`Total Fetches Fixed: ${fetchFixed} (approx)`);
