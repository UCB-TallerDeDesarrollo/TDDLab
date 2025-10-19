import { IdTokenResult, UserCredential } from "firebase/auth";

export const mockUserCredential: UserCredential = {
  // Mock user credential data
  user: {
    uid: "123",
    displayName: "Test User",
    email: "test@example.com",
    emailVerified: false,
    isAnonymous: false,
    providerData: [],
    refreshToken: "",
    tenantId: null,
    phoneNumber: null,
    photoURL: null,
    providerId: "",
    delete: function (): Promise<void> {
      throw new Error("Function not implemented.");
    },
    getIdToken: function (_?: boolean | undefined): Promise<string> {
      throw new Error("Function not implemented.");
    },
    getIdTokenResult: function (
      _?: boolean | undefined
    ): Promise<IdTokenResult> {
      throw new Error("Function not implemented.");
    },
    reload: function (): Promise<void> {
      throw new Error("Function not implemented.");
    },
    toJSON: function (): object {
      throw new Error("Function not implemented.");
    },
    metadata: {},
  },
  providerId: null,
  operationType: "link",
};
