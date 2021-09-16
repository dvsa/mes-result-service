/**
 * Describes the scenario where an attempt was made to delete Test Results
 */
export class NoDeleteWarning extends Error {
  constructor() {
    super('No records deleted');
    Object.setPrototypeOf(this, NoDeleteWarning.prototype);
  }
}
