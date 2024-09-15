"use client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "./Navbar";
import { Calendar } from "lucide-react";
import MainDataCards from "./MainDataCards";
import MainBarChart from "./MainBarChart";
import MainRecentVotes from "./MainRecentVotes";
import { getCurrentDayDetails } from "@/utils/currentTime";
import { useRef } from "react";
import downloadjs from "downloadjs";
import html2canvas from "html2canvas";
import Link from "next/link";
import { usePathname } from "next/navigation";

type props = {
  totalUsers: any;
  totalElections: any;
  totalVotes: any;
  activeElection: any;
  percentageChange: any;
  topFive: any;
};

export function AiDashboard({
  totalUsers,
  totalElections,
  totalVotes,
  activeElection,
  percentageChange,
  topFive,
}: props) {
  const pathname = usePathname();
  const divRef = useRef(null);
  const downloadBtnRef = useRef(null);
  const currData = getCurrentDayDetails(new Date());
  const handleCaptureClick = async () => {
    const canvas = await html2canvas(divRef.current!, {
      useCORS: true,
      ignoreElements: (element) => {
        return element === downloadBtnRef.current;
      },
    });
    const dataURL = canvas.toDataURL("image/png");
    downloadjs(dataURL, "download.png", "image/png");
  };
  return (
    <div className="flex flex-col w-full min-h-screen" ref={divRef}>
      {/* <Navbar logOut={logOut}/> */}
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="flex max-sm:hidden">
              <Calendar size={15} className="mr-3" />
              {currData?.monthName} {currData?.day}, {currData?.year} -{" "}
              {currData?.hours} {currData?.minutes}, {currData?.ampm}
            </Button>
            <Button
              onClick={handleCaptureClick}
              ref={downloadBtnRef}
              variant="default"
              size="sm"
            >
              Download
            </Button>
          </div>
        </div>
        <div
          defaultValue="overview"
          className="hidden max-md:flex max-[500px]:w-full max-[500px]:justify-center"
        >
          <div className="max-[440px]:grid max-[440px]:grid-cols-2 max-[440px]:w-full max-[440px]:h-full max-[440px]:gap-3 max-[500px]:justify-center max-md:flex max-md:gap-4 max-md:items-center">
            <Link
              href="/"
              className={`text-center py-2 max-md:px-4 rounded-md ${
                pathname === "/" ? "bg-red-200" : ""
              }`}
            >
              Overview
            </Link>
            <Link
              href="/users"
              className={`text-center py-2 max-md:px-4 rounded-md ${
                pathname === "/users" ? "bg-red-200" : ""
              }`}
            >
              Users
            </Link>
            <Link
              href="/vote-management"
              className={`text-center py-2 max-md:px-4 rounded-md ${
                pathname === "/vote-management" ? "bg-red-200" : ""
              }`}
            >
              Vote Management
            </Link>
            <Link
              href="/social-media-handler"
              className={`text-center py-2 max-md:px-4 rounded-md ${
                pathname === "/social-media-handler" ? "bg-red-200" : ""
              }`}
            >
              Social Media
            </Link>
          </div>
        </div>
        <MainDataCards
          totalUsers={totalUsers}
          totalElections={totalElections}
          totalVotes={totalVotes}
          activeElection={activeElection}
          percentageChange={percentageChange}
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <MainBarChart />
          <MainRecentVotes topFive={topFive} />
        </div>
      </main>
    </div>
  );
}
