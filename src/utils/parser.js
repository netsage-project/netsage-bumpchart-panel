import { DataFrameView } from '@grafana/data';

export function ParseData(data) {
  let alpha = 1;

  let colorPal = [
    'rgba(223, 79, 79,' + alpha + ')',
    'rgba(88, 223, 79,' + alpha + ')',
    'rgba(79, 145, 223,' + alpha + ')',
    'rgba(223, 79, 168,' + alpha + ')',
    'rgba(223, 155, 79,' + alpha + ')',
    'rgba(79, 223, 192,' + alpha + ')',
    'rgba(138, 79, 223,' + alpha + ')',
    'rgba(166, 223, 79,' + alpha + ')',
    'rgba(147, 50, 55,' + alpha + ')',
    'rgba(50, 147, 142,' + alpha + ')',
    'rgba(59, 147, 50,' + alpha + ')',
    'rgba(94, 50, 147,' + alpha + ')',
    'rgba(147, 78, 50,' + alpha + ')',
    'rgba(50, 81, 147,' + alpha + ')',
  ];

  let dataSeries = data.series;
  if (dataSeries.length == 0) {
    console.error('no data');
    return [];
  }
  const display = dataSeries.map((series) => series.fields.find((field) => field.type === 'number'))[0].display;
  // extract raw data
  let parsedData = [];
  dataSeries.forEach((line) => {
    const frame = new DataFrameView(line);
    const thisName = frame.data.name ? frame.data.name : frame.data.refId;
    const thisIndex = dataSeries.indexOf(line);
    const thisTimeField = frame.data.fields.find((field) => field.type === 'time');
    const thisValueField = frame.data.fields.find((field) => field.type === 'number');
    let thisData = [];
    frame.forEach((row) => {
      let suffix = thisValueField.display(row[thisValueField.name]).suffix
        ? thisValueField.display(row[thisValueField.name]).suffix
        : '';
      thisData.push({
        date: row[thisTimeField.name],
        valueRaw: row[thisValueField.name],
        value: thisValueField.display(row[thisValueField.name]).text,
        suffix: suffix,
        rank: 0,
        originalIndex: thisIndex,
      });
    });
    parsedData.push({ name: thisName, data: thisData });
  });

  // assign ranks to data
  for (var i = 0; i < parsedData[0].data.length; i++) {
    // for each date
    let tempArray = [];
    parsedData.forEach((row) => {
      tempArray.push(row.data[i]); // collect data points for each row
    });
    tempArray.sort((a, b) => {
      // sort them by value
      return b.valueRaw - a.valueRaw;
    });
    for (var r = 0; r < tempArray.length; r++) {
      parsedData[tempArray[r].originalIndex].data[i].rank = r; // assign rank
    }
  }

  // add color and org to data points

  for (var i = 0; i < parsedData.length; i++) {
    for (var j = 0; j < parsedData[0].data.length; j++) {
      parsedData[i].data[j].name = parsedData[i].name;
      parsedData[i].data[j].color = colorPal[i % colorPal.length];
    }
  }

  // Starting pos = parsedData[i].name
  // Find final positions
  let finalPositions = [];
  for (var i in parsedData) {
    let last = parsedData[i].data[parsedData[i].data.length - 1];
    finalPositions[i] = {
      name: last.name,
      rank: last.rank,
    };
  }
  finalPositions.sort((a, b) => {
    return a.rank - b.rank;
  });

  // list of dates for x axis
  let dates = [];
  for (var i = 0; i < parsedData[0].data.length; i++) {
    dates[i] = parsedData[0].data[i].date;
  }

  let returnObj = {
    parsedData: parsedData,
    finalPositions: finalPositions,
    colorPal: colorPal,
    dates: dates,
    display: display,
  };

  return returnObj;
}
