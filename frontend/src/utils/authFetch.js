import { signIn } from "next-auth/react";

export async function authFetch(url, options = {}) {
  const res = await fetch(url, options);

  if (res.status === 401) {
    alert("Your session has expired. Please sign in again.");
    signIn("google");
    return null;
  }

  return res;
}
