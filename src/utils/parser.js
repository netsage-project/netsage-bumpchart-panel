export function ParseData(data) {
  // console.log(data);
  let parsedData = [];
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
  console.log(dataSeries);
  if (dataSeries.length == 0) {
    return [];
  }
  // console.log(dataSeries[0].fields);


  // extract raw data by org
  for (var i = 0; i < dataSeries.length; i++) {
    var org = dataSeries[i].name;
    parsedData[i] = { org: org, data: [] };
    let inner_buckets = dataSeries[i].fields;
    for (var j = 0; j < inner_buckets[0].values.length; j++) {
      let date = inner_buckets[0].values.buffer[j];
      let value = inner_buckets[1].values.buffer[j];
      parsedData[i].data[j] = { date: date, value: value, rank: 0, orig_index: parseInt(i) };
    }
  }

  // assign ranks to data
  for (var i = 0; i < parsedData[0].data.length; i++) {
    let temp_array = [];
    for (var j = 0; j < parsedData.length; j++) {
      temp_array[j] = parsedData[j].data[i];
    }
    temp_array.sort((a, b) => {
      return b.value - a.value;
    });
    for (var k = 0; k < temp_array.length; k++) {
      parsedData[temp_array[k].orig_index].data[i].rank = k;
    }
  }

  // add color and org to data points

  for (var i = 0; i < parsedData.length; i++) {
    for (var j = 0; j < parsedData[0].data.length; j++) {
      parsedData[i].data[j].org = parsedData[i].org;
      parsedData[i].data[j].color = colorPal[i % colorPal.length];
    }
  }

  // Starting pos = parsedData[i].org
  // Find final positions
  let finalPositions = [];
  for (var i in parsedData) {
    let last = parsedData[i].data[parsedData[i].data.length - 1];
    finalPositions[i] = {
      org: last.org,
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
  };

  // console.log("stuff returned")
  console.log(returnObj);

  return returnObj;
}
