import type { Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CircleHelp } from 'lucide-react'
import './globals.css'
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Spotify AI Playlist Creator',
  description: '自然言語からSpotifyプレイリストを作成',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <header className="bg-black flex justify-end items-center p-4 gap-4 h-16">
          <Dialog>
              <DialogTrigger>
                <CircleHelp className="text-white" />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-xl">Spotifyアカウントを連携する</DialogTitle>
                  <DialogDescription className="text-md">
                    Spotifyアカウントを連携すると、Spotify上でいいねした曲も参考にしてプレイリストを作成することができます。
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <SignedOut>
              <div className="bg-green-500 hover:bg-green-600 p-2 rounded-md text-white text-sm font-semibold">
                <SignInButton />
              </div>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}