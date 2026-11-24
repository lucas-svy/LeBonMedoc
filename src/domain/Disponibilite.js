const { DonneesInvalides, DisponibiliteInsuffisante } = require("./errors");

function validerQuantite(quantite) {
  if (!Number.isInteger(quantite) || quantite <= 0) {
    throw new DonneesInvalides("La quantité doit être un entier strictement positif.");
  }
}

class Disponibilite {
  constructor({ pharmacieId, medicamentId, quantiteDisponible, dateMiseAJour = new Date() }) {
    if (!Number.isInteger(quantiteDisponible) || quantiteDisponible < 0) {
      throw new DonneesInvalides("Le stock doit être un entier positif ou nul.");
    }

    this.pharmacieId = pharmacieId;
    this.medicamentId = medicamentId;
    this.quantiteDisponible = quantiteDisponible;
    this.dateMiseAJour = dateMiseAJour;
  }

  static declarer({ pharmacieId, medicamentId, quantite }) {
    validerQuantite(quantite);
    return new Disponibilite({ pharmacieId, medicamentId, quantiteDisponible: quantite });
  }

  estDisponible(quantite) {
    validerQuantite(quantite);
    return this.quantiteDisponible >= quantite;
  }

  retirer(quantite) {
    if (!this.estDisponible(quantite)) {
      throw new DisponibiliteInsuffisante();
    }

    this.#modifierStock(this.quantiteDisponible - quantite);
  }

  rendre(quantite) {
    validerQuantite(quantite);
    this.#modifierStock(this.quantiteDisponible + quantite);
  }

  mettreAJour(nouvelleQuantite) {
    validerQuantite(nouvelleQuantite);
    this.#modifierStock(nouvelleQuantite);
  }

  #modifierStock(quantite) {
    this.quantiteDisponible = quantite;
    this.dateMiseAJour = new Date();
  }
}

module.exports = { Disponibilite, validerQuantite };
