"use client";

import { useEffect, useMemo, useState } from "react";
import { storageKeys } from "@/data/storageKeys";
import type { WeatherSnapshot } from "@/types/home";

const cacheTtlMs = 15 * 60 * 1000;

type WeatherState =
  | { status: "loading"; data?: WeatherSnapshot; error?: undefined }
  | { status: "success"; data: WeatherSnapshot; error?: undefined }
  | { status: "error"; data?: WeatherSnapshot; error: string };

interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

const fallbackLocation: GeocodingResult = {
  name: "浦东新区",
  latitude: 31.23995,
  longitude: 121.50094,
  country: "中国",
  admin1: "上海市",
};

interface ForecastResponse {
  current?: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    is_day: number;
  };
}

interface AirQualityResponse {
  current?: {
    us_aqi?: number;
    pm2_5?: number;
  };
}

function cacheKey(location: string) {
  return `${storageKeys.weatherCache}:${location.trim().toLowerCase()}`;
}

function readCachedWeather(location: string) {
  if (typeof window === "undefined") return undefined;

  try {
    const cached = JSON.parse(
      window.localStorage.getItem(cacheKey(location)) ?? "null",
    ) as WeatherSnapshot | null;

    if (!cached) return undefined;
    if (Date.now() - new Date(cached.fetchedAt).getTime() > cacheTtlMs) {
      return undefined;
    }

    return cached;
  } catch {
    return undefined;
  }
}

function writeCachedWeather(location: string, data: WeatherSnapshot) {
  try {
    window.localStorage.setItem(cacheKey(location), JSON.stringify(data));
  } catch {
    // Weather should still render if cache persistence is blocked.
  }
}

function normalizeLocationCandidates(location: string) {
  const trimmed =
    location.trim() || `${fallbackLocation.admin1} ${fallbackLocation.name}`;
  const parts = trimmed
    .split(/[\s,，]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const lastPart = parts.at(-1);

  return Array.from(
    new Set([
      ...(lastPart ? [lastPart] : []),
      trimmed,
      trimmed.replace(/[市区县省]/g, ""),
      ...(lastPart ? [lastPart.replace(/[市区县省]/g, "")] : []),
      "上海",
    ]),
  ).filter((item) => item.length >= 2);
}

function getLocationLabel(result: GeocodingResult) {
  return [result.admin1, result.name].filter(Boolean).join(" ") || result.name;
}

async function geocodeLocation(location: string) {
  const candidates = normalizeLocationCandidates(location);

  for (const candidate of candidates) {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", candidate);
    url.searchParams.set("count", "5");
    url.searchParams.set("language", "zh");
    url.searchParams.set("format", "json");

    const response = await fetch(url);
    if (!response.ok) continue;

    const data = (await response.json()) as { results?: GeocodingResult[] };
    const result =
      data.results?.find((item) => item.country === "中国") ?? data.results?.[0];

    if (result) return result;
  }

  return fallbackLocation;
}

function weatherText(code: number) {
  if (code === 0) return "晴";
  if ([1, 2].includes(code)) return "少云";
  if (code === 3) return "多云";
  if ([45, 48].includes(code)) return "雾";
  if ([51, 53, 55, 56, 57].includes(code)) return "毛毛雨";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "降雨";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "降雪";
  if ([95, 96, 99].includes(code)) return "雷暴";
  return "未知";
}

function airQualityText(aqi?: number) {
  if (aqi === undefined) return undefined;
  if (aqi <= 50) return "优";
  if (aqi <= 100) return "良";
  if (aqi <= 150) return "轻度污染";
  if (aqi <= 200) return "中度污染";
  if (aqi <= 300) return "重度污染";
  return "严重污染";
}

async function loadWeather(location: string): Promise<WeatherSnapshot> {
  const geo = await geocodeLocation(location);
  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
  forecastUrl.searchParams.set("latitude", String(geo.latitude));
  forecastUrl.searchParams.set("longitude", String(geo.longitude));
  forecastUrl.searchParams.set(
    "current",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "weather_code",
      "wind_speed_10m",
      "is_day",
    ].join(","),
  );
  forecastUrl.searchParams.set("timezone", "auto");
  forecastUrl.searchParams.set("forecast_days", "1");

  const airUrl = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  airUrl.searchParams.set("latitude", String(geo.latitude));
  airUrl.searchParams.set("longitude", String(geo.longitude));
  airUrl.searchParams.set("current", "pm2_5,us_aqi");
  airUrl.searchParams.set("timezone", "auto");
  airUrl.searchParams.set("forecast_days", "1");

  const [forecastResponse, airResponse] = await Promise.all([
    fetch(forecastUrl),
    fetch(airUrl),
  ]);

  if (!forecastResponse.ok) {
    throw new Error("天气服务暂时不可用");
  }

  const forecast = (await forecastResponse.json()) as ForecastResponse;
  const air = airResponse.ok
    ? ((await airResponse.json()) as AirQualityResponse)
    : undefined;

  if (!forecast.current) {
    throw new Error("没有获取到当前天气");
  }

  const aqi = air?.current?.us_aqi;
  const code = forecast.current.weather_code;

  return {
    locationLabel: getLocationLabel(geo),
    temperature: forecast.current.temperature_2m,
    apparentTemperature: forecast.current.apparent_temperature,
    humidity: forecast.current.relative_humidity_2m,
    windSpeed: forecast.current.wind_speed_10m,
    weatherCode: code,
    weatherText: weatherText(code),
    isDay: forecast.current.is_day === 1,
    airQualityIndex: aqi,
    airQualityText: airQualityText(aqi),
    pm25: air?.current?.pm2_5,
    observedAt: forecast.current.time,
    fetchedAt: new Date().toISOString(),
    source: "Open-Meteo",
  };
}

export function useWeather(location: string) {
  const normalizedLocation = useMemo(
    () => location.trim() || `${fallbackLocation.admin1} ${fallbackLocation.name}`,
    [location],
  );
  const [state, setState] = useState<WeatherState>({ status: "loading" });
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const pendingTimers: number[] = [];
    const commitState = (nextState: WeatherState) => {
      const timer = window.setTimeout(() => {
        if (!cancelled) {
          setState(nextState);
        }
      }, 0);
      pendingTimers.push(timer);
    };
    const cleanup = () => {
      cancelled = true;
      pendingTimers.forEach((timer) => window.clearTimeout(timer));
    };
    const cached = readCachedWeather(normalizedLocation);

    if (cached) {
      commitState({ status: "success", data: cached });
      return cleanup;
    }

    commitState({ status: "loading" });

    void loadWeather(normalizedLocation)
      .then((data) => {
        if (cancelled) return;
        writeCachedWeather(normalizedLocation, data);
        setState({ status: "success", data });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          data: readCachedWeather(normalizedLocation),
          error: error instanceof Error ? error.message : "天气加载失败",
        });
      });

    return cleanup;
  }, [normalizedLocation, refreshIndex]);

  return {
    ...state,
    refresh: () => {
      try {
        window.localStorage.removeItem(cacheKey(normalizedLocation));
      } catch {
        // Ignore cache cleanup failure.
      }
      setRefreshIndex((current) => current + 1);
    },
  };
}
