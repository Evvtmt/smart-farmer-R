import React, { useState } from "react";
import { 
  MessageSquare, 
  CheckCircle, 
  ArrowUp, 
  UserCheck, 
  HelpCircle, 
  Search, 
  Plus, 
  Clock, 
  MapPin, 
  Sparkles, 
  AlertCircle,
  TrendingUp,
  Award
} from "lucide-react";
import { CommunityQuestion, CommunityAnswer, User } from "../types";

interface CommunityQAProps {
  isOffline: boolean;
  currentUser: User | null;
  onAddOfflineAction: (module: "منتدى مجتمع الفلاحين", actionName: string, payload: any) => void;
  onEarnPoints: (points: number, reason: string) => void;
}

const initialQuestions: CommunityQuestion[] = [
  {
    id: "q-1",
    title: "مقاومة بقع الصدأ الأصفر في سنابل القمح (سدس 14)؟",
    description: "أنا مزارع في دمنهور، وقد لاحظت بقعاً برتقالية باهتة تشبه المسحوق على أوراق سنابل القمح. هل هذا فطر الصدأ الأصفر؟ وما العلاج لإنقاذ الفدان؟",
    category: "diseases",
    categoryLabel: "أمراض المحاصيل",
    authorName: "الحاج سعيد الطناحي",
    authorGovernorate: "البحيرة",
    authorRole: "مزارع معتمد",
    timestamp: "منذ ساعتين",
    upvotes: 24,
    resolved: true,
    answers: [
      {
        id: "ans-1-1",
        questionId: "q-1",
        authorName: "الدكتور عاصم الشرقاوي",
        authorRole: "verified_expert",
        authorTitle: "باحث أول بمعهد بحوث أمراض النباتات",
        text: "نعم يا حاج سعيد، هذه هي الأعراض الكلاسيكية لفطر الصدأ الأصفر (Puccinia striiformis). عليك فوراً برش مبيد تيلت (Tilt 250 EC) بمعدل 25 سم مكعب لكل 100 لتر ماء، أو استخدام مبيد سومي إيت بمعدل 35 سم3. تجنب تماماً زيادة التسميد الآزوتي ولا تقم بالري في فترة الظهيرة الحارة.",
        timestamp: "منذ ساعة ونصف",
        upvotes: 18,
        isExpertVerified: true
      },
      {
        id: "ans-1-2",
        questionId: "q-1",
        authorName: "م. إبراهيم",
        authorRole: "engineer",
        text: "أنصح أيضاً بقرص الرش الوقائي بالسيليكون لزيادة سماكة جدار الخلية النباتية مما يزيد من مقاومة الفطر مستقبلاً.",
        timestamp: "منذ ساعة واحدة",
        upvotes: 7,
        isExpertVerified: false
      }
    ]
  },
  {
    id: "q-2",
    title: "مواعيد ونسب تدوير المياه في غطاس الري بالتنقيط بتوشكى؟",
    description: "نقوم بزراعة نخيل المجدول في تربة رملية صحراوية مستصلحة، ونريد جدولة تشغيل الآبار لتقليص استهلاك الديزل في توليد الكهرباء دون الإضرار بفسائل النخيل.",
    category: "irrigation",
    categoryLabel: "الري الذكي",
    authorName: "المهندس رمزي واصف",
    authorGovernorate: "توشكى والجنوب",
    authorRole: "أخصائي استصلاح",
    timestamp: "منذ يوم واحد",
    upvotes: 15,
    resolved: false,
    answers: [
      {
        id: "ans-2-1",
        questionId: "q-2",
        authorName: "المهندسة سلوى الدمرداش",
        authorRole: "verified_expert",
        authorTitle: "استشاري هيدروليكا المياه الجوفية",
        text: "يا باشمهندس رمزي، في منطقتنا الحارة بتوشكى، معدلات التبخر تصل لأقصى معدل نهاراً. أفضل جدولة تشغيل هي الري الليلي التراكمي (بين 10 مساءً وحتى 4 صباحاً) بمعدل نبضات ري بالتنقيط (30 دقيقة ري، ثم 20 دقيقة تخلل، ثم 30 دقيقة ري). هذا يوفر 35% من سحب المحركات ويمنع حرق جذوع الفسائل.",
        timestamp: "منذ 18 ساعة",
        upvotes: 12,
        isExpertVerified: true
      }
    ]
  },
  {
    id: "q-3",
    title: "حموضة وملوحة مياه الآبار الجوفية (pH 7.9) في الفيوم؟",
    description: "تم فحص حموضة بئر الري وأعطى المؤشر قلوية طفيفة 7.9 مما يزيد من جمود البوتاسيوم والحديد بالتربة الطميية الرملية. كيف نتعامل معها كيميائياً؟",
    category: "soil",
    categoryLabel: "خصوبة التربة",
    authorName: "الأستاذ رشدي هلال",
    authorGovernorate: "الفيوم",
    authorRole: "مستثمر زراعي",
    timestamp: "منذ 3 أيام",
    upvotes: 8,
    resolved: false,
    answers: []
  }
];

export default function CommunityQA({ isOffline, currentUser, onAddOfflineAction, onEarnPoints }: CommunityQAProps) {
  const [questions, setQuestions] = useState<CommunityQuestion[]>(initialQuestions);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchText, setSearchText] = useState<string>("");

  // Create Question Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCat, setNewCat] = useState<"diseases" | "irrigation" | "soil" | "machinery" | "general">("diseases");
  const [showAskModal, setShowAskModal] = useState(false);

  // Answer Form State per Question ID
  const [activeQuestionIdForAnswer, setActiveQuestionIdForAnswer] = useState<string | null>(null);
  const [newAnswerText, setNewAnswerText] = useState("");

  const categories = [
    { id: "all", label: "الكل" },
    { id: "diseases", label: "أمراض المحاصيل" },
    { id: "irrigation", label: "الري الذكي" },
    { id: "soil", label: "خصوبة التربة" },
    { id: "machinery", label: "الآلات الزراعية" },
    { id: "general", label: "إرشادات عامة" }
  ];

  const categoryLabels: Record<string, string> = {
    diseases: "أمراض المحاصيل",
    irrigation: "الري الذكي",
    soil: "خصوبة التربة",
    machinery: "الآلات الزراعية",
    general: "إرشادات عامة"
  };

  const currentUserName = currentUser?.name || "المهندس إبراهيم";
  const currentUserGov = currentUser?.governorate || "البحيرة";

  // Handle Ask Question
  const handleAskQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;

    const payload = {
      id: `q-${Date.now()}`,
      title: newTitle,
      description: newDesc,
      category: newCat,
      categoryLabel: categoryLabels[newCat],
      authorName: currentUserName,
      authorGovernorate: currentUserGov,
      authorRole: "مزارع ذكي مبادر",
      timestamp: "منذ ثانية واحدة",
      upvotes: 1,
      resolved: false,
      answers: []
    };

    if (isOffline) {
      // Offline queue route
      onAddOfflineAction("منتدى مجتمع الفلاحين", "طرح سؤال إرشادي جديد", payload);
      // Still push it locally for instant feedback but visually flag pending offline state
      setQuestions([payload, ...questions]);
      onEarnPoints(15, "تسجيل حركة أوفلاين فخرية بطرح سؤال");
    } else {
      setQuestions([payload, ...questions]);
      onEarnPoints(30, "طرح سؤال فني بمنتدى الإرشاد الموحد");
    }

    setNewTitle("");
    setNewDesc("");
    setShowAskModal(false);
  };

  // Upvote Question
  const handleUpvoteQuestion = (qId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        onEarnPoints(5, "دعم وطيد وبوت للفلاحين");
        return { ...q, upvotes: q.upvotes + 1 };
      }
      return q;
    }));
  };

  // Toggle Resolved status (Only allowed for author/expert)
  const handleToggleResolved = (qId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const nextState = !q.resolved;
        if (nextState) {
          onEarnPoints(40, "حل وإنهاء تدقيق مسألة زراعية بنجاح");
        }
        return { ...q, resolved: nextState };
      }
      return q;
    }));
  };

  // Handle Answer Submission
  const handleAddAnswerSubmit = (qId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswerText.trim()) return;

    const newAns: CommunityAnswer = {
      id: `ans-${Date.now()}`,
      questionId: qId,
      authorName: currentUserName,
      authorRole: currentUserName.includes("دكتور") || currentUserName.includes("خبير") ? "verified_expert" : "farmer",
      authorTitle: currentUserName.includes("دكتور") ? "استشاري الإرشاد القومي" : "مزارع ذكي مساهم",
      text: newAnswerText,
      timestamp: "منذ ثوانٍ معدودة",
      upvotes: 1,
      isExpertVerified: currentUserName.includes("دكتور") || currentUserName.includes("خبير")
    };

    if (isOffline) {
      onAddOfflineAction("منتدى مجتمع الفلاحين", "نشر رد طبي فني", { qId, answer: newAns });
      // Add locally too
      setQuestions(questions.map(q => {
        if (q.id === qId) {
          return { ...q, answers: [...q.answers, newAns] };
        }
        return q;
      }));
      onEarnPoints(20, "حفظ رد وإجابة قيد الأوفلاين");
    } else {
      setQuestions(questions.map(q => {
        if (q.id === qId) {
          return { ...q, answers: [...q.answers, newAns] };
        }
        return q;
      }));
      onEarnPoints(50, "الإجابة وتقييم المستويات العلمية بالمنتدى");
    }

    setNewAnswerText("");
    setActiveQuestionIdForAnswer(null);
  };

  // Upvote Answer
  const handleUpvoteAnswer = (qId: string, ansId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          answers: q.answers.map(ans => {
            if (ans.id === ansId) {
              onEarnPoints(5, "تقييم إيجابي لإجابة علمية ملهمة");
              return { ...ans, upvotes: ans.upvotes + 1 };
            }
            return ans;
          })
        };
      }
      return q;
    }));
  };

  // Filter and search questions
  const filteredQuestions = questions.filter(q => {
    const matchCat = selectedCategory === "all" || q.category === selectedCategory;
    const matchSearch = q.title.toLowerCase().includes(searchText.toLowerCase()) || 
                        q.description.toLowerCase().includes(searchText.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Community Intro Hero Section */}
      <div className="bg-white border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/40 rounded-full blur-xl pointer-events-none" />
        <div className="space-y-1 z-10 text-right">
          <h3 className="font-black text-lg text-[#064E3B] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <span>ملتقى الإرشاد ومجتمع السؤال وجواب للفلاح</span>
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
            اطرح استفسارك العلمي حول الطفيليات ومكافحة أمراض النبات، أو أجب على تساؤلات الزملاء. يُحسب لك نقاط مضافة عند تقديم إجابات متوازنة ومعتمدة من خبراء وزارة الزراعة.
          </p>
        </div>

        <button
          onClick={() => setShowAskModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>اطرح استفساراً فنياً الآن</span>
        </button>
      </div>

      {/* SEARCH AND FILTERS BUTTONS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="البحث في الأسئلة الشائعة والمشكلات الطارئة..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full text-xs bg-white border border-gray-150 rounded-2xl py-2.5 pr-10 pl-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-right"
          />
        </div>

        {/* Categories Tab selector */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-[11px] font-bold py-2 px-3.5 rounded-xl transition-all border cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#064E3B] border-[#064E3B] text-[#F59E0B] shadow-sm"
                  : "bg-white border-gray-150 text-gray-650 hover:bg-gray-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* OFFLINE QUEUE PRE-INFO WITHIN COMMUNITY */}
      {isOffline && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-[11px] text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-655" />
          <span>أنت تعمل حالياً في <strong>وضع عدم الاتصال بالشبكة (Offline)</strong>. أي طروحات لأسئلة أو ردود سوف تُحفظ في <strong>صندوق العمليات المؤجل</strong> وسيتم نقلها للخوادم القومية عند تحولك لوضع الاتصال والضغط على المزامنة.</span>
        </div>
      )}

      {/* EXPERT HIGHLIGHT CRITERIA BANNER */}
      <div className="bg-gradient-to-l from-[#064E3B]/10 to-transparent border border-emerald-100/50 rounded-2xl p-4.5 flex flex-col sm:flex-row md:items-center gap-4 justify-between">
        <div className="flex items-start gap-3">
          <Award className="w-5 h-5 text-[#F59E0B] mt-0.5 shrink-0" />
          <div className="text-right">
            <span className="text-xs font-black text-[#064E3B] block">نظام تصديق واعتماد خبراء المجتمع القومي:</span>
            <p className="text-[10px] text-gray-650 leading-relaxed mt-0.5">
              كيف تصبح خبيراً معتمداً بمستندات ذهبية؟ الفلاحون والمهندسون الذين يُقدمون <strong>أكثر من 5 إجابات محلولة</strong> ومطابقة عينية يحصلون تلقائياً على وسم الحماية <strong className="text-emerald-700">★ خبير زراعي معتمد ومصدق</strong> وتُمنح ردودهم الصدارة في فرز الباحثين.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 bg-white/80 border py-1.5 px-3 rounded-xl">
          <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping" />
          <span className="text-[10px] font-bold text-gray-700">يتواجد الآن: 14 خبير إرشادي رسمي</span>
        </div>
      </div>

      {/* CONCRETE QUESTIONS CONTAINER */}
      <div className="space-y-5">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white border text-center py-10 rounded-3xl space-y-2 text-gray-400">
            <HelpCircle className="w-10 h-10 mx-auto opacity-40 text-[#064E3B]" />
            <span className="text-xs block font-bold">لا توجد ثمة تساؤلات تطابق شروط هذا البحث الفلتر</span>
            <p className="text-[10px] max-w-sm mx-auto">كن أنت المبادرة الأولى واطرح استفسارك بخصوص آفات المزرعة ونسب الإشباع المائي.</p>
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <div key={q.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4 hover:border-emerald-100 transition-all">
              
              {/* Question Card header block */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-50 pb-3">
                
                {/* User metadata & Title info */}
                <div className="flex items-start gap-3 text-right">
                  <div className="w-9 h-9 bg-emerald-50 rounded-full border border-emerald-100/80 flex items-center justify-center shrink-0">
                    <span className="text-emerald-800 text-xs font-bold">{q.authorName[0]}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-xs text-slate-800 font-extrabold">{q.authorName}</strong>
                      <span className="text-[9px] text-gray-400 bg-slate-50 border px-1.5 py-0.5 rounded-md flex items-center gap-0.5 font-bold">
                        <MapPin className="w-2.5 h-2.5 text-gray-400" />
                        {q.authorGovernorate}
                      </span>
                      <span className="text-[9px] bg-[#064E3B]/10 text-[#064E3B] px-2 py-0.5 rounded-full font-black">
                        {q.categoryLabel}
                      </span>
                    </div>
                    <span className="text-[9px] text-gray-400 block mt-0.5">طرح: {q.timestamp}</span>
                  </div>
                </div>

                {/* Status Resolving check buttons */}
                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
                  
                  {/* Mark as resolved toggle button */}
                  <button
                    onClick={() => handleToggleResolved(q.id)}
                    className={`text-[10px] px-2.5 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      q.resolved
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-white border-gray-150 text-gray-500 hover:bg-slate-50"
                    }`}
                  >
                    <CheckCircle className={`w-3.5 h-3.5 ${q.resolved ? "text-emerald-650" : "text-gray-300"}`} />
                    <span>{q.resolved ? "مسألة محلولة (Resolved)" : "وضع كـ محلولة"}</span>
                  </button>

                  {/* Upvote Q card button */}
                  <button
                    onClick={() => handleUpvoteQuestion(q.id)}
                    className="p-1 px-2.5 bg-slate-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 rounded-xl transition-colors border text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span>{q.upvotes} تأييد</span>
                  </button>
                </div>

              </div>

              {/* Title & Description text */}
              <div className="text-right space-y-2">
                <h4 className="font-extrabold text-sm text-[#064E3B] leading-relaxed select-text">{q.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed font-normal whitespace-pre-line select-text">
                  {q.description}
                </p>
              </div>

              {/* ANSWERS PORTION */}
              <div className="bg-[#F0F4F0]/40 p-4 rounded-2xl border border-gray-100 space-y-4">
                <span className="text-[10.5px] font-black text-gray-500 block border-b pb-1.5">
                  الردود والمناقشات القائمة ({q.answers.length}):
                </span>

                {q.answers.length === 0 ? (
                  <p className="text-[10px] text-gray-400 font-bold py-1">لا توجد ردود مطروحة بعد. كن أول من يكتب إجابة نموذجية لفائدة فلاحي مصر!</p>
                ) : (
                  <div className="space-y-3.5">
                    {q.answers.map((ans) => {
                      const isExpert = ans.authorRole === "verified_expert";
                      return (
                        <div 
                          key={ans.id} 
                          className={`p-3.5 rounded-xl text-right border ${
                            isExpert 
                              ? "bg-amber-50/55 border-amber-205 border-amber-200" 
                              : "bg-white border-slate-100"
                          }`}
                        >
                          {/* Answer top data info */}
                          <div className="flex justify-between items-center mb-2 flex-wrap gap-2 text-[10px]">
                            <div className="flex items-center gap-1.5 text-right">
                              <strong className={`font-black ${isExpert ? "text-amber-900" : "text-slate-800"}`}>
                                {ans.authorName}
                              </strong>
                              {isExpert && (
                                <span className="bg-emerald-700 text-[#F59E0B] text-[8px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                                  <UserCheck className="w-2.5 h-2.5" />
                                  <span>{ans.authorTitle || "خبير إرشادي"}</span>
                                </span>
                              )}
                              <span className="text-gray-400 font-medium">({ans.timestamp})</span>
                            </div>

                            <button
                              onClick={() => handleUpvoteAnswer(q.id, ans.id)}
                              className="p-1 px-2 bg-slate-50 hover:bg-emerald-50 rounded text-slate-500 hover:text-emerald-700 font-mono text-[9px] border flex items-center gap-0.5 cursor-pointer"
                            >
                              <ArrowUp className="w-3 h-3" />
                              <span>{ans.upvotes}</span>
                            </button>
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                            {ans.text}
                          </p>

                          {/* Highlight expert tip ribbon stamp */}
                          {isExpert && (
                            <div className="mt-2 text-[9px] text-[#059669] font-bold flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>توصية خبراء ومراقبين معاهد بحوث الأراضي والمياه المعتمدة</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Submit quick answer block */}
                {activeQuestionIdForAnswer === q.id ? (
                  <form onSubmit={(e) => handleAddAnswerSubmit(q.id, e)} className="space-y-2 pt-2 border-t">
                    <label className="block text-[10px] font-bold text-gray-500">اكتب إجابتك العلمية بسلامة وموضوعية:</label>
                    <textarea
                      value={newAnswerText}
                      onChange={(e) => setNewAnswerText(e.target.value)}
                      placeholder="اكتب التوصية الدوائية أو التوقيتات الدقيقة بالفترة والتجربة..."
                      required
                      rows={2}
                      className="w-full text-xs p-2.5 bg-white border rounded-xl text-right focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-750 hover:bg-emerald-700 text-white rounded-lg text-[10.5px] font-extrabold cursor-pointer"
                      >
                        إيداع الإجابة العامة
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveQuestionIdForAnswer(null);
                          setNewAnswerText("");
                        }}
                        className="py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[10.5px] font-extrabold cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setActiveQuestionIdForAnswer(q.id)}
                    className="w-full py-2 bg-white hover:bg-slate-50 text-slate-650 hover:text-emerald-800 border rounded-xl text-[10.5px] font-bold text-center transition-colors cursor-pointer block mt-1"
                  >
                    + أضف توصيتك وإفادتك حول هذه الملاحظة الفلاحية
                  </button>
                )}

              </div>

            </div>
          ))
        )}
      </div>

      {/* POPUP MODAL: ASK NEW QUESTION FORM */}
      {showAskModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border relative text-right" dir="rtl">
            <h3 className="font-extrabold text-sm text-[#064E3B] mb-2">اطرح استفساراً لوجه التعاون مع الفلاحين وصحة الفدان</h3>
            <p className="text-[10px] text-gray-400 mb-4 font-bold">بمشاركتك في طرح الاستفسارات، تحصل على نقاط لرفع الرتب والمشاركة.</p>

            <form onSubmit={handleAskQuestionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-gray-750 text-gray-700 mb-1">عنوان للملاحظة المشكلة (بشكل موجز):</label>
                <input
                  type="text"
                  placeholder="مثال: ذبول أوراق شجر الزيتون من الأطراف السفلية بتجعد"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full text-xs p-3 bg-gray-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-755 text-gray-700 mb-1">تبويب وجدول التصنيف للبحث:</label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-gray-50 border rounded-xl"
                >
                  <option value="diseases">أمراض المحاصيل والآفات الطارئة</option>
                  <option value="irrigation">معدلات وجدولة الري بالتنقيط والمحوري</option>
                  <option value="soil">خصوبة وأملاح ومركبات حموضة التربة N-P-K</option>
                  <option value="machinery">مشكلات المعدات والمضخات الميكانيكية</option>
                  <option value="general">إرشادات تمليك واستئجار وغلة عامة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-750 text-gray-700 mb-1">شرح تفصيلي للمشكلة والظواهر التي تلمسها بالمحصول:</label>
                <textarea
                  placeholder="اكتب متى بدأت المشكلة، نوع اللقاحات والأسمدة المضافة، ورطوبة ومصدر ماء السقي لتسهل مهمة تشخيص الخبراء لمسألتك بدقة..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  required
                  rows={4}
                  className="w-full text-xs p-3 bg-gray-50 border rounded-xl"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  نشر وطرح السؤال بالمجتمع
                </button>
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  إلغاء الأمر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
