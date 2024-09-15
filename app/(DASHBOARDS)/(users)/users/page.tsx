"use client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { database } from "@/firebase/firebase.config";
import { poppins } from "@/utils/fonts";
import { get, onValue, ref } from "firebase/database";
import { MessageCircleMoreIcon, Trash2, Undo, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DeleteAlert } from "@/components/custom/DeleteAlert";
import { alertStore, sheetStore, useCreateUserStore, useSearchStore } from "@/store";
import { CommentsSheet } from "@/components/custom/CommentsSheet";
import * as XLSX from "xlsx";
import CreateUserModal from "@/components/custom/CreateUserModal";

const UserPage = () => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const { toast } = useToast();
  const { isDeleteAlertOpen, setIsDeleteAlertOpen } = alertStore();
  const {isCommentsSheetOpen,setIsCommentsSheetOpen} = sheetStore();
  const [selectedUser, setSelectedUser] = useState(null);
  const [comments,setComments] = useState<any>([]);
  const {searchInput,setSearchInput} = useSearchStore();
  const { setIsCreateUserModalOpen } =
  useCreateUserStore();

  const getAllUsersWithAllTimeVotes = () => {
    try {
      // Set up a listener for users
      const usersRef = ref(database, "/users/");
      onValue(usersRef, async (snapshot) => {
        const usersData = snapshot.val();
  
        if (!usersData) {
          return;
        }
  
        const usersArray = Object.values(usersData);
  
        // Fetch all elections
        const electionsRef = ref(database, "/elections/");
        const electionsSnapshot = await get(electionsRef);
        const electionsData = electionsSnapshot.val();
  
        if (!electionsData) {
          return;
        }
  
        const electionsArray = Object.values(electionsData) as any;
  
        const voteCounts: Record<string, number> = {};
        for (const election of electionsArray) {
          const electionId = election.id;
  
          // Set up a listener for votes for each election
          const votesRef = ref(database, `/votes/${electionId}`);
          const votesSnapshot = await get(votesRef);
          const votesData = votesSnapshot.val();
  
          if (votesData) {
            // Count votes for each user in the election
            Object.values(votesData).forEach((vote: any) => {
              const votedUserId = vote?.votedUserId;
              if (votedUserId) {
                if (voteCounts[votedUserId]) {
                  voteCounts[votedUserId]++;
                } else {
                  voteCounts[votedUserId] = 1;
                }
              }
            });
          }
        }
  
        const updatedUsers = usersArray.map((user: any) => {
          const userId = user.userId;
          const votes = voteCounts[userId] || 0;
          return {
            ...user,
            votes,
          };
        });
  
        setAllUsers(updatedUsers);
      });
    } catch (error) {
      console.error("Error retrieving and updating users with all-time votes: ", error);
    }
  };
  

  const deleteUser = async (user: any) => {
    try {
      const response = await fetch(`/api/ban`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.userId }),
      });
  
      if (response.ok) {
        toast({
          title: "Success",
          description: `User ${user.userId} has been banned and their comments deleted.`,
          className:"bg-white"
        });
        setIsDeleteAlertOpen(false);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: `Failed to ban user: ${errorData.error}`,
          className:"bg-white"
        });
      }
    } catch (error) {
      console.error("Error banning user:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        className:"bg-white"
      });
    }
  };
  

  const unbanUser = async (user: any) => {
    try {
      const response = await fetch(`/api/unban`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.userId }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `User ${user.userId} has been unbanned successfully.`,
          className:"bg-white"
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: `Failed to unban user: ${errorData.error}`,
          className:"bg-white"
        });
      }
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        className:"bg-white"
      });
    }
  };

  const getAllComments = async (userId: string) => {
    console.log("function working");
    
    try {
      const response = await fetch('/api/get-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
  
      const result = await response.json();
      console.log(result);
      
      if (response.ok) {
        setComments(result.comments);
      } else {
        console.error('Error fetching comments:', result.error);
      }
    } catch (error) {
      console.error('Request failed:', error);
    }
  };

  const deleteComment = async (comment: any) => {
    try {
      const response = await fetch('/api/delete-comment', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(comment),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong while deleting the comment.');
      }
  
      toast({title:"Message Deleted", description:'Comment deleted successfully',className:"bg-white"});
      getAllComments(comment?.commentTo);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleTrashClick = (user: any) => {
    setIsDeleteAlertOpen(true);
    setSelectedUser(user);
  };

  const handleChatClick = (user:any)=>{
    setIsCommentsSheetOpen(true);
    setSelectedUser(user);
    getAllComments(user.userId);
  }

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      allUsers.map((user, index) => ({
        "Sl No.": index + 1,
        Name: user.userName || "Not provided",
        Email: user.email || "Not provided",
        "Vote Got": user.votes || 0,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    // Download Excel file
    XLSX.writeFile(workbook, "Users_List.xlsx");
  };

  const createUserBtnClick = ()=>{
    setIsCreateUserModalOpen(true);
  }

  useEffect(() => {
    getAllUsersWithAllTimeVotes();
  }, []);

  useEffect(() => {
    // Filter users based on search input
    const filtered = allUsers.filter(user =>
      user?.userName.toLowerCase().includes(searchInput.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchInput, allUsers]);


  return (
    <div className="flex h-screen p-8 flex-col">
      <div className="flex w-full justify-end gap-4 items-center">
        <Button onClick={createUserBtnClick} className="rounded-full bg-violet-500 hover:bg-violet-300 hover:text-black" size={"icon"}><UserPlus size={18}/></Button>
        <Button onClick={downloadExcel}>Dowmload</Button>
      </div>
      <div className="w-full max-md:overflow-x-scroll">
      <Table className="w-full min-w-[814px]">
        <TableHeader className="w-full">
          <TableRow className="w-full whitespace-nowrap">
            <TableHead
              className={`font-extrabold ${poppins.className} text-black w-1/12 text-center`}
            >
              Sl No.
            </TableHead>
            <TableHead
              className={`font-extrabold ${poppins.className} text-black w-2/6 text-center`}
            >
              Name
            </TableHead>
            <TableHead
              className={`font-extrabold ${poppins.className} text-black w-1/6 text-center`}
            >
              Email
            </TableHead>
            <TableHead
              className={`font-extrabold ${poppins.className} text-black w-1/6 text-center`}
            >
              Vote Got
            </TableHead>
            <TableHead
              className={`font-extrabold ${poppins.className} text-black w-1/6 text-center`}
            >
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="w-full whitespace-nowrap">
          {!searchInput ? allUsers?.map((user, index) => (
            <TableRow className="w-full" key={index}>
              <TableCell className="w-1/12 text-center">{index + 1}</TableCell>
              <TableCell className="w-1/6 text-center">
                <div className="flex items-center h-full gap-3 justify-center">
                  <div className="flex items-center gap-3 w-1/2">
                    <img
                      className="h-12 w-12 rounded-full"
                      src={user?.photoUrl}
                      alt=""
                    />
                    <p>{user?.userName}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="w-1/6 text-center">
                {user?.email ? user?.email : "Not given"}
              </TableCell>
              <TableCell className="w-1/6 text-center">{user?.votes}</TableCell>
              <TableCell className="w-1/6 text-center">
                <div className="flex items-center gap-4 justify-center">
                  {user?.isBanned ? (
                    <Button
                      onClick={() => {
                        unbanUser(user);
                      }}
                      className="rounded-full bg-green-500"
                      size={"icon"}
                    >
                      <Undo size={19} />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        handleTrashClick(user);
                      }}
                      className="rounded-full"
                      variant={"destructive"}
                      size={"icon"}
                    >
                      <Trash2 size={19} />
                    </Button>
                  )}
                  <Button onClick={()=>{handleChatClick(user)}} className="rounded-full bg-blue-500" size={"icon"}>
                    <MessageCircleMoreIcon size={19} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )) : filteredUsers?.map((user, index) => (
            <TableRow className="w-full" key={index}>
              <TableCell className="w-1/12 text-center">{index + 1}</TableCell>
              <TableCell className="w-1/6 text-center">
                <div className="flex items-center h-full gap-3 justify-center">
                  <div className="flex items-center gap-3 w-1/2">
                    <img
                      className="h-12 w-12 rounded-full"
                      src={user?.photoUrl}
                      alt=""
                    />
                    <p>{user?.userName}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="w-1/6 text-center">
                {user?.email ? user?.email : "Not given"}
              </TableCell>
              <TableCell className="w-1/6 text-center">{user?.votes}</TableCell>
              <TableCell className="w-1/6 text-center">
                <div className="flex items-center gap-4 justify-center">
                  {user?.isBanned ? (
                    <Button
                      onClick={() => {
                        unbanUser(user);
                      }}
                      className="rounded-full bg-green-500"
                      size={"icon"}
                    >
                      <Undo size={19} />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        handleTrashClick(user);
                      }}
                      className="rounded-full"
                      variant={"destructive"}
                      size={"icon"}
                    >
                      <Trash2 size={19} />
                    </Button>
                  )}
                  <Button onClick={()=>{handleChatClick(user)}} className="rounded-full bg-blue-500" size={"icon"}>
                    <MessageCircleMoreIcon size={19} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
      <DeleteAlert
        isDeleteAlertOpen={isDeleteAlertOpen}
        setIsDeleteAlertOpen={setIsDeleteAlertOpen}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        deleteUser={deleteUser}
      />
      <CommentsSheet selectedUser={selectedUser} setSelectedUser={setSelectedUser} comments={comments} deleteComment={deleteComment}/>
      <CreateUserModal/>
    </div>
  );
};

export default UserPage;
