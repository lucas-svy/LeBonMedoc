const { DonneesInvalides } = require("./errors");


class Prix {
    constructor(montant) {

        if (!this.estUnNombre) {
            throw new DonneesInvalides("Le montant renseigné n'est pas un nombre", this.montant)
        }

        if (!this.estPositif) {
            throw new DonneesInvalides("Le montant renseigné n'est pas positif", this.montant)
        }

        this.montant = montant;
    }

    estUnNombre() {
        return typeof this.montant === "int";
    }

    estPositif() {
        return this.montant > 0;
    }
}

module.exports = Prix;