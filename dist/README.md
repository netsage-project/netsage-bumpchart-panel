# Bump Chart Panel Plugin

[![CI](https://github.com/netsage-project/netsage-bumpchart-panel/actions/workflows/ci.yml/badge.svg)](https://github.com/netsage-project/netsage-bumpchart-panel/actions/workflows/ci.yml)
[![Release](https://github.com/netsage-project/netsage-bumpchart-panel/actions/workflows/release.yml/badge.svg)](https://github.com/netsage-project/netsage-bumpchart-panel/actions/workflows/release.yml)

This is a panel plugin to generate a bump chart in Grafana 8.0+.  Bump charts are useful for visualizing rank data over time.  The vertical axis is scaled by rank instead of value, which can be useful for overviews or big picture situations. 

![](/src/img/Bumpchart-ex.png)

## How it works
The bump chart requires time series data for the horizontal axis and some type of grouping for the vertical axis.
The plugin sorts the groups by value and displays the top N number of groups as selected by the user.  Because of this, there MUST be more groups returned by the query than lines you choose to draw.  The plugin works this way to allow a "true" top N to be displayed for each time bucket.  


## Customizing
**Number of Lines**: The number of lines to display by default on the bumpchart.  Make sure the query provides AT LEAST this many data groups or it won't work.  In the example above, the number of lines chosen was 10, but the query returned the Top 50 results, which is why some of the lines drop in and out of the top 10 over time.

**Axis Header**: The Header for the vertical axis showing all the labels.  In the example above, "Organization" is the header.

**Tooltip text for value**: The text that will show up in the tooltip to describe the value.

**Label Width**: The allotted right margin width.  Labels that are too long to fit will be truncated.

**Label Size**: The font size for the right axis labels.

**Interval**: Whatever interval you set for your time series data will be the size of the bins for the bumpchart. In the example above, 2 weeks was chosen for the interval.


