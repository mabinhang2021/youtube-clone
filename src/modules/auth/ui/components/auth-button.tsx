"use client";
import { Button } from "@/components/ui/button";
import { ClapperboardIcon, UserCircleIcon, PlusIcon,BellIcon } from "lucide-react";
import {UserButton, SignInButton, SignedIn, SignedOut} from "@clerk/nextjs";
import Link from "next/link";

export const AuthButton = () => {
    //todo: add different auth states
    return (
        <>
          <SignedIn>
            {/* {todo: add create and notice buttons} */}
            {/* <Button asChild variant="secondary" 
            className="rounded-full px-5 py-2 font-medium hover:shadow-md transition-all">
              <Link href="/create" className="flex items-center gap-2">
                <PlusIcon className="size-4" />
                <span>Create</span>
              </Link>
            </Button> */}
            {/* Notification Bell Button */}
            {/* <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full hover:bg-gray-100 mr-2"
            >
              <BellIcon className="size-5" />
            </Button> */}
            <UserButton>
              <UserButton.MenuItems>
                {/* {todo: add user profile menu button} */}
                <UserButton.Link
                  label="Studio"
                  href="/studio"
                  labelIcon = {<ClapperboardIcon className="size-4"/>}
                />
                <UserButton.Action label="manageAccount"/>
              </UserButton.MenuItems>
            </UserButton>
            
            {/* {add menu items and user profile} */}

          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
                <Button
                    variant="outline"
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border-blue-500/20
                    rounded-full shadow-none "
                >
                    <UserCircleIcon/>
                    sign in
                </Button>
            </SignInButton>
          </SignedOut>
        </>
    );
  };
  