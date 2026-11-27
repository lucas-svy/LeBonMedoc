const assert = require("node:assert/strict");
const { mkdtempSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const { executerDansTransaction, initialiserSchema, ouvrirBase } = require("../../src/infrastructure/db");
const { DisponibiliteRepository } = require("../../src/infrastructure/Repository");

const declaration = new Date("2026-01-01T10:00:00Z");
const confirmation = new Date("2026-01-01T10:30:00Z");

describe("DisponibiliteRepository dans une transaction SQLite", () => {
  let dossier;
  let chemin;
  let db;
  let depot;

  beforeEach(() => {
    dossier = mkdtempSync(join(tmpdir(), "lebonmedoc-"));
    chemin = join(dossier, "test.sqlite");
    db = ouvrirBase(chemin);
    initialiserSchema(db);
    depot = new DisponibiliteRepository(db);

    db.exec(`
      INSERT INTO pharmacie (id, nom, adresse, ville) VALUES (1, 'Centre', '1 rue du Centre', 'Paris');
      INSERT INTO medicament (id, code_cip, nom, dosage, forme)
      VALUES (1, '1234567890123', 'Paracetamol', '500 mg', 'comprime');
      INSERT INTO patient (id, nom, prenom, email) VALUES (1, 'Test', 'Camille', 'test@example.com');
      INSERT INTO reservation (id, patient_id, pharmacie_id, medicament_id, quantite, date_demande, date_limite_reponse)
      VALUES (1, 1, 1, 1, 1, '2026-01-01T10:00:00.000Z', '2026-01-01T11:00:00.000Z');
    `);
    db.prepare("INSERT INTO disponibilite VALUES (1, 1, 1, ?)").run(declaration.toISOString());
  });

  afterEach(() => {
    db?.close();
    rmSync(dossier, { recursive: true, force: true });
  });

  test("valide ensemble l'écriture du stock et celle de la réservation", () => {
    const reste = executerDansTransaction(db, () => {
      const stock = depot.find(1, 1);
      stock.retirer(1, confirmation);
      depot.save(stock);
      db.prepare(`
        UPDATE reservation SET statut = 'CONFIRMEE', date_confirmation = ?, date_limite_retrait = ? WHERE id = 1
      `).run(confirmation.toISOString(), "2026-01-02T10:30:00.000Z");
      return stock.quantiteDisponible;
    });

    assert.equal(reste, 0);
    assert.equal(depot.find(1, 1).quantiteDisponible, 0);
    assert.deepEqual(depot.find(1, 1).dateMiseAJour, confirmation);
    assert.equal(db.prepare("SELECT statut FROM reservation WHERE id = 1").get().statut, "CONFIRMEE");
  });

  test("annule l'écriture du stock si l'écriture de la réservation échoue", () => {
    assert.throws(() => executerDansTransaction(db, () => {
      const stock = depot.find(1, 1);
      stock.retirer(1, confirmation);
      depot.save(stock);
      db.exec("UPDATE reservation SET statut = 'CONFIRMEE' WHERE id = 1");
    }), /CHECK constraint failed/);

    assert.equal(depot.find(1, 1).quantiteDisponible, 1);
    assert.deepEqual(depot.find(1, 1).dateMiseAJour, declaration);
    assert.equal(db.prepare("SELECT statut FROM reservation WHERE id = 1").get().statut, "EN_ATTENTE");
    assert.equal(db.isTransaction, false);
  });

  test("prend le verrou d'écriture avant la lecture du stock", () => {
    const autreDb = ouvrirBase(chemin);
    try {
      autreDb.exec("PRAGMA busy_timeout = 0");
      const autreDepot = new DisponibiliteRepository(autreDb);

      executerDansTransaction(db, () => {
        const stock = depot.find(1, 1);
        assert.throws(() => executerDansTransaction(autreDb, () => {
          assert.fail("La seconde transaction ne doit pas commencer pendant la première.");
        }), { errcode: 5 });
        stock.retirer(1, confirmation);
        depot.save(stock);
      });

      const stock = executerDansTransaction(autreDb, () => autreDepot.find(1, 1));
      assert.equal(stock.quantiteDisponible, 0);
    } finally {
      autreDb.close();
    }
  });
});
