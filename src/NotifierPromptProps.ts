/**
 * Notifier prompt props
 */
export type NotifierPromptProps = Record<string, any> & {
  /**
   * Cancel label
   */
  cancelLabel?: string;

  /**
   * OK label
   */
  okLabel?: string;

  /**
   * Multiple inputs
   */
  inputs: React.ReactNode;

  /**
   * Single type
   */
  type?: string;
};
