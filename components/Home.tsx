"use client";

import Image from "next/image";
import Navbar from "@/components/Navbar";

interface HomeProps {
  fadeIn: boolean;
}

export default function Home({ fadeIn }: HomeProps) {
  return (
    <div
      className={`font-jakarta bg-white text-gray-900 transition-opacity duration-700 ${
        fadeIn ? "opacity-100" : "opacity-0"
      }`}
    >
      <Navbar />

      <section className="bg-white pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6 text-center text-black">
          <h1 className="text-3xl md:text-5xl font-serif font-bold leading-snug space-y-1">
            <span className="block">
              TRANSFORMING
              <span className="font-citadel italic text-blue-600 font-normal">
                Floral Dreams
              </span>
            </span>
            <span className="block">INTO LUXURIOUS REALITY</span>
            <span className="block">
              FOR
              <span className="font-citadel italic text-blue-600 font-normal">
                Unforgettable
              </span>
            </span>
            <span className="block">WEDDINGS & EVENTS</span>
          </h1>

          <p className="mt-6 text-base text-gray-600">
            Elegantly curated floral experiences designed to captivate and
            inspire.
          </p>

          <div className="mt-8">
            <a
              href="#produk"
              className="px-6 py-3 bg-blue-700 hover:bg-blue-800 transition text-white font-semibold rounded-full"
            >
              Discover More
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl leading-snug">
              <span className="font-citadel text-gray-700">Elevating</span>
              <span className="font-serif text-blue-600 font-bold"> YOUR</span>
              <br />
              <span className="font-serif text-blue-600 font-bold">
                EVENTS WITH
              </span>
              <br />
              <span className="font-citadel text-gray-700">Bespoke</span>
              <span className="font-serif text-blue-600 font-bold">
                {" "}
                FLORAL
              </span>
              <br />
              <span className="font-serif text-blue-600 font-bold">DESIGN</span>
            </h1>

            <p className="mt-4 text-gray-600">
              Desain bunga artistik yang disesuaikan untuk setiap acara spesial
              Anda.
            </p>

            <div className="mt-6 flex gap-4">
              <a
                href="#produk"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:opacity-80 transition"
              >
                Lihat Koleksi
              </a>
              <a
                href="#order"
                className="px-6 py-3 border border-black text-black rounded-lg font-semibold hover:bg-black hover:text-white transition"
              >
                Pesan
              </a>
            </div>
          </div>
          <Image
            src="/assets/oursee.png"
            alt="Bunga monokrom"
            width={500}
            height={500}
            className="w-[500px] mx-auto"
          />
        </div>
      </section>

      <section id="produk" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-black inline-block tracking-wide">
              New
              <span className="font-citadel italic font-normal text-blue-700">
                Product
              </span>
            </h2>

            <div className="mt-4">
              <a
                href="#all-products"
                className="px-5 py-1.5 border border-blue-700 text-blue-700 text-sm rounded-full hover:bg-blue-700 hover:text-white transition"
              >
                see all
              </a>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <Image
                src="https://images.unsplash.com/photo-1509042239860-f550ce710b93"
                alt="Amora"
                width={300}
                height={288}
                className="w-full h-72 object-cover"
              />
              <h3 className="mt-4 font-semibold text-lg text-gray-900">
                Amora
              </h3>
              <p className="text-gray-600">Rp 1.050.000</p>
              <a
                href="#order"
                className="mt-3 inline-block px-5 py-2 border border-blue-700 text-blue-700 rounded-full hover:bg-blue-700 hover:text-white transition"
              >
                Add to bag
              </a>
            </div>
            <div>
              <Image
                src="https://images.unsplash.com/photo-1522336572468-97b06e8ef143"
                alt="Fairy"
                width={300}
                height={288}
                className="w-full h-72 object-cover"
              />
              <h3 className="mt-4 font-semibold text-lg text-gray-900">
                Fairy
              </h3>
              <p className="text-gray-600">Rp 250.000</p>
              <a
                href="#order"
                className="mt-3 inline-block px-5 py-2 border border-blue-700 text-blue-700 rounded-full hover:bg-blue-700 hover:text-white transition"
              >
                Add to bag
              </a>
            </div>
            <div>
              <Image
                src="https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6"
                alt="Genevieve"
                width={300}
                height={288}
                className="w-full h-72 object-cover"
              />
              <h3 className="mt-4 font-semibold text-lg text-gray-900">
                Genevieve
              </h3>
              <p className="text-gray-600">Rp 760.000</p>
              <a
                href="#order"
                className="mt-3 inline-block px-5 py-2 border border-blue-700 text-blue-700 rounded-full hover:bg-blue-700 hover:text-white transition"
              >
                Add to bag
              </a>
            </div>
            <div>
              <Image
                src="https://images.unsplash.com/photo-1526045478516-99145907023c"
                alt="Standing Bouquet"
                width={300}
                height={288}
                className="w-full h-72 object-cover"
              />
              <h3 className="mt-4 font-semibold text-lg text-gray-900">
                Standing Bouquet – Fresh Flower
              </h3>
              <p className="text-gray-600">Rp 2.550.000</p>
              <a
                href="#order"
                className="mt-3 inline-block px-5 py-2 border border-blue-700 text-blue-700 rounded-full hover:bg-blue-700 hover:text-white transition"
              >
                Add to bag
              </a>
            </div>
          </div>
          <div className="flex justify-center items-center gap-3 mt-12">
            <button className="p-2 text-gray-500 hover:text-blue-700">
              &lt;
            </button>
            <span className="px-3 py-1 border border-blue-700 text-blue-700 rounded-full">
              1
            </span>
            <span className="px-3 py-1 text-gray-500">2</span>
            <span className="px-3 py-1 text-gray-500">3</span>
            <span className="px-3 py-1 text-gray-500">4</span>
            <button className="p-2 text-gray-500 hover:text-blue-700">
              &gt;
            </button>
          </div>
        </div>
      </section>

      <section id="info" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-black text-center mb-16">
            Our
            <span className="font-citadel italic font-normal text-blue-700">
              Location
            </span>
          </h2>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="w-full h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.3123456789!2d112.7500!3d-7.2500!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7f9c123456789%3A0xabcdef123456789!2sKarang%20Empat%20IX%20No.34%2C%20Surabaya!5e0!3m2!1sid!2sid!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-xl"
              />
            </div>

            <div className="bg-white border-2 border-blue-600 rounded-xl p-10 text-center">
              <p className="text-blue-700 text-2xl font-bold leading-relaxed mb-4">
                BUKET BUNGA & SESERAHAN OURSEE.CO
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Karang Empat IX No.34 <br />
                Surabaya, Indonesia
              </p>
              <p className="text-lg">
                <a
                  href="https://wa.me/6285732286669?text=Halo%20Oursee.co,%20saya%20ingin%20memesan%20buket%20bunga."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-800 hover:underline font-medium"
                >
                  0857-3228-6669
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-black text-white py-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm">
            &copy; 2025 Bunga Monokrom. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
