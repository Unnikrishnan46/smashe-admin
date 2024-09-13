"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { database } from "@/firebase/firebase.config";
import { useToast } from "@/hooks/use-toast";
import { ref, get, set } from "firebase/database";
import React, { useEffect, useState } from "react";

function SocialMediaPage() {
  const [twitterData, setTwitterData] = useState<string | null>(null);
  const [telegramData, setTelegramData] = useState<string | null>(null);
  const [eagleData, setEagleData] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch existing social media URLs from the database
  useEffect(() => {
    const fetchSocialMediaData = async () => {
      try {
        const socialRef = ref(database, "/socials/");
        const snapshot = await get(socialRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setTwitterData(data.twitter || "");
          setTelegramData(data.telegram || "");
          setEagleData(data.eagle || "");
        }
      } catch (error) {
        console.error("Error fetching social media data: ", error);
      }
    };

    fetchSocialMediaData();
  }, []);

  // Save social media URLs to the database
  const setSocialMediaData = async () => {
    if (!twitterData || !telegramData || !eagleData) {
      toast({ title: "Missing fields", description: "Please fill all fields." });
      return;
    }
    try {
      const socialRef = ref(database, "/socials/");
      await set(socialRef, {
        twitter: twitterData,
        telegram: telegramData,
        eagle: eagleData,
      });
      toast({ title: "Success", description: "Social media URLs updated successfully." });
    } catch (error) {
      console.error("Error saving social media data: ", error);
      toast({ title: "Error", description: "Failed to save social media URLs." });
    }
  };

  return (
    <div className="flex flex-col w-full p-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button className="h-8 w-8 rounded-full justify-center items-center flex bg-[#EAE5DA] border-2 border-[#D2BFA1] hero-connects">
            <img className="scale-75" src="/xLogo.png" alt="xLogo" />
          </button>
          <Input
            value={twitterData || ""}
            onChange={(e) => setTwitterData(e.target.value)}
            placeholder="Twitter URL"
            className="w-1/2 max-lg:w-full"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="h-8 w-8 rounded-full justify-center items-center flex bg-[#EAE5DA] border-2 border-[#D2BFA1] hero-connects">
            <img
              className="scale-75"
              src="/telegramLogo.png"
              alt="Telegram Logo"
            />
          </button>
          <Input
            value={telegramData || ""}
            onChange={(e) => setTelegramData(e.target.value)}
            placeholder="Telegram URL"
            className="w-1/2 max-lg:w-full"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="h-8 w-8 rounded-full justify-center items-center flex bg-[#EAE5DA] border-2 border-[#D2BFA1] hero-connects">
            <img className="scale-75" src="/eagleLogo.png" alt="Eagle Logo" />
          </button>
          <Input
            value={eagleData || ""}
            onChange={(e) => setEagleData(e.target.value)}
            placeholder="Eagle URL"
            className="w-1/2 max-lg:w-full"
          />
        </div>
      </div>
      <div className="w-1/2 max-lg:w-full flex justify-end">
        <Button onClick={setSocialMediaData} className="mt-4 px-10">Save</Button>
      </div>
      
    </div>
  );
}

export default SocialMediaPage;
