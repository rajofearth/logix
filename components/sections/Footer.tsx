"use client";

export function Footer() {
    return (
        <footer className="bg-foreground text-background py-24 px-6 md:px-12">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
                    <div className="md:col-span-2">
                        <h2 className="text-4xl md:text-8xl font-bold tracking-tighter mb-8">
                            Logix.
                        </h2>
                        <p className="max-w-md text-xl opacity-60">
                            The operating system for the physical world. Built for fleets that move fast.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 md:col-span-2">
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold">Platform</h4>
                            <ul className="space-y-2 opacity-60">
                                <li className="hover:opacity-100 cursor-pointer">Fleet Management</li>
                                <li className="hover:opacity-100 cursor-pointer">Inventory AI</li>
                                <li className="hover:opacity-100 cursor-pointer">Crypto Payments</li>
                                <li className="hover:opacity-100 cursor-pointer">API Reference</li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold">Company</h4>
                            <ul className="space-y-2 opacity-60">
                                <li className="hover:opacity-100 cursor-pointer">About</li>
                                <li className="hover:opacity-100 cursor-pointer">Blog</li>
                                <li className="hover:opacity-100 cursor-pointer">Careers</li>
                                <li className="hover:opacity-100 cursor-pointer">Contact</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm opacity-40">
                    <p>© 2026 Logix Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <span>Privacy Policy</span>
                        <span>Terms of Service</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
