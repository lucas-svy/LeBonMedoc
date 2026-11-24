const path = require("node:path");
const fs = require("node:fs");
const Database = require("better-sqlite3");

const projectRoot = path.resolve(__dirname, "../..");
const defaultDbPath = path.join(projectRoot, "data", "lebonmedoc.sqlite");
const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

function createDatabase(databasePath = defaultDbPath) {
  if (databasePath !== ":memory:") {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  }

  const db = new Database(databasePath);
  db.pragma("foreign_keys = ON");
  db.exec(schema);

  return db;
}

module.exports = createDatabase;
