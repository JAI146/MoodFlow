import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-jetbrains",
});

export const metadata: Metadata = {
    title: "MoodFlow - Study Smarter, Not Harder",
    description: "AI-powered study assistant that adapts to your mood",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
                {children}
                <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
            </body>
        </html>
    );
}
