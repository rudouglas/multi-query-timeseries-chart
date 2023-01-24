import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  HeadingText,
  BlockText,
  NrqlQuery,
  Spinner,
  AutoSizer,
  LineChart,
  AreaChart,
} from "nr1";

export const useGuids = (nrqlQueries) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(async () => {
    try {

    } catch(error) {
      setError(error)
    }
    setLoading(true);

    const fetchGuids = async () => {
      const promises = [];
      let response = [];
      nrqlQueries.forEach(async ({ query, accountId }) => {
        if (!query || !accountId) {
          return;
        }
        console.log(query);
        console.log(accountId);
        promises.push(
          NrqlQuery.query({
            query,
            accountIds: [accountId],
            formatType: NrqlQuery.FORMAT_TYPE.CHART,
          })
        );
      });
      response = await Promise.all(promises).catch((err) => {
        console.log(err.message);
        setError(err);
      });
      console.log({ response });
      return response;
    };

    const queryResults = await fetchGuids();
    // console.log(JSON.stringify(queryResults))
    const results = queryResults.map(({data}) => data).flat(1);
    console.log(JSON.stringify(results))

    console.log({ results, queryResults });
    setResults(results);
    setLoading(false);
  }, [nrqlQueries]);
  return {
    results,
    loading,
    error,
  };
};

const CrossAccountQueryVisualization = ({
  nrqlQueries,
  chartType = "line",
}) => {
  console.log(JSON.stringify(nrqlQueries));
  const { results, loading, error } = useGuids(nrqlQueries);
  console.log({ results, loading, chartType });
  const nrqlQueryPropsAvailable =
    nrqlQueries &&
    nrqlQueries[0] &&
    nrqlQueries[0].accountId &&
    nrqlQueries[0].query;

  if (!nrqlQueryPropsAvailable) {
    return <EmptyState />;
  }

  if (
    nrqlQueries.some(
      ({ query }) => query && !query.toLowerCase().includes("timeseries")
    )
  ) {
    return (
      <ErrorState error="Some of your queries do not contain 'TIMESERIES'. Please make sure all your queries are timeseries queries!" />
    );
  }
  if (loading) {
    return <Spinner />;
  }
  if (error) {
    return <ErrorState error={error.message} />;
  }

  const sortedData = results.map((result) => {
    return {
      metadata: result.metadata,
      data: result.data,
    };
  });
  console.log({ results, sortedData });
  return (
    <AutoSizer>
      {({ width, height }) => (
        <>
          {chartType == "area" ? (
            <AreaChart data={sortedData} fullWidth />
          ) : (
            <LineChart data={sortedData} fullWidth />
          )}
        </>
      )}
    </AutoSizer>
  );
};

const EmptyState = () => (
  <Card className="EmptyState">
    <CardBody className="EmptyState-cardBody">
      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.LARGE]}
        type={HeadingText.TYPE.HEADING_3}
      >
        Please provide at least one NRQL query & account ID pair
      </HeadingText>
      <HeadingText
        spacingType={[HeadingText.SPACING_TYPE.MEDIUM]}
        type={HeadingText.TYPE.HEADING_4}
      >
        An example NRQL query you can try is:
      </HeadingText>
      <code>FROM NrUsage SELECT sum(usage) FACET metric SINCE 1 week ago</code>
    </CardBody>
  </Card>
);

const ErrorState = ({ error }) => (
  <Card className="ErrorState">
    <CardBody className="ErrorState-cardBody">
      <HeadingText
        className="ErrorState-headingText"
        spacingType={[HeadingText.SPACING_TYPE.LARGE]}
        type={HeadingText.TYPE.HEADING_3}
      >
        Oops! Something went wrong.
      </HeadingText>
      <BlockText>{error}</BlockText>
    </CardBody>
  </Card>
);

export default CrossAccountQueryVisualization;
