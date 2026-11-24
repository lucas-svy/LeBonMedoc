const express = require("express");
const { errorHandler } = require("./api/errorHandler");
const { creerDisponibilitesRouter } = require("./api/disponibilites.routes");
const { DisponibiliteService } = require("./application/DisponibiliteService");
const { RechercheService } = require("./application/RechercheService");
const { ouvrirBase, initialiserSchema } = require("./infrastructure/db");
const { DisponibiliteRepository } = require("./infrastructure/Repository");

function creerApp(db) {
  initialiserSchema(db);

  const disponibiliteRepository = new DisponibiliteRepository(db);
  const disponibiliteService = new DisponibiliteService(disponibiliteRepository);
  const rechercheService = new RechercheService(disponibiliteRepository);

  const app = express();
  app.use(express.json());
  app.use(creerDisponibilitesRouter({ disponibiliteService, rechercheService }));
  app.use(errorHandler);
  return app;
}

if (require.main === module) {
  const db = ouvrirBase(process.env.DB_PATH);
  const port = Number(process.env.PORT ?? 3000);
  const serveur = creerApp(db).listen(port, "127.0.0.1", () => {
    console.log(`LeBonMédoc écoute sur http://127.0.0.1:${serveur.address().port}`);
  });
}

module.exports = { creerApp };
