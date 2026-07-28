/**
 * Tooltip content. Hovering a line yields just the entity name; hovering a node
 * fills in the rest, which the panel lays out as `#rank: name` / `metric: value ▲n`.
 */
export interface TooltipPayload {
  name: string;
  rank?: number;
  metricLabel?: string;
  value?: string;
  /** Rank change vs. the previous timestamp: positive = moved up. Null at t=0. */
  delta?: number | null;
}

export default class SvgHandler {
  constructor(id: string);
  renderChart(
    data: any,
    panelWidth: number,
    panelHeight: number,
    header1: string,
    numLines: number,
    tooltipMetric: string,
    theme: any,
    labelMargin: number,
    txtSize: number,
    /** Formats an x-axis tick in the dashboard's timezone. */
    formatDate: (date: Date) => string,
    onMouseOver: (content: TooltipPayload, clientX: number, clientY: number) => void,
    onMouseOut: () => void,
    opts?: { lineWidth?: number }
  ): void;
}
