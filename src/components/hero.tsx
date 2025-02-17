import Link from "next/link";
import { TestNotificationButton } from "./test-notification-button";

export function Hero({ isAuthenticated }: { isAuthenticated: boolean }) {
    return (
        <section className="py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
          Welcome to OVHL
        </h1>
        <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-gray-200">
          Experience the thrill of competitive virtual hockey in the most prestigious online
          league
        </p>
        <div className="flex gap-6 justify-center">
          {isAuthenticated ? (
            <TestNotificationButton />
          ) : (
            <Link
              href="/sign-up"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-700 transition"
            >
              Join the League
            </Link>
          )}
          <Link
            href="/about"
            className="card-gradient px-8 py-4 rounded-lg text-lg hover:bg-white/5 transition"
          >
            Learn More
          </Link>
        </div>
      </section>
    )
}