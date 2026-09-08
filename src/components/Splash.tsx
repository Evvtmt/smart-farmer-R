/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sprout, Shield, Activity, Wheat, ChevronLeft } from "lucide-react";

interface SplashProps {
  onEnter: () => void;
}

export default function Splash({ onEnter }: SplashProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#064E3B] via-[#022c21] to-[#01140f] flex flex-col justify-between p-6 relative overflow-hidden" dir="rtl">
      {/* Background glowing items */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#059669]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#F59E0B]/5 rounded-full blur-3xl" />

      {/* Header section with Egyptian Shield emblem */}
      <div className="flex justify-between items-center w-full max-w-5xl mx-auto z-10 pt-4">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-[#F59E0B] to-[#D97706] p-1.5 rounded-lg shadow-inner">
            <div className="w-8 h-8 rounded bg-white flex items-center justify-center font-bold text-[#064E3B] text-sm">
              مِصر
            </div>
          </div>
          <span className="text-white/80 font-bold text-xs tracking-wider">المنصة الوطنية للتحول الرقمي الزراعي</span>
        </div>
        
        <div className="text-white/50 text-[10px] bg-white/5 px-2.5 py-1 rounded-full border border-white/10 uppercase">
          v2.60 (جمهورية مصر العربية)
        </div>
      </div>

      {/* Main Core branding card */}
      <div className="my-auto text-center max-w-2xl mx-auto z-10 px-4 flex flex-col items-center">
        {/* Animated growing wheat emblem */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-[#059669]/30 rounded-full filter blur-xl scale-125 animate-pulse" />
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#059669] to-[#047857] flex items-center justify-center border-2 border-[#F59E0B] relative shadow-lg shadow-black/40">
            <Wheat className="w-12 h-12 text-[#F59E0B]" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#F0F4F0] tracking-tight leading-tight mb-2 drop-shadow-md">
          منصة المزارع الذكي
        </h1>
        <h2 className="text-[#F59E0B] text-lg font-medium tracking-widest uppercase mb-6">
          Smart Farmer Super Platform
        </h2>

        <p className="text-white/80 font-normal leading-relaxed text-sm md:text-base mb-8 max-w-xl">
          أول منظومة برمجية وطنية شاملة مدعومة بالذكاء الاصطناعي وإنترنت الأشياء والاستشعار عن بعد لدعم الفلاح والمهندس والشركات الزراعية المصرية وتنمية رقعتنا الخضراء بدقة متناهية.
        </p>

        {/* Dynamic National highlights grid */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-lg mb-10 text-right">
          <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col justify-between">
            <Activity className="w-5 h-5 text-[#F59E0B] mb-1" />
            <div>
              <div className="text-white text-xs font-bold">٢٤ محافظة</div>
              <p className="text-[10px] text-white/60">ربط وتكامل فوري للمحافظات ومناسيب النهر</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col justify-between">
            <Sprout className="w-5 h-5 text-[#059669] mb-1" />
            <div>
              <div className="text-white text-xs font-bold">رصد ٣ مليون فدان</div>
              <p className="text-[10px] text-white/60">تحليل NDVI وتخصيص محاصيل ذكي</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col justify-between">
            <Shield className="w-5 h-5 text-emerald-400 mb-1" />
            <div>
              <div className="text-white text-xs font-bold">أمن غذائي قومي</div>
              <p className="text-[10px] text-white/60">ذكاء اصطناعي وتتبع مخازن ومياه</p>
            </div>
          </div>
        </div>

        {/* Enter Button with subtle pulse */}
        <button
          onClick={onEnter}
          className="group px-8 py-4 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-3 cursor-pointer text-base"
        >
          <span>دخول المنصة الوطنية</span>
          <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
        </button>
      </div>

      {/* Footer attribution matching vision */}
      <div className="text-center text-white/40 text-[11px] border-t border-white/5 pt-4 w-full max-w-5xl mx-auto z-10 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div>
          تخطيط، تصميم وتطوير المهندس الزراعي الرقمي <span className="text-[#F59E0B] font-semibold">إبراهيم</span> © ٢٠٢٦
        </div>
        <div className="flex gap-4">
          <span>الجمهورية الجديدة</span>
          <span>•</span>
          <span>وزارة الزراعة واستصلاح الأراضي - مصر</span>
        </div>
      </div>
    </div>
  );
}
