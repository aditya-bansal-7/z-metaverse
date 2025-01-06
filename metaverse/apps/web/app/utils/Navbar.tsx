"use client";
import React, { useState } from "react";
import { User } from "../types";
import Link from "next/link";

const Navbar = ({ user }: { user: User | null }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav
      style={{ cursor: 'auto' }}
      className="glass-nav fixed left-0 right-0 top-0 z-10 mx-auto max-w-6xl border-[1px] border-white/10 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur md:left-6 md:right-6 md:top-6 md:rounded-2xl">
      <div className="glass-nav flex items-center justify-between px-5 py-5">
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/about"
            className="group relative scale-100 overflow-hidden rounded-lg px-4 py-2 transition-transform hover:scale-105 active:scale-95">
            <span className="relative z-10 text-white/90 transition-colors group-hover:text-white">
              About
            </span>
            <span className="absolute inset-0 z-0 bg-gradient-to-br from-white/20 to-white/5 opacity-0 transition-opacity group-hover:opacity-100"></span>
          </Link>
          <Link
            href="/explore"
            className="group relative scale-100 overflow-hidden rounded-lg px-4 py-2 transition-transform hover:scale-105 active:scale-95">
            <span className="relative z-10 text-white/90 transition-colors group-hover:text-white">
              Explore
            </span>
            <span className="absolute inset-0 z-0 bg-gradient-to-br from-white/20 to-white/5 opacity-0 transition-opacity group-hover:opacity-100"></span>
          </Link>
          <Link
            href="/pricing"
            className="group relative scale-100 overflow-hidden rounded-lg px-4 py-2 transition-transform hover:scale-105 active:scale-95">
            <span className="relative z-10 text-white/90 transition-colors group-hover:text-white">
              Pricing
            </span>
            <span className="absolute inset-0 z-0 bg-gradient-to-br from-white/20 to-white/5 opacity-0 transition-opacity group-hover:opacity-100"></span>
          </Link>
        </div>
        <span className="pointer-events-none relative left-0 top-[50%] z-10 text-4xl font-black text-white mix-blend-overlay md:absolute md:left-[50%] md:-translate-x-[20%] md:-translate-y-[50%]">
          <img src="https://i.ibb.co/Vp6n0N5/Metaverse-2-removebg-preview.png" alt="ZMetaverse" className="w-1/2 h-1/2" />
        </span>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-white/90 transition-colors hover:text-white">
                {/* <img
                  src={`/avatars/${user.avatarId}`}
                  alt="User Avatar"
                  className="h-8 w-8 rounded-full"
                /> */}
                <span>{user.username}</span>
                <svg
                  className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen && (
                <div onMouseLeave={() => setDropdownOpen(false)} className="absolute overflow-hidden right-0 mt-2 w-48 rounded-lg border-[1px] border-white/10 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-white hover:bg-gradient-to-br from-white/20 to-white/5  hover:scale-105">
                    Profile
                  </Link>
                  
                  <Link href="/settings" className="block px-4 py-2 text-sm text-white hover:bg-gradient-to-br from-white/20 to-white/5 hover:scale-105">
                    Settings
                  </Link>
                  <Link href="/logout" className="block px-4 py-2 text-sm text-white  hover:bg-gradient-to-br from-white/20 to-white/5 hover:scale-105">
                    Logout
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/accounts/signin" className="group relative scale-100 overflow-hidden rounded-lg px-4 py-2 transition-transform hover:scale-105 active:scale-95">
                <span className="relative z-10 text-white/90 transition-colors group-hover:text-white">
                  Sign in
                </span>
                <span className="absolute inset-0 z-0 bg-gradient-to-br from-white/20 to-white/5 opacity-0 transition-opacity group-hover:opacity-100"></span>
              </Link>
              <Link href="/accounts/signin" className="relative scale-100 overflow-hidden rounded-lg bg-gradient-to-br from-[#8447FC] from-40% to-indigo-400 px-4 py-2 font-medium text-white transition-transform hover:scale-105 active:scale-95">
                Sign Up
              </Link>
            </>
          )}
          <button className="ml-2 block scale-100 text-3xl text-white/90 transition-all hover:scale-105 hover:text-white active:scale-95 md:hidden">
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
