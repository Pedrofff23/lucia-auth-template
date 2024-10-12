"use client";
import { getUser } from "@/lib/lucia";
import { useSession } from "@/providers/Session.provider";
import { useEffect } from "react";

const ClientUser = () => {
  const { dbUser } = useSession();

  return (
    <div>
      <h1>ClientUser</h1>
      {JSON.stringify(dbUser)}
    </div>
  );
};
export default ClientUser;
