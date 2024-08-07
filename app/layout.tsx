import { ThemeProvider } from "@/providers/theme.provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Plura",
    description: "All in one Agenry Solutiion",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                <body className={inter.className}>{children}</body>
            </ThemeProvider>
        </html>
    );
}
