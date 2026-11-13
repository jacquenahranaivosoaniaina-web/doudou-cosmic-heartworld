import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { readUnlocked } from "@/lib/universe";

/** Returns true once the secret code was entered this session; otherwise sends the visitor home. */
export function useUnlocked(): boolean {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (readUnlocked()) setUnlocked(true);
    else navigate({ to: "/", replace: true });
  }, [navigate]);

  return unlocked;
}
