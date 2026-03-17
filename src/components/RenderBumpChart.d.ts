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
    dateFormat: string,
    onMouseOver: (content: string, clientX: number, clientY: number) => void,
    onMouseOut: () => void
  ): void;
}
