import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return <div className="bg-white overflow-x-hidden min-h-screen flex flex-col w-full">{children}</div>;
}
