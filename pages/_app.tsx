import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={inter.className}>
      {/* <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://github.com/steven2801/next-auth"
        className="absolute block text-center left-1/2 -translate-x-1/2 mt-8 text-blue-600 hover:underline active:underline"
      >
        Github
      </a> */}
      <SessionProvider session={pageProps.session}>
        <Toaster />
        <Component {...pageProps} />
      </SessionProvider>
    </main>
  );
}
