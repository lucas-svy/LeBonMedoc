const Reservation = require("../../src/domain/Reservation");
const DatesReservation = require("../../src/domain/DatesReservation");
const StatutReservation = require("../../src/domain/StatutReservation");
const { DonneesInvalides } = require("../../src/domain/errors");

// Dates fixes : jamais de new Date() dans les tests.
const T = (h) => new Date(`2026-01-01T${h}:00Z`);

// Un objet DatesReservation valide ; on peut changer ce qu'on veut.
function datesValides(modifs = {}) {
  return new DatesReservation({
    dateDemande: T("10:00"),
    dateLimiteReponse: T("12:00"),
    dateConfirmation: null,
    dateLimiteRetrait: null,
    dateCloture: null,
    ...modifs,
  });
}

const confirmation = { dateConfirmation: T("11:00"), dateLimiteRetrait: T("23:00") };
const cloture = { dateCloture: T("13:00") };

// Données valides d'une réservation EN_ATTENTE ; chaque test ne casse qu'une chose.
function donneesValides(modifs = {}) {
  return {
    id: null,
    patientId: 1,
    pharmacieId: 2,
    medicamentId: 3,
    quantite: 2,
    statut: StatutReservation.EN_ATTENTE,
    dates: datesValides(),
    motifRefus: null,
    ...modifs,
  };
}

describe("Reservation - construction valide", () => {
  test("crée une réservation en attente", () => {
    const r = new Reservation(donneesValides());
    expect(r.id).toBeNull();
    expect(r.patientId).toBe(1);
    expect(r.pharmacieId).toBe(2);
    expect(r.medicamentId).toBe(3);
    expect(r.quantite).toBe(2);
    expect(r.statut).toBe(StatutReservation.EN_ATTENTE);
    expect(r.motifRefus).toBeNull();
  });

  test("accepte un identifiant (reconstruction depuis la base)", () => {
    expect(new Reservation(donneesValides({ id: 42 })).id).toBe(42);
  });

  test.each([
    ["CONFIRMEE", StatutReservation.CONFIRMEE, confirmation],
    ["RETIREE", StatutReservation.RETIREE, { ...confirmation, ...cloture }],
    ["EXPIREE (en attente)", StatutReservation.EXPIREE, cloture],
    ["EXPIREE (confirmée)", StatutReservation.EXPIREE, { ...confirmation, ...cloture }],
    ["ANNULEE (en attente)", StatutReservation.ANNULEE, cloture],
    ["ANNULEE (confirmée)", StatutReservation.ANNULEE, { ...confirmation, ...cloture }],
  ])("accepte le statut %s avec des dates cohérentes", (_nom, statut, modifsDates) => {
    expect(
      () => new Reservation(donneesValides({ statut, dates: datesValides(modifsDates) })),
    ).not.toThrow();
  });

  test("accepte une réservation refusée avec un motif", () => {
    const r = new Reservation(donneesValides({
      statut: StatutReservation.REFUSEE,
      dates: datesValides(cloture),
      motifRefus: "Médicament indisponible",
    }));
    expect(r.motifRefus).toBe("Médicament indisponible");
  });

  test("expose les dates", () => {
    const dates = datesValides();
    expect(new Reservation(donneesValides({ dates })).dates).toBe(dates);
  });
});

describe("Reservation - données invalides", () => {
  test.each([0, -1, 1.5, "2", null, undefined])("refuse la quantité %p", (quantite) => {
    expect(() => new Reservation(donneesValides({ quantite }))).toThrow(DonneesInvalides);
  });

  test.each(["WAITING", "", null, undefined])("refuse le statut inconnu %p", (statut) => {
    expect(() => new Reservation(donneesValides({ statut }))).toThrow(DonneesInvalides);
  });

  test.each([0, -1, 1.5, "1", null, undefined])("refuse un patientId %p", (patientId) => {
    expect(() => new Reservation(donneesValides({ patientId }))).toThrow(DonneesInvalides);
  });

  test.each([0, -1, 1.5, "1", null, undefined])("refuse un pharmacieId %p", (pharmacieId) => {
    expect(() => new Reservation(donneesValides({ pharmacieId }))).toThrow(DonneesInvalides);
  });

  test.each([0, -1, 1.5, "1", null, undefined])("refuse un medicamentId %p", (medicamentId) => {
    expect(() => new Reservation(donneesValides({ medicamentId }))).toThrow(DonneesInvalides);
  });

  test.each([0, -1, 1.5, "1"])("refuse un id %p", (id) => {
    expect(() => new Reservation(donneesValides({ id }))).toThrow(DonneesInvalides);
  });

  test.each([undefined, null, {}, { dateDemande: T("10:00") }])(
    "refuse des dates qui ne sont pas une DatesReservation (%p)",
    (dates) => {
      expect(() => new Reservation(donneesValides({ dates }))).toThrow(DonneesInvalides);
    },
  );
});

describe("Reservation - motif de refus", () => {
  const refusee = { statut: StatutReservation.REFUSEE, dates: datesValides(cloture) };

  test.each([null, undefined, "", "   "])("refuse une réservation refusée avec le motif %p", (motifRefus) => {
    expect(() => new Reservation(donneesValides({ ...refusee, motifRefus }))).toThrow(DonneesInvalides);
  });

  test.each([
    ["EN_ATTENTE", StatutReservation.EN_ATTENTE, {}],
    ["CONFIRMEE", StatutReservation.CONFIRMEE, confirmation],
    ["ANNULEE", StatutReservation.ANNULEE, cloture],
  ])("refuse un motif de refus sur une réservation %s", (_nom, statut, modifsDates) => {
    expect(
      () => new Reservation(donneesValides({ statut, dates: datesValides(modifsDates), motifRefus: "Un motif" })),
    ).toThrow(DonneesInvalides);
  });
});

describe("Reservation - cohérence statut / dates (règle 8)", () => {
  test.each([
    ["EN_ATTENTE", StatutReservation.EN_ATTENTE],
    ["CONFIRMEE", StatutReservation.CONFIRMEE],
  ])("refuse une date de clôture sur un statut non final (%s)", (_nom, statut) => {
    const modifs = statut === StatutReservation.CONFIRMEE ? { ...confirmation, ...cloture } : cloture;
    expect(
      () => new Reservation(donneesValides({ statut, dates: datesValides(modifs) })),
    ).toThrow(DonneesInvalides);
  });

  test.each([
    ["REFUSEE", StatutReservation.REFUSEE, { motifRefus: "Indisponible" }],
    ["EXPIREE", StatutReservation.EXPIREE, {}],
    ["ANNULEE", StatutReservation.ANNULEE, {}],
    ["RETIREE", StatutReservation.RETIREE, {}],
  ])("refuse un statut final sans date de clôture (%s)", (_nom, statut, extra) => {
    expect(
      () => new Reservation(donneesValides({ statut, dates: datesValides(statut === StatutReservation.RETIREE ? confirmation : {}), ...extra })),
    ).toThrow(DonneesInvalides);
  });

  test.each([
    ["CONFIRMEE", StatutReservation.CONFIRMEE, {}],
    ["RETIREE", StatutReservation.RETIREE, cloture],
  ])("refuse une réservation %s sans date de confirmation", (_nom, statut, modifsDates) => {
    expect(
      () => new Reservation(donneesValides({ statut, dates: datesValides(modifsDates) })),
    ).toThrow(DonneesInvalides);
  });

  test.each([
    ["EN_ATTENTE", StatutReservation.EN_ATTENTE, confirmation, null],
    ["REFUSEE", StatutReservation.REFUSEE, { ...confirmation, ...cloture }, "Indisponible"],
  ])("refuse une date de confirmation sur une réservation %s", (_nom, statut, modifsDates, motifRefus) => {
    expect(
      () => new Reservation(donneesValides({ statut, dates: datesValides(modifsDates), motifRefus })),
    ).toThrow(DonneesInvalides);
  });
});

describe("Reservation - assignId", () => {
  test("attribue un identifiant une seule fois", () => {
    const r = new Reservation(donneesValides());
    r.assignId(5);
    expect(r.id).toBe(5);
    expect(() => r.assignId(6)).toThrow(DonneesInvalides);
    expect(r.id).toBe(5);
  });

  test("refuse un identifiant invalide", () => {
    const r = new Reservation(donneesValides());
    expect(() => r.assignId(0)).toThrow(DonneesInvalides);
    expect(() => r.assignId("5")).toThrow(DonneesInvalides);
    expect(r.id).toBeNull();
  });

  test("refuse un identifiant sur une réservation qui en a déjà un", () => {
    const r = new Reservation(donneesValides({ id: 1 }));
    expect(() => r.assignId(2)).toThrow(DonneesInvalides);
  });
});

describe("Reservation - toJSON", () => {
  test("sérialise la réservation avec ses dates", () => {
    const r = new Reservation(donneesValides({ id: 7 }));
    expect(r.toJSON()).toEqual({
      id: 7,
      patientId: 1,
      pharmacieId: 2,
      medicamentId: 3,
      quantite: 2,
      statut: StatutReservation.EN_ATTENTE,
      dateDemande: T("10:00"),
      dateLimiteReponse: T("12:00"),
      dateConfirmation: null,
      dateLimiteRetrait: null,
      dateCloture: null,
      motifRefus: null,
    });
  });
});
