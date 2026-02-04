import { ReactNode } from "react";
import Background3D from "./Background3D";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-black overflow-x-hidden relative">
      <Background3D />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
