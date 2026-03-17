import React, { useCallback, useEffect, useState } from 'react';
import { FieldType, PanelData, PanelProps } from '@grafana/data';
import { Tooltip, useTheme2 } from '@grafana/ui';
import { SimpleOptions } from 'types';
import SvgHandler from './RenderBumpChart';
import './styles.css';

interface Props extends PanelProps<SimpleOptions> {}

const COLOR_PALETTE = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
  '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
  '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5',
];

function transformData(panelData: PanelData) {
  if (!panelData.series.length) {
    return null;
  }

  const frame = panelData.series[0];
  const timeField = frame.fields.find((f) => f.type === FieldType.time);
  const valueFields = frame.fields.filter((f) => f.type === FieldType.number);
  const valueDisplay = valueFields[0].display;

  if (!timeField || !valueFields.length) {
    return null;
  }

  const numPoints = timeField.values.length;
  const dates: Date[] = Array.from({ length: numPoints }, (_, i) => new Date(timeField.values[i]));

  // For each timestamp, rank entities by value descending (higher value = rank 0 = top)
  const ranksByTime: number[][] = [];
  for (let t = 0; t < numPoints; t++) {
    const indexed = valueFields.map((f, i) => ({ idx: i, value: f.values[t] ?? 0 }));
    indexed.sort((a, b) => b.value - a.value);
    const ranks = new Array(valueFields.length);
    indexed.forEach((entry, rank) => {
      ranks[entry.idx] = rank;
    });
    ranksByTime.push(ranks);
  }

  const parsedData = valueFields.map((field, entityIdx) => ({
    data: Array.from({ length: numPoints }, (_, t) => ({
      date: dates[t],
      rank: ranksByTime[t][entityIdx],
      name: field.name,
      value: field.values[t],
    })),
  }));


  // finalPositions: indexed by rank at the last timestamp, value is { name }
  const finalPositions: Array<{ name: string } | null> = new Array(valueFields.length).fill(null);
  valueFields.forEach((field, entityIdx) => {
    const finalRank = ranksByTime[numPoints - 1][entityIdx];
    finalPositions[finalRank] = { name: field.name };
  });

  return {
    parsedData,
    finalPositions,
    colorPal: COLOR_PALETTE,
    dates,
    display: valueDisplay,
  };
}

export const BumpChart: React.FC<Props> = ({ options, data, width, height, id, replaceVariables }) => {
  const theme = useTheme2();
  const [tooltipState, setTooltipState] = useState<{ show: boolean; content: string; x: number; y: number }>({
    show: false,
    content: '',
    x: 0,
    y: 0,
  });

  const onMouseOver = useCallback(
    (content: string, clientX: number, clientY: number) => {
      const panelEl = document.getElementById('Chart_' + id);
      const rect = panelEl?.getBoundingClientRect();
      const x = clientX - (rect?.left ?? 0);
      const y = clientY - (rect?.top ?? 0);
      setTooltipState({ show: true, content, x, y });
    },
    [id]
  );

  const onMouseOut = useCallback(() => {
    setTooltipState((prev) => ({ ...prev, show: false }));
  }, []);

  useEffect(() => {
    const chartData = transformData(data);
    if (!chartData) {
      console.error('NO DATA');
      return;
    }

    const numLines = parseInt(replaceVariables(options.linecount), 10);

    const chart = new SvgHandler('Chart_' + id);
    chart.renderChart(
      chartData,
      width,
      height,
      options.headerText,
      numLines,
      options.tooltipMetric,
      theme,
      options.labelMargin,
      options.txtSize,
      options.dateFormat,
      onMouseOver,
      onMouseOut
    );
  }, [data, width, height, options, theme, id, replaceVariables, onMouseOver, onMouseOut]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <div id={'Chart_' + id} style={{ height, width }} />
      <Tooltip content={tooltipState.content} show={tooltipState.show} placement="top">
        <div
          style={{
            position: 'absolute',
            left: tooltipState.x,
            top: tooltipState.y,
            width: 1,
            height: 1,
            pointerEvents: 'none',
          }}
        />
      </Tooltip>
    </div>
  );
};
