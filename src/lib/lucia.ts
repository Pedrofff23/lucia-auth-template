import { Lucia, TimeSpan } from "lucia";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { prisma } from "./prisma";
import { cookies } from "next/headers";
import { cache } from "react";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    name: "lucia-auth-cookie",
    expires: true,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  sessionExpiresIn: new TimeSpan(5, "h"),
});

export const getUser = cache(async () => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null
  
  if (!sessionId) {
    return {
      dbUser: null,
      session: null,
    }
  }

  const { session, user } = await lucia.validateSession(sessionId);
  try {
    if (session && session.fresh) {
      //refreshing their session cookie
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
    if (!session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    }
  } catch (error) {
    console.log("error", error);
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: user!.id },
    select: { email: true, name: true, picture: true, role: true },
  });
  return {
    dbUser,
    session,
  }
  // console.log("session id", sessionId);
});
