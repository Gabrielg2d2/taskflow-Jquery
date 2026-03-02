import { IIdGenerator } from "@taskflow/core/shared/ports";

/**
 * Gerador de IDs usando crypto.randomUUID().
 */
export class CryptoIdGenerator extends IIdGenerator {
  generate() {
    return crypto.randomUUID();
  }
}
