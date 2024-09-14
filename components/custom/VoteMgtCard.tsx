import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { imfell400 } from "@/utils/fonts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { Edit, Trash } from "lucide-react";
import { alertStore, editElectionStore } from "@/store";
import { ElectionDeleteAlert } from "./ElectionDeleteAlert";
import { ref, remove } from "firebase/database";
import { database } from "@/firebase/firebase.config";
import { EditVotePeriodModal } from "./EditElectionPeriod";

type props = {
  election: any;
  isActive: boolean;
  getAllElectionsWithVotes:any;
};

function VoteMgtCard({ election, isActive,getAllElectionsWithVotes }: props) {
  const fromdate = new Date(election?.fromDate);
  const todate = new Date(election?.toDate);
  const { isElectionDeleteAlertOpen, setIsElectionDeleteAlertOpen ,setElectionId,electionId} =
    alertStore();

    const {editElectionId,setEditElectionId,setIsElectionEditModalOpen} = editElectionStore()
  const now = new Date();
  const formattedFromDate = fromdate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedToDate = todate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  

  const formattedFromDateTime = fromdate.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true, // for AM/PM format
  });

  const formattedToDateTime = todate.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true, // for AM/PM format
  });

  const deleteElection = async (electionID: string) => {
    try {
      const electionRef = ref(database, `/elections/${electionID}`);
      await remove(electionRef);
      setIsElectionDeleteAlertOpen(false);
      getAllElectionsWithVotes();
    } catch (error) {
      console.error("Error deleting election: ", error);
    }
  };

  const handleEditClick = (electionId:any)=>{
    setEditElectionId(electionId);
    setIsElectionEditModalOpen(true);
  }

  const handleDeleteClick = (electionId:any) => {
    setElectionId(electionId);
    setIsElectionDeleteAlertOpen(true);
  };

  return (
    <Card className="w-full h-full p-4 px-8">
      <CardContent className="w-full h-full p-0">
        <div className="w-full h-full flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-4">
          <div className="h-full flex flex-col gap-3">
            <h1 className={`text-lg font-medium ${imfell400.className}`}>
              {election?.name}
            </h1>
            <p className="text-muted-foreground text-sm">
              {formattedFromDate} to {formattedToDate}
            </p>
            <Accordion type="single" collapsible className="p-0">
              <AccordionItem
                value="item-1"
                className="p-0 border-none outline-none"
              >
                <AccordionTrigger className="text-xs p-0 text-muted-foreground">
                  More details
                </AccordionTrigger>
                <AccordionContent className="mt-4">
                  <div className="flex flex-col gap-3">
                    <p>From : {formattedFromDateTime}</p>
                    <p>To : {formattedToDateTime}</p>
                    <p>Id : {election?.id}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <div>
            <div className="flex flex-col">
              <h1>Total vote : {election?.totalVotes}</h1>
              {!election?.isActive && (
                <h1>Winner : {election?.top3Users[0]?.name}</h1>
              )}
            </div>
          </div>
          <div>
            <div>
              <Badge
                className={`text-sm ${
                  !isActive ? "bg-red-400" : "bg-green-400"
                }`}
              >
                <p className="text-[10px]">
                  {isActive}
                  {!isActive ? "Completed" : "Active"}
                </p>
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
            onClick={()=>{handleEditClick(election.id)}}
              className="bg-blue-400 rounded-full justify-center items-center flex"
              size={"icon"}
            >
              <Edit size={18} />
            </Button>
            <Button
              onClick={()=>handleDeleteClick(election.id)}
              className="bg-red-400 rounded-full justify-center items-center flex"
              size={"icon"}
            >
              <Trash size={18} />
            </Button>
          </div>
        </div>
      </CardContent>
      <ElectionDeleteAlert isElectionDeleteAlertOpen={isElectionDeleteAlertOpen} deleteElection={deleteElection} electionIdForDelete={electionId}/>
      <EditVotePeriodModal electionId={editElectionId}/>
    </Card>
  );
}

export default VoteMgtCard;
