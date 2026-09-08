/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AgriNova Deterministic Agronomic & Irrigation Decision Engine
 * Based on FAO-56 Penman-Monteith & Crop Coefficient (Kc) Standards
 * Adapted for Egyptian Agricultural Zones (Delta, Valley, Toshka, Reclaimed Desert)
 */

export interface IrrigationInput {
  farmAreaFeddans: number;
  cropType: string;
  growthStage: "initial" | "development" | "mid" | "late";
  soilType: "clay" | "sandy" | "loamy" | "calcareous";
  irrigationMethod: "drip" | "sprinkler" | "flood";
  currentSoilMoisturePct?: number; // from IoT sensor or manual
  ambientTempC: number;
  humidityPct: number;
  windSpeedKmh: number;
  rainForecastMm?: number;
  solarRadiationEstimated?: number;
}

export interface IrrigationDecision {
  irrigationNeeded: boolean;
  urgency: "none" | "low" | "medium" | "high" | "critical";
  et0MmDay: number; // Reference Evapotranspiration
  kc: number; // Crop Coefficient
  etcMmDay: number; // Crop Evapotranspiration
  rawMm: number; // Readily Available Water in root zone
  currentDepletionPct: number;
  recommendedTiming: string;
  recommendedTimingAr: string;
  grossWaterDepthMm: number;
  grossWaterVolumeM3: number; // For entire farm area
  grossWaterVolumeLiters: number;
  durationMinutesEstimate: number;
  confidencePct: number;
  deterministicReasoningAr: string;
  agronomicFactors: {
    cropNameAr: string;
    soilNameAr: string;
    methodNameAr: string;
    efficiencyPct: number;
    rootDepthM: number;
    fieldCapacityPct: number;
    wiltingPointPct: number;
  };
}

// FAO-56 Crop Coefficients for Egyptian Crops
const CROP_COEFFICIENTS: Record<string, { initial: number; development: number; mid: number; late: number; rootDepthMax: number; nameAr: string }> = {
  wheat: { initial: 0.35, development: 0.75, mid: 1.15, late: 0.40, rootDepthMax: 0.9, nameAr: "القمح" },
  tomato: { initial: 0.60, development: 0.85, mid: 1.15, late: 0.80, rootDepthMax: 0.7, nameAr: "الطماطم" },
  potato: { initial: 0.50, development: 0.75, mid: 1.15, late: 0.75, rootDepthMax: 0.6, nameAr: "البطاطس" },
  cotton: { initial: 0.35, development: 0.75, mid: 1.20, late: 0.60, rootDepthMax: 1.1, nameAr: "القطن" },
  corn: { initial: 0.30, development: 0.70, mid: 1.20, late: 0.50, rootDepthMax: 1.0, nameAr: "الذرة الشامية" },
  citrus: { initial: 0.70, development: 0.65, mid: 0.70, late: 0.70, rootDepthMax: 1.2, nameAr: "الموالح / البرتقال" },
  onion: { initial: 0.50, development: 0.75, mid: 1.05, late: 0.75, rootDepthMax: 0.4, nameAr: "البصل" },
  clover: { initial: 0.40, development: 0.85, mid: 1.10, late: 1.00, rootDepthMax: 0.8, nameAr: "البرسيم" },
  general: { initial: 0.45, development: 0.75, mid: 1.05, late: 0.70, rootDepthMax: 0.7, nameAr: "محصول عام" }
};

// Soil Physical Properties in Egypt
const SOIL_PROPERTIES: Record<string, { fcPct: number; pwpPct: number; awMmPerM: number; pDepletion: number; nameAr: string }> = {
  clay: { fcPct: 38, pwpPct: 18, awMmPerM: 200, pDepletion: 0.50, nameAr: "تربة طينية (وادي النيل والدلتا)" },
  sandy: { fcPct: 14, pwpPct: 5, awMmPerM: 90, pDepletion: 0.60, nameAr: "تربة رملية صحراوية (الأراضي المستصلحة وتوشكى)" },
  loamy: { fcPct: 28, pwpPct: 12, awMmPerM: 160, pDepletion: 0.55, nameAr: "تربة طميية / صفراء" },
  calcareous: { fcPct: 24, pwpPct: 11, awMmPerM: 130, pDepletion: 0.50, nameAr: "تربة جيرية (الساحل الشمالي ومريوط)" }
};

// Irrigation Method Efficiencies
const METHOD_PROPERTIES: Record<string, { efficiency: number; flowRateM3PerHourPerFeddan: number; nameAr: string }> = {
  drip: { efficiency: 0.90, flowRateM3PerHourPerFeddan: 18, nameAr: "الري بالتنقيط الحديث (كفاءة 90%)" },
  sprinkler: { efficiency: 0.75, flowRateM3PerHourPerFeddan: 25, nameAr: "الري بالرش المحوري / الثابت (كفاءة 75%)" },
  flood: { efficiency: 0.55, flowRateM3PerHourPerFeddan: 45, nameAr: "الري السطحي / الغمر التقليدي (كفاءة 55%)" }
};

/**
 * Deterministic calculation of FAO-56 Reference Evapotranspiration (ET0)
 * Uses Hargreaves-Samani / Penman-Monteith approximation
 */
export function calculateET0(tempC: number, humidityPct: number, windSpeedKmh: number): number {
  // Radiation index estimate based on typical Egyptian latitude (~30°N)
  const meanTemp = Math.max(5, tempC);
  const tempRange = Math.max(8, 14 - (humidityPct / 100) * 6);
  // Hargreaves equation factor: 0.0023 * (T + 17.8) * sqrt(TR) * Ra
  const raApprox = 15.2; // Extraterrestrial solar radiation MJ/m2/day for Egypt latitude
  const et0Hargreaves = 0.0023 * (meanTemp + 17.8) * Math.sqrt(tempRange) * (raApprox * 0.408);
  
  // Wind factor correction: high desert winds increase ET0
  const windFactor = 1.0 + (Math.max(0, windSpeedKmh - 10) * 0.015);
  // Humidity factor correction: low relative humidity in desert increases ET0
  const humidityFactor = 1.0 + Math.max(0, (50 - humidityPct) * 0.008);

  const finalET0 = et0Hargreaves * windFactor * humidityFactor;
  return Number(Math.max(2.5, Math.min(10.5, finalET0)).toFixed(2));
}

/**
 * Execute the full deterministic agricultural irrigation decision
 */
export function runIrrigationDecisionEngine(input: IrrigationInput): IrrigationDecision {
  const cropKey = Object.keys(CROP_COEFFICIENTS).find(k => 
    input.cropType.toLowerCase().includes(k) || 
    (k === "wheat" && input.cropType.includes("قمح")) ||
    (k === "tomato" && input.cropType.includes("طماطم")) ||
    (k === "potato" && input.cropType.includes("بطاطس")) ||
    (k === "cotton" && input.cropType.includes("قطن")) ||
    (k === "corn" && (input.cropType.includes("ذرة") || input.cropType.includes("ذره"))) ||
    (k === "citrus" && (input.cropType.includes("موالح") || input.cropType.includes("برتقال") || input.cropType.includes("ليمون"))) ||
    (k === "onion" && input.cropType.includes("بصل")) ||
    (k === "clover" && input.cropType.includes("برسيم"))
  ) || "general";

  const crop = CROP_COEFFICIENTS[cropKey];
  const soil = SOIL_PROPERTIES[input.soilType] || SOIL_PROPERTIES.clay;
  const method = METHOD_PROPERTIES[input.irrigationMethod] || METHOD_PROPERTIES.drip;

  // 1. Determine Kc & Root Depth according to growth stage
  let kc = crop.mid;
  let rootDepth = crop.rootDepthMax;
  if (input.growthStage === "initial") {
    kc = crop.initial;
    rootDepth = Math.max(0.20, crop.rootDepthMax * 0.35);
  } else if (input.growthStage === "development") {
    kc = crop.development;
    rootDepth = Math.max(0.35, crop.rootDepthMax * 0.65);
  } else if (input.growthStage === "late") {
    kc = crop.late;
    rootDepth = crop.rootDepthMax * 0.90;
  }

  // 2. Reference ET0 & Crop Evapotranspiration ETc
  const et0 = calculateET0(input.ambientTempC, input.humidityPct, input.windSpeedKmh);
  const etc = Number((et0 * kc).toFixed(2)); // mm/day

  // 3. Soil Water Budget: Total Available Water (TAW) & Readily Available Water (RAW)
  const tawMm = soil.awMmPerM * rootDepth;
  const rawMm = Number((tawMm * soil.pDepletion).toFixed(1));

  // 4. Moisture Depletion Evaluation
  const currentMoisture = input.currentSoilMoisturePct !== undefined ? input.currentSoilMoisturePct : (soil.fcPct * 0.75);
  // Normalizing current moisture between PWP and FC
  const moistureRange = Math.max(1, soil.fcPct - soil.pwpPct);
  const availableFraction = Math.max(0, Math.min(1, (currentMoisture - soil.pwpPct) / moistureRange));
  const depletionPct = Math.round((1 - availableFraction) * 100);

  // Critical threshold: if depletion exceeds pDepletion (or moisture is below threshold)
  const criticalThresholdPct = Math.round(soil.pDepletion * 100);
  const rainForecast = input.rainForecastMm || 0;

  // 5. Decision: Is irrigation needed?
  let irrigationNeeded = false;
  let urgency: "none" | "low" | "medium" | "high" | "critical" = "none";

  if (rainForecast >= etc * 1.5) {
    // Rain forecasted exceeds crop requirement
    irrigationNeeded = false;
    urgency = "none";
  } else if (depletionPct >= 85 || currentMoisture <= soil.pwpPct + 2) {
    irrigationNeeded = true;
    urgency = "critical";
  } else if (depletionPct >= criticalThresholdPct) {
    irrigationNeeded = true;
    urgency = depletionPct >= 70 ? "high" : "medium";
  } else if (depletionPct >= criticalThresholdPct - 15) {
    irrigationNeeded = false;
    urgency = "low";
  } else {
    irrigationNeeded = false;
    urgency = "none";
  }

  // 6. Net and Gross Irrigation Requirement
  // Net requirement brings soil back to Field Capacity
  let netDepthMm = 0;
  if (irrigationNeeded) {
    netDepthMm = Math.max(etc, (1 - availableFraction) * tawMm - rainForecast);
    netDepthMm = Math.min(netDepthMm, tawMm); // Cap to not cause waterlogging
  } else {
    netDepthMm = 0;
  }

  const grossDepthMm = Number((netDepthMm / method.efficiency).toFixed(1));

  // 1 Feddan = 4,200.83 m²
  // 1 mm depth over 1 Feddan = 4.2 m³ of water
  const feddanAreaM2 = 4200.83;
  const feddans = Math.max(0.1, input.farmAreaFeddans);
  const grossVolumeM3 = irrigationNeeded 
    ? Math.round((grossDepthMm / 1000) * feddanAreaM2 * feddans)
    : 0;
  const grossVolumeLiters = grossVolumeM3 * 1000;

  // Duration in minutes based on irrigation delivery rate
  const durationHours = irrigationNeeded 
    ? (grossVolumeM3 / (method.flowRateM3PerHourPerFeddan * feddans))
    : 0;
  const durationMinutes = Math.round(durationHours * 60);

  // 7. Optimal timing in Egyptian climate
  let recommendedTiming = "none";
  let recommendedTimingAr = "لا حاجة للري في الوقت الحالي";

  if (irrigationNeeded) {
    if (input.ambientTempC >= 34) {
      recommendedTiming = "early_morning_or_late_evening";
      recommendedTimingAr = "الصباح الباكر (5:30 إلى 7:30 ص) أو المساء بعد انكسار الحرارة (6:30 إلى 8:30 م) لتفادي التبخر وتلف الجذور.";
    } else if (input.windSpeedKmh >= 25 && input.irrigationMethod === "sprinkler") {
      recommendedTiming = "wind_subsides";
      recommendedTimingAr = "يرجى تأجيل الري حتى هدوء سرعة الرياح لتفادي تشتت مياه الرش المحوري وعدم انتظام التوزيع.";
    } else {
      recommendedTiming = "morning";
      recommendedTimingAr = "ساعات الصباح الباكر (6:00 إلى 8:00 ص) لتحقيق أعلى امتصاص للمياه والمغذيات.";
    }
  }

  // Confidence calculation
  const hasLiveSensor = input.currentSoilMoisturePct !== undefined;
  const confidencePct = hasLiveSensor ? 95 : 82;

  // Build deterministic reasoning
  let reasoningAr = "";
  if (rainForecast > 5) {
    reasoningAr = `يُتوقع هطول أمطار بمعدل ${rainForecast} ملم، وهي تغطي الاحتياج المائي للمحصول (${etc} ملم/يوم). يُوصى بتأجيل الري حفاظاً على الموارد المائية ومنع تعفن الجذور.`;
  } else if (!irrigationNeeded) {
    reasoningAr = `الرطوبة الحالية في منطقة الجذور (${currentMoisture}%) أعلى من حد الاستنزاف الحرج (${criticalThresholdPct}%). المخزون المائي في التربة (${soil.nameAr}) يكفي لاستهلاك النبات لمدة تقدر بـ ${Math.max(1, Math.round(rawMm / etc))} أيام قادمة.`;
  } else {
    reasoningAr = `وصل استنزاف الماء المتاح إلى ${depletionPct}% متجاوزاً الحد الحرج (${criticalThresholdPct}%) لمحصول ${crop.nameAr} في مرحلة ${input.growthStage}. معدل البخر-نتح اليومي (${etc} ملم/يوم) يتطلب تعويضاً مقداره ${grossVolumeM3} متر مكعب بمعدل كفاءة ${Math.round(method.efficiency * 100)}% لنظام ${method.nameAr}.`;
  }

  return {
    irrigationNeeded,
    urgency,
    et0MmDay: et0,
    kc,
    etcMmDay: etc,
    rawMm,
    currentDepletionPct: depletionPct,
    recommendedTiming,
    recommendedTimingAr,
    grossWaterDepthMm: grossDepthMm,
    grossWaterVolumeM3: grossVolumeM3,
    grossWaterVolumeLiters: grossVolumeLiters,
    durationMinutesEstimate: durationMinutes,
    confidencePct,
    deterministicReasoningAr: reasoningAr,
    agronomicFactors: {
      cropNameAr: crop.nameAr,
      soilNameAr: soil.nameAr,
      methodNameAr: method.nameAr,
      efficiencyPct: Math.round(method.efficiency * 100),
      rootDepthM: Number(rootDepth.toFixed(2)),
      fieldCapacityPct: soil.fcPct,
      wiltingPointPct: soil.pwpPct
    }
  };
}
