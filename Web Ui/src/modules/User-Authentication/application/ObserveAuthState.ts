import { AuthManager } from "../domain/AuthManager";
import { UserDomain } from "../domain/User";

class ObserveAuthState {
  constructor(private readonly authManager: AuthManager) {}

  execute(callback: (user: UserDomain | null) => void): () => void {
    return this.authManager.onAuthStateChanged(callback);
  }
}

export default ObserveAuthState;
