import * as d3 from 'd3';

export default class SvgHandler {
  constructor(id) {
    this.containerID = id;
  }

  renderChart(
    data,
    panelWidth,
    panelHeight,
    header1,
    numLines,
    tooltipMetric,
    theme,
    labelMargin,
    txtSize,
    formatDate,
    onMouseOver,
    onMouseOut,
    opts = {}
  ) {
    const lineWidth = opts.lineWidth != null ? opts.lineWidth : 6;
    // Every node is the same size; it reads as a slight thickening of its own line.
    const nodeRadius = lineWidth * 0.75;

    // SUPER IMPORTANT! This clears old chart before drawing new one...
    let panel = document.getElementById(this.containerID);
    panel.innerHTML = '';
    d3.select('#' + this.containerID)
      .selectAll('svg')
      .remove();
    d3.select('#' + this.containerID)
      .selectAll('.tooltip')
      .remove();
    // ----------------------------------------------------------

    // ------------------- Variables -------------------

    let parsedData = data.parsedData;
    let finalPositions = data.finalPositions;
    let initialPositions = data.initialPositions;
    let dates = data.dates;

    if (!parsedData || parsedData.length === 0) {
      panel.innerHTML += 'No Data';
      console.error('no data');
      return;
    }

    // if not enough data for specified number (or an invalid count), use all data
    if (!Number.isFinite(numLines) || numLines <= 0 || parsedData.length < numLines) {
      numLines = parsedData.length;
    }

    let display = data.display;
    let txtLength = Math.floor((labelMargin - 10) / (txtSize * 0.75));

    let container = this.containerID;
    // Lines and nodes share one opacity, so crossings stay readable through each other.
    let baseOpacity = 0.65;

    // Theme tokens so lines, nodes, axes and text all adapt to light/dark.
    let textColor = theme.colors.text.primary;
    let mutedColor = theme.colors.text.secondary;
    let gridColor = theme.colors.border.weak;
    let fontFamily = theme.typography.fontFamily;

    // Both left and right margins reserve room for end labels. The bottom margin
    // holds the horizontal time axis + its labels; it must clear top + spacer +
    // label height, or the axis gets cut off by the panel's bottom edge.
    const marginTop = 25;
    const marginSpacer = 25;
    const marginBottom = marginTop + marginSpacer + txtSize + 12;
    let margin = { top: marginTop, right: labelMargin, bottom: marginBottom, left: labelMargin, spacer: marginSpacer },
      width = panelWidth - margin.left - margin.right,
      height = panelHeight - margin.top - margin.bottom;

    if (width <= 0 || height <= 0) {
      console.error('panel too small, please resize');
      return;
    }

    // Precompute rank change vs the previous timestamp for richer tooltips.
    for (let i = 0; i < parsedData.length; i++) {
      const series = parsedData[i].data;
      for (let t = 0; t < series.length; t++) {
        series[t].delta = t === 0 ? null : series[t - 1].rank - series[t].rank;
      }
    }

    let path = d3
      .line()
      .x(function (d) {
        return x(d.date);
      })
      .y(function (d) {
        return y(d.rank);
      })
      .curve(d3.curveMonotoneX);

    // ------------------- Ranges & Scales --------------------

    // the date range of available data:
    let dataXrange = d3.extent(parsedData[0].data, function (d) {
      return d.date;
    });

    // number top talkers to display
    let yAxisMax = numLines - 1; // var numLines set in Viz tab, default: 10
    let dataYrange = [0, yAxisMax];

    // Add X scale
    let x = d3.scaleTime().domain(dataXrange).range([0, width]);

    // Add Y scale
    let y = d3.scaleLinear().domain(dataYrange).range([0, height]);

    // ------------------- FUNCTIONS -------------------
    function truncateLabel(text, width) {
      text.each(function () {
        let label = d3.select(this).text();
        if (label.length > width) {
          label = label.slice(0, width) + '...';
        }
        d3.select(this).text(label);
      });
    }

    //////////////////////////////// Bump Chart ////////////////////////////////////////

    // append the svg object to the body of the page
    let rootSvg = d3
      .select('#' + this.containerID)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('font-family', fontFamily);

    let svg = rootSvg
      .append('g')
      .attr('height', height)
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Right axis: final rank labels, prefixed with rank number.
    // tickValues (not ticks) so every rank 0..numLines-1 gets exactly one label.
    let rightAxis = d3
      .axisRight(y)
      .tickValues(d3.range(numLines))
      .tickSize(5)
      .tickFormat((d) => {
        if (finalPositions[d] == null) {
          return '';
        }
        return `#${d + 1} ${finalPositions[d].name}`;
      });

    // Left axis: starting rank labels so each line can be traced end to end.
    let leftAxis = d3
      .axisLeft(y)
      .tickValues(d3.range(numLines))
      .tickSize(5)
      .tickFormat((d) => {
        if (initialPositions[d] == null) {
          return '';
        }
        return initialPositions[d].name;
      });

    // Bottom time axis: horizontal, with ticks on the actual data timestamps (thinned to
    // fit the width) so each label sits under a real column of nodes. Letting d3 pick
    // "nice" times instead would align them to the *browser's* midnight, which drifts off
    // the buckets on any dashboard not in local time. formatDate renders each tick in the
    // dashboard's timezone.
    let maxTicks = Math.max(2, Math.floor(width / 90));
    let tickStep = Math.max(1, Math.ceil(dates.length / maxTicks));
    let tickValues = dates.filter((_, i) => i % tickStep === 0);
    let bottomAxis = d3.axisBottom(x).tickValues(tickValues).tickSize(5).tickFormat(formatDate);

    svg
      .append('g')
      .call(rightAxis)
      .attr('transform', 'translate(' + (width + margin.spacer) + ',' + margin.top + ')')
      .attr('class', 'yAxis')
      .selectAll('.tick text')
      .attr('font-size', txtSize)
      .attr('fill', textColor)
      .style('font-variant-numeric', 'tabular-nums')
      .attr('transform', 'translate(' + 10 + ',0)')
      .call(truncateLabel, txtLength + 4);

    svg
      .append('g')
      .call(leftAxis)
      .attr('transform', 'translate(' + margin.spacer + ',' + margin.top + ')')
      .attr('class', 'yAxisLeft')
      .selectAll('.tick text')
      .attr('font-size', txtSize)
      .attr('fill', textColor)
      .attr('transform', 'translate(' + -10 + ',0)')
      .call(truncateLabel, txtLength);

    svg
      .append('g')
      .call(bottomAxis)
      .attr('class', 'axis')
      .attr('transform', 'translate(' + margin.spacer + ',' + (height + margin.spacer + margin.top) + ')')
      .selectAll('.tick text')
      .attr('font-size', txtSize)
      .attr('fill', mutedColor)
      .style('text-anchor', 'middle');

    // Add axis title above the right (final-rank) axis.  var header1 comes from options
    svg
      .append('text')
      .attr('class', 'header-text')
      .attr('transform', 'translate(' + (width + margin.spacer) + ' ,' + margin.top / 4 + ')')
      .style('text-anchor', 'start')
      .style('fill', textColor)
      .text(header1);

    // Crosshair: a vertical rule that snaps to the nearest timestamp on hover.
    let crosshairGroup = svg
      .append('g')
      .attr('transform', 'translate(' + margin.spacer + ',' + margin.top + ')')
      .style('pointer-events', 'none');
    let crosshair = crosshairGroup
      .append('line')
      .attr('class', 'crosshair')
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', gridColor)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4 3')
      .style('opacity', 0);

    const nearestDate = (target) => {
      let best = dates[0];
      let bestDist = Infinity;
      for (const d of dates) {
        const dist = Math.abs(d.getTime() - target.getTime());
        if (dist < bestDist) {
          bestDist = dist;
          best = d;
        }
      }
      return best;
    };

    rootSvg
      .on('mousemove', function (event) {
        const px = d3.pointer(event, this)[0] - margin.left - margin.spacer;
        if (px < 0 || px > width) {
          crosshair.style('opacity', 0);
          return;
        }
        const snapped = nearestDate(x.invert(px));
        crosshair.attr('x1', x(snapped)).attr('x2', x(snapped)).style('opacity', 0.9);
      })
      .on('mouseleave', function () {
        crosshair.style('opacity', 0);
      });

    // Add the lines
    for (let i = 0; i < parsedData.length; i++) {
      let currentData = parsedData[i].data;
      let seriesColor = parsedData[i].color;

      let line = svg
        .append('svg')
        .attr('width', width + margin.spacer)
        .attr('height', height + margin.spacer + margin.top)
        .append('g')
        .data(currentData)
        .attr('transform', 'translate(' + margin.spacer + ',' + margin.top + ')')
        .append('path')
        .attr('class', 'name-' + i + container)
        .attr('data-role', 'line')
        .attr('fill', 'none')
        .attr('stroke', seriesColor)
        .attr('opacity', baseOpacity)
        .attr('stroke-width', lineWidth)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('d', path(currentData))

        // Add Tooltip and hover settings
        .on('mouseover', function (event, d) {
          d3.selectAll('#' + container + ' path[data-role="line"]').attr('opacity', 0.2);
          d3.select(this).attr('opacity', 1);

          // Circles: selected opacity -> 1, all else -> 0.2
          let className = d3.select(this).attr('class');
          d3.selectAll('#' + container + ' circle').each(function () {
            let thisClass = d3.select(this).attr('class');
            let dark = className === thisClass;

            d3.select(this).attr('opacity', dark ? 1 : 0.2);
          });
          onMouseOver({ name: d.name }, event.clientX, event.clientY);
        })
        .on('mouseout', function () {
          d3.selectAll('#' + container + ' path[data-role="line"]').attr('opacity', baseOpacity);
          d3.selectAll('#' + container + ' circle').attr('opacity', baseOpacity);
          onMouseOut();
        });

      // Entrance animation: draw the line in from left to right.
      let totalLength = line.node().getTotalLength();
      line
        .attr('stroke-dasharray', totalLength + ' ' + totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(700)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0)
        .on('end', function () {
          d3.select(this).attr('stroke-dasharray', null);
        });

      // Add Nodes, set class to .name-<i>
      svg
        .append('svg')
        .attr('width', width + 10 + margin.spacer)
        .attr('height', height + margin.spacer + margin.top)
        .append('g')
        .attr('transform', 'translate(' + margin.spacer + ',' + margin.top + ')')
        .selectAll('circle')
        .data(currentData)
        .enter()
        .append('circle')
        .attr('class', 'name-' + i + container)
        .attr('data-testid', 'bumpchart-node')
        .attr('cx', function (d) {
          return x(d.date);
        })
        .attr('cy', function (d) {
          return y(d.rank);
        })
        .attr('fill', seriesColor)
        .attr('opacity', baseOpacity)
        .attr('r', 0)
        .transition()
        .duration(700)
        .ease(d3.easeCubicOut)
        .attr('r', nodeRadius);
    }

    ///////////////////////
    // point Tooltips
    svg
      .selectAll('circle')
      .on('mouseover', function (event, d) {
        let className = d3.select(this).attr('class');

        // Circles: selected opacity -> 1, all else -> 0.2
        d3.selectAll('#' + container + ' circle').each(function () {
          let thisClass = d3.select(this).attr('class');
          let dark = className === thisClass;

          d3.select(this).attr('opacity', dark ? 1 : 0.2);
        });

        // Lines: selected opacity -> 1, all else -> 0.2
        d3.selectAll('#' + container + ' path[data-role="line"]').each(function () {
          let thisClass = d3.select(this).attr('class');
          let dark = className === thisClass;

          d3.select(this).attr('opacity', dark ? 1 : 0.2);
        });

        // Structured payload — the panel renders it as two lines (see BumpChart.tsx).
        let displayed = display(d.value);
        onMouseOver(
          {
            rank: d.rank + 1,
            name: d.name,
            metricLabel: tooltipMetric,
            value: `${displayed.text}${displayed.suffix ?? ''}`,
            delta: d.delta,
          },
          event.clientX,
          event.clientY
        );
      })
      .on('mouseout', function () {
        d3.selectAll('#' + container + ' circle').attr('opacity', baseOpacity);
        d3.selectAll('#' + container + ' path[data-role="line"]').attr('opacity', baseOpacity);
        onMouseOut();
      });
  }
}
