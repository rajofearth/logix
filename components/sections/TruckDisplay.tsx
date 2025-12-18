import Image from "next/image";

export function TruckDisplay() {
    return (
        <div className="w-full px-4 md:px-8 pb-10">
            <div className="relative aspect-[16/9] w-full max-w-7xl mx-auto overflow-hidden rounded-2xl shadow-2xl">
                <Image
                    src="/images/truck-hero.png"
                    alt="Logix Fleet Management Truck"
                    fill
                    className="object-cover"
                    priority
                />
            </div>
        </div>
    );
}
