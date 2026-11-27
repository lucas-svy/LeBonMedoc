const Dosage = require("../../src/domain/Dosage");
const FormesMedicament = require("../../src/domain/FormesMedicament");
const Unites = require("../../src/domain/Unites");
const { DonneesInvalides } = require("../../src/domain/errors");

describe("Dosage", () => {
  test("accepte un dosage avec une forme, une unité et une quantité valides", () => {
    const dosage = new Dosage({
      forme: FormesMedicament.COMPRIME,
      unite: Unites.MILLIGRAMME,
      quantite: 500,
    });

    expect(dosage).toEqual({
      forme: FormesMedicament.COMPRIME,
      unite: Unites.MILLIGRAMME,
      quantite: 500,
    });
  });

  test("accepte une quantité fractionnée finie et positive", () => {
    const dosage = new Dosage({
      forme: FormesMedicament.SACHET,
      unite: Unites.GRAMME,
      quantite: 0.5,
    });

    expect(dosage.quantite).toBe(0.5);
  });

  test.each([undefined, null, "", "INVALID"])(
    "rejette une forme invalide: %p",
    (forme) => {
      expect(
        () =>
          new Dosage({
            forme,
            unite: Unites.MILLIGRAMME,
            quantite: 500,
          }),
      ).toThrow(DonneesInvalides);
    },
  );

  test.each([undefined, null, "", "INVALID"])(
    "rejette une unité invalide: %p",
    (unite) => {
      expect(
        () =>
          new Dosage({
            forme: FormesMedicament.COMPRIME,
            unite,
            quantite: 500,
          }),
      ).toThrow(DonneesInvalides);
    },
  );

  test.each([undefined, null, 0, -1, "500", NaN, Infinity, -Infinity])(
    "rejette une quantité invalide: %p",
    (quantite) => {
      expect(
        () =>
          new Dosage({
            forme: FormesMedicament.COMPRIME,
            unite: Unites.MILLIGRAMME,
            quantite,
          }),
      ).toThrow(DonneesInvalides);
    },
  );

  test.each([undefined, null, "invalid", []])(
    "rejette une entrée invalide: %p",
    (donnees) => {
      expect(() => new Dosage(donnees)).toThrow(DonneesInvalides);
    },
  );
});
