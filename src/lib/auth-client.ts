"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // No baseURL: requests go to whatever address the visitor is on, so www/non-www and preview links all work.
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
} = authClient;
