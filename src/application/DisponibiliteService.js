const { Disponibilite } = require("../domain/Disponibilite");

class DisponibiliteService {
  #disponibiliteRepository;

  constructor(disponibiliteRepository) {
    this.#disponibiliteRepository = disponibiliteRepository;
  }

  mettreAJour(pharmacieId, medicamentId, quantite) {
    const disponibilite = Disponibilite.declarer({ pharmacieId, medicamentId, quantite });
    this.#disponibiliteRepository.save(disponibilite);
    return disponibilite;
  }

  listerPourPharmacie(pharmacieId) {
    return this.#disponibiliteRepository.findByPharmacie(pharmacieId);
  }
}

module.exports = { DisponibiliteService };
