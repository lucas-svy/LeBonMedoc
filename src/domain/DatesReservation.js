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

// Les Date JS sont mutables : on les copie à l'entrée et à la sortie
// pour que l'objet-valeur reste réellement immuable.
function copier(d) {
  return d === null ? null : new Date(d.getTime());
}

function memeDate(a, b) {
  if (a === null || b === null) return a === b;
  return a.getTime() === b.getTime();
}

// Objet-valeur : les 5 dates d'une réservation.
// Il ne vérifie que la cohérence des dates entre elles.
// La cohérence « statut <=> dates » est une invariante de Reservation (règle 8, 2e partie).
class DatesReservation {

    #dateDemande;
    #dateLimiteReponse;
    #dateConfirmation;
    #dateLimiteRetrait;
    #dateCloture;

    // Reconstruit des dates existantes (depuis la base) : ne calcule rien, valide seulement.
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

        // Confirmation et limite de retrait vont ensemble
        verifier((dateConfirmation === null) === (dateLimiteRetrait === null),
          'Date de confirmation et date limite de retrait vont ensemble');

        // Ordre chronologique
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

    // Égalité par valeur : mêmes dates => même valeur.
    equals(autre) {
        return autre instanceof DatesReservation
          && memeDate(this.#dateDemande, autre.#dateDemande)
          && memeDate(this.#dateLimiteReponse, autre.#dateLimiteReponse)
          && memeDate(this.#dateConfirmation, autre.#dateConfirmation)
          && memeDate(this.#dateLimiteRetrait, autre.#dateLimiteRetrait)
          && memeDate(this.#dateCloture, autre.#dateCloture);
    }
}

module.exports = DatesReservation;
