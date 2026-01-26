import type { Metadata } from "next";
import "./index.css";


export const metadata: Metadata = {
    title: "Food Plan App",
    description: "Your personal food planning assistant",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <div id="root">
                    {children}
                </div>
            </body>
        </html>
    );
}
