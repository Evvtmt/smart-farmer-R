/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { 
  Send, 
  Sparkles, 
  Sprout, 
  User, 
  Bot, 
  Activity, 
  Droplet, 
  HelpCircle,
  Clock
} from "lucide-react";

// Presets prompts to stimulate the user conversations instantly
const AGRI_PRESETS = [
  { text: "ما هو الموعد والكمية المناسبة لتسميد يوريا للقمح في الشرقية؟", category: "fertilizer" },
  { text: "كيف يمكن حماية أوراق البطاطس الفاخرة من موجة الصقيع القادمة؟", category: "frost" },
  { text: "ما هو علاج ذبابة الفاكهة وحشرة الحشد بالبساتين والموالح؟", category: "pest" },
  { text: "جدول مائي مقترح لري الزيتون المجدول بالتنقيط في تربة رملية؟", category: "water" }
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "model",
      text: "سلام الله عليكم ورحمته وبركاته مزارعينا الأجلاء ومهندسينا الأكفاء بمصر الحبيبة. معكم المهندس إبراهيم، مستشاركم الزراعي الرقمي الذكي بالمنصة الوطنية. تفضل بطرح أي سؤال يتعلق بنوع التربة، ري المحاصيل، مواقيت البذر والتسميد، أو مكافحة آفات الدلتا والجنوب لأجيبك بجرعات دقيقة موجهة تضمن لك كفاءة مادية وإنتاجية مباركة بحول الله!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom upon message add
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    // Create user message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      // Gather all conversational history
      const payloadMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages })
      });

      if (!res.ok) {
        throw new Error("فشل الاتصال بالمستشار الزراعي المركزي.");
      }

      const responseData = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "model",
        text: responseData.text || "عذراً يا مزارعنا القدير، تعذر صياغة الرأي الزراعي من الخادم المركزي حالياً.",
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "model",
        text: `[تنبيه المنظومة: حدث عطل في خادم الوزارة] يا مزارعنا الفاضل، تعذر الاتصال بالمكتب البحثي بسبب الرطوبة أو خلل الشبكة. مع ذلك، بخصوص سؤالك، ننصحك بالرجوع لإرشادات الكارت الذكي المطبوعة حتى تعود الإشارة كاملة!`,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const formatText = (text: string) => {
    // Basic formatting for lines or bold symbols
    return text.split("\n").map((line, idx) => {
      let cleaned = line;
      // Bold check **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(cleaned)) !== null) {
        if (match.index > lastIndex) {
          parts.push(cleaned.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="text-[#064E3B] font-extrabold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < cleaned.length) {
        parts.push(cleaned.substring(lastIndex));
      }

      const finalContent = parts.length > 0 ? parts : cleaned;

      return (
        <p key={idx} className="mb-2 leading-relaxed text-xs">
          {finalContent}
        </p>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-right" dir="rtl">
      
      {/* 1/4 COLUMN: Quick agricultural presets and tools instructions */}
      <div className="lg:col-span-1 space-y-4">
        
        {/* Assistant info box */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#064E3B] border-2 border-[#F59E0B] flex items-center justify-center mb-3 shadow-inner relative">
            <Bot className="w-8 h-8 text-[#059669]" />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
          </div>

          <h3 className="font-extrabold text-sm text-[#064E3B]">المهندس إبراهيم الذكي</h3>
          <span className="text-[10px] text-gray-400 font-bold">بمجمع البحوث الزراعية بالشرقية</span>
          
          <p className="text-[11px] text-gray-500 mt-4 leading-relaxed bg-[#F0F4F0] p-3 rounded-2xl w-full">
            تمت مراجعة القواعد المعرفية وتدريبها من قبل نخبة الأساتذة بمركز البحوث الزراعية والإرشاد لضمان صحة الجرعات والمقادير السمادية الحيوية والكيميائية للتصدير.
          </p>
        </div>

        {/* Dynamic prompts seeds */}
        <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
          <h4 className="font-extrabold text-xs text-[#064E3B] mb-3 flex items-center gap-1">
            <HelpCircle className="w-4 h-4 text-[#F59E0B]" />
            <span>استشارات إرشادية مقترحة للتجربة:</span>
          </h4>

          <div className="space-y-2.5">
            {AGRI_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(preset.text)}
                className="w-full text-right p-3 rounded-2xl bg-slate-50 hover:bg-[#F0F4F0] border border-gray-150 transition-colors text-[11px] font-medium leading-relaxed text-gray-700 block cursor-pointer"
              >
                {preset.text}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 3/4 COLUMN: ChatGPT Chat Interface */}
      <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[520px] overflow-hidden">
        
        {/* Chat top info ribbion */}
        <div className="bg-[#064E3B] p-4 text-white flex justify-between items-center select-none border-b border-[#059669]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#059669] flex items-center justify-center font-bold text-[#F59E0B]">
              إ
            </div>
            <div>
              <span className="font-extrabold text-xs block">مساعد الذكاء الاصطناعي الوطني (Gemini 3.5)</span>
              <span className="text-[9px] text-emerald-300 block">اتصال آمن ومشفر بالمعمورة زراعي</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] bg-white/10 px-2.5 py-1 rounded-full text-slate-100 font-medium">
            <Activity className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>المرشد العلمي نشط</span>
          </div>
        </div>

        {/* Scrollable messages container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
          {messages.map((m) => {
            const isModel = m.role === "model";
            return (
              <div 
                key={m.id} 
                className={`flex gap-3 max-w-[85%] ${isModel ? "mr-0 ml-auto flex-row" : "mr-auto ml-0 flex-row-reverse"}`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${
                  isModel 
                    ? "bg-[#064E3B] border-[#F59E0B] text-[#F59E0B]" 
                    : "bg-[#059669] border-white text-white"
                }`}>
                  {isModel ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message bubble */}
                <div className={`rounded-3xl p-4 text-xs leading-relaxed ${
                  isModel 
                    ? "bg-white text-gray-800 rounded-tr-none border border-gray-150 shadow-sm" 
                    : "bg-[#064E3B] text-white rounded-tl-none font-medium"
                }`}>
                  {isModel ? (
                    <div>{formatText(m.text)}</div>
                  ) : (
                    <p>{m.text}</p>
                  )}
                  
                  {/* Timestamp log */}
                  <span className={`text-[8px] mt-2 block text-left ${isModel ? "text-gray-400" : "text-emerald-200"}`}>
                    {m.timestamp.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* AI THINKING LOADING PLACEHOLDER */}
          {loading && (
            <div className="flex gap-3 mr-0 ml-auto max-w-[80%] items-center">
              <div className="w-8 h-8 rounded-full bg-[#064E3B] border-[#F59E0B] text-[#F59E0B] flex items-center justify-center shrink-0 animate-spin-slow">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <div className="bg-white rounded-3xl p-4 border border-gray-150 shadow-sm flex items-center gap-2">
                <span className="text-[11px] text-gray-500 font-bold animate-pulse">جاري المراجعة بكتيب وزارة الإرشاد لإعطائك الصواب...</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#059669] rounded-full animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 bg-[#059669] rounded-full animate-bounce delay-200" />
                  <span className="w-1.5 h-1.5 bg-[#059669] rounded-full animate-bounce delay-300" />
                </span>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Bottom input typing footer widget */}
        <form onSubmit={handleFormSubmit} className="p-3 bg-white border-t border-gray-100 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="اكتب سؤالك هنا بوضوح كالمعهود في مصر زراعياً..."
            required
            className="flex-1 px-4 py-2.5 text-xs border border-gray-205 border-gray-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#059669] text-right"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="px-4.5 py-2.5 bg-[#064E3B] hover:bg-[#059669] text-white rounded-2xl transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-4 h-4 transform rotate-180" />
          </button>
        </form>

      </div>

    </div>
  );
}
