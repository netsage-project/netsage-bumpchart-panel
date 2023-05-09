import { FieldConfigProperty, PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './BumpchartPanel';
import { standardOptionsCompat } from 'grafana-plugin-support';

const buildStandardOptions = (): any => {
  const options = [FieldConfigProperty.Unit, FieldConfigProperty.Color];
  return standardOptionsCompat(options);
};

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel)
  .useFieldConfig({
    disableStandardOptions: [
    FieldConfigProperty.NoValue,
    FieldConfigProperty.Max,
    FieldConfigProperty.Min,
    FieldConfigProperty.DisplayName,
    FieldConfigProperty.Thresholds,
    FieldConfigProperty.Color
  ],
    standardOptions: buildStandardOptions(),
  })
  .setPanelOptions((builder) => {
    return builder
      .addNumberInput({
        path: 'linecount',
        name: 'Number of lines',
        description: 'Number of lines to show',
        defaultValue: 10,
      })
      .addTextInput({
        path: 'headerText',
        name: 'Axis Header',
        description: 'Axis header display',
        defaultValue: 'Axis header',
      })
      .addTextInput({
        path: 'tooltipMetric',
        name: 'Tooltip text for value',
        description: 'Text to describe metric',
        defaultValue: 'Value',
      })
      .addNumberInput({
        path: 'labelMargin',
        name: 'Label Width',
        description: 'Width of right margin for labels',
        defaultValue: 150,
      })
      .addNumberInput({
        path: 'txtSize',
        name: 'Label Size',
        description: 'The text size of the label',
        defaultValue: 10,
      });
  });
