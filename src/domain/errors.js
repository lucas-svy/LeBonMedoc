class InvalidData extends Error {
  constructor(message) {
    super(message);
    this.name = "DonneesInvalides";
  }
}

module.exports = {
  DonneesInvalides: InvalidData,
  InvalidData,
};
