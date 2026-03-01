import { IIdGenerator } from "../../application/ports/IIdGenerator.js";

/**
 * Gerador de IDs usando crypto.randomUUID().
 */
export class CryptoIdGenerator extends IIdGenerator {
  generate() {
    return crypto.randomUUID();
  }
}
