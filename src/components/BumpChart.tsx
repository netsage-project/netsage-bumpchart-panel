import React, { useCallback, useEffect, useState } from 'react';
import { FieldType, GrafanaTheme2, PanelData, PanelProps } from '@grafana/data';
import { Tooltip, useTheme2 } from '@grafana/ui';
import { SimpleOptions } from 'types';
import SvgHandler from './RenderBumpChart';

interface Props extends PanelProps<SimpleOptions> {}

// Validated, colorblind-safe categorical palette (dataviz reference). Assigned in a
// fixed order by final rank and NEVER cycled — entities beyond these hues fall back
// to a neutral gray so two different series can never share a color.
const PALETTE_LIGHT = [
  '#2a78d6', '#1baf7a', '#eda100', '#008300', '#4a3aa7', '#e34948', '#e87ba4', '#eb6834',
];
const PALETTE_DARK = [
  '#3987e5', '#199e70', '#c98500', '#008300', '#9085e9', '#e66767', '#d55181', '#d95926',
];

function transformData(panelData: PanelData, theme: GrafanaTheme2) {
  if (!panelData.series.length) {
    return null;
  }

  const frame = panelData.series[0];
  const timeField = frame.fields.find((f) => f.type === FieldType.time);
  const valueFields = frame.fields.filter((f) => f.type === FieldType.number);

  if (!timeField || !valueFields.length) {
    return null;
  }

  const valueDisplay = valueFields[0].display;
  const numPoints = timeField.values.length;
  if (numPoints === 0) {
    return null;
  }
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

  // Color follows entity identity, assigned by final rank so #1 gets the first slot.
  // A user-set Grafana Color field override wins over the palette slot.
  const palette = theme.isDark ? PALETTE_DARK : PALETTE_LIGHT;
  const overflowColor = theme.colors.text.secondary;
  const finalRankOf = (entityIdx: number) => ranksByTime[numPoints - 1][entityIdx];
  const colorForField = (field: (typeof valueFields)[number], entityIdx: number): string => {
    const override = field.config?.color;
    if (override?.mode === 'fixed' && override.fixedColor) {
      return theme.visualization.getColorByName(override.fixedColor);
    }
    const rank = finalRankOf(entityIdx);
    return rank < palette.length ? palette[rank] : overflowColor;
  };

  const parsedData = valueFields.map((field, entityIdx) => ({
    color: colorForField(field, entityIdx),
    data: Array.from({ length: numPoints }, (_, t) => ({
      date: dates[t],
      rank: ranksByTime[t][entityIdx],
      name: field.name,
      value: field.values[t],
    })),
  }));

  // finalPositions / initialPositions: indexed by rank at the last / first timestamp
  const finalPositions: Array<{ name: string } | null> = new Array(valueFields.length).fill(null);
  const initialPositions: Array<{ name: string } | null> = new Array(valueFields.length).fill(null);
  valueFields.forEach((field, entityIdx) => {
    finalPositions[ranksByTime[numPoints - 1][entityIdx]] = { name: field.name };
    initialPositions[ranksByTime[0][entityIdx]] = { name: field.name };
  });

  // Global value extent for node-size scaling.
  let valueMin = Infinity;
  let valueMax = -Infinity;
  valueFields.forEach((field) => {
    for (let t = 0; t < numPoints; t++) {
      const v = field.values[t];
      if (v == null || Number.isNaN(v)) {
        continue;
      }
      if (v < valueMin) {
        valueMin = v;
      }
      if (v > valueMax) {
        valueMax = v;
      }
    }
  });
  if (!Number.isFinite(valueMin)) {
    valueMin = 0;
    valueMax = 0;
  }

  return {
    parsedData,
    finalPositions,
    initialPositions,
    dates,
    display: valueDisplay,
    valueExtent: [valueMin, valueMax] as [number, number],
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
    const chartData = transformData(data, theme);
    if (!chartData) {
      console.error('NO DATA');
      return;
    }

    const numLines = parseInt(replaceVariables(String(options.linecount)), 10);

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
      onMouseOut,
      {
        nodeSizeByValue: options.nodeSizeByValue,
        lineWidth: options.lineWidth,
      }
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
