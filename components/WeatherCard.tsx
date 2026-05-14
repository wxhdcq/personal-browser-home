"use client";

import {
  AlertTriangle,
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudSun,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Sun,
  Wind,
} from "lucide-react";
import { defaultSettings } from "@/data/settings";
import { storageKeys } from "@/data/storageKeys";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useWeather } from "@/hooks/useWeather";
import { SurfaceCard } from "@/components/SurfaceCard";
import type { UserSettings, WeatherSnapshot } from "@/types/home";

function WeatherIcon({ weather }: { weather?: WeatherSnapshot }) {
  if (!weather) return <Cloud aria-hidden size={28} />;
  if (weather.weatherCode === 0) {
    return weather.isDay ? <Sun aria-hidden size={28} /> : <CloudSun aria-hidden size={28} />;
  }
  if ([1, 2, 3].includes(weather.weatherCode)) return <CloudSun aria-hidden size={28} />;
  if ([45, 48].includes(weather.weatherCode)) return <CloudFog aria-hidden size={28} />;
  if ([61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(weather.weatherCode)) {
    return <CloudRain aria-hidden size={28} />;
  }
  if ([71, 73, 75, 77, 85, 86].includes(weather.weatherCode)) {
    return <CloudSnow aria-hidden size={28} />;
  }
  return <Cloud aria-hidden size={28} />;
}

function temp(value?: number) {
  return value === undefined ? "--°C" : `${Math.round(value)}°C`;
}

function observedAt(value?: string) {
  if (!value) return "待更新";
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function WeatherCard() {
  const [settings] = useLocalStorage<UserSettings>(
    storageKeys.settings,
    defaultSettings,
  );
  const weather = useWeather(settings.weatherLocation);
  const data = weather.data;

  return (
    <SurfaceCard>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {weather.status === "loading" && !data ? (
              <LoaderCircle aria-hidden size={28} className="animate-spin" />
            ) : weather.status === "error" && !data ? (
              <AlertTriangle aria-hidden size={28} />
            ) : (
              <WeatherIcon weather={data} />
            )}
          </span>
          <div>
            <p className="text-2xl font-semibold text-foreground">
              {temp(data?.temperature)}
            </p>
            <p className="text-sm text-muted-foreground">
              {data?.weatherText ?? "加载中"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={weather.refresh}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-background hover:text-primary"
          aria-label="刷新天气"
          title="刷新"
        >
          <RefreshCw
            aria-hidden
            size={16}
            className={weather.status === "loading" ? "animate-spin" : ""}
          />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
        <p>
          体感 <span className="text-foreground">{temp(data?.apparentTemperature)}</span>
        </p>
        <p>
          湿度 <span className="text-foreground">{data?.humidity ?? "--"}%</span>
        </p>
        <p className="inline-flex items-center gap-1">
          <Wind aria-hidden size={15} />
          <span>{data ? `${Math.round(data.windSpeed)} km/h` : "--"}</span>
        </p>
        <p>
          空气{" "}
          <span className="text-foreground">
            {data?.airQualityText ?? "--"}
            {data?.airQualityIndex !== undefined ? ` ${data.airQualityIndex}` : ""}
          </span>
        </p>
      </div>

      <div className="mt-4 space-y-1 text-right text-xs text-muted-foreground">
        <p className="flex items-center justify-end gap-1 text-primary">
          <MapPin aria-hidden size={15} />
          {data?.locationLabel ?? settings.weatherLocation}
        </p>
        <p>
          {weather.status === "error" ? (
            weather.error
          ) : (
            <>
              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary"
              >
                Open-Meteo
              </a>{" "}
              · {observedAt(data?.observedAt)} 更新
            </>
          )}
        </p>
      </div>
    </SurfaceCard>
  );
}
