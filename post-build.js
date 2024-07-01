import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directoryPath = path.join(__dirname, 'shared');

function addJsExtension(dir) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      addJsExtension(filePath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      // Modify import statements to ensure './' at the start and '.js' at the end
      content = content.replace(/(import .* from\s+['"])([^'"]+)(['"];)/g, (match, p1, p2, p3) => {
        let newPath = p2;
        if (!newPath.startsWith('./') && !newPath.startsWith('../')) {
          newPath = './' + newPath;
        }
        if (!newPath.endsWith('.js')) {
          newPath += '.js';
        }
        return p1 + newPath + p3;
      });
      fs.writeFileSync(filePath, content, 'utf8');
    }
  });
}

addJsExtension(directoryPath);
console.log('Added ./ and .js to import statements where missing');
