"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { Input } from "../ui/input";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ringbearer } from "@/utils/fonts";
import { useSearchStore } from "@/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from '@clerk/nextjs'


function Navbar() {
  const { signOut} = useAuth();
  const {user} = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const isActive = (route: any) => pathname === route;
  const { searchInput, setSearchInput } = useSearchStore();
  const logOut = async () => {
    try {
      await signOut();
      window.history.pushState(null, "", window.location.href);
      window.addEventListener("popstate", () => {
        router.replace("/sign-in");
      });
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };
  

  return (
    <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6">
      <div className="flex items-center gap-4 mr-8">
        <h1
          onClick={() => {
            router.push("/");
          }}
          className={`${ringbearer.className} text-[#ffc23e] tracking-[0.05] text-3xl`}
          style={{
            textShadow: "1px 2px 0px #372400",
            color: "transparent",
            WebkitTextFillColor: "#ffc23e",
          }}
        >
          $MASHE
        </h1>
      </div>
      <nav className="flex-col hidden gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/"
          className={isActive("/") ? "font-bold" : "text-muted-foreground"}
          prefetch={false}
        >
          Overview
        </Link>
        <Link
          href="/users"
          className={isActive("/users") ? "font-bold" : "text-muted-foreground"}
          prefetch={false}
        >
          Users
        </Link>
        <Link
          href="/vote-management"
          className={`${
            isActive("/vote-management") ? "font-bold" : "text-muted-foreground"
          } whitespace-nowrap`}
          prefetch={false}
        >
          Vote Management
        </Link>
        <Link
          href="/social-media-handler"
          className={isActive("/social-media-handler") ? "font-bold whitespace-nowrap" : "text-muted-foreground whitespace-nowrap"}
          prefetch={false}
        >
          Social Media
        </Link>
      </nav>
      <div className="flex items-center w-full gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="flex-1 ml-auto sm:flex-initial">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              onChange={(e) => {
                setSearchInput(e.target.value);
              }}
              type="search"
              placeholder="Search users..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" alt="User Avatar" />
              <AvatarFallback>{user?.emailAddresses[0]?.emailAddress?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={logOut}>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default Navbar;
