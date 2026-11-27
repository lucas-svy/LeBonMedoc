const { DonneesInvalides, ReservationNonConfirmee, ReservationExpiree, ReservationNonExpiree, TransitionInterdite } = require("./errors");
const StatutReservation = require("./StatutReservation");
const DatesReservation = require("./DatesReservation");


const STATUTS_FINAUX = [
  StatutReservation.REFUSEE,
  StatutReservation.EXPIREE,
  StatutReservation.ANNULEE,
  StatutReservation.RETIREE,
];

const STATUTS_CONFIRMES = [
  StatutReservation.CONFIRMEE,
  StatutReservation.RETIREE,
];

const STATUTS_JAMAIS_CONFIRMES = [
  StatutReservation.EN_ATTENTE,
  StatutReservation.REFUSEE,
];


function verifier(condition, message, details) {
  if (!condition) throw new DonneesInvalides(message, details);
}

function estDateValide(d) {
  return d instanceof Date && !isNaN(d.getTime());
}

function estDateOuNull(d) {
  return d === null || estDateValide(d);
}

function estIdValide(id) {
  return Number.isInteger(id) && id > 0;
}


class Reservation {

    #id;
    #patientId;
    #pharmacieId;
    #medicamentId;
    #quantite;
    #statut;
    #dates;
    #motifRefus;

    constructor({
        id = null,
        patientId, pharmacieId, medicamentId,
        quantite,
        statut,
        dates,
        motifRefus = null,
    }) {
        verifier(Number.isInteger(quantite) && quantite > 0, "Quantité invalide", { quantite });
        verifier(Object.values(StatutReservation).includes(statut), 'Statut inconnu', { statut });

        const estRefusee = statut === StatutReservation.REFUSEE;

        verifier(
          !estRefusee || (typeof motifRefus === 'string' && motifRefus.trim() !== ''), 'Une réservation refusée doit avoir un motif', { statut }
        );

        verifier(
          estRefusee || motifRefus === null, 'Seule une réservation refusée peut avoir un motif', { statut }
        );

        verifier(estIdValide(patientId), "Patient invalide", { patientId });
        verifier(estIdValide(pharmacieId), "Pharmacie invalide", { pharmacieId });
        verifier(estIdValide(medicamentId), "Medicament invalide", { medicamentId });
        verifier(id === null || estIdValide(id), 'Identifiant de réservation invalide', { id });

        verifier(dates instanceof DatesReservation, 'Dates de réservation invalides');

        verifier(STATUTS_FINAUX.includes(statut) === (dates.dateCloture !== null),
          'La date de clôture ne correspond pas au statut', { statut });

        verifier(!STATUTS_CONFIRMES.includes(statut) || dates.dateConfirmation !== null,
          'Une réservation confirmée doit avoir une date de confirmation', { statut });

        verifier(!STATUTS_JAMAIS_CONFIRMES.includes(statut) || dates.dateConfirmation === null,
          'Cette réservation ne peut pas avoir de date de confirmation', { statut });

        this.#id = id;
        this.#patientId = patientId;
        this.#pharmacieId = pharmacieId;
        this.#medicamentId = medicamentId;
        this.#quantite = quantite;
        this.#statut = statut;
        this.#dates = dates;
        this.#motifRefus = motifRefus;

    }

    get id() { return this.#id; }
    get patientId() { return this.#patientId; }
    get pharmacieId() { return this.#pharmacieId; }
    get medicamentId() { return this.#medicamentId; }
    get quantite() { return this.#quantite; }
    get statut() { return this.#statut; }
    get dates() { return this.#dates; }
    get motifRefus() { return this.#motifRefus; }

    assignId(id) {
        verifier(this.#id === null, 'Cette réservation a déjà un identifiant', { id: this.#id });
        verifier(estIdValide(id), 'Identifiant de réservation invalide', { id });
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
            dateDemande: this.#dates.dateDemande,
            dateLimiteReponse: this.#dates.dateLimiteReponse,
            dateConfirmation: this.#dates.dateConfirmation,
            dateLimiteRetrait: this.#dates.dateLimiteRetrait,
            dateCloture: this.#dates.dateCloture,
            motifRefus: this.#motifRefus,
        };
    }

    // À écrire : table des transitions, #changerStatut, creer(),
    // confirmer(), refuser(), annuler(), marquerRetiree(), expirer(), estExpiree().

}

module.exports = Reservation;