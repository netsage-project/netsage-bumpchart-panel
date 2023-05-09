import React, { useEffect } from 'react';
import SvgHandler from './RenderBumpChart.js';
import '../css/styles.css';
import { useTheme2 } from '@grafana/ui';

export const Canvas = (props: { panelId: any; data: any; options: {
  txtSize: any;
  labelMargin: number; headerText: String; linecount: number; tooltipMetric: String; 
}; height: any; width: any; }) => {
  const theme = useTheme2();
  useEffect(() => {
    console.log('rendering');
    const id = props.panelId;
    // const chartDiv = document.getElementById('Chart_' + id);
    const chart = new SvgHandler('Chart_' + id);

    // data, ctrl, header1, header2
    if (props.data) {
      chart.renderChart(props.data, props.options.headerText, props.options.linecount, props.options.tooltipMetric, theme, props.options.labelMargin, props.options.txtSize);
    } else {
      console.log('NO DATA');
    }
  });

  return <div id={'Chart_' + props.panelId} style={{ height: props.height, width: props.width }}></div>;
};
