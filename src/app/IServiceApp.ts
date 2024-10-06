import { ReactAppType } from "./ReactApp";

/**
 * Service application interface
 */
export interface IServiceApp extends ReactAppType {
  /**
   * Load core system UI
   */
  loadCore(): void;

  /**
   * Service decrypt message
   * @param messageEncrypted Encrypted message
   * @param passphrase Secret passphrase
   * @returns Pure text
   */
  serviceDecrypt(
    messageEncrypted: string,
    passphrase?: string
  ): string | undefined;

  /**
   * Service encrypt message
   * @param message Message
   * @param passphrase Secret passphrase
   * @param iterations Iterations, 1000 times, 1 - 99
   * @returns Result
   */
  serviceEncrypt(
    message: string,
    passphrase?: string,
    iterations?: number
  ): string | undefined;
}
