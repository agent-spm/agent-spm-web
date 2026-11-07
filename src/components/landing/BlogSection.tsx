"use client";

import React from "react";
import Link from "next/link";

interface BlogPost {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  skillsCount: string;
}

export const BlogSection = () => {
  const posts: BlogPost[] = [
    {
      title: "Hidden Gems: Part 4",
      excerpt:
        "Check out recent announcement, the agent skills decoded series, and other in-depth posts about skills package manager behind the curtains.",
      author: "Rahul Sahani",
      date: "June 26, 2026",
      skillsCount: "10,000",
    },
    {
      title: "MCP Runtime Bridges & Tool Calling",
      excerpt:
        "Deep dive into how Agent SPM dynamically registers Model Context Protocol endpoints for Claude and Cursor agents with zero-latency overhead.",
      author: "Rahul Sahani",
      date: "May 14, 2026",
      skillsCount: "10,000",
    },
    {
      title: "Self-Healing Agent Memory & Workspaces",
      excerpt:
        "How scoped package manifests isolate credentials, environment variables, and execution traces across complex multi-agent swarms.",
      author: "Rahul Sahani",
      date: "April 02, 2026",
      skillsCount: "10,000",
    },
  ];

  return (
    <section id="blog" className="w-full bg-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-black/5">
      <div className="max-w-[1022px] mx-auto flex flex-col">
        {/* Header Row (Figma Group 44 + Rectangle 283) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <h2
              className="font-instrument-serif text-4xl sm:text-5xl lg:text-[56px] text-black font-normal italic tracking-tight mb-3 select-none"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              The Latest from Agent SPM
            </h2>
            <p className="font-sans text-base sm:text-lg text-black/60 font-medium leading-relaxed max-w-[540px]">
              Check out recent announcement, the agent skills decoded series,
              and other in-depth posts about skills package manager behind the
              curtains.
            </p>
          </div>

          <Link
            href="/docs"
            className="self-start md:self-auto inline-flex items-center justify-center min-h-[44px] sm:min-h-[36px] h-auto sm:h-[36px] px-4 rounded-[4px] bg-black text-white font-sans text-sm font-medium hover:bg-neutral-800 transition-all shadow-sm active:scale-98 flex-shrink-0"
          >
            <span>View Blog</span>
            <span className="ml-1.5 font-mono text-xs">→</span>
          </Link>
        </div>

        {/* 3 Real Native Blog Cards (330x330 in Figma Frame 27) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {posts.map((post, idx) => (
            <Link
              key={idx}
              href="/docs"
              className="group bg-[#F7F7F7] rounded-[8px] border border-black/5 p-6 flex flex-col justify-between min-h-[330px] transition-all duration-300 hover:shadow-xl hover:border-black/10 hover:-translate-y-1 select-none"
            >
              <div>
                {/* Top Badge: 10,000 Skills from Figma Group 45 */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-black/5">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xl font-bold text-black tracking-tight">
                      {post.skillsCount}
                    </span>
                    <span className="font-sans text-xs uppercase tracking-wider text-black/50 font-medium">
                      Skills
                    </span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#1A5FED]" />
                </div>

                {/* Title (Instrument Serif 18px-22px italic) */}
                <h3
                  className="font-instrument-serif text-2xl text-black font-normal italic tracking-tight mb-3 group-hover:text-[#1A5FED] transition-colors"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                >
                  {post.title}
                </h3>

                {/* Excerpt (Inter 12px-13px 500) */}
                <p className="font-sans text-xs sm:text-[13px] text-neutral-600 font-normal leading-relaxed line-clamp-4">
                  {post.excerpt}
                </p>
              </div>

              {/* Author & Date Footer */}
              <div className="pt-4 mt-4 border-t border-black/5 flex items-center justify-between font-sans text-xs text-black/55">
                <span className="font-medium text-black/80">{post.author}</span>
                <span className="text-[11px] font-mono text-neutral-400">{post.date}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
