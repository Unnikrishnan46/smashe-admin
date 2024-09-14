"use client";
import { AiDashboard } from "@/components/custom/ai-dashboard";
import React, { useEffect, useState } from "react";
import { get, ref } from "firebase/database";
import { database } from "@/firebase/firebase.config";

function Dashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalElections, setTotalElections] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [activeElection, setActiveElection] = useState(0);
  const [percentageChange, setPercentageChange] = useState({
    users: 0,
    elections: 0,
    votes: 0,
  });
  const [topFive, setTopFive] = useState<any[]>([]);

  // Get total users
  const getTotalUsers = async () => {
    try {
      const usersRef = ref(database, "/users/");
      const usersSnapshot = await get(usersRef);
      const usersData = usersSnapshot.val();
      setTotalUsers(Object.keys(usersData).length);
    } catch (error) {
      console.error("Error fetching users: ", error);
    }
  };

  // Get total elections
  const getTotalElections = async () => {
    try {
      const electionsRef = ref(database, "/elections/");
      const electionsSnapshot = await get(electionsRef);
      const electionsData = electionsSnapshot.val();
      setTotalElections(Object.keys(electionsData).length);

      // Assuming the latest election is the active one (adjust this as needed)
      const sortedElections = Object.values(electionsData).sort(
        (a: any, b: any) =>
          new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      ) as any;
      if (sortedElections.length > 0) {
        setActiveElection(sortedElections[0]?.id);
      }
    } catch (error) {
      console.error("Error fetching elections: ", error);
    }
  };

  const getTotalVotes = async () => {
    try {
      const electionsRef = ref(database, "/elections/");
      const electionsSnapshot = await get(electionsRef);
      const electionsData = electionsSnapshot.val();
  
      if (!electionsData) {
        console.error("No elections found");
        return;
      }
  
      // Get the current date
      const currentDate = new Date();
  
      // Find the election where the current time is between fromDate and toDate
      const activeElection = Object.values(electionsData).find(
        (election: any) => {
          const fromDate = new Date(election.fromDate);
          const toDate = new Date(election.toDate);
          return currentDate >= fromDate && currentDate <= toDate;
        }
      ) as any;
  
      if (!activeElection) {
        console.error("No active election found");
        return;
      }
  
      const votesRef = ref(database, `/votes/${activeElection.id}`);
      const votesSnapshot = await get(votesRef);
      const votesData = votesSnapshot.val();
  
      if (votesData) {
        // Count only votes with both votedUserId and voterId
        const validVotes = Object.values(votesData).filter(
          (vote: any) => vote.votedUserId && vote.voterId
        );
        setTotalVotes(validVotes.length);
      } else {
        setTotalVotes(0);
      }
    } catch (error) {
      console.error("Error fetching votes: ", error);
    }
  };
  
  

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0; // Handle cases where there were no users last month
    return ((current - previous) / previous) * 100;
  };

  const getTotalUsersLastMonth = async () => {
    try {
      const usersRef = ref(database, "/users/");
      const snapshot = await get(usersRef);
      const usersData = snapshot.val();
      const lastMonthUsers = Object.values(usersData).filter((user: any) => {
        const createdAt = new Date(user.createdAt);
        const currentDate = new Date();
        const lastMonthDate = new Date(
          currentDate.setMonth(currentDate.getMonth() - 1)
        );

        // Check if the user was created last month
        return createdAt >= lastMonthDate && createdAt < currentDate;
      });
      return lastMonthUsers.length;
    } catch (error) {
      console.error("Error fetching last month's users: ", error);
      return 0;
    }
  };

  const getTotalElectionsLastMonth = async () => {
    try {
      const electionsRef = ref(database, "/elections/");
      const snapshot = await get(electionsRef);
      const electionsData = snapshot.val();

      if (!electionsData) return 0;

      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1); // Move to previous month

      const currentMonth = new Date().getMonth();

      const electionsLastMonth = Object.values(electionsData).filter(
        (election: any) => {
          const electionDate = new Date(election.createdDate); // Assuming you have a 'createdDate' field
          return (
            electionDate.getMonth() === lastMonth.getMonth() &&
            electionDate.getFullYear() === lastMonth.getFullYear()
          );
        }
      );

      return electionsLastMonth.length;
    } catch (error) {
      console.error("Error fetching last month's elections: ", error);
      return 0;
    }
  };

  const getTotalVotesLastMonth = async () => {
    try {
      const votesRef = ref(database, "/votes/");
      const snapshot = await get(votesRef);
      const votesData = snapshot.val();

      if (!votesData) return 0;

      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const votesLastMonth = Object.values(votesData).filter((vote: any) => {
        const voteDate = new Date(vote.voteDate);
        return (
          voteDate.getMonth() === lastMonth.getMonth() &&
          voteDate.getFullYear() === lastMonth.getFullYear()
        );
      });

      return votesLastMonth.length;
    } catch (error) {
      console.error("Error fetching last month's votes: ", error);
      return 0;
    }
  };

  const getTotalUsersAndChange = async () => {
    try {
      const usersRef = ref(database, "/users/");
      const snapshot = await get(usersRef);
      const usersData = snapshot.val();
      const currentUsersCount = Object.keys(usersData).length;

      const lastMonthUsersCount = await getTotalUsersLastMonth(); // Fetch last month's users count

      const userChange = calculatePercentageChange(
        currentUsersCount,
        lastMonthUsersCount
      );

      setTotalUsers(currentUsersCount); // Set total users
      setPercentageChange((prev) => ({
        ...prev,
        users: userChange, // Store percentage change in state
      }));
    } catch (error) {
      console.error("Error fetching users: ", error);
    }
  };

  const getTotalElectionsAndChange = async () => {
    try {
      const electionsRef = ref(database, "/elections/");
      const snapshot = await get(electionsRef);
      const electionsData = snapshot.val();
      const currentElectionsCount = Object.keys(electionsData).length;

      const lastMonthElectionsCount = await getTotalElectionsLastMonth();

      const electionChange = calculatePercentageChange(
        currentElectionsCount,
        lastMonthElectionsCount
      );

      setTotalElections(currentElectionsCount);
      setPercentageChange((prev) => ({
        ...prev,
        elections: electionChange,
      }));
    } catch (error) {
      console.error("Error fetching elections: ", error);
    }
  };

  const getTotalVotesAndChange = async () => {
    try {
      const votesRef = ref(database, "/votes/");
      const snapshot = await get(votesRef);
      const votesData = snapshot.val();
      const currentVotesCount = Object.keys(votesData).length;

      const lastMonthVotesCount = await getTotalVotesLastMonth();
      const voteChange = calculatePercentageChange(
        currentVotesCount,
        lastMonthVotesCount
      );
      setPercentageChange((prev) => ({
        ...prev,
        votes: voteChange,
      }));
    } catch (error) {
      console.error("Error fetching votes: ", error);
    }
  };

  const getTopTenUsersAllElections = async () => {
    try {
      const usersRef = ref(database, "/users/");
      const usersSnapshot = await get(usersRef);
      const usersData = usersSnapshot.val();

      if (!usersData) {
        return;
      }

      const voteCounts: Record<
        string,
        {
          userId: string;
          votes: number;
          name: string;
          photoUrl: string;
          email: any;
        }
      > = {};
      Object.keys(usersData).forEach((userId) => {
        const user = usersData[userId];
        voteCounts[userId] = {
          userId,
          votes: 0,
          name: user.userName || "Unknown",
          photoUrl: user.photoUrl || "",
          email: user.email || "not given",
        };
      });

      const electionsRef = ref(database, "/elections/");
      const electionsSnapshot = await get(electionsRef);
      const electionsData = electionsSnapshot.val();

      if (!electionsData) {
        return;
      }

      for (const electionId in electionsData) {
        const votesRef = ref(database, `/votes/${electionId}`);
        const votesSnapshot = await get(votesRef);
        const votesData = votesSnapshot.val();

        if (votesData) {
          Object.values(votesData).forEach((vote: any) => {
            const votedUserId = vote?.votedUserId;
            if (votedUserId && voteCounts[votedUserId]) {
              voteCounts[votedUserId].votes++;
            }
          });
        }
      }

      const usersWithVotes = Object.values(voteCounts);
      const topTenUsers = usersWithVotes
        .sort((a, b) => b.votes - a.votes)
        .slice(0, 10);

      setTopFive(topTenUsers);
    } catch (error) {
      console.error("Error retrieving and calculating top 10 users:", error);
    }
  };

  useEffect(() => {
    getTotalUsers();
    getTotalElections();
    getTotalVotes();
    getTotalUsersAndChange();
    getTotalElectionsAndChange();
    getTotalVotesAndChange();
    getTopTenUsersAllElections();
  }, []);

  return (
    <div>
      <AiDashboard
        totalUsers={totalUsers}
        totalElections={totalElections}
        totalVotes={totalVotes}
        activeElection={activeElection}
        percentageChange={percentageChange}
        topFive={topFive}
      />
    </div>
  );
}

export default Dashboard;
