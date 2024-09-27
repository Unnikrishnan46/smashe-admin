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
import React from 'react'
import { votePeriodStore } from "@/store";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { DatePicker } from "rsuite";
import "./style.css";
import { useToast } from "@/hooks/use-toast";
import { get, ref, set } from "firebase/database";
import { database } from "@/firebase/firebase.config";
import { v4 as uuidv4 } from "uuid";



function NewEvilElectionModal() {
    const {isNewEvilElectionOpen,setIsNewEvilElectionOpen} = votePeriodStore();
    const [isLoading,setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        fromDate: new Date(),
        toDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      });    
      const { toast } = useToast();

    const handleModalChange = ()=>{
        setIsNewEvilElectionOpen(false);
    }
    
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
            // Check for date collisions with existing elections
            for (let key in existingElections) {
              const election = existingElections[key];
              const existingFromDate = new Date(election.fromDate).getTime();
              const existingToDate = new Date(election.toDate).getTime();
      
              // Check if the new election period overlaps with any existing election period
              if (
                (fromDate >= existingFromDate && fromDate <= existingToDate) || // New election starts during another election
                (toDate >= existingFromDate && toDate <= existingToDate) || // New election ends during another election
                (fromDate <= existingFromDate && toDate >= existingToDate) // New election fully encompasses an existing election
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
      
          const id = uuidv4();
          const newElectionRef = ref(database, `/elections/${id}`);
          const currentDate = new Date();
      
          await set(newElectionRef, {
            id: id,
            name: formData.name,
            fromDate: formData.fromDate.toISOString(),
            toDate: formData.toDate.toISOString(),
            electionMode:"evil",
            createdDate: `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}, ${currentDate.getHours()}:${currentDate.getMinutes()} ${currentDate.getHours() >= 12 ? "PM" : "AM"}`,
          });
          setFormData((prevState) => ({
            ...prevState, 
            name: "" 
          }));
          setIsNewEvilElectionOpen(false);
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
    <Dialog onOpenChange={handleModalChange} open={isNewEvilElectionOpen}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Add New Evil Election</DialogTitle>
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
  )
}

export default NewEvilElectionModal
