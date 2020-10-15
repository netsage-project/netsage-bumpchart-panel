import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './SimplePanel';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions(builder => {
  return builder
    .addNumberInput({
      path: 'linecount',
      name: 'Number of lines',
      description: 'Number of lines to show',
      defaultValue:10
    })
    .addTextInput({
      path:'headerText', 
      name:"Axis Header",
      description:'Axis header display', 
      defaultValue:"Axis header"
    })
});
