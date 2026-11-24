const Pharmacie = require("../../src/domain/Pharmacie");
const { DonneesInvalides } = require("../../src/domain/errors");

describe("Pharmacie", () => {
  const pharmacieValide = {
    nom: "Pharmacie Odysseum",
    adresse: "10 rue de l'Odyssée",
    ville: "Montpellier",
  };

  test("accepte une pharmacie valide avec les délais par défaut du schéma", () => {
    const pharmacie = new Pharmacie(pharmacieValide);

    expect(pharmacie.delaiReponseMinutes).toBe(120);
    expect(pharmacie.delaiRetraitMinutes).toBe(2880);
  });

  test.each([
    ["délai de réponse nul", { delaiReponseMinutes: 0 }],
    ["délai de réponse négatif", { delaiReponseMinutes: -1 }],
    ["délai de retrait nul", { delaiRetraitMinutes: 0 }],
    ["délai de retrait négatif", { delaiRetraitMinutes: -1 }],
  ])("refuse un %s", (_description, delais) => {
    expect(() => new Pharmacie({ ...pharmacieValide, ...delais })).toThrow(
      DonneesInvalides,
    );
  });

  test("refuse un nom ou une adresse vide", () => {
    expect(() => new Pharmacie({ ...pharmacieValide, nom: " " })).toThrow(
      DonneesInvalides,
    );
    expect(() => new Pharmacie({ ...pharmacieValide, adresse: "" })).toThrow(
      DonneesInvalides,
    );
  });

  test("refuse une pharmacie sans ville, conformément au schéma SQLite", () => {
    const { ville: _ville, ...sansVille } = pharmacieValide;

    expect(() => new Pharmacie(sansVille)).toThrow(DonneesInvalides);
  });
});
