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
    isDeleteAlertOpen:any;
    setIsDeleteAlertOpen:any;
    selectedUser:any;
    setSelectedUser:any;
    deleteUser:any;
  }
  
  export function DeleteAlert({isDeleteAlertOpen,setSelectedUser,deleteUser,selectedUser}:props) {
    const {setIsDeleteAlertOpen} = alertStore();
    const handleCancel = ()=>{
        setSelectedUser(null);
        setIsDeleteAlertOpen(false);
    }
    return (
      <AlertDialog open={isDeleteAlertOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={()=>{deleteUser(selectedUser)}}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  