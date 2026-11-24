const express = require("express");
const { DonneesInvalides, DisponibiliteInsuffisante } = require("../domain/errors");

const cheminDisponibilitesPharmacie = "/pharmacies/:id/disponibilites";

function lireIdentifiant(valeur, champ) {
  const identifiant = Number(valeur);
  if (!/^\d+$/.test(valeur) || !Number.isSafeInteger(identifiant) || identifiant < 1) {
    throw new DonneesInvalides(`${champ} doit être un identifiant entier positif.`);
  }
  return identifiant;
}

function creerDisponibilitesRouter({ disponibiliteService, rechercheService }) {
  const router = express.Router();

  router.put(`${cheminDisponibilitesPharmacie}/:medicamentId`, (req, res) => {
    const pharmacieId = lireIdentifiant(req.params.id, "L’identifiant de pharmacie");
    const medicamentId = lireIdentifiant(req.params.medicamentId, "L’identifiant de médicament");
    const disponibilite = disponibiliteService.mettreAJour(pharmacieId, medicamentId, req.body?.quantite);
    res.json(disponibilite);
  });

  router.get(cheminDisponibilitesPharmacie, (req, res) => {
    const pharmacieId = lireIdentifiant(req.params.id, "L’identifiant de pharmacie");
    res.json(disponibiliteService.listerPourPharmacie(pharmacieId));
  });

  router.get("/disponibilites", (req, res) => {
    const { medicament, ville } = req.query;
    if (typeof medicament !== "string" || !medicament.trim()) {
      throw new DonneesInvalides("Le paramètre medicament doit contenir un identifiant ou un nom.");
    }
    if (ville !== undefined && typeof ville !== "string") {
      throw new DonneesInvalides("Le paramètre ville doit contenir un seul nom.");
    }

    const terme = medicament.trim();
    const recherche = /^\d+$/.test(terme) ? lireIdentifiant(terme, "Le médicament") : terme;
    try {
      res.json(rechercheService.rechercher(recherche, { ville }));
    } catch (error) {
      if (!(error instanceof DisponibiliteInsuffisante)) throw error;
      res.json([]);
    }
  });

  return router;
}

module.exports = { creerDisponibilitesRouter };
