const fs = require("fs");
const path = require("path");

const componentsDir = path.join(__dirname, "components", "universe");
const files = fs
  .readdirSync(componentsDir)
  .filter((file) => file.endsWith(".tsx"));

files.forEach((file) => {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  // Replace all useGLTF calls with the new pattern
  const updatedContent = content.replace(
    /useGLTF\(["']([^"']+)["']\)/g,
    'useGLTF(getModelPath("$1"))'
  );

  // Add the import if it's not there already
  if (
    !content.includes("import { getModelPath }") &&
    updatedContent !== content
  ) {
    updatedContent = updatedContent.replace(
      /import.*from ["']@react-three\/fiber["'];/,
      '$&\nimport { getModelPath } from "@/lib/utils";'
    );
  }

  if (updatedContent !== content) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated ${file}`);
  }
});

console.log("All model paths updated!");
