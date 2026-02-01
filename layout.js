import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CoVibe - Find Your Perfect Roommate',
  description: 'Match with roommates who share your lifestyle, schedule, and values. More than just a roommate.',
  keywords: ['roommate', 'housing', 'Vancouver', 'Montreal', 'creative', 'lifestyle matching'],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
