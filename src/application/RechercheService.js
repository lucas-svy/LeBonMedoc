const { validerQuantite } = require("../domain/Disponibilite");
const { DisponibiliteInsuffisante } = require("../domain/errors");

class RechercheService {
  #disponibiliteRepository;

  constructor(disponibiliteRepository) {
    this.#disponibiliteRepository = disponibiliteRepository;
  }

  rechercher(medicament, { pharmacieId = null, quantite = 1, ville } = {}) {
    validerQuantite(quantite);

    const resultats = this.#disponibiliteRepository.rechercher(medicament, ville).filter(
      (stock) =>
        (pharmacieId === null || stock.pharmacieId === pharmacieId) &&
        stock.quantiteDisponible >= quantite,
    );

    if (resultats.length === 0) {
      throw new DisponibiliteInsuffisante();
    }

    return resultats;
  }
}

module.exports = { RechercheService };
