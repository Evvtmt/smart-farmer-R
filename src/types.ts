/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppView =
  | "splash"
  | "auth"
  | "dashboard"
  | "farm-management"
  | "soil-control"
  | "crop-growth"
  | "ai-diagnosis"
  | "ai-assistant"
  | "weather-intel"
  | "irrigation"
  | "fertilizer"
  | "gis-maps"
  | "satellite-drone"
  | "machinery"
  | "warehouse"
  | "livestock-fish"
  | "financial"
  | "engineers"
  | "marketplace"
  | "news-community"
  | "security"
  | "settings"
  | "reports";

export interface User {
  name: string;
  email: string;
  phone: string;
  role: "farmer" | "engineer" | "investor" | "manager";
  governorate: string;
  farmSize: number;
}

export interface Farm {
  id: string;
  name: string;
  location: string;
  governorate: string;
  size: number; // in Feddan (فدان)
  areaFeddans?: number;
  latitude?: number;
  longitude?: number;
  crops: string[];
  cropType?: string;
  variety?: string;
  plantingDate?: string;
  growthStage?: string;
  soilType: string;
  irrigationMethod?: string;
  waterSource: string;
  establishedDate: string;
  boundaryPoints: { lat: number; lng: number }[];
  boundaryGeoJson?: any;
  status: "perfect" | "warning" | "critical";
}

export interface SoilSensorData {
  farmId: string;
  moisture: number; // percentage
  temperature: number; // celsius
  ph: number;
  nitrogen: number; // mg/kg
  phosphorus: number; // mg/kg
  potassium: number; // mg/kg
  healthScore: number; // 0-100
  lastUpdated: string;
}

export interface CropGrowthStage {
  id: string;
  cropName: string;
  variety: string;
  stageName: string; // e.g., 'إنبات', 'تزهير', 'نضج'
  progress: number; // percentage
  daysToHarvest: number;
  expectedYield: number; // tons
  irrigationStatus: "saturated" | "optimal" | "dry";
  healthScore: number;
}

export interface DiagonalDiseaseResponse {
  diseaseNameArabic: string;
  diseaseNameEnglish: string;
  confidence: number;
  diagnosticDetails: string;
  treatmentPlan: string[];
  fertilizersRecs: string[];
  pesticidesRecs: string[];
  preventionTips: string[];
  monitoringSteps: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

export interface WeatherDay {
  date: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  rainProb: number;
  uvIndex: number;
  alert?: string;
}

export interface IrrigationPlan {
  id: string;
  farmName: string;
  cropType: string;
  scheduleTime: string;
  durationMinutes: number;
  waterVolumeLiter: number;
  method: "drip" | "sprinkler" | "surface";
  status: "scheduled" | "active" | "completed";
}

export interface StockItem {
  id: string;
  name: string;
  category: "seeds" | "fertilizers" | "pesticides" | "equipment" | "spares";
  quantity: number;
  unit: string;
  minLimit: number;
  location: string;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  status: "active" | "maintenance" | "idle" | "error";
  fuelLevel: number; // percentage
  hoursUsed: number;
  gpsLocation: { lat: number; lng: number };
  upcomingMaintenance: string;
}

export interface LiveCameraFeed {
  id: string;
  name: string;
  status: "online" | "offline";
  isMotionDetected: boolean;
  streamUrl: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  category: "buy-seed" | "buy-fertilizer" | "buy-pesticide" | "buy-equipment" | "sell-crop" | "rent-machine" | "services";
  price: number;
  unit: string;
  seller: string;
  phone: string;
  governorate: string;
  imageUrl: string;
}

export interface AgEngineer {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  phone: string;
  governorate: string;
  imageUrl: string;
  availableOnline: boolean;
}

export interface FinancialRecord {
  id: string;
  type: "revenue" | "expense";
  category: string;
  amount: number;
  date: string;
  farmId: string;
  description: string;
}

export interface CommunityAnswer {
  id: string;
  questionId: string;
  authorName: string;
  authorRole: "farmer" | "engineer" | "verified_expert";
  authorTitle?: string;
  text: string;
  timestamp: string;
  upvotes: number;
  isExpertVerified: boolean;
}

export interface CommunityQuestion {
  id: string;
  title: string;
  description: string;
  category: "diseases" | "irrigation" | "soil" | "machinery" | "general";
  categoryLabel: string;
  authorName: string;
  authorGovernorate: string;
  authorRole: string;
  timestamp: string;
  upvotes: number;
  resolved: boolean;
  answers: CommunityAnswer[];
}

export interface FarmerBadge {
  id: string;
  title: string;
  description: string;
  iconName: "sprout" | "wrench" | "shield" | "award" | "star" | "users";
  pointsRequired: number;
  isUnlocked: boolean;
  colorClass: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  governorate: string;
  points: number;
  isCurrentUser?: boolean;
  avatarColor: string;
}

export interface OfflineAction {
  id: string;
  module: "إثبات الحيازة" | "مستودع المخازن" | "سجل الخصوبة" | "منتدى مجتمع الفلاحين" | "سندات ماليـة";
  action: string;
  timestamp: string;
  payload: any;
}
