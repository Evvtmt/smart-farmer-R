import React from "react";
import { 
  Award, 
  Trophy, 
  Star, 
  ShieldCheck, 
  Sprout, 
  Wrench, 
  Flame, 
  User, 
  TrendingUp, 
  DollarSign, 
  CheckCircle,
  HelpCircle,
  MapPin,
  Clock,
  Sparkles,
  MessageSquare
} from "lucide-react";
import { FarmerBadge, LeaderboardUser } from "../types";

interface GamificationCenterProps {
  points: number;
  userGovernorate: string;
  userName: string;
}

export default function GamificationCenter({ points, userGovernorate, userName }: GamificationCenterProps) {
  
  // Custom levels calculation
  const pointsPerLevel = 250;
  const currentLevel = Math.floor(points / pointsPerLevel) + 1;
  const pointsInCurrentLevel = points % pointsPerLevel;
  const percentToNextLevel = Math.round((pointsInCurrentLevel / pointsPerLevel) * 100);
  const remainingPointsForNextLevel = pointsPerLevel - pointsInCurrentLevel;

  // Egypt governorate top list (Generates realistic challengers in same governorate)
  const basePeerLeaderboard: Record<string, LeaderboardUser[]> = {
    "البحيرة": [
      { rank: 1, name: "الحاج عبد الحميد البجاوي", governorate: "البحيرة", points: 1450, avatarColor: "bg-emerald-600" },
      { rank: 2, name: `${userName} (أنت)`, governorate: "البحيرة", points: points, isCurrentUser: true, avatarColor: "bg-amber-500" },
      { rank: 3, name: "المهندسة منى عبد الوهاب", governorate: "البحيرة", points: 680, avatarColor: "bg-blue-600" },
      { rank: 4, name: "الحاج صبري أبو زهرة", governorate: "البحيرة", points: 520, avatarColor: "bg-rose-600" },
      { rank: 5, name: "الأستاذ رأفت الدش", governorate: "البحيرة", points: 390, avatarColor: "bg-purple-600" }
    ],
    "توشكى والجنوب": [
      { rank: 1, name: "الدكتور واصف عريضة", governorate: "توشكى والجنوب", points: 1850, avatarColor: "bg-teal-600" },
      { rank: 2, name: `${userName} (أنت)`, governorate: "توشكى والجنوب", points: points, isCurrentUser: true, avatarColor: "bg-amber-500" },
      { rank: 3, name: "المهندس عادل نصير", governorate: "توشكى والجنوب", points: 820, avatarColor: "bg-indigo-600" },
      { rank: 4, name: "مزارع نماء المستصلحة", governorate: "توشكى والجنوب", points: 660, avatarColor: "bg-cyan-600" },
      { rank: 5, name: "الحاج أحمد العبادي", governorate: "توشكى والجنوب", points: 410, avatarColor: "bg-green-600" }
    ]
  };

  // Safe fallback if user governorate does not have pre-seeded peers
  const activeLeaderboard: LeaderboardUser[] = (basePeerLeaderboard[userGovernorate] || [
    { rank: 1, name: "مزارع النموذج الريادي", governorate: userGovernorate, points: 1200, avatarColor: "bg-emerald-700" },
    { rank: 2, name: `${userName} (أنت)`, governorate: userGovernorate, points: points, isCurrentUser: true, avatarColor: "bg-amber-500" },
    { rank: 3, name: "مراقب المصلحة الحكومية", governorate: userGovernorate, points: 710, avatarColor: "bg-sky-600" },
    { rank: 4, name: "مطور الغلة الحقلية", governorate: userGovernorate, points: 450, avatarColor: "bg-pink-600" },
    { rank: 5, name: "الباحث الإرشادي المحلي", governorate: userGovernorate, points: 320, avatarColor: "bg-amber-700" }
  ]).sort((a,b) => b.points - a.points).map((item, idx) => ({ ...item, rank: idx + 1 }));

  // Badges lists based on user points
  const systemBadges: FarmerBadge[] = [
    {
      id: "b-1",
      title: "صك الحيازة الرقمي المصدّق",
      description: "تم حصر وتسجيل أول مزرعة بنجاح بنظام الكارت الذكي للوزارة.",
      iconName: "sprout",
      pointsRequired: 100,
      isUnlocked: points >= 100,
      colorClass: "bg-emerald-500 text-white"
    },
    {
      id: "b-2",
      title: "حارس الرطوبة الكيميائي",
      description: "حقق مؤشرات خصوبة N-P-K وصحة تربة فدان بنسبة تتجاوز 90%.",
      iconName: "shield",
      pointsRequired: 300,
      isUnlocked: points >= 300,
      colorClass: "bg-blue-500 text-white"
    },
    {
      id: "b-3",
      title: "مرشد الفلاح القومي",
      description: "ساهم بمشاركة ردود أو حلول وإغلاق تساؤلات بمجتمع الإرشاد الرقمي.",
      iconName: "users",
      pointsRequired: 450,
      isUnlocked: points >= 450,
      colorClass: "bg-amber-500 text-slate-950"
    },
    {
      id: "b-4",
      title: "أخصائي الاستبصار الأوفلاين",
      description: "أنجز إيداع حركات مخزنية أو زراعية بنجاح في وضع غياب الشبكة ومزامنتها.",
      iconName: "wrench",
      pointsRequired: 600,
      isUnlocked: points >= 600,
      colorClass: "bg-purple-500 text-white"
    },
    {
      id: "b-5",
      title: "سفير التكافل والذهب الأصفر",
      description: "تجاوز مجموع نطاق النقاط حاجز الـ 1000 نقطة لدعم استدامة مصر الرقمية.",
      iconName: "award",
      pointsRequired: 1000,
      isUnlocked: points >= 1000,
      colorClass: "bg-amber-600 text-white"
    }
  ];

  // Map icon component helpers
  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "sprout": return <Sprout className="w-6 h-6" />;
      case "shield": return <ShieldCheck className="w-6 h-6" />;
      case "wrench": return <Wrench className="w-6 h-6" />;
      case "users": return <User className="w-6 h-6" />;
      default: return <Award className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* Hero Welcome Progress Level bar */}
      <div className="bg-[#064E3B] text-white rounded-3xl p-6 shadow-md relative overflow-hidden border border-[#059669]">
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#F59E0B]/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 z-10 relative">
          
          {/* Level information */}
          <div className="space-y-2 text-center sm:text-right">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="bg-[#F59E0B] text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full select-none">
                المستوى {currentLevel} • الفلاح الذهبي الريادي
              </span>
              <Flame className="w-5 h-5 text-[#F59E0B] animate-bounce" />
            </div>
            <h3 className="text-xl font-black">رتبة ونقاط المهندس {userName}</h3>
            <p className="text-[11px] text-[#F0F4F0]/85">
              رصيدك الحسابي: <strong className="text-[#F59E0B] font-mono font-black text-sm">{points}</strong> نقطة ذكية. تحتاج إلى <strong>{remainingPointsForNextLevel}</strong> نقطة للترقية للمستوى القادم.
            </p>
          </div>

          {/* Level Big Badge representation */}
          <div className="w-24 h-24 rounded-2xl bg-[#043d2e] border-2 border-[#F59E0B] flex flex-col items-center justify-center p-2 text-center shadow-lg relative shrink-0">
            <Trophy className="w-9 h-9 text-[#F59E0B] mb-1 shrink-0" />
            <span className="text-[10px] text-[#F0F4F0] font-bold block">مجموع النقاط</span>
            <span className="text-base font-black font-mono text-[#F59E0B] block mt-0.5">{points} XP</span>
          </div>

        </div>

        {/* Level Progression Progress Bar */}
        <div className="mt-6 space-y-1.5 relative z-10">
          <div className="flex justify-between text-[11px] text-[#F0F4F0]/90">
            <span>الترقية للمستوى {currentLevel + 1}</span>
            <span>{percentToNextLevel}% متقدم ({pointsInCurrentLevel} / {pointsPerLevel} XP)</span>
          </div>
          <div className="w-full bg-[#043d2e] h-3.5 rounded-full overflow-hidden border border-emerald-800 shadow-inner">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-[#F59E0B] h-full rounded-full transition-all duration-1000"
              style={{ width: `${percentToNextLevel}%` }}
            />
          </div>
        </div>
      </div>

      {/* TWO BLOCK PORTION: LOCAL LEADERBOARD & BADGES UNLOCK SHOWCASE */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* LEADERBOARD BOX (3/5 columns in layout) */}
        <div className="lg:col-span-3 bg-white border rounded-3xl p-5.5 shadow-sm space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100 flex-wrap gap-2">
            <div>
              <h4 className="font-extrabold text-sm text-[#064E3B] flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#F59E0B]" />
                <span>المجلس الريادي للفلاحين في محافظة {userGovernorate}</span>
              </h4>
              <p className="text-[10px] text-gray-400 font-bold">يتم تحديث الترتيب تلقائياً حسب بيانات الحيازة المتراكمة</p>
            </div>
            
            <span className="text-[9px] bg-emerald-50 text-emerald-800 font-black px-2 py-1 rounded-lg">
              محلي • رتبة {userGovernorate}
            </span>
          </div>

          {/* Leaderboard user list */}
          <div className="space-y-3">
            {activeLeaderboard.map((u, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-2xl flex items-center justify-between border transition-all ${
                  u.isCurrentUser 
                    ? "bg-[#F0F4F0] border-emerald-400/80 shadow-md transform scale-[1.01]" 
                    : "bg-slate-50/50 border-gray-100 hover:bg-slate-50"
                }`}
              >
                {/* Right metadata Rank + User info */}
                <div className="flex items-center gap-3 text-right">
                  {/* Rank circle with colors */}
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] shrink-0 ${
                    u.rank === 1 ? "bg-yellow-400 text-slate-950" : u.rank === 2 ? "bg-slate-300 text-slate-900" : u.rank === 3 ? "bg-amber-600 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {u.rank}
                  </span>

                  {/* Avatar & text name */}
                  <div className={`w-8 h-8 rounded-full ${u.avatarColor} flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-inner`}>
                    {u.name[0]}
                  </div>

                  <div>
                    <strong className="text-xs text-slate-800 font-black block leading-none">
                      {u.name}
                    </strong>
                    <span className="text-[9.5px] text-gray-400 font-bold block mt-1 leading-none">{u.governorate} • كارت ذكي</span>
                  </div>
                </div>

                {/* Left points display */}
                <div className="text-left">
                  <span className="text-xs font-mono font-black text-[#064E3B]">{u.points} XP</span>
                  {u.isCurrentUser && (
                    <span className="text-[8.5px] text-[#059669] font-black block mt-0.5 animate-pulse">ترتيبك الحالي ★</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Motivation advice */}
          <div className="bg-[#F0F4F0]/40 p-3 rounded-2xl text-[10px] text-[#064E3B] font-bold border border-emerald-150">
            💡 <strong>توجيه ريادي ومحفز:</strong> أنت على بعد خطوة واحدة فقط يا باشمهندس {userName} من إزاحة الصدارة وتصدر محافظة {userGovernorate}! قم بإكمال إيداع التقارير ومزامنة حركات مستودعك لتغذية معدلك بـ 150XP إضافية فوراً.
          </div>
        </div>

        {/* BADGES METRICS SYSTEM (2/5 columns in layout) */}
        <div className="lg:col-span-2 bg-white border rounded-3xl p-5.5 shadow-sm space-y-4">
          <div>
            <h4 className="font-extrabold text-sm text-[#064E3B] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>أوسمة محافل التميز والإنتاج</span>
            </h4>
            <p className="text-[10px] text-gray-400 font-medium">أوسمة فخرية تمنح في المعارض القومية للبحوث</p>
          </div>

          {/* Badges mapped inline */}
          <div className="space-y-3.5">
            {systemBadges.map((b) => (
              <div 
                key={b.id} 
                className={`p-3 rounded-2xl border flex items-start gap-3 transition-opacity ${
                  b.isUnlocked 
                    ? "bg-white border-emerald-100 opacity-100" 
                    : "bg-slate-50/20 border-gray-100 opacity-60 filter grayscale-[20%]"
                }`}
                title={b.isUnlocked ? `مفتوح بفضل رصيد نقاطك (${b.pointsRequired}XP)` : `مقفل - يتطلب ${b.pointsRequired} نقطة`}
              >
                {/* Badge visual orb icon */}
                <div className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center shadow-md ${
                  b.isUnlocked ? b.colorClass : "bg-gray-100 text-gray-400"
                }`}>
                  {getBadgeIcon(b.iconName)}
                </div>

                {/* Badge description */}
                <div className="text-right flex-1">
                  <div className="flex items-center gap-1.5 justify-between">
                    <strong className={`text-[11.5px] font-black ${b.isUnlocked ? "text-slate-800" : "text-gray-400"}`}>
                      {b.title}
                    </strong>
                    <span className={`text-[8.5px] font-semibold px-1.5 py-0.5 rounded-full ${
                      b.isUnlocked ? "bg-emerald-50 text-[#059669]" : "bg-slate-100 text-gray-400"
                    }`}>
                      {b.isUnlocked ? "مكتسب" : `يتطلب: ${b.pointsRequired} XP`}
                    </span>
                  </div>
                  <p className="text-[9.5px] text-gray-500 leading-snug mt-1 font-medium select-none">
                    {b.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* GAME SCORE SYSTEMS MANUAL & METADATA SECTION */}
      <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4 text-right">
        <div>
          <h4 className="font-extrabold text-xs text-[#064E3B] block">كتلوج تجميع النقاط الذكية ومعايير المطابقة القومية:</h4>
          <p className="text-[10px] text-gray-400 mt-0.5">تابع التفاصيل الدقيقة لكسب ثمرة التنافس بين المحافظات</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-slate-50/70 border p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Sprout className="w-4 h-4" />
            </div>
            <div className="text-right">
              <span className="text-[9.5px] text-gray-400 font-bold block">إثبات حيازة فدان</span>
              <strong className="text-xs text-slate-800 block mt-0.5">+100 نقطة</strong>
            </div>
          </div>

          <div className="bg-slate-50/70 border p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
            <div className="text-right">
              <span className="text-[9.5px] text-gray-400 font-bold block">مزامنة أوفلاين مؤجلة</span>
              <strong className="text-xs text-slate-800 block mt-0.5">+50 نقطة</strong>
            </div>
          </div>

          <div className="bg-slate-50/70 border p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="text-right">
              <span className="text-[9.5px] text-gray-400 font-bold block">طرح وحل مسألة إرشاد</span>
              <strong className="text-xs text-slate-800 block mt-0.5">+30 إلى +50 نقطة</strong>
            </div>
          </div>

          <div className="bg-slate-50/70 border p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-right">
              <span className="text-[9.5px] text-gray-400 font-bold block">كفاءة حيوية 90%+</span>
              <strong className="text-xs text-slate-800 block mt-0.5">+150 نقطة كبرى</strong>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
