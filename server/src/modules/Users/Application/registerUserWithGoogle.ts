import { registerUser } from "./registerUser";
import { TokenVerifier } from "../Domain/TokenVerifier";
import { FirebaseTokenVerifier } from "../Infrastructure/FirebaseTokenVerifier";

export const registerUserWithGoogle = async (
  idToken: string,
  groupid: number,
  role: string,
  tokenVerifier: TokenVerifier = new FirebaseTokenVerifier()
): Promise<void> => {
  const email = await tokenVerifier.verifyAndExtractEmail(idToken);
  await registerUser({ email, groupid, role });
};

