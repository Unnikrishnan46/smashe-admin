import React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Activity, CreditCard, DollarSign, Shapes, UserIcon, Vote } from 'lucide-react';

type props = {
  totalUsers:any;
  totalElections:any;
  totalVotes:any;
  activeElection:any;
  percentageChange:any;
}

function MainDataCards({totalUsers,totalVotes,totalElections,activeElection,percentageChange}:props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <UserIcon size={18} color="#737373"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">+{percentageChange.users}% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Votes</CardTitle>
              <Vote size={18} color="#737373"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVotes}</div>
              <p className="text-xs text-muted-foreground">{percentageChange.votes}% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Elections</CardTitle>
              <Shapes size={18} color="#737373"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalElections}</div>
              <p className="text-xs text-muted-foreground">+{percentageChange.elections}% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Election</CardTitle>
              <Activity size={18} color="#737373"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">{activeElection}</p>
            </CardContent>
          </Card>
        </div>
  )
}

export default MainDataCards
