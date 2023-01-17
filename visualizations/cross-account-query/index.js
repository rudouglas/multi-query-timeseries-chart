import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  Card,
  CardBody,
  HeadingText,
  NrqlQuery,
  Spinner,
  AutoSizer,
  LineChart,
  AreaChart,
} from "nr1";

export const useGuids = (nrqlQueries) => {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log("Starting");
  useEffect(async () => {
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
      response = await Promise.all(promises);
      console.log({ response });
      return response;
    };

    const results = await fetchGuids();
    console.log({ results });
    setMonitors(results);
    setLoading(false);
  }, [nrqlQueries]);
  return {
    monitors,
    loading,
  };
};

const CrossAccountQueryVisualization = ({
  nrqlQueries,
  chartType = "line",
}) => {
  console.log(JSON.stringify(nrqlQueries));
  const { monitors, loading } = useGuids(nrqlQueries);
  console.log({ monitors, loading, chartType });
  if (loading) {
    return <Spinner />;
  }
  const nrqlQueryPropsAvailable =
    nrqlQueries &&
    nrqlQueries[0] &&
    nrqlQueries[0].accountId &&
    nrqlQueries[0].query;

  if (!nrqlQueryPropsAvailable) {
    return <EmptyState />;
  }
  const sortedData = monitors.map((monitor) => {
    return {
      metadata: monitor.data[0].metadata,
      data: monitor.data[0].data,
    };
  });
  console.log({ monitors, sortedData });
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

const ErrorState = () => (
  <Card className="ErrorState">
    <CardBody className="ErrorState-cardBody">
      <HeadingText
        className="ErrorState-headingText"
        spacingType={[HeadingText.SPACING_TYPE.LARGE]}
        type={HeadingText.TYPE.HEADING_3}
      >
        Oops! Something went wrong.
      </HeadingText>
    </CardBody>
  </Card>
);

export default CrossAccountQueryVisualization;
