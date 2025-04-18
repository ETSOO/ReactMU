import {
  NotificationAlign,
  NotificationMessageType,
  NotificationRenderProps,
  NotificationType
} from "@etsoo/notificationbase";
import { DataTypes, DomUtils } from "@etsoo/shared";
import React from "react";
import {
  INotificationBaseReact,
  INotificationReact,
  NotificationReact,
  NotifierReact
} from "@etsoo/react";
import { DraggablePaperComponent } from "./DraggablePaperComponent";
import { LoadingButton, LoadingButtonProps } from "./LoadingButton";
import { Labels } from "./app/Labels";
import DialogTitle, { DialogTitleProps } from "@mui/material/DialogTitle";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import Fade from "@mui/material/Fade";
import Alert, { AlertColor, AlertProps } from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Switch from "@mui/material/Switch";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import CircularProgress, {
  CircularProgressProps
} from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import HelpIcon from "@mui/icons-material/Help";

type StyledDialogTitleProps = DialogTitleProps & {
  draggable?: boolean;
};

// Custom icon dialog title bar
const IconDialogTitle = styled(DialogTitle, {
  // Prevent the passing of the draggable prop to the underlying DOM element
  shouldForwardProp: (prop) => prop !== "draggable"
})<StyledDialogTitleProps>`
  ${({ theme, draggable }) => `
        cursor: ${draggable ? "move" : "default"};
        display: flex;
        align-items: center;
        & .dialogTitle {
            font-weight: bold;
            font-size: 1.17em;
            flex-grow: 3;
            text-overflow: ellipsis;
            padding-left: ${theme.spacing(1)};
        }
        & .MuiDialogContent-root-close-button {
            padding-left: ${theme.spacing(1)};
        }
    `}
`;

/**
 * MU notification
 */
export class NotificationMU extends NotificationReact {
  // Create alert
  private createAlert(_props: NotificationRenderProps, className?: string) {
    const labels = Labels.NotificationMU;

    const {
      buttons,
      inputs,
      fullScreen,
      fullWidth = true,
      maxWidth,
      okLabel = labels.alertOK,
      primaryButton = true,
      primaryButtonProps,
      closable = false,
      draggable = fullScreen === true ? false : true
    } = this.inputProps ?? {};

    let title = this.title;
    let icon: React.ReactNode;
    if (this.type === NotificationMessageType.Success) {
      icon = <DoneIcon color="primary" />;
      title ??= labels.success;
    } else if (this.type === NotificationMessageType.Info) {
      icon = <InfoIcon />;
      title ??= labels.info;
    } else if (this.type === NotificationMessageType.Warning) {
      icon = <WarningIcon color="secondary" />;
      title ??= labels.warning;
    } else {
      icon = <ErrorIcon color="error" />;
      title ??= labels.alertTitle;
    }

    const setupProps: LoadingButtonProps = {
      color: "primary"
    };

    // Setup callback
    const options = this.renderSetup ? this.renderSetup(setupProps) : undefined;

    // Callback
    const callback = async (_event: React.MouseEvent<HTMLButtonElement>) => {
      await this.returnValue(undefined);
      return true;
    };

    return (
      <Dialog
        key={this.id}
        open={this.open}
        PaperComponent={draggable ? DraggablePaperComponent : undefined}
        className={className}
        fullWidth={fullWidth}
        maxWidth={maxWidth}
        fullScreen={fullScreen}
        {...options}
      >
        <IconDialogTitle
          draggable={draggable}
          className={
            draggable ? "dialog-title draggable-dialog-title" : "dialog-title"
          }
        >
          {icon}
          <span className="dialogTitle">{title}</span>
          {closable && (
            <IconButton
              className="MuiDialogContent-root-close-button"
              size="small"
              onClick={() => this.returnValue("CLOSE")}
            >
              <CloseIcon />
            </IconButton>
          )}
        </IconDialogTitle>
        <DialogContent>
          {typeof this.content === "string" ? (
            <DialogContentText>{this.content}</DialogContentText>
          ) : (
            this.content
          )}
          {inputs}
        </DialogContent>
        <DialogActions>
          {buttons
            ? buttons(this, callback)
            : primaryButton && (
                <LoadingButton
                  {...setupProps}
                  onClick={callback}
                  autoFocus
                  {...primaryButtonProps}
                >
                  {okLabel}
                </LoadingButton>
              )}
        </DialogActions>
      </Dialog>
    );
  }

  // Create confirm
  private createConfirm(_props: NotificationRenderProps, className?: string) {
    const labels = Labels.NotificationMU;
    const title = this.title ?? labels.confirmTitle;

    const {
      buttons,
      okLabel = labels.confirmYes,
      cancelLabel = labels.confirmNo,
      cancelButton = true,
      inputs,
      fullScreen,
      fullWidth = true,
      maxWidth,
      primaryButton = true,
      primaryButtonProps,
      closable = false,
      draggable = fullScreen === true ? false : true
    } = this.inputProps ?? {};

    // Setup callback
    const options = this.renderSetup ? this.renderSetup({}) : undefined;

    const callback = async (
      _event: React.MouseEvent<HTMLButtonElement>,
      value: boolean
    ) => {
      await this.returnValue(value);
      return true;
    };

    return (
      <Dialog
        key={this.id}
        open={this.open}
        PaperComponent={draggable ? DraggablePaperComponent : undefined}
        className={className}
        fullWidth={fullWidth}
        maxWidth={maxWidth}
        fullScreen={fullScreen}
        {...options}
      >
        <IconDialogTitle
          draggable={draggable}
          className={
            draggable ? "dialog-title draggable-dialog-title" : "dialog-title"
          }
        >
          <HelpIcon color="action" />
          <span className="dialogTitle">{title}</span>
          {closable && (
            <IconButton
              className="MuiDialogContent-root-close-button"
              size="small"
              onClick={() => this.returnValue("CLOSE")}
            >
              <CloseIcon />
            </IconButton>
          )}
        </IconDialogTitle>
        <DialogContent>
          {typeof this.content === "string" ? (
            <DialogContentText>{this.content}</DialogContentText>
          ) : (
            this.content
          )}
          {inputs}
        </DialogContent>
        <DialogActions>
          {buttons ? (
            buttons(this, callback)
          ) : (
            <React.Fragment>
              {cancelButton && (
                <LoadingButton
                  color="secondary"
                  onClick={async (event) => await callback(event, false)}
                >
                  {cancelLabel}
                </LoadingButton>
              )}
              {primaryButton && (
                <LoadingButton
                  color="primary"
                  onClick={async (event) => await callback(event, true)}
                  autoFocus
                  {...primaryButtonProps}
                >
                  {okLabel}
                </LoadingButton>
              )}
            </React.Fragment>
          )}
        </DialogActions>
      </Dialog>
    );
  }

  private createMessageColor(): AlertColor {
    if (this.type === NotificationMessageType.Danger) return "error";
    if (this.type === NotificationMessageType.Success) return "success";
    if (this.type === NotificationMessageType.Warning) return "warning";
    return "info";
  }

  // Create message
  private createMessage(props: NotificationRenderProps, className?: string) {
    if (!this.open) return <React.Fragment key={this.id}></React.Fragment>;

    const { closable = false } = props;

    const setupProps: AlertProps = {
      severity: this.createMessageColor(),
      variant: "filled"
    };

    // Setup callback
    const options = this.renderSetup ? this.renderSetup(setupProps) : undefined;

    return (
      <Fade in={true} key={this.id}>
        <Alert
          {...setupProps}
          {...options}
          action={
            closable ? (
              <IconButton
                size="small"
                onClick={() => this.returnValue("CLOSE")}
              >
                <CloseIcon />
              </IconButton>
            ) : undefined
          }
          onClose={() => this.dismiss()} // dismiss will trigger the onReturn callback
          className={className}
        >
          {this.title && <AlertTitle>{this.title}</AlertTitle>}
          {this.content}
        </Alert>
      </Fade>
    );
  }

  // Create prompt
  private createPrompt(_props: NotificationRenderProps, className?: string) {
    const labels = Labels.NotificationMU;
    const title = this.title ?? labels.promptTitle;

    const {
      buttons,
      cancelLabel = labels.promptCancel,
      okLabel = labels.promptOK,
      cancelButton = true,
      inputs,
      type,
      fullScreen,
      fullWidth = true,
      maxWidth,
      primaryButton = true,
      primaryButtonProps,
      inputProps,
      closable = false,
      draggable = fullScreen === true ? false : true
    } = this.inputProps ?? {};

    const inputRef = React.createRef<HTMLInputElement>();
    const errorRef = React.createRef<HTMLSpanElement>();

    const setError = (error?: string) => {
      if (errorRef.current == null) return;
      errorRef.current.innerText = error ?? "";
    };

    const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
      // Result
      let result:
        | boolean
        | string
        | void
        | PromiseLike<boolean | string | void> = undefined;

      const input = inputRef.current;

      if (this.onReturn) {
        // Inputs case, no HTMLForm set to value, set the current form
        if (inputs && value == null) value = event.currentTarget.form;

        if (input) {
          if (type === "switch") {
            const boolValue = input.value === "true";
            result = this.onReturn(boolValue);
          } else {
            const inputValue = DomUtils.getInputValue(input);
            if ((inputValue == null || inputValue === "") && input.required) {
              input.focus();
              return false;
            }
            result = this.onReturn(inputValue);
          }
        } else if (value != null) {
          result = this.onReturn(value);
        }
      }

      // Get the value
      // returns false to prevent default dismiss
      const v = await result;
      if (v === false) {
        input?.focus();
        return false;
      }
      if (typeof v === "string") {
        setError(v);
        input?.focus();
        return false;
      }

      this.dismiss();
      return true;
    };

    let localInputs: React.ReactNode;
    let value: any = undefined;

    if (inputs == null) {
      if (type === "switch") {
        localInputs = (
          <Switch
            inputRef={inputRef}
            {...inputProps}
            value="true"
            autoFocus
            required
          />
        );
      } else if (type === "slider") {
        localInputs = <Slider onChange={(_e, v) => (value = v)} />;
      } else {
        localInputs = (
          <TextField
            inputRef={inputRef}
            onChange={() => setError(undefined)}
            autoFocus
            margin="dense"
            fullWidth
            type={type}
            required
            {...inputProps}
          />
        );
      }
    } else {
      localInputs = inputs;
    }

    // Setup callback
    const options = this.renderSetup ? this.renderSetup({}) : undefined;

    return (
      <Dialog
        key={this.id}
        open={this.open}
        PaperComponent={draggable ? DraggablePaperComponent : undefined}
        className={className}
        fullWidth={fullWidth}
        maxWidth={maxWidth}
        fullScreen={fullScreen}
        {...options}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            (
              event.currentTarget.elements.namedItem(
                "okButton"
              ) as HTMLButtonElement
            )?.click();
            return false;
          }}
        >
          <IconDialogTitle
            draggable={draggable}
            className={
              draggable ? "dialog-title draggable-dialog-title" : "dialog-title"
            }
          >
            <InfoIcon color="primary" />
            <span className="dialogTitle">{title}</span>
            {closable && (
              <IconButton
                className="MuiDialogContent-root-close-button"
                size="small"
                onClick={() => this.returnValue("CLOSE")}
              >
                <CloseIcon />
              </IconButton>
            )}
          </IconDialogTitle>
          <DialogContent>
            {typeof this.content === "string" ? (
              <DialogContentText>{this.content}</DialogContentText>
            ) : (
              this.content
            )}
            {localInputs}
            <Typography
              variant="caption"
              display="block"
              ref={errorRef}
              color="error"
            />
          </DialogContent>
          <DialogActions>
            {buttons ? (
              buttons(this, handleSubmit)
            ) : (
              <React.Fragment>
                {cancelButton && (
                  <Button
                    color="secondary"
                    onClick={() => {
                      if (this.onReturn) this.onReturn(undefined);
                      this.dismiss();
                    }}
                  >
                    {cancelLabel}
                  </Button>
                )}
                {primaryButton && (
                  <LoadingButton
                    color="primary"
                    autoFocus
                    onClick={handleSubmit}
                    name="okButton"
                    {...primaryButtonProps}
                  >
                    {okLabel}
                  </LoadingButton>
                )}
              </React.Fragment>
            )}
          </DialogActions>
        </form>
      </Dialog>
    );
  }

  private createPopup(_props: NotificationRenderProps, className?: string) {
    // Destruct
    // dismiss will trigger onReturn callback
    const { content, id, open } = this;

    // Setup callback
    const options = this.renderSetup ? this.renderSetup({}) : undefined;

    return (
      <Popover
        key={id}
        open={open}
        className={className}
        onClose={() => this.dismiss()}
        {...options}
      >
        {content}
      </Popover>
    );
  }

  // Create loading
  private createLoading(_props: NotificationRenderProps, className?: string) {
    // Properties
    const setupProps: CircularProgressProps = { color: "primary" };

    const labels = Labels.NotificationMU;

    // Input props
    const { maxWidth = "xs" } = this.inputProps ?? {};

    // Content
    let content = this.content;
    if (content === "@") content = labels.loading.toString();

    // Setup callback
    const options = this.renderSetup ? this.renderSetup(setupProps) : undefined;

    return (
      <Backdrop
        key={this.id}
        className={className}
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.modal + 1
        }}
        open={this.open}
        {...options}
      >
        <Box
          display="flex"
          flexDirection="column"
          flexWrap="nowrap"
          alignItems="center"
          sx={{
            "& > :not(style) + :not(style)": {
              marginTop: (theme) => theme.spacing(1)
            }
          }}
        >
          <CircularProgress {...setupProps} />
          {content && (
            <Box maxWidth={maxWidth === false ? undefined : maxWidth}>
              {content}
            </Box>
          )}
        </Box>
      </Backdrop>
    );
  }

  /**
   * Render method
   * @param props Props
   * @param className Style class name
   * @param classes Style classes
   */
  render(props: NotificationRenderProps, className?: string) {
    // Loading bar
    if (this.type === NotificationType.Loading) {
      return this.createLoading(props, className);
    } else if (this.type === NotificationType.Confirm) {
      return this.createConfirm(props, className);
    } else if (this.type === NotificationType.Prompt) {
      return this.createPrompt(props, className);
    } else if (this.type === NotificationType.Popup) {
      return this.createPopup(props, className);
    } else if (
      this.type === NotificationType.Error ||
      (this.modal && this.type in NotificationMessageType)
    ) {
      // Alert or modal message
      return this.createAlert(props, className);
    } else {
      return this.createMessage(props, className);
    }
  }
}

// Origin constructor generics
interface origin {
  vertical: "top" | "bottom";
  horizontal: DataTypes.HAlign;
}

/**
 * Antd notifier
 */
export class NotifierMU extends NotifierReact {
  /**
   * Create state and return provider
   * @param className Style class name
   * @param debug Debug mode
   * @returns Provider
   */
  static setup(className?: string, debug: boolean = false) {
    className ??= "notifier-mu";

    // Create an instance
    const instance = new NotifierMU();
    instance.debug = debug;

    const provider = instance.createProvider(className, debug);
    NotifierReact.updateInstance(instance);

    return provider;
  }

  // Calculate origin from align property
  private static getOrigin(align: NotificationAlign): origin | undefined {
    if (align === NotificationAlign.TopLeft) {
      return {
        horizontal: "left",
        vertical: "top"
      };
    }

    if (align === NotificationAlign.TopCenter) {
      return {
        horizontal: "center",
        vertical: "top"
      };
    }

    if (align === NotificationAlign.TopRight) {
      return {
        horizontal: "right",
        vertical: "top"
      };
    }

    if (align === NotificationAlign.BottomLeft) {
      return {
        horizontal: "left",
        vertical: "bottom"
      };
    }

    if (align === NotificationAlign.BottomCenter) {
      return {
        horizontal: "center",
        vertical: "bottom"
      };
    }

    if (align === NotificationAlign.BottomRight) {
      return {
        horizontal: "right",
        vertical: "bottom"
      };
    }

    return {
      horizontal: "center",
      vertical: "top"
    };
  }

  /**
   * Create align container
   * @param align Align
   * @param children Children
   * @param options Other options
   */
  protected createContainer = (
    align: NotificationAlign,
    children: React.ReactNode[]
  ) => {
    // Each align group, class equal to something similar to 'align-topleft'
    const alignText = NotificationAlign[align].toLowerCase();
    let className = `align-${alignText}`;

    if (children.length === 0) {
      return <div key={`empty-${alignText}`} className={className} />;
    }

    if (align === NotificationAlign.Unknown) {
      // div container for style control
      return (
        <div key={`div-${alignText}`} className={className}>
          {children}
        </div>
      );
    }

    // Use SnackBar for layout
    return (
      <Snackbar
        anchorOrigin={NotifierMU.getOrigin(align)}
        className={className}
        key={`layout-${alignText}`}
        sx={
          align === NotificationAlign.Center
            ? { position: "fixed", top: "50%!important" }
            : undefined
        }
        open
      >
        <Box
          display="flex"
          flexDirection="column"
          flexWrap="nowrap"
          key={`box-${alignText}`}
          sx={{
            "& > :not(style) + :not(style)": {
              marginTop: (theme) => theme.spacing(1)
            }
          }}
        >
          {children}
        </Box>
      </Snackbar>
    );
  };

  /**
   * Add raw definition
   * @param data Notification data definition
   * @param modal Show as modal
   */
  protected addRaw(
    data: INotificationBaseReact,
    modal?: boolean
  ): INotificationReact {
    // Destruct
    const {
      type,
      content,
      title,
      align,
      timespan = modal ? 0 : undefined,
      ...rest
    } = data;

    if (this.debug) {
      console.debug("NotificationMU.addRaw", data);
    }

    // Setup
    const n = new NotificationMU(type, content, title, align, timespan);

    // Assign other properties
    Object.assign(n, rest);

    // Is modal
    if (modal != null) n.modal = modal;

    // Add to the collection
    this.add(n);

    // Return
    return n;
  }
}
