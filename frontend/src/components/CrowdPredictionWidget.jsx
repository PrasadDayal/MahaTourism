import React, { useState, useEffect } from "react";
import { 
  Users, X, TrendingUp, MapPin, Calendar, CloudSun, 
  Clock, Percent, Timer, Sun, Sparkles, HelpCircle, Award 
} from "lucide-react";
import axios from "axios";

const CrowdPredictionWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const [formData, setFormData] = useState({
    place: "Gateway of India",
    month: "December",
    season: "Winter",
    weekend: "Yes",
    holiday: "Yes",
    trip_duration: "3 days",
  });

  // Fetch spots on mount to populate place dropdown
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/public/spots")
      .then((res) => {
        const sortedSpots = res.data.sort((a, b) => a.name.localeCompare(b.name));
        setSpots(sortedSpots);
        if (sortedSpots.length > 0) {
          // If Gateway of India exists in db, set it, else set first spot
          const gatewayExists = sortedSpots.some(s => s.name === "Gateway of India");
          setFormData((prev) => ({
            ...prev,
            place: gatewayExists ? "Gateway of India" : sortedSpots[0].name
          }));
        }
      })
      .catch((err) => {
        console.error("Failed to load spots from database, falling back to static list", err);
        // Fallback static spots if database fails
        setSpots([
          { name: "Gateway of India" },
          { name: "Marine Drive" },
          { name: "Elephanta Caves" },
          { name: "Siddhivinayak Temple" },
          { name: "Ajanta Caves" },
          { name: "Ellora Caves" },
          { name: "Mahabaleshwar" },
          { name: "Lonavala" }
        ]);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const predictCrowd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/api/crowd/predict",
        formData
      );
      setPrediction(response.data);
    } catch (error) {
      console.error(error.response?.data || error);
      alert("Prediction failed. Make sure the Spring Boot backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to choose color schemes dynamically based on crowd level
  const getCrowdColors = (level) => {
    if (!level) return { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-600", accent: "bg-orange-500" };
    switch (level.toUpperCase()) {
      case "HIGH":
        return {
          bg: "bg-rose-50/90",
          border: "border-rose-100",
          text: "text-rose-600",
          accent: "bg-rose-500",
          progressBg: "bg-rose-500",
          badge: "bg-rose-100 text-rose-700 border-rose-200"
        };
      case "MEDIUM":
        return {
          bg: "bg-amber-50/90",
          border: "border-amber-100",
          text: "text-amber-600",
          accent: "bg-amber-500",
          progressBg: "bg-amber-500",
          badge: "bg-amber-100 text-amber-700 border-amber-200"
        };
      case "LOW":
      default:
        return {
          bg: "bg-emerald-50/90",
          border: "border-emerald-100",
          text: "text-emerald-600",
          accent: "bg-emerald-500",
          progressBg: "bg-emerald-500",
          badge: "bg-emerald-100 text-emerald-700 border-emerald-200"
        };
    }
  };

  const colors = prediction ? getCrowdColors(prediction.crowd_level) : null;

  return (
    <>
      {/* FLOATING BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className="
          fixed
          bottom-24
          right-6
          z-[999]
          bg-gradient-to-tr from-orange-500 to-amber-500
          hover:from-orange-600 hover:to-amber-600
          text-white
          p-4
          rounded-full
          shadow-[0_10px_30px_rgba(249,115,22,0.3)]
          transition-all
          duration-300
          hover:scale-110
          flex
          items-center
          justify-center
        "
        title="Crowd Predictor"
      >
        <Users className="w-6 h-6" />
      </button>

      {/* POPUP CONTAINER */}
      {isOpen && (
        <div
          className="
            fixed
            bottom-24
            right-6
            w-[380px]
            max-h-[85vh]
            overflow-y-auto
            bg-white/95
            backdrop-blur-md
            rounded-[2.5rem]
            shadow-[0_20px_50px_rgba(0,0,0,0.15)]
            border
            border-gray-100
            z-[999]
            transition-all
            duration-300
            scale-100
            animate-in fade-in zoom-in-95 duration-200
          "
        >
          {/* HEADER */}
          <div
            className="
              bg-gradient-to-r from-orange-500 to-amber-500
              text-white
              px-6
              py-5
              flex
              items-center
              justify-between
              rounded-t-[2.5rem]
            "
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">
                  Crowd Predictor
                </h2>
                <p className="text-[10px] opacity-80 uppercase tracking-wider font-semibold">
                  Smart AI Tourism Analyzer
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

          {/* FORM */}
          <form
            onSubmit={predictCrowd}
            className="p-6 space-y-4"
          >
            {/* PLACE SELECT */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                Select Place
              </label>
              <select
                name="place"
                value={formData.place}
                onChange={handleChange}
                required
                className="
                  w-full
                  p-3
                  bg-gray-50
                  border border-gray-200
                  rounded-2xl
                  text-sm
                  text-gray-800
                  font-medium
                  focus:outline-none
                  focus:ring-2
                  focus:ring-orange-400
                  focus:bg-white
                  transition-all
                "
              >
                {spots.map((spot, idx) => (
                  <option key={idx} value={spot.name}>
                    {spot.name}
                  </option>
                ))}
              </select>
            </div>

            {/* MONTH & SEASON IN GRID */}
            <div className="grid grid-cols-2 gap-3">
              {/* MONTH */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-orange-500" />
                  Month
                </label>
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  className="
                    w-full
                    p-3
                    bg-gray-50
                    border border-gray-200
                    rounded-2xl
                    text-sm
                    text-gray-800
                    font-medium
                    focus:outline-none
                    focus:ring-2
                    focus:ring-orange-400
                    focus:bg-white
                    transition-all
                  "
                >
                  {[
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                  ].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* SEASON */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <CloudSun className="w-3.5 h-3.5 text-orange-500" />
                  Season
                </label>
                <select
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                  className="
                    w-full
                    p-3
                    bg-gray-50
                    border border-gray-200
                    rounded-2xl
                    text-sm
                    text-gray-800
                    font-medium
                    focus:outline-none
                    focus:ring-2
                    focus:ring-orange-400
                    focus:bg-white
                    transition-all
                  "
                >
                  {["Winter", "Summer", "Monsoon", "Post-Monsoon"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* WEEKEND, HOLIDAY, TRIP DURATION */}
            <div className="grid grid-cols-2 gap-3">
              {/* WEEKEND */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-orange-500" />
                  Weekend
                </label>
                <select
                  name="weekend"
                  value={formData.weekend}
                  onChange={handleChange}
                  className="
                    w-full
                    p-3
                    bg-gray-50
                    border border-gray-200
                    rounded-2xl
                    text-sm
                    text-gray-800
                    font-medium
                    focus:outline-none
                    focus:ring-2
                    focus:ring-orange-400
                    focus:bg-white
                    transition-all
                  "
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              {/* HOLIDAY */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-orange-500" />
                  Holiday
                </label>
                <select
                  name="holiday"
                  value={formData.holiday}
                  onChange={handleChange}
                  className="
                    w-full
                    p-3
                    bg-gray-50
                    border border-gray-200
                    rounded-2xl
                    text-sm
                    text-gray-800
                    font-medium
                    focus:outline-none
                    focus:ring-2
                    focus:ring-orange-400
                    focus:bg-white
                    transition-all
                  "
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>

            {/* TRIP DURATION */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-500" />
                Trip Duration
              </label>
              <select
                name="trip_duration"
                value={formData.trip_duration}
                onChange={handleChange}
                className="
                  w-full
                  p-3
                  bg-gray-50
                  border border-gray-200
                  rounded-2xl
                  text-sm
                  text-gray-800
                  font-medium
                  focus:outline-none
                  focus:ring-2
                  focus:ring-orange-400
                  focus:bg-white
                  transition-all
                "
              >
                {["1 day", "2 days", "3 days", "4 days", "5 days"].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* PREDICT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                bg-gradient-to-r from-orange-500 to-amber-500
                hover:from-orange-600 hover:to-amber-600
                text-white
                py-3.5
                rounded-2xl
                font-bold
                shadow-md
                hover:shadow-lg
                transition-all
                duration-300
                hover:-translate-y-0.5
                active:translate-y-0
              "
            >
              {loading ? "Analyzing..." : "Analyze Crowd"}
            </button>
          </form>

          {/* PREDICTION RESULTS */}
          {prediction && colors && (
            <div className="px-6 pb-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-300">
              <div
                className={`
                  ${colors.bg}
                  border ${colors.border}
                  rounded-[2rem]
                  p-5
                  shadow-inner
                  space-y-4
                `}
              >
                {/* TARGET SPOT METRIC */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Prediction
                  </span>
                  <span
                    className={`
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-extrabold
                      border
                      ${colors.badge}
                    `}
                  >
                    {prediction.crowd_level}
                  </span>
                </div>

                {/* PREDICTION METRIC GRID */}
                <div className="space-y-3.5 pt-1">
                  {/* PERCENTAGE */}
                  <div className="flex items-start gap-3">
                    <div className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100 mt-0.5">
                      <Percent className={`w-4 h-4 ${colors.text}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        Crowd Density
                      </p>
                      <p className="text-sm font-bold text-gray-800">
                        {prediction.crowd_percentage}
                      </p>
                      {/* Density Progress Bar */}
                      <div className="w-full bg-gray-200/80 rounded-full h-1.5 mt-1.5">
                        <div
                          className={`${colors.progressBg} h-1.5 rounded-full transition-all duration-500`}
                          style={{
                            width: prediction.crowd_level.toUpperCase() === "HIGH" ? "90%" : 
                                   prediction.crowd_level.toUpperCase() === "MEDIUM" ? "55%" : "25%"
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* WAITING TIME */}
                  <div className="flex items-start gap-3">
                    <div className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100 mt-0.5">
                      <Timer className={`w-4 h-4 ${colors.text}`} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        Est. Waiting Time
                      </p>
                      <p className="text-sm font-bold text-gray-800">
                        {prediction.waiting_time}
                      </p>
                    </div>
                  </div>

                  {/* BEST TIME */}
                  <div className="flex items-start gap-3">
                    <div className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100 mt-0.5">
                      <Sun className={`w-4 h-4 ${colors.text}`} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        Best Visit Time
                      </p>
                      <p className="text-sm font-bold text-gray-800">
                        {prediction.best_time}
                      </p>
                    </div>
                  </div>

                  {/* RECOMMENDATION */}
                  <div className="flex items-start gap-3">
                    <div className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100 mt-0.5">
                      <Sparkles className={`w-4 h-4 ${colors.text}`} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        AI Recommendation
                      </p>
                      <p className="text-xs font-bold text-gray-700 leading-relaxed">
                        {prediction.recommendation}
                      </p>
                    </div>
                  </div>

                  {/* CONFIDENCE */}
                  {prediction.confidence && (
                    <div className="flex items-start gap-3">
                      <div className="bg-white p-1.5 rounded-lg shadow-sm border border-gray-100 mt-0.5">
                        <Award className={`w-4 h-4 ${colors.text}`} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          Confidence Score
                        </p>
                        <p className="text-sm font-bold text-gray-800">
                          {prediction.confidence}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CrowdPredictionWidget;