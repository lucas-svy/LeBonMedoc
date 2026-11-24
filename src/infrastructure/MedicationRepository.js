const Medicament = require("../domain/Medicament");

class MedicationRepository {
  constructor(db) {
    this.db = db;
  }

  toDomain(row) {
    if (!row) {
      return null;
    }

    return new Medicament({
      id: row.id,
      codeCIP: row.code_cip,
      nom: row.nom,
      dosage: row.dosage,
      forme: row.forme,
      surOrdonnance: row.sur_ordonnance === 1,
    });
  }

  findById(id) {
    const row = this.db
      .prepare("SELECT * FROM medicament WHERE id = ?")
      .get(id);

    return this.toDomain(row);
  }

  findAll() {
    return this.db
      .prepare("SELECT * FROM medicament ORDER BY id")
      .all()
      .map((row) => this.toDomain(row));
  }

  findByCipCode(cipCode) {
    const row = this.db
      .prepare("SELECT * FROM medicament WHERE code_cip = ?")
      .get(cipCode);

    return this.toDomain(row);
  }

  searchByName(name) {
    const searchTerm = typeof name === "string" ? name.trim() : "";
    if (searchTerm.length === 0) {
      return [];
    }

    return this.db
      .prepare(
        "SELECT * FROM medicament WHERE nom LIKE ? COLLATE NOCASE ORDER BY id",
      )
      .all(`%${searchTerm}%`)
      .map((row) => this.toDomain(row));
  }

  save(medication) {
    if (!(medication instanceof Medicament)) {
      throw new TypeError("save expects a Medicament instance.");
    }

    const values = [
      medication.codeCIP,
      medication.nom,
      medication.dosage,
      medication.forme,
      medication.surOrdonnance ? 1 : 0,
    ];

    if (medication.id === null) {
      const result = this.db
        .prepare(
          `INSERT INTO medicament (
            code_cip, nom, dosage, forme, sur_ordonnance
          ) VALUES (?, ?, ?, ?, ?)`,
        )
        .run(...values);

      return this.findById(Number(result.lastInsertRowid));
    }

    if (!this.findById(medication.id)) {
      throw new Error(`Medication ${medication.id} does not exist.`);
    }

    this.db
      .prepare(
        `UPDATE medicament
         SET code_cip = ?, nom = ?, dosage = ?, forme = ?, sur_ordonnance = ?
         WHERE id = ?`,
      )
      .run(...values, medication.id);

    return this.findById(medication.id);
  }
}

module.exports = MedicationRepository;
