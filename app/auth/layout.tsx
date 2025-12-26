import type { ReactNode } from "react";

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="min-h-screen flex items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
}


