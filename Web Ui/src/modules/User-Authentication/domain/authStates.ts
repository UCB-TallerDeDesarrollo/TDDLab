import { createGlobalState } from "react-hooks-global-state";

const { setGlobalState, useGlobalState } = createGlobalState<{
  authData: {
    userProfilePic: string | undefined;
    userEmail: string | undefined;
    usergroupid: number | undefined;
    userRole: string | undefined;
  };
}>({
  authData: {
    userProfilePic: undefined,
    userEmail: undefined,
    usergroupid: undefined,
    userRole: undefined,
  },
});

export { setGlobalState, useGlobalState };
