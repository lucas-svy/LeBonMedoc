const createDatabase = require("./database");
const Medicament = require("../domain/Medicament");
const Pharmacien = require("../domain/Pharmacien");
const Pharmacie = require("../domain/Pharmacie");
const MedicationRepository = require("./MedicationRepository");
const PharmacistRepository = require("./PharmacistRepository");
const PharmacyRepository = require("./PharmacyRepository");

const pharmacyData = [
  {
    key: "central",
    nom: "Central Pharmacy",
    adresse: "10 rue de la Paix",
    ville: "Lyon",
    delaiReponseMinutes: 60,
    delaiRetraitMinutes: 1440,
  },
  {
    key: "riverside",
    nom: "Riverside Pharmacy",
    adresse: "20 avenue du Rhône",
    ville: "Lyon",
    delaiReponseMinutes: 90,
    delaiRetraitMinutes: 2880,
  },
  {
    key: "old-town",
    nom: "Old Town Pharmacy",
    adresse: "5 place des Terreaux",
    ville: "Lyon",
    delaiReponseMinutes: 120,
    delaiRetraitMinutes: 4320,
  },
];

const pharmacistData = [
  {
    pharmacyKey: "central",
    nom: "Smith",
    prenom: "Alice",
    email: "alice.smith@seed.example",
  },
  {
    pharmacyKey: "central",
    nom: "Johnson",
    prenom: "James",
    email: "james.johnson@seed.example",
  },
  {
    pharmacyKey: "riverside",
    nom: "Brown",
    prenom: "Olivia",
    email: "olivia.brown@seed.example",
  },
  {
    pharmacyKey: "riverside",
    nom: "Taylor",
    prenom: "Noah",
    email: "noah.taylor@seed.example",
  },
  {
    pharmacyKey: "old-town",
    nom: "Martin",
    prenom: "Ava",
    email: "ava.martin@seed.example",
  },
  {
    pharmacyKey: "old-town",
    nom: "Davis",
    prenom: "Ethan",
    email: "ethan.davis@seed.example",
  },
];

const medicationData = [
  {
    codeCIP: "0123456789012",
    nom: "Paracetamol",
    dosage: "500 mg",
    forme: "tablet",
    surOrdonnance: false,
  },
  {
    codeCIP: "0123456789013",
    nom: "Ibuprofen",
    dosage: "200 mg",
    forme: "tablet",
    surOrdonnance: false,
  },
  {
    codeCIP: "0123456789014",
    nom: "Amoxicillin",
    dosage: "500 mg",
    forme: "capsule",
    surOrdonnance: true,
  },
  {
    codeCIP: "0123456789015",
    nom: "Cetirizine",
    dosage: "10 mg",
    forme: "tablet",
    surOrdonnance: false,
  },
  {
    codeCIP: "0123456789016",
    nom: "Omeprazole",
    dosage: "20 mg",
    forme: "capsule",
    surOrdonnance: false,
  },
  {
    codeCIP: "0123456789017",
    nom: "Metformin",
    dosage: "500 mg",
    forme: "tablet",
    surOrdonnance: true,
  },
  {
    codeCIP: "0123456789018",
    nom: "Salbutamol",
    dosage: "100 mcg",
    forme: "inhaler",
    surOrdonnance: true,
  },
  {
    codeCIP: "0123456789019",
    nom: "Aspirin",
    dosage: "75 mg",
    forme: "tablet",
    surOrdonnance: false,
  },
  {
    codeCIP: "0123456789020",
    nom: "Loratadine",
    dosage: "10 mg",
    forme: "tablet",
    surOrdonnance: false,
  },
  {
    codeCIP: "0123456789021",
    nom: "Diclofenac",
    dosage: "50 mg",
    forme: "tablet",
    surOrdonnance: true,
  },
];

function seedDatabase(db) {
  const seed = db.transaction(() => {
    const pharmacyRepository = new PharmacyRepository(db);
    const pharmacistRepository = new PharmacistRepository(db);
    const medicationRepository = new MedicationRepository(db);

    const existingPharmacies = pharmacyRepository.findAll();
    const pharmaciesByKey = new Map();

    for (const pharmacyInfo of pharmacyData) {
      const existing = existingPharmacies.find(
        (pharmacy) =>
          pharmacy.nom === pharmacyInfo.nom &&
          pharmacy.adresse === pharmacyInfo.adresse,
      );
      const pharmacy = pharmacyRepository.save(
        new Pharmacie({
          ...pharmacyInfo,
          id: existing ? existing.id : null,
        }),
      );

      pharmaciesByKey.set(pharmacyInfo.key, pharmacy);
      if (!existing) {
        existingPharmacies.push(pharmacy);
      }
    }

    const existingPharmacists = pharmacistRepository.findAll();
    for (const pharmacistInfo of pharmacistData) {
      const pharmacy = pharmaciesByKey.get(pharmacistInfo.pharmacyKey);
      const existing = existingPharmacists.find(
        (pharmacist) => pharmacist.email === pharmacistInfo.email,
      );
      const pharmacist = pharmacistRepository.save(
        new Pharmacien({
          id: existing ? existing.id : null,
          pharmacieId: pharmacy.id,
          nom: pharmacistInfo.nom,
          prenom: pharmacistInfo.prenom,
          email: pharmacistInfo.email,
        }),
      );

      if (!existing) {
        existingPharmacists.push(pharmacist);
      }
    }

    const medications = [];
    for (const medicationInfo of medicationData) {
      const existing = medicationRepository.findByCipCode(
        medicationInfo.codeCIP,
      );
      const medication = medicationRepository.save(
        new Medicament({
          ...medicationInfo,
          id: existing ? existing.id : null,
        }),
      );

      medications.push(medication);
    }

    const saveAvailability = db.prepare(
      `INSERT INTO disponibilite (
        pharmacie_id, medicament_id, quantite_disponible, date_mise_a_jour
      ) VALUES (?, ?, ?, ?)
      ON CONFLICT(pharmacie_id, medicament_id) DO UPDATE SET
        quantite_disponible = excluded.quantite_disponible,
        date_mise_a_jour = excluded.date_mise_a_jour`,
    );
    const updatedAt = new Date().toISOString();
    let availabilityCount = 0;

    for (const pharmacy of pharmaciesByKey.values()) {
      for (const medication of medications) {
        saveAvailability.run(pharmacy.id, medication.id, 10, updatedAt);
        availabilityCount += 1;
      }
    }

    return {
      pharmacies: pharmaciesByKey.size,
      pharmacists: pharmacistData.length,
      medications: medications.length,
      availabilities: availabilityCount,
    };
  });

  return seed();
}

if (require.main === module) {
  const db = createDatabase();
  try {
    const summary = seedDatabase(db);
    console.log(
      `Seed complete: ${summary.pharmacies} pharmacies, ${summary.pharmacists} pharmacists, ${summary.medications} medications, ${summary.availabilities} availabilities.`,
    );
  } finally {
    db.close();
  }
}

module.exports = seedDatabase;
