import Link from "next/link";

export function HomeCTA() {
    return (
        <section className="py-20">
            <div className="card-gradient rounded-2xl p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join the League?</h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Take your virtual hockey career to the next level. Join OVHL today and compete with
                the best.
                </p>
                <Link
                href="/sign-up"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg hover:bg-blue-700 transition"
                >
                Register Now
                </Link>
            </div>
        </section>
    )
}