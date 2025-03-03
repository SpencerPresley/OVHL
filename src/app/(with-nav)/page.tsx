import { Hero } from '@/components/hero';
import { FeaturesGrid } from '@/components/features_grid';
import { HomeCTA } from '@/components/home_cta';
import { Footer } from '@/components/footer';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { News } from '@/components/news';
import { SeasonSignupCard } from '@/components/season-signup-card';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

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
    const token = cookieStore.get('token');

    if (token) {
      try {
        verify(token.value, process.env.JWT_SECRET || '');
        isAuthenticated = true;
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }

    // Get latest season - wrapped in try/catch to handle database errors gracefully
    try {
      latestSeason = await prisma.season.findFirst({
        where: { isLatest: true },
      });
    } catch (error) {
      console.error('Failed to fetch latest season:', error);
    }
  } catch (error) {
    console.error('Error in home page:', error);
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <Hero isAuthenticated={isAuthenticated} />

        {/* Season Signup Section */}
        {latestSeason && (
          <section className="py-10">
            <SeasonSignupCard season={latestSeason} isAuthenticated={isAuthenticated} />
          </section>
        )}

        {/* Features Grid */}
        <FeaturesGrid />

        {/* Latest News Section */}
        <News />

        {/* CTA Section */}
        <HomeCTA />
      </main>

      <Footer />
    </div>
  );
}
