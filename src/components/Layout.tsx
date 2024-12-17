// components/Layout.tsx
import { ReactNode } from "react";
import dynamic from "next/dynamic";

const Sidebar = dynamic(() => import("./Sidebar"), {
  ssr: false,
});

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="wrapper">
      <Sidebar />
      <div className="content-wrapper">
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
