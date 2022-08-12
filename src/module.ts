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
      });
  });
