import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import {ParseData} from './utils/parser'; 
import { Canvas } from 'Components/Canvas';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height, id }) => {
  let graph_options = {
    ...options
  }
  var parsedData = {};
  try {
    parsedData = ParseData(data);
    console.log(parsedData); 
  } catch (error) {
      console.error("Parsing error : ", error);
  }

  return <Canvas height={height} width={width} panelId={id} options={graph_options} data={parsedData} />;

};

