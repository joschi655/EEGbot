/** Erwartbare fachliche Ablehnung: gültige Eingabe, aber nicht vom Rechner abgedeckt. */
export class FachlicherFehler extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FachlicherFehler";
  }
}

/** Bekannte Datenlücke, die dem Nutzer nicht als interner Programmfehler erscheinen soll. */
export class DatenlueckeFehler extends FachlicherFehler {
  constructor(message: string) {
    super(message);
    this.name = "DatenlueckeFehler";
  }
}
