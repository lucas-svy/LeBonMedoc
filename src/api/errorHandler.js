const { DonneesInvalides, PharmacieOuMedicamentIntrouvable } = require("../domain/errors");

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof DonneesInvalides) {
    return res.status(400).json({ erreur: error.message });
  }
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ erreur: "Le corps de la requête doit être un JSON valide." });
  }
  if (error instanceof PharmacieOuMedicamentIntrouvable) {
    return res.status(404).json({ erreur: error.message });
  }

  const status = error.status;
  if (Number.isInteger(status) && status >= 400 && status < 500) {
    return res.status(status).json({ erreur: "La requête est invalide." });
  }

  console.error(error);
  return res.status(500).json({ erreur: "Une erreur interne est survenue." });
}

module.exports = { errorHandler };
