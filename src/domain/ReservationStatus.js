const ReservationStatus = Object.freeze({
  WAITING: 'WAITING',
  CONFIRMED: 'CONFIRMED',
  REFUSED: 'REFUSED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  PICKED_UP: 'PICKED_UP',
});

module.exports = ReservationStatus;