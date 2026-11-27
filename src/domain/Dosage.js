const { DonneesInvalides } = require("./errors");
const FormesMedicament = require("./FormesMedicament");
const Unites = require("./Unites");

class Dosage {
  constructor(donnees = {}) {
    if (!donnees || typeof donnees !== "object" || Array.isArray(donnees)) {
      throw new DonneesInvalides("Les données du dosage sont invalides.");
    }

    const { forme, unite, quantite } = donnees;

    if (!Object.values(FormesMedicament).includes(forme)) {
      throw new DonneesInvalides("Forme de médicament invalide.");
    }

    if (!Object.values(Unites).includes(unite)) {
      throw new DonneesInvalides("Unité de dosage invalide.");
    }

    if (!Number.isFinite(quantite) || quantite <= 0) {
      throw new DonneesInvalides(
        "La quantité du dosage doit être un nombre fini et strictement positif."
      );
    }

    this.forme = forme;
    this.unite = unite;
    this.quantite = quantite;
  }
}

module.exports = Dosage;