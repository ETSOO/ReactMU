import React, { FormEventHandler } from "react";
import { MUGlobal } from "../MUGlobal";
import { CommonPage, CommonPageProps } from "./CommonPage";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { BackButton } from "../BackButton";
import { Labels } from "../app/Labels";
import type { OperationMessageHandlerAll } from "../messages/OperationMessageHandler";
import { OperationMessageContainer } from "../messages/OperationMessageContainer";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";

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
   * Bottom part
   */
  bottomPart?: React.ReactNode;

  /**
   * Top part
   */
  topPart?: React.ReactNode;

  /**
   * Operation message handler
   */
  operationMessageHandler?: OperationMessageHandlerAll;

  /**
   * Grid spacing
   */
  gridSpacing?: number | Record<string, string | number>;
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
    scrollContainer = globalThis,
    supportBack = true,
    submitDisabled = false,
    bottomPart,
    topPart,
    operationMessageHandler,
    gridSpacing = MUGlobal.pagePaddings,
    ...rest
  } = props;

  // Labels
  const labels = Labels.CommonPage;

  return (
    <CommonPage paddings={paddings} scrollContainer={scrollContainer} {...rest}>
      {operationMessageHandler && (
        <OperationMessageContainer handler={operationMessageHandler} />
      )}
      {topPart}
      <form onSubmit={onSubmit}>
        <Grid
          container
          justifyContent="left"
          spacing={gridSpacing}
          paddingTop={1}
        >
          {children}
        </Grid>
        <Grid
          container
          position="sticky"
          display="flex"
          gap={gridSpacing}
          sx={{
            top: "auto",
            bottom: (theme) =>
              MUGlobal.updateWithTheme(gridSpacing, theme.spacing),
            paddingTop: gridSpacing
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
      {bottomPart}
    </CommonPage>
  );
}
