export interface HomeFeatureLink {
  title: string;
  path: string;
  access: string[];
}

export interface HomeViewModel {
  greeting: string;
  availableLinks: HomeFeatureLink[];
}
