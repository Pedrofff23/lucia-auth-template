"use server";

import { z } from "zod";
import { signUpschema } from "./SignUpForm";
import { prisma } from "@/lib/prisma";
import { Argon2id } from "oslo/password";
import { getUser, lucia } from "@/lib/lucia";
import { cookies } from "next/headers";
import { signInSchema } from "./SignInForm";
import { redirect } from "next/navigation";
import { generateCodeVerifier, generateState } from "arctic";
import { googleOAuthClient } from "@/lib/googleOauth";

export const signUp = async (values: z.infer<typeof signUpschema>) => {
  // console.log(values);
  try {
    //if user already exists, throe an error
    const existingUser = await prisma.user.findUnique({
      where: { email: values.email },
    });
    if (existingUser) {
      return { error: "User already exists", success: false };
    }

    const hashedPassword = await new Argon2id().hash(values.password);

    const user = await prisma.user.create({
      data: {
        email: values.email.toLowerCase(),
        name: values.name,
        hashedPassword,
      },
    });
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return { success: true };
  } catch (error) {
    return { error: "Something went wrong", success: false };
  }
};

export const signIn = async (values: z.infer<typeof signInSchema>) => {
  // console.log("im in the server signing in", values);
  const user = await prisma.user.findUnique({
    where: { email: values.email.toLowerCase() },
  });
  if (!user || !user.hashedPassword) {
    return { error: "Invalid Credentials ", success: false };
  }
  const passwordMatch = await new Argon2id().verify(
    user.hashedPassword,
    values.password,
  );
  if (!passwordMatch) {
    return { error: "Invalid Credentials", success: false };
  }
  // successful sign in
  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return { success: true };
};

export const signOut = async () => {
  try {
    const { session } = await getUser();

    if (!session) {
      return {
        error: "Unauthorized",
      };
    }

    // await lucia.deleteExpiredSessions();
    // await lucia.invalidateUserSessions(userId);

    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();

    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    return redirect("/authenticate");
  } catch (error) {
    return { error: "Something went wrong" };
  }
};

export const getGoogleOauthConsentUrl = async () => {
  try {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    cookies().set("codeVerifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    cookies().set("state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    const authUrl = await googleOAuthClient.createAuthorizationURL(
      state,
      codeVerifier,
      {
        scopes: ["email", "profile"],
      },
    );
    return { success: true, url: authUrl.toString() };
  } catch (error) {
    return { success: false, error: "Something went wrong" };
  }
};
