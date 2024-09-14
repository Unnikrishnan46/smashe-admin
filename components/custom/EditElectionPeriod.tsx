"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { editElectionStore } from "@/store";
import { DatePicker } from "rsuite";
import { useToast } from "@/hooks/use-toast";
import { ref, get, update } from "firebase/database";
import { database } from "@/firebase/firebase.config";
import "./style.css";

export function EditVotePeriodModal({ electionId }: { electionId: string }) {
  const { isElectionEditModalOpen, setIsElectionEditModalOpen } = editElectionStore();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    fromDate: new Date(),
    toDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
  });
  const [isLoading, setIsLoading] = useState(false);
  console.log(formData);
  
  useEffect(() => {
    // Fetch the existing election data by electionId
    const fetchElectionData = async () => {
      const electionRef = ref(database, `/elections/${electionId}`);
      const snapshot = await get(electionRef);
      const electionData = snapshot.val();

      if (electionData) {
        setFormData({
          name: electionData.name || "",
          fromDate: new Date(electionData.fromDate),
          toDate: new Date(electionData.toDate),
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch election data",
          className: "bg-white",
        });
      }
    };

    if (electionId) {
      fetchElectionData();
    }
  }, [electionId, toast]);

  const handleModalChange = () => {
    setIsElectionEditModalOpen(false);
  };

  const handleInputChange = (e: any) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleDateChange = (value: any, id: any) => {
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleEditSubmit = async () => {
    setIsLoading(true);
    try {
      if (!formData.name || !formData.fromDate || !formData.toDate) {
        toast({
          title: "Warning",
          description: "Please fill all fields",
          className: "bg-white",
        });
        setIsLoading(false);
        return;
      }
  
      const fromDate = formData.fromDate.getTime();
      const toDate = formData.toDate.getTime();
  
      // Ensure the 'toDate' is after 'fromDate'
      if (toDate <= fromDate) {
        toast({
          title: "Error",
          description: "The 'To' date must be later than the 'From' date.",
          className: "bg-white",
        });
        setIsLoading(false);
        return;
      }
  
      // Get reference to elections collection
      const electionsRef = ref(database, "/elections");
  
      // Fetch existing elections
      const snapshot = await get(electionsRef);
      const existingElections = snapshot.val();
  
      if (existingElections) {
        // Check for date collisions with existing elections, excluding the current election
        for (let key in existingElections) {
          if (key !== electionId) { // Exclude the election being edited
            const election = existingElections[key];
            const existingFromDate = new Date(election.fromDate).getTime();
            const existingToDate = new Date(election.toDate).getTime();
  
            // Check if the new election period overlaps with any other election period
            if (
              (fromDate >= existingFromDate && fromDate <= existingToDate) || // Edited election starts during another election
              (toDate >= existingFromDate && toDate <= existingToDate) || // Edited election ends during another election
              (fromDate <= existingFromDate && toDate >= existingToDate) // Edited election fully encompasses an existing election
            ) {
              toast({
                title: "Error",
                description: "The selected time period overlaps with another election.",
                className: "bg-white",
              });
              setIsLoading(false);
              return;
            }
          }
        }
      }
  
      // Proceed with updating the election
      const electionRef = ref(database, `/elections/${electionId}`);
      await update(electionRef, {
        name: formData.name,
        fromDate: formData.fromDate.toISOString(),
        toDate: formData.toDate.toISOString(),
      });
  
      setFormData((prevState) => ({
        ...prevState,
        name: "",
      }));
      setIsElectionEditModalOpen(false);
  
      toast({
        title: "Success",
        description: "Election updated successfully",
        className: "bg-white",
      });
    } catch (error) {
      console.error("Error updating election: ", error);
      toast({
        title: "Error",
        description: "Failed to update election",
        className: "bg-white",
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  const disabledPastDates = (date: any) => {
    const now = new Date();
    const timeThreshold = new Date(now.getTime() - 30 * 60000);
    return date < timeThreshold;
  };

  return (
    <Dialog onOpenChange={handleModalChange} open={isElectionEditModalOpen}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Edit Vote</DialogTitle>
          <DialogDescription>
            You can edit the vote period here. Click save when you are done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              placeholder="vote name"
              className="col-span-3"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fromDate" className="text-right">
              From
            </Label>
            <DatePicker
              className="col-span-3"
              id="fromDate"
              format="MM/dd/yyyy hh:mm aa"
              showMeridian
              placement="topStart"
              value={formData.fromDate}
              disabledDate={disabledPastDates}
              onChange={(value) => handleDateChange(value, "fromDate")}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="toDate" className="text-right">
              To
            </Label>
            <DatePicker
              className="col-span-3"
              id="toDate"
              format="MM/dd/yyyy hh:mm aa"
              showMeridian
              placement="topStart"
              value={formData.toDate}
              disabledDate={disabledPastDates}
              onChange={(value) => handleDateChange(value, "toDate")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={isLoading} type="submit" onClick={handleEditSubmit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
