import { IdTokenResult, User } from "firebase/auth";

export const mockUserCredentials: User = {
    photoURL: "https://avatars.githubusercontent.com/u/73673310?v=4",
    displayName: "ReneDiaz_18",
    emailVerified: false,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: function (): Promise<void> {
        throw new Error('Function not implemented.');
    },
    getIdToken: function (): Promise<string> {
        throw new Error('Function not implemented.');
    },
    getIdTokenResult: function (): Promise<IdTokenResult> {
        throw new Error('Function not implemented.');
    },
    reload: function (): Promise<void> {
        throw new Error('Function not implemented.');
    },
    toJSON: function (): object {
        throw new Error('Function not implemented.');
    },
    email: null,
    phoneNumber: null,
    providerId: '',
    uid: ''
};