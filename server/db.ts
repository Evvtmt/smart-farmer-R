/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AgriNova Production Database & Storage Engine
 * Provides persistent, atomic storage for:
 * Users, Farms, Fields, Sensors, SensorReadings, IrrigationRecommendations, Alerts, PlantDiagnoses, Telemetry
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  salt: string;
  role: "farmer" | "engineer" | "investor" | "manager" | "admin";
  governorate: string;
  farmSize: number;
  token?: string;
  createdAt: string;
  lastLogin: string;
}

export interface FarmRecord {
  id: string;
  userId: string;
  name: string;
  location: string;
  governorate: string;
  latitude: number;
  longitude: number;
  areaFeddans: number;
  cropType: string;
  variety?: string;
  plantingDate: string;
  growthStage: "initial" | "development" | "mid" | "late";
  soilType: "clay" | "sandy" | "loamy" | "calcareous";
  irrigationMethod: "drip" | "sprinkler" | "flood";
  waterSource: string;
  boundaryGeoJson?: any;
  status: "perfect" | "warning" | "critical";
  createdAt: string;
  updatedAt: string;
}

export interface SensorRecord {
  id: string;
  deviceId: string;
  farmId: string;
  sensorId: string;
  name: string;
  type: "soil_npk_moisture" | "weather_station" | "flow_meter";
  latitude: number;
  longitude: number;
  batteryLevel: number;
  status: "online" | "offline";
  lastReadingAt: string;
}

export interface SensorReadingRecord {
  id: string;
  deviceId: string;
  farmId: string;
  sensorId: string;
  soilMoisture: number; // percentage 0-100
  temperature: number; // Celsius
  humidity?: number; // Air humidity 0-100
  ph: number;
  nitrogen: number; // mg/kg
  phosphorus: number; // mg/kg
  potassium: number; // mg/kg
  batteryLevel: number;
  isSimulation: boolean;
  timestamp: string;
}

export interface IrrigationRecommendationRecord {
  id: string;
  farmId: string;
  timestamp: string;
  soilMoisture: number;
  cropType: string;
  growthStage: string;
  soilType: string;
  et0: number;
  etc: number;
  irrigationNeeded: boolean;
  urgency: string;
  recommendedTimingAr: string;
  grossWaterVolumeM3: number;
  grossWaterVolumeLiters: number;
  deterministicReasoningAr: string;
  aiExplanation?: string;
  confidenceScore: number;
}

export interface AlertRecord {
  id: string;
  farmId: string;
  userId: string;
  type: "moisture_low" | "heat_extreme" | "rain_heavy" | "sensor_offline" | "battery_low" | "disease_risk";
  severity: "info" | "warning" | "critical";
  titleAr: string;
  messageAr: string;
  isRead: boolean;
  createdAt: string;
}

export interface PlantDiagnosisRecord {
  id: string;
  farmId: string;
  userId: string;
  cropHint: string;
  diseaseNameArabic: string;
  diseaseNameEnglish: string;
  confidence: number;
  diagnosticDetails: string;
  treatmentPlan: string[];
  fertilizersRecs: string[];
  pesticidesRecs: string[];
  preventionTips: string[];
  timestamp: string;
}

export interface SystemStatsRecord {
  totalApiRequests: number;
  totalAiRequests: number;
  totalSensorReadings: number;
  totalAlertsCreated: number;
  systemErrorsCount: number;
  serverStartedAt: string;
  lastActiveAt: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  farms: FarmRecord[];
  sensors: SensorRecord[];
  sensorReadings: SensorReadingRecord[];
  irrigationRecommendations: IrrigationRecommendationRecord[];
  alerts: AlertRecord[];
  plantDiagnoses: PlantDiagnosisRecord[];
  stats: SystemStatsRecord;
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "agrinova_db.json");

// Helper to hash passwords using standard PBKDF2 with salt
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const finalSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, finalSalt, 1000, 64, "sha512").toString("hex");
  return { hash, salt: finalSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verify = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return verify === hash;
}

export function generateAuthToken(userId: string): string {
  const payload = `${userId}:${Date.now()}:${crypto.randomBytes(12).toString("hex")}`;
  return Buffer.from(payload).toString("base64url");
}

class AgriNovaDB {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.loadDatabase();
  }

  private initDefaultData(): DatabaseSchema {
    const adminSalt = crypto.randomBytes(16).toString("hex");
    const adminHash = hashPassword("Admin@AgriNova2026", adminSalt).hash;

    const pilotUserSalt = crypto.randomBytes(16).toString("hex");
    const pilotUserHash = hashPassword("Farmer1234", pilotUserSalt).hash;

    const initialUsers: UserRecord[] = [
      {
        id: "usr-admin-1",
        name: "إدارة منصة أجرينوفا (المشرف)",
        email: "admin@agrinova.eg",
        phone: "01000000001",
        passwordHash: adminHash,
        salt: adminSalt,
        role: "admin",
        governorate: "القاهرة",
        farmSize: 0,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      },
      {
        id: "usr-farmer-1",
        name: "الحاج إبراهيم منصور",
        email: "ebrahim@farmer.gov.eg",
        phone: "01012345678",
        passwordHash: pilotUserHash,
        salt: pilotUserSalt,
        role: "farmer",
        governorate: "الشرقية",
        farmSize: 2.5,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      },
      {
        id: "usr-farmer-2",
        name: "محمد عبد السلام",
        email: "m.abdelsalam@gmail.com",
        phone: "01123456789",
        passwordHash: pilotUserHash,
        salt: pilotUserSalt,
        role: "farmer",
        governorate: "البحيرة",
        farmSize: 1.8,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }
    ];

    const initialFarms: FarmRecord[] = [
      {
        id: "farm-1",
        userId: "usr-farmer-1",
        name: "حقل السلام الحديث (الدلتا)",
        location: "بلبيس - الزقازيق",
        governorate: "الشرقية",
        latitude: 30.5877,
        longitude: 31.5020,
        areaFeddans: 2.5,
        cropType: "القمح",
        variety: "سدس 14",
        plantingDate: "2025-11-20",
        growthStage: "mid",
        soilType: "clay",
        irrigationMethod: "drip",
        waterSource: "ترعة الإسماعيلية مع فلترة موجهة",
        status: "perfect",
        boundaryGeoJson: {
          type: "Feature",
          properties: { name: "حدود الحقل 1" },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [31.5010, 30.5870],
                [31.5035, 30.5870],
                [31.5032, 30.5885],
                [31.5008, 30.5885],
                [31.5010, 30.5870]
              ]
            ]
          }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "farm-2",
        userId: "usr-farmer-2",
        name: "مزرعة الدلتا الخضراء",
        location: "دمنهور - إيتاي البارود",
        governorate: "البحيرة",
        latitude: 31.0364,
        longitude: 30.4689,
        areaFeddans: 1.8,
        cropType: "البطاطس",
        variety: "سبونتا هولندي",
        plantingDate: "2026-01-15",
        growthStage: "development",
        soilType: "loamy",
        irrigationMethod: "sprinkler",
        waterSource: "ري مياه ترعة النوبارية",
        status: "warning",
        boundaryGeoJson: {
          type: "Feature",
          properties: { name: "حدود الحقل 2" },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [30.4670, 31.0355],
                [30.4705, 31.0355],
                [30.4700, 31.0375],
                [30.4665, 31.0375],
                [30.4670, 31.0355]
              ]
            ]
          }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const initialSensors: SensorRecord[] = [
      {
        id: "sns-1",
        deviceId: "ESP32-AGRI-001",
        farmId: "farm-1",
        sensorId: "SOIL-PROBE-01",
        name: "مجس التربة الكهرومغناطيسي RS485 (القطاع أ)",
        type: "soil_npk_moisture",
        latitude: 30.5878,
        longitude: 31.5022,
        batteryLevel: 94,
        status: "online",
        lastReadingAt: new Date().toISOString()
      },
      {
        id: "sns-2",
        deviceId: "ESP32-AGRI-002",
        farmId: "farm-2",
        sensorId: "SOIL-PROBE-02",
        name: "مجس البطاطس (القطاع ب)",
        type: "soil_npk_moisture",
        latitude: 31.0365,
        longitude: 30.4690,
        batteryLevel: 88,
        status: "online",
        lastReadingAt: new Date().toISOString()
      }
    ];

    const initialReadings: SensorReadingRecord[] = [
      {
        id: `rd-${Date.now()}-1`,
        deviceId: "ESP32-AGRI-001",
        farmId: "farm-1",
        sensorId: "SOIL-PROBE-01",
        soilMoisture: 68.4,
        temperature: 24.2,
        humidity: 52,
        ph: 7.2,
        nitrogen: 142,
        phosphorus: 38,
        potassium: 240,
        batteryLevel: 94,
        isSimulation: false,
        timestamp: new Date().toISOString()
      }
    ];

    const initialAlerts: AlertRecord[] = [
      {
        id: `alt-1`,
        farmId: "farm-1",
        userId: "usr-farmer-1",
        type: "moisture_low",
        severity: "warning",
        titleAr: "رطوبة منخفضة في القطاع أ",
        messageAr: "انخفضت رطوبة التربة إلى 68% مقتربة من عتبة الاستنزاف لمحصول القمح. يوصى بمراجعة جدول الري بالتنقيط.",
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ];

    return {
      users: initialUsers,
      farms: initialFarms,
      sensors: initialSensors,
      sensorReadings: initialReadings,
      irrigationRecommendations: [],
      alerts: initialAlerts,
      plantDiagnoses: [],
      stats: {
        totalApiRequests: 42,
        totalAiRequests: 8,
        totalSensorReadings: 1,
        totalAlertsCreated: 1,
        systemErrorsCount: 0,
        serverStartedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString()
      }
    };
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.farms) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Could not read existing database, creating default seed:", err);
    }
    const def = this.initDefaultData();
    this.saveImmediate(def);
    return def;
  }

  private saveImmediate(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      const data = dataToSave || this.data;
      const tmpPath = `${DB_PATH}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf-8");
      fs.renameSync(tmpPath, DB_PATH);
    } catch (e) {
      console.error("Database save failed:", e);
    }
  }

  public save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveImmediate();
    }, 200);
  }

  // --- USER METHODS ---
  public findUserById(id: string): UserRecord | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public findUserByEmailOrPhone(identifier: string): UserRecord | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.data.users.find(u => 
      u.email.toLowerCase() === clean || 
      u.phone.replace(/\s+/g, "") === clean.replace(/\s+/g, "")
    );
  }

  public findUserByToken(token: string): UserRecord | undefined {
    if (!token) return undefined;
    return this.data.users.find(u => u.token === token);
  }

  public createUser(user: Omit<UserRecord, "id" | "createdAt" | "lastLogin">): UserRecord {
    const newRecord: UserRecord = {
      ...user,
      id: `usr-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    this.data.users.push(newRecord);
    this.save();
    return newRecord;
  }

  public updateUser(id: string, updates: Partial<UserRecord>): UserRecord | null {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();
    return this.data.users[idx];
  }

  // --- FARM METHODS ---
  public getFarmsByUserId(userId: string): FarmRecord[] {
    const user = this.findUserById(userId);
    // Admins can see all farms, normal users see only their own
    if (user?.role === "admin") {
      return this.data.farms;
    }
    return this.data.farms.filter(f => f.userId === userId);
  }

  public getFarmById(farmId: string): FarmRecord | undefined {
    return this.data.farms.find(f => f.id === farmId);
  }

  public createFarm(farm: Omit<FarmRecord, "id" | "createdAt" | "updatedAt">): FarmRecord {
    const newFarm: FarmRecord = {
      ...farm,
      id: `farm-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.farms.push(newFarm);

    // Auto-create default sensor for this farm
    const newSensor: SensorRecord = {
      id: `sns-${Date.now()}`,
      deviceId: `ESP32-${newFarm.id.slice(-6).toUpperCase()}`,
      farmId: newFarm.id,
      sensorId: `PROBE-01`,
      name: `حساس التربة ${newFarm.name}`,
      type: "soil_npk_moisture",
      latitude: newFarm.latitude,
      longitude: newFarm.longitude,
      batteryLevel: 98,
      status: "online",
      lastReadingAt: new Date().toISOString()
    };
    this.data.sensors.push(newSensor);

    this.save();
    return newFarm;
  }

  public updateFarm(farmId: string, updates: Partial<FarmRecord>): FarmRecord | null {
    const idx = this.data.farms.findIndex(f => f.id === farmId);
    if (idx === -1) return null;
    this.data.farms[idx] = {
      ...this.data.farms[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data.farms[idx];
  }

  public deleteFarm(farmId: string): boolean {
    const initialLen = this.data.farms.length;
    this.data.farms = this.data.farms.filter(f => f.id !== farmId);
    this.data.sensors = this.data.sensors.filter(s => s.farmId !== farmId);
    this.data.sensorReadings = this.data.sensorReadings.filter(r => r.farmId !== farmId);
    this.data.alerts = this.data.alerts.filter(a => a.farmId !== farmId);
    this.save();
    return this.data.farms.length < initialLen;
  }

  // --- SENSOR & TELEMETRY METHODS ---
  public getSensorsByFarmId(farmId: string): SensorRecord[] {
    return this.data.sensors.filter(s => s.farmId === farmId);
  }

  public getAllSensors(): SensorRecord[] {
    return this.data.sensors;
  }

  public getSensorByDeviceId(deviceId: string): SensorRecord | undefined {
    return this.data.sensors.find(s => s.deviceId === deviceId);
  }

  public addSensorReading(reading: Omit<SensorReadingRecord, "id" | "timestamp">): SensorReadingRecord {
    const record: SensorReadingRecord = {
      ...reading,
      id: `rd-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
      timestamp: new Date().toISOString()
    };

    // Update sensor last reading & status
    const sensor = this.data.sensors.find(s => s.deviceId === reading.deviceId || s.farmId === reading.farmId);
    if (sensor) {
      sensor.batteryLevel = reading.batteryLevel;
      sensor.status = "online";
      sensor.lastReadingAt = record.timestamp;
    }

    // Keep history capped at 1000 items to conserve memory
    this.data.sensorReadings.unshift(record);
    if (this.data.sensorReadings.length > 1000) {
      this.data.sensorReadings = this.data.sensorReadings.slice(0, 1000);
    }

    // Stats
    this.data.stats.totalSensorReadings++;
    this.data.stats.lastActiveAt = new Date().toISOString();

    // Check alerts automatically
    if (record.soilMoisture < 35 && !record.isSimulation) {
      this.createAlert({
        farmId: record.farmId,
        userId: "system",
        type: "moisture_low",
        severity: "critical",
        titleAr: "تحذير: جفاف حاد بالتربة!",
        messageAr: `انخفضت نسبة الرطوبة إلى ${record.soilMoisture}%. يجب فحص خطوط الري فوراً.`,
        isRead: false
      });
    }

    if (record.batteryLevel < 20 && !record.isSimulation) {
      this.createAlert({
        farmId: record.farmId,
        userId: "system",
        type: "battery_low",
        severity: "warning",
        titleAr: "شحن بطارية الحساس منخفض",
        messageAr: `نسبة شحن بطارية الحساس ${reading.deviceId} هي ${record.batteryLevel}%. يرجى فحص لوح الطاقة الشمسية.`,
        isRead: false
      });
    }

    this.save();
    return record;
  }

  public getSensorReadings(farmId?: string, limit = 50): SensorReadingRecord[] {
    if (farmId) {
      return this.data.sensorReadings.filter(r => r.farmId === farmId).slice(0, limit);
    }
    return this.data.sensorReadings.slice(0, limit);
  }

  public getLatestSensorReading(farmId: string): SensorReadingRecord | undefined {
    return this.data.sensorReadings.find(r => r.farmId === farmId);
  }

  // --- IRRIGATION RECOMMENDATIONS ---
  public addIrrigationRecommendation(rec: Omit<IrrigationRecommendationRecord, "id" | "timestamp">): IrrigationRecommendationRecord {
    const record: IrrigationRecommendationRecord = {
      ...rec,
      id: `rec-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
      timestamp: new Date().toISOString()
    };
    this.data.irrigationRecommendations.unshift(record);
    if (this.data.irrigationRecommendations.length > 200) {
      this.data.irrigationRecommendations = this.data.irrigationRecommendations.slice(0, 200);
    }
    this.save();
    return record;
  }

  public getIrrigationRecommendations(farmId: string, limit = 20): IrrigationRecommendationRecord[] {
    return this.data.irrigationRecommendations.filter(r => r.farmId === farmId).slice(0, limit);
  }

  // --- ALERTS ---
  public createAlert(alert: Omit<AlertRecord, "id" | "createdAt">): AlertRecord {
    const record: AlertRecord = {
      ...alert,
      id: `alt-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
      createdAt: new Date().toISOString()
    };
    this.data.alerts.unshift(record);
    this.data.stats.totalAlertsCreated++;
    this.save();
    return record;
  }

  public getAlerts(farmId?: string, isRead?: boolean): AlertRecord[] {
    let list = this.data.alerts;
    if (farmId) list = list.filter(a => a.farmId === farmId);
    if (isRead !== undefined) list = list.filter(a => a.isRead === isRead);
    return list;
  }

  public markAlertAsRead(alertId: string): boolean {
    const alert = this.data.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
      this.save();
      return true;
    }
    return false;
  }

  // --- STATS & ADMIN TELEMETRY ---
  public incrementApiRequests() {
    this.data.stats.totalApiRequests++;
    this.data.stats.lastActiveAt = new Date().toISOString();
  }

  public incrementAiRequests() {
    this.data.stats.totalAiRequests++;
    this.data.stats.lastActiveAt = new Date().toISOString();
  }

  public incrementSystemErrors() {
    this.data.stats.systemErrorsCount++;
  }

  public getStats(): SystemStatsRecord & { totalUsers: number; totalFarms: number; totalSensors: number; onlineSensors: number } {
    const onlineSensors = this.data.sensors.filter(s => {
      if (s.status !== "online") return false;
      const diffMs = Date.now() - new Date(s.lastReadingAt).getTime();
      return diffMs < 1000 * 60 * 60 * 6; // Online within 6 hours
    }).length;

    return {
      ...this.data.stats,
      totalUsers: this.data.users.length,
      totalFarms: this.data.farms.length,
      totalSensors: this.data.sensors.length,
      onlineSensors
    };
  }
}

export const db = new AgriNovaDB();
