import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { imfell400 } from "@/utils/fonts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

type props = {
  election: any;
};

function VoteMgtCard({ election }: props) {
  const fromdate = new Date(election?.fromDate);
  const todate = new Date(election?.toDate);
  const now = new Date();
  const formattedFromDate = fromdate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedToDate = todate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedFromDateTime = fromdate.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true, // for AM/PM format
  });

  const formattedToDateTime = todate.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true, // for AM/PM format
  });

  const isCompleted = todate < now;

  return (
    <Card className="w-full h-full p-4 px-8">
      <CardContent className="w-full h-full p-0">
        <div className="w-full h-full flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-4">
          <div className="h-full flex flex-col gap-3">
            <h1 className={`text-lg font-medium ${imfell400.className}`}>
              {election?.name}
            </h1>
            <p className="text-muted-foreground text-sm">
              {formattedFromDate} to {formattedToDate}
            </p>
            <Accordion type="single" collapsible className="p-0">
              <AccordionItem
                value="item-1"
                className="p-0 border-none outline-none"
              >
                <AccordionTrigger className="text-xs p-0 text-muted-foreground">
                  More details
                </AccordionTrigger>
                <AccordionContent className="mt-4">
                  <div className="flex flex-col gap-3">
                    <p>From : {formattedFromDateTime}</p>
                    <p>To : {formattedToDateTime}</p>
                    <p>Id  :  {election?.id}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <div>
            <div className="flex flex-col">
              <h1>Total vote : {election?.totalVotes}</h1>
              {!election?.isActive && ( <h1>Winner : {election?.top3Users[0]?.name}</h1> ) }
            </div>
          </div>
          <div>
            <div>
            <Badge
                className={`text-sm ${!election?.isActive ? "bg-red-400" : "bg-green-400"}`}
              >
                <p className="text-[10px]">
                  {!election?.isActive ? "Completed" : "Active"}
                </p>
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default VoteMgtCard;
