const Prix = require("../../src/domain/Prix");
const { DonneesInvalides } = require("../../src/domain/errors");

describe("Prix", () => {
  test("converti un montant en euros en centimes", () => {
    const prix = new Prix(12.34);

    expect(prix.montant).toBe(1234);
    expect(prix.estUnNombre()).toBe(true);
    expect(prix.estPositif()).toBe(true);
  });

  test.each([0, -1, "12.34", undefined, null, NaN, Infinity, -Infinity])(
    "rejette un montant invalide: %p",
    (montant) => {
      expect(() => new Prix(montant)).toThrow(DonneesInvalides);
    },
  );

  test.each([1.234, 0.001])(
    "rejette une fraction de cent: %p euros",
    (montant) => {
      expect(() => new Prix(montant)).toThrow(DonneesInvalides);
    },
  );

  test("rejette les montants qui ne peuvent pas être représentés en toute sécurité en centimes", () => {
    expect(() => new Prix(Number.MAX_SAFE_INTEGER)).toThrow(DonneesInvalides);
  });
});
