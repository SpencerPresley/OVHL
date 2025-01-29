import Image from "next/image";
import { Images } from "@/constants/images";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { SeasonSignupCard } from "@/components/season-signup-card";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { TestNotificationButton } from "@/components/test-notification-button";

const prisma = new PrismaClient();

/**
 * Home Page Component
 *
 * The main landing page of the OVHL application.
 * Features:
 * - Hero section with call-to-action buttons
 * - Features grid showcasing league benefits
 * - Latest news section
 * - Season signup card for the latest season
 * - CTA section for registration
 * - Responsive footer with navigation and social links
 *
 * @component
 * @returns {Promise<JSX.Element>} Rendered home page
 */
export default async function Home() {
  let isAuthenticated = false;
  let latestSeason = null;

  try {
    // Check authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    
    if (token) {
      try {
        verify(token.value, process.env.JWT_SECRET || "");
        isAuthenticated = true;
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }

    // Get latest season - wrapped in try/catch to handle database errors gracefully
    try {
      latestSeason = await prisma.season.findFirst({
        where: { isLatest: true },
      });
    } catch (error) {
      console.error("Failed to fetch latest season:", error);
    }
  } catch (error) {
    console.error("Error in home page:", error);
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            Welcome to OVHL
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-gray-200">
            Experience the thrill of competitive virtual hockey in the most
            prestigious online league
          </p>
          <div className="flex gap-6 justify-center">
            {isAuthenticated ? (
              <TestNotificationButton />
            ) : (
              <Link href="/sign-up" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-700 transition">
                Join the League
              </Link>
            )}
            <Link href="/about" className="card-gradient px-8 py-4 rounded-lg text-lg hover:bg-white/5 transition">
              Learn More
            </Link>
          </div>
        </section>

        {/* Season Signup Section */}
        {latestSeason && (
          <section className="py-10">
            <SeasonSignupCard
              season={latestSeason}
              isAuthenticated={isAuthenticated}
            />
          </section>
        )}

        {/* Features Grid */}
        <section className="py-20">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Competitive Seasons",
                description:
                  "Participate in structured leagues with regular seasons, playoffs, and championships",
              },
              {
                title: "Player Development",
                description:
                  "Track your progress, improve your skills, and climb the rankings",
              },
              {
                title: "Active Community",
                description:
                  "Join a thriving community of passionate hockey gamers from around the world",
              },
            ].map((feature, i) => (
              <div key={i} className="card-gradient card-hover p-8 rounded-xl">
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Latest News Section */}
        <section className="py-20">
          <h2 className="text-3xl font-bold mb-12 text-center">Latest News</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="card-gradient card-hover rounded-xl overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">
                    Season 12 Registration Open
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Registration for the upcoming season is now open. Secure your
                    spot in the league...
                  </p>
                  <Link href="/news/1" className="text-blue-400 hover:text-blue-300 transition">
                    Read More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="card-gradient rounded-2xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Join the League?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Take your virtual hockey career to the next level. Join OVHL today
              and compete with the best.
            </p>
            <Link href="/sign-up" className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-700 transition">
              Register Now
            </Link>
        </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="card-gradient mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/">
          <Image
                  src={Images.LOGO_MAIN.path}
                  alt="OVHL Footer Logo"
                  width={100}
                  height={50}
                  className="mb-4"
                />
              </Link>
              <p className="text-sm text-gray-300">
                The premier destination for competitive virtual hockey.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <div className="flex flex-col gap-2">
                <Link href="/about" className="text-gray-300 hover:text-white transition">
                  About
                </Link>
                <Link href="/rules" className="text-gray-300 hover:text-white transition">
                  Rules
                </Link>
                <Link href="/schedule" className="text-gray-300 hover:text-white transition">
                  Schedule
                </Link>
                <Link href="/stats" className="text-gray-300 hover:text-white transition">
                  Stats
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Community</h4>
              <div className="flex flex-col gap-2">
                <Link href="/discord" className="text-gray-300 hover:text-white transition">
                  Discord
                </Link>
                <Link href="/forums" className="text-gray-300 hover:text-white transition">
                  Forums
                </Link>
                <Link href="/news" className="text-gray-300 hover:text-white transition">
                  News
                </Link>
                <Link href="/support" className="text-gray-300 hover:text-white transition">
                  Support
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Follow Us</h4>
              <div className="flex flex-col gap-2">
                <Link href="/twitter" className="text-gray-300 hover:text-white transition">
                  Twitter
                </Link>
                <Link href="/youtube" className="text-gray-300 hover:text-white transition">
                  YouTube
                </Link>
                <Link href="/twitch" className="text-gray-300 hover:text-white transition">
                  Twitch
                </Link>
                <Link href="/instagram" className="text-gray-300 hover:text-white transition">
                  Instagram
                </Link>
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
