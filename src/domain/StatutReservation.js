// Mêmes valeurs que dans schema.sql (contrainte CHECK sur reservation.statut).
const StatutReservation = Object.freeze({
  EN_ATTENTE: 'EN_ATTENTE',
  CONFIRMEE: 'CONFIRMEE',
  REFUSEE: 'REFUSEE',
  EXPIREE: 'EXPIREE',
  ANNULEE: 'ANNULEE',
  RETIREE: 'RETIREE',
});

module.exports = StatutReservation;
