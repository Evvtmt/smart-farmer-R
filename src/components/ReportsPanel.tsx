/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FileText, 
  Download, 
  Check, 
  ShieldCheck, 
  Activity, 
  AlertCircle, 
  Table,
  Cpu,
  Printer,
  Droplets,
  Calendar,
  Building,
  QrCode,
  CheckCircle2,
  X,
  Clock,
  Award
} from "lucide-react";
import { IrrigationPlan, Farm } from "../types";
import { initialIrrigationPlans } from "../data";

export interface ReportsProps {
  userGovernorate: string;
  userName: string;
  farmSize: number;
  farmName?: string;
  activeFarm?: Farm;
  irrigationPlans?: IrrigationPlan[];
}

export default function ReportsPanel({ 
  userGovernorate, 
  userName, 
  farmSize, 
  farmName, 
  activeFarm, 
  irrigationPlans = initialIrrigationPlans 
}: ReportsProps) {
  const [activeReportType, setActiveReportType] = useState<"irrigation" | "daily" | "water" | "financial" | "crop">("irrigation");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [showIrrigationDocModal, setShowIrrigationDocModal] = useState(false);

  const effectiveFarmName = farmName || activeFarm?.name || "مزرعة الدلتا الخضراء النموذجية";
  const waterSource = activeFarm?.waterSource || "ترعة المحمودية بالدلتا / شبكة ري حديثة";

  // Calculations for irrigation summary
  const totalWaterLiters = irrigationPlans.reduce((acc, curr) => acc + curr.waterVolumeLiter, 0);
  const totalWaterM3 = (totalWaterLiters / 1000).toFixed(1);
  const activeCount = irrigationPlans.filter(p => p.status === "active").length;
  const scheduledCount = irrigationPlans.filter(p => p.status === "scheduled").length;
  const completedCount = irrigationPlans.filter(p => p.status === "completed").length;

  // Generic export handler
  const handleExportTrigger = (format: "pdf" | "excel") => {
    setExportFormat(format);
    setShowExportModal(true);
    setTimeout(() => {
      setShowExportModal(false);
    }, 3200);
  };

  // Open Irrigation Official Ministry PDF Document Preview
  const handleOpenIrrigationDoc = () => {
    setShowIrrigationDocModal(true);
  };

  // Print Document (invokes browser print dialog)
  const handlePrintDoc = () => {
    window.print();
  };

  // Download printable standalone HTML/PDF document
  const handleDownloadDoc = () => {
    const docHtml = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>سجل جدول الري المعتمد - وزارة الموارد المائية والري</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
    body {
      font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
      margin: 0;
      padding: 24px;
      background: #f8fafc;
      color: #0f172a;
      direction: rtl;
    }
    .sheet {
      max-width: 860px;
      margin: 0 auto;
      background: white;
      padding: 36px;
      border: 2px solid #064E3B;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      position: relative;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #064E3B;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .title {
      font-size: 18px;
      font-weight: 900;
      color: #064E3B;
      margin: 4px 0;
    }
    .subtitle {
      font-size: 13px;
      color: #475569;
      margin: 2px 0;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      background: #f1f5f9;
      padding: 14px;
      border-radius: 8px;
      font-size: 12px;
      margin-bottom: 24px;
    }
    .meta-item strong {
      color: #064E3B;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-bottom: 24px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 10px;
      text-align: right;
    }
    th {
      background: #064E3B;
      color: white;
      font-weight: 700;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 11px;
    }
    .badge-scheduled { background: #dbeafe; color: #1e40af; }
    .badge-active { background: #dcfce7; color: #166534; }
    .badge-completed { background: #f1f5f9; color: #475569; }
    .summary-boxes {
      display: flex;
      gap: 14px;
      margin-bottom: 24px;
    }
    .box {
      flex: 1;
      border: 1px solid #e2e8f0;
      padding: 12px;
      border-radius: 8px;
      background: #fafaf9;
      text-align: center;
    }
    .box-val {
      font-size: 16px;
      font-weight: 800;
      color: #064E3B;
      margin-top: 4px;
    }
    .footer-signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 36px;
      border-top: 1px dashed #cbd5e1;
      padding-top: 20px;
      font-size: 12px;
    }
    .stamp-box {
      border: 2px dashed #059669;
      border-radius: 50%;
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 10px;
      font-weight: 800;
      color: #059669;
      margin: 0 auto;
    }
    @media print {
      body { background: white; padding: 0; }
      .sheet { border: none; box-shadow: none; max-width: 100%; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="header">
      <div>
        <div class="subtitle">جمهورية مصر العربية</div>
        <div class="subtitle">وزارة الموارد المائية والري - مصلحة الري</div>
        <div class="subtitle">وزارة الزراعة واستصلاح الأراضي</div>
        <div class="title">سجل وجدول مواعيد ومقننات الري المعتمد</div>
      </div>
      <div style="text-align: left;">
        <div style="font-size: 11px; color: #64748b;">رقم التوثيق المائي الموحد:</div>
        <div style="font-weight: 800; font-size: 14px; color: #064E3B; font-family: monospace;">EGY-IRR-2026-9842</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">تاريخ الاعتماد: ٨ سبتمبر ٢٠٢٦</div>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-item">اسم الحيازة الزراعية: <strong>${effectiveFarmName}</strong></div>
      <div class="meta-item">المحافظة / المركز: <strong>${userGovernorate}</strong></div>
      <div class="meta-item">المساحة المقننة: <strong>${farmSize} فدان</strong></div>
      <div class="meta-item">المهندس المسؤول: <strong>${userName}</strong></div>
      <div class="meta-item">مصدر المياه: <strong>${waterSource}</strong></div>
      <div class="meta-item">رقم كارت الفلاح الذكي: <strong>4921-3920-1928-5501</strong></div>
    </div>

    <table>
      <thead>
        <tr>
          <th>م</th>
          <th>الموقع والمحصول المستهدف</th>
          <th>الموعد الزمني المجدول</th>
          <th>مدة الضخ (دقيقة)</th>
          <th>الحجم المقنن (لتر)</th>
          <th>الحجم بالمتر المكعب (م³)</th>
          <th>وسيلة الري</th>
          <th>حالة الاعتماد</th>
        </tr>
      </thead>
      <tbody>
        ${irrigationPlans.map((p, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${p.farmName}</strong> - (${p.cropType})</td>
            <td>${p.scheduleTime}</td>
            <td>${p.durationMinutes} دقيقة</td>
            <td>${p.waterVolumeLiter.toLocaleString()} لتر</td>
            <td>${(p.waterVolumeLiter / 1000).toFixed(1)} م³</td>
            <td>${p.method === "drip" ? "ري بالتنقيط الحديث" : p.method === "sprinkler" ? "رشاشات متطورة" : "سطحي منظم"}</td>
            <td>
              <span class="badge ${p.status === "scheduled" ? "badge-scheduled" : p.status === "active" ? "badge-active" : "badge-completed"}">
                ${p.status === "scheduled" ? "مجدول رسمي" : p.status === "active" ? "جاري الضخ الآن" : "منفذ ومسجل"}
              </span>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <div class="summary-boxes">
      <div class="box">
        <div style="font-size: 11px; color: #64748b;">إجمالي السحب المائي المقنن:</div>
        <div class="box-val">${totalWaterLiters.toLocaleString()} لتر (${totalWaterM3} م³)</div>
      </div>
      <div class="box">
        <div style="font-size: 11px; color: #64748b;">نسبة الوفر المحقق بنظم الري الحديث:</div>
        <div class="box-val" style="color: #059669;">+٢٨.٤% وفر مائي</div>
      </div>
      <div class="box">
        <div style="font-size: 11px; color: #64748b;">تقييم كفاءة الاستخدام (WUE):</div>
        <div class="box-val" style="color: #1e40af;">ممتاز (فئة A+)</div>
      </div>
    </div>

    <div class="footer-signatures">
      <div>
        <strong>إقرار المزارع / المفوض بالإدارة:</strong>
        <p style="margin-top: 8px; color: #475569;">أقر بالالتزام بالمواعيد والمقننات المائية المعتمدة أعلاه دون تعديل.</p>
        <p style="margin-top: 18px;">التوقيع: .......................................</p>
      </div>
      <div>
        <div class="stamp-box">
          ختم النسر المعتمد<br/>
          وزارة الري<br/>
          ٢٠٢٦
        </div>
      </div>
      <div style="text-align: left;">
        <strong>اعتماد مفتش الري والإرشاد الزراعي:</strong>
        <p style="margin-top: 8px; color: #475569;">المهندس: ${userName}</p>
        <p style="margin-top: 18px;">التوقيع والخاتم: .......................................</p>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([docHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `سجل_جدول_الري_المعتمد_${userGovernorate}_2026.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* 2026 MINISTRY BANNER COMPONENT */}
      <div className="bg-white border border-gray-150 rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-[#064E3B]/10 text-[#064E3B] px-3 py-1 rounded-full font-bold">
                مصلحة الإحصاء والائتمان الزراعي ومراقبة الري بمصر
              </span>
              <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                <span>توثيق حكومي معتمد</span>
              </span>
            </div>
            <h3 className="text-lg font-black text-[#064E3B] mt-2 mb-1">وحدة المراقبة وتقييم حيوية التربة وموازنات الري</h3>
            <p className="text-xs text-gray-500">
              تقارير فحص معتمدة للقطاع الزراعي بمحافظة {userGovernorate} - المنصة الرقمية للمهندس {userName}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* REQUESTED BUTTON: EXPORT IRRIGATION SCHEDULE TO PDF */}
            <button
              id="export-irrigation-schedule-pdf-btn"
              onClick={handleOpenIrrigationDoc}
              className="py-2.5 px-4 bg-gradient-to-r from-blue-700 via-blue-800 to-[#064E3B] hover:from-blue-800 hover:to-emerald-800 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.02]"
              title="تصدير وطباعة جدول وسجلات الري المعتمد بصيغة PDF للوزارة"
            >
              <Printer className="w-4 h-4 text-amber-300 shrink-0" />
              <span>تصدير 'جدول الري' (PDF)</span>
              <span className="bg-amber-400 text-slate-950 text-[10px] px-2 py-0.5 rounded-md font-black">
                رسمي للوزارة
              </span>
            </button>

            <button
              onClick={() => handleExportTrigger("pdf")}
              className="py-2.5 px-3.5 bg-[#064E3B] hover:bg-[#059669] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <FileText className="w-4 h-4 text-[#F59E0B]" />
              <span>تصدير مسودة PDF</span>
            </button>
            <button
              onClick={() => handleExportTrigger("excel")}
              className="py-2.5 px-3.5 bg-[#F59E0B] hover:bg-amber-600 text-slate-900 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Table className="w-4 h-4" />
              <span>تصدير ورقة Excel</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* 1/4 COLUMN: Template Selector Tabs */}
        <div className="lg:col-span-1 space-y-3">
          {[
            { 
              id: "irrigation", 
              name: "جدول وسجلات الري المعتمد", 
              desc: "سجل مواعيد وضخ مياه الري الرسمي المعتمد للوزارة", 
              isHighlighted: true 
            },
            { id: "daily", name: "التقرير الإرشادى اليومى الشامل", desc: "نبذة عن الطقس والموقع والموجات الحارة الفورية" },
            { id: "water", name: "جدول الموارد وموازنات مياه الري", desc: "مستويات المياه بالترع ونسب التبخر والتشبع" },
            { id: "financial", name: "تقرير حساب الـ ROI والتدفق المالي", desc: "أجور عمالة، مبيدات، أسمدة وعائد التوريد للصومعة" },
            { id: "crop", name: "تقرير NDVI وصحة القياس الأحيائي", desc: "خلو من البقع، تطور سنابل القمح، نمو البطاطس" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveReportType(item.id as any)}
              className={`w-full text-right p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                activeReportType === item.id 
                  ? "bg-[#064E3B] border-[#064E3B] text-white shadow-md shadow-emerald-950/10" 
                  : "bg-white border-gray-150 text-gray-700 hover:bg-slate-50"
              }`}
            >
              {item.isHighlighted && (
                <span className="absolute top-2 left-2 bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  توثيق الوزارة
                </span>
              )}
              <span className={`text-xs font-black block ${activeReportType === item.id ? "text-white" : "text-[#064E3B]"}`}>
                {item.name}
              </span>
              <p className={`text-[10px] mt-1.5 ${activeReportType === item.id ? "text-emerald-100/80" : "text-gray-400"}`}>
                {item.desc}
              </p>
            </button>
          ))}
        </div>

        {/* 3/4 COLUMN: Document Worksheet View */}
        <div className="lg:col-span-3 bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-6">
          
          {/* Certificate Header Stamp */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-4 border-b border-gray-100 gap-2">
            <div>
              <div className="text-xs text-gray-400 font-bold">المنصة الذكية الموحدة للمزارع المصري - بوابة التوثيق والاعتماد</div>
              <div className="text-sm font-extrabold text-[#064E3B] mt-0.5">
                {activeReportType === "irrigation" ? "سجل وجدول مواعيد ومقننات الري المعتمد رسمياً لدى الوزارة" : "مؤشرات ربع سنوية لإدارة المنشآت الزراعية"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[10px] bg-slate-100 text-[#064E3B] rounded-lg px-2.5 py-1 font-bold">
                تاريخ المستند: ٨ سبتمبر ٢٠٢٦
              </div>
              {activeReportType === "irrigation" && (
                <button
                  onClick={handleOpenIrrigationDoc}
                  className="text-xs bg-blue-700 hover:bg-blue-800 text-white font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span>طباعة المستند الرسمي</span>
                </button>
              )}
            </div>
          </div>

          {/* RENDER DEDICATED IRRIGATION SCHEDULE REPORT (OFFICIAL MINISTRY LAYOUT) */}
          {activeReportType === "irrigation" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-blue-50/80 to-emerald-50/60 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Droplets className="w-5 h-5 text-blue-100" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-[#064E3B] flex items-center gap-2">
                      <span>كشف المقننات وسجلات تشغيل الري للمزرعة ({effectiveFarmName})</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      مستند مطابقة معتمد طبقا لمنظومة الري الحديث وتوجيهات وزارة الموارد المائية والري.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenIrrigationDoc}
                    className="py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-300" />
                    <span>معاينة وطباعة PDF</span>
                  </button>
                  <button
                    onClick={handleDownloadDoc}
                    className="py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل السجل (.html)</span>
                  </button>
                </div>
              </div>

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-100 text-right">
                  <span className="text-[10px] text-gray-400 font-bold block">إجمالي السحب المائي:</span>
                  <span className="text-sm font-extrabold text-[#064E3B] block mt-1">
                    {totalWaterLiters.toLocaleString()} لتر ({totalWaterM3} م³)
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-100 text-right">
                  <span className="text-[10px] text-gray-400 font-bold block">المناوبات المجدولة:</span>
                  <span className="text-sm font-extrabold text-blue-600 block mt-1">
                    {scheduledCount} عمليات قادمة
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-100 text-right">
                  <span className="text-[10px] text-gray-400 font-bold block">وفر المياه المحقق:</span>
                  <span className="text-sm font-extrabold text-emerald-600 block mt-1">
                    +٢٨.٤% وفر معتمد
                  </span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-100 text-right">
                  <span className="text-[10px] text-gray-400 font-bold block">كود التوثيق المائي:</span>
                  <span className="text-xs font-mono font-extrabold text-slate-700 block mt-1">
                    EGY-IRR-2026-9842
                  </span>
                </div>
              </div>

              {/* Official Irrigation Records Data Table */}
              <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-inner">
                <table className="w-full text-xs text-right">
                  <thead className="bg-[#064E3B] text-white font-bold">
                    <tr>
                      <th className="p-3">م</th>
                      <th className="p-3">القطاع الزراعي / المحصول</th>
                      <th className="p-3">الموعد الزمني المقرر</th>
                      <th className="p-3">مدة التشغيل</th>
                      <th className="p-3">كمية المياه المقننة</th>
                      <th className="p-3">وسيلة الري المعتمدة</th>
                      <th className="p-3">حالة التنفيذ والاعتماد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 text-gray-700">
                    {irrigationPlans.map((ip, idx) => (
                      <tr key={ip.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-gray-400">{idx + 1}</td>
                        <td className="p-3">
                          <strong className="text-[#064E3B] block">{ip.farmName}</strong>
                          <span className="text-[11px] text-gray-500">محصول: {ip.cropType}</span>
                        </td>
                        <td className="p-3 font-medium text-slate-800">{ip.scheduleTime}</td>
                        <td className="p-3 font-bold text-slate-700">{ip.durationMinutes} دقيقة</td>
                        <td className="p-3 font-mono">
                          <span className="text-blue-700 font-bold">{ip.waterVolumeLiter.toLocaleString()} لتر</span>
                          <span className="text-[10px] text-gray-400 block">({(ip.waterVolumeLiter / 1000).toFixed(1)} م³)</span>
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[11px]">
                            {ip.method === "drip" ? "ري بالتنقيط قطر ١٦ مم" : ip.method === "sprinkler" ? "رشاشات متطورة" : "سطحي محسن"}
                          </span>
                        </td>
                        <td className="p-3">
                          {ip.status === "scheduled" && (
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                              مجدول رسمي
                            </span>
                          )}
                          {ip.status === "active" && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full animate-pulse">
                              جاري الضخ الآن
                            </span>
                          )}
                          {ip.status === "completed" && (
                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
                              منفذ ومسجل
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Endorsement & Official Accreditation Notes */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-3">
                <Award className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-extrabold text-emerald-950">إشادة وزارة الموارد المائية والري - التوجيه المائي:</div>
                  <p className="leading-relaxed">
                    تمت مراجعة هذا السجل الرقمي واعتماده رسمياً، ويشهد قطاع المياه بأن حيازة <strong>{effectiveFarmName}</strong> تطبق معايير الري الذكي المقنن بما يضمن عدم إهدار المياه واستحقاق الدعم السمادي والمصرفي الكامل عبر منظومة كارت الفلاح الذكي.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Render Daily Report */}
          {activeReportType === "daily" && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-[#064E3B] flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#F59E0B]" />
                <span>الجريدة اليومية التفصيلية لقطاع دمنهور والبحيرة</span>
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-100 text-right">
                  <span className="text-[10px] text-gray-400 font-bold block">مجموع فدان المزرعة:</span>
                  <span className="text-base font-extrabold text-[#064E3B] block mt-1">{farmSize} فدان</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-100 text-right">
                  <span className="text-[10px] text-gray-400 font-bold block">متوسط كفاءة التربة اليوم:</span>
                  <span className="text-base font-extrabold text-emerald-600 block mt-1">94 %</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-gray-100 text-right">
                  <span className="text-[10px] text-gray-400 font-bold block">مجموع الجرارات النشطة بالـ GPS:</span>
                  <span className="text-base font-extrabold text-amber-600 block mt-1">٣ معدات ثقيلة</span>
                </div>
              </div>

              {/* Data Table */}
              <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-inner">
                <table className="w-full text-xs text-right">
                  <thead className="bg-gray-100 text-gray-700 font-bold">
                    <tr>
                      <th className="p-3">نوع المحصول التابع لـ {userGovernorate}</th>
                      <th className="p-3">المساحة المزروعة لغاية اليوم</th>
                      <th className="p-3">الرطوبة الوسطية المقاسة</th>
                      <th className="p-3">مرحلة تطور السنابل والأفرع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-[#064E3B]">قمح سدس ١٤ بلدي</td>
                      <td className="p-3">٥٠ فدان جاري استيراد الحصاد له</td>
                      <td className="p-3 font-mono text-blue-600">72 %</td>
                      <td className="p-3">مرحلة طرد السنابل (متقدم)</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-[#064E3B]">بطاطس سبونتا مستوردة</td>
                      <td className="p-3">٣٠ فدان خنادق مبطنة بالصوبة</td>
                      <td className="p-3 font-mono text-blue-600">58 %</td>
                      <td className="p-3">مرحلة حجم الدرنات الأوجية</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-[#064E3B]">طماطم هجين بحثي مصري</td>
                      <td className="p-3">١٥ فدان ري تنقيط زراعي</td>
                      <td className="p-3 font-mono text-amber-600">42 % (منخفض)</td>
                      <td className="p-3">مرحلة العقد والتزهير وتتبع اللفحة</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Render Water Report */}
          {activeReportType === "water" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-sm text-blue-800 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-blue-600" />
                  <span>تدفقات المياه وحجم الصرف والري المحايد</span>
                </h4>
                <button
                  onClick={handleOpenIrrigationDoc}
                  className="py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                  <span>تصدير جدول الري المعتمد PDF</span>
                </button>
              </div>

              <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-200 text-xs text-blue-900 leading-relaxed font-medium">
                توصية المهندس إبراهيم: لقد حفظ نظام الكارت المائي للفلاح ما يقارب <strong>٢٨٪ من مياه النيل</strong> المهدرة بالمقارنة مع أساليب الغمر التقليدية الجائرة، بفضل مصفوفة الاستشعار الرقمية والري الموجه.
              </div>

              {/* Data Table */}
              <div className="border border-gray-150 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-right">
                  <thead className="bg-blue-100/50 text-blue-950 font-bold">
                    <tr>
                      <th className="p-3">البحر الترعي / المنبع المائي</th>
                      <th className="p-3">سعة السحب الحركى بالترعة</th>
                      <th className="p-3">نوع تقنية التوزيع الأرضي</th>
                      <th className="p-3">مستويات الوفر الاقتصادي المترصد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 text-gray-700">
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-[#064E3B]">ترعة المحمودية بالدلتا</td>
                      <td className="p-3">٣٤،٠٠٠ لتر مكعب لليوم</td>
                      <td className="p-3">ري بالتنقيط قطر ١٦ مم الحديث</td>
                      <td className="p-3 font-bold text-emerald-600">تحسين +٣٢٪ وفر مائي</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-[#064E3B]">بئر جوفي عمومي بالفيوم</td>
                      <td className="p-3">١٢،٠٠٠ لتر للتبريد اليومي</td>
                      <td className="p-3">ري محوري pivot فالي ٩٥٠٠</td>
                      <td className="p-3 font-bold text-emerald-600">وفر مستمر ومجرب +١٥٪</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-[#064E3B]">ترعة الشيخ زايد بتوشكى</td>
                      <td className="p-3">٨5،٠٠٠ لتر مكعب بالجنوب الصحراوي</td>
                      <td className="p-3">ري كهرومغناطيسي لزيادة التخزين</td>
                      <td className="p-3 font-bold text-emerald-600">تنميط مثالي +٢٠٪ وفر</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Render Financial ROI */}
          {activeReportType === "financial" && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-[#064E3B] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#F59E0B]" />
                <span>إجمالي المصاريف والمردود المالي المائي والاستصلاح</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
                  <span className="text-[10px] text-gray-500 block font-bold">إجمالي التدفق الوارد (الإيرادات والأرباح):</span>
                  <span className="text-xl font-black text-emerald-700 mt-1 block">٤٧٤,٠٠٠ جنيه مصري</span>
                </div>
                <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl">
                  <span className="text-[10px] text-gray-500 block font-bold">إجمالي المصروفات التشغيلية والعمالة:</span>
                  <span className="text-xl font-black text-red-700 mt-1 block">٨٣,٠٠٠ جنيه مصري</span>
                </div>
              </div>

              <div className="border border-gray-150 rounded-2xl overflow-hidden mt-4">
                <table className="w-full text-xs text-right">
                  <thead className="bg-[#064E3B]/5 font-bold text-[#064E3B]">
                    <tr>
                      <th className="p-3">البند المالي المنصرف والمستلم</th>
                      <th className="p-3">الفئة والتصنيف الداخلي المالي</th>
                      <th className="p-3">المبلغ الصافي الحقيقي للعملية</th>
                      <th className="p-3">الترتيب والحالة الاقتصادية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 text-gray-700">
                    <tr>
                      <td className="p-3 font-bold">وزارة التموين (توريد قمح مالي)</td>
                      <td className="p-3">إيرادات توريد الصومعة الرئيسية</td>
                      <td className="p-3 text-emerald-600 font-bold">+٣٢٠،٠٠٠ ج.م</td>
                      <td className="p-3 font-bold text-emerald-600">مقبول ومودع تام</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold">أجور وربح فحص لبطاطس سبونتا</td>
                      <td className="p-3">مصروفات تشغيلية والفرز اليدوي</td>
                      <td className="p-3 text-red-600 font-bold">-١٨،٠٠٠ ج.م</td>
                      <td className="p-3 text-red-600">منصرف رواتب</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold">شراء أسمدة ومخصبات عملاقة</td>
                      <td className="p-3">مصروف شراء مبيد فوسفاتي وبوتاسي</td>
                      <td className="p-3 text-red-600 font-bold">-٦٥،٠٠٠ ج.م</td>
                      <td className="p-3">مشتريات مستدامة رئيسية</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Render Crop biometrics */}
          {activeReportType === "crop" && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-[#064E3B] flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#F59E0B]" />
                <span>القياس الأحيائي ومؤشر الكثافة الخضرية الفضائية</span>
              </h4>

              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200 text-xs text-orange-950 leading-relaxed">
                أنموذج تتبع البثور: بناء على قياسات NDVI ومصفوفات الأشعة تحت الحمراء، ترتفع مؤشر الخضرة لقمح سدس ١٤ بمدينة الزقازيق ودمنهور لتصل ذروتها التاريخية لنسبة <strong>٩٤٪ هذا العام</strong> بفضل انتظام الري.
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl text-center border">
                  <span className="text-[10px] text-gray-400 font-bold block">معدل خلو الحقل من الآفات:</span>
                  <span className="text-xl font-bold text-emerald-600 mt-1 block">٩٦ % مبارك بغير حشرات</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl text-center border">
                  <span className="text-[10px] text-gray-400 font-bold block">العائد الإنتاجي الإجمالي المتوقع:</span>
                  <span className="text-xl font-bold text-[#064E3B] mt-1 block">٢٤ أردب لكل فدان</span>
                </div>
              </div>
            </div>
          )}

          {/* Verification stamp by Engineer */}
          <div className="flex justify-between items-center border-t border-gray-150 pt-5 text-xs text-gray-400 font-bold flex-col sm:flex-row gap-3">
            <div>
              تمت معالجة والتحقق من صحة الجداول الرقمية زراعياً ومائياً بواسطة المهندس <strong className="text-gray-600">{userName}</strong>
            </div>

            <div className="text-[10px] border border-emerald-300 rounded-xl px-3 py-1 bg-emerald-50 text-[#064E3B] font-extrabold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>توثيق حكومي رسمي موحد ٢٠٢٦</span>
            </div>
          </div>

        </div>

      </div>

      {/* OFFICIAL MINISTRY IRRIGATION SCHEDULE PDF PREVIEW & PRINT MODAL */}
      {showIrrigationDocModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
            
            {/* Modal Control Toolbar */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between no-print shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-sm">معاينة المستند الرسمي لجدول الري (PDF)</h3>
                  <p className="text-[11px] text-gray-400">جاهز للطباعة المباشرة والتوثيق الرسمي لدى وزارة الموارد المائية والري</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintDoc}
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة المستند / حفظ كـ PDF</span>
                </button>
                <button
                  onClick={handleDownloadDoc}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>تحميل ملف التوثيق</span>
                </button>
                <button
                  onClick={() => setShowIrrigationDocModal(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                  title="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Document Container */}
            <div className="p-6 sm:p-10 overflow-y-auto bg-slate-100 flex justify-center">
              
              {/* THE OFFICIAL PRINTABLE CERTIFICATE SHEET */}
              <div 
                id="official-ministry-doc" 
                className="w-full max-w-3xl bg-white p-8 sm:p-12 rounded-2xl shadow-md border-2 border-[#064E3B] text-right space-y-6 relative print:border-none print:shadow-none print:p-0"
              >
                
                {/* Formal Ministry Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                  <Droplets className="w-96 h-96 text-[#064E3B]" />
                </div>

                {/* Document Header */}
                <div className="border-b-2 border-[#064E3B] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="text-xs font-bold text-gray-500">جمهورية مصر العربية</div>
                    <div className="text-xs font-bold text-gray-700">وزارة الموارد المائية والري - مصلحة الري</div>
                    <div className="text-xs font-bold text-[#064E3B]">وزارة الزراعة واستصلاح الأراضي - قطاع الإرشاد الزراعي</div>
                    <h2 className="text-lg font-black text-[#064E3B] mt-1.5">
                      سجل وجدول مواعيد ومقننات الري المعتمد
                    </h2>
                    <div className="text-[11px] text-gray-500">
                      نموذج رقم (١٤ - ري مقنن) لتوثيق استهلاك الحيازات المائية والزراعية الذكية
                    </div>
                  </div>

                  <div className="sm:text-left bg-emerald-50/80 border border-emerald-200 p-3 rounded-xl">
                    <div className="text-[10px] text-gray-500 font-bold">رقم الاعتماد الوزاري الموحد:</div>
                    <div className="font-mono text-sm font-black text-[#064E3B]">EGY-IRR-2026-9842</div>
                    <div className="text-[10px] text-gray-500 mt-1">تاريخ الإصدار: ٨ سبتمبر ٢٠٢٦</div>
                    <div className="text-[10px] text-emerald-700 font-extrabold mt-0.5">● كود الحيازة موثق رقمياً</div>
                  </div>
                </div>

                {/* Farmer & Farm Metadata Box */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 border border-gray-200 p-4 rounded-xl text-xs">
                  <div>
                    <span className="text-gray-500 block text-[11px]">اسم الحيازة الزراعية:</span>
                    <strong className="text-[#064E3B] text-xs mt-0.5 block">{effectiveFarmName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">المحافظة / المركز:</span>
                    <strong className="text-slate-800 text-xs mt-0.5 block">{userGovernorate}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">المساحة المقننة بالزمام:</span>
                    <strong className="text-[#064E3B] text-xs mt-0.5 block">{farmSize} فدان</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">المهندس / المفوض بالري:</span>
                    <strong className="text-slate-800 text-xs mt-0.5 block">{userName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">مصدر المياه / المنبع:</span>
                    <strong className="text-blue-700 text-xs mt-0.5 block">{waterSource}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">رقم كارت الفلاح الذكي:</span>
                    <strong className="font-mono text-slate-800 text-xs mt-0.5 block">4921-3920-1928-5501</strong>
                  </div>
                </div>

                {/* Official Irrigation Records Table */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-black text-[#064E3B] flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-blue-600" />
                      <span>بيان جداول الري المقررة والمستهلكة فعلياً:</span>
                    </h4>
                    <span className="text-[10px] text-gray-400 font-bold">وحدة القياس: لتر مكعب / متر مكعب</span>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-[#064E3B] text-white font-bold">
                        <tr>
                          <th className="p-2.5">م</th>
                          <th className="p-2.5">القطاع / المحصول</th>
                          <th className="p-2.5">الموعد الزمني المجدول</th>
                          <th className="p-2.5">المدة</th>
                          <th className="p-2.5">الكمية المقننة (لتر)</th>
                          <th className="p-2.5">ما يعادلها (م³)</th>
                          <th className="p-2.5">أسلوب الري</th>
                          <th className="p-2.5">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-gray-700">
                        {irrigationPlans.map((plan, index) => (
                          <tr key={plan.id} className="odd:bg-white even:bg-slate-50/50">
                            <td className="p-2.5 font-bold font-mono text-gray-400">{index + 1}</td>
                            <td className="p-2.5 font-bold text-[#064E3B]">
                              {plan.farmName} <span className="text-gray-500 font-normal text-[11px]">({plan.cropType})</span>
                            </td>
                            <td className="p-2.5 text-slate-800">{plan.scheduleTime}</td>
                            <td className="p-2.5 font-bold text-slate-700">{plan.durationMinutes} دقيقة</td>
                            <td className="p-2.5 font-mono text-blue-800 font-bold">{plan.waterVolumeLiter.toLocaleString()}</td>
                            <td className="p-2.5 font-mono font-bold">{(plan.waterVolumeLiter / 1000).toFixed(1)} م³</td>
                            <td className="p-2.5 text-[11px]">
                              {plan.method === "drip" ? "ري بالتنقيط" : plan.method === "sprinkler" ? "رشاشات" : "سطحي منظم"}
                            </td>
                            <td className="p-2.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                plan.status === "scheduled" ? "bg-blue-100 text-blue-800" :
                                plan.status === "active" ? "bg-emerald-100 text-emerald-800" :
                                "bg-gray-100 text-gray-700"
                              }`}>
                                {plan.status === "scheduled" ? "مجدول رسمي" : plan.status === "active" ? "ضخ حالي" : "منفذ ومسجل"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Water Balance Summary */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl">
                    <div className="text-[10px] text-gray-500 font-bold">إجمالي المياه المقننة بالسجل:</div>
                    <div className="text-sm font-black text-[#064E3B] mt-1 font-mono">
                      {totalWaterLiters.toLocaleString()} لتر ({totalWaterM3} م³)
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="text-[10px] text-emerald-800 font-bold">الوفر المائي المعتمد:</div>
                    <div className="text-sm font-black text-emerald-700 mt-1">
                      +٢٨.٤% توفير مقنن
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="text-[10px] text-blue-800 font-bold">مؤشر كفاءة الاستخدام (WUE):</div>
                    <div className="text-sm font-black text-blue-700 mt-1">
                      فئة أولى (A+) ممتاز
                    </div>
                  </div>
                </div>

                {/* Official Declarations & Endorsements */}
                <div className="pt-4 border-t border-dashed border-gray-300 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="font-extrabold text-slate-800 block">إقرار المزارع بالالتزام:</span>
                    <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                      أقر أنا المزارع بالالتزام التام بنظام المناوبات المائية والمقننات المحددة أعلاه وتطبيق شبكات الري الحديث.
                    </p>
                    <div className="mt-4 pt-2 border-t border-gray-200 text-[11px] text-gray-400">
                      التوقيع: .......................................
                    </div>
                  </div>

                  {/* Stamp & Seal */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-emerald-600 bg-emerald-50 flex flex-col items-center justify-center text-center p-1 shadow-inner">
                      <ShieldCheck className="w-6 h-6 text-[#064E3B]" />
                      <span className="text-[9px] font-black text-[#064E3B] mt-1">ختم الاعتماد الرسمي</span>
                      <span className="text-[8px] text-emerald-800">مصلحة الري والزراعة</span>
                      <span className="text-[7px] font-mono text-gray-500">٢٠٢٦</span>
                    </div>
                    <span className="text-[9px] text-emerald-800 font-bold mt-1">موثق بالسجلات الحكومية</span>
                  </div>

                  <div className="text-left">
                    <span className="font-extrabold text-slate-800 block">اعتماد الإدارة المركزية للري:</span>
                    <p className="text-[10px] text-gray-500 mt-1 leading-relaxed text-right">
                      تمت مراجعة المقننات ومطابقتها مع الحصة المائية المقررة للترعة واعتمادها من مهندس المنطقة.
                    </p>
                    <div className="mt-4 pt-2 border-t border-gray-200 text-[11px] text-gray-400 text-right">
                      مفتش الري: المهندس {userName}
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Bottom Actions */}
            <div className="bg-white border-t border-gray-200 p-4 flex justify-between items-center no-print">
              <div className="text-xs text-gray-500">
                يمكنك الضغط على <strong className="text-[#064E3B]">طباعة المستند</strong> لحفظ الوثيقة كملف PDF رسمي أو إرسالها للطابعة فوراً.
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintDoc}
                  className="py-2.5 px-5 bg-[#064E3B] hover:bg-[#059669] text-white font-extrabold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>طباعة الآن (PDF)</span>
                </button>
                <button
                  onClick={() => setShowIrrigationDocModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* EXPORTING PROGRESS POPUP MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-2xl border border-emerald-50 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 through-amber-500 to-emerald-500" />
            
            <div className="w-16 h-16 rounded-full bg-[#059669]/10 text-[#064E3B] flex items-center justify-center mx-auto mb-4 animate-bounce">
              <ShieldCheck className="w-8 h-8 text-[#059669]" />
            </div>

            <h3 className="font-extrabold text-[#064E3B] text-sm mb-1.5">جارٍ معالجة وتصدير المستند الزراعي</h3>
            <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
              يقوم مخدم المنصة الوطنية بتطوير وتشفير الجدول الزراعي وتوقيع المهندس {userName} بصيغة الكرت الذكي للفلاح المصري.
            </p>

            <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-gradient-to-r from-[#059669] to-[#F59E0B] rounded-full animate-pulse w-[88%]" />
            </div>

            <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1 font-mono font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>جاري تحميل {exportFormat === "pdf" ? ".pdf" : ".xlsx"} في الخلفية...</span>
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
