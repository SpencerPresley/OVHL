import Link from 'next/link';
import Image from 'next/image';
import { Images } from '@/constants/images';

export function Footer() {
  return (
    <>
      <footer className="card-gradient mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/">
                <Image
                  src={Images.LOGO_MAIN.path}
                  alt="OVHL Footer Logo"
                  width={100}
                  height={50}
                  className="mb-4"
                />
              </Link>
              <p className="text-sm text-gray-300">
                The premier destination for competitive virtual hockey.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <div className="flex flex-col gap-2">
                <Link href="/about" className="text-gray-300 hover:text-white transition">
                  About
                </Link>
                <Link href="/rules" className="text-gray-300 hover:text-white transition">
                  Rules
                </Link>
                <Link href="/schedule" className="text-gray-300 hover:text-white transition">
                  Schedule
                </Link>
                <Link href="/stats" className="text-gray-300 hover:text-white transition">
                  Stats
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Community</h4>
              <div className="flex flex-col gap-2">
                <Link href="/discord" className="text-gray-300 hover:text-white transition">
                  Discord
                </Link>
                <Link href="/forums" className="text-gray-300 hover:text-white transition">
                  Forums
                </Link>
                <Link href="/news" className="text-gray-300 hover:text-white transition">
                  News
                </Link>
                <Link href="/support" className="text-gray-300 hover:text-white transition">
                  Support
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Follow Us</h4>
              <div className="flex flex-col gap-2">
                <Link href="/twitter" className="text-gray-300 hover:text-white transition">
                  Twitter
                </Link>
                <Link href="/youtube" className="text-gray-300 hover:text-white transition">
                  YouTube
                </Link>
                <Link href="/twitch" className="text-gray-300 hover:text-white transition">
                  Twitch
                </Link>
                <Link href="/instagram" className="text-gray-300 hover:text-white transition">
                  Instagram
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-gray-400">
            © 2024 Online Virtual Hockey League. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
