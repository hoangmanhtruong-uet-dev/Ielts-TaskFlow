const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      results.push(file);
    }
  });
  return results;
}

const files = [...walk("./src"), ...walk("./tests")];
files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  let modified = false;

  if (content.includes("as any")) {
    content = content.replace(/as any/g, "as unknown");
    modified = true;
  }
  if (content.includes(": any")) {
    content = content.replace(/: any/g, ": unknown");
    modified = true;
  }
  // Remove eslint-disable
  if (content.includes("eslint-disable")) {
    // Only replacing eslint-disable if they were trying to silence linter
    content = content.replace(/\/\/\s*eslint-disable.*/g, "");
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content);
  }
});
