const Medicament = require("../../src/domain/Medicament");
const { DonneesInvalides } = require("../../src/domain/errors");

describe("Medicament", () => {
  const medicamentValide = {
    codeCIP: "0123456789012",
    nom: "Paracétamol",
    dosage: "500 mg",
    surOrdonnance: false,
  };

  test("accepte un médicament valide en conservant les zéros du code CIP", () => {
    const medicament = new Medicament(medicamentValide);

    expect(medicament.codeCIP).toBe("0123456789012");
    expect(medicament.surOrdonnance).toBe(false);
  });

  test.each([
    "123456789012",
    "12345678901234",
    "12345678901a3",
    " 123456789012",
  ])("refuse le code CIP invalide %s", (codeCIP) => {
    expect(() => new Medicament({ ...medicamentValide, codeCIP })).toThrow(
      DonneesInvalides,
    );
  });

  test.each([undefined, "", "   ", null])(
    "refuse un nom absent ou vide (%s)",
    (nom) => {
      expect(() => new Medicament({ ...medicamentValide, nom })).toThrow(
        DonneesInvalides,
      );
    },
  );

  test("refuse un dosage absent ou vide", () => {
    expect(() => new Medicament({ ...medicamentValide, dosage: " " })).toThrow(
      DonneesInvalides,
    );
  });

  test("refuse une valeur non booléenne pour surOrdonnance", () => {
    expect(
      () => new Medicament({ ...medicamentValide, surOrdonnance: 0 }),
    ).toThrow(DonneesInvalides);
  });
});
