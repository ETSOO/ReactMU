import {
  AppTryLoginParams,
  BridgeUtils,
  CoreApp,
  FormatResultCustomCallback,
  IApp,
  IAppSettings,
  ICoreApp,
  IUser
} from "@etsoo/appscript";
import {
  INotifier,
  NotificationMessageType,
  NotificationRenderProps,
  NotificationReturn
} from "@etsoo/notificationbase";
import { DataTypes, IActionResult, WindowStorage } from "@etsoo/shared";
import React from "react";
import { NotifierMU } from "../NotifierMU";
import { ProgressCount } from "../ProgressCount";
import { Labels } from "./Labels";
import {
  CultureAction,
  CultureState,
  INotificationReact,
  InputDialogProps,
  IStateProps,
  NotificationReactCallProps,
  UserAction,
  UserActionType,
  UserCalls,
  useRequiredContext,
  UserState
} from "@etsoo/react";
import { NavigateFunction, NavigateOptions } from "react-router";

/**
 * React Application Type
 */
export type ReactAppType = IApp & IReactAppBase;

/**
 * React application context
 */
export const ReactAppContext = React.createContext<ReactAppType | null>(null);

/**
 * Get React application context hook
 * @returns React application
 */
export function useAppContext() {
  return React.useContext(ReactAppContext);
}

/**
 * Get React application context hook
 * @returns React application
 */
export function useRequiredAppContext() {
  return useRequiredContext(ReactAppContext);
}

/**
 * React implemented base
 */
export interface IReactAppBase {
  /**
   * Override Notifier as React specific
   */
  readonly notifier: INotifier<React.ReactNode, NotificationReactCallProps>;

  /**
   * Is screen size down 'sm'
   */
  smDown?: boolean;

  /**
   * Is screen size up 'md'
   */
  mdUp?: boolean;

  /**
   * Get date format props
   * @returns Props
   */
  getDateFormatProps(): object;

  /**
   * Get money format props
   * @param currency Currency, if undefined, default currency applied
   * @returns Props
   */
  getMoneyFormatProps(currency?: string): object;

  /**
   * Show input dialog
   * @param props Props
   */
  showInputDialog({
    title,
    message,
    callback,
    ...rest
  }: InputDialogProps): INotificationReact;

  /**
   * State detector component
   * @param props Props
   */
  stateDetector(props: IStateProps): React.ReactNode;
}

/**
 * Core application interface
 */
export interface IReactApp<S extends IAppSettings, D extends IUser>
  extends ICoreApp<D, S, React.ReactNode, NotificationReactCallProps>,
    Omit<IReactAppBase, "userState"> {
  /**
   * User state
   */
  readonly userState: UserState<D>;
}

/**
 * React application
 */
export class ReactApp<S extends IAppSettings, D extends IUser>
  extends CoreApp<D, S, React.ReactNode, NotificationReactCallProps>
  implements IReactApp<S, D>
{
  private static _notifierProvider: React.FunctionComponent<NotificationRenderProps>;

  /**
   * Get notifier provider
   */
  static get notifierProvider() {
    return this._notifierProvider;
  }

  private static createNotifier(debug: boolean) {
    // Notifier
    ReactApp._notifierProvider = NotifierMU.setup(undefined, debug);
    return NotifierMU.instance;
  }

  /**
   * Culture state
   */
  readonly cultureState: CultureState;

  /**
   * User state
   */
  readonly userState = new UserState<D>();

  /**
   * Is screen size down 'sm'
   */
  smDown?: boolean;

  /**
   * Is screen size up 'md'
   */
  mdUp?: boolean;

  /**
   * Navigate function
   */
  navigateFunction?: NavigateFunction;

  /**
   * User state dispatch
   */
  userStateDispatch?: React.Dispatch<UserAction<D>>;

  /**
   * Constructor
   * @param settings Settings
   * @param name Application name
   * @param debug Debug mode
   */
  constructor(settings: S, name: string, debug: boolean = false) {
    super(
      settings,
      null,
      ReactApp.createNotifier(debug),
      new WindowStorage(),
      name,
      debug
    );

    if (BridgeUtils.host) {
      BridgeUtils.host.onUpdate((app, version) => {
        this.notifier.message(
          NotificationMessageType.Success,
          this.get("updateTip") + `(${[app, version].join(", ")})`,
          this.get("updateReady")
        );
      });
    }

    this.cultureState = new CultureState(settings.currentCulture);
  }

  /**
   * Override alert action result
   * @param result Action result
   * @param callback Callback
   * @param forceToLocal Force to local labels
   */
  override alertResult(
    result: IActionResult | string,
    callback?: NotificationReturn<void>,
    forceToLocal?: FormatResultCustomCallback
  ) {
    const message =
      typeof result === "string"
        ? result
        : this.formatResult(result, forceToLocal);
    if (message.endsWith(")")) {
      const startPos = message.lastIndexOf("(");
      if (startPos > 0) {
        const main = message.substring(0, startPos).trim();
        const tip = message.substring(startPos);

        const titleNode = React.createElement(
          React.Fragment,
          null,
          main,
          React.createElement("br"),
          React.createElement("span", { style: { fontSize: "9px" } }, tip)
        );

        this.notifier.alert(titleNode, callback);
        return;
      }
    }
    super.alertResult(message, callback);
  }

  /**
   * Change culture
   * @param culture New culture definition
   */
  override async changeCulture(culture: DataTypes.CultureDefinition) {
    // Super call to update cultrue
    const resources = await super.changeCulture(culture);

    // Update component labels
    Labels.setLabels(resources, {
      notificationMU: {
        alertTitle: "warning",
        alertOK: "ok",
        confirmTitle: "confirm",
        confirmYes: "ok",
        confirmNo: "cancel",
        promptTitle: "prompt",
        promptCancel: "cancel",
        promptOK: "ok"
      }
    });

    // Document title
    // Default is servier name's label or appName label
    const title = this.get(this.name) ?? this.get("appName") ?? this.name;
    const host = BridgeUtils.host;
    if (host) {
      // Notify host
      host.changeCulture(culture.name);
      host.setTitle(title);
    } else {
      document.title = title;
    }

    return resources;
  }

  /**
   * Change culture extended
   * @param dispatch Dispatch method
   * @param culture New culture definition
   */
  changeCultureEx(
    dispatch: React.Dispatch<CultureAction>,
    culture: DataTypes.CultureDefinition
  ): void {
    // Same?
    if (culture.name === this.culture) return;

    // Super call
    this.changeCulture(culture).then(() => {
      // Dispatch action
      dispatch(culture);
    });
  }

  /**
   * Get date format props
   * @returns Props
   */
  getDateFormatProps() {
    return { culture: this.culture, timeZone: this.getTimeZone() };
  }

  /**
   * Get money format props
   * @param currency Currency, if undefined, default currency applied
   * @returns Props
   */
  getMoneyFormatProps(currency?: string) {
    return { culture: this.culture, currency: currency ?? this.currency };
  }

  /**
   * Fresh countdown UI
   * @param callback Callback
   */
  freshCountdownUI(callback?: () => PromiseLike<unknown>) {
    // Labels
    const labels = this.getLabels("cancel", "tokenExpiry");

    // Progress
    const progress = React.createElement(ProgressCount, {
      seconds: 30,
      valueUnit: "s",
      onComplete: () => {
        // Stop the progress
        return false;
      }
    });

    // Popup
    this.notifier.alert(
      labels.tokenExpiry,
      async () => {
        if (callback) await callback();
        else await this.tryLogin();
      },
      undefined,
      {
        okLabel: labels.cancel,
        primaryButtonProps: { fullWidth: true, autoFocus: false },
        inputs: progress
      }
    );
  }

  /**
   * Try login
   * @param data Try login parameters
   * @returns Result
   */
  override async tryLogin(data?: AppTryLoginParams) {
    // Destruct
    const {
      onFailure = (type: string) => {
        console.log(`Try login failed: ${type}.`);
        this.toLoginPage(rest);
      },
      onSuccess,
      ...rest
    } = data ?? {};

    // Check status
    const result = await super.tryLogin(data);
    if (!result) {
      onFailure("ReactAppSuperTryLoginFailed");
      return false;
    }

    // Refresh token
    await this.refreshToken(
      {
        showLoading: data?.showLoading
      },
      (result) => {
        if (result === true) {
          onSuccess?.();
        } else if (result === false) {
          onFailure("ReactAppRefreshTokenFailed");
        } else if (result != null && !this.tryLoginIgnoreResult(result)) {
          onFailure("ReactAppRefreshTokenFailed: " + JSON.stringify(result));
        } else {
          // Ignore other results
          onFailure(
            "ReactAppRefreshTokenIgnoredFailure: " + JSON.stringify(result)
          );
          return true;
        }
      }
    );

    return true;
  }

  /**
   * Check if the action result should be ignored during try login
   * @param result Action result
   * @returns Result
   */
  protected tryLoginIgnoreResult(result: IActionResult) {
    // Ignore no token warning
    if (result.type === "noData" && result.field === "token") return true;
    else return false;
  }

  /**
   * Navigate to Url or delta
   * @param url Url or delta
   * @param options Options
   */
  override navigate<T extends number | string | URL>(
    to: T,
    options?: T extends number ? never : NavigateOptions
  ) {
    if (this.navigateFunction == null) super.navigate(to, options);
    else if (typeof to === "number") this.navigateFunction(to);
    else this.navigateFunction(to, options);
  }

  /**
   * Show input dialog
   * @param props Props
   */
  showInputDialog({
    title,
    message,
    callback,
    ...rest
  }: InputDialogProps): INotificationReact {
    return this.notifier.prompt<HTMLFormElement | undefined>(
      message,
      callback,
      title,
      rest
    );
  }

  stateDetector(props: IStateProps) {
    // Destruct
    const { targetFields, update } = props;

    // Context
    const { state } = React.useContext(this.userState.context);

    // Ready
    React.useEffect(() => {
      // Match fields
      const changedFields = state.lastChangedFields;
      let matchedFields: string[] | undefined;
      if (targetFields == null || changedFields == null) {
        matchedFields = changedFields;
      } else {
        matchedFields = [];
        targetFields.forEach((targetField) => {
          if (changedFields.includes(targetField))
            matchedFields?.push(targetField);
        });
      }

      // Callback
      update(state.authorized, matchedFields);
    }, [state]);

    // return
    return React.createElement(React.Fragment);
  }

  /**
   * User login extended
   * @param user New user
   * @param refreshToken Refresh token
   * @param dispatch User state dispatch
   */
  override userLogin(user: D, refreshToken: string, dispatch?: boolean): void {
    // Super call, set token
    super.userLogin(user, refreshToken);

    // Dispatch action
    if (this.userStateDispatch != null && dispatch !== false)
      this.userStateDispatch({
        type: UserActionType.Login,
        user
      });
  }

  /**
   * User logout
   * @param clearToken Clear refresh token or not
   * @param noTrigger No trigger for state change
   */
  override userLogout(
    clearToken: boolean = true,
    noTrigger: boolean = false
  ): void {
    // Super call
    super.userLogout(clearToken);

    // Dispatch action
    if (!noTrigger && this.userStateDispatch != null)
      this.userStateDispatch({
        type: UserActionType.Logout
      });
  }

  /**
   * User unauthorized
   */
  override userUnauthorized() {
    // Super call
    super.userUnauthorized();

    if (this.userStateDispatch != null) {
      // There is delay during state update
      // Not a good idea to try login multiple times with API calls
      this.userStateDispatch({
        type: UserActionType.Unauthorized
      });
    }
  }
}
