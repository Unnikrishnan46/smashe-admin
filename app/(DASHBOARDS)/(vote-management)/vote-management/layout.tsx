"use client"

import NewEvilElectionModal from "@/components/custom/NewEvilElectionModal";
import { VotePeriodModal } from "@/components/custom/VotePeriodModal";

const VoteLayout = ({ children }: { children: React.ReactNode }) => {
  
  return (
    <main className="h-full">
      {children}
      <VotePeriodModal/>
      <NewEvilElectionModal/>
    </main>
  );
};

export default VoteLayout;
