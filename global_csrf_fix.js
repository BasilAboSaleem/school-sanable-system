const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');
const csrfTokenInput = '<input type="hidden" name="_csrf" value="<%= csrfToken %>">';

function walk(dir, callback) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filepath = path.join(dir, file);
        const stats = fs.statSync(filepath);
        if (stats.isDirectory()) {
            walk(filepath, callback);
        } else if (stats.isFile() && file.endsWith('.ejs')) {
            callback(filepath);
        }
    });
}

console.log("Starting Global CSRF Injection...");

walk(viewsDir, (filepath) => {
    let content = fs.readFileSync(filepath, 'utf8');
    let modified = false;

    // Regex to find <form> tags that DO NOT already contain _csrf
    // We look for <form ... > then NOT _csrf until </form>
    // This is tricky with regex. Better approach:
    // Find all <form ...> start tags.
    // Check if the input is immediately after, or if the file already has it?
    // Let's go simple: replacing <form ...> with <form ...>\n<input...> 
    // BUT only if the file doesn't seem to have the token input near that form? 
    // A simpler heuristic: Replace all forms, then deduplicate if we messed up? 
    // No, duplicate inputs with same name/value are usually fine in HTML (last wins), 
    // but cleaner to avoid.
    
    // Strategy: Replace <form ...> with <form ...>\n<!--CSRF_INJECT-->
    // Then replace <!--CSRF_INJECT--> with the input ONLY if the input isn't already there?
    // Actually, the previous manual fixes might conflict.
    
    // Let's try to be smart matching specific forms in our known structure.
    // Most forms here are standard.
    
    // New Strategy:
    // 1. Read file.
    // 2. Find all occurrences of <form ...>
    // 3. Insert the token immediately after IF it's not already there.
    
    // This regex matches <form attributes...>
    const formRegex = /<form([^>]*)>/gi;
    
    content = content.replace(formRegex, (match) => {
        // Look ahead in the original content to see if the input exists? 
        // We can't easily look ahead in a replace callback without index.
        // Let's blindly inject a MARKER first.
        return match + '___CSRF_MARKER___';
    });
    
    // Now verify marker
    if (content.includes('___CSRF_MARKER___')) {
        // If the file already has name="_csrf", we might be double injecting.
        // But a file might have 2 forms, one protected, one not.
        
        // Let's replace markers.
        // If the immediate next non-whitespace characters are <input type="hidden" name="_csrf"
        // then remove marker.
        // Otherwise replace marker with input.
        
        // Split by marker
        const parts = content.split('___CSRF_MARKER___');
        let newContent = parts[0];
        
        for (let i = 1; i < parts.length; i++) {
            const part = parts[i];
            const trimmed = part.trim();
            
            if (trimmed.startsWith('<input type="hidden" name="_csrf"') || 
                trimmed.startsWith('<input type="hidden" name=\'_csrf\'') ||
                trimmed.startsWith('<input type=\'hidden\' name=\'_csrf\'')) {
                // Already has it, just append part
                newContent += part;
            } else {
                // Determine indentation
                // We don't have easy access to prev line indentation here.
                // Just inject.
                newContent += '\n' + csrfTokenInput + part;
                modified = true;
            }
        }
        
        content = newContent;
    }

    if (modified) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`[INJECTED] ${filepath}`);
    }
});

console.log("CSRF Injection Complete.");
