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
  IPageData,
  IStateProps,
  NotificationReactCallProps,
  PageAction,
  PageActionType,
  PageState,
  UserAction,
  UserActionType,
  UserCalls,
  UserState
} from "@etsoo/react";
import { NavigateFunction, NavigateOptions } from "react-router";

/**
 * React Application Type
 */
export type ReactAppType = IApp & IReactAppBase;

/**
 * Global application
 */
export let globalApp: ReactAppType | null;

/**
 * React app state detector
 * Case 1: undefined, when refresh the whole page
 * Case 2: false, unauthorized
 * Case 3: true, authorized or considered as authorized (maynot, like token expiry)
 * Case 4: property or properties changed
 * @param props Props
 * @returns Component
 */
export function ReactAppStateDetector(props: IStateProps) {
  // Destruct
  const { targetFields, update } = props;

  // Context
  const { state } =
    globalApp == null
      ? ({} as UserCalls<IUser>)
      : React.useContext(globalApp.userState.context);

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
 * React implemented base
 */
export interface IReactAppBase {
  /**
   * Override Notifier as React specific
   */
  readonly notifier: INotifier<React.ReactNode, NotificationReactCallProps>;

  /**
   * User state
   */
  readonly userState: UserState<any>;

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
   * Set page data
   * @param data Page data
   */
  setPageData(data: IPageData): void;

  /**
   * Set page title and subtitle
   * @param title Page title
   * @param subtitle Page subtitle
   */
  setPageTitle(title: string, subtitle?: string): void;

  /**
   * Set page title and data
   * @param title Page title
   */
  setPageTitle(title: string): void;

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
}

/**
 * Core application interface
 */
export interface IReactApp<
  S extends IAppSettings,
  D extends IUser,
  P extends IPageData
> extends ICoreApp<D, S, React.ReactNode, NotificationReactCallProps>,
    IReactAppBase {
  /**
   * User state
   */
  readonly userState: UserState<D>;

  /**
   * Set page data
   * @param data Page data
   */
  setPageData(data: P): void;
}

/**
 * React application
 */
export class ReactApp<
    S extends IAppSettings,
    D extends IUser,
    P extends IPageData
  >
  extends CoreApp<D, S, React.ReactNode, NotificationReactCallProps>
  implements IReactApp<S, D, P>
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
   * Page state
   */
  readonly pageState: PageState<P>;

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
   * Page state dispatch
   */
  pageStateDispatch?: React.Dispatch<PageAction<P>>;

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
    this.pageState = new PageState<P>();

    globalApp = this;
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
      onFailure = () => {
        this.toLoginPage(rest);
      },
      onSuccess,
      ...rest
    } = data ?? {};

    // Check status
    const result = await super.tryLogin(data);
    if (!result) {
      onFailure();
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
          onFailure();
        } else if (result != null && this.tryLoginIgnoreResult(result)) {
          // Ignore the result warning
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
   * Set page data
   * @param data Page data
   */
  setPageData(data: P): void {
    // Dispatch the change
    if (this.pageStateDispatch != null) {
      this.pageStateDispatch({
        type: PageActionType.Data,
        data
      });
    }
  }

  /**
   * Set page title and subtitle
   * @param title Page title
   * @param subtitle Page subtitle
   */
  setPageTitle(title: string, subtitle?: string): void {
    // Data
    const data = { title, subtitle } as P;

    // Dispatch the change
    if (this.pageStateDispatch != null) {
      this.pageStateDispatch({
        type: PageActionType.Title,
        data
      });
    }
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
   * Set page title and data
   * @param key Page title resource key
   */
  setPageKey(key: string): void {
    this.setPageTitle(this.get<string>(key) ?? "");
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
