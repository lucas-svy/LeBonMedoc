const createDatabase = require("../../src/infrastructure/database");
const MedicationRepository = require("../../src/infrastructure/MedicationRepository");
const Medicament = require("../../src/domain/Medicament");

describe("MedicationRepository", () => {
  let db;
  let repository;

  const validMedication = {
    codeCIP: "0123456789012",
    nom: "Paracetamol",
    dosage: "500 mg",
    forme: "tablet",
    surOrdonnance: false,
  };

  beforeEach(() => {
    db = createDatabase(":memory:");
    repository = new MedicationRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  test("findById returns null when the medication does not exist", () => {
    expect(repository.findById(999)).toBeNull();
  });

  test("findAll returns an empty list when no medication exists", () => {
    expect(repository.findAll()).toEqual([]);
  });

  test("save creates a medication and converts prescription status to boolean", () => {
    const saved = repository.save(new Medicament(validMedication));

    expect(saved).toBeInstanceOf(Medicament);
    expect(saved.id).toBeGreaterThan(0);
    expect(repository.findById(saved.id).surOrdonnance).toBe(false);
  });

  test("findByCipCode finds a medication by its exact CIP code", () => {
    repository.save(new Medicament(validMedication));

    expect(repository.findByCipCode(validMedication.codeCIP).nom).toBe(
      "Paracetamol",
    );
    expect(repository.findByCipCode("0000000000000")).toBeNull();
  });

  test("searchByName finds partial names without case sensitivity", () => {
    repository.save(new Medicament(validMedication));

    expect(repository.searchByName("  PARA ")).toHaveLength(1);
    expect(repository.searchByName("unknown")).toEqual([]);
    expect(repository.searchByName("")).toEqual([]);
  });

  test("save updates an existing medication and preserves prescription status", () => {
    const saved = repository.save(new Medicament(validMedication));
    const updated = repository.save(
      new Medicament({
        ...validMedication,
        id: saved.id,
        nom: "Paracetamol Extra",
        surOrdonnance: true,
      }),
    );

    expect(updated.id).toBe(saved.id);
    expect(repository.findById(saved.id).nom).toBe("Paracetamol Extra");
    expect(repository.findById(saved.id).surOrdonnance).toBe(true);
  });

  test("the database rejects a duplicate CIP code", () => {
    repository.save(new Medicament(validMedication));

    expect(() =>
      repository.save(
        new Medicament({
          ...validMedication,
          nom: "Duplicate CIP",
        }),
      ),
    ).toThrow();
  });
});
