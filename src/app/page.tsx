"use client";

import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const Login = dynamic(() => import("@/components/auth/Login"));
const Dashboard = dynamic(() => import("@/components/layout/Dashboard"), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin text-foreground/20" size={32} />
    </div>
  ),
});

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background transition-colors duration-300">
        <Loader2 className="animate-spin text-foreground/20" size={32} />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <Dashboard />;
}
