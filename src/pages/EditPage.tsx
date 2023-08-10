import { Button, Grid } from "@mui/material";
import React, { FormEventHandler } from "react";
import { MUGlobal } from "../MUGlobal";
import { CommonPage, CommonPageScrollContainer } from "./CommonPage";
import { CommonPageProps } from "./CommonPageProps";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { BackButton } from "../BackButton";
import { Labels } from "../app/Labels";
import { MessageUtils } from "../messages/MessageUtils";
import { OperationMessageHandler } from "../messages/OperationMessageHandler";

/**
 * Add / Edit page props
 */
export interface EditPageProps extends Omit<CommonPageProps, "onSubmit"> {
  /**
   * Is editing
   */
  isEditing?: boolean;

  /**
   * On form submit
   */
  onSubmit?: FormEventHandler<HTMLFormElement>;

  /**
   * On delete callback
   */
  onDelete?: () => Promise<void> | void;

  /**
   * Submit button disabled or not
   */
  submitDisabled?: boolean;

  /**
   * Support back click
   * @default true
   */
  supportBack?: boolean;

  /**
   * Top part
   */
  topPart?: React.ReactNode;

  /**
   * Operation message handler
   */
  operationMessageHandler?: OperationMessageHandler;
}

/**
 * Add / Edit page
 * @param props Props
 */
export function EditPage(props: EditPageProps) {
  // Destruct
  const {
    children,
    isEditing,
    onDelete,
    onSubmit,
    paddings = MUGlobal.pagePaddings,
    scrollContainer = CommonPageScrollContainer,
    supportBack = true,
    submitDisabled = false,
    topPart,
    operationMessageHandler,
    ...rest
  } = props;

  // Labels
  const labels = Labels.CommonPage;

  React.useEffect(() => {
    if (operationMessageHandler == null) return;

    MessageUtils.onOperationMessage(operationMessageHandler);

    return () => {
      MessageUtils.offOperationMessage(operationMessageHandler);
    };
  }, []);

  return (
    <CommonPage paddings={paddings} scrollContainer={scrollContainer} {...rest}>
      {topPart}
      <form onSubmit={onSubmit}>
        <Grid container justifyContent="left" spacing={paddings} paddingTop={1}>
          {children}
        </Grid>
        <Grid
          container
          position="sticky"
          display="flex"
          gap={paddings}
          sx={{
            top: "auto",
            bottom: (theme) =>
              MUGlobal.updateWithTheme(paddings, theme.spacing),
            paddingTop: paddings
          }}
        >
          {isEditing && onDelete && (
            <Button
              color="primary"
              variant="outlined"
              onClick={() => onDelete()}
              startIcon={<DeleteIcon color="warning" />}
            >
              {labels.delete}
            </Button>
          )}
          <Button
            variant="contained"
            type="submit"
            startIcon={<SaveIcon />}
            sx={{ flexGrow: 1 }}
            disabled={submitDisabled}
          >
            {labels.save}
          </Button>
          {supportBack && <BackButton title={labels.back} />}
        </Grid>
      </form>
    </CommonPage>
  );
}
