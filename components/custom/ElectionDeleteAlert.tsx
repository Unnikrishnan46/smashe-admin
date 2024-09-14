import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"
import { alertStore } from "@/store";

  type props = {
    isElectionDeleteAlertOpen:boolean;
    deleteElection:any;
    electionIdForDelete:any;
  }
  
  export function ElectionDeleteAlert({isElectionDeleteAlertOpen,deleteElection,electionIdForDelete}:props) {
    const {setIsElectionDeleteAlertOpen} = alertStore();
    const handleCancel = ()=>{
        setIsElectionDeleteAlertOpen(false);
    }
    return (
      <AlertDialog open={isElectionDeleteAlertOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this election and remove the data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={()=>{deleteElection(electionIdForDelete)}}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  