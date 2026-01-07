import type { ReactNode } from "react";

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {children}
    </div>
  );
}
