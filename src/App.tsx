import { BMChart } from "./components/Chart/Chart";
import { Moire } from "./components/Moire/Moire";
import { Controls } from "./components/Controls/Controls";
import { Header } from "./components/Header/Header";
import "./App.css";
import { useAppDispatch, useAppSelector } from "./lib/hooks";
import {
  selectBiaxialStrain,
  selectTwistAngle,
  selectUniaxialStrain,
  selectUniaxialStrainAngle,
} from "./app/slices/moireSlice";
import { useEffect, useRef, useState } from "react";
import type { BandDataPoint } from "./lib/types";
import { setBandStructure } from "./app/slices/bandstructureSlice";
import { Analytics } from "@vercel/analytics/react";

// Cache utilities
const CACHE_KEY_PREFIX =
  import.meta.env.VITE_CACHE_KEY_PREFIX || "bandstructure_cache_";
const CACHE_EXPIRY_MS =
  import.meta.env.VITE_CACHE_EXPIRY_H * 1000 * 60 * 60 || 1000 * 60 * 60 * 24; // Default to 24 hours

interface CacheEntry {
  data: BandDataPoint[];
  timestamp: number;
}

const getCacheKey = (
  twistAngle: number,
  biaxialStrain: number,
  uniaxialStrain: number,
  uniaxialStrainAngle: number
): string => {
  return `${CACHE_KEY_PREFIX}${twistAngle}_${biaxialStrain}_${uniaxialStrain}_${uniaxialStrainAngle}`;
};

const getCachedData = (cacheKey: string): BandDataPoint[] | null => {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired
    if (now - entry.timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.warn("Failed to read from cache:", error);
    return null;
  }
};

const setCachedData = (cacheKey: string, data: BandDataPoint[]): void => {
  try {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.warn("Failed to write to cache:", error);
    // If localStorage is full, try to clear old entries
    if (error instanceof Error && error.name === "QuotaExceededError") {
      clearOldCacheEntries();
      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ data, timestamp: Date.now() })
        );
      } catch {
        console.warn("Failed to write to cache even after cleanup");
      }
    }
  }
};

const clearOldCacheEntries = (): void => {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_KEY_PREFIX));
    const now = Date.now();

    cacheKeys.forEach((key) => {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const entry: CacheEntry = JSON.parse(cached);
          if (now - entry.timestamp > CACHE_EXPIRY_MS) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // Remove corrupted cache entries
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn("Failed to clear old cache entries:", error);
  }
};

const fetchData = async (
  twistAngle: number,
  biaxialStrain: number,
  uniaxialStrain: number,
  uniaxialStrainAngle: number,
  signal?: AbortSignal
): Promise<BandDataPoint[]> => {
  // Check cache first
  const cacheKey = getCacheKey(
    twistAngle,
    biaxialStrain,
    uniaxialStrain,
    uniaxialStrainAngle
  );
  const cachedData = getCachedData(cacheKey);

  if (cachedData) {
    console.log("Using cached data for:", cacheKey);
    return cachedData;
  }

  console.log("Fetching fresh data for:", cacheKey);

  const params = new URLSearchParams({
    twist_angle: twistAngle.toString(),
    biaxial_strain: (biaxialStrain / 100).toString(),
    uniaxial_strain: (uniaxialStrain / 100).toString(),
    uniaxial_strain_angle: uniaxialStrainAngle.toString(),
  });

  const maxRetries = 3;
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (signal?.aborted) {
        throw new Error("AbortError");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: signal,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const bandstructure: BandDataPoint[] = [];
      for (let i = 0; i < data["eigenvalues"].length; i++) {
        bandstructure.push({
          x: i,
          B1: Math.round(data["eigenvalues"][i][0] * 100) / 100,
          B2: Math.round(data["eigenvalues"][i][1] * 100) / 100,
          B3: Math.round(data["eigenvalues"][i][2] * 100) / 100,
          B4: Math.round(data["eigenvalues"][i][3] * 100) / 100,
          B5: Math.round(data["eigenvalues"][i][4] * 100) / 100,
          B6: Math.round(data["eigenvalues"][i][5] * 100) / 100,
        });
      }

      // Cache the successful result
      setCachedData(cacheKey, bandstructure);

      return bandstructure;
    } catch (error) {
      lastError = error as Error;

      if (lastError.name === "AbortError" || signal?.aborted) {
        throw lastError;
      }

      if (lastError.message.includes("status: 4")) {
        throw lastError;
      }

      if (attempt === maxRetries) {
        throw lastError;
      }

      const delay = Math.min(800 * Math.pow(2, attempt), 2000);
      await new Promise((resolve) => setTimeout(resolve, delay));

      console.log(
        `Retrying request (attempt ${attempt + 2}/${
          maxRetries + 1
        }) in ${delay}ms...`
      );
    }
  }

  throw lastError!;
};

function App() {
  const dispatch = useAppDispatch();

  const twistAngle = useAppSelector(selectTwistAngle);
  const biaxialStrain = useAppSelector(selectBiaxialStrain);
  const uniaxialStrain = useAppSelector(selectUniaxialStrain);
  const uniaxialStrainAngle = useAppSelector(selectUniaxialStrainAngle);

  const abortControllerRef = useRef<AbortController | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSliderDragging, setIsSliderDragging] = useState(false);

  // Effect to fetch band structure data when parameters change
  useEffect(() => {
    if (
      twistAngle == undefined ||
      biaxialStrain == undefined ||
      uniaxialStrain == undefined ||
      uniaxialStrainAngle == undefined ||
      isSliderDragging
    ) {
      return;
    }

    setIsLoading(true);
    setIsError(false);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    fetchData(
      twistAngle,
      biaxialStrain,
      uniaxialStrain,
      uniaxialStrainAngle,
      abortControllerRef.current.signal
    )
      .then((bandstructure) => {
        if (!abortController.signal.aborted) {
          dispatch(setBandStructure(bandstructure));
          setIsLoading(false);
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Error fetching band structure data:", error);
          setIsLoading(false);
          setIsError(true);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [
    twistAngle,
    biaxialStrain,
    uniaxialStrain,
    uniaxialStrainAngle,
    isSliderDragging,
  ]);

  return (
    <div className="min-h-screen">
      <Analytics />
      <Header />
      <div className="flex items-center justify-center p-4">
        <div className="container md:max-w-[50%]">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-center">
            <div className="md:w-1/2 w-full">
              <Moire />
            </div>
            <div className="w-full mx-auto py-3 md:hidden">
              <Controls onSliderDraggingChange={setIsSliderDragging} />
            </div>
            <div className="md:w-1/2 w-full">
              <BMChart loading={isLoading} error={isError} />
            </div>
          </div>
          <div className="w-full mx-auto py-3 hidden md:block">
            <Controls onSliderDraggingChange={setIsSliderDragging} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
