const { Disponibilite } = require("../domain/Disponibilite");
const { PharmacieOuMedicamentIntrouvable } = require("../domain/errors");

const SQLITE_CONSTRAINT_FOREIGNKEY = 787;

const colonnesDisponibilite = `
  pharmacie_id AS pharmacieId,
  medicament_id AS medicamentId,
  quantite_disponible AS quantiteDisponible,
  date_mise_a_jour AS dateMiseAJour
`;

function hydraterDisponibilite(ligne) {
  return new Disponibilite({
    ...ligne,
    dateMiseAJour: new Date(ligne.dateMiseAJour),
  });
}

/** Chaque requête participe à la transaction éventuellement ouverte sur la connexion fournie. */
class DisponibiliteRepository {
  #chercherDisponibilite;
  #enregistrerDisponibilite;
  #chercherParPharmacie;
  #rechercherStocks;

  constructor(db) {
    db.function("minuscules", { deterministic: true }, (texte) => texte.toLowerCase());

    this.#chercherDisponibilite = db.prepare(`
      SELECT ${colonnesDisponibilite}
      FROM disponibilite
      WHERE pharmacie_id = ? AND medicament_id = ?
    `);

    this.#enregistrerDisponibilite = db.prepare(`
      INSERT INTO disponibilite (
        pharmacie_id, medicament_id, quantite_disponible, date_mise_a_jour
      ) VALUES (@pharmacieId, @medicamentId, @quantiteDisponible, @dateMiseAJour)
      ON CONFLICT (pharmacie_id, medicament_id) DO UPDATE SET
        quantite_disponible = excluded.quantite_disponible,
        date_mise_a_jour = excluded.date_mise_a_jour
    `);

    this.#chercherParPharmacie = db.prepare(`
      SELECT ${colonnesDisponibilite}
      FROM disponibilite
      WHERE pharmacie_id = ?
      ORDER BY medicament_id
    `);

    this.#rechercherStocks = db.prepare(`
      SELECT
        pharmacie.id AS pharmacieId,
        pharmacie.nom AS nomPharmacie,
        pharmacie.adresse,
        pharmacie.ville,
        medicament.id AS medicamentId,
        medicament.nom AS nomMedicament,
        medicament.sur_ordonnance AS surOrdonnance,
        stock.quantite_disponible AS quantiteDisponible
      FROM disponibilite AS stock
      JOIN pharmacie ON pharmacie.id = stock.pharmacie_id
      JOIN medicament ON medicament.id = stock.medicament_id
      WHERE stock.quantite_disponible > 0
        AND (stock.medicament_id = @medicamentId OR instr(minuscules(medicament.nom), @nom) > 0)
        AND (@ville IS NULL OR minuscules(pharmacie.ville) = @ville)
      ORDER BY pharmacie.id, medicament.id
    `);
  }

  find(pharmacieId, medicamentId) {
    const ligne = this.#chercherDisponibilite.get(pharmacieId, medicamentId);
    return ligne ? hydraterDisponibilite(ligne) : null;
  }

  save({ pharmacieId, medicamentId, quantiteDisponible, dateMiseAJour }) {
    try {
      this.#enregistrerDisponibilite.run({
        pharmacieId,
        medicamentId,
        quantiteDisponible,
        dateMiseAJour: new Date(dateMiseAJour).toISOString(),
      });
    } catch (error) {
      if (
        error.code === "SQLITE_CONSTRAINT_FOREIGNKEY" ||
        (error.code === "ERR_SQLITE_ERROR" && error.errcode === SQLITE_CONSTRAINT_FOREIGNKEY)
      ) {
        throw new PharmacieOuMedicamentIntrouvable({ cause: error });
      }
      throw error;
    }
  }

  findByPharmacie(pharmacieId) {
    return this.#chercherParPharmacie.all(pharmacieId).map(hydraterDisponibilite);
  }

  rechercher(medicament, ville) {
    const medicamentId = typeof medicament === "number" ? medicament : null;
    const nom = typeof medicament === "string" ? medicament.trim().toLowerCase() : "";

    const resultats = this.#rechercherStocks.all({
      medicamentId,
      nom: nom || null,
      ville: ville?.trim().toLowerCase() || null,
    });

    return resultats.map((resultat) => ({
      ...resultat,
      surOrdonnance: Boolean(resultat.surOrdonnance),
    }));
  }
}

module.exports = { DisponibiliteRepository };
