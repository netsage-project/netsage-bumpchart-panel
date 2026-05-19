import { FieldConfigProperty, PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { BumpChart } from './components/BumpChart';
import { standardOptionsCompat } from 'grafana-plugin-support';


const buildStandardOptions = (): any => {
  const options = [FieldConfigProperty.Unit, FieldConfigProperty.Color];
  return standardOptionsCompat(options);
};

export const plugin = new PanelPlugin<SimpleOptions>(BumpChart)
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
    .addTextInput({
      path: 'headerText',
      name: 'Header Text',
      description: 'Label shown above the right-side axis',
      defaultValue: 'Top Talkers',
    })
    .addTextInput({
      path: 'linecount',
      name: 'Number of Lines',
      description: 'Maximum number of lines to display',
      defaultValue: '10',
    })
    .addSelect({
      path: 'dateFormat',
      name: 'Date Time Format',
      description: 'Select the format you would like to use for the x axis',
      settings: {
        options: [
          {label: 'Date only', value: '%m/%d/%y'},
          {label: 'Time only', value: '%H:%M'},
          {label: 'Date & Time', value: '%m/%d %H:%M'},
        ]
      },
      defaultValue: '%m/%d/%y',
    })
    .addTextInput({
      path: 'tooltipMetric',
      name: 'Tooltip Metric Label',
      description: 'Label for the metric value shown in tooltips',
      defaultValue: 'Value',
    })
    .addNumberInput({
      path: 'labelMargin',
      name: 'Label Margin (px)',
      description: 'Right margin width reserved for axis labels',
      defaultValue: 150,
    })
    .addNumberInput({
      path: 'txtSize',
      name: 'Text Size (px)',
      description: 'Font size for axis tick labels',
      defaultValue: 12,
    });
});
