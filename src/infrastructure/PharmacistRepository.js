const Pharmacien = require("../domain/Pharmacien");

class PharmacistRepository {
  constructor(db) {
    this.db = db;
  }

  toDomain(row) {
    if (!row) {
      return null;
    }

    return new Pharmacien({
      id: row.id,
      pharmacieId: row.pharmacie_id,
      nom: row.nom,
      prenom: row.prenom,
      email: row.email,
    });
  }

  findById(id) {
    const row = this.db
      .prepare("SELECT * FROM pharmacien WHERE id = ?")
      .get(id);

    return this.toDomain(row);
  }

  findAll() {
    return this.db
      .prepare("SELECT * FROM pharmacien ORDER BY id")
      .all()
      .map((row) => this.toDomain(row));
  }

  save(pharmacist) {
    if (!(pharmacist instanceof Pharmacien)) {
      throw new TypeError("save expects a Pharmacien instance.");
    }

    const values = [
      pharmacist.pharmacieId,
      pharmacist.nom,
      pharmacist.prenom,
      pharmacist.email,
    ];

    if (pharmacist.id === null) {
      const result = this.db
        .prepare(
          `INSERT INTO pharmacien (pharmacie_id, nom, prenom, email)
           VALUES (?, ?, ?, ?)`,
        )
        .run(...values);

      return this.findById(Number(result.lastInsertRowid));
    }

    if (!this.findById(pharmacist.id)) {
      throw new Error(`Pharmacist ${pharmacist.id} does not exist.`);
    }

    this.db
      .prepare(
        `UPDATE pharmacien
         SET pharmacie_id = ?, nom = ?, prenom = ?, email = ?
         WHERE id = ?`,
      )
      .run(...values, pharmacist.id);

    return this.findById(pharmacist.id);
  }
}

module.exports = PharmacistRepository;
