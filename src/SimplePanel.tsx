import React from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import {ParseData} from './utils/parser'; 

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {

  
  try {
    let  parsedData = ParseData(data);
    console.log(parsedData); 
  } catch (error) {
      console.error("Parsing error : ", error);
  }

  return (
    <div>Hello World</div>
  );
};

