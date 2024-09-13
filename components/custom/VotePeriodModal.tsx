"use client";
import { useState } from "react";
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
import { votePeriodStore } from "@/store";
import { DatePicker } from "rsuite";
import "./style.css";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { get, ref, set, update } from "firebase/database";
import { database } from "@/firebase/firebase.config";
import { getCurrentDayDetails } from "@/utils/currentTime";

export function VotePeriodModal() {
  const { isVotePeriodModalOpen, setIsVotePeriodModalOpen } = votePeriodStore();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    fromDate: new Date(),
    toDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  });
  const [isLoading,setIsLoading] = useState(false);

  const handleModalChange = () => {
    setIsVotePeriodModalOpen(false);
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

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (!formData.name || !formData.fromDate || !formData.toDate) {
        toast({
          title: "Warning",
          description: "Please fill all fields",
          className: "bg-white",
        });
        return; // Exit if validation fails
      }
  
      // Get the reference to the elections collection
      const electionsRef = ref(database, '/elections');
  
      // Fetch existing elections
      const snapshot = await get(electionsRef);
      const existingElections = snapshot.val();
      const currentDate = new Date();
      
      // Update the isActive field of existing elections to false
      const updates = {} as any;
      if (existingElections) {
        Object.keys(existingElections).forEach((key) => {
          if (existingElections[key].isActive) {
            updates[`/elections/${key}/isActive`] = false;
          }
        });
      }
  
      // Execute the updates to set previous elections as inactive
      await update(ref(database), updates);
  
      // Create new election
      const id = uuidv4();
      const newElectionRef = ref(database, `/elections/${id}`);
      const fromDateString = formData.fromDate.toISOString();
      const toDateString = formData.toDate.toISOString();
  
      await set(newElectionRef, {
        id: id,
        name: formData.name,
        fromDate: fromDateString,
        toDate: toDateString,
        createdDate: `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()} , ${currentDate.getHours()}:${currentDate.getMinutes()} ${currentDate.getHours() >= 12 ? 'PM' : 'AM'}`,
        isActive: true
      });
  
      setIsVotePeriodModalOpen(false);
      toast({
        title: "Success",
        description: "Election saved successfully",
        className: "bg-white",
      });
  
    } catch (error) {
      console.error("Error storing form data: ", error);
      toast({
        title: "Error",
        description: "Failed to save election",
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
    <Dialog onOpenChange={handleModalChange} open={isVotePeriodModalOpen}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Add New Vote</DialogTitle>
          <DialogDescription>
            You can add a new vote period here. Click save when you are done.
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
              defaultValue={formData.fromDate}
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
              defaultValue={formData.toDate}
              disabledDate={disabledPastDates}
              onChange={(value) => handleDateChange(value, "toDate")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button disabled={isLoading} type="submit" onClick={handleSubmit}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
