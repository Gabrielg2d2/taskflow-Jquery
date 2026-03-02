import { IIdGenerator } from "@taskflow/core/application";

/**
 * Gerador de IDs usando crypto.randomUUID().
 */
export class CryptoIdGenerator extends IIdGenerator {
  generate() {
    return crypto.randomUUID();
  }
}
