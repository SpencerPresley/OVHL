export function FeaturesGrid() {
    return (
        <section className="py-20">
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    {
                    title: 'Competitive Seasons',
                    description:
                        'Participate in structured leagues with regular seasons, playoffs, and championships',
                    },
                    {
                    title: 'Player Development',
                    description: 'Track your progress, improve your skills, and climb the rankings',
                    },
                    {
                    title: 'Active Community',
                    description:
                        'Join a thriving community of passionate hockey gamers from around the world',
                    },
                ].map((feature, i) => (
                    <div key={i} className="card-gradient card-hover p-8 rounded-xl">
                        <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                        <p className="text-gray-300">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}