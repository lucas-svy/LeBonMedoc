const createDatabase = require("../../src/infrastructure/database");
const PharmacistRepository = require("../../src/infrastructure/PharmacistRepository");
const PharmacyRepository = require("../../src/infrastructure/PharmacyRepository");
const Pharmacie = require("../../src/domain/Pharmacie");
const Pharmacien = require("../../src/domain/Pharmacien");

describe("PharmacistRepository", () => {
  let db;
  let repository;
  let pharmacyId;

  beforeEach(() => {
    db = createDatabase(":memory:");
    repository = new PharmacistRepository(db);
    const pharmacy = new PharmacyRepository(db).save(
      new Pharmacie({
        nom: "Central Pharmacy",
        adresse: "10 rue de la Paix",
        ville: "Lyon",
      }),
    );
    pharmacyId = pharmacy.id;
  });

  afterEach(() => {
    db.close();
  });

  test("findById returns null when the pharmacist does not exist", () => {
    expect(repository.findById(999)).toBeNull();
  });

  test("findAll returns an empty list when no pharmacist exists", () => {
    expect(repository.findAll()).toEqual([]);
  });

  test("save creates a pharmacist attached to a pharmacy", () => {
    const saved = repository.save(
      new Pharmacien({
        pharmacieId: pharmacyId,
        nom: "Smith",
        prenom: "Alice",
        email: "alice.smith@example.test",
      }),
    );

    expect(saved).toBeInstanceOf(Pharmacien);
    expect(saved.id).toBeGreaterThan(0);
    expect(saved.belongsTo(pharmacyId)).toBe(true);
    expect(repository.findById(saved.id).email).toBe(
      "alice.smith@example.test",
    );
  });

  test("findAll returns saved pharmacists", () => {
    repository.save(
      new Pharmacien({
        pharmacieId: pharmacyId,
        nom: "Smith",
        prenom: "Alice",
        email: "alice.smith@example.test",
      }),
    );

    expect(repository.findAll()).toHaveLength(1);
  });

  test("save updates an existing pharmacist", () => {
    const saved = repository.save(
      new Pharmacien({
        pharmacieId: pharmacyId,
        nom: "Smith",
        prenom: "Alice",
        email: "alice.smith@example.test",
      }),
    );
    const updated = repository.save(
      new Pharmacien({
        id: saved.id,
        pharmacieId: pharmacyId,
        nom: "Smith",
        prenom: "Alicia",
        email: "alicia.smith@example.test",
      }),
    );

    expect(updated.id).toBe(saved.id);
    expect(updated.prenom).toBe("Alicia");
  });

  test("the database rejects a pharmacist linked to an unknown pharmacy", () => {
    expect(() =>
      repository.save(
        new Pharmacien({
          pharmacieId: 999,
          nom: "Smith",
          prenom: "Alice",
          email: "alice.smith@example.test",
        }),
      ),
    ).toThrow();
  });
});
