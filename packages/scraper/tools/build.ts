import shell from "shelljs";

const buildFolder = "./dist/";
const folders = new Set(["./src/abi", "./src/files"]);

// copy Folders
folders.forEach((folder) => {
  shell.cp("-R", folder, buildFolder);
});
