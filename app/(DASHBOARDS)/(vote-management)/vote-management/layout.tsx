"use client"

import { VotePeriodModal } from "@/components/custom/VotePeriodModal";

const VoteLayout = ({ children }: { children: React.ReactNode }) => {
  
  return (
    <main className="h-full">
      {children}
      <VotePeriodModal/>
    </main>
  );
};

export default VoteLayout;
