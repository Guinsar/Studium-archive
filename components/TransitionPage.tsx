"use client";

import { usePathname } from "next/navigation";

export default function TransitionPage({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-apparition">
      {children}
    </div>
  );
}
