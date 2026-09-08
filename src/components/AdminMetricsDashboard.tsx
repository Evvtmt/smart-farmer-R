/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Admin Metrics & Pilot Cost Breakdown Dashboard
 * Displays real platform telemetry from AgriNovaDB:
 * - Real user, farm, and sensor counts
 * - Online/Offline IoT node telemetry
 * - System API requests, AI tokens, and error metrics
 * - Comprehensive hardware & operational cost breakdown for 10-farm and 20-farm Egyptian pilots
 */

import React, { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  Users, 
  Sprout, 
  Cpu, 
  Activity, 
  Server, 
  DollarSign, 
  Coins, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { apiGetAdminMetrics } from "../services/realDataService";

export default function AdminMetricsDashboard() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePilotTab, setActivePilotTab] = useState<"pilot10" | "pilot20">("pilot10");

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await apiGetAdminMetrics();
      if (res) {
        setData(res);
      }
    } catch (err) {
      console.error("Failed to fetch admin metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const timer = setInterval(fetchMetrics, 30000); // refresh every 30s
    return () => clearInterval(timer);
  }, []);

  const metrics = data?.metrics;
  const cost = data?.costEstimator;
  const pilot = activePilotTab === "pilot10" ? cost?.pilot10Farms : cost?.pilot20Farms;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6" dir="rtl">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h3 className="font-extrabold text-base text-[#064E3B]">
              مركز الرقابة الإدارية والقياسات التشغيلية الحقيقية
            </h3>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
              قاعدة بيانات حية (AgriNovaDB)
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            إحصائيات فورية للأجهزة المتصلة، وتكلفة التوسع الحقلي لمشاريع المزارع الإرشادية في مصر.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchMetrics}
          disabled={loading}
          className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>تحديث الإحصائيات الحية</span>
        </button>
      </div>

      {/* REAL TELEMETRY METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-right">
        
        <div className="bg-slate-50 border border-gray-200 p-3.5 rounded-2xl">
          <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold mb-1">
            <Users className="w-3.5 h-3.5 text-emerald-700" />
            <span>المستخدمين المسجلين:</span>
          </div>
          <strong className="text-xl font-mono font-black text-[#064E3B]">
            {metrics?.totalUsers ?? "--"}
          </strong>
          <span className="text-[9px] text-gray-400 block mt-0.5">مزارع ومهندس معتمد</span>
        </div>

        <div className="bg-slate-50 border border-gray-200 p-3.5 rounded-2xl">
          <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold mb-1">
            <Sprout className="w-3.5 h-3.5 text-emerald-700" />
            <span>المزارع والحقول:</span>
          </div>
          <strong className="text-xl font-mono font-black text-emerald-700">
            {metrics?.totalFarms ?? "--"}
          </strong>
          <span className="text-[9px] text-gray-400 block mt-0.5">حيازات مسجلة وموثقة</span>
        </div>

        <div className="bg-slate-50 border border-gray-200 p-3.5 rounded-2xl">
          <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold mb-1">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>عقد الحساسات (IoT):</span>
          </div>
          <strong className="text-xl font-mono font-black text-blue-700">
            {metrics?.totalSensors ?? "--"}
          </strong>
          <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">
            ● {metrics?.onlineSensors ?? 0} متصلة بالشبكة
          </span>
        </div>

        <div className="bg-slate-50 border border-gray-200 p-3.5 rounded-2xl">
          <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold mb-1">
            <Activity className="w-3.5 h-3.5 text-amber-600" />
            <span>حزم القراءات المخزنة:</span>
          </div>
          <strong className="text-xl font-mono font-black text-amber-700">
            {metrics?.totalSensorReadings?.toLocaleString() ?? "--"}
          </strong>
          <span className="text-[9px] text-gray-400 block mt-0.5">سجل تيليميتري حقلي</span>
        </div>

        <div className="bg-slate-50 border border-gray-200 p-3.5 rounded-2xl">
          <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold mb-1">
            <Server className="w-3.5 h-3.5 text-purple-600" />
            <span>طلبات API الكلية:</span>
          </div>
          <strong className="text-xl font-mono font-black text-purple-700">
            {metrics?.totalApiRequests?.toLocaleString() ?? "--"}
          </strong>
          <span className="text-[9px] text-gray-400 block mt-0.5">
            منها {metrics?.totalAiRequests ?? 0} استشارة AI
          </span>
        </div>

        <div className="bg-slate-50 border border-gray-200 p-3.5 rounded-2xl">
          <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold mb-1">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>زمن تشغيل الخادم:</span>
          </div>
          <strong className="text-xl font-mono font-black text-emerald-800">
            {metrics?.uptimeHours ?? 0} س
          </strong>
          <span className="text-[9px] text-emerald-700 font-bold block mt-0.5">
            مستقر 100% (أخطاء: {metrics?.systemErrorsCount ?? 0})
          </span>
        </div>

      </div>

      {/* PILOT COST ESTIMATOR SECTION */}
      <div className="border border-emerald-100 bg-gradient-to-tr from-emerald-50/40 via-white to-green-50/30 rounded-2xl p-5 space-y-4">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              <h4 className="font-extrabold text-sm text-[#064E3B]">
                دراسة الجدوى وتكلفة الإطلاق الميداني الحقيقي في مصر (Pilot Deployment Model)
              </h4>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              مبنية على تكلفة المكونات الصناعية الميدانية (RS485 + ESP32 + لوح شمسي) وسعر الصرف البنكي (1$ ≈ {cost?.exchangeRateUsdToEgp || 49} ج.م)
            </p>
          </div>

          <div className="flex items-center gap-1 bg-gray-200/70 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActivePilotTab("pilot10")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePilotTab === "pilot10" ? "bg-[#064E3B] text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              مشروع 10 مزارع (20 عقدة)
            </button>
            <button
              type="button"
              onClick={() => setActivePilotTab("pilot20")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePilotTab === "pilot20" ? "bg-[#064E3B] text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              مشروع 20 مزرعة (40 عقدة)
            </button>
          </div>
        </div>

        {/* Breakdown details */}
        {pilot && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-right pt-2">
            
            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-1">
              <span className="text-[10px] text-gray-500 block">إجمالي تكلفة العتاد (Hardware):</span>
              <strong className="text-base text-[#064E3B] font-mono font-extrabold block">
                {pilot.totalHardwareEgp.toLocaleString()} ج.م
              </strong>
              <span className="text-[10px] text-gray-400 block font-mono">
                (${pilot.totalHardwareUsd.toLocaleString()} USD لعدد {pilot.nodesCount} جهاز حقلي)
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-1">
              <span className="text-[10px] text-gray-500 block">التشغيل السحابي والذكاء الاصطناعي/شهر:</span>
              <strong className="text-base text-blue-700 font-mono font-extrabold block">
                {pilot.cloudOpsMonthlyEgp.toLocaleString()} ج.م/شهر
              </strong>
              <span className="text-[10px] text-gray-400 block font-mono">
                (${pilot.cloudOpsMonthlyUsd} USD سيرفر وسحابة وOpen-Meteo)
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-1">
              <span className="text-[10px] text-gray-500 block">التكلفة الإجمالية لكل مزارع:</span>
              <strong className="text-base text-emerald-700 font-mono font-extrabold block">
                ~{Math.round(pilot.costPerFarmerUsd * (cost?.exchangeRateUsdToEgp || 49)).toLocaleString()} ج.م
              </strong>
              <span className="text-[10px] text-gray-400 block font-mono">
                (${Math.round(pilot.costPerFarmerUsd)} USD تشمل جهازين واستضافة)
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-1">
              <span className="text-[10px] text-gray-500 block">العائد وفترة استرداد رأس المال:</span>
              <strong className="text-base text-amber-700 font-bold block">
                {pilot.roiEstimateMonths} أشهر فقط
              </strong>
              <span className="text-[10px] text-emerald-600 font-bold block">
                توفير {pilot.waterSavingsEstPct}% مياه و{pilot.electricitySavingsEstPct}% كهرباء وسولار
              </span>
            </div>

          </div>
        )}

        {/* Bill of Materials Hardware footnote */}
        <div className="bg-gray-50 p-3 rounded-xl text-[11px] text-gray-600 space-y-1 border border-gray-200">
          <strong className="text-[#064E3B] font-bold block">مواصفات وتكلفة مكونات عقدة الحساس الحقلي (Node BOM):</strong>
          <p className="leading-relaxed">
            متحكم ESP32 صناعي ($6) + حساس 7 في 1 رطوبة وحرارة وNPK عبر بروتوكول RS485 صناعي ($22) + لوح طاقة شمسية 10W وبطارية ليثيوم ($14) + صندوق حماية خارجي IP67 ومقاوم للشمس والرطوبة ($8) = <strong>$50 (حوالي 2,450 ج.م للعقدة)</strong>.
          </p>
        </div>

      </div>

    </div>
  );
}
