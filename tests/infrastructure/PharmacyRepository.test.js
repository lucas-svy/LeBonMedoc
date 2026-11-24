const createDatabase = require("../../src/infrastructure/database");
const PharmacyRepository = require("../../src/infrastructure/PharmacyRepository");
const Pharmacie = require("../../src/domain/Pharmacie");

describe("PharmacyRepository", () => {
  let db;
  let repository;

  const validPharmacy = {
    nom: "Central Pharmacy",
    adresse: "10 rue de la Paix",
    ville: "Lyon",
  };

  beforeEach(() => {
    db = createDatabase(":memory:");
    repository = new PharmacyRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  test("findById returns null when the pharmacy does not exist", () => {
    expect(repository.findById(999)).toBeNull();
  });

  test("findAll returns an empty list when no pharmacy exists", () => {
    expect(repository.findAll()).toEqual([]);
  });

  test("save creates a pharmacy and returns its generated id", () => {
    const saved = repository.save(new Pharmacie(validPharmacy));

    expect(saved).toBeInstanceOf(Pharmacie);
    expect(saved.id).toBeGreaterThan(0);
    expect(repository.findById(saved.id)).toMatchObject(validPharmacy);
  });

  test("findAll returns saved pharmacies in id order", () => {
    repository.save(new Pharmacie(validPharmacy));
    repository.save(
      new Pharmacie({
        ...validPharmacy,
        nom: "Riverside Pharmacy",
        adresse: "20 avenue du Rhône",
      }),
    );

    expect(repository.findAll()).toHaveLength(2);
    expect(repository.findAll()[0].nom).toBe("Central Pharmacy");
  });

  test("save updates an existing pharmacy", () => {
    const saved = repository.save(new Pharmacie(validPharmacy));
    const updated = repository.save(
      new Pharmacie({
        ...validPharmacy,
        id: saved.id,
        nom: "Updated Pharmacy",
        delaiReponseMinutes: 45,
      }),
    );

    expect(updated.id).toBe(saved.id);
    expect(updated.nom).toBe("Updated Pharmacy");
    expect(updated.delaiReponseMinutes).toBe(45);
  });

  test("save refuses to update an unknown pharmacy id", () => {
    expect(() =>
      repository.save(new Pharmacie({ ...validPharmacy, id: 999 })),
    ).toThrow("Pharmacy 999 does not exist.");
  });
});
