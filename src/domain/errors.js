class DonneesInvalides extends Error {
  constructor(message) {
    super(message);
    this.name = "DonneesInvalides";
  }
}

class DisponibiliteInsuffisante extends Error {
  constructor() {
    super("La quantité disponible est insuffisante.");
    this.name = "DisponibiliteInsuffisante";
  }
}

class PharmacieOuMedicamentIntrouvable extends Error {
  constructor(options) {
    super("Pharmacie ou médicament introuvable.", options);
    this.name = "PharmacieOuMedicamentIntrouvable";
  }
}

module.exports = { DonneesInvalides, DisponibiliteInsuffisante, PharmacieOuMedicamentIntrouvable };
