/**
 * Interface for objects exchanged with REST backend
 */
export interface Serializable {
  /**
   * Convert object to a format expected by REST interface of the backend
   */
  serialize();
  /**
   * Create object from backend data
   *
   * TODO: check out if this method may be somehow class's static
   */
  load(data: {});
}
