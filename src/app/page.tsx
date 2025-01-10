import Image from "next/image";
import { Images } from "@/constants/images";
import Link from "next/link";
import { Nav } from "@/components/nav";

/**
 * Home Page Component
 * 
 * The main landing page of the OVHL application.
 * Features:
 * - Hero section with call-to-action buttons
 * - Features grid showcasing league benefits
 * - Latest news section
 * - CTA section for registration
 * - Responsive footer with navigation and social links
 * 
 * @component
 * @returns {JSX.Element} Rendered home page
 */
export default function Home() {
  return (
    <div className="min-h-screen">
      <Nav />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
          Welcome to OVHL
        </h1>
        <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-gray-200">
          Experience the thrill of competitive virtual hockey in the most prestigious online league
        </p>
        <div className="flex gap-6 justify-center">
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-700 transition">
            Join the League
          </button>
          <button className="card-gradient px-8 py-4 rounded-lg text-lg hover:bg-white/5 transition">
            Learn More
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Competitive Seasons",
              description: "Participate in structured leagues with regular seasons, playoffs, and championships"
            },
            {
              title: "Player Development",
              description: "Track your progress, improve your skills, and climb the rankings"
            },
            {
              title: "Active Community",
              description: "Join a thriving community of passionate hockey gamers from around the world"
            }
          ].map((feature, i) => (
            <div key={i} className="card-gradient card-hover p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest News Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold mb-12 text-center">Latest News</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-gradient card-hover rounded-xl overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Season 12 Registration Open</h3>
                <p className="text-gray-300 mb-4">
                  Registration for the upcoming season is now open. Secure your spot in the league...
                </p>
                <button className="text-blue-400 hover:text-blue-300 transition">
                  Read More →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="card-gradient rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Join the League?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Take your virtual hockey career to the next level. Join OVHL today and compete with the best.
          </p>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-700 transition">
            Register Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="card-gradient mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Image
                src={Images.LOGO_MAIN.path}
                alt="OVHL Footer Logo"
                width={100}
                height={50}
                className="mb-4"
              />
              <p className="text-sm text-gray-300">
                The premier destination for competitive virtual hockey.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-gray-300 hover:text-white transition">About</a>
                <a href="#" className="text-gray-300 hover:text-white transition">Rules</a>
                <a href="#" className="text-gray-300 hover:text-white transition">Schedule</a>
                <a href="#" className="text-gray-300 hover:text-white transition">Stats</a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Community</h4>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-gray-300 hover:text-white transition">Discord</a>
                <a href="#" className="text-gray-300 hover:text-white transition">Forums</a>
                <a href="#" className="text-gray-300 hover:text-white transition">News</a>
                <a href="#" className="text-gray-300 hover:text-white transition">Support</a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Follow Us</h4>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-gray-300 hover:text-white transition">Twitter</a>
                <a href="#" className="text-gray-300 hover:text-white transition">YouTube</a>
                <a href="#" className="text-gray-300 hover:text-white transition">Twitch</a>
                <a href="#" className="text-gray-300 hover:text-white transition">Instagram</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-gray-400">
            © 2024 Online Virtual Hockey League. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
