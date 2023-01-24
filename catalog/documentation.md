# Multi-Query Timeseries Chart
This is a Custom Visualization that allows you to add the results of multiple cross-account timeseries queries to a single chart. The [current limit](https://docs.newrelic.com/docs/query-your-data/explore-query-data/query-builder/use-advanced-nrql-mode-query-data/) in Newrelic One is 20 queries per chart, but this allows you to add many more.

## Features
  - Supports 50+ unique query/account configurations (tested so far)
  - Supports Line and Area timeseries chart types

## Getting started

Run the following scripts:

```
npm install
npm start
```

Visit https://one.newrelic.com/?nerdpacks=local and :sparkles:

## Creating new artifacts

If you want to create new artifacts run the following command:

```
nr1 create
```

> Example: `nr1 create --type nerdlet --name my-nerdlet`.
