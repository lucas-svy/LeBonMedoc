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

function estIdValide(id) {
  return Number.isInteger(id) && id > 0;
}

module.exports = {
    verifier,
    estDateValide,
    estDateOuNull,
    estIdValide
}