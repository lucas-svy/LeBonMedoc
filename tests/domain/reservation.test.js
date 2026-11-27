const Reservation = require("../../src/domain/Reservation");
const DatesReservation = require("../../src/domain/DatesReservation");
const StatutReservation = require("../../src/domain/StatutReservation");
const { DonneesInvalides, TransitionInterdite, ReservationExpiree } = require("../../src/domain/errors");

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

describe("Reservation - creer", () => {
  function parametresCreer(modifs = {}) {
    return {
      patientId: 1,
      pharmacieId: 2,
      medicamentId: 3,
      quantite: 2,
      maintenant: T("10:00"),
      delaiReponseMinutes: 120,
      ...modifs,
    };
  }

  test("crée une réservation en attente sans identifiant", () => {
    const r = Reservation.creer(parametresCreer());
    expect(r).toBeInstanceOf(Reservation);
    expect(r.statut).toBe(StatutReservation.EN_ATTENTE);
    expect(r.id).toBeNull();
    expect(r.motifRefus).toBeNull();
  });

  test("reprend les identifiants et la quantité", () => {
    const r = Reservation.creer(parametresCreer());
    expect(r.patientId).toBe(1);
    expect(r.pharmacieId).toBe(2);
    expect(r.medicamentId).toBe(3);
    expect(r.quantite).toBe(2);
  });

  test("fixe la demande à maintenant et la limite de réponse à maintenant + délai", () => {
    const r = Reservation.creer(parametresCreer());
    expect(r.dates.dateDemande).toEqual(T("10:00"));
    expect(r.dates.dateLimiteReponse).toEqual(T("12:00"));
  });

  test("utilise le délai de réponse donné", () => {
    const r = Reservation.creer(parametresCreer({ delaiReponseMinutes: 30 }));
    expect(r.dates.dateLimiteReponse).toEqual(T("10:30"));
  });

  test("la confirmation, la limite de retrait et la clôture sont null", () => {
    const r = Reservation.creer(parametresCreer());
    expect(r.dates.dateConfirmation).toBeNull();
    expect(r.dates.dateLimiteRetrait).toBeNull();
    expect(r.dates.dateCloture).toBeNull();
  });

  test.each([0, -1, 1.5, "2", null, undefined])("refuse la quantité %p", (quantite) => {
    expect(() => Reservation.creer(parametresCreer({ quantite }))).toThrow(DonneesInvalides);
  });

  test.each([0, -1, 1.5, "1", null, undefined])("refuse un patientId %p", (patientId) => {
    expect(() => Reservation.creer(parametresCreer({ patientId }))).toThrow(DonneesInvalides);
  });

  test.each([0, -1, 1.5, "1", null, undefined])("refuse un pharmacieId %p", (pharmacieId) => {
    expect(() => Reservation.creer(parametresCreer({ pharmacieId }))).toThrow(DonneesInvalides);
  });

  test.each([0, -1, 1.5, "1", null, undefined])("refuse un medicamentId %p", (medicamentId) => {
    expect(() => Reservation.creer(parametresCreer({ medicamentId }))).toThrow(DonneesInvalides);
  });

  test.each([0, -5, "abc", null, undefined])("refuse le délai de réponse %p", (delaiReponseMinutes) => {
    expect(() => Reservation.creer(parametresCreer({ delaiReponseMinutes }))).toThrow(DonneesInvalides);
  });

  test.each([undefined, null, "10:00", new Date("n'importe quoi")])(
    "refuse un maintenant invalide (%p)",
    (maintenant) => {
      expect(() => Reservation.creer(parametresCreer({ maintenant }))).toThrow(DonneesInvalides);
    },
  );
});

// Fabrique une réservation dans le statut voulu, avec des dates cohérentes (règle 8).
// Dates : demande 10:00, limite de réponse 12:00, confirmation 11:00, limite de retrait 23:00, clôture 13:00.
function reservationEnStatut(statut) {
  const modifsDates = {
    [StatutReservation.EN_ATTENTE]: {},
    [StatutReservation.CONFIRMEE]: confirmation,
    [StatutReservation.REFUSEE]: cloture,
    [StatutReservation.EXPIREE]: cloture,
    [StatutReservation.ANNULEE]: cloture,
    [StatutReservation.RETIREE]: { ...confirmation, ...cloture },
  }[statut];

  return new Reservation(donneesValides({
    statut,
    dates: datesValides(modifsDates),
    motifRefus: statut === StatutReservation.REFUSEE ? "Indisponible" : null,
  }));
}

describe("Reservation - confirmer", () => {
  const MAINTENANT = T("11:00");   // avant la limite de réponse (12:00)
  const DELAI_RETRAIT = 60;        // limite de retrait : 12:00

  describe("depuis EN_ATTENTE", () => {
    test("passe au statut CONFIRMEE", () => {
      const r = reservationEnStatut(StatutReservation.EN_ATTENTE);
      r.confirmer(MAINTENANT, DELAI_RETRAIT);
      expect(r.statut).toBe(StatutReservation.CONFIRMEE);
    });

    test("fixe la confirmation à maintenant et la limite de retrait à maintenant + délai", () => {
      const r = reservationEnStatut(StatutReservation.EN_ATTENTE);
      r.confirmer(MAINTENANT, DELAI_RETRAIT);
      expect(r.dates.dateConfirmation).toEqual(T("11:00"));
      expect(r.dates.dateLimiteRetrait).toEqual(T("12:00"));
    });

    test("garde la demande, la limite de réponse et la clôture", () => {
      const r = reservationEnStatut(StatutReservation.EN_ATTENTE);
      r.confirmer(MAINTENANT, DELAI_RETRAIT);
      expect(r.dates.dateDemande).toEqual(T("10:00"));
      expect(r.dates.dateLimiteReponse).toEqual(T("12:00"));
      expect(r.dates.dateCloture).toBeNull();
    });

    test("ne change ni la quantité, ni les identifiants, ni le motif", () => {
      const r = reservationEnStatut(StatutReservation.EN_ATTENTE);
      r.confirmer(MAINTENANT, DELAI_RETRAIT);
      expect(r.quantite).toBe(2);
      expect(r.patientId).toBe(1);
      expect(r.pharmacieId).toBe(2);
      expect(r.medicamentId).toBe(3);
      expect(r.motifRefus).toBeNull();
    });

    test("accepte la confirmation exactement à la limite de réponse", () => {
      const r = reservationEnStatut(StatutReservation.EN_ATTENTE);
      expect(() => r.confirmer(T("12:00"), DELAI_RETRAIT)).not.toThrow();
      expect(r.statut).toBe(StatutReservation.CONFIRMEE);
    });
  });

  describe("transitions interdites", () => {
    test("refuse de confirmer deux fois (opération répétée)", () => {
      const r = reservationEnStatut(StatutReservation.EN_ATTENTE);
      r.confirmer(MAINTENANT, DELAI_RETRAIT);
      expect(() => r.confirmer(T("11:30"), DELAI_RETRAIT)).toThrow(TransitionInterdite);
    });

    test("la deuxième confirmation ne modifie rien", () => {
      const r = reservationEnStatut(StatutReservation.EN_ATTENTE);
      r.confirmer(MAINTENANT, DELAI_RETRAIT);
      const avant = r.dates;
      expect(() => r.confirmer(T("11:30"), 120)).toThrow(TransitionInterdite);
      expect(r.statut).toBe(StatutReservation.CONFIRMEE);
      expect(r.dates.equals(avant)).toBe(true);
    });

    test.each([
      StatutReservation.CONFIRMEE,
      StatutReservation.REFUSEE,
      StatutReservation.EXPIREE,
      StatutReservation.ANNULEE,
      StatutReservation.RETIREE,
    ])("refuse de confirmer une réservation %s", (statut) => {
      const r = reservationEnStatut(statut);
      const avant = r.dates;
      expect(() => r.confirmer(MAINTENANT, DELAI_RETRAIT)).toThrow(TransitionInterdite);
      expect(r.statut).toBe(statut);
      expect(r.dates.equals(avant)).toBe(true);
    });

    test("donne TransitionInterdite (et non ReservationExpiree) sur une réservation déjà finie, même après la limite", () => {
      const r = reservationEnStatut(StatutReservation.REFUSEE);
      expect(() => r.confirmer(T("15:00"), DELAI_RETRAIT)).toThrow(TransitionInterdite);
    });
  });

  describe("réservation expirée (règle 6)", () => {
    test("refuse de confirmer après la limite de réponse", () => {
      const r = reservationEnStatut(StatutReservation.EN_ATTENTE);
      expect(() => r.confirmer(T("12:01"), DELAI_RETRAIT)).toThrow(ReservationExpiree);
    });

    test("ne change rien quand la réservation est expirée", () => {
      const r = reservationEnStatut(StatutReservation.EN_ATTENTE);
      const avant = r.dates;
      expect(() => r.confirmer(T("12:01"), DELAI_RETRAIT)).toThrow(ReservationExpiree);
      expect(r.statut).toBe(StatutReservation.EN_ATTENTE);
      expect(r.dates.equals(avant)).toBe(true);
    });
  });

  describe("données invalides (la réservation reste inchangée)", () => {
    test.each([0, -5, "abc", null, undefined])("refuse le délai de retrait %p", (delai) => {
      const r = reservationEnStatut(StatutReservation.EN_ATTENTE);
      const avant = r.dates;
      expect(() => r.confirmer(MAINTENANT, delai)).toThrow(DonneesInvalides);
      expect(r.statut).toBe(StatutReservation.EN_ATTENTE);
      expect(r.dates.equals(avant)).toBe(true);
    });

    test.each([undefined, null, "11:00", new Date("n'importe quoi")])(
      "refuse un maintenant invalide (%p)",
      (maintenant) => {
        const r = reservationEnStatut(StatutReservation.EN_ATTENTE);
        const avant = r.dates;
        expect(() => r.confirmer(maintenant, DELAI_RETRAIT)).toThrow(DonneesInvalides);
        expect(r.statut).toBe(StatutReservation.EN_ATTENTE);
        expect(r.dates.equals(avant)).toBe(true);
      },
    );

    test("refuse une confirmation avant la demande", () => {
      const r = reservationEnStatut(StatutReservation.EN_ATTENTE);
      const avant = r.dates;
      expect(() => r.confirmer(T("09:00"), DELAI_RETRAIT)).toThrow(DonneesInvalides);
      expect(r.statut).toBe(StatutReservation.EN_ATTENTE);
      expect(r.dates.equals(avant)).toBe(true);
    });
  });
});
