import { getUserByemail } from "./getUserByemailUseCase";
import { getUserToken } from "./getUserToken";
import { TokenVerifier } from "../Domain/TokenVerifier";
import { FirebaseTokenVerifier } from "../Infrastructure/FirebaseTokenVerifier";
import { User } from "../Domain/User";

export const loginUserWithGoogle = async (
  idToken: string,
  tokenVerifier: TokenVerifier = new FirebaseTokenVerifier()
): Promise<{ user: User; jwtToken: string }> => {
  const email = await tokenVerifier.verifyAndExtractEmail(idToken);
  const userResult = await getUserByemail(email);
  
  if (!userResult || "error" in userResult || userResult === null) {
    throw new Error("Usuario no encontrado");
  }

  const user = userResult as User;
  const jwtToken = await getUserToken(user);
  
  return { user, jwtToken };
};

