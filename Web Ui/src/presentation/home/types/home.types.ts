export type HomeViewState = "loading" | "error" | "empty" | "success";

export interface HomeAuthData {
  email?: string;
  userId?: number;
}

export interface HomeViewModel {
  viewState: HomeViewState;
  greeting?: string;
  stateTitle?: string;
  stateDescription?: string;
}
