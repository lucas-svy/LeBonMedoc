-- =============================================================
-- LeBonMédoc — schéma SQLite
-- Traduction du modèle du domaine (page Notion, point 6).
-- Exécuté au démarrage par db.js : CREATE TABLE IF NOT EXISTS.
-- Rappel : SQLite n'active pas les clés étrangères par défaut,
-- db.js doit exécuter "PRAGMA foreign_keys = ON" à chaque connexion.
-- =============================================================

PRAGMA foreign_keys = ON;

-- -------------------------------------------------------------
-- Patient
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patient (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nom         TEXT    NOT NULL CHECK (length(trim(nom)) > 0),
    prenom      TEXT    NOT NULL CHECK (length(trim(prenom)) > 0),
    email       TEXT    NOT NULL UNIQUE,
    telephone   TEXT
);

-- -------------------------------------------------------------
-- Pharmacie (partenaire)
-- Les délais sont propres à chaque pharmacie, en minutes.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pharmacie (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    nom                     TEXT    NOT NULL CHECK (length(trim(nom)) > 0),
    adresse                 TEXT    NOT NULL CHECK (length(trim(adresse)) > 0),
    ville                   TEXT    NOT NULL CHECK (length(trim(ville)) > 0),
    telephone               TEXT,
    horaires                TEXT,
    delai_reponse_minutes   INTEGER NOT NULL DEFAULT 120  CHECK (delai_reponse_minutes > 0),
    delai_retrait_minutes   INTEGER NOT NULL DEFAULT 2880 CHECK (delai_retrait_minutes > 0)
);

-- -------------------------------------------------------------
-- Pharmacien : rattaché à une seule pharmacie
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pharmacien (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    pharmacie_id    INTEGER NOT NULL REFERENCES pharmacie(id) ON DELETE CASCADE,
    nom             TEXT    NOT NULL CHECK (length(trim(nom)) > 0),
    prenom          TEXT    NOT NULL CHECK (length(trim(prenom)) > 0),
    email           TEXT    NOT NULL UNIQUE
);

-- -------------------------------------------------------------
-- Médicament : identifié par son code CIP (13 chiffres)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medicament (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    code_cip        TEXT    NOT NULL UNIQUE
                    CHECK (length(code_cip) = 13 AND code_cip NOT GLOB '*[^0-9]*'),
    nom             TEXT    NOT NULL CHECK (length(trim(nom)) > 0),
    dosage          TEXT    NOT NULL CHECK (length(trim(dosage)) > 0),
    forme           TEXT    NOT NULL,
    sur_ordonnance  INTEGER NOT NULL DEFAULT 0 CHECK (sur_ordonnance IN (0, 1))
);

-- -------------------------------------------------------------
-- Disponibilité : une seule par couple (pharmacie, médicament)
-- Invariant : quantite_disponible >= 0
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS disponibilite (
    pharmacie_id        INTEGER NOT NULL REFERENCES pharmacie(id)  ON DELETE CASCADE,
    medicament_id       INTEGER NOT NULL REFERENCES medicament(id) ON DELETE CASCADE,
    quantite_disponible INTEGER NOT NULL CHECK (quantite_disponible >= 0),
    date_mise_a_jour    TEXT    NOT NULL,
    PRIMARY KEY (pharmacie_id, medicament_id)
);

-- -------------------------------------------------------------
-- Réservation : suit une demande tout au long de son cycle de vie
-- Invariants :
--   - quantite > 0
--   - statut limité aux 6 valeurs de StatutReservation
--   - motif_refus obligatoire si REFUSEE
--   - date_confirmation renseignée si CONFIRMEE ou RETIREE
--   - date_cloture renseignée si et seulement si l'état est final
-- Les transitions elles-mêmes sont contrôlées par le domaine.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reservation (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id           INTEGER NOT NULL REFERENCES patient(id),
    pharmacie_id         INTEGER NOT NULL REFERENCES pharmacie(id),
    medicament_id        INTEGER NOT NULL REFERENCES medicament(id),
    quantite             INTEGER NOT NULL CHECK (quantite > 0),
    statut               TEXT    NOT NULL DEFAULT 'EN_ATTENTE'
                         CHECK (statut IN ('EN_ATTENTE', 'CONFIRMEE', 'REFUSEE',
                                           'EXPIREE', 'ANNULEE', 'RETIREE')),
    date_demande         TEXT    NOT NULL,
    date_limite_reponse  TEXT    NOT NULL,
    date_confirmation    TEXT,
    date_limite_retrait  TEXT,
    date_cloture         TEXT,
    motif_refus          TEXT,

    CHECK (statut <> 'REFUSEE'
           OR (motif_refus IS NOT NULL AND length(trim(motif_refus)) > 0)),
    CHECK (statut NOT IN ('CONFIRMEE', 'RETIREE')
           OR (date_confirmation IS NOT NULL AND date_limite_retrait IS NOT NULL)),
    CHECK ((statut IN ('EN_ATTENTE', 'CONFIRMEE')) = (date_cloture IS NULL))
);

-- -------------------------------------------------------------
-- Index
-- -------------------------------------------------------------
-- Recherche patient : où trouver ce médicament
CREATE INDEX IF NOT EXISTS idx_disponibilite_medicament
    ON disponibilite (medicament_id);

-- Réservations en cours d'une pharmacie
CREATE INDEX IF NOT EXISTS idx_reservation_pharmacie_statut
    ON reservation (pharmacie_id, statut);

-- Réservations d'un patient
CREATE INDEX IF NOT EXISTS idx_reservation_patient
    ON reservation (patient_id);

-- Tâche d'expiration : réservations encore ouvertes
CREATE INDEX IF NOT EXISTS idx_reservation_statut
    ON reservation (statut);

-- Recherche de médicament par nom
CREATE INDEX IF NOT EXISTS idx_medicament_nom
    ON medicament (nom);