const { InvalidData } = require("./errors");
const ReservationStatus = require("./ReservationStatus");


const FINAL_STATES = [
  ReservationStatus.REFUSED,
  ReservationStatus.EXPIRED,
  ReservationStatus.CANCELLED,
  ReservationStatus.PICKED_UP,
];

const CONFIRMED_STATES = [
  ReservationStatus.CONFIRMED,
  ReservationStatus.PICKED_UP,
];


function checkValueCondition(condition, message, details) {
  if (!condition) throw new InvalidData(message, details);
}

function isDateValid(d) {
  return d instanceof Date && !isNaN(d.getTime());
}

function isDateOrNull(d) {
  return d === null || isDateValid(d);
}

function isIdValid(id) {
  return Number.isInteger(id) && id > 0;
}


class Reservation {

    #id;
    #patientId;
    #pharmacieId;
    #medicamentId;
    #quantite;
    #statut;
    #dateDemande;
    #dateLimiteReponse;
    #dateConfirmation;
    #dateLimiteRetrait;
    #dateCloture;
    #motifRefus;

    static #datesVerification({ statut, dateDemande, dateLimiteReponse, dateConfirmation, dateLimiteRetrait, dateCloture}) {

        checkValueCondition(isDateValid(dateDemande), 'Date de demande invalide');
        checkValueCondition(isDateValid(dateLimiteReponse), 'Date limite de réponse invalide');
        checkValueCondition(isDateOrNull(dateConfirmation), 'Date de confirmation invalide');
        checkValueCondition(isDateOrNull(dateLimiteRetrait), 'Date limite de retrait invalide');
        checkValueCondition(isDateOrNull(dateCloture), 'Date de clôture invalide');

        checkValueCondition(FINAL_STATES.includes(statut) === (dateCloture !== null),
          'La date de clôture ne correspond pas au statut', { statut });

        checkValueCondition((dateConfirmation === null) === (dateLimiteRetrait === null),
          'Date de confirmation et date limite de retrait vont ensemble');

        checkValueCondition(!CONFIRMED_STATES.includes(statut) || dateConfirmation !== null,
          'Une réservation confirmée doit avoir une date de confirmation', { statut });

        const notConfirmed = [ReservationStatus.WAITING, ReservationStatus.REFUSED];
        checkValueCondition(!notConfirmed.includes(statut) || dateConfirmation === null,
          'Cette réservation ne peut pas avoir de date de confirmation', { statut });

        checkValueCondition(dateLimiteReponse > dateDemande, 'La date limite de réponse doit être après la demande');
        if (dateConfirmation) {
          checkValueCondition(dateConfirmation >= dateDemande, 'La confirmation doit être après la demande');
          checkValueCondition(dateLimiteRetrait > dateConfirmation, 'La date limite de retrait doit être après la confirmation');
        }
        if (dateCloture) {
          checkValueCondition(dateCloture >= dateDemande, 'La clôture doit être après la demande');
        }
    }

    constructor({
        id = null,
        patientId, pharmacieId, medicamentId,
        quantite,
        statut,
        dateDemande, 
        dateLimiteReponse,
        dateConfirmation = null, 
        dateLimiteRetrait = null,
        dateCloture = null, 
        motifRefus = null,
    }) {
        checkValueCondition(Number.isInteger(quantite) && quantite > 0, "Quantité invalide", { quantite });
        checkValueCondition(Object.values(ReservationStatus).includes(statut), 'Statut inconnu', { statut });

        const isRefused = statut === ReservationStatus.REFUSED;

        checkValueCondition(
          !isRefused || (typeof motifRefus === 'string' && motifRefus.trim() !== ''), 'Une réservation refusée doit avoir un motif', { statut }
        );

        checkValueCondition(
          isRefused || motifRefus === null, 'Seule une réservation refusée peut avoir un motif', { statut }
        );

        Reservation.#datesVerification({ statut, dateDemande, dateLimiteReponse, dateConfirmation, dateLimiteRetrait, dateCloture });

        checkValueCondition(isIdValid(patientId), "Patient invalide", { patientId });
        checkValueCondition(isIdValid(pharmacieId), "Pharmacie invalide", { pharmacieId });
        checkValueCondition(isIdValid(medicamentId), "Medicament invalide", { medicamentId });
        checkValueCondition(id === null || isIdValid(id), 'Identifiant de réservation invalide', { id });
        

        this.#id = id;
        this.#patientId = patientId;
        this.#pharmacieId = pharmacieId;
        this.#medicamentId = medicamentId;
        this.#quantite = quantite;
        this.#statut = statut;
        this.#dateDemande = dateDemande;
        this.#dateLimiteReponse = dateLimiteReponse;
        this.#dateConfirmation = dateConfirmation;
        this.#dateLimiteRetrait = dateLimiteRetrait;
        this.#dateCloture = dateCloture;
        this.#motifRefus = motifRefus;

    }

    get id() { return this.#id; }
    get patientId() { return this.#patientId; }
    get pharmacieId() { return this.#pharmacieId; }
    get medicamentId() { return this.#medicamentId; }
    get quantite() { return this.#quantite; }
    get statut() { return this.#statut; }
    get dateDemande() { return this.#dateDemande; }
    get dateLimiteReponse() { return this.#dateLimiteReponse; }
    get dateConfirmation() { return this.#dateConfirmation; }
    get dateLimiteRetrait() { return this.#dateLimiteRetrait; }
    get dateCloture() { return this.#dateCloture; }
    get motifRefus() { return this.#motifRefus; }

    assignId(id) {
        checkValueCondition(this.#id === null, 'Cette réservation a déjà un identifiant', { id: this.#id });
        checkValueCondition(isIdValid(id), 'Identifiant de réservation invalide', { id });
        this.#id = id;
    }
    
    toJSON() {
        return {
            id: this.#id,
            patientId: this.#patientId,
            pharmacieId: this.#pharmacieId,
            medicamentId: this.#medicamentId,
            quantite: this.#quantite,
            statut: this.#statut,
            dateDemande: this.#dateDemande,
            dateLimiteReponse: this.#dateLimiteReponse,
            dateConfirmation: this.#dateConfirmation,
            dateLimiteRetrait: this.#dateLimiteRetrait,
            dateCloture: this.#dateCloture,
            motifRefus: this.#motifRefus,
        };
    }
}

module.exports = Reservation;