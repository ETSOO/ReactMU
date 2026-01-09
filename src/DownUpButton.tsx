import Button from "@mui/material/Button";
import ButtonGroup, { ButtonGroupProps } from "@mui/material/ButtonGroup";
import { useAppContext } from "./app/ReactApp";

/**
 * Down & Up Button Props
 */
export type DownUpButtonProps = Omit<ButtonGroupProps, "orientation"> & {
  /**
   * Is down button disabled
   */
  downDisabled?: boolean;

  /**
   * Down button label
   */
  downLabel?: string;

  /**
   * Is up button disabled
   */
  upDisabled?: boolean;

  /**
   * Up button label
   */
  upLabel?: string;

  /**
   * Down button click handler
   * @param event Mouse click event
   */
  onDownClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Up button click handler
   * @param event Mouse click event
   */
  onUpClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

/**
 * Down & Up Button
 * @param props Props
 * @returns Component
 */
export function DownUpButton(props: DownUpButtonProps) {
  // Global app
  const app = useAppContext();

  // Destruct
  const {
    size = "small",
    downDisabled,
    downLabel = app?.get("moveDown") ?? "Down",
    upDisabled,
    upLabel = app?.get("moveUp") ?? "Up",
    onDownClick,
    onUpClick,
    ...rest
  } = props;

  return (
    <ButtonGroup orientation="vertical" size={size} {...rest}>
      <Button disabled={upDisabled} onClick={onUpClick}>
        {upLabel}
      </Button>
      <Button disabled={downDisabled} onClick={onDownClick}>
        {downLabel}
      </Button>
    </ButtonGroup>
  );
}
