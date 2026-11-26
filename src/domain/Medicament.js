const Dosage = require("./Dosage");
const { DonneesInvalides } = require("./errors");
const Prix = require("./Prix");

class Medicament {
  constructor({
    id = null,
    codeCIP,
    nom,
    dosage,
    prix,
    surOrdonnance,
  } = {}) {
    if (typeof codeCIP !== "string" || !/^\d{13}$/.test(codeCIP)) {
      throw new DonneesInvalides(
        "Le code CIP doit contenir exactement 13 chiffres.",
      );
    }

    if (typeof nom !== "string" || nom.trim().length === 0) {
      throw new DonneesInvalides("Le nom du médicament est obligatoire.");
    }

    if (typeof dosage === null) {
      throw new DonneesInvalides("Le dosage du médicament est obligatoire.");
    }

    if (typeof surOrdonnance !== "boolean") {
      throw new DonneesInvalides("surOrdonnance doit être un booléen.");
    }



    this.id = id;
    this.codeCIP = codeCIP;
    this.nom = nom.trim();
    this.dosage = dosage;
    this.surOrdonnance = surOrdonnance;
    this.prix = prix;
  }
}

module.exports = Medicament;
