export type ChartSymbolVariant = "glyph" | "circle";

export const CHART_SYMBOL_VARIANT: ChartSymbolVariant = "circle";

export const chartSymbols = {
  success: {
    symbol: "check",
    color: "#2d8a2d",
    size: 30,
    symbolSize: 18,
    strokeWidth: 4,
  },
  failure: {
    symbol: "cross",
    color: "#c72828",
    size: 30,
    symbolSize: 18,
    strokeWidth: 4,
  },
} as const;
