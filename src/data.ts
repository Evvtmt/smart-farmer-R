/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Farm,
  SoilSensorData,
  CropGrowthStage,
  WeatherDay,
  IrrigationPlan,
  StockItem,
  Machine,
  LiveCameraFeed,
  MarketplaceItem,
  AgEngineer,
  FinancialRecord,
} from "./types";

// Egypt Governorates list
export const EgyptGovernorates = [
  "البحيرة",
  "الشرقية",
  "الدقهلية",
  "كفر الشيخ",
  "المنوفية",
  "الفيوم",
  "المنيا",
  "أسيوط",
  "سوهاج",
  "الوادي الجديد",
  "توشكى والجنوب",
];

// Initial preloaded Farms in Egypt
export const initialFarms: Farm[] = [
  {
    id: "farm-1",
    name: "مزرعة الدلتا الخضراء",
    location: "طريق دمنهور الزراعي",
    governorate: "البحيرة",
    size: 45,
    crops: ["قمح", "بطاطس", "طماطم"],
    establishedDate: "2018-03-15",
    boundaryPoints: [
      { lat: 31.04, lng: 30.45 },
      { lat: 31.05, lng: 30.45 },
      { lat: 31.05, lng: 30.46 },
      { lat: 31.04, lng: 30.46 },
    ],
    status: "perfect",
    soilType: "طينية خصبة (Delta Silt)",
    waterSource: "مشروع ترعة المحمودية + ري بالتنقيط",
  },
  {
    id: "farm-2",
    name: "مشروع نماء جنوب الوادي",
    location: "المحور الرئيسي - هضبة توشكى",
    governorate: "توشكى والجنوب",
    size: 150,
    crops: ["قمح", "تمور مجهول", "شعير"],
    establishedDate: "2020-11-20",
    boundaryPoints: [
      { lat: 22.50, lng: 31.50 },
      { lat: 22.52, lng: 31.50 },
      { lat: 22.52, lng: 31.52 },
      { lat: 22.50, lng: 31.52 },
    ],
    status: "perfect",
    soilType: "رملية صحراوية مستصلحة",
    waterSource: "فرع ترعة الشيخ زايد (مياه النيل)",
  },
  {
    id: "farm-3",
    name: "مزرعة واحة الفيوم النموذجية",
    location: "شمال بحيرة قارون",
    governorate: "الفيوم",
    size: 22,
    crops: ["زيتون", "عنب بناتي", "طماطم"],
    establishedDate: "2015-05-10",
    boundaryPoints: [
      { lat: 29.40, lng: 30.65 },
      { lat: 29.41, lng: 30.65 },
      { lat: 29.41, lng: 30.66 },
      { lat: 29.40, lng: 30.66 },
    ],
    status: "warning",
    soilType: "طميية رملية متوسطة",
    waterSource: "بئر جوفي عميق + ري محوري",
  },
];

// Soil Sensors Data matched to farms
export const initialSoilData: SoilSensorData[] = [
  {
    farmId: "farm-1",
    moisture: 72,
    temperature: 24.5,
    ph: 6.8,
    nitrogen: 145, // N
    phosphorus: 42, // P
    potassium: 280, // K
    healthScore: 92,
    lastUpdated: "منذ 10 دقائق",
  },
  {
    farmId: "farm-2",
    moisture: 58,
    temperature: 32.1,
    ph: 7.9,
    nitrogen: 110,
    phosphorus: 31,
    potassium: 195,
    healthScore: 85,
    lastUpdated: "منذ 15 دقيقة",
  },
  {
    farmId: "farm-3",
    moisture: 42, // Low moisture triggering warning
    temperature: 29.2,
    ph: 7.2,
    nitrogen: 88, // Slightly low Nitrogen
    phosphorus: 25,
    potassium: 160,
    healthScore: 68,
    lastUpdated: "منذ دقيقتين",
  },
];

// Crop Stage tracking
export const initialCropGrowth: CropGrowthStage[] = [
  {
    id: "stage-1",
    cropName: "القمح المصري - سدس 14",
    variety: "سدس 14 (مقاوم للصدأ)",
    stageName: "مرحلة طرد السنابل (Earing Stage)",
    progress: 78,
    daysToHarvest: 35,
    expectedYield: 24, // 24 اردب / فدان تقريباً
    irrigationStatus: "optimal",
    healthScore: 95,
  },
  {
    id: "stage-2",
    cropName: "البطاطس - سبونتا",
    variety: "سبونتا مستوردة",
    stageName: "مرحلة نمو الدرنات (Tuber Bulking)",
    progress: 85,
    daysToHarvest: 18,
    expectedYield: 18, // طن / فدان
    irrigationStatus: "saturated",
    healthScore: 90,
  },
  {
    id: "stage-3",
    cropName: "تمور المجدول",
    variety: "مجدول نسيجي فاخر",
    stageName: "اكتمال نمو الأزهار واللقاح",
    progress: 45,
    daysToHarvest: 110,
    expectedYield: 8, // طن
    irrigationStatus: "optimal",
    healthScore: 98,
  },
  {
    id: "stage-4",
    cropName: "طماطم - هجين 023",
    variety: "هجين بحثي محلي",
    stageName: "مرحلة التزهير وعقد الثمار (Flowering)",
    progress: 60,
    daysToHarvest: 28,
    expectedYield: 25, // طن / فدان
    irrigationStatus: "dry", // Low moisture, requires attention
    healthScore: 72,
  },
];

// Egypt Climate weather intelligence
export const initialWeather: WeatherDay[] = [
  {
    date: "السبت (اليوم)",
    tempMax: 34,
    tempMin: 21,
    condition: "مشمس وحار",
    icon: "sun",
    humidity: 45,
    windSpeed: 18,
    rainProb: 0,
    uvIndex: 9,
    alert: "موجة حارة متوسطة تبدأ اليوم في وسط الدلتا وجنوب الصعيد",
  },
  {
    date: "الأحد (غداً)",
    tempMax: 36,
    tempMin: 22,
    condition: "مشمس شديد الحرارة",
    icon: "sun",
    humidity: 40,
    windSpeed: 21,
    rainProb: 0,
    uvIndex: 10,
    alert: "تحذير: ذروة الموجة الحارة. تجنب الري في فترة الظهيرة لمنع التبخر والإجهاد المائي",
  },
  {
    date: "الإثنين",
    tempMax: 35,
    tempMin: 22,
    condition: "مشمس ومغبر قليلاً",
    icon: "wind",
    humidity: 38,
    windSpeed: 26,
    rainProb: 0,
    uvIndex: 9,
    alert: "رياح الخماسين خفيفة السرعة محملة ببعض الأتربة بالصحراء الغربية",
  },
  {
    date: "الثلاثاء",
    tempMax: 32,
    tempMin: 20,
    condition: "غائم جزئي مع انخفاض للحرارة",
    icon: "cloud-sun",
    humidity: 50,
    windSpeed: 14,
    rainProb: 5,
    uvIndex: 7,
  },
  {
    date: "الأربعاء",
    tempMax: 30,
    tempMin: 19,
    condition: "لطيف غائم جزئياً",
    icon: "cloud",
    humidity: 55,
    windSpeed: 12,
    rainProb: 10,
    uvIndex: 6,
  },
  {
    date: "الخميس",
    tempMax: 29,
    tempMin: 18,
    condition: "صحو ومعتدل",
    icon: "sun",
    humidity: 52,
    windSpeed: 11,
    rainProb: 0,
    uvIndex: 8,
  },
  {
    date: "الجمعة",
    tempMax: 31,
    tempMin: 19,
    condition: "مشمس ربيعي معتدل",
    icon: "sun",
    humidity: 48,
    windSpeed: 13,
    rainProb: 0,
    uvIndex: 8,
  },
];

// Custom 14-days projection extension titles
export const remainingDaysForecast = [
  { date: "السبت القادم", tempMax: 32, tempMin: 19, condition: "معتدل مشمس" },
  { date: "الأحد القادم", tempMax: 33, tempMin: 20, condition: "معتدل مشمس" },
  { date: "الإثنين القادم", tempMax: 34, tempMin: 21, condition: "مشمس رطب" },
  { date: "الثلاثاء القادم", tempMax: 35, tempMin: 22, condition: "حار الرطوبة" },
  { date: "الأربعاء القادم", tempMax: 33, tempMin: 21, condition: "غائم ربيعي" },
  { date: "الخميس القادم", tempMax: 31, tempMin: 19, condition: "لطيف صافي" },
  { date: "الجمعة القادمة", tempMax: 32, tempMin: 20, condition: "معتدل وصافي" },
];

export const initialIrrigationPlans: IrrigationPlan[] = [
  {
    id: "irr-1",
    farmName: "مزرعة الدلتا الخضراء",
    cropType: "قمح",
    scheduleTime: "اليوم الساعة 06:00 مساءً",
    durationMinutes: 45,
    waterVolumeLiter: 22000,
    method: "sprinkler",
    status: "scheduled",
  },
  {
    id: "irr-2",
    farmName: "مشروع نماء جنوب الوادي",
    cropType: "تمور مجهول",
    scheduleTime: "اليوم الساعة 09:00 مساءً",
    durationMinutes: 90,
    waterVolumeLiter: 45000,
    method: "drip",
    status: "active",
  },
  {
    id: "irr-3",
    farmName: "مزرعة واحة الفيوم النموذجية",
    cropType: "طماطم",
    scheduleTime: "منذ ساعتين (انتهى)",
    durationMinutes: 30,
    waterVolumeLiter: 12000,
    method: "drip",
    status: "completed",
  },
];

export const initialWarehouseStock: StockItem[] = [
  {
    id: "stock-1",
    name: "تقاوي قمح مصر 3",
    category: "seeds",
    quantity: 1250,
    unit: "كجم",
    minLimit: 500,
    location: "مخزن الدلتا الرئيسي",
  },
  {
    id: "stock-2",
    name: "سماد يوريا نتروجيني 46%",
    category: "fertilizers",
    quantity: 350, // Low Stock Trigger!
    unit: "شيكارة 50كجم",
    minLimit: 400,
    location: "مخزن البحيرة اللوجستي",
  },
  {
    id: "stock-3",
    name: "مبيد فطري نحاسي (شبه نانو)",
    category: "pesticides",
    quantity: 85,
    unit: "لتر",
    minLimit: 30,
    location: "مستودع الكيماويات الداخلي",
  },
  {
    id: "stock-4",
    name: "خرطوم ري بالتنقيط قطر 16مم",
    category: "equipment",
    quantity: 12,
    unit: "لفيفة 400 متر",
    minLimit: 5,
    location: "مخزن المعدات بتوشكى",
  },
  {
    id: "stock-5",
    name: "فلاتر تنقية مياه مركزية ميكرونية",
    category: "spares",
    quantity: 2, // Low stock alert!
    unit: "فلتر عملاق",
    minLimit: 4,
    location: "صيانة محطات توشكى",
  },
];

export const initialMachinery: Machine[] = [
  {
    id: "mach-1",
    name: "جرار زراعي جون دير 6120M",
    type: "جرار ذكي مزود بـ GPS",
    status: "active",
    fuelLevel: 82,
    hoursUsed: 1420,
    gpsLocation: { lat: 31.045, lng: 30.455 },
    upcomingMaintenance: "2026-06-15",
  },
  {
    id: "mach-2",
    name: "حصادة نيوهولاند TC 5.30",
    type: "حصادة قمح عملاقة",
    status: "idle",
    fuelLevel: 45,
    hoursUsed: 890,
    gpsLocation: { lat: 22.508, lng: 31.505 },
    upcomingMaintenance: "2026-06-02",
  },
  {
    id: "mach-3",
    name: "مضخة ري محورية فالي 9500",
    type: "مضخة كهربائية وإنترنت أشياء",
    status: "error", // Fault detected!
    fuelLevel: 100,
    hoursUsed: 4320,
    gpsLocation: { lat: 29.405, lng: 30.654 },
    upcomingMaintenance: "صيانة فورية - عطل تدفق ميكانيكي",
  },
];

export const initialCameras: LiveCameraFeed[] = [
  {
    id: "cam-1",
    name: "بوابة المخازن واللوجستيات",
    status: "online",
    isMotionDetected: false,
    streamUrl: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "cam-2",
    name: "الحوض التجريبي رقم 3 - الصوب الذكية",
    status: "online",
    isMotionDetected: true, // Triggering warning alert
    streamUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "cam-3",
    name: "حظيرة الماشية والتسمين الغربية",
    status: "online",
    isMotionDetected: false,
    streamUrl: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=400&q=80",
  },
];

export const initialMarketplace: MarketplaceItem[] = [
  {
    id: "market-1",
    title: "تقاوي قمح مصر 3 عالية الإنتاجية والجودة",
    category: "buy-seed",
    price: 1850,
    unit: "أردب مقفل معتمد بروابط حكومية",
    seller: "الشركة المصرية العامة للتقاوي والزراعة",
    phone: "19404",
    governorate: "البحيرة",
    imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "market-2",
    title: "سماد نترات نشادر سوبر بلدي (مخصب حيوي ممتاز)",
    category: "buy-fertilizer",
    price: 480,
    unit: "شيكارة 50كجم",
    seller: "المصنع الكيماوي لوزارة الإنتاج الحربي مصر",
    phone: "01004245987",
    governorate: "الدقهلية",
    imageUrl: "https://images.unsplash.com/photo-1563514224-15967f0273c3?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "market-3",
    title: "جرار زراعي روتاري ٩٠ حصان إيجار يومي مع السائق",
    category: "rent-machine",
    price: 1200,
    unit: "يومية عمل بحد أقصى ٨ ساعات",
    seller: "أبو آدم لتشغيل وتجهيز الآلات الحديثة بالشراكة مع الإرشاد",
    phone: "01224859610",
    governorate: "الشرقية",
    imageUrl: "https://images.unsplash.com/photo-1530268884323-289dbf77c5ba?auto=format&fit=crop&w=300&q=80",
  },
];

export const initialEngineers: AgEngineer[] = [
  {
    id: "eng-1",
    name: "المهندس شريف عبدالرحمن",
    specialty: "أخصائي باكتريولوجي وأمراض نباتات الدلتا",
    rating: 4.9,
    reviewsCount: 142,
    experienceYears: 18,
    phone: "01012356947",
    governorate: "البحيرة",
    imageUrl: "https://images.unsplash.com/photo-1618015358954-115ef1ed1815?auto=format&fit=crop&w=200&h=200&q=80",
    availableOnline: true,
  },
  {
    id: "eng-2",
    name: "د. عبدالحميد جلال",
    specialty: "مستشار استصلاح رملي وزراعات صحراوية ذكية",
    rating: 4.8,
    reviewsCount: 89,
    experienceYears: 22,
    phone: "01155986341",
    governorate: "توشكى والجنوب",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80",
    availableOnline: true,
  },
  {
    id: "eng-3",
    name: "المهندسة رانيا الشوربجي",
    specialty: "خبيرة ري بالتنقيط وموازنات هيدروليكية للنباتات الطبية",
    rating: 4.7,
    reviewsCount: 65,
    experienceYears: 12,
    phone: "01233669854",
    governorate: "الفيوم",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80",
    availableOnline: false,
  },
];

export const initialFinancialRecords: FinancialRecord[] = [
  {
    id: "fin-1",
    type: "revenue",
    category: "توريد قمح مالي",
    amount: 320000,
    date: "2026-05-20",
    farmId: "farm-1",
    description: "توريد الصومعة الحكومية بالبحيرة - الدفعة الاستلامية الأولى ٢٢ أردب",
  },
  {
    id: "fin-2",
    type: "expense",
    category: "مرتبات عمالة",
    amount: 18000,
    date: "2026-05-25",
    farmId: "farm-1",
    description: "أجور عمالة فرز البطاطس اليدوية في فترات المساء والمتابعة والجمع",
  },
  {
    id: "fin-3",
    type: "expense",
    category: "شراء أسمدة ومخصبات عملاقة",
    amount: 65000,
    date: "2026-05-18",
    farmId: "farm-2",
    description: "سماد فوسفاتي وبوتاسي لنخيل المجدول المستصلح في رمل جنوب توشكى",
  },
  {
    id: "fin-4",
    type: "revenue",
    category: "عقود تصدير موالح",
    amount: 154000,
    date: "2026-05-28",
    farmId: "farm-3",
    description: "دفعة حجز أولية لعنب التصدير الفاخر الممتاز بالفيوم لشحن الخارج الإيطالي",
  },
];

// Livestock populations
export const initialLivestock = {
  cattle: { count: 32, label: "أبقار تسمين وإنتاج وراثي خليط وجيرسي", dailyFeedQtyKg: 450, vaccineDate: "2026-05-15" },
  buffalo: { count: 18, label: "جاموس فريزيان محلي وتناسل حليبي", dailyFeedQtyKg: 300, vaccineDate: "2026-04-20" },
  sheep: { count: 85, label: "أغنام برقي مطروحي وسلالات لحم ممتازة", dailyFeedQtyKg: 120, vaccineDate: "2026-05-28" },
  poultry: { count: 2500, label: "دجاج بياض سلالة اللوهمان الأبيض عمر ٢٢٠ يوم", dailyFeedQtyKg: 280, vaccineDate: "2026-05-10" },
};

// Fish farm parameters
export const initialFishFarm = {
  species: [
    { name: "بلطي نيلي ممتاز درجة أولى", count: 8500, averageWeightGrams: 350, healthStatus: "ممتاز" },
    { name: "بوري بلدي بحري مستزرع في عذب", count: 4200, averageWeightGrams: 550, healthStatus: "مستقر" },
    { name: "مبروك حشائش للفلترة والتهوية", count: 1200, averageWeightGrams: 800, healthStatus: "نشط للغاية" },
  ],
  waterQuality: {
    temp: 26.8, // Celsius
    ph: 7.4,
    oxygen: 6.2, // mg/L - Normal
    ammonia: 0.12, // mg/L - Safe
  },
  feedingTimes: ["الساعة 07:00 صباحاً", "الساعة 03:00 عصراً"],
};

// Community Forum posts
export const communityPosts = [
  {
    id: "post-1",
    author: "الحاج رفعت المنوفي",
    title: "مكافحة حشرة الحشد الخريفية في حقول الذرة الشامية بمصر والحل النهائي",
    content: "يا إخواني ظهرت عندي حشرة الحشد، استخدمت سموم حيوية موجهة بالاستشارة مع المهندس الزراعي، أنصحكم بالرش في الغبش الباكر جداً والمواصلة على التنظيف المستمر الفوري من بقايا المحصول السابق.",
    likes: 42,
    comments: 8,
    date: "منذ ٣ ساعات",
  },
  {
    id: "post-2",
    author: "م. كريم البارودي (مركز البحوث الزراعية)",
    title: "نشرة إرشادية حول كمية المياه المطلوبة لسماد القمح مرحلة طرد السنابل",
    content: "وزارة الزراعة والمعهد ينصحون الآن بتجنب الغمر الجائر والمحافظة التامة على معدلات ري بالتنقيط أو الرش المحوري بحدود ٢٤ متر مكعب لكل فدان في الموجات الحارة لتثبيت الحبوب والوقاية من تفقعها السريع.",
    likes: 81,
    comments: 15,
    date: "منذ يوم واحد",
  },
];

export const agricultureNews = [
  {
    id: "news-1",
    title: "المركز الإرشادي يطلق تسعيرة توريد الإردب الذهبي للقمح لعام ٢٠٢٦ بقيم ريادية غير مسبوقة لدعم المزارع الصغير",
    date: "منذ ساعتين",
    category: "تحديثات حكومية",
    source: "وزارة الزراعة واستصلاح الأراضي",
  },
  {
    id: "news-2",
    title: "مصر تستقبل أول قمر صناعي زراعي مخصص لرصد الجفاف وصحة التربة في أفريقيا بالشراكة مع وكالة الفضاء المصرية",
    date: "منذ يوم واحد",
    category: "ابتكار وتكنولوجيا",
    source: "وكالة الفضاء المصرية + الهيئة القومية للاستشعار عن بعد",
  },
];
