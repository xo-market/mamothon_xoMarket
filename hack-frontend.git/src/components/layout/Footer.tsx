import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white py-3 mt-auto border-t ">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="text-center sm:text-left mb-2 sm:mb-0">
            <p className="text-[10px] sm:text-xs text-gray-800">
              © {new Date().getFullYear()} XO-Market. All rights reserved.
            </p>
          </div>
          <nav className="flex space-x-4">
            <Link
              href="/about"
              className="text-[10px] sm:text-xs text-gray-800 hover:text-[var(--primary-hover)] transition-colors"
            >
              About
            </Link>
            <Link
              href="/FAQ"
              className="text-[10px] sm:text-xs text-gray-800 hover:text-[var(--primary-hover)] transition-colors"
            >
              FAQ
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
