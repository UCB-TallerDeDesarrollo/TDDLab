import { createGlobalState } from "react-hooks-global-state";

const { setGlobalState, useGlobalState } = createGlobalState({
  authData: { userProfilePic: "", userEmail: "", userCourse: "" },
});
export { setGlobalState, useGlobalState };
