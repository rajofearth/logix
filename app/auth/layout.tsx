import type { ReactNode } from "react";
import "7.css/dist/7.scoped.css";
import "./auth.css";

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
      <div className="win7">
        {children}
      </div>
    </div>
  );
}
