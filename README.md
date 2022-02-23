# Bump Chart Panel Plugin

[![CI](https://github.com/netsage-project/netsage-bumpchart-panel/actions/workflows/ci.yml/badge.svg)](https://github.com/netsage-project/netsage-bumpchart-panel/actions/workflows/ci.yml)
[![Release](https://github.com/netsage-project/netsage-bumpchart-panel/actions/workflows/release.yml/badge.svg)](https://github.com/netsage-project/netsage-bumpchart-panel/actions/workflows/release.yml)

This is a panel plugin to generate a bump chart in Grafana 7.0+.  Bump charts are useful for visualizing rank data over time.  The vertical axis is scaled by rank instead of value, which can be useful for overviews or big picture situations. 


## How it works
The bump chart requires time series data for the horizontal axis and some type of grouping for the vertical axis.
The plugin sorts the groups by value and displays the top N number of groups as selected by the user.  Because of this, there MUST be more groups returned by the query than lines you choose to draw.  The plugin works this way to allow a "true" top N to be displayed for each time bucket.  


## Customizing


