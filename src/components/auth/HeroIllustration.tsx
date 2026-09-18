import React from 'react';
import { Trophy, Target, TrendingUp, Users, Sparkles, Award, Star, Flag, CheckCircle2 } from 'lucide-react';

export const HeroIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg lg:max-w-xl mx-auto select-none font-sans">
      {/* Soft Backdrop Ambient Glows using previously used #8cc540 & warm dark canvas */}
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-[#8cc540]/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-[#8cc540]/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Main Illustration Container */}
      <div className="relative rounded-3xl bg-white border border-[#e4ece0] p-6 sm:p-8 shadow-xl shadow-[#8cc540]/5 overflow-hidden">
        {/* Subtle Background Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#101010 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        ></div>

        {/* Top Badge */}
        <div className="flex items-center justify-between border-b border-[#e4ece0] pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8cc540] animate-pulse"></span>
            <span className="text-xs font-black text-[#101010] uppercase tracking-wider">
              Live Team Velocity
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-[#436320] bg-[#f3f8ef] px-2.5 py-1 rounded-full border border-[#8cc540]/30">
            <Sparkles className="w-3 h-3 text-[#8cc540]" />
            Peak Momentum
          </span>
        </div>

        {/* Vector Mountain Climbing / Teamwork Graphic with previously used #8cc540 / #101010 brand palette */}
        <div className="relative w-full h-64 sm:h-72">
          <svg
            viewBox="0 0 500 320"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Mountain Gradients using #8cc540 & dark brand tones */}
              <linearGradient id="brandMountain1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8cc540" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#74a831" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="brandMountain2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#101010" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#101010" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="trailGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8cc540" />
                <stop offset="50%" stopColor="#101010" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Rising Sun of Achievement */}
            <circle cx="390" cy="80" r="38" fill="url(#sunGrad)" opacity="0.16" filter="url(#glow)" />
            <circle cx="390" cy="80" r="26" fill="url(#sunGrad)" opacity="0.9" />
            <circle cx="390" cy="80" r="16" fill="#ffffff" opacity="0.35" />

            {/* Background Mountain Peak */}
            <path
              d="M160 320L310 130L460 320Z"
              fill="url(#brandMountain2)"
            />

            {/* Foreground Rising Mountain Peak (representing team growth) */}
            <path
              d="M20 320L210 100L390 320Z"
              fill="url(#brandMountain1)"
              stroke="#8cc540"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />

            {/* Ascending Performance Pathway / Trajectory */}
            <path
              d="M50 300 C 120 270, 160 210, 220 190 C 270 170, 310 120, 370 85"
              stroke="url(#trailGrad)"
              strokeWidth="4"
              strokeDasharray="6 6"
              strokeLinecap="round"
            />

            {/* Milestone Checkpoints along the climb */}
            {/* Base Milestone */}
            <circle cx="90" cy="285" r="7" fill="#8cc540" />
            <circle cx="90" cy="285" r="12" stroke="#8cc540" strokeWidth="1.5" opacity="0.4" />

            {/* Mid Milestone */}
            <circle cx="215" cy="192" r="8" fill="#101010" />
            <circle cx="215" cy="192" r="14" stroke="#8cc540" strokeWidth="2" opacity="0.7" />

            {/* Summit Milestone */}
            <circle cx="370" cy="85" r="9" fill="#f59e0b" />
            <circle cx="370" cy="85" r="16" stroke="#f59e0b" strokeWidth="2" opacity="0.5" />

            {/* Summit Flag at the peak */}
            <line x1="370" y1="85" x2="370" y2="45" stroke="#101010" strokeWidth="3" strokeLinecap="round" />
            <path d="M372 46 L406 58 L372 70 Z" fill="#8cc540" stroke="#101010" strokeWidth="1.5" />

            {/* Stylized Climber 1: At base helping team */}
            <g transform="translate(60, 240)">
              <circle cx="20" cy="12" r="7" fill="#101010" />
              <path d="M12 28 C 12 20, 28 20, 28 28 L 26 44 L 14 44 Z" fill="#8cc540" />
              <line x1="26" y1="24" x2="42" y2="20" stroke="#101010" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="14" y1="24" x2="6" y2="34" stroke="#101010" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="16" y1="44" x2="10" y2="58" stroke="#101010" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="24" y1="44" x2="30" y2="58" stroke="#101010" strokeWidth="3.5" strokeLinecap="round" />
            </g>

            {/* Stylized Climber 2: Mid-climb reaching back to help Climber 1 */}
            <g transform="translate(170, 150)">
              <circle cx="22" cy="12" r="7" fill="#101010" />
              <path d="M14 28 C 14 20, 30 20, 30 28 L 28 44 L 16 44 Z" fill="#101010" />
              <line x1="15" y1="24" x2="-2" y2="38" stroke="#101010" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="29" y1="24" x2="42" y2="14" stroke="#101010" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="18" y1="44" x2="12" y2="56" stroke="#101010" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="26" y1="44" x2="34" y2="54" stroke="#101010" strokeWidth="3.5" strokeLinecap="round" />
            </g>

            {/* Stylized Climber 3: Near Summit, pulling teammate up */}
            <g transform="translate(315, 60)">
              <circle cx="22" cy="12" r="7" fill="#101010" />
              <path d="M14 28 C 14 20, 30 20, 30 28 L 28 44 L 16 44 Z" fill="#74a831" />
              <line x1="16" y1="24" x2="0" y2="38" stroke="#101010" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="29" y1="24" x2="46" y2="28" stroke="#101010" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="18" y1="44" x2="14" y2="58" stroke="#101010" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="26" y1="44" x2="34" y2="58" stroke="#101010" strokeWidth="3.5" strokeLinecap="round" />
            </g>

            {/* Sparkle stars around summit */}
            <path d="M430 75 L433 82 L440 85 L433 88 L430 95 L427 88 L420 85 L427 82 Z" fill="#f59e0b" />
            <path d="M360 30 L362 35 L367 37 L362 39 L360 44 L358 39 L353 37 L358 35 Z" fill="#8cc540" />
            <path d="M280 90 L282 94 L286 96 L282 98 L280 102 L278 98 L274 96 L278 94 Z" fill="#101010" />
          </svg>
        </div>

        {/* Bottom Progress Bar */}
        <div className="mt-4 pt-3 border-t border-[#e4ece0] flex items-center justify-between text-xs text-[#666666] font-semibold">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#8cc540]" />
            <span className="text-[#101010] font-bold">Unified Teamwork Ecosystem</span>
          </div>
          <span className="text-[#436320] font-black">100% Performance Transparency</span>
        </div>
      </div>

      {/* Floating Info Cards with previously used colors (#8cc540, #101010, #f3f8ef, #e4ece0) */}
      {/* 1. 150+ Team Members */}
      <div className="absolute -top-4 -left-4 sm:-left-6 bg-white rounded-2xl border border-[#e4ece0] p-3 shadow-lg shadow-[#8cc540]/10 flex items-center gap-3 transition-transform hover:scale-105 duration-300">
        <div className="w-10 h-10 rounded-xl bg-[#f3f8ef] border border-[#8cc540]/30 text-[#436320] flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-[#8cc540]" />
        </div>
        <div>
          <div className="text-sm font-black text-[#101010] leading-tight">150+</div>
          <div className="text-[11px] font-bold text-[#666666]">Team Members</div>
        </div>
      </div>

      {/* 2. 10K+ Goals Achieved */}
      <div className="absolute top-1/4 -right-4 sm:-right-8 bg-white rounded-2xl border border-[#e4ece0] p-3 shadow-lg shadow-[#8cc540]/10 flex items-center gap-3 transition-transform hover:scale-105 duration-300">
        <div className="w-10 h-10 rounded-xl bg-[#101010] text-[#8cc540] flex items-center justify-center shrink-0">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-black text-[#101010] leading-tight">10K+</div>
          <div className="text-[11px] font-bold text-[#666666]">Goals Achieved</div>
        </div>
      </div>

      {/* 3. Recognize Real Talent */}
      <div className="absolute -bottom-4 -left-4 sm:-left-6 bg-white rounded-2xl border border-[#e4ece0] p-3 shadow-lg shadow-[#8cc540]/10 flex items-center gap-3 transition-transform hover:scale-105 duration-300">
        <div className="w-10 h-10 rounded-xl bg-[#fef3c7] border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
          <Award className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <div className="text-sm font-black text-[#101010] leading-tight">Recognize</div>
          <div className="text-[11px] font-bold text-[#666666]">Real Talent</div>
        </div>
      </div>

      {/* 4. Drive Better Results */}
      <div className="absolute -bottom-5 -right-4 sm:-right-6 bg-white rounded-2xl border border-[#e4ece0] p-3 shadow-lg shadow-[#8cc540]/10 flex items-center gap-3 transition-transform hover:scale-105 duration-300">
        <div className="w-10 h-10 rounded-xl bg-[#f3f8ef] border border-[#8cc540]/30 text-[#101010] flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5 text-[#8cc540]" />
        </div>
        <div>
          <div className="text-sm font-black text-[#101010] leading-tight">Drive</div>
          <div className="text-[11px] font-bold text-[#666666]">Better Results</div>
        </div>
      </div>
    </div>
  );
};
