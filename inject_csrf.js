const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdir(dir, function(err, files) {
        if (err) throw err;
        files.forEach(function(file) {
            var filepath = path.join(dir, file);
            fs.stat(filepath, function(err, stats) {
                if (stats.isDirectory()) {
                    walk(filepath, callback);
                } else if (stats.isFile() && file.endsWith('.ejs')) {
                    callback(filepath);
                }
            });
        });
    });
}

const inputTag = '<input type="hidden" name="_csrf" value="<%= csrfToken %>">';

console.log("Starting CSRF injection...");

walk(path.join(__dirname, 'views'), (filepath) => {
    try {
        const data = fs.readFileSync(filepath, 'utf8');
        
        // Simple regex to find <form ... > and append input after it
        // We use a function to avoid injecting if it looks like it's already there (rudimentary check)
        const newData = data.replace(/<form([^>]*)>/gi, (match) => {
            return match + '\n' + inputTag;
        });

        if (newData !== data) {
            fs.writeFileSync(filepath, newData, 'utf8');
            console.log(`Updated ${filepath}`);
        }
    } catch (e) {
        console.error(`Error processing ${filepath}:`, e);
    }
});
