import { createGlobalState } from "react-hooks-global-state";

const { setGlobalState, useGlobalState } = createGlobalState<{
  authData: {
    userProfilePic: string | undefined;
    userEmail: string | undefined;
    userCourse: string | undefined;
  };
}>({
  authData: {
    userProfilePic: undefined,
    userEmail: undefined,
    userCourse: undefined,
  },
});

export { setGlobalState, useGlobalState };
