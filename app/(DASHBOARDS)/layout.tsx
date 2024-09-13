"use client";

import Navbar from "@/components/custom/Navbar";

const DASHBOARDLayout = ({ children }: { children: React.ReactNode }) => {
  
  return (
    <main className="h-full">
      <Navbar />
      {children}
    </main>
  );
};

export default DASHBOARDLayout;
