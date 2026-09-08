/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WeatherDay, SoilSensorData, User, Farm } from "../types";

// Official Coordinates for Egyptian Governorates & Agricultural Megaprojects
export interface GovernorateLocation {
  name: string;
  nameAr: string;
  lat: number;
  lng: number;
  region: "Delta" | "UpperEgypt" | "Coast" | "DesertMegaProject" | "Canal";
}

export const EGYPTIAN_GOVERNORATES_COORDS: Record<string, GovernorateLocation> = {
  "البحيرة": { name: "Beheira", nameAr: "محافظة البحيرة (دمنهور)", lat: 31.0364, lng: 30.4689, region: "Delta" },
  "توشكى والجنوب": { name: "Toshka", nameAr: "مشروع توشكى الخير القومي", lat: 22.6844, lng: 31.5794, region: "DesertMegaProject" },
  "الفيوم": { name: "Fayoum", nameAr: "محافظة الفيوم", lat: 29.3084, lng: 30.8428, region: "UpperEgypt" },
  "الشرقية": { name: "Sharkia", nameAr: "محافظة الشرقية (الزقازيق)", lat: 30.5877, lng: 31.5020, region: "Delta" },
  "كفر الشيخ": { name: "Kafr El Sheikh", nameAr: "محافظة كفر الشيخ", lat: 31.1107, lng: 30.9388, region: "Delta" },
  "الدقهلية": { name: "Dakahlia", nameAr: "محافظة الدقهلية (المنصورة)", lat: 31.0409, lng: 31.3785, region: "Delta" },
  "الغربية": { name: "Gharbia", nameAr: "محافظة الغربية (طنطا)", lat: 30.7865, lng: 31.0004, region: "Delta" },
  "المنوفية": { name: "Menofia", nameAr: "محافظة المنوفية (شبين الكوم)", lat: 30.5523, lng: 30.9912, region: "Delta" },
  "القليوبية": { name: "Qalyubia", nameAr: "محافظة القليوبية (بنها)", lat: 30.4600, lng: 31.1850, region: "Delta" },
  "الجيزة": { name: "Giza", nameAr: "محافظة الجيزة", lat: 30.0131, lng: 31.2089, region: "Delta" },
  "القاهرة": { name: "Cairo", nameAr: "محافظة القاهرة", lat: 30.0444, lng: 31.2357, region: "Delta" },
  "الإسكندرية": { name: "Alexandria", nameAr: "محافظة الإسكندرية", lat: 31.2001, lng: 29.9187, region: "Coast" },
  "مطروح": { name: "Matrouh", nameAr: "محافظة مطروح والساحل الشمالي", lat: 31.3543, lng: 27.2373, region: "Coast" },
  "بني سويف": { name: "Beni Suef", nameAr: "محافظة بني سويف", lat: 29.0661, lng: 31.0994, region: "UpperEgypt" },
  "المنيا": { name: "Minya", nameAr: "محافظة المنيا (عروس الصعيد)", lat: 28.0871, lng: 30.7618, region: "UpperEgypt" },
  "أسيوط": { name: "Asyut", nameAr: "محافظة أسيوط", lat: 27.1809, lng: 31.1837, region: "UpperEgypt" },
  "سوهاج": { name: "Sohag", nameAr: "محافظة سوهاج", lat: 26.5569, lng: 31.6948, region: "UpperEgypt" },
  "قنا": { name: "Qena", nameAr: "محافظة قنا", lat: 26.1551, lng: 32.7160, region: "UpperEgypt" },
  "الأقصر": { name: "Luxor", nameAr: "محافظة الأقصر", lat: 25.6872, lng: 32.6396, region: "UpperEgypt" },
  "أسوان": { name: "Aswan", nameAr: "محافظة أسوان والنوبة", lat: 24.0889, lng: 32.8998, region: "UpperEgypt" },
  "الوادي الجديد": { name: "New Valley", nameAr: "محافظة الوادي الجديد (الخارجة والداخلة)", lat: 25.4514, lng: 30.5472, region: "DesertMegaProject" },
  "الإسماعيلية": { name: "Ismailia", nameAr: "محافظة الإسماعيلية والقناة", lat: 30.5965, lng: 32.2715, region: "Canal" },
};

// Weather Code Interpretation in Arabic for Egyptian Farming
export function interpretWmoCode(code: number): { condition: string; icon: string; alert?: string } {
  switch (code) {
    case 0:
      return { condition: "مشمس وصافٍ تماماً", icon: "sun" };
    case 1:
      return { condition: "صحو بوجه عام", icon: "sun" };
    case 2:
      return { condition: "غائم جزئياً بسحب متفرقة", icon: "cloud-sun" };
    case 3:
      return { condition: "غائم إلى غائم جزئياً", icon: "cloud" };
    case 45:
    case 48:
      return { condition: "شابورة مائية صباحية على الطرق الزراعية", icon: "cloud-fog", alert: "تنبيه: شابورة مائية تؤثر على الرؤية ومعدل التبخر الصباحي" };
    case 51:
    case 53:
    case 55:
      return { condition: "رذاذ خفيف من الأمطار", icon: "cloud-drizzle" };
    case 61:
    case 63:
    case 65:
      return { condition: "أمطار شتوية مباشرة", icon: "cloud-rain", alert: "أمطار متساقطة: قلل كميات مياه الري المجدولة لتفادي تشبع الجذور" };
    case 80:
    case 81:
    case 82:
      return { condition: "زخات مطر متقطعة", icon: "cloud-rain" };
    case 95:
    case 96:
    case 99:
      return { condition: "عواصف رعدية محتملة", icon: "cloud-lightning", alert: "تحذير طقس: رياح هابطة محتملة، احرص على تثبيت الصوبات ومحاور الري" };
    default:
      return { condition: "طقس معتدل ومستقر", icon: "sun" };
  }
}

const AR_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

// Token helper
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem("agrinova_auth_token");
  } catch {
    return null;
  }
}

export function setAuthToken(token: string) {
  try {
    localStorage.setItem("agrinova_auth_token", token);
  } catch {}
}

export function clearAuthToken() {
  try {
    localStorage.removeItem("agrinova_auth_token");
  } catch {}
}

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ----------------------------------------------------
// AUTHENTICATION CLIENT SERVICES
// ----------------------------------------------------
export async function apiLogin(identifier: string, password: string): Promise<{ success: boolean; token?: string; user?: User; error?: string }> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "فشل تسجيل الدخول" };
    }
    if (data.token) {
      setAuthToken(data.token);
    }
    return { success: true, token: data.token, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || "تعذر الاتصال بخادم المصادقة" };
  }
}

export async function apiRegister(payload: {
  name: string;
  email?: string;
  phone: string;
  password: string;
  role?: string;
  governorate?: string;
  farmSize?: number;
}): Promise<{ success: boolean; token?: string; user?: User; error?: string }> {
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "فشل إنشاء الحساب" };
    }
    if (data.token) {
      setAuthToken(data.token);
    }
    return { success: true, token: data.token, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || "تعذر الاتصال بخادم التسجيل" };
  }
}

export async function apiGetMe(): Promise<{ authenticated: boolean; user?: User }> {
  try {
    const res = await fetch("/api/auth/me", {
      headers: getAuthHeaders()
    });
    if (!res.ok) return { authenticated: false };
    const data = await res.json();
    return { authenticated: data.authenticated, user: data.user };
  } catch {
    return { authenticated: false };
  }
}

export async function apiLogout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: getAuthHeaders()
    });
  } finally {
    clearAuthToken();
  }
}

export async function apiForgotPassword(phone: string, newPassword?: string): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, newPassword })
    });
    const data = await res.json();
    if (!res.ok) return { success: false, message: data.error, error: data.error };
    return { success: true, message: data.message };
  } catch (e: any) {
    return { success: false, message: e.message, error: e.message };
  }
}

// ----------------------------------------------------
// FARMS CLIENT SERVICES
// ----------------------------------------------------
export async function apiGetFarms(): Promise<Farm[]> {
  try {
    const res = await fetch("/api/farms", { headers: getAuthHeaders() });
    if (!res.ok) return [];
    const json = await res.json();
    return json.farms || [];
  } catch {
    return [];
  }
}

export async function apiCreateFarm(farmData: Partial<Farm>): Promise<Farm | null> {
  try {
    const res = await fetch("/api/farms", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(farmData)
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.farm || null;
  } catch {
    return null;
  }
}

export async function apiUpdateFarmBoundary(farmId: string, boundaryGeoJson: any): Promise<boolean> {
  try {
    const res = await fetch(`/api/farms/${farmId}/boundary`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ boundaryGeoJson })
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ----------------------------------------------------
// REAL SENSOR DATA INGESTION & TEST SIMULATOR
// ----------------------------------------------------
export async function sendLiveIoTTelemetry(data: {
  deviceId?: string;
  farmId: string;
  sensorId?: string;
  soilMoisture?: number;
  moisture?: number;
  temperature: number;
  ph?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  batteryLevel?: number;
  source?: string;
}): Promise<boolean> {
  try {
    const payload = {
      deviceId: data.deviceId || "ESP32-AGRI-001",
      farmId: data.farmId,
      sensorId: data.sensorId || "SOIL-PROBE-01",
      soilMoisture: data.soilMoisture !== undefined ? data.soilMoisture : (data.moisture ?? 65),
      temperature: data.temperature,
      ph: data.ph,
      nitrogen: data.nitrogen,
      phosphorus: data.phosphorus,
      potassium: data.potassium,
      batteryLevel: data.batteryLevel
    };
    const res = await fetch("/api/sensors/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (e: any) {
    console.error("sendLiveIoTTelemetry error", e);
    return false;
  }
}

export async function sendTestSimulatorPulse(data: {
  farmId: string;
  soilMoisture: number;
  temperature: number;
  ph?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  batteryLevel?: number;
}): Promise<boolean> {
  try {
    const res = await fetch("/api/sensors/test-pulse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchLatestIoTTelemetry(farmId: string): Promise<SoilSensorData | null> {
  try {
    const res = await fetch(`/api/sensors/readings?farmId=${encodeURIComponent(farmId)}&limit=1`);
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.readings && json.readings.length > 0) {
      const r = json.readings[0];
      return {
        farmId: r.farmId,
        moisture: r.soilMoisture,
        temperature: r.temperature,
        ph: r.ph,
        nitrogen: r.nitrogen,
        phosphorus: r.phosphorus,
        potassium: r.potassium,
        healthScore: Math.min(100, Math.round(r.soilMoisture * 0.4 + (r.nitrogen / 200) * 40 + 20)),
        lastUpdated: r.isSimulation ? "محاكاة معتمدة (Test Pulse)" : "بث حي مباشر (IoT Hardware RS485)"
      };
    }
    return null;
  } catch {
    return null;
  }
}

// ----------------------------------------------------
// DETERMINISTIC IRRIGATION DECISION CLIENT
// ----------------------------------------------------
export async function apiCalculateIrrigation(params: {
  farmId: string;
  farmAreaFeddans: number;
  cropType: string;
  growthStage: string;
  soilType: string;
  irrigationMethod: string;
  currentSoilMoisturePct?: number;
  ambientTempC: number;
  humidityPct: number;
  windSpeedKmh: number;
  rainForecastMm?: number;
}): Promise<{ decision: any; aiExplanation: string } | null> {
  try {
    const res = await fetch("/api/irrigation/calculate", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(params)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ----------------------------------------------------
// ADMIN METRICS & SYSTEM TELEMETRY
// ----------------------------------------------------
export async function apiGetAdminMetrics(): Promise<any | null> {
  try {
    const res = await fetch("/api/admin/metrics", { headers: getAuthHeaders() });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ----------------------------------------------------
// ALERTS CLIENT
// ----------------------------------------------------
export async function apiGetAlerts(farmId?: string): Promise<any[]> {
  try {
    const url = farmId ? `/api/alerts?farmId=${encodeURIComponent(farmId)}` : "/api/alerts";
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    const json = await res.json();
    return json.alerts || [];
  } catch {
    return [];
  }
}

export async function apiMarkAlertRead(alertId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/alerts/${alertId}/read`, {
      method: "PUT",
      headers: getAuthHeaders()
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ----------------------------------------------------
// WEATHER CLIENT
// ----------------------------------------------------
export async function fetchLiveEgyptWeather(lat: number, lng: number): Promise<WeatherDay[] | null> {
  try {
    // Attempt cached server proxy first
    const proxyUrl = `/api/weather/current?lat=${lat}&lng=${lng}`;
    const proxyRes = await fetch(proxyUrl);
    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data.daily && data.daily.time && data.daily.time.length > 0) {
        const days: WeatherDay[] = [];
        const currentTemp = Math.round(data.current?.temperature ?? data.daily.temperature_2m_max[0]);
        const currentHumidity = Math.round(data.current?.humidity ?? 45);
        const currentWind = Math.round(data.current?.windSpeed ?? 14);

        for (let i = 0; i < Math.min(5, data.daily.time.length); i++) {
          const dateStr = data.daily.time[i];
          const d = new Date(dateStr);
          const dayName = AR_DAYS[d.getDay()];
          const label = i === 0 ? `${dayName} (اليوم - حي)` : i === 1 ? `${dayName} (غداً)` : dayName;

          const wmoCode = data.daily.weather_code?.[i] ?? 0;
          const interpretation = interpretWmoCode(wmoCode);
          const maxT = Math.round(data.daily.temperature_2m_max?.[i] ?? currentTemp);
          const minT = Math.round(data.daily.temperature_2m_min?.[i] ?? (maxT - 10));
          const rainProb = Math.round(data.daily.precipitation_probability_max?.[i] ?? 0);
          const uv = Math.round(data.daily.uv_index_max?.[i] ?? 8);

          let customAlert = interpretation.alert;
          if (!customAlert && maxT >= 37) {
            customAlert = `موجة شديدة الحرارة (${maxT}°م) - يوصى بالري في ساعات الصباح الباكر أو المساء فقط.`;
          } else if (!customAlert && rainProb >= 50) {
            customAlert = `احتمال هطول أمطار بنسبة ${rainProb}% - يُرجى تعديل جدول الري.`;
          }

          days.push({
            date: label,
            tempMax: i === 0 ? currentTemp : maxT,
            tempMin: minT,
            condition: interpretation.condition,
            icon: interpretation.icon,
            humidity: i === 0 ? currentHumidity : Math.max(30, currentHumidity - i * 3),
            windSpeed: i === 0 ? currentWind : Math.max(10, currentWind + i * 2),
            rainProb,
            uvIndex: uv,
            alert: customAlert
          });
        }
        return days;
      }
    }

    // Direct fallback to Open-Meteo
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max&timezone=Africa%2FCairo`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch from Open-Meteo");
    const data = await res.json();
    if (!data.daily || !data.daily.time || data.daily.time.length === 0) return null;

    const days: WeatherDay[] = [];
    const currentTemp = Math.round(data.current?.temperature_2m ?? data.daily.temperature_2m_max[0]);
    const currentHumidity = Math.round(data.current?.relative_humidity_2m ?? 45);
    const currentWind = Math.round(data.current?.wind_speed_10m ?? 14);

    for (let i = 0; i < Math.min(5, data.daily.time.length); i++) {
      const dateStr = data.daily.time[i];
      const d = new Date(dateStr);
      const dayName = AR_DAYS[d.getDay()];
      const label = i === 0 ? `${dayName} (اليوم - حي)` : i === 1 ? `${dayName} (غداً)` : dayName;

      const wmoCode = data.daily.weather_code[i] ?? 0;
      const interpretation = interpretWmoCode(wmoCode);
      const maxT = Math.round(data.daily.temperature_2m_max[i] ?? currentTemp);
      const minT = Math.round(data.daily.temperature_2m_min[i] ?? (maxT - 10));
      const rainProb = Math.round(data.daily.precipitation_probability_max?.[i] ?? 0);
      const uv = Math.round(data.daily.uv_index_max?.[i] ?? 8);

      let customAlert = interpretation.alert;
      if (!customAlert && maxT >= 37) {
        customAlert = `موجة شديدة الحرارة (${maxT}°م) - يوصى بالري في ساعات الصباح الباكر أو المساء فقط.`;
      } else if (!customAlert && rainProb >= 50) {
        customAlert = `احتمال هطول أمطار بنسبة ${rainProb}% - يُرجى تعديل جدول الري.`;
      }

      days.push({
        date: label,
        tempMax: i === 0 ? currentTemp : maxT,
        tempMin: minT,
        condition: interpretation.condition,
        icon: interpretation.icon,
        humidity: i === 0 ? currentHumidity : Math.max(30, currentHumidity - i * 3),
        windSpeed: i === 0 ? currentWind : Math.max(10, currentWind + i * 2),
        rainProb,
        uvIndex: uv,
        alert: customAlert
      });
    }

    return days;
  } catch (err) {
    console.warn("Live weather fetch failed; using cached baseline.", err);
    return null;
  }
}

export function getCurrentGpsPosition(): Promise<{ lat: number; lng: number; accuracy: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("نظام تحديد المواقع GPS غير مدعوم في متصفحك"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy)
        });
      },
      (err) => {
        let msg = "تعذر تحديد الموقع الجغرافي";
        if (err.code === 1) msg = "تم رفض الإذن بالوصول للموقع. يرجى تفعيل إذن الموقع في المتصفح.";
        else if (err.code === 2) msg = "إشارة الـ GPS غير متوفرة حالياً.";
        else if (err.code === 3) msg = "انتهت مهلة انتظار إشارة الـ GPS.";
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  });
}

export async function sendPhysicalPumpCommand(pumpId: string, state: "ON" | "OFF", durationMinutes: number = 30): Promise<boolean> {
  try {
    const res = await fetch("/api/iot/pump", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pumpId, state, durationMinutes })
    });
    return res.ok;
  } catch (e) {
    console.error("Failed to send pump command", e);
    return false;
  }
}
