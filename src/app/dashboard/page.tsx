import ClientUser from "@/components/ClientUser";
import CLientUser from "@/components/ClientUser";
import SignOutButton from "@/components/SignOutButton";
import { getUser } from "@/lib/lucia";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";

const DashboardPage = async () => {
  // protected!!!
  const { dbUser } = await getUser();
  if (!dbUser) {
    redirect("/authenticate");
  }

  return (
    <>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center gap-2 border p-4 rounded-lg bg-gray-100 transition-all cursor-pointer hover:shadow-xl">
          {dbUser.picture && (
            <Image
              alt="User Profile Picture"
              src={dbUser.picture}
              className="rounded-full size-16"
              height={40}
              width={40}
            />
          )}
          <div className="flex flex-col">
            <span className="font-semibold text-xl">{dbUser.name}</span>
            <span className="text-gray-500">{dbUser.email}</span>
          </div>
        </div>
      </div>
      <div>
        <ClientUser />
      </div>
      <div className="absolute right-4 top-4">
        <SignOutButton>Sign Out</SignOutButton>
      </div>
    </>
  );
};

export default DashboardPage;
