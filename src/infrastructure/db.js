const { readFileSync } = require("node:fs");
const { join } = require("node:path");

function ouvrirBase(chemin = join(__dirname, "..", "..", "lebonmedoc.sqlite")) {
  const { DatabaseSync } = require("node:sqlite");
  return new DatabaseSync(chemin);
}

function initialiserSchema(db) {
  db.exec(readFileSync(join(__dirname, "schema.sql"), "utf8"));
}

/** Exécute une opération synchrone avec les dépôts construits sur la connexion db. */
function executerDansTransaction(db, operation) {
  db.exec("BEGIN IMMEDIATE");

  try {
    const resultat = operation();
    if (typeof resultat?.then === "function") {
      throw new TypeError("L’opération transactionnelle doit être synchrone.");
    }
    db.exec("COMMIT");
    return resultat;
  } catch (erreur) {
    if ((db.isTransaction ?? db.inTransaction) !== false) {
      try {
        db.exec("ROLLBACK");
      } catch (erreurAnnulation) {
        throw new AggregateError([erreur, erreurAnnulation], "L’annulation de la transaction a échoué.");
      }
    }
    throw erreur;
  }
}

module.exports = { ouvrirBase, initialiserSchema, executerDansTransaction };
