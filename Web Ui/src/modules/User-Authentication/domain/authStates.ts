import { createGlobalState } from "react-hooks-global-state";

const { setGlobalState, useGlobalState } = createGlobalState<{
  authData: {
    id: number;
    userProfilePic: string | undefined;
    userEmail: string | undefined;
    usergroupid: number | undefined;
    userRole: string | undefined;
  };
}>({
  authData: {
    id: 0,
    userProfilePic: undefined,
    userEmail: undefined,
    usergroupid: undefined,
    userRole: undefined,
  },
});

export { setGlobalState, useGlobalState };
