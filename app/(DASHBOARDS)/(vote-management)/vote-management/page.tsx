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
    
          if (!elections) {
            return;
          }
    
          const electionArray = Object.values(elections);
          const parseDate = (dateStr: string): Date => {
            const [datePart, timePart] = dateStr.split(' , ');
            const [month, day, year] = datePart.split('/').map(Number);
            const [time, period] = timePart.split(' ');
            const [hour, minute] = time.split(':').map(Number);
            
            let hour24 = hour;
            if (period === 'PM' && hour < 12) hour24 = hour + 12;
            if (period === 'AM' && hour === 12) hour24 = 0;
    
            return new Date(year, month - 1, day, hour24, minute);
          };
    
          electionArray.sort((a: any, b: any) => {
            const dateA = parseDate(a.createdDate);
            const dateB = parseDate(b.createdDate);
            return dateB.getTime() - dateA.getTime(); 
          });
    
          const electionPromises = electionArray.map(async (election: any) => {
            const electionId = election.id;
            const votesRef = ref(database, `/votes/${electionId}`);
            const votesSnapshot = await new Promise((resolve) =>
              onValue(votesRef, resolve)
            ) as any;
            const votes = votesSnapshot.val();
    
            if (!votes) {
              return {
                ...election,
                totalVotes: 0,
                top3Users: [],
              };
            }
    
            const voteCounts: Record<string, number> = {};
    
            Object.values(votes).forEach((vote: any) => {
              const votedUserId = vote?.votedUserId;
              if (votedUserId) {
                if (voteCounts[votedUserId]) {
                  voteCounts[votedUserId]++;
                } else {
                  voteCounts[votedUserId] = 1;
                }
              }
            });
    
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
              totalVotes: Object.values(votes).length,
              top3Users: top3UsersWithNames,
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
          <VoteMgtCard election={election} key={index}/>
        ))}
        
      </div>
    </div>
  );
}

export default VoteManagement;
