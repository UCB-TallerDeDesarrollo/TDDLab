export type ChartSymbolVariant = "glyph" | "circle";

export const CHART_SYMBOL_VARIANT: ChartSymbolVariant = "glyph";

export const chartSymbols = {
  success: {
    symbol: "✓",
    color: "#2d8a2d",
    size: 30,
    strokeWidth: 1.5,
  },
  failure: {
    symbol: "✕",
    color: "#c72828",
    size: 30,
    strokeWidth: 1.5,
  },
} as const;
