import { ReactElement } from "react";

export type NavLink = {
  title: string;
  path: string;
  icon: ReactElement;
  access: string[];
};