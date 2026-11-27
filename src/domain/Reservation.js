const { DonneesInvalides, ReservationNonConfirmee, ReservationExpiree, ReservationNonExpiree, TransitionInterdite } = require("./errors");
const StatutReservation = require("./StatutReservation");
const DatesReservation = require("./DatesReservation");
const { verifier, estIdValide } = require("./Validations");
const { STATUTS_FINAUX, STATUTS_CONFIRMES, STATUTS_JAMAIS_CONFIRMES, TRANSITIONS } = require("./TransitionsReservation");

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
        Reservation.#verifierChamps({ id, patientId, pharmacieId, medicamentId, quantite, statut });
        Reservation.#verifierMotifRefus(statut, motifRefus);
        Reservation.#verifierCoherenceStatutDates(statut, dates);

        this.#id = id;
        this.#patientId = patientId;
        this.#pharmacieId = pharmacieId;
        this.#medicamentId = medicamentId;
        this.#quantite = quantite;
        this.#statut = statut;
        this.#dates = dates;
        this.#motifRefus = motifRefus;
    }

    static creer({
      patientId, 
      pharmacieId, 
      medicamentId, 
      quantite, 
      maintenant, 
      delaiReponseMinutes
    }) {
      return new Reservation({
        id: null,
        patientId: patientId,
        pharmacieId: pharmacieId,
        medicamentId: medicamentId,
        quantite: quantite,
        statut: StatutReservation.EN_ATTENTE,
        dates: DatesReservation.nouvelle(maintenant, delaiReponseMinutes),
        motifRefus: null
      })
    }


    get id() { return this.#id; }
    get patientId() { return this.#patientId; }
    get pharmacieId() { return this.#pharmacieId; }
    get medicamentId() { return this.#medicamentId; }
    get quantite() { return this.#quantite; }
    get statut() { return this.#statut; }
    get dates() { return this.#dates; }
    get motifRefus() { return this.#motifRefus; }
    

    #verifierTransition(nouveau) {
      if (!TRANSITIONS[this.#statut].includes(nouveau)) {
        throw new TransitionInterdite(
          `Transition interdite : ${this.#statut} -> ${nouveau}`,
          { de: this.#statut, vers: nouveau },
        );
      }
    }

    #changerStatut(nouveau) {
      this.#verifierTransition(nouveau);
      this.#statut = nouveau;
    }

    confirmer(maintenant, delaiRetraitMinutes) {
      this.#verifierTransition(StatutReservation.CONFIRMEE);
      if (this.#dates.reponseDepassee(maintenant)) {
        throw new ReservationExpiree("La date limite de réponse est dépassée", {dateLimiteReponse: this.#dates.dateLimiteReponse, maintenant});
      }
      const nouvellesDates = this.#dates.confirmer(maintenant, delaiRetraitMinutes);
      this.#changerStatut(StatutReservation.CONFIRMEE);
      this.#dates = nouvellesDates;
    }

    static #verifierChamps({ id, patientId, pharmacieId, medicamentId, quantite, statut }) {
        verifier(Number.isInteger(quantite) && quantite > 0, "Quantité invalide", { quantite });
        verifier(Object.values(StatutReservation).includes(statut), 'Statut inconnu', { statut });

        verifier(estIdValide(patientId), "Patient invalide", { patientId });
        verifier(estIdValide(pharmacieId), "Pharmacie invalide", { pharmacieId });
        verifier(estIdValide(medicamentId), "Medicament invalide", { medicamentId });
        verifier(id === null || estIdValide(id), 'Identifiant de réservation invalide', { id });
    }

    static #verifierMotifRefus(statut, motifRefus) {
        const estRefusee = statut === StatutReservation.REFUSEE;

        verifier(
          !estRefusee || (typeof motifRefus === 'string' && motifRefus.trim() !== ''), 'Une réservation refusée doit avoir un motif', { statut }
        );

        verifier(
          estRefusee || motifRefus === null, 'Seule une réservation refusée peut avoir un motif', { statut }
        );
    }

    static #verifierCoherenceStatutDates(statut, dates) {
        verifier(dates instanceof DatesReservation, 'Dates de réservation invalides');

        verifier(STATUTS_FINAUX.includes(statut) === (dates.dateCloture !== null),
          'La date de clôture ne correspond pas au statut', { statut });

        verifier(!STATUTS_CONFIRMES.includes(statut) || dates.dateConfirmation !== null,
          'Une réservation confirmée doit avoir une date de confirmation', { statut });

        verifier(!STATUTS_JAMAIS_CONFIRMES.includes(statut) || dates.dateConfirmation === null,
          'Cette réservation ne peut pas avoir de date de confirmation', { statut });
    }




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

    // À écrire :
    // confirmer(), refuser(), annuler(), marquerRetiree(), expirer(), estExpiree().

}

module.exports = Reservation;