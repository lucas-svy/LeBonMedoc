const createDatabase = require("../../src/infrastructure/database");
const seedDatabase = require("../../src/infrastructure/seed");

describe("seedDatabase", () => {
  let db;

  beforeEach(() => {
    db = createDatabase(":memory:");
  });

  afterEach(() => {
    db.close();
  });

  test("seeds the expected catalogue and is safe to run more than once", () => {
    expect(seedDatabase(db)).toEqual({
      pharmacies: 3,
      pharmacists: 6,
      medications: 10,
      availabilities: 30,
    });
    seedDatabase(db);

    expect(
      db.prepare("SELECT COUNT(*) AS count FROM pharmacie").get().count,
    ).toBe(3);
    expect(
      db.prepare("SELECT COUNT(*) AS count FROM pharmacien").get().count,
    ).toBe(6);
    expect(
      db.prepare("SELECT COUNT(*) AS count FROM medicament").get().count,
    ).toBe(10);
    expect(
      db
        .prepare(
          "SELECT COUNT(*) AS count FROM medicament WHERE sur_ordonnance = 1",
        )
        .get().count,
    ).toBeGreaterThanOrEqual(2);
    expect(
      db.prepare("SELECT COUNT(*) AS count FROM disponibilite").get().count,
    ).toBe(30);
  });
});
