import { createGlobalState } from "react-hooks-global-state";

const { setGlobalState, useGlobalState } = createGlobalState<{
  authData: {
    userid: number | undefined;
    userProfilePic: string | undefined;
    userEmail: string | undefined;
    usergroupid: number | undefined;
    userRole: string | undefined;
  };
}>({
  authData: {
    userid: undefined,
    userProfilePic: undefined,
    userEmail: undefined,
    usergroupid: undefined,
    userRole: undefined,
  },
});

export { setGlobalState, useGlobalState };
