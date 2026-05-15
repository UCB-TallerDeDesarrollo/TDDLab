import { CSSProperties } from "react";

export const fontFamilies = {
  primary: '"Afacad", "Segoe UI", sans-serif',
  mono: '"Consolas", "Courier New", monospace',
} as const;

export const fontWeights = {
  medium: 500,
  bold: 700,
  extraBold: 800,
} as const;

export const typographyVariants = {
  h1: {
    fontFamily: fontFamilies.primary,
    fontSize: "60px",
    fontWeight: fontWeights.bold,
  } satisfies CSSProperties,
  h2: {
    fontFamily: fontFamilies.primary,
    fontSize: "45px",
    fontWeight: fontWeights.bold,
  } satisfies CSSProperties,
  h3: {
    fontFamily: fontFamilies.primary,
    fontSize: "28px",
    fontWeight: fontWeights.bold,
  } satisfies CSSProperties,
  h4: {
    fontFamily: fontFamilies.primary,
    fontSize: "24px",
    fontWeight: fontWeights.extraBold,
  } satisfies CSSProperties,
  h5: {
    fontFamily: fontFamilies.primary,
    fontSize: "18px",
    fontWeight: fontWeights.extraBold,
  } satisfies CSSProperties,
  paragraphBig: {
    fontFamily: fontFamilies.primary,
    fontSize: "18px",
    fontWeight: fontWeights.medium,
  } satisfies CSSProperties,
  paragraphMedium: {
    fontFamily: fontFamilies.primary,
    fontSize: "14px",
    fontWeight: fontWeights.medium,
  } satisfies CSSProperties,
} as const;
