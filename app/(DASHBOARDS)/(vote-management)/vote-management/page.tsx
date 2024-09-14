"use client"
import VoteMgtCard from "@/components/custom/VoteMgtCard";
import { Button } from "@/components/ui/button";
import { database } from "@/firebase/firebase.config";
import { votePeriodStore } from "@/store";
import { poppinsNormal } from "@/utils/fonts";
import { onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";



function VoteManagement() {
    const {setIsVotePeriodModalOpen} = votePeriodStore();
    const [electionsData, setElectionsData] = useState<any[]>([]);
    
    const getAllElectionsWithVotes = async () => {
      try {
        const electionsRef = ref(database, "/elections/");
        onValue(electionsRef, async (snapshot) => {
          const elections = snapshot.val();
          if (!elections) return;
    
          const electionArray = Object.values(elections);
          const currentDate = new Date();  // Get the current date
    
          const electionPromises = electionArray.map(async (election: any) => {
            const electionId = election.id;
            const votesRef = ref(database, `/votes/${electionId}`);
            const votesSnapshot = await new Promise((resolve) =>
              onValue(votesRef, resolve)
            ) as any;
            const votes = votesSnapshot.val();
    
            const totalVotes = votes ? Object.values(votes).length : 0;
    
            // Use the ISO dates directly for comparison
            const startDate = new Date(election.fromDate);  // assuming fromDate is in ISO format
            const endDate = new Date(election.toDate);  // assuming toDate is in ISO format
            const isActive = currentDate >= startDate && currentDate <= endDate;
    
            // Get top 3 users
            const voteCounts: Record<string, number> = {};
            if (votes) {
              Object.values(votes).forEach((vote: any) => {
                const votedUserId = vote?.votedUserId;
                if (votedUserId) {
                  voteCounts[votedUserId] = (voteCounts[votedUserId] || 0) + 1;
                }
              });
            }
    
            const top3UsersWithNames = await Promise.all(
              Object.entries(voteCounts)
                .sort(([, votesA], [, votesB]) => votesB - votesA)
                .slice(0, 3)
                .map(async ([userId, votes]) => {
                  const userRef = ref(database, `/users/${userId}`);
                  const userSnapshot = await new Promise((resolve) =>
                    onValue(userRef, resolve)
                  ) as any;
                  const user = userSnapshot.val();
    
                  return {
                    userId,
                    votes,
                    name: user?.userName || "Unknown User",
                  };
                })
            );
    
            return {
              ...election,
              totalVotes,
              top3Users: top3UsersWithNames,
              isActive,  // Correct isActive flag calculation
            };
          });
    
          Promise.all(electionPromises).then((electionResults) => {
            setElectionsData(electionResults);
          });
        });
      } catch (error) {
        console.error("Error retrieving elections with votes: ", error);
      }
    };
    
  
    useEffect(()=>{
      getAllElectionsWithVotes();
    },[]);

    const downloadExcel = (data: any[], fileName: string) => {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Elections Data");
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    };

    const handleDownload = () => {
      downloadExcel(electionsData, "Elections_Data");
    };

  return (
    <div className={`p-8 w-full ${poppinsNormal.className}`}>
      <div className="flex mb-8 w-full items-center justify-between">
       <h1>Total : {electionsData?.length}</h1> 
       <div className="flex items-center gap-3">
        <Button onClick={handleDownload}>Download</Button>
        <Button onClick={()=>{setIsVotePeriodModalOpen(true)}} className="bg-pink-500">New Vote</Button>
       </div>
      </div>
      <div className="w-full flex flex-col gap-2">
        {electionsData?.map((election,index)=>(
          <VoteMgtCard election={election} key={index} isActive={election.isActive} getAllElectionsWithVotes={getAllElectionsWithVotes}/>
        ))}
        {electionsData.length <= 0 && (
          <div className="w-full flex justify-center items-center">
            <h1>No Elections</h1>
          </div>
        )}
      </div>
    </div>
  );
}

export default VoteManagement;
