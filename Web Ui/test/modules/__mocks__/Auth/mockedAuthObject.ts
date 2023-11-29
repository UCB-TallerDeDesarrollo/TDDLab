import {
  Auth,
  CompleteFn,
  ErrorFn,
  NextOrObserver,
  Persistence,
  Unsubscribe,
  User,
} from "firebase/auth";

export const mockAuth: Auth = {
  app: {
    name: "",
    options: {},
    automaticDataCollectionEnabled: false,
  },
  name: "",
  config: {
    apiKey: "",
    apiHost: "",
    apiScheme: "",
    tokenApiHost: "",
    sdkClientVersion: "",
  },
  setPersistence: function (_: Persistence): Promise<void> {
    throw new Error("Function not implemented.");
  },
  languageCode: null,
  tenantId: null,
  settings: {
    appVerificationDisabledForTesting: false,
  },
  onAuthStateChanged: function (_: NextOrObserver<User | null>): Unsubscribe {
    throw new Error("Function not implemented.");
  },
  beforeAuthStateChanged: function (
    _: (user: User | null) => void | Promise<void>,
    _onAbort?: (() => void) | undefined
  ): Unsubscribe {
    throw new Error("Function not implemented.");
  },
  onIdTokenChanged: function (
    _: NextOrObserver<User | null>,
    _error?: ErrorFn | undefined,
    _completed?: CompleteFn | undefined
  ): Unsubscribe {
    throw new Error("Function not implemented.");
  },
  authStateReady: function (): Promise<void> {
    throw new Error("Function not implemented.");
  },
  currentUser: null,
  emulatorConfig: null,
  updateCurrentUser: function (_: User | null): Promise<void> {
    throw new Error("Function not implemented.");
  },
  useDeviceLanguage: function (): void {
    throw new Error("Function not implemented.");
  },
  signOut: function (): Promise<void> {
    throw new Error("Function not implemented.");
  },
};
