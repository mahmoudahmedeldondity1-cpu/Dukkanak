"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/lib/store/cart";
import { formatEGP } from "@/lib/format";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ products: any[]; categories: any[] }>({ products: [], categories: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const cartCount = useCartStore((s) => s.count());
  const { data: session } = useSession();

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions({ products: [], categories: [] });
      return;
    }
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSuggestions(data);
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function goToSearch() {
    if (query.trim()) {
      setShowSuggestions(false);
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <button
          className="md:hidden p-2 -mr-2"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="القائمة"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <Link href="/" className="text-2xl font-extrabold text-brand-600 shrink-0">
          دُكَّانَكْ
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium mr-6">
          <Link href="/" className="hover:text-brand-600">الرئيسية</Link>
          <Link href="/products" className="hover:text-brand-600">جميع المنتجات</Link>
          <Link href="/deals" className="hover:text-brand-600">العروض</Link>
          <Link href="/new" className="hover:text-brand-600">وصل حديثًا</Link>
        </nav>

        <form
          action="/search"
          className="hidden sm:flex flex-1 max-w-md mr-auto relative"
          ref={searchBoxRef as any}
          onSubmit={(e) => {
            e.preventDefault();
            goToSearch();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="ابحث عن منتج..."
            className="input-field"
          />
          {showSuggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
            <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
              {suggestions.categories.length > 0 && (
                <div className="p-2 border-b border-gray-100">
                  <p className="text-xs text-gray-400 px-2 mb-1">التصنيفات</p>
                  {suggestions.categories.map((c) => (
                    <a key={c.slug} href={`/category/${c.slug}`} className="block px-2 py-1.5 text-sm hover:bg-gray-50 rounded">
                      {c.name}
                    </a>
                  ))}
                </div>
              )}
              {suggestions.products.length > 0 && (
                <div className="p-2">
                  <p className="text-xs text-gray-400 px-2 mb-1">المنتجات</p>
                  {suggestions.products.map((p) => (
                    <a key={p.id} href={`/product/${p.slug}`} className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-50 rounded">
                      <span className="flex-1">{p.name}</span>
                      <span className="text-brand-600 font-medium">{formatEGP(p.price)}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>

        <div className="flex items-center gap-3 mr-auto sm:mr-0">
          <Link href="/wishlist" aria-label="المفضلة" className="p-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 21s-7-4.5-9.5-9C.5 8 2 4 6 4c2 0 3.5 1.2 4 2.5C10.5 5.2 12 4 14 4c4 0 5.5 4 3.5 8-2.5 4.5-9.5 9-9.5 9z" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </Link>

          <Link href="/cart" aria-label="السلة" className="relative p-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20 8H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="20" r="1.4" fill="currentColor"/>
              <circle cx="17" cy="20" r="1.4" fill="currentColor"/>
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -left-1 bg-brand-600 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {cartCount}
              </span>
            )}
          </Link>

          {session ? (
            <div className="relative group">
              <button className="p-2" aria-label="الحساب">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M4.5 20c1.5-3.5 4.5-5 7.5-5s6 1.5 7.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
              <div className="absolute left-0 top-full pt-2 hidden group-hover:block">
                <div className="card shadow-lg w-44 py-2 text-sm">
                  <Link href="/account" className="block px-4 py-2 hover:bg-gray-50">حسابي</Link>
                  <Link href="/account/orders" className="block px-4 py-2 hover:bg-gray-50">طلباتي</Link>
                  {(session.user as any)?.role === "ADMIN" && (
                    <Link href="/admin" className="block px-4 py-2 hover:bg-gray-50">لوحة التحكم</Link>
                  )}
                  <button onClick={() => signOut()} className="block w-full text-right px-4 py-2 hover:bg-gray-50 text-red-600">
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login" className="btn-secondary text-sm !px-3 !py-1.5">تسجيل الدخول</Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <nav className="md:hidden border-t border-gray-200 px-4 py-3 flex flex-col gap-3 text-sm font-medium">
          <Link href="/" onClick={() => setMenuOpen(false)}>الرئيسية</Link>
          <Link href="/products" onClick={() => setMenuOpen(false)}>جميع المنتجات</Link>
          <Link href="/deals" onClick={() => setMenuOpen(false)}>العروض</Link>
          <Link href="/new" onClick={() => setMenuOpen(false)}>وصل حديثًا</Link>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) window.location.href = `/search?q=${encodeURIComponent(query)}`;
            }}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="input-field"
            />
          </form>
        </nav>
      )}
    </header>
  );
}
