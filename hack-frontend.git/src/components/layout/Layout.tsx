import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white text-white">
      {/* <ChristmasEvent /> */}
      <Navbar />
      <main className="flex-grow w-full px-4 lg:px-12 xl:px-24 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
