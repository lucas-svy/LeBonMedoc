const { DonneesInvalides } = require("./errors");
const FormesMedicament = require("./FormesMedicament");
const Unites = require("./Unites");

class Dosage {
    constructor({forme, unite, quantite}) {

        if (!Object.values(FormesMedicament).includes(forme) || forme === null) {
            throw new DonneesInvalides("Forme invalide")
        }

        if (!Object.values(Unites).includes(unite) || unite === null) {
            throw new DonneesInvalides("Unité invalide")
        }

        if (!this.estPositif(quantite) || quantite === null) {
            throw new DonneesInvalides("La quantité doit être supérieur à 0")
        }

        this.forme = forme;
        this.unite = unite;
        this.quantite = quantite;
    }

    estPositif(number) {
        return number > 0;
    }
}

module.exports = Dosage;