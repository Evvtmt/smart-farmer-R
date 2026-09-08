import React, { useState, useEffect } from "react";
import { 
  Brain, 
  Droplet, 
  Sun, 
  Wind, 
  Sprout, 
  Clock, 
  Sparkles, 
  Check, 
  ArrowLeftRight, 
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { Farm, SoilSensorData, CropGrowthStage, WeatherDay, IrrigationPlan } from "../types";

interface AIIrrigationPredictorProps {
  activeFarm: Farm;
  activeFarmSoil: SoilSensorData;
  cropGrowth: CropGrowthStage[];
  weatherForecast: WeatherDay[];
  onAddIrrigationPlan: (plan: {
    farmName: string;
    cropType: string;
    scheduleTime: string;
    durationMinutes: number;
    waterVolumeLiter: number;
    method: "drip" | "sprinkler" | "surface";
  }) => void;
  isOffline: boolean;
  triggerNotification: (msg: string) => void;
}

export default function AIIrrigationPredictor({
  activeFarm,
  activeFarmSoil,
  cropGrowth,
  weatherForecast,
  onAddIrrigationPlan,
  isOffline,
  triggerNotification
}: AIIrrigationPredictorProps) {
  // Loading & Advanced AI refinement states
  const [isRefining, setIsRefining] = useState(false);
  const [useAdvancedAI, setUseAdvancedAI] = useState(false);
  const [aiCustomAdvice, setAiCustomAdvice] = useState<string | null>(null);

  // User input variables to customize the prediction parameters
  const [selectedCrop, setSelectedCrop] = useState<string>(activeFarm.crops[0] || "قمح");
  const [overrideMoisture, setOverrideMoisture] = useState<number>(activeFarmSoil.moisture);

  // Sync state if crop changes to update default inputs
  useEffect(() => {
    if (activeFarm.crops.length > 0) {
      setSelectedCrop(activeFarm.crops[0]);
    }
  }, [activeFarm]);

  useEffect(() => {
    setOverrideMoisture(activeFarmSoil.moisture);
  }, [activeFarmSoil]);

  // Find corresponding growth stage info for selected crop
  const matchedGrowth = cropGrowth.find(
    cg => cg.cropName.includes(selectedCrop) || selectedCrop.includes(cg.cropName)
  ) || cropGrowth[0];

  // Run the core local rules-based prediction model
  const generateLocalPrediction = () => {
    const todayWeather = weatherForecast[0] || { tempMax: 33, humidity: 45, windSpeed: 15, rainProb: 0 };
    const tomorrowWeather = weatherForecast[1] || { tempMax: 35, humidity: 40, windSpeed: 18, rainProb: 0 };

    const maxTemp = Math.max(todayWeather.tempMax, tomorrowWeather.tempMax);
    const avgWind = (todayWeather.windSpeed + tomorrowWeather.windSpeed) / 2;
    const isRainSoon = todayWeather.rainProb > 30 || tomorrowWeather.rainProb > 30;

    let recTime = "06:30 صباحاً";
    let recMinutes = 40;
    let waterVolumePerFeddanLiters = 500; // default baseline L/feddan
    let explanation = "";
    let alertText = "";
    let isIrriCritical = false;

    // 1. Soil Moisture factor
    if (overrideMoisture < 45) {
      isIrriCritical = true;
      waterVolumePerFeddanLiters += 200;
    } else if (overrideMoisture > 75) {
      waterVolumePerFeddanLiters = 150; // soil is saturated, reduce watering
    }

    // 2. Weather & Temperature factors
    if (maxTemp >= 35) {
      // Hot wave protection - avoid midday watering (10:00 AM - 04:00 PM)
      recTime = "05:15 صباحاً (قبل شروق الشمس) أو 07:45 مساءً (فترة المساء الباردة)";
      waterVolumePerFeddanLiters += 150; // extra to account for evaporation loss
      explanation += "تم تجنب الساعات المشمسة لتقليص معدلات البخر السطحي وخفض إجهاد النبات الحراري. ";
    } else {
      recTime = "07:00 صباحاً (التبكير الصباحي المثالي)";
    }

    if (avgWind > 20) {
      explanation += "تم رصد سرعة رياح مرتفعة؛ يوصى بشدة باستخدام الري بالتنقيط لتجنب تذرير قطرات رذاذ الرشاشات وضياع المياه. ";
    }

    if (isRainSoon) {
      recTime = "تأجيل مؤقت لبعد الظهر";
      waterVolumePerFeddanLiters -= 250;
      explanation += "هناك احتمالية لهطول الأمطار بالمنطقة؛ تم خفض نسبة السحب المائي للاستفادة من الري المطري الطبيعي. ";
    }

    // 3. Plant Growth Stage factor
    const progress = matchedGrowth ? matchedGrowth.progress : 50;
    const stageName = matchedGrowth ? matchedGrowth.stageName : "النمو الخضري";
    
    if (matchedGrowth) {
      if (progress > 30 && progress < 80) {
        // High water demand phases (tuber building, earing, flowering)
        waterVolumePerFeddanLiters += 100;
        recMinutes += 15;
        explanation += `المحصول حالياً في "${stageName}" وهي فترة حساسة جداً للامتصاص وتتطلب رطوبة مستقرة حول الجذور لتأمين الإنتاج المتوقع. `;
      } else if (progress >= 80) {
        // Ripening phases: reduce water
        waterVolumePerFeddanLiters -= 100;
        recMinutes -= 5;
        explanation += `المحصول في مرحلة النضوج الأخيرة ولذلك ينصح بتقليل الري التدريجي لمنع تعفن الدرنات أو السنابل وتهيئة الحصاد. `;
      } else {
        // Initial germination/seedling: small but delicate amounts
        waterVolumePerFeddanLiters = Math.min(waterVolumePerFeddanLiters, 300);
        recMinutes = 25;
        explanation += `مرحلة الإنبات الأولية تتطلب رشات خفيفة متقاربة لمنع جرف البذور حديثة الطمر. `;
      }
    }

    // Calculate total water needed dynamically based on farm size
    const totalVolumeLiters = Math.max(1000, waterVolumePerFeddanLiters * activeFarm.size);

    // Recommend Irrigation method
    let recMethod: "drip" | "sprinkler" | "surface" = "drip";
    if (activeFarm.waterSource.includes("رش") || activeFarm.soilType.includes("رملية")) {
      recMethod = "sprinkler";
    }
    if (activeFarm.waterSource.includes("غمر") || activeFarm.waterSource.includes("ترعة المحمودية")) {
      // Delta silt clay farms can also use sprinkler or surface
      recMethod = selectedCrop === "قمح" ? "sprinkler" : "drip";
    }

    // Determine stress rate indicator
    let cropWaterStressIndicator = "منخفض (مستقر)";
    let stressColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (overrideMoisture < 45) {
      cropWaterStressIndicator = "مرتفع (بحاجة للري العاجل)";
      stressColor = "text-red-600 bg-red-50 border-red-200";
    } else if (overrideMoisture < 60) {
      cropWaterStressIndicator = "متوسط (جفاف سطحي)";
      stressColor = "text-amber-600 bg-amber-50 border-amber-200";
    }

    return {
      recTime,
      recMinutes,
      totalVolumeLiters,
      recMethod,
      explanation,
      isIrriCritical,
      cropWaterStressIndicator,
      stressColor,
      waterVolumePerFeddanLiters
    };
  };

  const localPrediction = generateLocalPrediction();

  // Call server-side Gemini system to refine predictive irrigation advice using advanced models
  const handleRefineWithCloudAI = async () => {
    if (isOffline) {
      triggerNotification("عذراً، لا يمكن الاتصال بالذكاء الاصطناعي السحابي المتقدم وأنت في وضع العمل دون شبكة.");
      return;
    }

    setIsRefining(true);
    setUseAdvancedAI(true);
    try {
      const promptText = `بصفتك خبير الهيدروليكا والري الزراعي بوزارة الزراعة المصرية، قم بتحليل البيانات التالية المحدثة لمزرعة "${activeFarm.name}" بمحافظة "${activeFarm.governorate}":
- المحصول النشط المحدد: ${selectedCrop}
- مرحلة النمو الحالية: ${matchedGrowth?.stageName || "مجهولة"} (بتقدم ${matchedGrowth?.progress || 50}%)
- رطوبة التربة المقاسة من الرف السطحي: ${overrideMoisture}% (الرطوبة المثالية هي 65-75%)
- مساحة الأرض الكلية: ${activeFarm.size} فدان مصري
- درجات الحرارة المتوقعة: العظمى ${weatherForecast[0]?.tempMax || 34}°م، والصغرى ${weatherForecast[0]?.tempMin || 21}°م
- حالة الجو: ${weatherForecast[0]?.condition || "مشمس وحار"} مع سرعة رياح تبلغ ${weatherForecast[0]?.windSpeed || 15} كم/ساعة ورطوبة جوية تبلغ ${weatherForecast[0]?.humidity || 45}%.

اقترح للمزارع موعدًا زمنيًا محددًا ومحور ري محسن ومقدار السحب المائي الإجمالي باللتر بأسلوب المهندس إبراهيم الزراعي المبتكر، واكتب تعليقك في ثلاث ركنيات:
١- التوقيت الزمني بالدقة لجدولة الضخ.
٢- توصية حجم اللترات المخصص وكيفية توزيعه.
٣- تبرير علمي مصري يراعي عدم إهدار الترع والآبار وتفادي التبخر الشديد.
اجعل الرد جذاباً، مهنياً، ومكتوباً بلهجة مصرية وعربية واضحة وبسيطة دون علامات تنسيق غريبة.`;

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "user", text: promptText }
          ]
        })
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with API Server");
      }

      const data = await response.json();
      if (data && data.text) {
        setAiCustomAdvice(data.text);
        triggerNotification("تم استيراد تنقيح نموذج الذكاء الاصطناعي بنجاح!");
      } else {
        throw new Error("Empty text returned");
      }
    } catch (err) {
      console.error(err);
      setAiCustomAdvice(`فشل نموذج التدقيق السحابي. التوصية المقترحة محلياً: ${localPrediction.explanation} ينصح ببدء الري عند الساعة الخامسة صباحاً بمعدل ${localPrediction.totalVolumeLiters.toLocaleString()} لتر كلي.`);
      triggerNotification("تعذر جلب التوقع الإضافي؛ تم حفظ التوقع المحلي الموثوق.");
    } finally {
      setIsRefining(false);
    }
  };

  // Dispatch the chosen prediction directly into the host React state so the farmers can see it!
  const handleApplyToPumps = () => {
    const defaultTime = useAdvancedAI && aiCustomAdvice 
      ? "اليوم الساعة 06:15 صباحاً (تنقيح ذكي)" 
      : `اليوم الساعة ${localPrediction.recTime.includes("05:15") ? "05:15 صباحاً" : "07:00 صباحاً"}`;

    onAddIrrigationPlan({
      farmName: activeFarm.name,
      cropType: selectedCrop,
      scheduleTime: defaultTime,
      durationMinutes: localPrediction.recMinutes,
      waterVolumeLiter: localPrediction.totalVolumeLiters,
      method: localPrediction.recMethod
    });

    triggerNotification(`✅ تم بنجاح إدراج خطة ري ذكية مؤتمتة لـ "${selectedCrop}" بالمستودع اللامركزي لمزرعة ${activeFarm.name}.`);
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-100 rounded-3xl p-6 shadow-md space-y-6 text-right" dir="rtl">
      
      {/* Module Title / Header */}
      <div className="flex justify-between items-start pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center border border-blue-200 shadow-inner">
            <Brain className="w-5.5 h-5.5 text-blue-600 animate-[pulse_2s_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-[#064E3B] text-base">نموذج التنبؤ بنظم الري المدعوم بالذكاء الاصطناعي</h4>
              <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider scale-95">
                تنبؤ ديناميكي
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              يستخدم حساسات رطوبة التربة التبادلية، وتوقعات المناخ لـ ١٤ يوماً وعمر المحصول لجدولة الضخ الآلي وتوجيه الحصص المائية.
            </p>
          </div>
        </div>

        {/* Offline notice check */}
        <div className={`px-2.5 py-1 rounded-full text-[9px] font-black flex items-center gap-1.5 border ${
          isOffline 
            ? "bg-amber-50 text-amber-600 border-amber-200" 
            : "bg-emerald-50 text-emerald-600 border-emerald-200"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isOffline ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
          <span>{isOffline ? "المحرك المحلي نشط بأوفلاين" : "الاتصال السحابي متاح والذكاء نشط"}</span>
        </div>
      </div>

      {/* Interactive Controls Grid to recalculate simulations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4.5 rounded-2xl border border-gray-150">
        
        {/* Input 1: Crop Type Selector */}
        <div>
          <label className="block text-xs font-extrabold text-gray-650 mb-1.5">1. حدد المحصول المراد ريه:</label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full text-xs p-2.5 bg-white border border-gray-250 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-bold transition-all"
          >
            {activeFarm.crops.map((crop, idx) => (
              <option key={idx} value={crop}>{crop}</option>
            ))}
          </select>
          {matchedGrowth && (
            <div className="flex items-center gap-1.5 mt-2 bg-white/60 p-1.5 rounded-lg border border-dashed border-gray-200 text-[10px] text-gray-500 font-bold">
              <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>الطور: {matchedGrowth.stageName} ({matchedGrowth.progress}% من النمو)</span>
            </div>
          )}
        </div>

        {/* Input 2: Dynamic Soil Moisture deficit slider */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-extrabold text-gray-650">2. رطوبة التربة الحالية بحقل الحساس:</label>
            <span className="text-xs font-mono font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-lg border border-blue-100">
              {overrideMoisture}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="95"
            value={overrideMoisture}
            onChange={(e) => setOverrideMoisture(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[9px] text-gray-400 font-bold mt-1 px-1">
            <span className="text-red-500">جاف جداً (10٪)</span>
            <span className="text-blue-500">مشبع تماماً (95٪)</span>
          </div>
        </div>

        {/* Info 3: Associated Meteorological Status */}
        <div className="bg-white/80 p-3 rounded-xl border border-slate-150 flex flex-col justify-between">
          <div className="flex justify-between items-center pb-1.5 border-b border-dashed border-gray-150">
            <span className="text-[10px] text-gray-400 font-bold">3. حالة طقس الدلتا النشط:</span>
            <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5 rounded-full">
              حار وجاف
            </span>
          </div>
          <div className="flex items-center justify-between pt-1.5 text-[11px] font-bold text-gray-750">
            <div className="flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>عظمى {weatherForecast[0]?.tempMax || 34}°م</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-blue-400" />
              <span>رياح {weatherForecast[0]?.windSpeed || 15} كم/س</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-blue-500" />
              <span>رطوبة {weatherForecast[0]?.humidity || 45}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Prediction Recommender Card layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left column (8 lines/cols): The prediction output block */}
        <div className="lg:col-span-8 border border-blue-200 bg-blue-50/10 rounded-2xl p-5 space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 bg-blue-600 text-white text-[9px] font-extrabold px-3 py-1 rounded-br-2xl flex items-center gap-1">
            <Sparkles className="w-3 h-3 animate-spin" />
            <span>خوارزمية ري فدان دقيقة</span>
          </div>

          <div className="space-y-3">
            <span className="text-gray-400 text-[10px] font-black tracking-wider block uppercase">التوصية المقترحة لـ {selectedCrop}:</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Optimal Watering Start Time */}
              <div className="bg-white p-3.5 rounded-xl border border-blue-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-200 shrink-0">
                  <Clock className="w-5.5 h-5.5 text-amber-600" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold">موعد البدء المحسن:</span>
                  <strong className="text-xs sm:text-sm text-[#064E3B] font-black block mt-0.5 leading-tight">
                    {localPrediction.recTime}
                  </strong>
                </div>
              </div>

              {/* Volume and Rate */}
              <div className="bg-white p-3.5 rounded-xl border border-blue-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-200 shrink-0">
                  <Droplet className="w-5.5 h-5.5 text-blue-600" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold">الحصة المائية المقدرة للفدان والكلي:</span>
                  <strong className="text-xs sm:text-sm text-blue-900 font-mono font-black block mt-0.5 leading-tight">
                    {localPrediction.waterVolumePerFeddanLiters} لتر/فدان | {localPrediction.totalVolumeLiters.toLocaleString()} لتر كلي 
                  </strong>
                </div>
              </div>

            </div>

            {/* Dynamic Local Rule Explanation Text */}
            <div className="bg-white/80 border border-slate-150 rounded-xl p-3.5 text-xs text-slate-800 leading-relaxed space-y-2">
              <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-slate-100 text-[#064E3B]">
                <Check className="w-4 h-4 text-emerald-600" />
                <strong className="font-extrabold">مسببات خوارزمية التنبؤ الذكية:</strong>
              </div>
              <p className="font-bold">
                {localPrediction.explanation} 
                {overrideMoisture < 45 ? "ملاحظة: مؤشرات قياس رطوبة التربة تقع تحت حد الأمان الحرج، يرجى تسريع الضخ لحماية بنية التربة." : ""}
              </p>
            </div>

            {/* Advanced AI Text panel (shows only when loaded from server) */}
            {useAdvancedAI && (
              <div className="bg-indigo-50/55 border border-indigo-200 rounded-xl p-3.5 text-xs text-indigo-900 transition-all duration-500">
                <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-indigo-150">
                  <Brain className="w-4 h-4 text-indigo-600 animate-pulse" />
                  <strong className="font-extrabold text-[#1E1B4B]">تنقيب فكري مدقق بالذكاء الاصطناعي (Gemini 3.5):</strong>
                </div>
                {isRefining ? (
                  <div className="flex items-center gap-2 py-4 justify-center">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                    <span className="animate-pulse font-extrabold">جاري ترحيل معطيات الفدان واستيراد توصيات الذكاء الاصطناعي...</span>
                  </div>
                ) : (
                  <p className="leading-relaxed font-semibold">
                    {aiCustomAdvice || "اضغط على زر (تعدين وتنقيح بالذكاء الاصطناعي) باليسار للربط بنماذج السحابة الحية للفدان."}
                  </p>
                )}
              </div>
            )}

            {/* Warn user if watering is critical */}
            {localPrediction.isIrriCritical && (
              <div className="bg-red-50 border border-red-200 text-[#7F1D1D] rounded-xl p-3 text-[11px] font-bold flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>حالة استجابة سريعة: رطوبة حقل {selectedCrop} منخفضة وسرعة الجفاف مرتفعة. ينصح بتأكيد الضخ فوراً.</span>
              </div>
            )}

          </div>

          {/* Action triggers bottom */}
          <div className="pt-3 border-t border-blue-105 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleApplyToPumps}
              className="flex-1 py-3 px-4 bg-[#064E3B] hover:bg-[#059669] text-white rounded-xl text-xs font-black transition-colors cursor-pointer text-center flex items-center justify-center gap-2 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>تطبيق الموعد الموصى به كجدول تشغيل نشط</span>
            </button>
            
            {useAdvancedAI && (
              <button
                onClick={() => {
                  setUseAdvancedAI(false);
                  setAiCustomAdvice(null);
                }}
                className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
              >
                إخفاء التنقيح السحابي
              </button>
            )}
          </div>
        </div>

        {/* Right column (4 lines/cols): Dynamic crop statistics & interactive trigger */}
        <div className="lg:col-span-4 border border-slate-150 rounded-2xl p-4 bg-white flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            <span className="text-gray-400 text-[10px] font-black tracking-wider block uppercase">معلمات الأمان الحيوية للمحصول:</span>
            
            {/* 1. Stress level metric indicator */}
            <div className={`border p-3 rounded-xl ${localPrediction.stressColor} text-right space-y-1 transition-all duration-300`}>
              <span className="text-[10px] block opacity-85">مؤشر الإجهاد المائي للمحصول:</span>
              <strong className="text-xs font-black block">{localPrediction.cropWaterStressIndicator}</strong>
            </div>

            {/* 2. Ideal moisture threshold status bar */}
            <div className="border border-gray-100 p-3 rounded-xl bg-slate-50/50 text-right space-y-1">
              <span className="text-[10px] text-gray-400 block font-bold">نطاق الأمان المائي المثالي:</span>
              <strong className="text-xs text-gray-800 font-extrabold block">بين 60٪  إلى 78% رطوبة مقاسة</strong>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1 text-center relative">
                <span className="absolute left-1/3 right-1/4 bg-blue-500/20 top-0 bottom-0" />
                <div 
                  className={`h-full transition-all duration-500 ${overrideMoisture < 45 ? "bg-red-500" : overrideMoisture > 80 ? "bg-amber-500" : "bg-blue-600"}`} 
                  style={{ width: `${overrideMoisture}%` }} 
                />
              </div>
            </div>

            {/* 3. Expected Yield sensitivity context */}
            <div className="p-3 rounded-xl border border-dashed border-gray-200 space-y-1">
              <span className="text-[10px] text-gray-400 block font-bold">المردود المتوقع للإنتاجية:</span>
              <strong className="text-xs text-[#064E3B] font-extrabold block">
                {matchedGrowth ? matchedGrowth.expectedYield : 20} {selectedCrop === "قمح" ? "أردب" : "طن"} للفدان
              </strong>
              <p className="text-[10px] text-gray-500 leading-normal">
                الالتزام ببدء ري منظم وفي موعده يمنع تسقاط العقد ويزيد جودة الثمار بنسبة ٢٢٪.
              </p>
            </div>
          </div>

          {/* Big refine action button */}
          <button
            onClick={handleRefineWithCloudAI}
            disabled={isRefining}
            className={`w-full py-3.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all ${
              isOffline
                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-98"
            }`}
          >
            {isRefining ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري معالجة معطيات التربة...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <span>تنقيح وتوليد بالذكاء الاصطناعي السحابي</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
