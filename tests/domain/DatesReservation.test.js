const DatesReservation = require("../../src/domain/DatesReservation");
const { DonneesInvalides } = require("../../src/domain/errors");

// Dates fixes : jamais de new Date() dans les tests (résultat toujours identique).
const T = (h) => new Date(`2026-01-01T${h}:00Z`);

// Données valides ; chaque test ne change que ce qu'il veut casser.
function donneesValides(modifs = {}) {
  return {
    dateDemande: T("10:00"),
    dateLimiteReponse: T("12:00"),
    dateConfirmation: null,
    dateLimiteRetrait: null,
    dateCloture: null,
    ...modifs,
  };
}

const confirmation = { dateConfirmation: T("11:00"), dateLimiteRetrait: T("23:00") };

describe("DatesReservation - construction", () => {
  test("accepte des dates valides (demande seule)", () => {
    expect(() => new DatesReservation(donneesValides())).not.toThrow();
  });

  test("accepte des dates valides avec confirmation et clôture", () => {
    expect(
      () => new DatesReservation(donneesValides({ ...confirmation, dateCloture: T("13:00") })),
    ).not.toThrow();
  });

  test("les valeurs par défaut sont null", () => {
    const dates = new DatesReservation({
      dateDemande: T("10:00"),
      dateLimiteReponse: T("12:00"),
    });
    expect(dates.dateConfirmation).toBeNull();
    expect(dates.dateLimiteRetrait).toBeNull();
    expect(dates.dateCloture).toBeNull();
  });
});

describe("DatesReservation - dates invalides", () => {
  test.each([
    ["dateDemande", "pas une date"],
    ["dateDemande", null],
    ["dateLimiteReponse", undefined],
    ["dateLimiteReponse", new Date("n'importe quoi")],
    ["dateConfirmation", "2026-01-01"],
    ["dateLimiteRetrait", 12345],
    ["dateCloture", "hier"],
  ])("refuse %s = %p", (champ, valeur) => {
    expect(() => new DatesReservation(donneesValides({ [champ]: valeur }))).toThrow(DonneesInvalides);
  });
});

describe("DatesReservation - cohérence entre les dates", () => {
  test("refuse une limite de réponse avant la demande", () => {
    expect(
      () => new DatesReservation(donneesValides({ dateLimiteReponse: T("09:00") })),
    ).toThrow(DonneesInvalides);
  });

  test("refuse une limite de réponse égale à la demande", () => {
    expect(
      () => new DatesReservation(donneesValides({ dateLimiteReponse: T("10:00") })),
    ).toThrow(DonneesInvalides);
  });

  test("refuse une confirmation sans limite de retrait", () => {
    expect(
      () => new DatesReservation(donneesValides({ dateConfirmation: T("11:00") })),
    ).toThrow(DonneesInvalides);
  });

  test("refuse une limite de retrait sans confirmation", () => {
    expect(
      () => new DatesReservation(donneesValides({ dateLimiteRetrait: T("23:00") })),
    ).toThrow(DonneesInvalides);
  });

  test("refuse une confirmation avant la demande", () => {
    expect(
      () => new DatesReservation(donneesValides({ dateConfirmation: T("09:00"), dateLimiteRetrait: T("23:00") })),
    ).toThrow(DonneesInvalides);
  });

  test("refuse une limite de retrait avant la confirmation", () => {
    expect(
      () => new DatesReservation(donneesValides({ dateConfirmation: T("11:00"), dateLimiteRetrait: T("10:30") })),
    ).toThrow(DonneesInvalides);
  });

  test("refuse une clôture avant la demande", () => {
    expect(
      () => new DatesReservation(donneesValides({ dateCloture: T("09:00") })),
    ).toThrow(DonneesInvalides);
  });
});

describe("DatesReservation - immuabilité", () => {
  test("modifier une date lue ne change pas l'objet", () => {
    const dates = new DatesReservation(donneesValides());
    dates.dateDemande.setFullYear(2030);
    expect(dates.dateDemande.getFullYear()).toBe(2026);
  });

  test("modifier la date passée au constructeur ne change pas l'objet", () => {
    const demande = T("10:00");
    const dates = new DatesReservation(donneesValides({ dateDemande: demande }));
    demande.setFullYear(2030);
    expect(dates.dateDemande.getFullYear()).toBe(2026);
  });
});

describe("DatesReservation - égalité par valeur", () => {
  test("deux objets avec les mêmes dates sont égaux", () => {
    expect(new DatesReservation(donneesValides()).equals(new DatesReservation(donneesValides()))).toBe(true);
  });

  test("deux objets avec des dates différentes ne sont pas égaux", () => {
    const a = new DatesReservation(donneesValides());
    const b = new DatesReservation(donneesValides(confirmation));
    expect(a.equals(b)).toBe(false);
  });

  test("n'est pas égal à autre chose qu'une DatesReservation", () => {
    expect(new DatesReservation(donneesValides()).equals({})).toBe(false);
  });
});
