import Image from "next/image";

export default function Navbar() {
  return (
    <header className="sticky top-0 bg-white/90 backdrop-blur z-50 border-b">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <nav className="hidden md:flex gap-8 text-sm tracking-wide text-gray-800">
          <a href="#home" className="hover:text-black">
            Home
          </a>

          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-black transition-colors">
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
                href="#"
                className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100 first:rounded-t-xl"
              >
                Anniversary
              </a>
              <a
                href="#"
                className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100"
              >
                Birthday
              </a>
              <a
                href="#"
                className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100"
              >
                Graduation
              </a>
              <a
                href="#"
                className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100"
              >
                Wedding
              </a>
              <a
                href="#"
                className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100"
              >
                Valentine&apos;s Series
              </a>
              <a
                href="#"
                className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100"
              >
                Mothers Day
              </a>
              <a
                href="#"
                className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100"
              >
                Sympathy
              </a>
              <a
                href="#"
                className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors last:rounded-b-xl"
              >
                Grand Opening
              </a>
            </div>
          </div>

          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-black transition-colors">
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
                href="#"
                className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100 first:rounded-t-xl"
              >
                Hand Bouquets
              </a>
              <a
                href="#"
                className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100"
              >
                Flower Box
              </a>
              <a
                href="#"
                className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-100"
              >
                Standing Flowers
              </a>
              <a
                href="#"
                className="block px-5 py-3 hover:bg-blue-50 hover:text-blue-700 transition-colors last:rounded-b-xl"
              >
                Table Flowers
              </a>
            </div>
          </div>
        </nav>

        <div className="flex-shrink-0 text-center">
          <a href="#">
            <Image
              src="/assets/logo.png"
              alt="Logo"
              width={200}
              height={200}
              className="mx-auto"
            />
          </a>
        </div>

        <nav className="hidden md:flex gap-8 text-sm tracking-wide text-gray-800 items-center">
          <a href="#style" className="hover:text-black">
            Style & decor
          </a>
          <a href="#event" className="hover:text-black">
            Our event & activity
          </a>
          <a href="#contact" className="hover:text-black">
            Contact
          </a>
          <a
            href="#order"
            className="px-4 py-2 border border-black text-black rounded-full text-sm hover:bg-black hover:text-white transition"
          >
            Pesan
          </a>
        </nav>
      </div>
    </header>
  );
}
