import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';


interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {

  return (
    <div>Hello World</div>
  );
};

