const { DonneesInvalides } = require("./errors");

class Prix {
  constructor(montantEuros) {
    if (!Number.isFinite(montantEuros) || montantEuros <= 0) {
      throw new DonneesInvalides("Le montant doit être un nombre fini et strictement positif.");
    }

    const montantCentimes = montantEuros * 100;
    const montantArrondi = Math.round(montantCentimes); //Permet de gérer les problèmes d'arrondi potentiels
    const tolerance = Number.EPSILON * Math.max(1, Math.abs(montantCentimes)) * 4; //Permet à distinguer un écart dû à l'arrondi d'un vrai montant avec une fraction de centime  //Empêche d’utiliser un arrondi pour accepter une vraie fraction de centime.

    if (!Number.isSafeInteger(montantArrondi) || Math.abs(montantCentimes - montantArrondi) > tolerance) {
      throw new DonneesInvalides("Le montant ne peut pas contenir de fraction de centime.");
    }
    this.montant = montantArrondi;
  }

  estUnNombre() {
    return Number.isSafeInteger(this.montant);
  }

  estPositif() {
    return this.montant > 0;
  }
}

module.exports = Prix;