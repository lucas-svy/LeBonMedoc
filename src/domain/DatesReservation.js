const { DonneesInvalides } = require("./errors");

function verifier(condition, message, details) {
  if (!condition) throw new DonneesInvalides(message, details);
}

function estDateValide(d) {
  return d instanceof Date && !isNaN(d.getTime());
}

function estDateOuNull(d) {
  return d === null || estDateValide(d);
}

function copier(d) {
  return d === null ? null : new Date(d.getTime());
}

function memeDate(a, b) {
  if (a === null || b === null) return a === b;
  return a.getTime() === b.getTime();
}

function ajouterMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60_000);
}

class DatesReservation {

    #dateDemande;
    #dateLimiteReponse;
    #dateConfirmation;
    #dateLimiteRetrait;
    #dateCloture;

    constructor({
        dateDemande,
        dateLimiteReponse,
        dateConfirmation = null,
        dateLimiteRetrait = null,
        dateCloture = null,
    }) {
        verifier(estDateValide(dateDemande), 'Date de demande invalide');
        verifier(estDateValide(dateLimiteReponse), 'Date limite de réponse invalide');
        verifier(estDateOuNull(dateConfirmation), 'Date de confirmation invalide');
        verifier(estDateOuNull(dateLimiteRetrait), 'Date limite de retrait invalide');
        verifier(estDateOuNull(dateCloture), 'Date de clôture invalide');

        verifier((dateConfirmation === null) === (dateLimiteRetrait === null),
          'Date de confirmation et date limite de retrait vont ensemble');

        verifier(dateLimiteReponse > dateDemande, 'La date limite de réponse doit être après la demande');
        if (dateConfirmation !== null) {
          verifier(dateConfirmation >= dateDemande, 'La confirmation doit être après la demande');
          verifier(dateLimiteRetrait > dateConfirmation, 'La date limite de retrait doit être après la confirmation');
        }
        if (dateCloture !== null) {
          verifier(dateCloture >= dateDemande, 'La clôture doit être après la demande');
        }

        this.#dateDemande = copier(dateDemande);
        this.#dateLimiteReponse = copier(dateLimiteReponse);
        this.#dateConfirmation = copier(dateConfirmation);
        this.#dateLimiteRetrait = copier(dateLimiteRetrait);
        this.#dateCloture = copier(dateCloture);

        Object.freeze(this);
    }

    get dateDemande() { return copier(this.#dateDemande); }
    get dateLimiteReponse() { return copier(this.#dateLimiteReponse); }
    get dateConfirmation() { return copier(this.#dateConfirmation); }
    get dateLimiteRetrait() { return copier(this.#dateLimiteRetrait); }
    get dateCloture() { return copier(this.#dateCloture); }

    equals(autre) {
        return autre instanceof DatesReservation
          && memeDate(this.#dateDemande, autre.#dateDemande)
          && memeDate(this.#dateLimiteReponse, autre.#dateLimiteReponse)
          && memeDate(this.#dateConfirmation, autre.#dateConfirmation)
          && memeDate(this.#dateLimiteRetrait, autre.#dateLimiteRetrait)
          && memeDate(this.#dateCloture, autre.#dateCloture);
    }


    static nouvelle(maintenant, delaiReponseMinutes) { 
        verifier(estDateValide(maintenant), 'Date de demande invalide');
        return new DatesReservation({
            dateDemande: maintenant,
            dateLimiteReponse: ajouterMinutes(maintenant, delaiReponseMinutes),
            dateConfirmation: null,
            dateLimiteRetrait: null,
            dateCloture: null
        })
    }


    confirmer(maintenant, delaiRetraitMinutes) {
        verifier(estDateValide(maintenant), 'Date de confirmation invalide');
        return new DatesReservation({
            dateDemande: this.#dateDemande,
            dateLimiteReponse: this.#dateLimiteReponse,
            dateConfirmation: maintenant,
            dateLimiteRetrait: ajouterMinutes(maintenant, delaiRetraitMinutes),
            dateCloture: this.#dateCloture
        })
    }

    cloturer(maintenant) {
        verifier(estDateValide(maintenant), 'Date de cloture invalide');
        return new DatesReservation({
            dateDemande: this.#dateDemande,
            dateLimiteReponse: this.#dateLimiteReponse,
            dateConfirmation: this.#dateConfirmation,
            dateLimiteRetrait: this.#dateLimiteRetrait,
            dateCloture: maintenant
        })
    }

    

    reponseDepassee(maintenant) {
        verifier(estDateValide(maintenant), 'Date courante invalide');
        return maintenant > this.#dateLimiteReponse;
    }

    retraitDepasse(maintenant) {
        verifier(estDateValide(maintenant), 'Date courante invalide');
        return this.#dateLimiteRetrait !== null && maintenant > this.#dateLimiteRetrait;
    }
}

module.exports = DatesReservation;
