import * as d3 from 'd3';

export default class SvgHandler {
  constructor(id) {
    this.containerID = id;
  }

  renderChart(data, header1, numLines) {
    // SUPER IMPORTANT! This clears old chart before drawing new one...
    let panel = document.getElementById(this.containerID);
    panel.innerHTML = '';
    d3.select('#' + this.containerID)
      .selectAll('svg')
      .remove();
    d3.select('#' + this.containerID)
      .selectAll('.dropdownMenu')
      .remove();
    d3.select('#' + this.containerID)
      .selectAll('.tooltip')
      .remove();
    // ----------------------------------------------------------
    if (data.length == 0) {
      panel.innerHTML += 'No Data';
      console.log('no data');
      return;
    }

    //if not enough data for specified number, use all data
    if (data.length < numLines) {
      numLines = data.length;
    }

    // ------------------- Variables -------------------

    let parsedData = data.parsedData;
    let finalPositions = data.finalPositions;
    let colorPal = data.colorPal;
    let dates = data.dates;

    let container = this.containerID;
    let startingOpacity = 0.5;
    let dropdownOptions = [10, 9, 8, 7, 6, 5, 4, 3];

    let panelWidth = document.getElementById(this.containerID).offsetWidth;
    let panelHeight = document.getElementById(this.containerID).offsetHeight;

    var margin = { top: 25, right: 325, bottom: 150, left: 25, spacer: 25 },
      width = panelWidth - margin.left - margin.right,
      height = panelHeight - margin.top - margin.bottom;

    let upperWidth = width + margin.left + margin.right - 120; // dropdown width is 100

    var path = d3
      .line()
      .x(function(d) {
        return x(d.date);
      })
      .y(function(d) {
        return y(d.rank);
      })
      .curve(d3.curveMonotoneX);

    // ------------------- Ranges & Scales --------------------

    // the date range of available data:
    var dataXrange = d3.extent(parsedData[0].data, function(d) {
      return d.date;
    });

    // number top talkers to display
    var yAxisMax = numLines - 1; // var numLines set in Viz tab, default: 10
    var dataYrange = [0, yAxisMax];

    // timestamp formatter
    var dateFormat = d3.timeFormat('%m/%d/%y');

    // Add X scale
    var x = d3
      .scaleTime()
      .domain(dataXrange)
      .range([0, width]);

    // Add Y scale
    var y = d3
      .scaleLinear()
      .domain(dataYrange)
      .range([0, height]);

    // ------------------- FUNCTIONS -------------------
    // function to wrap text!
    function wrap(text, width) {
      text.each(function() {
        var text = d3.select(this),
          words = text
            .text()
            .split(/\s+/)
            .reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr('y'),
          dy = parseFloat(text.attr('dy')),
          tspan = text
            .text(null)
            .append('tspan')
            .attr('x', 0)
            .attr('y', y)
            .attr('dy', dy + 'em');
        while ((word = words.pop())) {
          line.push(word);
          tspan.text(line.join(' '));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(' '));
            line = [word];
            tspan = text
              .append('tspan')
              .attr('x', 0)
              .attr('y', y)
              .attr('dy', ++lineNumber * lineHeight + dy + 'em')
              .text(word);
          }
        }
      });
    }

    // A function that updates the chart
    function update(dropdownSelection) {
      // update variables
      yAxisMax = dropdownSelection - 1;
      dataYrange = [0, yAxisMax];
      y.domain(dataYrange);

      rightAxis = d3
        .axisRight(y)
        .ticks(dropdownSelection)
        .tickSize(5)
        .tickFormat(d => {
          if (finalPositions[d] == null) {
            return '';
          } else {
            return finalPositions[d].org;
          }
        });

      var svg = d3.select('#' + container).transition();
      // redraw y axis
      svg
        .select('.yAxis')
        .duration(750)
        .call(rightAxis)
        .selectAll('.tick text')
        .call(wrap, margin.right - 25);
      // Update lines and nodes
      for (var i = 0; i < parsedData.length; i++) {
        var currentData = parsedData[i].data;
        svg
          .select('.org-' + i + container)
          .duration(750)
          .attr('d', path(currentData));
        svg
          .selectAll('circle')
          .duration(750)
          .attr('cx', function(d) {
            return x(d.date);
          })
          .attr('cy', function(d) {
            return y(d.rank);
          });
      }
    }

    ///////////////////////////// Dropdown ////////////////////////////
    // Create dropdown
    var dropdown = d3
      .select('#' + container)
      .insert('select', 'svg')
      .on('change', function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property('value');

        // run the updateChart function with this selected option
        update(selectedOption);
      });

    dropdown
      .selectAll('option')
      .data(dropdownOptions)
      .enter()
      .append('option')
      .text(function(d) {
        return d;
      }) // text showed in the menu
      .attr('value', function(d) {
        return d;
      }); // corresponding value returned by the button;

    d3.selectAll('select').attr('class', 'dropdownMenu');

    var dropdownLabel = d3
      .select('#' + container)
      .insert('svg', 'svg')
      .attr('width', upperWidth)
      .attr('height', 30);

    dropdownLabel
      .append('text')
      .attr('class', 'dropdown-text')
      .attr('transform', 'translate(' + upperWidth + ', 20)')
      .style('text-anchor', 'end')
      .text('Number of Lines to Display: ');

    //////////////////////////////// Bump Chart ////////////////////////////////////////

    // append the svg object to the body of the page
    var svg = d3
      .select('#' + this.containerID)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom + margin.spacer)
      .append('g')
      .attr('height', height)
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Add axes
    var rightAxis = d3
      .axisRight(y)
      .ticks(numLines - 1)
      .tickSize(5)
      .tickFormat(d => {
        if (finalPositions[d] == null) {
          return '';
        } else {
          return finalPositions[d].org;
        }
      });

    var bottomAxis = d3
      .axisBottom(x)
      .tickValues(dates)
      .tickSize(5)
      .tickFormat(dateFormat);

    svg
      .append('g')
      .call(rightAxis)
      .attr('margin', 10)
      .attr('transform', 'translate(' + (width + margin.spacer) + ',' + margin.top + ')')
      .attr('class', 'yAxis')
      .selectAll('.tick text')
      .call(wrap, margin.right - 25)
      .attr('transform', 'translate(' + 10 + ',0)');

    svg
      .append('g')
      .call(bottomAxis)
      .attr('class', 'axis')
      .attr('transform', 'translate(' + margin.spacer + ',' + (height + margin.spacer + margin.top) + ')')
      .selectAll('.tick text')
      .call(wrap, 100)
      .attr('transform', 'rotate(-60)')
      .style('text-anchor', 'end');

    // Add axis title.  var header1 comes from options, default: Source Organizations
    svg
      .append('text')
      .attr('class', 'header-text')
      .attr('transform', 'translate(' + (width + margin.left + 10) + ' ,' + margin.top / 4 + ')')
      .style('text-anchor', 'start')
      .text(header1);

    // For lines tooltip
    var div = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    // Add the lines
    for (let i = 0; i < parsedData.length; i++) {
      var currentData = parsedData[i].data;
      var line = svg
        .append('svg')
        .attr('width', width + margin.spacer)
        .attr('height', height + margin.spacer + margin.top)
        .append('g')
        .data(currentData)
        .attr('transform', 'translate(' + margin.spacer + ',' + margin.top + ')')
        .append('path')
        .attr('class', 'org-' + i + container)

        .attr('fill', 'none')
        .attr('stroke', colorPal[i % colorPal.length])
        .attr('opacity', startingOpacity)
        .attr('stroke-width', 7)
        .attr('d', path(currentData))

        // Add Tootip and hover settings
        .on('mouseover', function(d) {
          d3.selectAll('path').attr('opacity', 0.2);
          d3.select(this).attr('opacity', 1);

          // Circles: selected opacity -> 1, all else -> 0.2
          let className = d3.select(this).attr('class');
          d3.selectAll('circle').each(function(d) {
            var thisClass = d3.select(this).attr('class');
            var dark = className === thisClass;

            d3.select(this)
              .attr('opacity', dark ? 1 : 0.2)
              .attr('fill-opacity', dark ? 0.9 : 0.2);
          });

          div
            .transition()
            .duration(200)
            .style('opacity', 0.9);
          div
            .html(() => {
              var text = '<b>' + d.org + '</b>';
              return text;
            })
            .style('left', d3.event.pageX + 'px')
            .style('top', d3.event.pageY - 28 + 'px');
        })
        .on('mouseout', function(d) {
          div
            .transition()
            .duration(500)
            .style('opacity', 0);
          d3.selectAll('path').attr('opacity', startingOpacity);
          d3.selectAll('circle')
            .attr('fill-opacity', startingOpacity)
            .attr('opacity', startingOpacity + 0.2);
        });

      ///////////////////////
      // Add Nodes, set class to .org-<i>
      var node = svg
        .append('svg')
        .attr('width', width + 10 + margin.spacer)
        .attr('height', height + margin.spacer + margin.top)
        .append('g')
        .attr('transform', 'translate(' + margin.spacer + ',' + margin.top + ')')
        .selectAll('circle')
        .data(currentData)
        .enter()
        .append('circle')
        .attr('class', 'org-' + i + container)
        .attr('cx', function(d) {
          return x(d.date);
        })
        .attr('cy', function(d) {
          return y(d.rank);
        })
        .attr('fill', colorPal[i % colorPal.length])
        .attr('fill-opacity', startingOpacity)
        .attr('r', 10)
        .attr('stroke', colorPal[i % colorPal.length])
        .attr('opacity', startingOpacity + 0.2)
        .attr('stroke-width', 1.5);
    }

    ///////////////////////
    // point Tooltips
    var tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'small-tooltip');

    svg
      .selectAll('circle')
      .on('mouseover', function(d) {
        let className = d3.select(this).attr('class');

        // Circles: selected opacity -> 1, all else -> 0.2
        d3.selectAll('circle').each(function(d) {
          var thisClass = d3.select(this).attr('class');
          var dark = className === thisClass;

          d3.select(this)
            .attr('opacity', dark ? 1 : 0.2)
            .attr('fill-opacity', dark ? 1 : 0.2);
        });

        // Lines: selected opacity -> 1, all else -> 0.2
        d3.selectAll('path').each(function(d) {
          var thisClass = d3.select(this).attr('class');
          var dark = className === thisClass;

          d3.select(this).attr('opacity', dark ? 1 : 0.2);
        });

        div
          .transition()
          .duration(200)
          .style('opacity', 0.9);
        div
          .html(() => {
            var rank = d.rank + 1;
            var value = d.value;
            var volume = value + 'bytes';
            value = value / 1000;
            if (value < 1000) {
              volume = Math.round(value * 10) / 10 + ' KB';
            } else {
              value = value / 1000;
              if (value < 1000) {
                volume = Math.round(value * 10) / 10 + ' MB';
              } else {
                value = value / 1000;
                if (value < 1000) {
                  volume = Math.round(value * 10) / 10 + ' GB';
                } else {
                  value = value / 1000;
                  if (value < 1000) {
                    volume = Math.round(value * 10) / 10 + ' TB';
                  } else {
                    value = value / 1000;
                    volume = Math.round(value * 10) / 10 + ' PB';
                  }
                }
              }
            }
            var text = '<b>#' + rank + ': </b>' + d.org + '<br><b>Volume: </b>' + volume;
            return text;
          })
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY - 28 + 'px');
      })
      .on('mouseout', function(d) {
        div
          .transition()
          .duration(500)
          .style('opacity', 0);
        d3.selectAll('circle')
          .attr('fill-opacity', startingOpacity)
          .attr('opacity', startingOpacity + 0.2);
        d3.selectAll('path').attr('opacity', startingOpacity);
      });
  }
}
