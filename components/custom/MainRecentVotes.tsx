import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function MainRecentVotes({ topFive }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Five</CardTitle>
        <CardDescription>
          Top 5 users with the most votes of all time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topFive.slice(0,5)?.map((item:any, index:any) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage
                    src={item?.photoUrl}
                    alt="Olivia Martin"
                  />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">
                    {item?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item?.email}
                  </p>
                </div>
              </div>
              <div className="text-sm font-medium">{item?.votes}</div>
            </div>
          ))}

        </div>
      </CardContent>
    </Card>
  );
}

export default MainRecentVotes;
