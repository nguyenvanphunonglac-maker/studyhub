"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export default function PageShell({ children, className, containerClassName }: PageShellProps) {
  return (
    <div className={cn("bg-background p-6 sm:p-10 md:p-16 min-h-full relative overflow-hidden", className)}>
      <div className={cn("max-w-6xl mx-auto relative z-10 w-full", containerClassName)}>
        {children}
      </div>
    </div>
  );
}
