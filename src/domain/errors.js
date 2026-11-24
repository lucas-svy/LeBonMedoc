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




class DomainError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = this.constructor.name;   // donne automatiquement "TransitionInterdite", etc.
        this.details = details;
    }
}


class ForbiddenTransition extends DomainError {

}

class ExpiredReservation extends DomainError {

}

class InvalidData extends DomainError {

}

class InsufficientAvailability extends DomainError {

}

class UnauthorizedOperation extends DomainError {

}

class NotFound extends DomainError {

}

module.exports = {
    DomainError,
    ForbiddenTransition,
    ExpiredReservation,
    InvalidData,
    InsufficientAvailability,
    UnauthorizedOperation,
    NotFound,
    DonneesInvalides, 
    DisponibiliteInsuffisante, 
    PharmacieOuMedicamentIntrouvable
}

class InvalidData extends Error {
  constructor(message) {
    super(message);
    this.name = "DonneesInvalides";
  }
}

module.exports = {
  DonneesInvalides: InvalidData,
  InvalidData,
};
