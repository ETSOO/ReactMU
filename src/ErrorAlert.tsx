import Alert, { AlertProps } from "@mui/material/Alert";
import { useAppContext } from "./app/ReactApp";

/**
 * Error alert props
 */
export type ErrorAlertProps = AlertProps & {
  /**
   * Message to display
   */
  message?: React.ReactNode;
};

/**
 * Error alert component
 * @param props Props
 * @returns Component
 */
export function ErrorAlert(props: ErrorAlertProps) {
  // Global app
  const app = useAppContext();

  // Destruct
  const { message = app?.get("idError"), ...alertProps } = props;

  // Layout
  return (
    <Alert severity="error" {...alertProps}>
      {message}
    </Alert>
  );
}
