import React, { useEffect } from 'react';
import  SvgHandler from './RenderBumpChart.js';
import '../css/styles.css';

// import Chart from 'chart.heatmap.js';
export const Canvas = props => {

  useEffect(() => {
    console.log('rendering');
    const id = props.panelId;
    // const chartDiv = document.getElementById('Chart_' + id);
    const chart = new SvgHandler('Chart_' + id);
    console.log(chart);

    // data, ctrl, header1, header2
    chart.renderChart(props.data, props.options.linecount, props.options.headerText);

  });



  return (
      <div id={'Chart_' + props.panelId} style={{ height: props.height, width: props.width }}></div>
  );
};
