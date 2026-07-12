import React, { useState, useEffect } from "react";
import { 
  CloudSun, Sun, Cloud, CloudRain, Thermometer, Wind, 
  Droplets, X, Settings, Layout, Compass, ShieldAlert
} from "lucide-react";
import axios from "axios";

const WeatherPredictionWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [spots, setSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  // Widget Options (3-4 options)
  const [options, setOptions] = useState({
    forecastType: "current", // "current", "details", "forecast"
    tempUnit: "C", // "C", "F"
    theme: "aurora", // "aurora", "light", "neon"
  });

  // Fetch spots on mount
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/public/spots")
      .then((res) => {
        const sortedSpots = res.data.sort((a, b) => a.name.localeCompare(b.name));
        setSpots(sortedSpots);
        if (sortedSpots.length > 0) {
          setSelectedSpot(sortedSpots[0]);
        }
      })
      .catch((err) => {
        console.error("Failed to load spots from database, falling back", err);
        const fallback = [
          { name: "Gateway of India", city: { name: "Mumbai" } },
          { name: "Marine Drive", city: { name: "Mumbai" } },
          { name: "Ajanta Caves", city: { name: "Aurangabad" } },
          { name: "Ellora Caves", city: { name: "Aurangabad" } },
          { name: "Mahabaleshwar", city: { name: "Satara" } },
          { name: "Lonavala", city: { name: "Pune" } }
        ];
        setSpots(fallback);
        setSelectedSpot(fallback[0]);
      });
  }, []);

  // Fetch weather data when selectedSpot changes
  useEffect(() => {
    if (!selectedSpot) return;
    const cityName = selectedSpot.city?.name || "Mumbai";
    fetchWeather(cityName);
  }, [selectedSpot]);

  const fetchWeather = async (city) => {
    setLoading(true);
    setError(null);
    try {
      // Map known local naming to standard search terms for weather stability
      let queryCity = city;
      if (city.toLowerCase().includes("sambhaji")) {
        queryCity = "Aurangabad";
      }
      
      const response = await axios.get(`http://localhost:8080/api/weather/${queryCity}`);
      setWeatherData(response.data);
    } catch (err) {
      console.error("Failed to fetch weather data", err);
      setError("Could not load weather details. Please try again.");
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSpotChange = (e) => {
    const spot = spots.find(s => s.name === e.target.value);
    if (spot) {
      setSelectedSpot(spot);
    }
  };

  const handleOptionChange = (e) => {
    setOptions({
      ...options,
      [e.target.name]: e.target.value
    });
  };

  // Convert temperature metric to Fahrenheit if needed
  const formatTemp = (celsius) => {
    if (options.tempUnit === "F") {
      const fahrenheit = (celsius * 9) / 5 + 32;
      return `${Math.round(fahrenheit)}°F`;
    }
    return `${Math.round(celsius)}°C`;
  };

  // Helper for weather icons based on API status
  const getWeatherIcon = (main) => {
    if (!main) return <CloudSun className="w-12 h-12 text-amber-500" />;
    switch (main.toLowerCase()) {
      case "clear":
        return <Sun className="w-12 h-12 text-amber-500 animate-spin-slow" />;
      case "rain":
      case "drizzle":
      case "thunderstorm":
        return <CloudRain className="w-12 h-12 text-sky-500" />;
      case "clouds":
      default:
        return <Cloud className="w-12 h-12 text-blue-400" />;
    }
  };

  // Get color configuration based on theme selection
  const getThemeStyles = () => {
    switch (options.theme) {
      case "light":
        return {
          cardBg: "bg-white/95",
          border: "border-gray-200",
          textHeader: "from-sky-500 to-indigo-600",
          textPrimary: "text-gray-800",
          textSecondary: "text-gray-500",
          itemBg: "bg-slate-50 border-slate-100",
        };
      case "neon":
        return {
          cardBg: "bg-slate-950/95 border-emerald-500/30",
          border: "border-emerald-500/20",
          textHeader: "from-emerald-500 to-teal-700",
          textPrimary: "text-emerald-50 text-emerald-50",
          textSecondary: "text-emerald-400/80",
          itemBg: "bg-emerald-950/30 border-emerald-900/30",
        };
      case "aurora":
      default:
        return {
          cardBg: "bg-slate-900/90 backdrop-blur-md",
          border: "border-indigo-500/20",
          textHeader: "from-indigo-500 via-purple-500 to-pink-500",
          textPrimary: "text-white",
          textSecondary: "text-indigo-200/70",
          itemBg: "bg-indigo-950/30 border-indigo-900/20",
        };
    }
  };

  const themeStyles = getThemeStyles();

  // Helper to generate simulated 3-day forecast details
  const getSimulatedForecast = (baseTemp, mainCondition) => {
    const days = [];
    const dateOptions = { weekday: "short" };
    for (let i = 1; i <= 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dayName = date.toLocaleDateString("en-US", dateOptions);
      
      // Add slight variations
      const tempVar = i === 1 ? 1.2 : i === 2 ? -1.8 : 0.5;
      const simulatedTemp = baseTemp + tempVar;
      
      days.push({
        day: dayName,
        temp: formatTemp(simulatedTemp),
        condition: mainCondition || "Clouds"
      });
    }
    return days;
  };

  return (
    <>
      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className="
          fixed
          bottom-40
          right-6
          z-[999]
          bg-gradient-to-tr from-sky-400 to-indigo-500
          hover:from-sky-500 hover:to-indigo-600
          text-white
          p-4
          rounded-full
          shadow-[0_10px_30px_rgba(56,189,248,0.3)]
          transition-all
          duration-300
          hover:scale-110
          flex
          items-center
          justify-center
        "
        title="Live Weather Widget"
      >
        <CloudSun className="w-6 h-6 animate-pulse" />
      </button>

      {/* POPUP CARD */}
      {isOpen && (
        <div
          className={`
            fixed
            bottom-24
            right-6
            w-[390px]
            max-h-[85vh]
            overflow-y-auto
            rounded-[2.5rem]
            shadow-[0_25px_60px_rgba(0,0,0,0.25)]
            border
            z-[999]
            transition-all
            duration-300
            scale-100
            animate-in fade-in zoom-in-95 duration-200
            ${themeStyles.cardBg}
            ${themeStyles.border}
          `}
        >
          {/* HEADER */}
          <div
            className={`
              bg-gradient-to-r
              ${themeStyles.textHeader}
              text-white
              px-6
              py-5
              flex
              items-center
              justify-between
              rounded-t-[2.5rem]
            `}
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <CloudSun className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">
                  Spot Weather
                </h2>
                <p className="text-[10px] opacity-80 uppercase tracking-wider font-semibold">
                  Live Forecasting Assistant
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-white/15 hover:bg-white/25 p-1.5 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* OPTION 1: SELECT SPOT */}
            <div>
              <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1.5 ${themeStyles.textSecondary}`}>
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                Select Tourist Spot
              </label>
              <select
                value={selectedSpot?.name || ""}
                onChange={handleSpotChange}
                className="
                  w-full
                  p-3
                  bg-black/10
                  border border-gray-400/20
                  rounded-2xl
                  text-sm
                  font-medium
                  focus:outline-none
                  focus:ring-2
                  focus:ring-sky-400
                  transition-all
                  text-inherit
                  dark:bg-slate-800
                "
              >
                {spots.map((spot, idx) => (
                  <option key={idx} value={spot.name} className="text-gray-800">
                    {spot.name} ({spot.city?.name || "Unknown"})
                  </option>
                ))}
              </select>
            </div>

            {/* OPTIONS GRID (Options 2, 3, 4) */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* OPTION 2: FORECAST TYPE */}
              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mb-1 ${themeStyles.textSecondary}`}>
                  <Settings className="w-3 h-3 text-sky-400" />
                  Details
                </label>
                <select
                  name="forecastType"
                  value={options.forecastType}
                  onChange={handleOptionChange}
                  className="
                    w-full
                    p-2
                    bg-black/10
                    border border-gray-400/20
                    rounded-xl
                    text-xs
                    font-medium
                    focus:outline-none
                    text-inherit
                    dark:bg-slate-800
                  "
                >
                  <option value="current" className="text-gray-800">Simple</option>
                  <option value="details" className="text-gray-800">Detailed</option>
                  <option value="forecast" className="text-gray-800">3-Day</option>
                </select>
              </div>

              {/* OPTION 3: TEMP UNIT */}
              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mb-1 ${themeStyles.textSecondary}`}>
                  <Thermometer className="w-3 h-3 text-sky-400" />
                  Unit
                </label>
                <select
                  name="tempUnit"
                  value={options.tempUnit}
                  onChange={handleOptionChange}
                  className="
                    w-full
                    p-2
                    bg-black/10
                    border border-gray-400/20
                    rounded-xl
                    text-xs
                    font-medium
                    focus:outline-none
                    text-inherit
                    dark:bg-slate-800
                  "
                >
                  <option value="C" className="text-gray-800">°C</option>
                  <option value="F" className="text-gray-800">°F</option>
                </select>
              </div>

              {/* OPTION 4: THEME SELECT */}
              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 mb-1 ${themeStyles.textSecondary}`}>
                  <Layout className="w-3 h-3 text-sky-400" />
                  Theme
                </label>
                <select
                  name="theme"
                  value={options.theme}
                  onChange={handleOptionChange}
                  className="
                    w-full
                    p-2
                    bg-black/10
                    border border-gray-400/20
                    rounded-xl
                    text-xs
                    font-medium
                    focus:outline-none
                    text-inherit
                    dark:bg-slate-800
                  "
                >
                  <option value="aurora" className="text-gray-800">Aurora</option>
                  <option value="light" className="text-gray-800">Light</option>
                  <option value="neon" className="text-gray-800">Neon</option>
                </select>
              </div>
            </div>

            {/* RESULTS STATE PANEL */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <div className="w-8 h-8 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
                <p className={`text-xs font-semibold ${themeStyles.textSecondary}`}>Fetching Live Weather...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-xs text-red-400 font-semibold">{error}</p>
              </div>
            )}

            {/* WEATHER CONTENT LAYOUT */}
            {!loading && weatherData && (
              <div className="space-y-4 pt-2">
                {/* CURRENT BASIC CARD */}
                <div className={`p-5 rounded-[2rem] border ${themeStyles.itemBg} flex items-center justify-between`}>
                  <div className="space-y-1">
                    <h3 className={`text-3xl font-extrabold tracking-tight ${themeStyles.textPrimary}`}>
                      {formatTemp(weatherData.main.temp)}
                    </h3>
                    <p className={`text-sm font-semibold capitalize ${themeStyles.textSecondary}`}>
                      {weatherData.weather[0]?.description || "No description"}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Location: {weatherData.name}
                    </p>
                  </div>
                  <div>
                    {getWeatherIcon(weatherData.weather[0]?.main)}
                  </div>
                </div>

                {/* OPTIONAL: DETAILED CONDITIONS SECTION */}
                {options.forecastType === "details" && (
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* FEELS LIKE */}
                    <div className={`p-3.5 rounded-2xl border ${themeStyles.itemBg} flex items-center gap-3`}>
                      <Thermometer className="w-4 h-4 text-sky-400" />
                      <div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Feels Like</p>
                        <p className={`text-xs font-bold ${themeStyles.textPrimary}`}>{formatTemp(weatherData.main.feels_like)}</p>
                      </div>
                    </div>

                    {/* HUMIDITY */}
                    <div className={`p-3.5 rounded-2xl border ${themeStyles.itemBg} flex items-center gap-3`}>
                      <Droplets className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Humidity</p>
                        <p className={`text-xs font-bold ${themeStyles.textPrimary}`}>{weatherData.main.humidity}%</p>
                      </div>
                    </div>

                    {/* WIND */}
                    <div className={`p-3.5 rounded-2xl border ${themeStyles.itemBg} flex items-center gap-3`}>
                      <Wind className="w-4 h-4 text-teal-400" />
                      <div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Wind Speed</p>
                        <p className={`text-xs font-bold ${themeStyles.textPrimary}`}>{weatherData.wind.speed} m/s</p>
                      </div>
                    </div>

                    {/* PRESSURE */}
                    <div className={`p-3.5 rounded-2xl border ${themeStyles.itemBg} flex items-center gap-3`}>
                      <Compass className="w-4 h-4 text-indigo-400" />
                      <div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Pressure</p>
                        <p className={`text-xs font-bold ${themeStyles.textPrimary}`}>{weatherData.main.pressure} hPa</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* OPTIONAL: 3-DAY SIMULATED FORECAST LIST */}
                {options.forecastType === "forecast" && (
                  <div className="space-y-2">
                    <p className={`text-[10px] font-bold uppercase tracking-wider px-1 ${themeStyles.textSecondary}`}>
                      3-Day Simulated Outlook
                    </p>
                    <div className="space-y-2">
                      {getSimulatedForecast(weatherData.main.temp, weatherData.weather[0]?.main).map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border ${themeStyles.itemBg} flex items-center justify-between`}
                        >
                          <div className="flex items-center gap-3">
                            {getWeatherIcon(item.condition)}
                            <div>
                              <p className={`text-xs font-bold ${themeStyles.textPrimary}`}>{item.day}</p>
                              <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">{item.condition}</p>
                            </div>
                          </div>
                          <span className={`text-sm font-extrabold ${themeStyles.textPrimary}`}>
                            {item.temp}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default WeatherPredictionWidget;
