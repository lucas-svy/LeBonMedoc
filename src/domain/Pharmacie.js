const { DonneesInvalides } = require("./errors");

const DELAI_REPONSE_PAR_DEFAUT = 120;
const DELAI_RETRAIT_PAR_DEFAUT = 2880;

class Pharmacie {
  constructor({
    id = null,
    nom,
    adresse,
    ville,
    telephone = null,
    horaires = null,
    delaiReponseMinutes = DELAI_REPONSE_PAR_DEFAUT,
    delaiRetraitMinutes = DELAI_RETRAIT_PAR_DEFAUT,
  } = {}) {
    if (typeof nom !== "string" || nom.trim().length === 0) {
      throw new DonneesInvalides("Le nom de la pharmacie est obligatoire.");
    }

    if (typeof adresse !== "string" || adresse.trim().length === 0) {
      throw new DonneesInvalides("L'adresse de la pharmacie est obligatoire.");
    }

    if (typeof ville !== "string" || ville.trim().length === 0) {
      throw new DonneesInvalides("La ville de la pharmacie est obligatoire.");
    }

    if (!Number.isInteger(delaiReponseMinutes) || delaiReponseMinutes <= 0) {
      throw new DonneesInvalides(
        "Le délai de réponse doit être un entier strictement positif.",
      );
    }

    if (!Number.isInteger(delaiRetraitMinutes) || delaiRetraitMinutes <= 0) {
      throw new DonneesInvalides(
        "Le délai de retrait doit être un entier strictement positif.",
      );
    }

    this.id = id;
    this.nom = nom.trim();
    this.adresse = adresse.trim();
    this.ville = ville.trim();
    this.telephone = telephone;
    this.horaires = horaires;
    this.delaiReponseMinutes = delaiReponseMinutes;
    this.delaiRetraitMinutes = delaiRetraitMinutes;
  }
}

module.exports = Pharmacie;
