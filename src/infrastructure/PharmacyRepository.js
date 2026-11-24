const Pharmacie = require("../domain/Pharmacie");

class PharmacyRepository {
  constructor(db) {
    this.db = db;
  }

  toDomain(row) {
    if (!row) {
      return null;
    }

    return new Pharmacie({
      id: row.id,
      nom: row.nom,
      adresse: row.adresse,
      ville: row.ville,
      telephone: row.telephone,
      horaires: row.horaires,
      delaiReponseMinutes: row.delai_reponse_minutes,
      delaiRetraitMinutes: row.delai_retrait_minutes,
    });
  }

  findById(id) {
    const row = this.db.prepare("SELECT * FROM pharmacie WHERE id = ?").get(id);

    return this.toDomain(row);
  }

  findAll() {
    return this.db
      .prepare("SELECT * FROM pharmacie ORDER BY id")
      .all()
      .map((row) => this.toDomain(row));
  }

  save(pharmacy) {
    if (!(pharmacy instanceof Pharmacie)) {
      throw new TypeError("save expects a Pharmacie instance.");
    }

    const values = [
      pharmacy.nom,
      pharmacy.adresse,
      pharmacy.ville,
      pharmacy.telephone,
      pharmacy.horaires,
      pharmacy.delaiReponseMinutes,
      pharmacy.delaiRetraitMinutes,
    ];

    if (pharmacy.id === null) {
      const result = this.db
        .prepare(
          `INSERT INTO pharmacie (
            nom, adresse, ville, telephone, horaires,
            delai_reponse_minutes, delai_retrait_minutes
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(...values);

      return this.findById(Number(result.lastInsertRowid));
    }

    if (!this.findById(pharmacy.id)) {
      throw new Error(`Pharmacy ${pharmacy.id} does not exist.`);
    }

    this.db
      .prepare(
        `UPDATE pharmacie
         SET nom = ?, adresse = ?, ville = ?, telephone = ?, horaires = ?,
             delai_reponse_minutes = ?, delai_retrait_minutes = ?
         WHERE id = ?`,
      )
      .run(...values, pharmacy.id);

    return this.findById(pharmacy.id);
  }
}

module.exports = PharmacyRepository;
