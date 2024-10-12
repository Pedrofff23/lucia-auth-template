"use client";
import React from "react";
import { Button } from "./ui/button";
import { RiGoogleFill } from "@remixicon/react";

import { toast } from "sonner";
import { getGoogleOauthConsentUrl } from "@/app/authenticate/auth.actions";

const GoogleOAuthButton = () => {
  return (
    <Button
      onClick={async () => {
        const res = await getGoogleOauthConsentUrl();
        if (res.url) {
          window.location.href = res.url;
        } else {
          toast.error(res.error);
        }
      }}
    >
      <RiGoogleFill className="w-4 h-4 mr-2" /> Continue with Google!
    </Button>
  );
};

export default GoogleOAuthButton;
