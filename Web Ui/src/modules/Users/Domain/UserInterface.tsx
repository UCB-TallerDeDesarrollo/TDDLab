export interface UserInterface {
    uid: string,
    displayName: string,
    photoURL: string,
    emailVerified: boolean,
    isAnonymous: boolean,
    metadata: any,
    providerData: any,
    refreshToken: '',
    tenantId: any,
    delete: void,
    getIdToken: void,
    getIdTokenResult: void,
    reload: void,
    toJSON: void,
    email: string,
    phoneNumber: any,
    providerId: string
};