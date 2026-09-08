/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  MapPin, 
  Satellite, 
  Layers, 
  Compass, 
  Eye, 
  Activity, 
  Thermometer, 
  Droplets,
  Zap,
  Sliders,
  Maximize2,
  Sparkles,
  FlaskConical,
  Check,
  Info,
  AlertTriangle,
  Flame,
  Leaf
} from "lucide-react";
import { SoilSensorData } from "../types";
import { initialSoilData } from "../data";

export type MapLayer = "standard" | "satellite" | "ndvi" | "npk";
export type NutrientType = "all" | "nitrogen" | "phosphorus" | "potassium";

export interface InteractiveMapProps {
  governorate: string;
  farmSize: number;
  soilData?: SoilSensorData[];
  currentFarmId?: string;
  activeSoil?: SoilSensorData;
  initialLayer?: MapLayer;
}

export default function InteractiveMap({ 
  governorate, 
  farmSize,
  soilData = initialSoilData,
  currentFarmId,
  activeSoil,
  initialLayer = "ndvi"
}: InteractiveMapProps) {
  // Layers active toggles
  const [showSensors, setShowSensors] = useState(true);
  const [showMachinery, setShowMachinery] = useState(true);
  const [showProblemZones, setShowProblemZones] = useState(true);
  const [showWaterLines, setShowWaterLines] = useState(true);
  const [showContourLines, setShowContourLines] = useState(true);
  const [showProbeBadges, setShowProbeBadges] = useState(true);
  
  // Satellite, NDVI, and NPK Heatmap settings
  const [activeLayer, setActiveLayer] = useState<MapLayer>(initialLayer);
  const [selectedNutrient, setSelectedNutrient] = useState<NutrientType>("all");
  const [heatmapOpacity, setHeatmapOpacity] = useState(78); // 20 to 100 opacity
  const [ndviSliderVal, setNdviSliderVal] = useState(82); // 0 to 100 density slider
  const [selectedSectorId, setSelectedSectorId] = useState<string>("s2");
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Retrieve effective baseline soil data for the active farm
  const effectiveSoil: SoilSensorData = activeSoil || 
    soilData.find(s => s.farmId === currentFarmId) || 
    soilData[0] || 
    initialSoilData[0];

  const baseN = effectiveSoil.nitrogen || 145;
  const baseP = effectiveSoil.phosphorus || 42;
  const baseK = effectiveSoil.potassium || 280;
  const basePH = effectiveSoil.ph || 6.8;
  const baseMoisture = effectiveSoil.moisture || 72;

  // Derive sector-specific spatial soil variations across the 5 agricultural zones
  const sectors = [
    { 
      id: "s1", 
      name: "القطاع أ-1 (طماطم)", 
      crop: "طماطم بلدي",
      cx: 160, 
      cy: 200,
      d: "M 50,110 L 280,110 L 220,290 L 50,290 Z",
      dichte: 85, 
      color: "fill-emerald-800", 
      stroke: "stroke-emerald-600", 
      note: "صحة مثالية - ري ممتاز بالتنقيط",
      n: Math.round(baseN * 0.98),
      p: Math.round(baseP * 1.05),
      k: Math.round(baseK * 1.02),
      ph: +(basePH).toFixed(1),
      moisture: Math.min(95, Math.round(baseMoisture * 1.02))
    },
    { 
      id: "s2", 
      name: "القطاع أ-2 (قمح مميز)", 
      crop: "قمح سدس 14",
      cx: 390, 
      cy: 200,
      d: "M 290,110 L 550,110 L 490,290 L 230,290 Z",
      dichte: 94, 
      color: "fill-emerald-900/90", 
      stroke: "stroke-emerald-500", 
      note: "طرد السنابل - تتبع نتروجين نشط ومثالي",
      n: Math.round(baseN * 1.06),
      p: Math.round(baseP * 0.96),
      k: Math.round(baseK * 0.98),
      ph: +(basePH + 0.1).toFixed(1),
      moisture: Math.min(95, Math.round(baseMoisture * 0.98))
    },
    { 
      id: "s3", 
      name: "القطاع ب-1 (بطاطس سبونتا)", 
      crop: "بطاطس سبونتا",
      cx: 620, 
      cy: 200,
      d: "M 560,110 L 740,110 L 710,290 L 500,290 Z",
      dichte: 70, 
      color: "fill-green-700/80", 
      stroke: "stroke-emerald-400", 
      note: "إنضاد الدرنات - مستوى بوتاسيوم معتدل",
      n: Math.round(baseN * 0.82),
      p: Math.round(baseP * 0.85),
      k: Math.round(baseK * 0.88),
      ph: +(basePH + 0.3).toFixed(1),
      moisture: Math.max(30, Math.round(baseMoisture * 0.92))
    },
    { 
      id: "s4", 
      name: "القطاع ب-2 (منطقة جافة مؤقتاً)", 
      crop: "أرض مجهزة للبرسيم",
      cx: 210, 
      cy: 400,
      d: "M 50,300 L 440,300 L 410,480 L 50,480 Z",
      dichte: 35, 
      color: "fill-amber-600/40", 
      stroke: "stroke-amber-500", 
      note: "تنبيه: رطوبة منخفضة ونقص بالآزوت والفوسفور",
      n: Math.round(baseN * 0.62),
      p: Math.round(baseP * 0.60),
      k: Math.round(baseK * 0.65),
      ph: +(basePH + 0.5).toFixed(1),
      moisture: Math.max(25, Math.round(baseMoisture * 0.65))
    },
    { 
      id: "s5", 
      name: "القطاع ج-3 (بقعة إصابة مجهدة)", 
      crop: "مشتل نباتي مجهد",
      cx: 580, 
      cy: 400,
      d: "M 450,300 L 710,300 L 680,480 L 420,480 Z",
      dichte: 18, 
      color: "fill-red-600/30", 
      stroke: "stroke-red-600 animate-pulse", 
      note: "إنذار: فقر غذائي مركب NPK يستدعي التسميد العاجل",
      n: Math.round(baseN * 0.48),
      p: Math.round(baseP * 0.50),
      k: Math.round(baseK * 0.52),
      ph: +(basePH - 0.4).toFixed(1),
      moisture: Math.max(20, Math.round(baseMoisture * 0.55))
    },
  ];

  const activeSector = sectors.find(s => s.id === selectedSectorId) || sectors[1];

  // Nutrient status evaluator matching Egyptian agricultural benchmarks
  const getNutrientEvaluation = (nutrient: "nitrogen" | "phosphorus" | "potassium", value: number) => {
    if (nutrient === "nitrogen") {
      // Benchmark: Optimal 130 - 165 mg/kg
      if (value < 100) {
        return {
          status: "deficit",
          label: "عجز آزوتي حاد (<100)",
          badgeColor: "bg-red-100 text-red-700 border-red-200",
          hex: "#EF4444",
          fillClass: "fill-red-500",
          strokeColor: "#DC2626",
          advice: "إضافة 35 كجم نترات نشادر 33.5% للفدان في مياه الري القادمة لتعويض الكلوروفيل."
        };
      }
      if (value < 130) {
        return {
          status: "moderate",
          label: "مستوى متوسط بحاجة لتسميد (100-130)",
          badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
          hex: "#F59E0B",
          fillClass: "fill-amber-500",
          strokeColor: "#D97706",
          advice: "تسميد تنشيطي بـ 15 كجم سلفات نشادر 20.6% مع الرية الدورية."
        };
      }
      if (value <= 165) {
        return {
          status: "optimal",
          label: "مستوى مثالي لنمو السيقان (130-165)",
          badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
          hex: "#10B981",
          fillClass: "fill-emerald-500",
          strokeColor: "#059669",
          advice: "توازن نيتروجيني ممتاز. استمر في التوزيع العادي دون إفراط."
        };
      }
      return {
        status: "surplus",
        label: "وفرة فائضة (>165)",
        badgeColor: "bg-emerald-900 text-emerald-100 border-emerald-800",
        hex: "#047857",
        fillClass: "fill-emerald-800",
        strokeColor: "#064E3B",
        advice: "وقف التسميد الآزوتي مؤقتاً لتجنب رقاد المحصول أو زيادة الهياج الخضري."
      };
    } else if (nutrient === "phosphorus") {
      // Benchmark: Optimal 35 - 48 mg/kg
      if (value < 25) {
        return {
          status: "deficit",
          label: "عجز فوسفوري حرج (<25)",
          badgeColor: "bg-rose-100 text-rose-700 border-rose-200",
          hex: "#F43F5E",
          fillClass: "fill-rose-500",
          strokeColor: "#E11D48",
          advice: "حقن 25 كجم حامض فوسفوريك 85% أو إضافة سوبر فوسفات محبب لتنشيط الجذور وتكوين الطاقة."
        };
      }
      if (value < 35) {
        return {
          status: "moderate",
          label: "مستوى فوسفور معتدل (25-35)",
          badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
          hex: "#F59E0B",
          fillClass: "fill-amber-500",
          strokeColor: "#D97706",
          advice: "إضافة جرعة خفيفة من مركب عالي الفوسفور (10-50-10) لدعم عقد الأزهار."
        };
      }
      if (value <= 48) {
        return {
          status: "optimal",
          label: "مستوى مثالي للجذور والتزهير (35-48)",
          badgeColor: "bg-teal-100 text-teal-800 border-teal-200",
          hex: "#0D9488",
          fillClass: "fill-teal-600",
          strokeColor: "#0F766E",
          advice: "المخزون الفوسفوري بحالة مثالية تعزز تفرع الشعيرات الماصة."
        };
      }
      return {
        status: "surplus",
        label: "وفرة فوسفاتية غنية (>48)",
        badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
        hex: "#0284C7",
        fillClass: "fill-sky-600",
        strokeColor: "#0369A1",
        advice: "مستوى مرتفع جداً؛ يرجى مراقبة امتصاص عناصر الزنك والحديد الصغرى."
      };
    } else {
      // Benchmark: Optimal 240 - 310 mg/kg
      if (value < 180) {
        return {
          status: "deficit",
          label: "نقص بوتاسي يهدد امتلاء الثمار (<180)",
          badgeColor: "bg-red-100 text-red-700 border-red-200",
          hex: "#E11D48",
          fillClass: "fill-rose-600",
          strokeColor: "#BE123C",
          advice: "إضافة 25 كجم سلفات بوتاسيوم 50% كحقن أرضي مع رش ورقي بسترات البوتاسيوم."
        };
      }
      if (value < 240) {
        return {
          status: "moderate",
          label: "مستوى مقبول يحتاج دعماً (180-240)",
          badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
          hex: "#F59E0B",
          fillClass: "fill-amber-500",
          strokeColor: "#D97706",
          advice: "إضافة نترات بوتاسيوم بمعدل 10 كجم للفدان لتحفيز نقل السكريات للثمار."
        };
      }
      if (value <= 310) {
        return {
          status: "optimal",
          label: "مستوى مثالي ومقاوم للإجهاد (240-310)",
          badgeColor: "bg-green-100 text-green-800 border-green-200",
          hex: "#16A34A",
          fillClass: "fill-green-600",
          strokeColor: "#15803D",
          advice: "مخزون ممتاز يحافظ على الجهد الاسموزي ويحمي من حرارة الصيف."
        };
      }
      return {
        status: "surplus",
        label: "وفرة بوتاسية ممتازة (>310)",
        badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
        hex: "#7C3AED",
        fillClass: "fill-purple-600",
        strokeColor: "#6D28D9",
        advice: "تركيز بوتاسي استثنائي يدعم أعلى جودة تصديرية للأوزان والصلابة."
      };
    }
  };

  // Composite NPK Soil Fertility Score (0-100)
  const getNPKComposite = (n: number, p: number, k: number) => {
    const nScore = Math.min(100, Math.max(0, (n / 145) * 100));
    const pScore = Math.min(100, Math.max(0, (p / 42) * 100));
    const kScore = Math.min(100, Math.max(0, (k / 280) * 100));
    const composite = Math.round((nScore + pScore + kScore) / 3);
    
    if (composite >= 85) {
      return { 
        score: composite, 
        label: "فائقة الخصوبة ومتوازنة NPK", 
        badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
        hex: "#059669", 
        fillClass: "fill-emerald-600",
        strokeColor: "#047857"
      };
    }
    if (composite >= 70) {
      return { 
        score: composite, 
        label: "خصوبة جيدة ومستقرة", 
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        hex: "#10B981", 
        fillClass: "fill-emerald-500",
        strokeColor: "#059669"
      };
    }
    if (composite >= 50) {
      return { 
        score: composite, 
        label: "خصوبة متوسطة تتطلب تسميداً متوازناً", 
        badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
        hex: "#F59E0B", 
        fillClass: "fill-amber-500",
        strokeColor: "#D97706"
      };
    }
    return { 
      score: composite, 
      label: "تربة مجهدة ذات عجز كيميائي مركب", 
      badgeColor: "bg-red-100 text-red-700 border-red-200",
      hex: "#EF4444", 
      fillClass: "fill-red-500",
      strokeColor: "#DC2626"
    };
  };

  // Get sector color for current active map layer
  const getSectorHeatmapStyle = (s: typeof sectors[0]) => {
    if (activeLayer === "standard") {
      return {
        fill: s.color,
        hex: "#064E3B",
        stroke: s.stroke,
        strokeHex: "#059669",
        fillOpacity: 1
      };
    }

    if (activeLayer === "satellite") {
      return {
        fill: "fill-emerald-900/30",
        hex: "#064E3B",
        stroke: "stroke-white/80",
        strokeHex: "#FFFFFF",
        fillOpacity: 0.35
      };
    }

    if (activeLayer === "ndvi") {
      let f = s.color;
      if (s.id === "s4") {
        f = ndviSliderVal > 60 ? "fill-amber-500/50" : "fill-amber-600/80";
      } else if (s.id === "s5") {
        f = "fill-red-600/50";
      } else {
        f = ndviSliderVal > 75 ? "fill-emerald-800" : "fill-emerald-600/60";
      }
      return {
        fill: f,
        hex: "#059669",
        stroke: s.stroke,
        strokeHex: "#059669",
        fillOpacity: 0.85
      };
    }

    // NPK Heatmap mode
    const opacityFactor = heatmapOpacity / 100;
    if (selectedNutrient === "nitrogen") {
      const evalN = getNutrientEvaluation("nitrogen", s.n);
      return {
        fill: evalN.fillClass,
        hex: evalN.hex,
        stroke: `stroke-[${evalN.strokeColor}]`,
        strokeHex: evalN.strokeColor,
        fillOpacity: opacityFactor
      };
    }

    if (selectedNutrient === "phosphorus") {
      const evalP = getNutrientEvaluation("phosphorus", s.p);
      return {
        fill: evalP.fillClass,
        hex: evalP.hex,
        stroke: `stroke-[${evalP.strokeColor}]`,
        strokeHex: evalP.strokeColor,
        fillOpacity: opacityFactor
      };
    }

    if (selectedNutrient === "potassium") {
      const evalK = getNutrientEvaluation("potassium", s.k);
      return {
        fill: evalK.fillClass,
        hex: evalK.hex,
        stroke: `stroke-[${evalK.strokeColor}]`,
        strokeHex: evalK.strokeColor,
        fillOpacity: opacityFactor
      };
    }

    // Composite NPK All
    const comp = getNPKComposite(s.n, s.p, s.k);
    return {
      fill: comp.fillClass,
      hex: comp.hex,
      stroke: `stroke-[${comp.strokeColor}]`,
      strokeHex: comp.strokeColor,
      fillOpacity: opacityFactor
    };
  };

  const getNdviColor = (val: number) => {
    if (val > 80) return "text-emerald-500 font-bold";
    if (val > 50) return "text-amber-500 font-bold";
    return "text-red-500 font-bold";
  };

  const getNdviStatusText = (val: number) => {
    if (val > 80) return "كثافة ممتازة وخضرة مستقرة (عقد ثمار كامل)";
    if (val > 50) return "إجهاد رطائي خفيف - تربة رملية عطشة";
    return "جفاف مستديم أو حصاد تام للقطاع";
  };

  const triggerFeedback = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3500);
  };

  return (
    <div id="interactive-map-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative" dir="rtl">
      
      {/* Dynamic Action Toast */}
      {feedbackToast && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-[#064E3B] text-white px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* 2/3 COLUMN: Interactive SVG GIS Canvas Map */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
        <div>
          {/* Header & Primary Layer Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[#064E3B] flex items-center gap-2">
                  <Satellite className="w-5 h-5 text-[#059669]" />
                  <span>الخريطة الكهرومغناطيسية والتحليل الطيفي والحراري</span>
                </h3>
                {activeLayer === "npk" && (
                  <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <FlaskConical className="w-3 h-3 text-amber-700" />
                    <span>طبقة جودة التربة N-P-K نشطة</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                موقع المزرعة الذكية - محافظة {governorate} • كود المسح المصري GIS-3000 • مساحة {farmSize} فدان
              </p>
            </div>

            {/* Render Switch: standard / Satellite / NDVI / NPK Heatmap */}
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1 max-sm:w-full overflow-x-auto">
              <button
                id="layer-btn-standard"
                onClick={() => setActiveLayer("standard")}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeLayer === "standard" ? "bg-white text-[#064E3B] shadow-sm font-extrabold" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                مخطط زراعي
              </button>
              <button
                id="layer-btn-satellite"
                onClick={() => setActiveLayer("satellite")}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeLayer === "satellite" ? "bg-white text-[#064E3B] shadow-sm font-extrabold" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                قمر صناعي
              </button>
              <button
                id="layer-btn-ndvi"
                onClick={() => setActiveLayer("ndvi")}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeLayer === "ndvi" ? "bg-white text-[#064E3B] shadow-sm font-extrabold" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                NDVI الطيفي
              </button>
              <button
                id="layer-btn-npk"
                onClick={() => setActiveLayer("npk")}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeLayer === "npk" 
                    ? "bg-[#064E3B] text-[#F59E0B] shadow-md font-black" 
                    : "text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>حراريات N-P-K للتربة</span>
              </button>
            </div>
          </div>

          {/* SECONDARY CONTROLS ROW: N-P-K Specific Sub-Selector or GIS Toggles */}
          {activeLayer === "npk" ? (
            <div className="bg-gradient-to-l from-amber-50/70 via-emerald-50/50 to-blue-50/60 border border-amber-200/80 rounded-2xl p-3 mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black text-[#064E3B] flex items-center gap-1">
                  <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
                  <span>عنصر التربة المفحوص:</span>
                </span>
                
                <div className="flex bg-white/90 rounded-xl p-0.5 border border-gray-200 shadow-2xs">
                  <button
                    id="nutrient-btn-all"
                    onClick={() => setSelectedNutrient("all")}
                    className={`py-1 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      selectedNutrient === "all" ? "bg-[#064E3B] text-white shadow-xs" : "text-gray-650 hover:text-[#064E3B]"
                    }`}
                  >
                    المركب الكلي NPK
                  </button>
                  <button
                    id="nutrient-btn-nitrogen"
                    onClick={() => setSelectedNutrient("nitrogen")}
                    className={`py-1 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      selectedNutrient === "nitrogen" ? "bg-emerald-600 text-white shadow-xs" : "text-emerald-800 hover:bg-emerald-50"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>النيتروجين (N)</span>
                  </button>
                  <button
                    id="nutrient-btn-phosphorus"
                    onClick={() => setSelectedNutrient("phosphorus")}
                    className={`py-1 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      selectedNutrient === "phosphorus" ? "bg-teal-700 text-white shadow-xs" : "text-teal-800 hover:bg-teal-50"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                    <span>الفوسفور (P)</span>
                  </button>
                  <button
                    id="nutrient-btn-potassium"
                    onClick={() => setSelectedNutrient("potassium")}
                    className={`py-1 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      selectedNutrient === "potassium" ? "bg-purple-700 text-white shadow-xs" : "text-purple-800 hover:bg-purple-50"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    <span>البوتاسيوم (K)</span>
                  </button>
                </div>
              </div>

              {/* Heatmap Layer Visual Toggles */}
              <div className="flex items-center gap-2 text-[10px] font-bold flex-wrap">
                <button
                  id="toggle-contour-btn"
                  onClick={() => setShowContourLines(!showContourLines)}
                  className={`py-1 px-2 rounded-lg border transition-colors cursor-pointer ${
                    showContourLines ? "bg-white text-[#064E3B] border-emerald-400 font-extrabold" : "bg-transparent text-gray-400 border-gray-200"
                  }`}
                >
                  خطوط الكنتور الحرارية
                </button>
                <button
                  id="toggle-probe-btn"
                  onClick={() => setShowProbeBadges(!showProbeBadges)}
                  className={`py-1 px-2 rounded-lg border transition-colors cursor-pointer ${
                    showProbeBadges ? "bg-white text-blue-700 border-blue-400 font-extrabold" : "bg-transparent text-gray-400 border-gray-200"
                  }`}
                >
                  أرقام المجسات الميدانية
                </button>
                
                {/* Opacity slider micro widget */}
                <div className="flex items-center gap-1.5 bg-white/90 px-2 py-0.5 rounded-lg border border-gray-200">
                  <span className="text-gray-500">كثافة الهيتماب:</span>
                  <input
                    type="range"
                    min="25"
                    max="95"
                    value={heatmapOpacity}
                    onChange={(e) => setHeatmapOpacity(Number(e.target.value))}
                    className="w-14 h-1.5 accent-[#064E3B] cursor-pointer"
                  />
                  <span className="font-mono text-gray-800">{heatmapOpacity}%</span>
                </div>
              </div>
            </div>
          ) : (
            /* Standard GIS Layers Overlay toggles */
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => setShowSensors(!showSensors)}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                  showSensors ? "bg-[#059669]/10 text-[#064E3B] border-[#059669]" : "bg-white text-gray-400 border-gray-200"
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>مجسات الـ IoT الكهرومغناطيسية</span>
              </button>

              <button
                onClick={() => setShowMachinery(!showMachinery)}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                  showMachinery ? "bg-[#F59E0B]/10 text-amber-800 border-[#F59E0B]" : "bg-white text-gray-400 border-gray-200"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>تتبع الجرارات الزراعية الذكية</span>
              </button>

              <button
                onClick={() => setShowProblemZones(!showProblemZones)}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                  showProblemZones ? "bg-red-50 text-red-700 border-red-200" : "bg-white text-gray-400 border-gray-200"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>بقاع الإصابة النشطة</span>
              </button>

              <button
                onClick={() => setShowWaterLines(!showWaterLines)}
                className={`py-1 px-2.5 rounded-lg text-[10px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                  showWaterLines ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-gray-400 border-gray-200"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>مسارات ترع الري الحديثة</span>
              </button>
            </div>
          )}
        </div>

        {/* MAP STAGE AND VECTOR CANVAS */}
        <div className="relative bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl h-[360px] border border-gray-100 flex items-center justify-center overflow-hidden select-none outline-none">
          {/* Satellite backdrop image */}
          {activeLayer === "satellite" && (
            <img 
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop" 
              alt="Satellite Farm Map"
              className="absolute inset-0 w-full h-full object-cover opacity-90 blur-[1px] mix-blend-multiply pointer-events-none" 
            />
          )}

          {/* Underlay Satellite on NPK Heatmap mode for maximum GIS authenticity */}
          {activeLayer === "npk" && (
            <div className="absolute inset-0 bg-slate-900/10 mix-blend-multiply pointer-events-none" />
          )}

          {activeLayer === "ndvi" && (
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/20 via-green-800/10 to-transparent z-0 pointer-events-none" />
          )}

          {/* SVG Vector Drawing */}
          <svg viewBox="0 0 800 500" className="w-full h-full p-2 z-10">
            {/* SVG Defs: Grid & Heatmap Blurring / Diffusion Gradients */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,100,0,0.06)" strokeWidth="1" />
              </pattern>

              {/* Heatmap soft diffusion filter */}
              <filter id="soil-heatmap-blur" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="22" result="blur" />
              </filter>

              {/* Radial gradients for each sector sensor node based on current nutrient */}
              {sectors.map((s) => {
                const style = getSectorHeatmapStyle(s);
                return (
                  <radialGradient 
                    key={`grad-npk-${s.id}`} 
                    id={`grad-npk-${s.id}`} 
                    cx="50%" 
                    cy="50%" 
                    r="65%"
                  >
                    <stop offset="0%" stopColor={style.hex} stopOpacity={0.9} />
                    <stop offset="55%" stopColor={style.hex} stopOpacity={0.55} />
                    <stop offset="100%" stopColor={style.hex} stopOpacity={0.08} />
                  </radialGradient>
                );
              })}
            </defs>

            {/* Base Grid Pattern */}
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* CONTINUOUS SOIL QUALITY HEATMAP DIFFUSION LAYER (active when NPK layer is on) */}
            {activeLayer === "npk" && (
              <g id="heatmap-diffusion-layer" filter="url(#soil-heatmap-blur)">
                {sectors.map((s) => (
                  <circle
                    key={`diffuse-${s.id}`}
                    cx={s.cx}
                    cy={s.cy}
                    r={s.id === "s4" ? 170 : 135}
                    fill={`url(#grad-npk-${s.id})`}
                    style={{ opacity: (heatmapOpacity / 100) * 0.85 }}
                  />
                ))}
              </g>
            )}

            {/* Water Canal Path if active */}
            {showWaterLines && (
              <path 
                d="M 10 50 L 250 150 Q 500 200 650 100 T 790 320" 
                fill="none" 
                stroke="#2563EB" 
                strokeWidth="7" 
                strokeLinecap="round"
                className="opacity-80 animate-pulse"
              />
            )}

            {/* Sector Polygons */}
            {sectors.map((s) => {
              const isActive = activeSector.id === s.id;
              const style = getSectorHeatmapStyle(s);

              return (
                <path
                  key={s.id}
                  id={`sector-polygon-${s.id}`}
                  d={s.d}
                  onClick={() => setSelectedSectorId(s.id)}
                  className={`cursor-pointer transition-all duration-300 ${style.fill} ${
                    isActive 
                      ? "stroke-white stroke-[4px] filter drop-shadow-xl brightness-110" 
                      : "stroke-emerald-950/40 stroke-2 hover:opacity-95 hover:stroke-white hover:stroke-[3px]"
                  }`}
                  style={{ fillOpacity: style.fillOpacity }}
                />
              );
            })}

            {/* Contour Isolines across field boundaries (when contour toggle is on) */}
            {activeLayer === "npk" && showContourLines && (
              <g id="npk-contour-isolines" className="pointer-events-none opacity-65">
                {/* Isoline 1 between Sector 1 and Sector 2 */}
                <path 
                  d="M 230,110 Q 260,200 220,290" 
                  fill="none" 
                  stroke="#FFFFFF" 
                  strokeWidth="2" 
                  strokeDasharray="4,4" 
                />
                {/* Isoline 2 between Sector 2 and Sector 3 */}
                <path 
                  d="M 510,110 Q 480,200 495,290" 
                  fill="none" 
                  stroke="#FFFFFF" 
                  strokeWidth="2" 
                  strokeDasharray="4,4" 
                />
                {/* Isoline 3 between North and South blocks */}
                <path 
                  d="M 50,295 L 720,295" 
                  fill="none" 
                  stroke="#FFFFFF" 
                  strokeWidth="2.5" 
                  strokeDasharray="6,4" 
                />
                {/* Isoline 4 around problem area in Sector 5 */}
                <ellipse 
                  cx="580" 
                  cy="400" 
                  rx="75" 
                  ry="45" 
                  fill="none" 
                  stroke="#EF4444" 
                  strokeWidth="2" 
                  strokeDasharray="3,3" 
                />
              </g>
            )}

            {/* IoT Sensor Blinking Hot Nodes and Dynamic Nutrient Probe Badges */}
            {(showSensors || activeLayer === "npk") && (
              <g id="sensor-hotspots">
                {sectors.map((s) => {
                  const isActive = activeSector.id === s.id;
                  const style = getSectorHeatmapStyle(s);

                  return (
                    <g 
                      key={`probe-${s.id}`} 
                      className="cursor-pointer" 
                      onClick={() => setSelectedSectorId(s.id)}
                    >
                      {/* Pulse rings */}
                      <circle 
                        cx={s.cx} 
                        cy={s.cy} 
                        r="14" 
                        className="animate-ping opacity-60" 
                        fill={style.hex} 
                      />
                      {/* Core Node */}
                      <circle 
                        cx={s.cx} 
                        cy={s.cy} 
                        r="7" 
                        fill={style.hex} 
                        stroke="#FFFFFF" 
                        strokeWidth={isActive ? 3 : 2} 
                      />

                      {/* On-Map Nutrient Value Pill Badge when active */}
                      {(showProbeBadges && activeLayer === "npk") && (
                        <g transform={`translate(${s.cx - 45}, ${s.cy - 38})`}>
                          <rect 
                            width="90" 
                            height="24" 
                            rx="12" 
                            fill="rgba(15, 23, 42, 0.9)" 
                            stroke={style.hex} 
                            strokeWidth="1.5" 
                          />
                          <text 
                            x="45" 
                            y="16" 
                            textAnchor="middle" 
                            className="fill-white font-mono font-extrabold text-[10px]"
                          >
                            {selectedNutrient === "nitrogen" && `N: ${s.n} mg/kg`}
                            {selectedNutrient === "phosphorus" && `P: ${s.p} mg/kg`}
                            {selectedNutrient === "potassium" && `K: ${s.k} mg/kg`}
                            {selectedNutrient === "all" && `NPK: ${getNPKComposite(s.n, s.p, s.k).score}%`}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </g>
            )}

            {/* Smart Tractor Machinery locations */}
            {showMachinery && activeLayer !== "npk" && (
              <g>
                <circle cx="300" cy="220" r="12" className="fill-amber-500 text-amber-950 font-black cursor-pointer" />
                <path d="M 296,215 L 304,215 L 300,225 Z" fill="#064E3B" />
                <text x="315" y="224" className="fill-slate-900 font-bold text-[10px] bg-white text-right">محل الجرار الذكي #2</text>
              </g>
            )}

            {/* Sector Texts Map Overlay */}
            <text x="110" y="220" className="fill-white font-black text-[12px] drop-shadow-md">أ-1</text>
            <text x="350" y="220" className="fill-white font-black text-[12px] drop-shadow-md">أ-2</text>
            <text x="590" y="220" className="fill-white font-black text-[12px] drop-shadow-md">ب-1</text>
            <text x="180" y="410" className="fill-white font-black text-[12px] drop-shadow-md">ب-2</text>
            <text x="550" y="410" className="fill-white font-black text-[12px] drop-shadow-md">ج-3</text>
          </svg>

          {/* Map Compass direction pointer */}
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-gray-100 flex items-center gap-1.5 text-[10px] font-bold text-gray-700 shadow-xs">
            <Compass className="w-3.5 h-3.5 text-[#059669] animate-spin-slow" />
            <span>محاذاة الشمال (GIS)</span>
          </div>

          {/* DYNAMIC COLOR-CODED HEATMAP LEGEND OVERLAY (Bottom Right) */}
          {activeLayer === "npk" ? (
            <div className="absolute bottom-3 right-3 bg-slate-950/90 text-white backdrop-blur-md p-3 rounded-2xl border border-slate-700 shadow-lg text-right text-[10px] leading-tight space-y-2 max-w-[270px]">
              <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                <span className="font-extrabold text-amber-400 flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  <span>
                    {selectedNutrient === "nitrogen" && "دليل حراريات النيتروجين (N)"}
                    {selectedNutrient === "phosphorus" && "دليل حراريات الفوسفور (P)"}
                    {selectedNutrient === "potassium" && "دليل حراريات البوتاسيوم (K)"}
                    {selectedNutrient === "all" && "دليل مؤشر خصوبة التربة NPK"}
                  </span>
                </span>
                <span className="text-[9px] text-gray-400">ملجم/كجم</span>
              </div>

              {/* Continuous Gradient Bar */}
              <div className="space-y-1">
                <div className="h-2.5 rounded-full overflow-hidden w-full bg-gradient-to-l from-[#EF4444] via-[#F59E0B] via-[#10B981] to-[#047857]" />
                <div className="flex justify-between text-[8px] text-gray-300 font-mono font-bold">
                  <span>
                    {selectedNutrient === "nitrogen" && "نقص <100"}
                    {selectedNutrient === "phosphorus" && "نقص <25"}
                    {selectedNutrient === "potassium" && "نقص <180"}
                    {selectedNutrient === "all" && "ضعيف <50%"}
                  </span>
                  <span>متوسط</span>
                  <span>مثالي</span>
                  <span>
                    {selectedNutrient === "nitrogen" && "فائض >165"}
                    {selectedNutrient === "phosphorus" && "غني >48"}
                    {selectedNutrient === "potassium" && "وفرة >310"}
                    {selectedNutrient === "all" && "فائق >85%"}
                  </span>
                </div>
              </div>

              {/* Benchmark summary tip */}
              <div className="text-[9px] text-emerald-350 text-emerald-300 pt-0.5 leading-snug">
                * مستويات المعايرة مستندة لبيانات معهد بحوث الأراضي والمياه بالدلتا.
              </div>
            </div>
          ) : (
            /* NDVI and standard legend */
            <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-gray-100 shadow-xs text-right text-[10px] leading-tight space-y-1">
              <div className="font-bold text-[#064E3B]">مفتاح اللوحة الطيفية:</div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-700 rounded-xs inline-block"></span>
                <span>مساحة بالغة الخضرة (NDVI: 0.9)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-amber-400 rounded-xs inline-block"></span>
                <span>رطوبة منخفضة/صخرية (NDVI: 0.4)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-xs inline-block"></span>
                <span>بقع ذبول أو خمول أرضي (NDVI: 0.1)</span>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM TIMELINE AND NDVI SLIDER (only for NDVI layer) */}
        {activeLayer === "ndvi" && (
          <div className="bg-[#F0F4F0] p-4 rounded-2xl border border-gray-100 mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-extrabold text-[#064E3B] flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#059669]" />
                <span>محاكاة تغير الكثافة الخضرية (شهر مايو ٢٠٢٦)</span>
              </span>
              <span className={`text-xs ${getNdviColor(ndviSliderVal)}`}>
                معدل المحصول الإجمالي: {ndviSliderVal}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={ndviSliderVal}
              onChange={(e) => setNdviSliderVal(parseInt(e.target.value))}
              className="w-full accent-[#059669] bg-gray-300 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            
            <div className="flex justify-between text-[11px] text-gray-500 mt-2 font-medium">
              <span>١ مايو (بداية النمو)</span>
              <span className="font-bold text-gray-700">{getNdviStatusText(ndviSliderVal)}</span>
              <span>٣٠ مايو (عشية الحصاد)</span>
            </div>
          </div>
        )}

        {/* N-P-K Quick Recommendation Banner on Map Bottom */}
        {activeLayer === "npk" && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-right">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300">
                <Leaf className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <strong className="text-xs text-[#064E3B] block">توصية تسميد كيميائي موجه (VRA) للقطاع النشط:</strong>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  {selectedNutrient === "nitrogen" && getNutrientEvaluation("nitrogen", activeSector.n).advice}
                  {selectedNutrient === "phosphorus" && getNutrientEvaluation("phosphorus", activeSector.p).advice}
                  {selectedNutrient === "potassium" && getNutrientEvaluation("potassium", activeSector.k).advice}
                  {selectedNutrient === "all" && `التشخيص الميداني: ${activeSector.note}. يوصى ببرمجة السمادة الذكية لموازنة الآزوت والفوسفور.`}
                </p>
              </div>
            </div>

            <button
              onClick={() => triggerFeedback(`تم اعتماد ونقل إحداثيات التسميد لـ ${activeSector.name} إلى حاسوب الجرار الزراعي الذكي!`)}
              className="py-1.5 px-3 bg-[#064E3B] hover:bg-[#059669] text-white rounded-xl text-xs font-black transition-colors cursor-pointer shrink-0 whitespace-nowrap shadow-xs"
            >
              برمجة الجرار الذكي (VRA)
            </button>
          </div>
        )}
      </div>

      {/* 1/3 COLUMN: Detailed Sector Analysis & Soil Quality Card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <h3 className="font-extrabold text-base text-[#064E3B] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#F59E0B]" />
              <span>تحليلات التربة والعناصر المغذية</span>
            </h3>
            <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded-full text-slate-700">
              {activeSector.id.toUpperCase()}
            </span>
          </div>

          <div className="space-y-4">
            {/* Active Sector Identity */}
            <div className="bg-[#064E3B] text-white p-4 rounded-2xl relative overflow-hidden shadow-inner">
              <div className="absolute top-2 left-2 text-[#F59E0B]">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div className="text-[10px] text-emerald-300 font-bold">القطاع الزراعي المحدد:</div>
              <div className="text-sm font-black mt-1">{activeSector.name}</div>
              <div className="flex items-center justify-between text-[11px] text-white/80 mt-2 pt-2 border-t border-emerald-800">
                <span>المحصول المزروع: <strong className="text-amber-300">{activeSector.crop}</strong></span>
                <span>المساحة: <strong className="text-white">{Math.round(farmSize / 5)} فدان</strong></span>
              </div>
            </div>

            {/* Composite Fertility Index for Sector */}
            {(() => {
              const comp = getNPKComposite(activeSector.n, activeSector.p, activeSector.k);
              return (
                <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block">مؤشر خصوبة وجودة التربة NPK:</span>
                    <strong className="text-xs text-[#064E3B] font-extrabold block mt-0.5">{comp.label}</strong>
                  </div>
                  <div className={`px-2.5 py-1 rounded-xl text-xs font-mono font-black border ${comp.badgeColor}`}>
                    {comp.score} / 100
                  </div>
                </div>
              );
            })()}

            {/* SPECIFIC N-P-K NUTRIENT BREAKDOWN CARDS */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-extrabold text-gray-700 block">تركيز العناصر الحيوية بالتربة (N-P-K):</span>

              {/* 1. Nitrogen (N) */}
              {(() => {
                const evalN = getNutrientEvaluation("nitrogen", activeSector.n);
                return (
                  <div 
                    onClick={() => {
                      setActiveLayer("npk");
                      setSelectedNutrient("nitrogen");
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      selectedNutrient === "nitrogen" && activeLayer === "npk"
                        ? "bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-300"
                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs mb-1">
                      <div className="flex items-center gap-1.5 font-extrabold text-slate-800">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span>النيتروجين / الآزوت (N)</span>
                      </div>
                      <span className="font-mono font-black text-emerald-700">{activeSector.n} ملجم/كجم</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (activeSector.n / 180) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1 text-[9px]">
                      <span className="text-gray-400">المثالي: 130 - 165</span>
                      <span className={`font-bold ${evalN.badgeColor} px-1.5 py-0.2 rounded-md`}>
                        {evalN.label}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* 2. Phosphorus (P) */}
              {(() => {
                const evalP = getNutrientEvaluation("phosphorus", activeSector.p);
                return (
                  <div 
                    onClick={() => {
                      setActiveLayer("npk");
                      setSelectedNutrient("phosphorus");
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      selectedNutrient === "phosphorus" && activeLayer === "npk"
                        ? "bg-teal-50/70 border-teal-400 ring-2 ring-teal-300"
                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs mb-1">
                      <div className="flex items-center gap-1.5 font-extrabold text-slate-800">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                        <span>الفوسفور المدمج (P)</span>
                      </div>
                      <span className="font-mono font-black text-teal-700">{activeSector.p} ملجم/كجم</span>
                    </div>
                    <div className="w-2.5 w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-teal-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (activeSector.p / 60) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1 text-[9px]">
                      <span className="text-gray-400">المثالي: 35 - 48</span>
                      <span className={`font-bold ${evalP.badgeColor} px-1.5 py-0.2 rounded-md`}>
                        {evalP.label}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* 3. Potassium (K) */}
              {(() => {
                const evalK = getNutrientEvaluation("potassium", activeSector.k);
                return (
                  <div 
                    onClick={() => {
                      setActiveLayer("npk");
                      setSelectedNutrient("potassium");
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      selectedNutrient === "potassium" && activeLayer === "npk"
                        ? "bg-purple-50/70 border-purple-400 ring-2 ring-purple-300"
                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs mb-1">
                      <div className="flex items-center gap-1.5 font-extrabold text-slate-800">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                        <span>البوتاسيوم والأملاح (K)</span>
                      </div>
                      <span className="font-mono font-black text-purple-700">{activeSector.k} ملجم/كجم</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (activeSector.k / 350) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1 text-[9px]">
                      <span className="text-gray-400">المثالي: 240 - 310</span>
                      <span className={`font-bold ${evalK.badgeColor} px-1.5 py-0.2 rounded-md`}>
                        {evalK.label}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* pH and Moisture readings for the sector */}
            <div className="grid grid-cols-2 gap-2 text-right pt-1">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-150 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-gray-400 font-bold">الحموضة (pH)</div>
                  <div className="text-xs font-black text-slate-800 font-mono">{activeSector.ph}</div>
                </div>
                <Thermometer className="w-3.5 h-3.5 text-amber-600" />
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-150 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-gray-400 font-bold">الرطوبة الأرضية</div>
                  <div className="text-xs font-black text-blue-700 font-mono">{activeSector.moisture}%</div>
                </div>
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
              </div>
            </div>

          </div>
        </div>

        {/* Legend metadata & Export CTA */}
        <div className="border-t border-gray-100 pt-3 text-right space-y-2">
          <button
            onClick={() => triggerFeedback(`تم تصدير تقرير تحليلي شامل لخريطة N-P-K لـ ${activeSector.name} بصيغة GeoJSON!`)}
            className="w-full py-2.5 px-3 bg-slate-100 hover:bg-[#064E3B] text-slate-700 hover:text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>تصدير خريطة العناصر (GeoJSON / Shapefile)</span>
          </button>

          <div className="text-[10px] text-gray-400 leading-relaxed font-normal">
            * يتم تحديث هذه الخرائط بالتعاون مع <strong className="text-gray-600">الهيئة المصرية القومية للاستشعار عن بعد (NARSS)</strong> ومعهد بحوث الأراضي والمياه.
          </div>
        </div>

      </div>

    </div>
  );
}

