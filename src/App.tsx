/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, Farm, SoilSensorData, CropGrowthStage, StockItem, Machine, FinancialRecord, ChatMessage, IrrigationPlan, WeatherDay } from "./types";
import { 
  EgyptGovernorates,
  initialFarms,
  initialSoilData,
  initialCropGrowth,
  initialWeather,
  remainingDaysForecast,
  initialIrrigationPlans,
  initialWarehouseStock,
  initialMachinery,
  initialCameras,
  initialMarketplace,
  initialEngineers,
  initialFinancialRecords,
  initialLivestock,
  initialFishFarm,
  communityPosts,
  agricultureNews
} from "./data";

// Import custom modular sections
import Splash from "./components/Splash";
import Auth from "./components/Auth";
import InteractiveMap from "./components/InteractiveMap";
import RealGISMap from "./components/RealGISMap";
import AgronomicIrrigationCalculator from "./components/AgronomicIrrigationCalculator";
import AdminMetricsDashboard from "./components/AdminMetricsDashboard";
import AIDiagnosis from "./components/AIDiagnosis";
import AIAssistant from "./components/AIAssistant";
import ReportsPanel from "./components/ReportsPanel";
import CommunityQA from "./components/CommunityQA";
import GamificationCenter from "./components/GamificationCenter";
import AIIrrigationPredictor from "./components/AIIrrigationPredictor";
import IoTIntegrationModal from "./components/IoTIntegrationModal";
import { 
  fetchLiveEgyptWeather, 
  EGYPTIAN_GOVERNORATES_COORDS, 
  getCurrentGpsPosition, 
  sendPhysicalPumpCommand, 
  fetchLatestIoTTelemetry,
  apiGetFarms,
  apiCreateFarm,
  apiGetMe
} from "./services/realDataService";

// Lucide Icons
import { 
  Sprout, 
  Droplets, 
  Thermometer, 
  Map as MapIcon, 
  Search, 
  Plus, 
  Settings, 
  User as UserIcon, 
  Wheat, 
  Activity, 
  CloudSun, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  FileText, 
  LayoutDashboard, 
  Store, 
  Users, 
  Bell, 
  BookOpen, 
  Calendar, 
  DollarSign, 
  Wrench, 
  ShieldAlert, 
  Camera, 
  Layers,
  Sparkles,
  RefreshCw,
  Clock,
  LogOut,
  Maximize2,
  MessageSquare,
  Trophy,
  Wifi,
  WifiOff,
  Zap,
  MapPin,
  ShieldCheck,
  Navigation,
  Cpu,
  Radio,
  Globe
} from "lucide-react";
import { OfflineAction } from "./types";

const defaultPilotUser: User = {
  name: "الحاج أحمد عبد الله",
  email: "ahmed.farmer@agrigen.eg",
  phone: "01012345678",
  role: "farmer",
  governorate: "البحيرة",
  farmSize: 45,
};

export default function App() {
  const [sessionState, setSessionState] = useState<"splash" | "auth" | "dashboard">("dashboard");
  const [currentUser, setCurrentUser] = useState<User | null>(defaultPilotUser);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  
  // Gamification and Offline Mode states
  const [userPoints, setUserPoints] = useState<number>(580);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStepText, setSyncStepText] = useState<string>("");
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>([]);

  // Live Meteorological Weather & IoT Hardware States
  const [weather, setWeather] = useState<WeatherDay[]>(initialWeather);
  const [isLiveWeather, setIsLiveWeather] = useState<boolean>(false);
  const [isFetchingWeather, setIsFetchingWeather] = useState<boolean>(false);
  const [isLocatingGps, setIsLocatingGps] = useState<boolean>(false);
  const [showIoTModal, setShowIoTModal] = useState<boolean>(false);
  const [lastWeatherUpdate, setLastWeatherUpdate] = useState<string>("محدث الآن");

  // Filter dynamic weather alerts based on live weather array content
  const activeWeatherAlerts = weather.filter(day => day.alert);

  // Handle earning points with elegant feedback
  const handleEarnPoints = (pts: number, reason: string) => {
    setUserPoints((prev) => prev + pts);
    triggerUserFeedback(`🎉 حصلت على +${pts}XP مضافة: ${reason}`);
  };

  // Log cached offline action
  const handleQueueOfflineAction = (
    module: "إثبات الحيازة" | "مستودع المخازن" | "سجل الخصوبة" | "منتدى مجتمع الفلاحين" | "سندات ماليـة",
    actionName: string,
    payload: any
  ) => {
    const newAction: OfflineAction = {
      id: `off-${Date.now()}`,
      module,
      action: actionName,
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "numeric", minute: "numeric", hour12: true }),
      payload
    };
    setOfflineQueue((prev) => [...prev, newAction]);
    triggerUserFeedback(`⚠️ غياب الشبكة: تم ترحيل هذه الحركة (${actionName}) إلى صندوق الانتظار بنجاح.`);
  };

  // Trigger simulated sync process
  const handleTriggerSync = () => {
    if (offlineQueue.length === 0) {
      triggerUserFeedback("صندوق الانتظار فارغ من أي معاملات حالياً.");
      return;
    }
    setIsSyncing(true);
    setSyncStepText("جاري تأسيس اتصال سيبراني مشفر بالوزارة...");
    
    setTimeout(() => {
      setSyncStepText("جاري تفريغ ومطابقة حركات الحيازات واللقاحات...");
      
      setTimeout(() => {
        setSyncStepText(`جاري دمج وتسجيل عدد (${offlineQueue.length}) حركات مدفوعة لمستنداتك الزراعية...`);
        
        setTimeout(() => {
          setIsSyncing(false);
          setOfflineQueue([]);
          setIsOffline(false);
          const earnedXP = 70;
          setUserPoints(prev => prev + earnedXP);
          triggerUserFeedback(`✅ تم الانتهاء من المزامنة بنجاح! تم قيد المعاملات وجني +${earnedXP}XP مضافة.`);
        }, 1300);
      }, 1100);
    }, 1150);
  };
  
  // Real active States supporting CRUD additions
  const [farms, setFarms] = useState<Farm[]>(initialFarms);
  const [selectedFarmId, setSelectedFarmId] = useState<string>("farm-1");
  const [soilData, setSoilData] = useState<SoilSensorData[]>(initialSoilData);
  const [cropGrowth, setCropGrowth] = useState<CropGrowthStage[]>(initialCropGrowth);
  const [warehouseStock, setWarehouseStock] = useState<StockItem[]>(initialWarehouseStock);
  const [financials, setFinancials] = useState<FinancialRecord[]>(initialFinancialRecords);
  const [irrigationPlans, setIrrigationPlans] = useState(initialIrrigationPlans);
  const [dashboardMapMode, setDashboardMapMode] = useState<"gis" | "schematic">("gis");

  // Load real persistent farms from AgriNova backend DB
  useEffect(() => {
    apiGetFarms().then((remoteFarms) => {
      if (remoteFarms && remoteFarms.length > 0) {
        setFarms((prev) => {
          const map = new Map<string, Farm>();
          prev.forEach(f => map.set(f.id, f));
          remoteFarms.forEach(rf => map.set(rf.id, { ...rf, size: rf.size || rf.areaFeddans || 5, crops: rf.crops || (rf.cropType ? [rf.cropType] : ["القمح"]) }));
          return Array.from(map.values());
        });
      }
    }).catch(console.error);
  }, []);

  // Modal display toggles
  const [showAddFarmModal, setShowAddFarmModal] = useState(false);
  const [showWeatherAlertsModal, setShowWeatherAlertsModal] = useState(false);
  const [showQuickAlert, setShowQuickAlert] = useState<string | null>(null);

  // Form Fields State for additions
  const [newFarmName, setNewFarmName] = useState("");
  const [newFarmGov, setNewFarmGov] = useState("البحيرة");
  const [newFarmSize, setNewFarmSize] = useState("");
  const [newFarmSoil, setNewFarmSoil] = useState("طينية خصبة (Delta Silt)");
  const [newFarmWater, setNewFarmWater] = useState("مشروع ترعة المحمودية + ري بالتنقيط");
  const [newFarmCrops, setNewFarmCrops] = useState("قمح");

  const [newFinType, setNewFinType] = useState<"revenue" | "expense">("revenue");
  const [newFinCategory, setNewFinCategory] = useState("توريد قمح مالي");
  const [newFinAmt, setNewFinAmt] = useState("");
  const [newFinDesc, setNewFinDesc] = useState("");

  const [newStockName, setNewStockName] = useState("");
  const [newStockCategory, setNewStockCategory] = useState<"seeds" | "fertilizers" | "pesticides" | "equipment">("seeds");
  const [newStockQty, setNewStockQty] = useState("");
  const [newStockUnit, setNewStockUnit] = useState("كجم");

  // Get active farm details
  const activeFarm = farms.find((f) => f.id === selectedFarmId) || farms[0];
  const activeFarmSoil = soilData.find((sd) => sd.farmId === activeFarm.id) || soilData[0];

  // Helper trigger for alerts
  const triggerUserFeedback = (msg: string) => {
    setShowQuickAlert(msg);
    setTimeout(() => {
      setShowQuickAlert(null);
    }, 3500);
  };

  // Fetch live satellite meteorological forecast for Egypt
  const loadLiveEgyptWeather = async (govName: string, customCoords?: { lat: number; lng: number }) => {
    setIsFetchingWeather(true);
    try {
      let lat = 31.0364;
      let lng = 30.4689;
      
      if (customCoords) {
        lat = customCoords.lat;
        lng = customCoords.lng;
      } else {
        const match = EGYPTIAN_GOVERNORATES_COORDS[govName] || Object.values(EGYPTIAN_GOVERNORATES_COORDS).find(g => govName.includes(g.name) || govName.includes(g.nameAr));
        if (match) {
          lat = match.lat;
          lng = match.lng;
        }
      }

      const liveData = await fetchLiveEgyptWeather(lat, lng);
      if (liveData && liveData.length > 0) {
        setWeather(liveData);
        setIsLiveWeather(true);
        setLastWeatherUpdate(new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }));
      }
    } catch (err) {
      console.warn("Could not fetch live weather", err);
    } finally {
      setIsFetchingWeather(false);
    }
  };

  // Automatically fetch live satellite weather on mount and when active farm or its location changes
  useEffect(() => {
    if (activeFarm) {
      loadLiveEgyptWeather(activeFarm.governorate);
    }
  }, [activeFarm?.id, activeFarm?.governorate]);

  // Handle GPS location of physical field
  const handleGpsLocate = async () => {
    setIsLocatingGps(true);
    try {
      const pos = await getCurrentGpsPosition();
      await loadLiveEgyptWeather(activeFarm.governorate, { lat: pos.lat, lng: pos.lng });
      
      setFarms(prev => prev.map(f => {
        if (f.id === activeFarm.id) {
          return {
            ...f,
            boundaryPoints: [
              { lat: pos.lat - 0.005, lng: pos.lng - 0.005 },
              { lat: pos.lat + 0.005, lng: pos.lng - 0.005 },
              { lat: pos.lat + 0.005, lng: pos.lng + 0.005 },
              { lat: pos.lat - 0.005, lng: pos.lng + 0.005 },
            ]
          };
        }
        return f;
      }));

      triggerUserFeedback(`📍 تم بنجاح تحديد إحداثيات موقعك الفعلي في مصر (عرض: ${pos.lat.toFixed(4)}، طول: ${pos.lng.toFixed(4)}) وجلب الطقس الحي المباشر للأقمار الصناعية!`);
      handleEarnPoints(50, "تحديد الموقع الحقلي الفعلي بالـ GPS");
    } catch (err: any) {
      triggerUserFeedback(`⚠️ ${err.message || "تعذر تحديد الموقع الجغرافي"}`);
    } finally {
      setIsLocatingGps(false);
    }
  };

  // Handle real-time hardware telemetry reception from IoT modal
  const handleTelemetryUpdated = (newData: { moisture: number; temp: number; ph: number; n: number; p: number; k: number }) => {
    setSoilData(prev => prev.map(sd => {
      if (sd.farmId === activeFarm.id) {
        return {
          ...sd,
          moisture: newData.moisture,
          temperature: newData.temp,
          ph: newData.ph,
          nitrogen: newData.n,
          phosphorus: newData.p,
          potassium: newData.k,
          healthScore: Math.min(100, Math.round(newData.moisture * 0.4 + (newData.n / 200) * 40 + 20)),
          lastUpdated: "بث حي مباشر الآن (مجس IoT حقلي)"
        };
      }
      return sd;
    }));
    triggerUserFeedback("✅ تم استلام قراءة الحساس الحقلي وتحديث قياسات التربة الفعلية بالمزرعة فوراً!");
    handleEarnPoints(40, "استقبال قراءة مجس حقلي متصل");
  };

  // Add a new Farm (State action)
  const handleCreateFarmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmName || !newFarmSize) {
      triggerUserFeedback("يرجى سحب كافة البيانات المطلوبة لتوثيق ملكية الفدان.");
      return;
    }

    const nFarmId = `farm-${Date.now()}`;
    const nFarm: Farm = {
      id: nFarmId,
      name: newFarmName,
      location: "القطاع المطور حديثاً بنمو الأرض",
      governorate: newFarmGov,
      size: parseFloat(newFarmSize),
      crops: [newFarmCrops],
      establishedDate: new Date().toISOString().split("T")[0],
      boundaryPoints: [
        { lat: 30.5, lng: 31.2 },
        { lat: 30.51, lng: 31.2 },
        { lat: 30.51, lng: 31.21 },
        { lat: 30.5, lng: 31.21 },
      ],
      status: "perfect",
      soilType: newFarmSoil,
      waterSource: newFarmWater,
    };

    // Add secondary sensor data matched
    const nSoil: SoilSensorData = {
      farmId: nFarmId,
      moisture: 65,
      temperature: 26.8,
      ph: 7.1,
      nitrogen: 120,
      phosphorus: 35,
      potassium: 220,
      healthScore: 90,
      lastUpdated: "منذ ثانية واحدة",
    };

    setFarms([...farms, nFarm]);
    setSoilData([...soilData, nSoil]);
    setSelectedFarmId(nFarmId);
    setShowAddFarmModal(false);

    // Persist to backend AgriNova DB
    apiCreateFarm({
      name: newFarmName,
      governorate: newFarmGov,
      areaFeddans: parseFloat(newFarmSize),
      cropType: newFarmCrops,
      soilType: newFarmSoil,
      irrigationMethod: "drip",
      waterSource: newFarmWater
    }).catch(console.error);

    if (isOffline) {
      handleQueueOfflineAction("إثبات الحيازة", `ربط حيازة "${newFarmName}" بمساحة ${newFarmSize} فدان`, nFarm);
      handleEarnPoints(30, "تسجيل حيازة ملكية قيد الانتظار المحلي");
    } else {
      triggerUserFeedback(`تهانينا! تم ربط وحصر مزرعة "${newFarmName}" بمكتبة الفلاح الرسمية بنجاح.`);
      handleEarnPoints(100, "توثيق وصك حيازة زراعية مائية جديدة");
    }

    // Reset fields
    setNewFarmName("");
    setNewFarmSize("");
  };

  // Create financial transaction action
  const handleAddFinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFinAmt || !newFinCategory) return;

    const nRec: FinancialRecord = {
      id: `fin-${Date.now()}`,
      type: newFinType,
      category: newFinCategory,
      amount: parseFloat(newFinAmt),
      date: new Date().toISOString().split("T")[0],
      farmId: selectedFarmId,
      description: newFinDesc || `عملية سريعة تم حصرها لقطاع الفحص`,
    };

    setFinancials([nRec, ...financials]);

    if (isOffline) {
      handleQueueOfflineAction("سندات ماليـة", `قيد سند مالي بقيمة ${parseFloat(newFinAmt).toLocaleString()} ج.م`, nRec);
      handleEarnPoints(10, "حفظ سند مالي مؤجل بالرصيد المحلي");
    } else {
      triggerUserFeedback("تم قيد المعاملة المالية في الدفاتر الرسمية وتعديل حصيلة السيولة.");
      handleEarnPoints(20, "تدقيق وتقرير سند المعاملة الرسمية للـ ROI");
    }

    setNewFinAmt("");
    setNewFinDesc("");
  };

  // Create local warehouse stock logger
  const handleAddStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStockName || !newStockQty) return;

    const nStock: StockItem = {
      id: `stock-${Date.now()}`,
      name: newStockName,
      category: newStockCategory,
      quantity: parseFloat(newStockQty),
      unit: newStockUnit,
      minLimit: 100,
      location: activeFarm.name,
    };

    setWarehouseStock([nStock, ...warehouseStock]);

    if (isOffline) {
      handleQueueOfflineAction("مستودع المخازن", `تسجيل مورد مستودع "${newStockName}"`, nStock);
      handleEarnPoints(15, "حفظ صك التوريد قيد الأوفلاين");
    } else {
      triggerUserFeedback("تم تغذية بيانات المستودع وتسجيل كميات المورد الجديد بنجاح.");
      handleEarnPoints(30, "تعبئة مستودع وحصر مخزون المستودع المركزي");
    }

    setNewStockName("");
    setNewStockQty("");
  };

  // Quick action: quick water trigger scheduler and physical IoT relay command
  const dispatchInstantIrrigation = async () => {
    const nIrrNow = {
      id: `irr-${Date.now()}`,
      farmName: activeFarm.name,
      cropType: activeFarm.crops[0] || "قمح",
      scheduleTime: "جاري الضخ الفعلي بالموقع الآن...",
      durationMinutes: 30,
      waterVolumeLiter: 15000,
      method: "sprinkler" as const,
      status: "active" as const,
    };
    setIrrigationPlans([nIrrNow, ...irrigationPlans]);

    // Command the physical IoT pump relay on the server
    await sendPhysicalPumpCommand("pump-1", "ON", 30);

    triggerUserFeedback(`⚡ تم إرسال إشارة كهربية وتشغيل محبس الضخ الفعلي عبر خادم إنترنت الأشياء (IoT Relay ON) في ${activeTab === "dashboard" ? "القطاع النشط" : activeFarm.name}!`);
    handleEarnPoints(25, "تشغيل مضخة الري عبر الخادم الفيزيائي");
  };

  // Add highly optimized predictive irrigation plan 
  const handleAddIrrigationPlan = (plan: {
    farmName: string;
    cropType: string;
    scheduleTime: string;
    durationMinutes: number;
    waterVolumeLiter: number;
    method: "drip" | "sprinkler" | "surface";
  }) => {
    const newPlan: IrrigationPlan = {
      id: `irr-${Date.now()}`,
      farmName: plan.farmName,
      cropType: plan.cropType,
      scheduleTime: plan.scheduleTime,
      durationMinutes: plan.durationMinutes,
      waterVolumeLiter: plan.waterVolumeLiter,
      method: plan.method,
      status: "scheduled",
    };
    setIrrigationPlans([newPlan, ...irrigationPlans]);
  };

  // Login handler transition
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setSessionState("dashboard");
    // Automatically match the user's initial prefecture
    setNewFarmGov(user.governorate);
  };

  // SPLASH SCENARIO
  if (sessionState === "splash") {
    return <Splash onEnter={() => setSessionState("dashboard")} />;
  }

  // ONBOARDING / LOGIN WITH SMS OTP SCENARIO
  if (sessionState === "auth") {
    return <Auth onSuccess={handleLoginSuccess} onGoBack={() => setSessionState("dashboard")} />;
  }

  // Energy consumption calculations for irrigation pumps based on matrix activations
  const totalIrrigationActivations = irrigationPlans.length;
  const totalIrrigationMinutes = irrigationPlans.reduce((acc, plan) => acc + plan.durationMinutes, 0);
  const totalOperatingHours = (totalIrrigationMinutes / 60).toFixed(1);
  const ratedPumpPowerKw = 15; // 15 kW standard agricultural pump motor
  const estimatedEnergyKwh = Math.round((totalIrrigationMinutes / 60) * ratedPumpPowerKw);
  const estimatedElectricityCostEgp = Math.round(estimatedEnergyKwh * 0.85); // 0.85 EGP/kWh rural agricultural tariff
  const activePumpsCount = irrigationPlans.filter(p => p.status === "active").length;

  // SYSTEM LOGGED IN - main layout controller
  return (
    <div className="min-h-screen bg-[#F0F4F0] text-slate-800 flex flex-col relative" dir="rtl">
      
      {/* QUICK FLOATING SYSTEM FEEDBACK NOTIFICATIONS */}
      {showQuickAlert && (
        <div className="fixed bottom-6 left-6 z-50 max-w-sm bg-[#064E3B] text-white border-2 border-[#F59E0B] p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-fade-in select-none">
          <div className="bg-[#059669] text-[#F59E0B] rounded-full p-1 shrink-0 mt-0.5">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <strong className="block text-xs font-bold text-[#F59E0B]">مكتب المراقبة القومي:</strong>
            <p className="text-[11px] text-white/90 leading-relaxed mt-0.5">{showQuickAlert}</p>
          </div>
        </div>
      )}

      {/* NATION-WIDE DEEP DATA RECONCILIATION SYNCHRONIZATION OVERLAY */}
      {isSyncing && (
        <div className="fixed inset-0 bg-[#052b21]/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-emerald-100 shadow-2xl text-center space-y-4 animate-fade-in" dir="rtl">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner border-2 border-dashed border-emerald-600">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            
            <div className="space-y-1 text-center">
              <strong className="text-sm font-black text-[#064E3B] block">مزامنة البيانات القومية للمزارع</strong>
              <div className="inline-block">
                <span className="text-[9px] text-gray-500 bg-slate-50 border py-0.5 px-2 rounded-full font-bold select-none">
                  بروتوكول تشفير فدان موحد
                </span>
              </div>
              <p className="text-[11px] text-gray-650 leading-relaxed font-bold animate-smooth-pulse mt-3.5 min-h-[1.5rem] block text-[#059669]">
                {syncStepText}
              </p>
            </div>

            <div className="w-full bg-[#F0F4F0] h-2 rounded-full overflow-hidden border">
              <div className="bg-[#059669] h-full rounded-full w-4/5 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* TOP COMPREHENSIVE NATIONAL HEADER NAVBAR */}
      <header className="bg-[#064E3B] border-b border-[#059669] text-white sticky top-0 z-40 px-4 sm:px-6 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Logo & Governorates metadata */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#059669] rounded-xl flex items-center justify-center border border-[#F59E0B] shrink-0 shadow-inner">
              <Sprout className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#F0F4F0]">المُزارع الذكي</span>
                <span className="bg-[#F59E0B] text-[#064E3B] text-[9px] font-black px-1.5 py-0.5 rounded-full select-none">
                  الجمهورية الجديدة
                </span>
              </div>
              <p className="text-[10px] text-emerald-250 text-emerald-300">
                منصة الاستبصار المناخي والرصد الرقمي • إشراف م. إبراهيم
              </p>
            </div>
          </div>

          {/* Center Farm Select Widget */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-200 font-bold hidden md:inline">الحيازة النشطة:</span>
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="bg-[#043d2e] border border-[#059669] text-white font-extrabold text-xs py-2 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#F59E0B]"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>{f.name} ({f.governorate})</option>
              ))}
            </select>

            <button
              onClick={() => setShowAddFarmModal(true)}
              className="p-2 bg-[#F59E0B] hover:bg-amber-600 text-slate-950 rounded-xl transition-colors cursor-pointer flex items-center justify-center shadow-sm"
              title="سجل حيازة جديدة بنظام الكارت الذكي"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Real Field GPS Location Button */}
            <button
              onClick={handleGpsLocate}
              disabled={isLocatingGps}
              className="px-2.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              title="تحديد موقع مزرعتي الفعلي في مصر عبر إشارة الـ GPS الحقيقية"
            >
              <Navigation className={`w-3.5 h-3.5 text-amber-300 ${isLocatingGps ? "animate-spin" : ""}`} />
              <span className="hidden xl:inline">{isLocatingGps ? "جاري الرصد..." : "موقعي الحقلي (GPS)"}</span>
            </button>

            {/* Real Field IoT Hardware Integration Button */}
            <button
              onClick={() => setShowIoTModal(true)}
              className="px-2.5 py-2 bg-[#043d2e] hover:bg-[#032e23] border border-emerald-400/60 hover:border-emerald-300 text-emerald-100 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="ربط وتوصيل الحساسات والمضخات الفيزيائية الحقيقية (IoT Hardware)"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">ربط الحساسات (IoT)</span>
            </button>
          </div>

          {/* OFFLINE MODES & INTERACTIVE SYNC PANEL */}
          <div className="flex items-center gap-2 bg-[#043d2e]/80 p-1 rounded-xl border border-[#059669]/60">
            {/* Status light */}
            <div className="flex items-center gap-1.5 px-2">
              <span className={`w-2 h-2 rounded-full ${isOffline ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
              <span className="text-[10px] whitespace-nowrap font-extrabold">
                {isOffline ? `أوفلاين (${offlineQueue.length})` : "متصل بالوزارة"}
              </span>
            </div>

            {/* Simulated Toggle Switch button */}
            <button
              onClick={() => {
                const nextState = !isOffline;
                setIsOffline(nextState);
                triggerUserFeedback(nextState 
                  ? "وضع غياب الشبكة نشط: أي تعديلات بالحيازة أو المخازن ستتم فهرستها موضعياً." 
                  : "تنبيه: أنت الآن متصل بالخادم القومي. اضغط على 'مزامنة' لترحيل حركاتك بنجاح."
                );
              }}
              className={`text-[9px] font-black px-2 py-1 rounded-lg transition-all border cursor-pointer ${
                isOffline 
                  ? "bg-amber-600 border-amber-500 text-white font-black" 
                  : "bg-[#064E3B] border-emerald-600 text-emerald-300 hover:text-white"
              }`}
            >
              {isOffline ? "اترك أوفلاين" : "عمل أوفلاين"}
            </button>

            {/* Offline Queue Sync button */}
            {offlineQueue.length > 0 && (
              <button
                onClick={handleTriggerSync}
                disabled={isSyncing}
                className="bg-[#F59E0B] hover:bg-amber-500 text-slate-950 text-[9px] font-black py-1 px-2 rounded-lg flex items-center gap-1 cursor-pointer transition-all animate-pulse"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    <span>مزامنة...</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-2.5 h-2.5" />
                    <span>مزامنة ({offlineQueue.length})</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* User Profile Badge State */}
          <div className="flex items-center gap-2.5">
            {/* Weather Alerts Notification Hub */}
            {activeWeatherAlerts.length > 0 && (
              <button
                id="weather-alerts-badge"
                onClick={() => setShowWeatherAlertsModal(true)}
                className="bg-red-950/85 border border-red-500 hover:border-red-400 hover:bg-red-900/90 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all duration-300 shadow-lg group relative"
                title={`${activeWeatherAlerts.length} إنذارات مناخية نشطة`}
              >
                <div className="relative flex items-center justify-center">
                  <Bell className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform animate-[bounce_1.5s_infinite]" />
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white font-mono text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border border-red-250 shadow-md animate-pulse">
                    {activeWeatherAlerts.length}
                  </span>
                </div>
                <span className="text-[10px] whitespace-nowrap font-black text-red-200 hidden md:inline ml-0.5" dir="rtl">
                  إنذارات طارئة ({activeWeatherAlerts.length})
                </span>
              </button>
            )}

            {/* Active Points Hub in Header */}
            <div 
              onClick={() => setActiveTab("gamification")}
              className="bg-[#043d2e] border border-[#F59E0B]/50 hover:border-[#F59E0B] px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-inner"
              title="الذهاب لمركز رخص التميز"
            >
              <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="font-mono text-[11.5px] font-black text-[#F59E0B]">{userPoints} XP</span>
            </div>

            <div className="text-right hidden sm:block">
              <span className="font-black text-xs text-white block">{currentUser?.name || "المهندس إبراهيم"}</span>
              <span className="text-[9px] font-bold text-emerald-300 block">{currentUser?.email || "معتمد رسمياً"}</span>
            </div>

            <div className="w-9 h-9 rounded-full bg-emerald-700 hover:bg-emerald-600 transition-colors border border-[#F59E0B] flex items-center justify-center text-white shrink-0">
              <UserIcon className="w-4 h-4 text-[#F59E0B]" />
            </div>

            <button
              onClick={() => setSessionState("splash")}
              className="p-2 hover:bg-[#043d2e] rounded-xl text-emerald-300 hover:text-white transition-colors cursor-pointer"
              title="تسجيل الخروج الآمن"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* BODY SIDEBAR + VIEW CONTENT CONTAINER */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* RIGHT INTERACTIVE APP NAVIGATION (SIDEBAR) */}
        <aside className="lg:col-span-1 bg-white border border-gray-100 rounded-3xl p-4 shadow-sm h-fit space-y-2">
          <div className="text-gray-400 text-[10px] font-bold tracking-widest px-3 mb-2">الخدمات والأدوات الأساسية</div>
          
          {[
            { id: "dashboard", label: "بوابـة التحكم الشاملة", icon: LayoutDashboard },
            { id: "gis", label: "الخرائط الرقمية وحدود الحقول (GIS)", icon: MapPin },
            { id: "soil", label: "مستشعرات التربة والخصوبة", icon: Droplets },
            { id: "crop", label: "أطوار نمو المحاصيل والتوريد", icon: Wheat },
            { id: "ai-diagnosis", label: "عيادة فحص النبات (AI)", icon: Camera },
            { id: "ai-assistant", label: "مكتب الإرشاد الذكي للوزارة", icon: Sparkles },
            { id: "weather", label: "النشرة والإنذارات المناخية", icon: CloudSun },
            { id: "irrigation", label: "مضخات الري الذكي الدقيق", icon: Clock },
            { id: "warehouse", label: "حصر مستودعات المخازن", icon: Wrench },
            { id: "livestock", label: "الثروة الحيوانية والسمكية", icon: Sprout },
            { id: "financial", label: "سجلات تدقيق حساب الـ ROI", icon: DollarSign },
            { id: "reports", label: "التقارير والمستندات المصدرة", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 py-3 px-3.5 rounded-2xl text-xs font-bold transition-all text-right cursor-pointer ${
                  isActive 
                    ? "bg-[#064E3B] text-[#F59E0B] shadow-md shadow-emerald-900/10 font-bold" 
                    : "text-gray-600 hover:bg-[#F0F4F0] hover:text-[#064E3B]"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#F59E0B]" : "text-gray-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="pt-4 border-t border-gray-100 space-y-2">
            <div className="text-gray-400 text-[10px] font-bold tracking-widest px-3 mb-2">خدمات التكافل الوطني</div>
            {[
              { id: "marketplace", label: "سوق مستلزمات الإنتاج", icon: Store },
              { id: "engineers", label: "شبكة المهندسين المعتمدين", icon: Users },
              { id: "admin-metrics", label: "الرقابة الإدارية ودراسة الجدوى", icon: ShieldCheck },
              { id: "settings", label: "الإعدادات وبيانات الفلاح", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 py-3 px-3.5 rounded-2xl text-xs font-bold transition-all text-right cursor-pointer ${
                    isActive 
                      ? "bg-[#064E3B] text-[#F59E0B] shadow-sm font-bold" 
                      : "text-gray-600 hover:bg-[#F0F4F0] hover:text-[#064E3B]"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#F59E0B]" : "text-gray-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-2">
            <div className="text-gray-400 text-[10px] font-bold tracking-widest px-3 mb-2">التفاعل والجوائز الرقمية</div>
            {[
              { id: "community-qa", label: "منتدى مجتمع الإرشاد", icon: MessageSquare },
              { id: "gamification", label: "مركز الجوائز ونقاط التميز", icon: Trophy },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 py-3 px-3.5 rounded-2xl text-xs font-bold transition-all text-right cursor-pointer ${
                    isActive 
                      ? "bg-[#064E3B] text-[#F59E0B] shadow-sm font-bold" 
                      : "text-gray-650 hover:bg-[#F0F4F0] hover:text-[#064E3B]"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#F59E0B]" : "text-gray-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* LEFT COLUMN: PRIMARY DYNAMIC TABS ROUTER PANELS */}
        <main className="lg:col-span-4 space-y-6">
          
          {/* TAB 1: DASHBOARD BENTO GRID */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* Climate Urgent Warn Banner widget */}
              <div className="bg-amber-50 border-2 border-amber-200/80 rounded-3xl p-4.5 text-xs text-amber-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/30 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-start gap-3 z-10">
                  <span className="text-2xl mt-0.5 shrink-0">⚠️</span>
                  <div className="text-right">
                    <strong className="block text-amber-950 font-extrabold text-[12px] mb-1">تنبيه مناخي صادر من الهيئة الوطنية للأرصاد بوزارة الزراعة:</strong>
                    <p className="leading-relaxed">
                      ذروة الموجة الحارة غداً في محافظة {activeFarm.governorate} تصل إلى {initialWeather[1].tempMax}° م. ينصح بشدة المهندس إبراهيم بـ<strong>تأجيل حصاد محاصيل القمح وسحب بوابات الري وقت الظهيرة</strong> منعاً للاستنزاف أو فقر التمثيل الضوئي.
                    </p>
                  </div>
                </div>

                <button
                  onClick={dispatchInstantIrrigation}
                  className="bg-amber-600 hover:bg-amber-700 text-slate-950 font-bold px-4 py-2 rounded-xl border border-amber-300 shrink-0 cursor-pointer transition-colors shadow-inner self-stretch md:self-auto text-center"
                >
                  تفعيل خطة الري الوقائي
                </button>
              </div>

              {/* BENTO GRID MAIN STAGE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* GRID ITEM 1: Live Farm Health Meter */}
                <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#064E3B] mb-2 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      <span>الكفاءة الحيوية للفدان</span>
                    </h3>
                    <p className="text-[10px] text-gray-400 font-medium">مؤشر فسيومترى صحى للمزرعة طمئياً ورطوبة</p>
                  </div>

                  <div className="py-5 text-center">
                    <div className="text-4xl font-extrabold text-emerald-600 font-mono tracking-tight inline-block relative">
                      {activeFarmSoil.healthScore}%
                      <span className="absolute -top-3 -right-3 text-[10px] text-[#F59E0B] font-bold">مكتمل</span>
                    </div>
                    {/* Progress visual */}
                    <div className="w-full bg-slate-50 border h-2.5 rounded-full mt-3 overflow-hidden shadow-inner">
                      <div 
                        className="bg-[#059669] h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${activeFarmSoil.healthScore}%` }} 
                      />
                    </div>
                  </div>

                  <div className="bg-[#F0F4F0] p-2 rounded-xl text-center text-[10px] text-[#064E3B] font-bold">
                    حالة التربة: {activeFarmSoil.healthScore > 80 ? "ممتازة وخصبة للغاية" : "تحتاج لمعالجة الفسفور"}
                  </div>
                </div>

                {/* GRID ITEM 2: Quick Weather Widget with Live Satellite Indicator */}
                <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-extrabold text-sm text-[#064E3B] flex items-center gap-1.5">
                        <CloudSun className="w-4 h-4 text-amber-500" />
                        <span>الطقس المباشر</span>
                      </h3>
                      {isLiveWeather ? (
                        <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-black px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          <span>أقمار صناعية حية</span>
                        </span>
                      ) : (
                        <span className="text-[9px] text-gray-400 font-bold">تقديري</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {activeFarm.governorate} • {lastWeatherUpdate}
                    </p>
                  </div>

                  <div className="py-3 text-right flex justify-between items-center">
                    <div>
                      <span className="text-3xl font-extrabold text-slate-800 font-mono">
                        {weather[0]?.tempMax ?? 30}° م
                      </span>
                      <p className="text-[11px] text-slate-600 font-bold mt-1">
                        {weather[0]?.condition ?? "معتدل"}
                      </p>
                    </div>
                    <div className="text-left font-mono text-[10px] text-gray-500 space-y-0.5">
                      <div>رطوبة: <strong className="text-blue-600">{weather[0]?.humidity ?? 45}%</strong></div>
                      <div>رياح: <strong className="text-emerald-700">{weather[0]?.windSpeed ?? 14} كم/س</strong></div>
                      <div>أمطار: <strong className="text-slate-700">{weather[0]?.rainProb ?? 0}%</strong></div>
                    </div>
                  </div>

                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={() => loadLiveEgyptWeather(activeFarm.governorate)}
                      disabled={isFetchingWeather}
                      className="flex-1 py-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-[10px] font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                      title="تحديث بيانات الطقس الحية من القمر الصناعي لمحافظة المزرعة"
                    >
                      <RefreshCw className={`w-3 h-3 ${isFetchingWeather ? "animate-spin text-emerald-600" : ""}`} />
                      <span>{isFetchingWeather ? "جاري التحديث..." : "تحديث حي"}</span>
                    </button>
                    <button
                      onClick={() => setShowWeatherAlertsModal(true)}
                      className="py-1 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-[10px] font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                      title="استعراض التنبيهات والتحذيرات المناخية"
                    >
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>الإنذارات ({activeWeatherAlerts.length})</span>
                    </button>
                  </div>
                </div>

                {/* GRID ITEM 3: Active Farm Assets metadata */}
                <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#064E3B] mb-2 flex items-center gap-1.5">
                      <Sprout className="w-4 h-4 text-[#059669]" />
                      <span>إحصاءات الحيازة والمحاصيل</span>
                    </h3>
                    <p className="text-[10px] text-gray-400 font-medium">{activeFarm.name}</p>
                  </div>

                  <div className="py-2.5 space-y-1.5 text-xs text-right text-gray-700">
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span>المساحة:</span>
                      <strong className="text-[#064E3B] font-bold">{activeFarm.size} فدان مصري</strong>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span>التربة:</span>
                      <strong className="text-gray-800 font-bold truncate max-w-[110px]">{activeFarm.soilType}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>مصدر المياه:</span>
                      <strong className="text-blue-600 font-bold truncate max-w-[115px]">{activeFarm.waterSource}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("soil")}
                    className="w-full py-1 px-3 bg-[#064E3B]/10 hover:bg-[#064E3B] text-[#064E3B] hover:text-white rounded-xl text-[10px] font-bold transition-all text-center cursor-pointer"
                  >
                    فحص تحليلات التربة الكيميائية
                  </button>
                </div>

                {/* GRID ITEM 4: Energy Consumption Monitoring (مراقبة استهلاك الطاقة) */}
                <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-extrabold text-sm text-[#064E3B] flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span>مراقبة استهلاك الطاقة</span>
                      </h3>
                      {activePumpsCount > 0 ? (
                        <span className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>{activePumpsCount} محرك نشط</span>
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full">
                          جاهز بالاستعداد
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">تقدير أحمال محركات ومضخات الري</p>
                  </div>

                  <div className="py-2.5 space-y-1.5 text-xs text-right text-gray-700">
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-500">مرات تفعيل المحركات:</span>
                      <strong className="text-[#064E3B] font-bold font-mono">
                        {totalIrrigationActivations} تشغيل بالمصفوفة
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-500">الاستهلاك التقديري:</span>
                      <strong className="text-amber-600 font-extrabold font-mono">
                        {estimatedEnergyKwh.toLocaleString()} kWh
                      </strong>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-500">ساعات الضخ الكلية:</span>
                      <strong className="text-slate-800 font-bold font-mono">
                        {totalOperatingHours} ساعة
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">التكلفة التقديرية:</span>
                      <strong className="text-emerald-700 font-black font-mono">
                        ~{estimatedElectricityCostEgp.toLocaleString()} ج.م
                      </strong>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("irrigation")}
                    className="w-full py-1 px-3 bg-amber-500/10 hover:bg-amber-500 text-amber-900 hover:text-slate-950 rounded-xl text-[10px] font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Zap className="w-3 h-3 text-amber-600" />
                    <span>فحص مضخات ومحركات الري</span>
                  </button>
                </div>

              </div>

              {/* STAGE MAIN GIS VECTOR MAP COMPONENT (WIDGET 4) */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#064E3B]">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>عرض الخرائط والأقمار الصناعية للحقل:</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setDashboardMapMode("gis")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        dashboardMapMode === "gis"
                          ? "bg-[#064E3B] text-white shadow-xs"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      خريطة الأقمار الصناعية (GIS)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDashboardMapMode("schematic")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        dashboardMapMode === "schematic"
                          ? "bg-[#064E3B] text-white shadow-xs"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      مخطط الحرارة والعناصر (NPK)
                    </button>
                  </div>
                </div>

                {dashboardMapMode === "gis" ? (
                  <RealGISMap
                    currentFarm={activeFarm}
                    allFarms={farms}
                    activeSoil={activeFarmSoil}
                  />
                ) : (
                  <InteractiveMap 
                    governorate={activeFarm.governorate} 
                    farmSize={activeFarm.size} 
                    soilData={soilData} 
                    currentFarmId={activeFarm.id} 
                    activeSoil={activeFarmSoil} 
                  />
                )}
              </div>

            </div>
          )}

          {/* TAB 2: SOIL DETAILED ANALYZER */}
          {activeTab === "soil" && (
            <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-base text-[#064E3B] flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-600" />
                  <span>لوحة مستشعرات التربة والتحليل الكهرومغناطيسي لـ N-P-K</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  مصفوفة قياس العناصر الحيوية بالتربة الفعالة في حقل {activeFarm.name} - رصد محدث: {activeFarmSoil.lastUpdated}.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 border rounded-2xl p-4 text-right">
                  <span className="text-[10px] text-gray-400 font-bold block">معدل رطوبة التربة (Moisture):</span>
                  <span className="text-xl font-extrabold text-blue-750 font-mono text-blue-800 block mt-1">{activeFarmSoil.moisture}%</span>
                  <span className="text-[9px] text-[#059669] font-bold block mt-1">مستوى مثالي لنبات الجري الرغوي</span>
                </div>

                <div className="bg-slate-50 border rounded-2xl p-4 text-right">
                  <span className="text-[10px] text-gray-400 font-bold block">الآزوت والنيتروجين الفعال (N):</span>
                  <span className="text-xl font-extrabold text-slate-800 font-mono block mt-1">{activeFarmSoil.nitrogen} ملجم/كجم</span>
                  <span className="text-[9px] text-red-650 text-red-600 font-bold block mt-1">توصية: أضف يوريا ٤٦٪ بالتدرج</span>
                </div>

                <div className="bg-slate-50 border rounded-2xl p-4 text-right">
                  <span className="text-[10px] text-gray-400 font-bold block">عنصر الفوسفور المدمج (P):</span>
                  <span className="text-xl font-extrabold text-slate-800 font-mono block mt-1">{activeFarmSoil.phosphorus} ملجم/كجم</span>
                  <span className="text-[9px] text-amber-600 font-bold block mt-1">مستوى متقارب مع الحد الأدنى</span>
                </div>

                <div className="bg-slate-50 border rounded-2xl p-4 text-right">
                  <span className="text-[10px] text-gray-400 font-bold block">مستويات البوتاسيوم والأملاح (K):</span>
                  <span className="text-xl font-extrabold text-slate-800 font-mono block mt-1">{activeFarmSoil.potassium} ملجم/كجم</span>
                  <span className="text-[9px] text-[#059669] font-bold block mt-1">مستقر وغني بالخصوبة الطمئية</span>
                </div>
              </div>

              {/* Chemical fertilizer planning */}
              <div className="border border-emerald-100 bg-[#F0F4F0]/45 p-4 rounded-2xl space-y-2">
                <span className="text-xs font-black text-[#064E3B] block">توصيات مجهرية كيميائية فورية لنمو الفدان:</span>
                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                  بناء على الرقم الهيدروجيني للتربة ({activeFarmSoil.ph}) ورطوبة الجو، يتعين خلط <strong>١٢.٥ كجم من كبريتات النحاس السوبر</strong> مع مياه الري الصباحية القادمة من بوابات ترعة {activeFarm.governorate} لتخفيض قلوية الرمل وتحفير حية البوتاسيوم.
                </p>
              </div>

              {/* Spatial N-P-K Soil Quality Heatmap in Soil Analyzer */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-extrabold text-[#064E3B] flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-emerald-600" />
                    <span>خريطة التوزيع المكاني الكنتورية لعناصر (N - P - K) بالحقل:</span>
                  </h4>
                  <span className="text-[10px] text-gray-400 font-bold">معايرة أوتوماتيكية مع مجسات {activeFarm.name}</span>
                </div>
                <InteractiveMap 
                  governorate={activeFarm.governorate} 
                  farmSize={activeFarm.size} 
                  soilData={soilData} 
                  currentFarmId={activeFarm.id} 
                  activeSoil={activeFarmSoil} 
                  initialLayer="npk" 
                />
              </div>
            </div>
          )}

          {/* TAB 3: CROPS MANAGEMENT AND VARIETIES */}
          {activeTab === "crop" && (
            <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b">
                <div>
                  <h3 className="font-extrabold text-base text-[#064E3B] flex items-center gap-2">
                    <Wheat className="w-5 h-5 text-amber-500" />
                    <span>مجموعة حصر المحاصيل الوطنية ومراحل التطور</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    تابع تقدم الغلة وحصيلة التصدير للفدان بنسق الكارت الذكي.
                  </p>
                </div>
              </div>

              {/* Crops progress mapping list */}
              <div className="space-y-4">
                {cropGrowth.map((cg) => (
                  <div key={cg.id} className="border border-gray-100 rounded-2xl p-4.5 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="bg-[#064E3B]/10 text-[#064E3B] text-[10px] font-bold px-2.5 py-1 rounded-full">
                          {cg.variety}
                        </span>
                        <strong className="text-sm font-black text-[#064E3B] block mt-1.5">{cg.cropName}</strong>
                      </div>

                      <div className="text-left">
                        <span className="text-xs font-bold text-slate-800 block">الحصاد المتوقع:</span>
                        <span className="text-[11px] text-emerald-600 font-bold block">{cg.expectedYield} أردب/طن للفدان</span>
                      </div>
                    </div>

                    {/* Progress bar and details */}
                    <div>
                      <div className="flex justify-between text-[11px] text-gray-400 mb-1.5">
                        <span>مرحلة: {cg.stageName}</span>
                        <span>{cg.progress}% من عمر النمو</span>
                      </div>
                      <div className="w-full bg-slate-50 border h-2 rounded-full overflow-hidden">
                        <div className="bg-[#059669] h-full" style={{ width: `${cg.progress}%` }} />
                      </div>
                    </div>

                    <div className="flex justify-between text-[10px] text-gray-500 pt-1.5 border-t border-dashed">
                      <span>الأيام المتبقية للحصاد: <strong>{cg.daysToHarvest} يوم</strong></span>
                      <span className={`font-bold ${cg.irrigationStatus === "optimal" ? "text-emerald-650" : "text-amber-500"}`}>
                        رطوبة الحقل: {cg.irrigationStatus === "optimal" ? "متزنة بالخصوبة" : "مغمورة بالماء"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: AI PLANT MEDICAL DIAGNOSIS */}
          {activeTab === "ai-diagnosis" && (
            <AIDiagnosis userGovernorate={activeFarm.governorate} />
          )}

          {/* TAB 5: AI AGRICULTURAL ASSISTANT */}
          {activeTab === "ai-assistant" && (
            <AIAssistant />
          )}

          {/* TAB 6: WEATHER TEMPERATURE AND 14 DAY PROJECTIONS */}
          {activeTab === "weather" && (
            <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6 text-right">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-[#064E3B] flex items-center gap-2">
                      <CloudSun className="w-5 h-5 text-amber-500" />
                      <span>لوحة الاستبصار المناخي والأقمار الصناعية الزراعية بمصر</span>
                    </h3>
                    {isLiveWeather ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>بث حي للأقمار الصناعية (مصر)</span>
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-650 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        توقعات مرجعية
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    بيانات الأرصاد الجوية الحية لمحافظة {activeFarm.governorate} • تحديث: {lastWeatherUpdate}
                  </p>
                </div>

                {/* Governorate Live Selector & Refresh */}
                <div className="flex items-center gap-2">
                  <select
                    value={activeFarm.governorate}
                    onChange={(e) => {
                      const newGov = e.target.value;
                      loadLiveEgyptWeather(newGov);
                      triggerUserFeedback(`📡 جاري جلب البث المباشر للأقمار الصناعية لمحافظة: ${newGov}`);
                    }}
                    className="bg-slate-50 border border-gray-200 text-xs font-bold text-slate-800 py-2 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {Object.keys(EGYPTIAN_GOVERNORATES_COORDS).map((gov) => (
                      <option key={gov} value={gov}>{EGYPTIAN_GOVERNORATES_COORDS[gov].nameAr}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => loadLiveEgyptWeather(activeFarm.governorate)}
                    disabled={isFetchingWeather}
                    className="py-2 px-3 bg-[#064E3B] hover:bg-[#059669] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingWeather ? "animate-spin" : ""}`} />
                    <span>{isFetchingWeather ? "تحديث..." : "تحديث حي"}</span>
                  </button>
                </div>
              </div>

              {/* Today full parameters from LIVE weather */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gradient-to-tr from-[#064E3B]/5 to-transparent p-5 rounded-2xl border">
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold">درجات حرارة اليوم (أقمار صناعية):</span>
                  <span className="text-xl font-black text-slate-800 block mt-1">
                    عظمى {weather[0]?.tempMax ?? 32}° م / صغرى {weather[0]?.tempMin ?? 20}° م
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">{weather[0]?.condition}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold">الرطوبة النسبية والتبخر:</span>
                  <span className="text-xl font-black text-blue-800 block mt-1">
                    رطوبة نسبية {weather[0]?.humidity ?? 45}%
                  </span>
                  <span className="text-[10px] text-gray-500 block mt-0.5">مؤشر الأشعة فوق البنفسجية UV: {weather[0]?.uvIndex ?? 8}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold">سرعة الرياح وهطول الأمطار:</span>
                  <span className="text-xl font-black text-amber-800 block mt-1">
                    {weather[0]?.windSpeed ?? 14} كم/ساعة
                  </span>
                  <span className="text-[10px] text-slate-600 block mt-0.5">احتمالية الأمطار: {weather[0]?.rainProb ?? 0}%</span>
                </div>
              </div>

              {/* 7-Days forecast layout cards */}
              <div>
                <span className="text-xs font-bold text-[#064E3B] block mb-3.5">توقعات النشرة الزراعية المباشرة للأيام القادمة:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {weather.map((w, idx) => (
                    <div key={idx} className={`border rounded-2xl p-3.5 text-center space-y-1.5 transition-all ${idx === 0 ? "bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-200" : "bg-slate-50/50 hover:bg-slate-50"}`}>
                      <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold">
                        <span>{w.date}</span>
                        {idx === 0 && <span className="text-emerald-700 bg-emerald-100 px-1 rounded-sm text-[8px]">الآن</span>}
                      </div>
                      <span className="text-sm font-black text-slate-800 block font-mono">{w.tempMax}° / {w.tempMin}° م</span>
                      <span className="text-[10px] text-[#059669] font-bold block">{w.condition}</span>
                      <div className="text-[9px] text-gray-500 border-t pt-1 flex justify-between font-mono">
                        <span>رطوبة {w.humidity}%</span>
                        <span>أمطار {w.rainProb}%</span>
                      </div>
                      {w.alert && (
                        <span className="text-[9px] text-rose-700 bg-rose-50 border border-rose-200 rounded-md p-1 block text-right font-medium">
                          ⚠️ {w.alert}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Extended Outlook */}
              <div>
                <span className="text-xs font-bold text-gray-600 block mb-2">توقعات الأسبوع الثاني (المحاكاة طويلة المدى):</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                  {remainingDaysForecast.map((w, idx) => (
                    <div key={idx} className="bg-slate-50/30 border border-dashed rounded-xl p-2.5 text-center space-y-1">
                      <span className="text-[10px] text-gray-400 block font-bold">{w.date}</span>
                      <span className="text-xs font-black text-slate-600 block font-mono">{w.tempMax}° / {w.tempMin}°</span>
                      <span className="text-[9px] text-gray-400 block">{w.condition}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: IRRIGATION MOTORS CONTROLS AND SCHEDULES */}
          {activeTab === "irrigation" && (
            <div className="space-y-6">
              {/* Deterministic FAO-56 Agronomic Irrigation Engine */}
              <AgronomicIrrigationCalculator
                currentFarm={activeFarm}
                activeSoil={activeFarmSoil}
                currentWeather={weather[0]}
                onPumpActivated={() => handleEarnPoints(30, "تشغيل حتمي لمحرك الري وفق حسابات FAO-56")}
              />

              {/* Dynamic AI Irrigation prediction models connected to LIVE weather */}
              <AIIrrigationPredictor 
                activeFarm={activeFarm}
                activeFarmSoil={activeFarmSoil}
                cropGrowth={cropGrowth}
                weatherForecast={weather}
                onAddIrrigationPlan={handleAddIrrigationPlan}
                isOffline={isOffline}
                triggerNotification={(msg) => triggerUserFeedback(msg)}
              />

              <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b">
                  <div>
                    <h3 className="font-extrabold text-base text-[#064E3B] flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span>جدولة ومضخات الري اللاسلكية الذكية للحقول</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      تحكم فعلي في محابس ومحركات الري عبر بوابات خادم إنترنت الأشياء (IoT Relays).
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowIoTModal(true)}
                      className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#064E3B] border border-emerald-300 rounded-xl text-xs font-extrabold cursor-pointer transition-colors flex items-center gap-1.5"
                      title="فحص حالة المضخات والحساسات في المزرعة"
                    >
                      <Cpu className="w-4 h-4 text-emerald-600" />
                      <span>إعدادات العتاد (Hardware)</span>
                    </button>

                    <button 
                      onClick={dispatchInstantIrrigation}
                      className="py-2 px-4 bg-[#064E3B] hover:bg-[#059669] text-white rounded-xl text-xs font-extrabold cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>ضخ مائي يدوي طارئ وموجه</span>
                    </button>
                  </div>
                </div>

                {/* Scheduled runs logs and active list */}
                <div className="space-y-3.5">
                  <span className="text-xs font-bold text-gray-400 block border-b pb-1">سجل التوقيتات المقررة وحالة الضخ الحالية:</span>
                  {irrigationPlans.map((ip) => (
                    <div key={ip.id} className="border rounded-2xl p-4 flex justify-between items-center bg-slate-50/50">
                      <div>
                        <span className="text-[10px] text-gray-400 block">الموقع المنفذ لري الحقل:</span>
                        <strong className="text-xs text-[#064E3B] block mt-1">{ip.farmName} ({ip.cropType})</strong>
                        <span className="text-[11px] text-gray-500 block">الموعد الزمني: {ip.scheduleTime}</span>
                      </div>

                      <div className="text-left select-none">
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full block text-center">
                          {ip.waterVolumeLiter.toLocaleString()} لتر
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-1">بوسيلة ري بالتنقيط {ip.durationMinutes} دقيقة</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: WAREHOUSE STOCK LOGGER */}
          {activeTab === "warehouse" && (
            <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6 text-right">
              <div>
                <h3 className="font-extrabold text-base text-[#064E3B] flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-[#F59E0B]" />
                  <span>حصر وإدارة مستودعات المخازن والمستلزمات</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  حراسة وتتبع نسب التقاوي والمخصبات وخراطيم الري المبطنة المتوفرة بالمسجل اللوجستي.
                </p>
              </div>

              {/* Input Logger form */}
              <form onSubmit={handleAddStockSubmit} className="bg-slate-50 p-4 rounded-2xl border border-gray-150 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1">اسم المورد أو المستلزم:</label>
                  <input
                    type="text"
                    value={newStockName}
                    onChange={(e) => setNewStockName(e.target.value)}
                    placeholder="مثال: سماد بوتاسيوم بلدي فاخر"
                    required
                    className="w-full text-xs p-2.5 bg-white border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-650 text-gray-600 mb-1">الكمية الإضافية:</label>
                  <input
                    type="number"
                    min={1}
                    value={newStockQty}
                    onChange={(e) => setNewStockQty(e.target.value)}
                    placeholder="150"
                    required
                    className="w-full text-xs p-2.5 bg-white border rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#064E3B] hover:bg-[#059669] text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  حفظ وتسجيل المورد
                </button>
              </form>

              {/* Stock Items items logs widgets grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {warehouseStock.map((item) => (
                  <div key={item.id} className="border rounded-2xl p-4 bg-white shadow-inner flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">موقع التخزين: {item.location}</span>
                      <strong className="text-xs text-[#064E3B] mt-1 block">{item.name}</strong>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-dashed mt-3">
                      <span className="text-xs font-mono font-bold text-slate-850 text-slate-800">
                        {item.quantity} {item.unit}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        item.quantity < item.minLimit 
                          ? "bg-red-50 text-red-650 text-red-650 text-red-600" 
                          : "bg-emerald-50 text-[#064E3B]"
                      }`}>
                        {item.quantity < item.minLimit ? "تنبيه انخفاض المخزون" : "مستقر"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: LIVESTOCK AND FISH FARMS */}
          {activeTab === "livestock" && (
            <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
              
              {/* Livestock Header section */}
              <div>
                <h3 className="font-extrabold text-base text-[#064E3B] flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-emerald-600" />
                  <span>برنامج المتابعة والرعاية للثروة الحيوانية والاستزراع السمكي بالديرة</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  أعداد المواشي، مستويات اللقاح الوقائي، وبيانات جودة تدوير مياه أحواض البلطي.
                </p>
              </div>

              {/* Mammals widgets list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border rounded-2xl p-4.5 bg-slate-50/50">
                  <h4 className="font-extrabold text-xs text-[#064E3B] mb-3">حساب الثروة الداجنة والماشية:</h4>
                  <div className="space-y-2 text-xs text-gray-700">
                    <div className="flex justify-between border-b pb-1">
                      <span>الأبقار والماشية:</span>
                      <strong>{initialLivestock.cattle.count} رأس</strong>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span>جاموس حليبي:</span>
                      <strong>{initialLivestock.buffalo.count} رأس</strong>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span>أغنام برقي بلدي:</span>
                      <strong>{initialLivestock.sheep.count} رأس</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>تسمين دواجن اللوهمان:</span>
                      <strong>{initialLivestock.poultry.count} طائر</strong>
                    </div>
                  </div>
                </div>

                <div className="border rounded-2xl p-4.5 bg-slate-50/50">
                  <h4 className="font-extrabold text-xs text-blue-805 text-blue-800 mb-3">مؤشرات الاستزراع السمكي النشطة (Tilapia Pond):</h4>
                  <div className="space-y-2 text-xs text-gray-700">
                    <div className="flex justify-between border-b pb-1">
                      <span>درجة حرارة مياه الحوض السمكي:</span>
                      <strong className="font-mono">{initialFishFarm.waterQuality.temp}° م (مثالي)</strong>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span>الأس الهيدروجيني للحوض pH:</span>
                      <strong className="font-mono">{initialFishFarm.waterQuality.ph}</strong>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span>نسبة الأكسجين المذاب:</span>
                      <strong className="font-mono text-emerald-600">{initialFishFarm.waterQuality.oxygen} ملجم/لتر</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>البلطي المسجل بالحوض:</span>
                      <strong>٨,٥٠٠ سمكة</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: FINANCIAL LEDGER SHEETS */}
          {activeTab === "financial" && (
            <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-base text-[#064E3B] flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#F59E0B]" />
                  <span>شعبة الائتمان وسجل المصروفات والأرباح للفدان</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  سجل وقيد الحركات المالية وحساب المردود الاستثماري ROI وتكلفة الغلة.
                </p>
              </div>

              {/* Transactions adder form */}
              <form onSubmit={handleAddFinSubmit} className="bg-slate-50 border p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">نوع العملية المالية:</label>
                  <select
                    value={newFinType}
                    onChange={(e) => setNewFinType(e.target.value as any)}
                    className="w-full text-xs p-2 bg-white border rounded-xl"
                  >
                    <option value="revenue">وارد (إيراد)</option>
                    <option value="expense">صادر (مصروف)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1">بيان البند المالي الصادر/المودع:</label>
                  <input
                    type="text"
                    value={newFinCategory}
                    onChange={(e) => setNewFinCategory(e.target.value)}
                    placeholder="مبيعات محصول الطماطم"
                    required
                    className="w-full text-xs p-2 bg-white border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-650 text-gray-600 mb-1">القيمة الإجمالية بالجنيه:</label>
                  <input
                    type="number"
                    min={1}
                    value={newFinAmt}
                    onChange={(e) => setNewFinAmt(e.target.value)}
                    placeholder="6500"
                    required
                    className="w-full text-xs p-2 bg-white border rounded-xl"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-gray-605 text-gray-600 mb-1">الوصف التفصيلي (اختياري):</label>
                  <input
                    type="text"
                    value={newFinDesc}
                    onChange={(e) => setNewFinDesc(e.target.value)}
                    placeholder="تفاصيل العقد أو صك القيد المركزي"
                    className="w-full text-xs p-2 bg-white border rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#064E3B] hover:bg-[#059669] text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  حفظ وتسجيل السند
                </button>
              </form>

              {/* List logs of financial transactions */}
              <div className="divide-y divide-gray-100">
                {financials.map((fin) => (
                  <div key={fin.id} className="py-3.5 flex justify-between items-center text-xs">
                    <div>
                      <strong className="block text-[#064E3B] font-extrabold">{fin.category}</strong>
                      <span className="text-[10px] text-gray-400 block mt-0.5">{fin.description}</span>
                    </div>

                    <div className="text-left font-mono">
                      <span className={`text-base font-extrabold ${fin.type === "revenue" ? "text-emerald-600" : "text-red-600"}`}>
                        {fin.type === "revenue" ? "+" : "-"}{fin.amount.toLocaleString()} ج.م
                      </span>
                      <span className="text-[9px] text-gray-400 block mt-0.5">سجل: {fin.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: SMART PDF REPORTS EXPORTER */}
          {activeTab === "reports" && (
            <ReportsPanel 
              userGovernorate={activeFarm.governorate} 
              userName={currentUser?.name || "المهندس إبراهيم"} 
              farmSize={activeFarm.size} 
              farmName={activeFarm.name}
              activeFarm={activeFarm}
              irrigationPlans={irrigationPlans}
            />
          )}

          {/* TAB 12: AGRICULTURAL MARKETPLACE PROFILES */}
          {activeTab === "marketplace" && (
            <div className="space-y-6">
              <div className="bg-white border rounded-3xl p-6 shadow-sm">
                <h3 className="font-extrabold text-base text-[#064E3B] mb-1">السوق المركزي ومستلزمات الغلة للفلاح</h3>
                <p className="text-xs text-gray-400">
                  اشتر تقاوي معتمدة، اسحب مخصبات زراعية حيوية، أو استأجر جرارات ثقيلة مع السائق بروابط فورية.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {initialMarketplace.map((m) => (
                  <div key={m.id} className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-sm flex flex-col justify-between">
                    <img src={m.imageUrl} alt={m.title} className="w-full h-40 object-cover" />
                    
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                          {m.category === "buy-seed" ? "بيع تقاوي معتمدة" : m.category === "buy-fertilizer" ? "أسمدة ومخصبات" : "إيجار معدات وآلات"}
                        </span>
                        <h4 className="font-extrabold text-xs text-[#064E3B] mt-2 leading-relaxed">{m.title}</h4>
                      </div>

                      <div className="border-t border-dashed pt-3 mt-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-xs font-black text-[#059669]">{m.price} ج.م</span>
                          <span className="text-[10px] text-gray-400">لكل: {m.unit}</span>
                        </div>
                        <p className="text-[9px] text-gray-500 mt-2">المعلن: {m.seller}</p>
                      </div>

                      <a 
                        href={`tel:${m.phone}`}
                        className="w-full py-2 bg-[#064E3B] hover:bg-[#059669] text-white text-center rounded-xl text-[10px] font-bold mt-3 block transition-colors cursor-pointer"
                      >
                        اتصل بالباع الآن: {m.phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 13: NETWORK FOR ELITE EGYPTIAN ENGINEERS */}
          {activeTab === "engineers" && (
            <div className="space-y-6">
              <div className="bg-white border rounded-3xl p-6 shadow-sm">
                <h3 className="font-extrabold text-base text-[#064E3B] mb-1">الرابطة القومية لمهندسي واستشاريي مصر الرقمية</h3>
                <p className="text-xs text-gray-400">
                  تواصل واحجز فحص عيني واستشر علماء الأكاديمية والمختبرات بدقة متناهية.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {initialEngineers.map((e) => (
                  <div key={e.id} className="bg-white rounded-3xl border border-gray-150 p-5 shadow-sm text-center flex flex-col justify-between items-center gap-4">
                    <img src={e.imageUrl} alt={e.name} className="w-20 h-20 rounded-full object-cover border-2 border-[#059669]" />
                    
                    <div>
                      <strong className="text-sm font-black text-[#064E3B] block">{e.name}</strong>
                      <span className="text-[10px] text-gray-400 block mt-0.5">{e.specialty}</span>
                    </div>

                    <div className="w-full bg-slate-50 p-2.5 rounded-xl border flex justify-between text-[11px] text-gray-500 font-medium">
                      <span>الخبرة: {e.experienceYears} عاماً</span>
                      <span className="text-[#F59E0B] font-bold">★ {e.rating} ({e.reviewsCount} تقييم)</span>
                    </div>

                    <button
                      onClick={() => triggerUserFeedback(`تم تسجيل طلب الاستشارة الاستكشافية مع ${e.name}. سيتواصل مكتب الإرشاد معك لتأكيد موعد الزيارة لمحافظتك.`)}
                      className="w-full py-2.5 bg-[#064E3B] hover:bg-[#059669] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      طلب حجز زيارة للحيازة
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 14: SETTINGS & FARMERS PREFECTURE INFORMATION */}
          {activeTab === "settings" && (
            <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-base text-[#064E3B] flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span>لوحة التخصيص وبيانات الكارت الرقمي الموحد</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  مراجعة المعرفات السيبرانية وربط الحساب ببوابة الحيازات الزراعية لوزارة الاتصالات.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#F0F4F0] rounded-2xl border border-emerald-150 text-xs leading-relaxed text-[#064E3B]">
                  <strong>صمم وركب البنية الهيكلية والأنظمة للمنصة الوطنية:</strong><br />
                  تم التخطيط، والصقل، والتطوير الفني بالكامل تحت رعاية الهيئات الرقمية الموحدة وبواسطة <strong>المهندس والمبرمج الزراعي الفذ إبراهيم</strong> لدعم الاقتصاد الأخضر والأبحاث السيادية.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-right text-gray-700">
                  <div className="p-3 bg-slate-50 rounded-xl border">
                    <span className="text-gray-400 block text-[10px]">كارت الرقم القومي للفلاح:</span>
                    <strong className="text-slate-900 block mt-1">CARD-2026-AR-EGY-30987</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border">
                    <span className="text-gray-400 block text-[10px]">حالة المحور المركزي السحابي:</span>
                    <strong className="text-emerald-700 block mt-1">مشفر بمصداقية عالية SSL</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 15: COMMUNITY Q&A FORUM */}
          {activeTab === "community-qa" && (
            <CommunityQA 
              isOffline={isOffline}
              currentUser={currentUser}
              onAddOfflineAction={(module, actionName, payload) => handleQueueOfflineAction(module, actionName, payload)}
              onEarnPoints={(pts, reason) => handleEarnPoints(pts, reason)}
            />
          )}

          {/* TAB 16: GAMIFICATION & PRIZES LEADERBOARD */}
          {activeTab === "gamification" && (
            <GamificationCenter 
              points={userPoints}
              userGovernorate={activeFarm.governorate}
              userName={currentUser?.name || "المهندس إبراهيم"}
            />
          )}

          {/* TAB 17: REAL GIS & SATELLITE MAPS (الخرائط الجغرافية الحقيقية) */}
          {activeTab === "gis" && (
            <div className="space-y-4">
              <RealGISMap
                currentFarm={activeFarm}
                allFarms={farms}
                activeSoil={activeFarmSoil}
                onBoundaryUpdated={(farmId, boundaryGeo) => {
                  setFarms(prev => prev.map(f => {
                    if (f.id === farmId) {
                      return { ...f, boundaryGeoJson: boundaryGeo } as Farm;
                    }
                    return f;
                  }));
                  triggerUserFeedback("✅ تم حفظ وتحديث الحدود الجغرافية للمزرعة في النظام بنجاح!");
                  handleEarnPoints(40, "رسم وتوثيق مضلع حدود المزرعة (GeoJSON)");
                }}
              />
            </div>
          )}

          {/* TAB 18: ADMIN METRICS & PILOT COST ESTIMATOR (الرقابة الإدارية ودراسة الجدوى) */}
          {activeTab === "admin-metrics" && (
            <div className="space-y-4">
              <AdminMetricsDashboard />
            </div>
          )}

        </main>

      </div>

      {/* FOOTER GENERAL */}
      <footer className="bg-[#052b21] text-white/50 text-center py-5 border-t border-emerald-950 mt-12 text-[11px] space-y-2">
        <div>
          جمهورية مصر العربية • أول منظومة قومية للزراعة الذكية والاستبصار الكلي
        </div>
        <div className="text-white/30">
          تخطيط، تصميم والبرمجة الهندسية الحيوية الكاملة للأقسام تمّت بيد <span className="text-[#F59E0B] font-extrabold text-xs">المهندس إبراهيم</span> © ٢٠٢٦ م
        </div>
      </footer>

      {/* MODAL WINDOWS: ADD NEW FARM CARDS (CRUD ACTION) */}
      {showAddFarmModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border relative overflow-hidden text-right" dir="rtl">
            <h3 className="font-extrabold text-sm text-[#064E3B] mb-3">حصر وتسجيل حيازة (فدان) بالنظام القومي</h3>
            
            <form onSubmit={handleCreateFarmSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">اسم المزرعة المقترح بالدفاتر:</label>
                <input
                  type="text"
                  value={newFarmName}
                  onChange={(e) => setNewFarmName(e.target.value)}
                  placeholder="مثال: مزرعة واحة التوت بالدلتا"
                  required
                  className="w-full text-xs p-2.5 bg-gray-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الميدان أو المحافظة التابعة:</label>
                  <select
                    value={newFarmGov}
                    onChange={(e) => setNewFarmGov(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border rounded-xl"
                  >
                    {EgyptGovernorates.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">مساحة الأرض (بالفدان):</label>
                  <input
                    type="number"
                    min="1"
                    value={newFarmSize}
                    onChange={(e) => setNewFarmSize(e.target.value)}
                    placeholder="25 فدان"
                    required
                    className="w-full text-xs p-2.5 bg-gray-50 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">طبيعة وتربة القطاع:</label>
                  <select
                    value={newFarmSoil}
                    onChange={(e) => setNewFarmSoil(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border rounded-xl"
                  >
                    <option value="طينية خصبة (Delta Silt)">طينية دبلية خصبة</option>
                    <option value="رملية صحراوية مستصلحة">رملية مستصلحة جيرية</option>
                    <option value="طميية رملية متوسطة">طميية رملية طينية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">مصدر الري الرئيسي الحاصل:</label>
                  <select
                    value={newFarmWater}
                    onChange={(e) => setNewFarmWater(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border rounded-xl"
                  >
                    <option value="مشروع ترعة المحمودية + ري بالتنقيط">تنقيط بـ ترعة المحمودية</option>
                    <option value="فرع ترعة الشيخ زايد (مياه النيل)">قنوات النيل بـ الشيخ زايد</option>
                    <option value="بئر جوفي عميق + ري محوري">آبار ري جوفية عميقة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">المحصول المستهدف بالأولوية الأوجية:</label>
                <select
                  value={newFarmCrops}
                  onChange={(e) => setNewFarmCrops(e.target.value)}
                  className="w-full text-xs p-2.5 bg-gray-50 border rounded-xl"
                >
                  <option value="قمح">قمح بلدي الذهب الأصفر</option>
                  <option value="بطاطس">بطاطس سبونتا</option>
                  <option value="طماطم">طماطم هجين بحثية</option>
                  <option value="زيتون">أشجار زيتون فاخرة</option>
                  <option value="تمور">نخيل تمور مجهول</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#064E3B] hover:bg-[#059669] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  تسجيل وتأكيد الدفتر
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddFarmModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  إلغاء الحيازة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WEATHER ALERTS DETAILS MODAL */}
      {showWeatherAlertsModal && (
        <div id="weather-alerts-modal-overlay" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={() => setShowWeatherAlertsModal(false)}>
          <div 
            id="weather-alerts-modal-container"
            className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-red-100 relative overflow-hidden text-right flex flex-col max-h-[90vh]" 
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Red Gradient Accent */}
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-l from-red-600 via-amber-500 to-red-600" />
            
            <div className="flex justify-between items-start mb-4 mt-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-red-100 text-red-700 rounded-xl flex items-center justify-center border border-red-350">
                  <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                </div>
                <div>
                  <h3 id="weather-alerts-title" className="font-extrabold text-sm sm:text-base text-[#7F1D1D]">مركز رصد الإنذارات المناخية والبيئية</h3>
                  <p className="text-[10px] text-gray-400 font-bold">إجلاء استباقي للظواهر الحادة حفاظاً على جودة محاصيل الفلاح المصري</p>
                </div>
              </div>
              <button 
                id="close-weather-alerts-btn"
                onClick={() => setShowWeatherAlertsModal(false)}
                className="text-gray-400 hover:text-gray-650 p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors text-xs font-bold"
                title="إغلاق"
              >
                ✕
              </button>
            </div>

            {/* Alerts Scrollable Body Container */}
            <div className="overflow-y-auto space-y-4 pr-1 py-1 flex-1">
              <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-850 font-medium flex items-start gap-3">
                <span className="text-sm">💡</span>
                <p className="leading-relaxed">
                  تحديثات الإنذار المبكر مربوطة آلياً بالهيئة القومية للأرصاد بجمهورية مصر العربية ومراكز الاستشعار عن بعد لدورة ٢٠٢٦ م.
                </p>
              </div>

              {activeWeatherAlerts.map((w, index) => {
                return (
                  <div key={index} id={`alert-card-${index}`} className="border border-red-200 hover:border-red-400 bg-red-50/20 rounded-2xl p-4 space-y-3 transition-colors duration-300 relative overflow-hidden text-right">
                    {/* Badge alert index or state */}
                    <div className="flex justify-between items-center bg-red-50/40 p-2 rounded-xl border border-red-100/30">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                        <strong className="text-xs text-[#7F1D1D] font-extrabold">{w.date}</strong>
                      </div>
                      <span className="bg-[#7F1D1D] text-red-100 text-[9px] font-black px-2 py-0.5 rounded-full">
                        حالة إنذار طارئة
                      </span>
                    </div>

                    {/* Meteorological stats */}
                    <div className="grid grid-cols-3 gap-2 py-1 bg-white border border-slate-100 rounded-xl text-center shadow-inner">
                      <div>
                        <span className="text-[9px] text-gray-400 block font-bold">الحرارة العظمى</span>
                        <span className="text-xs font-black text-red-600 font-mono">{w.tempMax}° م</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 block font-bold">الرطوبة المقدرة</span>
                        <span className="text-xs font-black text-blue-800 font-mono">{w.humidity}%</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 block font-bold">سرعة الرياح وجهتها</span>
                        <span className="text-xs font-black text-amber-800 font-mono">{w.windSpeed} كم/س</span>
                      </div>
                    </div>

                    {/* Alert Message Details */}
                    <div className="bg-red-50/70 border-r-4 border-red-500 rounded-lg p-3 text-xs text-right">
                      <span className="text-gray-400 text-[10px] block font-extrabold mb-1">البيان الرسمي والإرشاد الموجه:</span>
                      <p className="text-slate-850 font-extrabold text-[#7F1D1D] leading-relaxed">
                        {w.alert}
                      </p>
                    </div>

                    {/* Micro action triggers to interact */}
                    <div className="flex justify-end gap-2 text-[10px] pt-1.5 border-t border-red-100/50">
                      <button 
                        onClick={() => {
                          triggerUserFeedback(`تم ترحيل خطة تدارك الإنذار المناخي لـ ${w.date} لمكتبة الكارت الذكي لمزرعة: ${activeFarm.name}`);
                          setShowWeatherAlertsModal(false);
                        }}
                        className="bg-[#064E3B] hover:bg-[#059669] text-white py-1.5 px-3 rounded-lg font-black transition-colors cursor-pointer"
                      >
                        جدولة التدارك الذكي للري
                      </button>
                      <button 
                        onClick={() => triggerUserFeedback(`تم تعميم التنبيه الفوري: "${w.alert}" برسالة نصية لكافة حقول المزارعين المجاورة بالمنطقة.`)}
                        className="bg-[#F59E0B] hover:bg-amber-500 text-slate-950 py-1.5 px-3 rounded-lg font-black transition-colors cursor-pointer"
                      >
                        تعميم إلكتروني للمزارعين
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer with actions */}
            <div className="pt-4 border-t border-gray-150 flex gap-2">
              <button
                id="acknowledge-all-alerts-btn"
                onClick={() => {
                  triggerUserFeedback("تمت مراجعة وأرشفة كافة التحذيرات النشطة لهذا الأسبوع مع تعديل استهلاك الطاقة بالتنسيق الإداري.");
                  setShowWeatherAlertsModal(false);
                }}
                className="flex-1 py-2.5 bg-[#064E3B] hover:bg-[#059669] text-white font-extrabold rounded-xl text-xs transition-colors cursor-pointer text-center"
              >
                تأكيد وقراءة كافة الإنذارات الزراعية
              </button>
              <button
                id="close-weather-modal-secondary-btn"
                onClick={() => setShowWeatherAlertsModal(false)}
                className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold rounded-xl text-xs transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real IoT Hardware Integration Modal */}
      <IoTIntegrationModal
        isOpen={showIoTModal}
        onClose={() => setShowIoTModal(false)}
        farmId={activeFarm.id}
        farmName={activeFarm.name}
        onTelemetryUpdated={handleTelemetryUpdated}
      />

    </div>
  );
}
