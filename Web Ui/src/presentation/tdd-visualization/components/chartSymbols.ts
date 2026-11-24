export type ChartSymbolVariant = "glyph" | "circle";

export const CHART_SYMBOL_VARIANT: ChartSymbolVariant = "circle";

export const CHART_SUCCESS_COLOR = "#2d8a2d";
export const CHART_FAILURE_COLOR = "#c72828";

export const chartSymbols = {
  success: {
    symbol: "check",
    color: CHART_SUCCESS_COLOR,
    size: 30,
    symbolSize: 18,
    strokeWidth: 4,
  },
  failure: {
    symbol: "cross",
    color: CHART_FAILURE_COLOR,
    size: 30,
    symbolSize: 18,
    strokeWidth: 4,
  },
} as const;
