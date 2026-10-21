"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AudioLines,
  BookOpen,
  ChevronDown,
  Globe2,
  Menu,
  ShieldQuestion,
  Sparkles,
  WifiOff,
  X,
} from "lucide-react";
import { useGame } from "@/stores/game-store";
import type { Language } from "@/lib/i18n";
export function Shell({ children }: { children: React.ReactNode }) {
  const store = useGame();
  const path = usePathname();
  const [offline, setOffline] = useState(false),
    [menu, setMenu] = useState(false);
  useEffect(() => {
    void useGame.getState().hydrate();
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production")
      void navigator.serviceWorker.register("/sw.js");
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  useEffect(() => {
    document.documentElement.lang =
      store.language === "roman" ? "ne-Latn" : store.language;
  }, [store.language]);
  return (
    <>
      <header className="site-header">
        <Link href="/" className="brand" aria-label="Khoj home">
          <span className="brand-mark">
            <ShieldQuestion size={24} />
          </span>
          {process.env.NEXT_PUBLIC_APP_NAME || "KHOJ"}
          <span className="brand-dot">.</span>
        </Link>
        <nav
          className={menu ? "main-nav open" : "main-nav"}
          aria-label="Main navigation"
        >
          <Link
            className={path === "/" ? "active" : ""}
            href="/"
            onClick={() => setMenu(false)}
          >
            Play
          </Link>
          <Link
            className={path === "/rules" ? "active" : ""}
            href="/rules"
            onClick={() => setMenu(false)}
          >
            How to play
          </Link>
          <Link
            className={path === "/library" ? "active" : ""}
            href="/library"
            onClick={() => setMenu(false)}
          >
            Word library
          </Link>
          <Link href="/custom" onClick={() => setMenu(false)}>
            Your packs <Sparkles size={13} />
          </Link>
        </nav>
        <div className="header-actions">
          <label className="language-select">
            <Globe2 size={16} />
            <span className="sr-only">Interface language</span>
            <select
              aria-label="Interface language"
              value={store.language}
              onChange={(e) =>
                store.set({ language: e.target.value as Language })
              }
            >
              <option value="roman">Roman Nepali</option>
              <option value="ne">नेपाली</option>
              <option value="en">English</option>
            </select>
            <ChevronDown size={12} />
          </label>
          <Link
            className="icon-button sound"
            href="/settings"
            aria-label="Settings"
          >
            <AudioLines size={18} />
          </Link>
          <button
            className="icon-button menu-toggle"
            aria-label="Toggle navigation"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {offline && (
        <div className="offline-banner" role="status">
          <WifiOff size={16} /> You’re offline. Pass-the-phone still works.
          Online rooms need a connection.
        </div>
      )}
      <main>{children}</main>
      <footer>
        <Link className="brand footer-brand" href="/">
          KHOJ<span className="brand-dot">.</span>
        </Link>
        <span className="footer-message" lang="ne">
          फेरि एक राउन्ड?
        </span>
        <Link href="/rules">
          <BookOpen size={14} /> Rules & fair play
        </Link>
        <div className="footer-credit">
          <a
            href="https://www.instagram.com/bimalbhandari_/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Designed and developed by <span>Bimal Bhandari</span>
          </a>
        </div>
      </footer>
    </>
  );
}
