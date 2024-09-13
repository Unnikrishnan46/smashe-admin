import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { ResponsiveBar } from '@nivo/bar';
import { ref, get } from "firebase/database";
import { database } from '@/firebase/firebase.config';

function MainBarChart() {
  const [chartData, setChartData] = useState([]);

  const fetchElectionData = async () => {
    try {
      // Fetch elections from Firebase
      const electionsRef = ref(database, "/elections/");
      const electionsSnapshot = await get(electionsRef);
      const electionsData = electionsSnapshot.val();

      if (!electionsData) {
        return;
      }

      // Sort by createdDate and get last 6-7 elections
      const sortedElections = Object.values(electionsData)
        .sort((a: any, b: any) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
        .slice(0, 6); // Fetch the last 6 elections

      // Fetch vote counts for each election
      const voteCountsPromises = sortedElections.map(async (election: any) => {
        const votesRef = ref(database, `/votes/${election.id}`);
        const votesSnapshot = await get(votesRef);
        const votesData = votesSnapshot.val();
        const totalVotes = votesData ? Object.keys(votesData).length : 0;

        return {
          name: election.name || `Election ${election.id}`, // Use a default if election name is missing
          count: totalVotes,
        };
      });

      const voteCounts = await Promise.all(voteCountsPromises) as any;
      setChartData(voteCounts);
    } catch (error) {
      console.error("Error fetching election and vote data: ", error);
    }
  };

  useEffect(() => {
    fetchElectionData();
  }, []);


  return (
    <Card className="col-span-2">
    <CardHeader>
      <CardTitle>Overview</CardTitle>
    </CardHeader>
    <CardContent>
      <BarChart data={chartData} className="w-full h-[300px]" />
    </CardContent>
  </Card>
  )
}


function BarChart({ data, ...props }: any) {
  return (
    <div {...props}>
      <ResponsiveBar
        data={data.slice(0, 6)}
        keys={["count"]}
        indexBy="name"
        margin={{ top: 0, right: 0, bottom: 40, left: 40 }}
        padding={0.3}
        colors={["#2563eb"]}
        axisBottom={{
          tickSize: 0,
          tickPadding: 16,
        }}
        axisLeft={{
          tickSize: 0,
          tickValues: 4,
          tickPadding: 16,
        }}
        gridYValues={4}
        theme={{
          tooltip: {
            chip: {
              borderRadius: "9999px",
            },
            container: {
              fontSize: "12px",
              textTransform: "capitalize",
              borderRadius: "6px",
            },
          },
          grid: {
            line: {
              stroke: "#f3f4f6",
            },
          },
        }}
        tooltipLabel={({ id }) => `${id}`}
        enableLabel={false}
        role="application"
        ariaLabel="A bar chart showing election vote data"
      />
    </div>
  );
}

export default MainBarChart
