"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteNav() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="p-4 flex items-center gap-4">
      <Link
        className={`text-2xl font-bold ${
          isActive("/") ? "border-b-2 border-blue-500" : ""
        }`}
        href="/"
      >
        Home
      </Link>
      <Link
        className={`text-2xl font-bold ${
          isActive("/geometry") ? "border-b-2 border-blue-500" : ""
        }`}
        href="/geometry"
      >
        Geometry Dash
      </Link>
      <Link
        className={`text-2xl font-bold ${
          isActive("/lala") ? "border-b-2 border-blue-500" : ""
        }`}
        href="/lala"
      >
        Lala
      </Link>
      <Link
        className={`text-2xl font-bold ${
          isActive("/undertale") ? "border-b-2 border-blue-500" : ""
        }`}
        href="/undertale"
      >
        Undertale
      </Link>
      <Link
        className={`text-2xl font-bold ${
          isActive("/mario") ? "border-b-2 border-blue-500" : ""
        }`}
        href="/mario (not working)"
      >
        Mario (not working)
      </Link>
      <Link
        className={`text-2xl font-bold ${
          isActive("/clicker-game") ? "border-b-2 border-blue-500" : ""
        }`}
        href="/clicker-game"
      >
    </nav>
  );
}
