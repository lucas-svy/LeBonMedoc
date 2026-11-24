const { readFileSync } = require("node:fs");
const { join } = require("node:path");

function ouvrirBase(chemin = join(__dirname, "..", "..", "lebonmedoc.sqlite")) {
  const { DatabaseSync } = require("node:sqlite");
  return new DatabaseSync(chemin);
}

function initialiserSchema(db) {
  db.exec(readFileSync(join(__dirname, "schema.sql"), "utf8"));
}

module.exports = { ouvrirBase, initialiserSchema };
