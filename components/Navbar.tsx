"use client";

import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
    <header className="sticky top-0 bg-white backdrop-blur-md z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Desktop Layout */}
        <div className="hidden lg:!grid lg:grid-cols-[1fr_auto_1fr] items-center h-20 gap-8">
          {/* Left Navigation */}
          <nav className="flex gap-6 text-sm text-gray-800">
            <a
              href="#home"
              className="hover:text-black transition-colors whitespace-nowrap"
            >
              Home
            </a>

            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-black transition-colors whitespace-nowrap">
                Flower by Occasions
                <svg
                  className="w-4 h-4 transition-transform group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 -translate-y-2 overflow-hidden">
                <a
                  href="#anniversary"
                  className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100 first:rounded-t-xl"
                >
                  Anniversary
                </a>
                <a
                  href="#birthday"
                  className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100"
                >
                  Birthday
                </a>
                <a
                  href="#graduation"
                  className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100"
                >
                  Graduation
                </a>
                <a
                  href="#wedding"
                  className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100"
                >
                  Wedding
                </a>
                <a
                  href="#valentine"
                  className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100"
                >
                  Valentine&apos;s Series
                </a>
                <a
                  href="#mothers"
                  className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100"
                >
                  Mothers Day
                </a>
                <a
                  href="#sympathy"
                  className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100"
                >
                  Sympathy
                </a>
                <a
                  href="#grand-opening"
                  className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors last:rounded-b-xl"
                >
                  Grand Opening
                </a>
              </div>
            </div>

            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-black transition-colors whitespace-nowrap">
                All Flower Catalogue
                <svg
                  className="w-4 h-4 transition-transform group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 -translate-y-2 overflow-hidden">
                <a
                  href="#bouquets"
                  className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100 first:rounded-t-xl"
                >
                  Hand Bouquets
                </a>
                <a
                  href="#flower-box"
                  className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100"
                >
                  Flower Box
                </a>
                <a
                  href="#standing"
                  className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100"
                >
                  Standing Flowers
                </a>
                <a
                  href="#table"
                  className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors last:rounded-b-xl"
                >
                  Table Flowers
                </a>
              </div>
            </div>
          </nav>

          {/* Center Logo */}
          <div className="flex justify-center">
            <a href="#" className="flex items-center">
              <Image
                src="/assets/logo.png"
                alt="Oursee.co Florist Bouquet"
                width={200}
                height={60}
                className="object-contain h-14 w-auto"
                priority
              />
            </a>
          </div>

          {/* Right Navigation */}
          <nav className="flex gap-6 text-sm text-gray-800 items-center justify-end">
            <a
              href="#style"
              className="hover:text-black transition-colors whitespace-nowrap"
            >
              Style & decor
            </a>
            <a
              href="#event"
              className="hover:text-black transition-colors whitespace-nowrap"
            >
              Our event & activity
            </a>
            <a
              href="#contact"
              className="hover:text-black transition-colors whitespace-nowrap"
            >
              Contact
            </a>
            <a
              href="#order"
              className="px-6 py-2 border border-black text-black rounded-full text-sm hover:bg-black hover:text-white transition-all duration-300"
            >
              Pesan
            </a>
          </nav>
        </div>

        {/* Mobile Layout */}
        <div className="flex lg:!hidden items-center justify-between h-16">
          {/* Mobile Logo */}
          <a href="#" className="flex items-center">
            <Image
              src="/assets/logo.png"
              alt="Logo"
              width={120}
              height={36}
              className="object-contain h-8 w-auto"
              priority
            />
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-gray-700 hover:text-black transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="py-4 space-y-1 border-t">
            <a
              href="#home"
              className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors rounded-lg"
            >
              Home
            </a>

            {/* Mobile Dropdown - Occasions */}
            <div>
              <button
                onClick={() => toggleDropdown("occasions")}
                className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors rounded-lg"
              >
                <span>Flower by Occasions</span>
                <svg
                  className={`w-5 h-5 transition-transform ${openDropdown === "occasions" ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openDropdown === "occasions" ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="pl-8 pr-4 py-2 space-y-1">
                  <a
                    href="#anniversary"
                    className="block py-2 text-sm text-gray-600 hover:text-blue-700"
                  >
                    Anniversary
                  </a>
                  <a
                    href="#birthday"
                    className="block py-2 text-sm text-gray-600 hover:text-blue-700"
                  >
                    Birthday
                  </a>
                  <a
                    href="#graduation"
                    className="block py-2 text-sm text-gray-600 hover:text-blue-700"
                  >
                    Graduation
                  </a>
                  <a
                    href="#wedding"
                    className="block py-2 text-sm text-gray-600 hover:text-blue-700"
                  >
                    Wedding
                  </a>
                  <a
                    href="#valentine"
                    className="block py-2 text-sm text-gray-600 hover:text-blue-700"
                  >
                    Valentine&apos;s Series
                  </a>
                  <a
                    href="#mothers"
                    className="block py-2 text-sm text-gray-600 hover:text-blue-700"
                  >
                    Mothers Day
                  </a>
                  <a
                    href="#sympathy"
                    className="block py-2 text-sm text-gray-600 hover:text-blue-700"
                  >
                    Sympathy
                  </a>
                  <a
                    href="#grand-opening"
                    className="block py-2 text-sm text-gray-600 hover:text-blue-700"
                  >
                    Grand Opening
                  </a>
                </div>
              </div>
            </div>

            {/* Mobile Dropdown - Catalogue */}
            <div>
              <button
                onClick={() => toggleDropdown("catalogue")}
                className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors rounded-lg"
              >
                <span>All Catalogue</span>
                <svg
                  className={`w-5 h-5 transition-transform ${openDropdown === "catalogue" ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openDropdown === "catalogue" ? "max-h-56" : "max-h-0"
                }`}
              >
                <div className="pl-8 pr-4 py-2 space-y-1">
                  <a
                    href="#bouquets"
                    className="block py-2 text-sm text-gray-600 hover:text-blue-700"
                  >
                    Hand Bouquets
                  </a>
                  <a
                    href="#flower-box"
                    className="block py-2 text-sm text-gray-600 hover:text-blue-700"
                  >
                    Flower Box
                  </a>
                  <a
                    href="#standing"
                    className="block py-2 text-sm text-gray-600 hover:text-blue-700"
                  >
                    Standing Flowers
                  </a>
                  <a
                    href="#table"
                    className="block py-2 text-sm text-gray-600 hover:text-blue-700"
                  >
                    Table Flowers
                  </a>
                </div>
              </div>
            </div>

            <a
              href="#style"
              className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors rounded-lg"
            >
              Style & Decor
            </a>
            <a
              href="#event"
              className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors rounded-lg"
            >
              Our Event
            </a>
            <a
              href="#contact"
              className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors rounded-lg"
            >
              Contact
            </a>
            <a
              href="#order"
              className="block mx-4 my-2 px-5 py-3 border-2 border-black text-black rounded-full text-center font-medium hover:bg-black hover:text-white transition-all duration-300"
            >
              Pesan
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
