import { createGlobalState } from "react-hooks-global-state";

const { setGlobalState, useGlobalState } = createGlobalState<{
  authData: {
    userProfilePic: string | null;
    userEmail: string | null;
    userCourse: string | null;
  };
}>({
  authData: { userProfilePic: null, userEmail: null, userCourse: null },
});

export { setGlobalState, useGlobalState };
