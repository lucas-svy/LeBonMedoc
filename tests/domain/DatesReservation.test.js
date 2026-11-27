const DatesReservation = require("../../src/domain/DatesReservation");
const { DonneesInvalides } = require("../../src/domain/errors");

const Temps = (heure_minute) => new Date(`2026-01-01T${heure_minute}:00Z`);

function donneesValides(modifs = {}) {
  return {
    dateDemande: Temps("10:00"),
    dateLimiteReponse: Temps("12:00"),
    dateConfirmation: null,
    dateLimiteRetrait: null,
    dateCloture: null,
    ...modifs,
  };
}

const confirmation = { dateConfirmation: Temps("11:00"), dateLimiteRetrait: Temps("23:00") };

describe("DatesReservation - construction", () => {
  test("accepte des dates valides (demande seule)", () => {
    expect(() => new DatesReservation(donneesValides())).not.toThrow();
  });

  test("accepte des dates valides avec confirmation et clôture", () => {
    expect(
      () => new DatesReservation(donneesValides({ ...confirmation, dateCloture: Temps("13:00") })),
    ).not.toThrow();
  });

  test("les valeurs par défaut sont null", () => {
    const dates = new DatesReservation({
      dateDemande: Temps("10:00"),
      dateLimiteReponse: Temps("12:00"),
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
      () => new DatesReservation(donneesValides({ dateLimiteReponse: Temps("09:00") })),
    ).toThrow(DonneesInvalides);
  });

  test("refuse une limite de réponse égale à la demande", () => {
    expect(
      () => new DatesReservation(donneesValides({ dateLimiteReponse: Temps("10:00") })),
    ).toThrow(DonneesInvalides);
  });

  test("refuse une confirmation sans limite de retrait", () => {
    expect(
      () => new DatesReservation(donneesValides({ dateConfirmation: Temps("11:00") })),
    ).toThrow(DonneesInvalides);
  });

  test("refuse une limite de retrait sans confirmation", () => {
    expect(
      () => new DatesReservation(donneesValides({ dateLimiteRetrait: Temps("23:00") })),
    ).toThrow(DonneesInvalides);
  });

  test("refuse une confirmation avant la demande", () => {
    expect(
      () => new DatesReservation(donneesValides({ dateConfirmation: Temps("09:00"), dateLimiteRetrait: Temps("23:00") })),
    ).toThrow(DonneesInvalides);
  });

  test("refuse une limite de retrait avant la confirmation", () => {
    expect(
      () => new DatesReservation(donneesValides({ dateConfirmation: Temps("11:00"), dateLimiteRetrait: Temps("10:30") })),
    ).toThrow(DonneesInvalides);
  });

  test("refuse une clôture avant la demande", () => {
    expect(
      () => new DatesReservation(donneesValides({ dateCloture: Temps("09:00") })),
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
    const demande = Temps("10:00");
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

describe("DatesReservation - nouvelle", () => {
  test("fixe la demande à maintenant et la limite de réponse à maintenant + délai", () => {
    const dates = DatesReservation.nouvelle(Temps("10:00"), 120);
    expect(dates.dateDemande).toEqual(Temps("10:00"));
    expect(dates.dateLimiteReponse).toEqual(Temps("12:00"));
  });

  test("les dates de confirmation, de retrait et de clôture sont null", () => {
    const dates = DatesReservation.nouvelle(Temps("10:00"), 120);
    expect(dates.dateConfirmation).toBeNull();
    expect(dates.dateLimiteRetrait).toBeNull();
    expect(dates.dateCloture).toBeNull();
  });

  test.each([undefined, null, "10:00", new Date("n'importe quoi")])(
    "refuse un maintenant invalide (%p)",
    (maintenant) => {
      expect(() => DatesReservation.nouvelle(maintenant, 120)).toThrow(DonneesInvalides);
    },
  );

  test.each([0, -5, "abc", undefined, null])("refuse le délai de réponse %p", (delai) => {
    expect(() => DatesReservation.nouvelle(Temps("10:00"), delai)).toThrow(DonneesInvalides);
  });
});

describe("DatesReservation - confirmer", () => {
  const dates = () => new DatesReservation(donneesValides());

  test("fixe la confirmation à maintenant et la limite de retrait à maintenant + délai", () => {
    const confirmee = dates().confirmer(Temps("11:00"), 60);
    expect(confirmee.dateConfirmation).toEqual(Temps("11:00"));
    expect(confirmee.dateLimiteRetrait).toEqual(Temps("12:00"));
  });

  test("garde les autres dates", () => {
    const confirmee = dates().confirmer(Temps("11:00"), 60);
    expect(confirmee.dateDemande).toEqual(Temps("10:00"));
    expect(confirmee.dateLimiteReponse).toEqual(Temps("12:00"));
    expect(confirmee.dateCloture).toBeNull();
  });

  test("retourne une nouvelle instance sans modifier l'originale", () => {
    const originale = dates();
    const confirmee = originale.confirmer(Temps("11:00"), 60);
    expect(confirmee).not.toBe(originale);
    expect(originale.dateConfirmation).toBeNull();
    expect(originale.dateLimiteRetrait).toBeNull();
  });

  test("refuse une confirmation avant la demande", () => {
    expect(() => dates().confirmer(Temps("09:00"), 60)).toThrow(DonneesInvalides);
  });

  test.each([0, -5, "abc", undefined, null])("refuse le délai de retrait %p", (delai) => {
    expect(() => dates().confirmer(Temps("11:00"), delai)).toThrow(DonneesInvalides);
  });

  test.each([undefined, null, "11:00", new Date("n'importe quoi")])(
    "refuse un maintenant invalide (%p)",
    (maintenant) => {
      expect(() => dates().confirmer(maintenant, 60)).toThrow(DonneesInvalides);
    },
  );
});

describe("DatesReservation - cloturer", () => {
  const dates = () => new DatesReservation(donneesValides());

  test("fixe la clôture à maintenant", () => {
    expect(dates().cloturer(Temps("11:00")).dateCloture).toEqual(Temps("11:00"));
  });

  test("garde les autres dates", () => {
    const cloturee = dates().cloturer(Temps("11:00"));
    expect(cloturee.dateDemande).toEqual(Temps("10:00"));
    expect(cloturee.dateLimiteReponse).toEqual(Temps("12:00"));
    expect(cloturee.dateConfirmation).toBeNull();
    expect(cloturee.dateLimiteRetrait).toBeNull();
  });

  test("garde la confirmation et la limite de retrait d'une réservation confirmée", () => {
    const cloturee = dates().confirmer(Temps("11:00"), 60).cloturer(Temps("11:30"));
    expect(cloturee.dateConfirmation).toEqual(Temps("11:00"));
    expect(cloturee.dateLimiteRetrait).toEqual(Temps("12:00"));
    expect(cloturee.dateCloture).toEqual(Temps("11:30"));
  });

  test("retourne une nouvelle instance sans modifier l'originale", () => {
    const originale = dates();
    const cloturee = originale.cloturer(Temps("11:00"));
    expect(cloturee).not.toBe(originale);
    expect(originale.dateCloture).toBeNull();
  });

  test("refuse une clôture avant la demande", () => {
    expect(() => dates().cloturer(Temps("09:00"))).toThrow(DonneesInvalides);
  });

  test.each([undefined, null, "11:00", new Date("n'importe quoi")])(
    "refuse un maintenant invalide (%p)",
    (maintenant) => {
      expect(() => dates().cloturer(maintenant)).toThrow(DonneesInvalides);
    },
  );
});

describe("DatesReservation - reponseDepassee", () => {
  const dates = () => new DatesReservation(donneesValides()); // limite de réponse : 12:00

  test("false avant la limite", () => {
    expect(dates().reponseDepassee(Temps("11:00"))).toBe(false);
  });

  test("false exactement à la limite", () => {
    expect(dates().reponseDepassee(Temps("12:00"))).toBe(false);
  });

  test("true après la limite", () => {
    expect(dates().reponseDepassee(Temps("12:01"))).toBe(true);
  });

  test("ne modifie pas les dates", () => {
    const d = dates();
    d.reponseDepassee(Temps("13:00"));
    expect(d.equals(dates())).toBe(true);
  });

  test.each([undefined, null, "12:00", new Date("n'importe quoi")])(
    "refuse un maintenant invalide (%p)",
    (maintenant) => {
      expect(() => dates().reponseDepassee(maintenant)).toThrow(DonneesInvalides);
    },
  );
});

describe("DatesReservation - retraitDepasse", () => {
  // confirmée à 11:00, limite de retrait : 23:00
  const dates = () => new DatesReservation(donneesValides(confirmation));

  test("false avant la limite", () => {
    expect(dates().retraitDepasse(Temps("22:00"))).toBe(false);
  });

  test("false exactement à la limite", () => {
    expect(dates().retraitDepasse(Temps("23:00"))).toBe(false);
  });

  test("true après la limite", () => {
    expect(dates().retraitDepasse(Temps("23:01"))).toBe(true);
  });

  test("false si la réservation n'a pas été confirmée (pas de limite de retrait)", () => {
    const nonConfirmee = new DatesReservation(donneesValides());
    expect(nonConfirmee.retraitDepasse(Temps("23:59"))).toBe(false);
  });

  test.each([undefined, null, "23:00", new Date("n'importe quoi")])(
    "refuse un maintenant invalide (%p)",
    (maintenant) => {
      expect(() => dates().retraitDepasse(maintenant)).toThrow(DonneesInvalides);
    },
  );
});
