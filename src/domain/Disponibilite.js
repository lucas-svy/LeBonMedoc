const { DonneesInvalides, DisponibiliteInsuffisante } = require("./errors");

function validerQuantite(quantite) {
  if (!Number.isInteger(quantite) || quantite <= 0) {
    throw new DonneesInvalides("La quantité doit être un entier strictement positif.");
  }
}

function lireHorodatage(date) {
  const horodatage = date instanceof Date ? date.getTime() : NaN;
  if (!Number.isFinite(horodatage)) {
    throw new DonneesInvalides("La date de mise à jour doit être valide.");
  }
  return horodatage;
}

class Disponibilite {
  #pharmacieId;
  #medicamentId;
  #quantiteDisponible;
  #horodatageMiseAJour;

  constructor({ pharmacieId, medicamentId, quantiteDisponible, dateMiseAJour }) {
    if (!Number.isInteger(quantiteDisponible) || quantiteDisponible < 0) {
      throw new DonneesInvalides("Le stock doit être un entier positif ou nul.");
    }

    this.#pharmacieId = pharmacieId;
    this.#medicamentId = medicamentId;
    this.#quantiteDisponible = quantiteDisponible;
    this.#horodatageMiseAJour = lireHorodatage(dateMiseAJour);
  }

  get pharmacieId() {
    return this.#pharmacieId;
  }

  get medicamentId() {
    return this.#medicamentId;
  }

  get quantiteDisponible() {
    return this.#quantiteDisponible;
  }

  get dateMiseAJour() {
    return new Date(this.#horodatageMiseAJour);
  }

  toJSON() {
    return {
      pharmacieId: this.#pharmacieId,
      medicamentId: this.#medicamentId,
      quantiteDisponible: this.#quantiteDisponible,
      dateMiseAJour: this.dateMiseAJour,
    };
  }

  static declarer({ pharmacieId, medicamentId, quantite }, maintenant) {
    validerQuantite(quantite);
    return new Disponibilite({
      pharmacieId,
      medicamentId,
      quantiteDisponible: quantite,
      dateMiseAJour: maintenant,
    });
  }

  estDisponible(quantite) {
    validerQuantite(quantite);
    return this.#quantiteDisponible >= quantite;
  }

  retirer(quantite, maintenant) {
    if (!this.estDisponible(quantite)) {
      throw new DisponibiliteInsuffisante();
    }

    this.#modifierStock(this.#quantiteDisponible - quantite, maintenant);
  }

  rendre(quantite, maintenant) {
    validerQuantite(quantite);
    this.#modifierStock(this.#quantiteDisponible + quantite, maintenant);
  }

  mettreAJour(nouvelleQuantite, maintenant) {
    validerQuantite(nouvelleQuantite);
    this.#modifierStock(nouvelleQuantite, maintenant);
  }

  #modifierStock(quantite, maintenant) {
    const horodatage = lireHorodatage(maintenant);
    this.#quantiteDisponible = quantite;
    this.#horodatageMiseAJour = horodatage;
  }
}

module.exports = { Disponibilite, validerQuantite };
