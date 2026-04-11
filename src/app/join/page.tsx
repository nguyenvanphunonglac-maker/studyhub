"use client";

import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import Login from "@/components/Login";
import JoinSessionForm from "@/components/session/JoinSessionForm";

export default function JoinPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-foreground/20" size={32} />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <JoinSessionForm />
    </div>
  );
}
