const Medicament = require("../../src/domain/Medicament");
const Dosage = require("../../src/domain/Dosage");
const Prix = require("../../src/domain/Prix");
const FormesMedicament = require("../../src/domain/FormesMedicament");
const Unites = require("../../src/domain/Unites");
const { DonneesInvalides } = require("../../src/domain/errors");

describe("Medicament", () => {
  const dosageValide = new Dosage({
    forme: FormesMedicament.COMPRIME,
    unite: Unites.MILLIGRAMME,
    quantite: 500,
  });

  const prixValide = new Prix(10.5);

  const medicamentValide = {
    codeCIP: "0123456789012",
    nom: "Paracétamol",
    dosage: dosageValide,
    surOrdonnance: false,
    prix: prixValide,
  };

  test("accepte un médicament valide en conservant les zéros du code CIP", () => {
    const medicament = new Medicament(medicamentValide);

    expect(medicament.codeCIP).toBe("0123456789012");
    expect(medicament.surOrdonnance).toBe(false);
    expect(medicament.dosage).toBeInstanceOf(Dosage);
    expect(medicament.prix).toBeInstanceOf(Prix);
  });

  test("accepte un dosage valide", () => {
    const medicament = new Medicament({
      ...medicamentValide,
      dosage: dosageValide,
    });

    expect(medicament.dosage).toBe(dosageValide);
    expect(medicament.dosage.forme).toBe(FormesMedicament.COMPRIME);
    expect(medicament.dosage.unite).toBe(Unites.MILLIGRAMME);
    expect(medicament.dosage.quantite).toBe(500);
  });

  test("accepte un prix valide", () => {
    const medicament = new Medicament({
      ...medicamentValide,
      prix: prixValide,
    });

    expect(medicament.prix).toBe(prixValide);
    expect(medicament.prix.montant).toBe(1050);
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

  test.each([undefined, null, " ", "500 mg", {}])(
    "refuse un dosage absent ou invalide: %p",
    (dosage) => {
      expect(() => new Medicament({ ...medicamentValide, dosage })).toThrow(
        DonneesInvalides,
      );
    },
  );

  test.each([undefined, null, 10.5, {}, { montant: 1050 }])(
    "refuse un prix absent ou invalide: %p",
    (prix) => {
      expect(() => new Medicament({ ...medicamentValide, prix })).toThrow(
        DonneesInvalides,
      );
    },
  );

  test("refuse une valeur non booléenne pour surOrdonnance", () => {
    expect(
      () => new Medicament({ ...medicamentValide, surOrdonnance: 0 }),
    ).toThrow(DonneesInvalides);
  });
});
