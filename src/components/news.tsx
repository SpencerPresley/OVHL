import Link from 'next/link';

export function News() {
  return (
    <>
      <section className="py-20">
        <h2 className="text-3xl font-bold mb-12 text-center">Latest News</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-gradient card-hover rounded-xl overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Season 12 Registration Open</h3>
                <p className="text-gray-300 mb-4">
                  Registration for the upcoming season is now open. Secure your spot in the
                  league...
                </p>
                <Link href="/news/1" className="text-blue-400 hover:text-blue-300 transition">
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
