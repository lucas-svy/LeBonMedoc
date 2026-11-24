const Pharmacien = require("../../src/domain/Pharmacien");
const { DonneesInvalides } = require("../../src/domain/errors");

const pharmacienValide = {
  pharmacieId: 7,
  nom: "Smith",
  prenom: "Alice",
  email: "alice.smith@example.test",
};

describe("Pharmacien", () => {
  test("appartient à la pharmacie à laquelle il est rattaché", () => {
    const pharmacien = new Pharmacien(pharmacienValide);

    expect(pharmacien.appartientA(7)).toBe(true);
    expect(pharmacien.belongsTo(7)).toBe(true);
  });

  test("renvoie faux pour une autre pharmacie", () => {
    const pharmacien = new Pharmacien(pharmacienValide);

    expect(pharmacien.appartientA(8)).toBe(false);
    expect(pharmacien.belongsTo(8)).toBe(false);
  });

  test("refuse un rattachement absent ou invalide", () => {
    expect(() => new Pharmacien()).toThrow(DonneesInvalides);
    expect(
      () => new Pharmacien({ ...pharmacienValide, pharmacieId: 0 }),
    ).toThrow(DonneesInvalides);
  });

  test.each(["nom", "prenom", "email"])("refuse un %s absent", (field) => {
    const pharmacien = { ...pharmacienValide };
    delete pharmacien[field];

    expect(() => new Pharmacien(pharmacien)).toThrow(DonneesInvalides);
  });

  test("nettoie les espaces des champs texte", () => {
    const pharmacien = new Pharmacien({
      ...pharmacienValide,
      nom: " Smith ",
      prenom: " Alice ",
      email: " alice.smith@example.test ",
    });

    expect(pharmacien.nom).toBe("Smith");
    expect(pharmacien.prenom).toBe("Alice");
    expect(pharmacien.email).toBe("alice.smith@example.test");
  });
});
