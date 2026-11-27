const { Disponibilite } = require("../domain/Disponibilite");

class DisponibiliteService {
  #disponibiliteRepository;

  constructor(disponibiliteRepository) {
    this.#disponibiliteRepository = disponibiliteRepository;
  }

  mettreAJour(pharmacieId, medicamentId, quantite, maintenant) {
    const disponibilite = Disponibilite.declarer({ pharmacieId, medicamentId, quantite }, maintenant);
    this.#disponibiliteRepository.save(disponibilite);
    return disponibilite;
  }

  listerPourPharmacie(pharmacieId) {
    return this.#disponibiliteRepository.findByPharmacie(pharmacieId);
  }
}

module.exports = { DisponibiliteService };
