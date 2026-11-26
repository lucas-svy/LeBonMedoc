// Erreurs métier : une seule classe mère (ErreurDomaine), tout en français.
// La correspondance erreur -> code HTTP se fait uniquement dans api/errorHandler.js.

class ErreurDomaine extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = this.constructor.name; // ex. "TransitionInterdite"
    this.details = details;
  }
}

class DonneesInvalides extends ErreurDomaine {}

class DisponibiliteInsuffisante extends ErreurDomaine {
  constructor(message = "La quantité disponible est insuffisante.", details = {}) {
    super(message, details);
  }
}

class PharmacieOuMedicamentIntrouvable extends ErreurDomaine {
  constructor(options) {
    super("Pharmacie ou médicament introuvable.");
    if (options?.cause !== undefined) this.cause = options.cause;
  }
}

class ElementIntrouvable extends ErreurDomaine {}

class OperationNonAutorisee extends ErreurDomaine {}

class TransitionInterdite extends ErreurDomaine {}

class ReservationExpiree extends ErreurDomaine {}

class ReservationNonExpiree extends ErreurDomaine {}

class ReservationNonConfirmee extends ErreurDomaine {
  constructor(details = {}) {
    super("La réservation n'est pas confirmée.", details);
  }
}

module.exports = {
  ErreurDomaine,
  DonneesInvalides,
  DisponibiliteInsuffisante,
  PharmacieOuMedicamentIntrouvable,
  ElementIntrouvable,
  OperationNonAutorisee,
  TransitionInterdite,
  ReservationExpiree,
  ReservationNonExpiree,
  ReservationNonConfirmee,
};
