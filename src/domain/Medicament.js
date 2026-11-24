const { DonneesInvalides } = require("./errors");

class Medicament {
  constructor({
    id = null,
    codeCIP,
    nom,
    dosage,
    surOrdonnance,
    forme = "",
  } = {}) {
    if (typeof codeCIP !== "string" || !/^\d{13}$/.test(codeCIP)) {
      throw new DonneesInvalides(
        "Le code CIP doit contenir exactement 13 chiffres.",
      );
    }

    if (typeof nom !== "string" || nom.trim().length === 0) {
      throw new DonneesInvalides("Le nom du médicament est obligatoire.");
    }

    if (typeof dosage !== "string" || dosage.trim().length === 0) {
      throw new DonneesInvalides("Le dosage du médicament est obligatoire.");
    }

    if (typeof surOrdonnance !== "boolean") {
      throw new DonneesInvalides("surOrdonnance doit être un booléen.");
    }

    if (typeof forme !== "string") {
      throw new DonneesInvalides(
        "La forme du médicament doit être une chaîne de caractères.",
      );
    }

    this.id = id;
    this.codeCIP = codeCIP;
    this.nom = nom.trim();
    this.dosage = dosage.trim();
    this.surOrdonnance = surOrdonnance;
    this.forme = forme;
  }
}

module.exports = Medicament;
