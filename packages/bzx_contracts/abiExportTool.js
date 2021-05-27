const fs = require("fs");
const path = require("path");

const abiDirPath = path.resolve(__dirname, "abi");
const abiFiles = fs.readdirSync(abiDirPath);

for (const fileName of abiFiles) {
  if (path.extname(fileName) !== ".json") continue;
}
