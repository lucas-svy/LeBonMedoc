const createDatabase = require("../../src/infrastructure/database");

describe("createDatabase", () => {
  let db;

  afterEach(() => {
    if (db) {
      db.close();
      db = null;
    }
  });

  test("loads the schema and enables foreign keys", () => {
    db = createDatabase(":memory:");

    expect(db.pragma("foreign_keys", { simple: true })).toBe(1);

    const pharmacyTable = db
      .prepare("SELECT name FROM sqlite_master WHERE type = ? AND name = ?")
      .get("table", "pharmacie");

    expect(pharmacyTable).toBeDefined();
  });
});
