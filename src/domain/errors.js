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
    NotFound
}