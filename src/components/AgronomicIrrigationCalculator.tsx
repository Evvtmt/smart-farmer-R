/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Agronomic Irrigation Calculator Component
 * Implements deterministic FAO-56 Penman-Monteith equation standards
 * Features:
 * - Deterministic agronomic calculation (ET0, Kc, ETc, Field Capacity, Wilting Point)
 * - Soil and crop stage parametrization adapted to Egyptian soils & climates
 * - Live sync with IoT soil probes and Open-Meteo weather
 * - Gemini 3.8 Flash Egyptian Arabic advisory explanation
 * - Direct pump command trigger
 */

import React, { useState } from "react";
import { 
  Droplets, 
  Sparkles, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Play, 
  RefreshCw,
  Zap,
  Gauge,
  ThermometerSun,
  Layers
} from "lucide-react";
import { Farm, SoilSensorData, WeatherDay } from "../types";
import { apiCalculateIrrigation, sendPhysicalPumpCommand } from "../services/realDataService";

interface AgronomicCalculatorProps {
  currentFarm: Farm;
  activeSoil?: SoilSensorData;
  currentWeather?: WeatherDay;
  onPumpActivated?: (pumpId: string, durationMinutes: number) => void;
}

export default function AgronomicIrrigationCalculator({
  currentFarm,
  activeSoil,
  currentWeather,
  onPumpActivated
}: AgronomicCalculatorProps) {
  // Calculation parameters state
  const [farmArea, setFarmArea] = useState<number>(currentFarm.areaFeddans || currentFarm.size || 5);
  const [cropType, setCropType] = useState<string>(currentFarm.cropType || currentFarm.crops?.[0] || "القمح");
  const [growthStage, setGrowthStage] = useState<string>(currentFarm.growthStage || "mid");
  const [soilType, setSoilType] = useState<string>(currentFarm.soilType || "clay");
  const [irrigationMethod, setIrrigationMethod] = useState<string>(currentFarm.irrigationMethod || "drip");
  const [soilMoisture, setSoilMoisture] = useState<number>(activeSoil?.moisture ?? 65);
  
  const [tempC, setTempC] = useState<number>(currentWeather?.tempMax ?? 28);
  const [humidity, setHumidity] = useState<number>(currentWeather?.humidity ?? 45);
  const [windSpeed, setWindSpeed] = useState<number>(currentWeather?.windSpeed ?? 14);
  const [rainForecast, setRainForecast] = useState<number>(0);

  // Result state
  const [loading, setLoading] = useState(false);
  const [decisionResult, setDecisionResult] = useState<any | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [pumpSuccess, setPumpSuccess] = useState<string | null>(null);

  // Sync inputs from live sensor & weather
  const syncWithLiveSensors = () => {
    if (activeSoil) {
      setSoilMoisture(activeSoil.moisture);
    }
    if (currentWeather) {
      setTempC(currentWeather.tempMax);
      setHumidity(currentWeather.humidity);
      setWindSpeed(currentWeather.windSpeed);
    }
  };

  // Run Calculation
  const handleCalculate = async () => {
    setLoading(true);
    setDecisionResult(null);
    setAiExplanation(null);
    setPumpSuccess(null);

    try {
      const res = await apiCalculateIrrigation({
        farmId: currentFarm.id,
        farmAreaFeddans: Number(farmArea),
        cropType,
        growthStage,
        soilType,
        irrigationMethod,
        currentSoilMoisturePct: Number(soilMoisture),
        ambientTempC: Number(tempC),
        humidityPct: Number(humidity),
        windSpeedKmh: Number(windSpeed),
        rainForecastMm: Number(rainForecast)
      });

      if (res && res.decision) {
        setDecisionResult(res.decision);
        setAiExplanation(res.aiExplanation);
      }
    } catch (e: any) {
      console.error("Irrigation calculation error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Trigger Pump
  const handleActivatePump = async () => {
    if (!decisionResult) return;
    const durationMinutes = decisionResult.estimatedPumpRunHours ? Math.round(decisionResult.estimatedPumpRunHours * 60) : 45;
    const ok = await sendPhysicalPumpCommand("pump-1", "ON", durationMinutes);
    if (ok) {
      setPumpSuccess(`تم إرسال أمر التشغيل الفعلي لمضخة الحقل عبر إنترنت الأشياء لمدة ${durationMinutes} دقيقة!`);
      if (onPumpActivated) {
        onPumpActivated("pump-1", durationMinutes);
      }
      setTimeout(() => setPumpSuccess(null), 5000);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-base text-[#064E3B]">
              محرك حساب الاحتياجات المائية الحقيقي (معايير FAO-56 Penman-Monteith)
            </h3>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full">
              حسابات حتمية + ذكاء اصطناعي
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            يحسب البخر نتح المرجعي (ET₀) ومعامل المحصول (Kc) وحجم المياه الصافي والإجمالي بدقة وفق طبيعة التربة المصرية.
          </p>
        </div>

        <button
          type="button"
          onClick={syncWithLiveSensors}
          className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#064E3B] border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
          <span>تحديث بالبيانات الحية للحساس والطقس</span>
        </button>
      </div>

      {/* PARAMETERS INPUT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        
        {/* Crop Selection */}
        <div>
          <label className="block font-bold text-gray-700 mb-1">المحصول المستهدف:</label>
          <select
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="القمح">القمح (Wheat)</option>
            <option value="الذرة">الذرة الشامية (Maize)</option>
            <option value="البطاطس">البطاطس (Potatoes)</option>
            <option value="القطن">القطن المصري (Cotton)</option>
            <option value="الطماطم">الطماطم (Tomatoes)</option>
            <option value="قصب السكر">قصب السكر (Sugarcane)</option>
            <option value="الحمضيات">الموالح والحمضيات (Citrus)</option>
            <option value="النخيل">نخيل البلح (Date Palm)</option>
          </select>
        </div>

        {/* Growth Stage */}
        <div>
          <label className="block font-bold text-gray-700 mb-1">مرحلة النمو الحالية:</label>
          <select
            value={growthStage}
            onChange={(e) => setGrowthStage(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="initial">المرحلة الأولى: البادرة والتأسيس (Initial)</option>
            <option value="development">المرحلة الثانية: النمو الخضري والتفريع (Development)</option>
            <option value="mid">المرحلة الثالثة: الإزهار وتكوين الثمار (Mid-Season - أعلى استهلاك)</option>
            <option value="late">المرحلة الرابعة: النضج والاستواء (Late Season)</option>
          </select>
        </div>

        {/* Soil Type */}
        <div>
          <label className="block font-bold text-gray-700 mb-1">طبيعة التربة:</label>
          <select
            value={soilType}
            onChange={(e) => setSoilType(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="clay">طينية ثقيلة (دلتا ووادي النيل)</option>
            <option value="sandy">رملية مسامية (أراضي صحراوية واستصلاح)</option>
            <option value="loamy">طميية صفراء خصبة (سهول الفيوم والدلتا القديمة)</option>
            <option value="calcareous">جيرية كلسية (أراضي الساحل الشمالي والنوبارية)</option>
          </select>
        </div>

        {/* Irrigation Method */}
        <div>
          <label className="block font-bold text-gray-700 mb-1">نظام الري المتبع:</label>
          <select
            value={irrigationMethod}
            onChange={(e) => setIrrigationMethod(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="drip">ري بالتنقيط الموضعي (كفاءة 90%)</option>
            <option value="sprinkler">رش محوري Pivot (كفاءة 78%)</option>
            <option value="surface">غمر سطحي مطور (كفاءة 60%)</option>
          </select>
        </div>

        {/* Farm Area */}
        <div>
          <label className="block font-bold text-gray-700 mb-1">المساحة (بالفدان):</label>
          <input
            type="number"
            min={0.5}
            step={0.5}
            value={farmArea}
            onChange={(e) => setFarmArea(Number(e.target.value))}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
          />
        </div>

        {/* Soil Moisture */}
        <div>
          <label className="block font-bold text-gray-700 mb-1">رطوبة التربة الحالية (%):</label>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={100}
              value={soilMoisture}
              onChange={(e) => setSoilMoisture(Number(e.target.value))}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
          </div>
        </div>

        {/* Ambient Temperature */}
        <div>
          <label className="block font-bold text-gray-700 mb-1">درجة الحرارة العظمى (°م):</label>
          <input
            type="number"
            value={tempC}
            onChange={(e) => setTempC(Number(e.target.value))}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold"
          />
        </div>

        {/* Humidity */}
        <div>
          <label className="block font-bold text-gray-700 mb-1">الرطوبة الجوية النسبية (%):</label>
          <input
            type="number"
            min={10}
            max={100}
            value={humidity}
            onChange={(e) => setHumidity(Number(e.target.value))}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold"
          />
        </div>
      </div>

      {/* CALCULATE ACTION BUTTON */}
      <div>
        <button
          type="button"
          onClick={handleCalculate}
          disabled={loading}
          className="w-full py-3.5 bg-[#064E3B] hover:bg-[#059669] text-white font-extrabold rounded-2xl transition-all shadow-md shadow-emerald-950/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>جاري حل معادلة Penman-Monteith واستشارة المرشد الذكي...</span>
            </>
          ) : (
            <>
              <Gauge className="w-4 h-4 text-[#F59E0B]" />
              <span>تشغيل المحرك الحسابي واستخراج التوصية الدقيقة</span>
            </>
          )}
        </button>
      </div>

      {/* PUMP ACTIVATION FEEDBACK */}
      {pumpSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">{pumpSuccess}</span>
        </div>
      )}

      {/* RESULTS DISPLAY SECTION */}
      {decisionResult && (
        <div className="bg-slate-50 border border-gray-200 rounded-2xl p-5 space-y-5">
          
          {/* Main Decision Banner */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            decisionResult.irrigationNeeded 
              ? "bg-amber-50/90 border-amber-300 text-amber-950" 
              : "bg-emerald-50/90 border-emerald-300 text-emerald-950"
          }`}>
            <div className="flex items-start gap-3">
              {decisionResult.irrigationNeeded ? (
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="text-[11px] font-bold opacity-80">القرار الميداني الحتمي:</span>
                <h4 className="text-base font-extrabold mt-0.5">
                  {decisionResult.irrigationNeeded 
                    ? `مطلوب الري فوراً (${decisionResult.urgency === "immediate" ? "عاجل" : "معتاد"})` 
                    : "الأرض لا تحتاج للري اليوم (الرطوبة كافية)"}
                </h4>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  {decisionResult.deterministicReasoningAr}
                </p>
              </div>
            </div>

            {decisionResult.irrigationNeeded && (
              <button
                type="button"
                onClick={handleActivatePump}
                className="py-2.5 px-4 bg-[#064E3B] hover:bg-emerald-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>تشغيل المضخة ({decisionResult.estimatedPumpRunHours?.toFixed(1) || 1} ساعة)</span>
              </button>
            )}
          </div>

          {/* METRIC CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            
            <div className="bg-white p-3 rounded-xl border border-gray-150">
              <span className="text-[10px] text-gray-500 block">البخر نتح المرجعي (ET₀):</span>
              <strong className="text-sm text-[#064E3B] font-mono block mt-1">
                {decisionResult.et0MmDay} ملم/يوم
              </strong>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-150">
              <span className="text-[10px] text-gray-500 block">استهلاك المحصول (ETc):</span>
              <strong className="text-sm text-blue-700 font-mono block mt-1">
                {decisionResult.etcMmDay} ملم/يوم (Kc: {decisionResult.cropCoefficientKc})
              </strong>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-150">
              <span className="text-[10px] text-gray-500 block">حجم المياه الإجمالي المطلوبة:</span>
              <strong className="text-sm text-emerald-700 font-mono block mt-1">
                {decisionResult.grossWaterVolumeM3} م³ ({decisionResult.grossWaterVolumeLiters?.toLocaleString()} لتر)
              </strong>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-150">
              <span className="text-[10px] text-gray-500 block">التوقيت الزراعي الأمثل:</span>
              <strong className="text-xs text-amber-700 font-bold block mt-1">
                {decisionResult.recommendedTimingAr}
              </strong>
            </div>
          </div>

          {/* AI EXPLANATION (GEMINI FLASH) */}
          {aiExplanation && (
            <div className="bg-gradient-to-l from-emerald-50 via-white to-green-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#064E3B]">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                <span>إرشاد وتوضيح المهندس إبراهيم الزراعي (الذكاء الاصطناعي):</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line font-medium">
                {aiExplanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
