const fs = require("fs");

//console.log(typeof fs);

const content = fs.readFileSync(
  "../teoria/paradigma-funciones-vs-clases.md",
  "utf8",
);

const wordCount = content.split;
