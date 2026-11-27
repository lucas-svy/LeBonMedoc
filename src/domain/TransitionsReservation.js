const StatutReservation = require("./StatutReservation");

const TRANSITIONS = Object.freeze({
  [StatutReservation.EN_ATTENTE]: [
    StatutReservation.CONFIRMEE,
    StatutReservation.REFUSEE,
    StatutReservation.EXPIREE,
    StatutReservation.ANNULEE,
  ],
  [StatutReservation.CONFIRMEE]: [
    StatutReservation.RETIREE,
    StatutReservation.EXPIREE,
    StatutReservation.ANNULEE,
  ],
  [StatutReservation.REFUSEE]: [],
  [StatutReservation.EXPIREE]: [],
  [StatutReservation.ANNULEE]: [],
  [StatutReservation.RETIREE]: [],
});

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

module.exports = {
    TRANSITIONS,
    STATUTS_FINAUX,
    STATUTS_CONFIRMES,
    STATUTS_JAMAIS_CONFIRMES
}