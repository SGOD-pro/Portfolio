"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AchievementsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/home/skills");
  }, [router]);

  return null;
}
