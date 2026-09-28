const fs = require('fs');

const files = [
  'app/tienda/page.js',
  'app/oauth/discord/page.js',
  'app/movilpage/perfil/page.js',
  'app/inventario/page.js',
  'app/changepassword/page.js',
  'app/buscar/page.js'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // If already wrapped or has Suspense fallback, skip
  if (content.includes('<Suspense') || content.includes('function TiendaContent()')) {
    console.log(`Skipping ${file}`);
    return;
  }

  // 1. Ensure Suspense is imported from react
  if (!content.includes('Suspense')) {
    if (content.includes('from "react"')) {
      content = content.replace(/from "react";/, ', Suspense } from "react";').replace(/,\s*,\s*Suspense/, ', Suspense');
      // Fix potential duplicates if the syntax was like `import { useState } from "react"` -> `import { useState }, Suspense } from "react"` is bad
      // Safer way:
      content = content.replace(/import\s+{([^}]+)}\s+from\s+["']react["'];/, (match, p1) => {
        return `import { ${p1.trim()}, Suspense } from "react";`;
      });
    } else {
      // Add it after "use client";
      content = content.replace(/"use client";/, '"use client";\nimport { Suspense } from "react";');
    }
  }

  // 2. Find the export default function Name()
  const match = content.match(/export default function ([A-Za-z0-9_]+)\(\)\s*{/);
  if (!match) {
    console.log(`Could not find export default in ${file}`);
    return;
  }
  const funcName = match[1];
  const newFuncName = `${funcName}Content`;

  // Replace `export default function Name()` with `function NameContent()`
  content = content.replace(match[0], `function ${newFuncName}() {`);

  // 3. Append the new wrapper at the end of the file
  const wrapper = `\n\nexport default function ${funcName}() {\n  return (\n    <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#a1a1aa" }}>Cargando página...</div>}>\n      <${newFuncName} />\n    </Suspense>\n  );\n}\n`;
  content += wrapper;

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
