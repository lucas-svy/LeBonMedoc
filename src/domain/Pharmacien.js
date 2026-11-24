const { DonneesInvalides } = require("./errors");

class Pharmacien {
  constructor({ id = null, pharmacieId, nom, prenom, email } = {}) {
    if (!Number.isInteger(pharmacieId) || pharmacieId <= 0) {
      throw new DonneesInvalides(
        "Un pharmacien doit être rattaché à une pharmacie valide.",
      );
    }

    if (typeof nom !== "string" || nom.trim().length === 0) {
      throw new DonneesInvalides("Le nom du pharmacien est obligatoire.");
    }

    if (typeof prenom !== "string" || prenom.trim().length === 0) {
      throw new DonneesInvalides("Le prénom du pharmacien est obligatoire.");
    }

    if (typeof email !== "string" || email.trim().length === 0) {
      throw new DonneesInvalides("L'email du pharmacien est obligatoire.");
    }

    this.id = id;
    this.pharmacieId = pharmacieId;
    this.nom = nom.trim();
    this.prenom = prenom.trim();
    this.email = email.trim();
  }

  appartientA(pharmacieId) {
    return this.pharmacieId === pharmacieId;
  }

  belongsTo(pharmacyId) {
    return this.appartientA(pharmacyId);
  }
}

module.exports = Pharmacien;
