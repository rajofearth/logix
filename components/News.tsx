import Image from "next/image";

export function News() {
    const newsItems = [
        {
            image: "/news-van.png",
            title: "Integration with SAP is now complete and fully operational.",
            description: "Users can now integrate Logix with SAP for comprehensive financial and...",
            date: "Dec 24",
        },
        {
            image: "/news-ev.png",
            title: "Logix supports electric vehicles and fleet tools.",
            description: "We've added tools for managing EV fleets, including battery level monito...",
            date: "Dec 17",
        },
        {
            image: "/news-truck.png",
            title: "Big data technology: The future of fleet optimization.",
            description: "Real-time data analysis unlocks new opportunities for cost reduction and...",
            date: "Dec 14",
        },
    ];

    return (
        <section className="bg-white py-24 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        News and updates.
                    </h2>
                    <p className="text-black/60 mx-auto max-w-lg">
                        Stay up-to-date with the latest developments and innovations in fleet management.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {newsItems.map((item, index) => (
                        <div key={index} className="flex flex-col group cursor-pointer">
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl mb-6">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <h3 className="text-xl font-bold leading-tight mb-3 group-hover:text-black/70 transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-black/40 text-sm mb-6 flex-grow">
                                {item.description}
                            </p>
                            <div className="text-black/20 text-xs font-bold uppercase tracking-wider">
                                {item.date}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-center gap-4">
                    <button className="bg-black text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-black/80 transition-colors">
                        Subscribe
                    </button>
                    <button className="bg-gray-100 text-black px-8 py-3 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors">
                        Show All
                    </button>
                </div>
            </div>
        </section>
    );
}
