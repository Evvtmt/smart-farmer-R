/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Cpu, 
  Wifi, 
  Activity, 
  Send, 
  CheckCircle2, 
  Copy, 
  Check, 
  X, 
  Server, 
  Radio, 
  Layers, 
  HelpCircle,
  Code,
  Zap,
  ShieldCheck,
  Power
} from "lucide-react";
import { sendLiveIoTTelemetry } from "../services/realDataService";

interface IoTIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmId: string;
  farmName: string;
  onTelemetryUpdated: (data: { moisture: number; temp: number; ph: number; n: number; p: number; k: number }) => void;
}

export default function IoTIntegrationModal({
  isOpen,
  onClose,
  farmId,
  farmName,
  onTelemetryUpdated,
}: IoTIntegrationModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "test" | "code" | "relay">("overview");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [testMoisture, setTestMoisture] = useState(65);
  const [testTemp, setTestTemp] = useState(26.5);
  const [testPh, setTestPh] = useState(7.3);
  const [testN, setTestN] = useState(135);
  const [testP, setTestP] = useState(38);
  const [testK, setTestK] = useState(210);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentHost = typeof window !== "undefined" ? window.location.origin : "https://ais-dev-pbnu4jhsk6bmwlnxuwkfvh-222580688961.europe-west1.run.app";
  const telemetryUrl = `${currentHost}/api/iot/telemetry`;
  const pumpStatusUrl = `${currentHost}/api/iot/pump/status`;

  const curlExample = `curl -X POST "${telemetryUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "farmId": "${farmId}",
    "moisture": ${testMoisture},
    "temperature": ${testTemp},
    "ph": ${testPh},
    "nitrogen": ${testN},
    "phosphorus": ${testP},
    "potassium": ${testK},
    "batteryLevel": 95,
    "source": "ESP32-Field-Probe-01"
  }'`;

  const esp32Code = `/*
 * Smart Farmer Egypt - ESP32 IoT Soil & Telemetry Firmware
 * يتصل بشبكة الواي فاي أو شريحة 4G/GSM ويرسل قراءات الحساسات الفعلية لخادم التطبيق
 */
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_FARM_WIFI_OR_HOTSPOT";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "${telemetryUrl}";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nمتصل بالإنترنت بنجاح!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    // قراءة الحساسات الحقيقية (مثال لمجس NPK عبر RS485 أو مجس سليم تناظري)
    float moistureVal = analogRead(34) * (100.0 / 4095.0);
    float tempVal = 25.5; // قراءة مجس DS18B20 المقاوم للماء

    StaticJsonDocument<256> doc;
    doc["farmId"] = "${farmId}";
    doc["moisture"] = moistureVal;
    doc["temperature"] = tempVal;
    doc["ph"] = 7.2;
    doc["nitrogen"] = 140;
    doc["phosphorus"] = 35;
    doc["potassium"] = 200;
    doc["source"] = "ESP32-Live-Field";

    String requestBody;
    serializeJson(doc, requestBody);

    int httpResponseCode = http.POST(requestBody);
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    http.end();
  }
  delay(30000); // إرسال قراءة حية كل 30 ثانية
}`;

  const handleSendTestPulse = async () => {
    setIsSending(true);
    setFeedback(null);
    try {
      const ok = await sendLiveIoTTelemetry({
        farmId,
        moisture: testMoisture,
        temperature: testTemp,
        ph: testPh,
        nitrogen: testN,
        phosphorus: testP,
        potassium: testK,
        source: "محاكي إشارة الحساس الحقلي (Live Test)"
      });
      if (ok) {
        onTelemetryUpdated({
          moisture: testMoisture,
          temp: testTemp,
          ph: testPh,
          n: testN,
          p: testP,
          k: testK
        });
        setFeedback("✅ تم استقبال قراءة الحساس الحقلي بنجاح وتحديث بيانات التربة والخرائط الحية فوراً!");
      } else {
        setFeedback("❌ فشل إرسال النبضة، تأكد من الاتصال بالخادم.");
      }
    } catch (err: any) {
      setFeedback(`❌ خطأ: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = (text: string, isEsp: boolean) => {
    navigator.clipboard.writeText(text);
    if (isEsp) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-gray-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#064E3B] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-700/60 rounded-2xl">
              <Cpu className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <span>ربط الحساسات والمضخات الحقيقية (IoT Hardware)</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                  نظام حقلي فعلي
                </span>
              </h3>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                توصيل مجسات التربة ومحركات الري بالمزرعة: {farmName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 bg-gray-50/70 p-1.5 gap-1.5 text-xs font-bold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "overview" ? "bg-white text-[#064E3B] shadow-xs" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>كيف يعمل ميدانياً؟</span>
          </button>
          <button
            onClick={() => setActiveTab("test")}
            className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "test" ? "bg-white text-[#064E3B] shadow-xs" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Send className="w-4 h-4 text-blue-600" />
            <span>اختبار نبضة حية</span>
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "code" ? "bg-white text-[#064E3B] shadow-xs" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Code className="w-4 h-4 text-amber-600" />
            <span>كود ESP32 الجاهز</span>
          </button>
          <button
            onClick={() => setActiveTab("relay")}
            className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "relay" ? "bg-white text-[#064E3B] shadow-xs" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Power className="w-4 h-4 text-rose-600" />
            <span>التحكم بالمضخات</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-right flex-1">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4 text-xs">
              <div className="bg-emerald-50/70 border border-emerald-200/70 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-[#064E3B] font-extrabold text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>معمارية الربط الحقيقي على أرض الواقع (في الحقل المصري)</span>
                </div>
                <p className="text-gray-700 leading-relaxed text-[11px]">
                  لكي يعمل النظام على أرض الواقع، يتم غرس مجسات رطوبة وعناصر التربة الحقيقية في الحقل وتوصيلها بلوحة تحكم صلبة ترسل البيانات للرابط البرمجي (API Endpoint) المخصص لمنصتك:
                </p>
              </div>

              {/* Steps pipeline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="border border-gray-100 rounded-2xl p-3 bg-white shadow-2xs space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#064E3B] font-black text-xs flex items-center justify-center">
                    ١
                  </span>
                  <strong className="text-slate-800 block text-xs">مجسات التربة الفيزيائية</strong>
                  <p className="text-[10px] text-gray-500 leading-normal">
                    مجسات NPK / Moisture مقاومة للماء والرمل تُغرس على عمق ٢٠ إلى ٤٠ سم في قطاعات الري.
                  </p>
                </div>

                <div className="border border-gray-100 rounded-2xl p-3 bg-white shadow-2xs space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                    ٢
                  </span>
                  <strong className="text-slate-800 block text-xs">وحدة الإرسال (ESP32 / 4G)</strong>
                  <p className="text-[10px] text-gray-500 leading-normal">
                    وحدة تحكم صغيرة مزودة بشريحة اتصال محلية (فودافون/أورنج/اتصالات/WE) أو واي فاي الحقل ترسل القراءات.
                  </p>
                </div>

                <div className="border border-gray-100 rounded-2xl p-3 bg-white shadow-2xs space-y-1.5">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-black text-xs flex items-center justify-center">
                    ٣
                  </span>
                  <strong className="text-slate-800 block text-xs">خادم المزارع الذكي الحي</strong>
                  <p className="text-[10px] text-gray-500 leading-normal">
                    يستقبل الخادم القراءات فوراً، يحللها بالذكاء الاصطناعي، ويطلق أوامر الري التلقائية.
                  </p>
                </div>
              </div>

              {/* Endpoints Details */}
              <div className="bg-slate-50 border border-gray-200 rounded-2xl p-3.5 space-y-2">
                <span className="text-[11px] font-bold text-gray-700 block">رابط الاستقبال المباشر لحساساتك (Webhook API):</span>
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-3 py-2 font-mono text-[10px] text-slate-800 select-all overflow-x-auto">
                  <span>{telemetryUrl}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEST LIVE TELEMETRY */}
          {activeTab === "test" && (
            <div className="space-y-4">
              <div className="bg-blue-50/70 border border-blue-200/60 p-3.5 rounded-2xl text-xs space-y-1">
                <span className="font-extrabold text-blue-900 block">تجربة إرسال قراءة حقلية حية فورية:</span>
                <p className="text-gray-600 text-[11px]">
                  قم بتعديل قيم الحساس أدناه ثم اضغط على زر الإرسال. سترى هذه القراءات تنعكس مباشرة في لوحة التحكم ومخططات التربة والخريطة.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 border rounded-xl p-2.5">
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">رطوبة التربة (%):</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={testMoisture}
                    onChange={(e) => setTestMoisture(Number(e.target.value))}
                    className="w-full bg-white border rounded-lg p-1.5 font-mono text-xs font-bold text-[#064E3B]"
                  />
                </div>

                <div className="bg-slate-50 border rounded-xl p-2.5">
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">حرارة التربة (°م):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={testTemp}
                    onChange={(e) => setTestTemp(Number(e.target.value))}
                    className="w-full bg-white border rounded-lg p-1.5 font-mono text-xs font-bold text-amber-700"
                  />
                </div>

                <div className="bg-slate-50 border rounded-xl p-2.5">
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">حموضة التربة (pH):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="4"
                    max="10"
                    value={testPh}
                    onChange={(e) => setTestPh(Number(e.target.value))}
                    className="w-full bg-white border rounded-lg p-1.5 font-mono text-xs font-bold text-blue-700"
                  />
                </div>

                <div className="bg-slate-50 border rounded-xl p-2.5">
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">النيتروجين N (ملجم/كجم):</label>
                  <input
                    type="number"
                    value={testN}
                    onChange={(e) => setTestN(Number(e.target.value))}
                    className="w-full bg-white border rounded-lg p-1.5 font-mono text-xs font-bold text-emerald-700"
                  />
                </div>

                <div className="bg-slate-50 border rounded-xl p-2.5">
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">الفوسفور P (ملجم/كجم):</label>
                  <input
                    type="number"
                    value={testP}
                    onChange={(e) => setTestP(Number(e.target.value))}
                    className="w-full bg-white border rounded-lg p-1.5 font-mono text-xs font-bold text-emerald-700"
                  />
                </div>

                <div className="bg-slate-50 border rounded-xl p-2.5">
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">البوتاسيوم K (ملجم/كجم):</label>
                  <input
                    type="number"
                    value={testK}
                    onChange={(e) => setTestK(Number(e.target.value))}
                    className="w-full bg-white border rounded-lg p-1.5 font-mono text-xs font-bold text-emerald-700"
                  />
                </div>
              </div>

              {feedback && (
                <div className={`p-3 rounded-xl text-xs font-bold ${feedback.startsWith("✅") ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"}`}>
                  {feedback}
                </div>
              )}

              <button
                onClick={handleSendTestPulse}
                disabled={isSending}
                className="w-full py-2.5 px-4 bg-[#064E3B] hover:bg-[#059669] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? "جاري إرسال النبضة للحساس..." : "إرسال قراءة الحساس الحية إلى الخادم الآن"}</span>
              </button>

              {/* cURL Block */}
              <div className="border border-gray-200 rounded-2xl p-3.5 bg-slate-900 text-slate-100 font-mono text-[10px] relative space-y-2" dir="ltr">
                <div className="flex justify-between items-center text-slate-400 text-[10px]">
                  <span>cURL Command (Raspberry Pi / Linux / Postman):</span>
                  <button
                    onClick={() => copyToClipboard(curlExample, false)}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                  >
                    {copiedCurl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCurl ? "تم النسخ" : "نسخ الأمر"}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap">{curlExample}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: READY CODE FOR ESP32 */}
          {activeTab === "code" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-[#064E3B]">كود Arduino C++ كامل وجاهز للرفع على لوحة ESP32:</span>
                <button
                  onClick={() => copyToClipboard(esp32Code, true)}
                  className="py-1 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#064E3B] border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? "تم نسخ الكود!" : "نسخ الكود بالكامل"}</span>
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-2xl p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] relative max-h-[300px] overflow-y-auto" dir="ltr">
                <pre className="whitespace-pre-wrap">{esp32Code}</pre>
              </div>

              <div className="text-[11px] text-gray-500 bg-gray-50 p-3 rounded-xl border">
                💡 <strong>ملاحظة للمهندس الزراعي:</strong> قم بتغيير اسم شبكة الواي فاي وكلمة المرور في الكود، أو استبدال مكتبة WiFi بمكتبة TinyGSM في حال كنت تستخدم شريحة SIM800L / 4G في الحقل البعيد.
              </div>
            </div>
          )}

          {/* TAB 4: RELAYS & PUMP CONTROLLER */}
          {activeTab === "relay" && (
            <div className="space-y-4 text-xs">
              <div className="bg-rose-50/70 border border-rose-200/70 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm">
                  <Zap className="w-5 h-5 text-rose-600" />
                  <span>التحكم الفيزيائي في تشغيل وإيقاف مضخات الري (Relay Actuator)</span>
                </div>
                <p className="text-gray-700 leading-relaxed text-[11px]">
                  عند الضغط على زر <strong>"ضخ مائي يدوي طارئ وموجه"</strong> في التطبيق، يرسل الخادم إشارة تشغيل إلى وحدة التحكم في المزرعة. تستمع لوحة التحكم عبر الرابط التالي لمعرفة حالة المرحل الكهربائي (ON/OFF):
                </p>
              </div>

              <div className="bg-slate-50 border border-gray-200 rounded-2xl p-3.5 space-y-2 font-mono text-[10px]">
                <span className="text-[11px] font-bold text-gray-700 block font-sans">مسار استعلام حالة المرحل (Polling Status Endpoint):</span>
                <div className="bg-white border rounded-xl p-2 text-slate-800 select-all overflow-x-auto" dir="ltr">
                  GET {pumpStatusUrl}?pumpId=pump-1
                </div>
                <span className="text-[10px] text-gray-500 block font-sans">
                  الرد الناتج: <code className="text-emerald-700">{"{\"state\":\"ON\",\"durationMinutes\":30}"}</code>
                </span>
              </div>

              <div className="border border-emerald-100 bg-emerald-50/50 rounded-2xl p-3 text-[11px] text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>أي أمر تشغيل يصدر من التطبيق يتم تسجيله وتوجيهه فوراً لقاطع المحرك في المزرعة.</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
}
