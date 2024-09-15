import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateUserStore } from "@/store";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { database, storage } from "@/firebase/firebase.config";
import { ref, set } from "firebase/database";
import { v4 as uuidv4 } from 'uuid';
import { getCurrentDayDetails } from "@/utils/currentTime";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const userPicArray = [
  { id: 1, imageUrl: "https://firebasestorage.googleapis.com/v0/b/smashe-2ba56.appspot.com/o/profile%2Fuserpic-default.png?alt=media&token=ec8f7926-7b41-485a-9baa-43a398092302" },
  { id: 2, imageUrl: "https://firebasestorage.googleapis.com/v0/b/smashe-2ba56.appspot.com/o/profile%2Fuserpic-male.png?alt=media&token=01531ba4-b76e-4bd8-aa3e-942890272468" },
  { id: 3, imageUrl: "https://firebasestorage.googleapis.com/v0/b/smashe-2ba56.appspot.com/o/profile%2Fuserpic-female.png?alt=media&token=1d75d1f5-6709-42f4-93b7-3cae110dcbb5" },
];

function CreateUserModal() {
  const [selectedPic, setSelectedPic] = useState("https://firebasestorage.googleapis.com/v0/b/smashe-2ba56.appspot.com/o/profile%2Fuserpic-default.png?alt=media&token=ec8f7926-7b41-485a-9baa-43a398092302");
  const [uploadedImage, setUploadedImage] = useState<string | any>(null);
  const [userName,setUserName] = useState("");
  const [email,setEmail] = useState("");
  const { toast } = useToast();
  const { isCreateUserModalOpen, setIsCreateUserModalOpen } = useCreateUserStore();

  const handleModalChange = () => {
    setIsCreateUserModalOpen(false);
  };

  const handleProfileIconClick = (imageUrl: string) => {
    setUploadedImage(null);
    setSelectedPic(imageUrl);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileReader = new FileReader();

      fileReader.onloadend = async () => {
        const base64 = fileReader.result as string;
        setUploadedImage(base64);

        const storageReference = storageRef(storage, `profile/${uuidv4()}`);
        try {
          const response = await fetch(base64);
          const blob = await response.blob();

          await uploadBytes(storageReference, blob);
          const downloadURL = await getDownloadURL(storageReference);
          setSelectedPic(downloadURL);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to upload image. Please try again.",
            className: "bg-white",
          });
        }
      };

      fileReader.readAsDataURL(file);
    }
  };

  const handleCreateUser = async () => {
    if (!userName || !selectedPic) {
      toast({
        title: "Warning",
        description: "Please fill all fields",
        className: "bg-white",
      });
      return;
    }

    const userId = uuidv4();
    const currentDate = getCurrentDayDetails(new Date());

    const profileImageUrl = uploadedImage ? selectedPic : selectedPic;

    const dbReference = ref(database, `/users/${userId}`);
    try {
      await set(dbReference, {
        userId: userId,
        userName: userName,
        email: email,
        photoUrl: profileImageUrl,
        phoneNumber: "",
        userCreated: `${currentDate.day}/${currentDate.month}/${currentDate.year} , ${currentDate.hours}:${currentDate.minutes} ${currentDate.ampm}`,
      });

      toast({
        title: "Success",
        description: "User created successfully",
        className: "bg-white",
      });
      handleModalChange(); // Close modal on success
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        className: "bg-white",
      });
    }
  };


  return (
    <Dialog open={isCreateUserModalOpen} onOpenChange={handleModalChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Create a user</DialogTitle>
          <DialogDescription>
            Create a user as per admin&apos;s needs. Remember you can&apos;t edit a user.
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input onChange={(e)=>{setUserName(e.target.value)}} id="name" placeholder="username" className="col-span-3" />
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input onChange={(e)=>{setEmail(e.target.value)}} id="email" placeholder="Email (optional)" className="col-span-3" />
          </div>
          </div>
          
          <div className="flex mt-8 items-center gap-4">
            <Label htmlFor="profile-image" className="text-right">
              Profile Image
            </Label>
            <div id="profile-image" className="flex gap-3">
              {userPicArray?.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleProfileIconClick(item.imageUrl)}
                  className={`h-16 w-16 flex cursor-pointer justify-center items-center rounded-xl border-2 ${
                    selectedPic === item.imageUrl ? "border-red-400" : ""
                  }`}
                >
                  <img src={item.imageUrl} alt="icons" />
                </div>
              ))}

              <label htmlFor="file-input-pic">
                <div
                  className={`h-16 w-16 flex cursor-pointer justify-center items-center rounded-xl border-2 ${
                    uploadedImage ? "border-red-400" : ""
                  }`}
                >
                  <img className="rounded-xl" src={uploadedImage || "https://firebasestorage.googleapis.com/v0/b/smashe-2ba56.appspot.com/o/profile%2Fadd-image.png?alt=media&token=7aa4e2d0-489d-4aa4-acd4-e9268c53349e"} alt="icons" />
                </div>
              </label>
              <input
                hidden
                type="file"
                id="file-input-pic"
                onChange={handleImageUpload}
              />
            </div>
          </div>
          <div className="flex  w-full justify-end mt-8">
            <Button onClick={handleCreateUser} className="bg-violet-500">Create</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateUserModal;

