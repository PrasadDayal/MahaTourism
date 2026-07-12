import React, { useState, useEffect } from 'react';
import api from '../services/api';

import {
  Sparkles,
  Map as MapIcon,
  Users,
  Calendar,
  Wallet,
  Cpu,
  Bot,
  MapPinned,
  X,
  Sun,
  Moon,
  Utensils,
  Camera,
  Hotel,
  Sunset
} from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import CrowdPredictionWidget from '../components/CrowdPredictionWidget';

const AIItinerary = () => {

  /* ========================= */
  /* ===== SYSTEM DATA ======= */
  /* ========================= */


  /* ========================= */
  /* ===== STATES ============ */
  /* ========================= */

  const [plannerType, setPlannerType] = useState('gemini');
  const [weatherCity, setWeatherCity] = useState("Maharashtra");

const [weatherData, setWeatherData] = useState(null);

const [weatherLoading, setWeatherLoading] = useState(false);
  const [cities, setCities] = useState([]);
const [spots, setSpots] = useState([]);
const [hotels, setHotels] = useState([]);

  const [formData, setFormData] = useState({
    destination: 'Mahabaleshwar',
    days: 3,
    budget: 'Moderate',
    people: 2,
  });

  const [itinerary, setItinerary] = useState('');

  const [loading, setLoading] = useState(false);
  useEffect(() => {
  const fetchData = async () => {
    try {
      const cityRes = await api.get('/public/cities').catch(() => ({ data: [] }));
      const spotRes = await api.get('/public/spots').catch(() => ({ data: [] }));
      const hotelRes = await api.get('/public/hotels').catch(() => ({ data: [] }));

      setCities(cityRes.data || []);
      setSpots(spotRes.data || []);
      setHotels(hotelRes.data || []);
    } catch (err) {
      console.error("Data fetching error:", err);
    }
  };

  fetchData();
}, []);

  /* ========================= */
  /* ===== GEMINI API ======== */
  /* ========================= */

  const generateGeminiPlan = async () => {

    try {

      const res = await api.post(
        '/ai/itinerary',
        formData
      );

      setItinerary(res.data.data);

    } catch (err) {

      console.error(err);

      setItinerary(
        'Failed to generate itinerary. Backend AI service may not be running.'
      );

    }

  };

  const generateSystemPlan = () => {
    console.log("Generating system plan...", { cities, spots, hotels, formData });
    const selectedCity = cities.find(city => city.name === formData.destination);

    if (!selectedCity) {
      setItinerary("Destination not found.");
      return;
    }

    // Filter spots based on budget
    const citySpots = spots.filter(spot => {
        const isCityMatch = spot.city?.id === selectedCity.id;
        
        if (formData.budget === 'Budget-friendly') 
            return isCityMatch && (spot.entryFee === "Free" || spot.entryFee?.toLowerCase().includes("free"));
        
        if (formData.budget === 'Luxury') 
            return isCityMatch && (spot.rating >= 4.0 || spot.featured);
        
        return isCityMatch; // Moderate
    });
    
    // Get hotels directly from selected city
    const cityHotels = selectedCity.hotels || [];
    
    const days = Number(formData.days);
    
    // Create a shuffled copy to ensure variety
    let availableSpots = [...citySpots].sort(() => 0.5 - Math.random());
    let availableHotels = [...cityHotels].sort(() => 0.5 - Math.random());
    
    // Calculate Budget strictly based on category
    // Hierarchy: Budget-friendly < Moderate < Luxury
    let dailyHotelBudget = 0;
    let dailyExtraCost = 0;
    
    if (formData.budget === "Budget-friendly") {
        dailyHotelBudget = 1500;
        dailyExtraCost = 800;
    } else if (formData.budget === "Moderate") {
        dailyHotelBudget = 3500;
        dailyExtraCost = 2000;
    } else { // Luxury
        dailyHotelBudget = 8000;
        dailyExtraCost = 5000;
    }

    // Apply day-increase multiplier: 10% increase per additional day above 3
    if (days > 3) {
        const factor = 1 + (days - 3) * 0.1;
        dailyHotelBudget = Math.round(dailyHotelBudget * factor);
        dailyExtraCost = Math.round(dailyExtraCost * factor);
    }

    const parseFee = (feeStr) => {
        if (!feeStr) return 0;
        if (typeof feeStr !== 'string') return 0;
        if (feeStr.toLowerCase().includes("free")) return 0;
        const match = feeStr.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    };

    // Calculate maximum cost per day
    let maxDayCost = 0;
    let maxDaySpotFee = 0;

    // Structure the itinerary
    const dailyPlan = [];
    for (let i = 0; i < days; i++) {
        // Pick one spot per day
        const spot = availableSpots[i % availableSpots.length] || { 
            name: "Tourist Spot", 
            description: "Explore the beautiful city and local sightseeing spots." 
        };
        
        const spotFee = parseFee(spot.entryFee) * formData.people;
        const dayCost = dailyHotelBudget + (formData.people * dailyExtraCost) + spotFee;
        
        if (dayCost > maxDayCost) {
            maxDayCost = dayCost;
            maxDaySpotFee = spotFee;
        }

        dailyPlan.push({
            day: i + 1,
            morning: {
                title: spot.name,
                description: spot.description || "Discover the charm of this location.",
                tag: (typeof spot.category === 'object' ? spot.category?.name : spot.category) || "Nature & Scenic spots",
                entryFee: spot.entryFee || "Free Entry",
                spot: spot
            },
            afternoon: {
                title: "Local Culture & Lunch",
                description: "Explore the local streets, visit nearby handicraft stores, and enjoy a traditional Maharashtrian lunch.",
                tag: "Try local street food"
            },
            evening: {
                title: "Scenic Views & Dinner",
                description: "Head to the nearest beach or sunset point to capture stunning views, followed by a cozy local dinner.",
                tag: "Perfect for photography"
            }
        });
    }

    // Final total cost is 3 * maxDayCost
    const finalRate = Math.round(3 * maxDayCost);
    const accommodationCost = Math.round(3 * dailyHotelBudget);
    const foodDrinksCost = Math.round(3 * 0.6 * (formData.people * dailyExtraCost));
    const transportCost = finalRate - accommodationCost - foodDrinksCost;

    setItinerary({
        city: selectedCity.name,
        budget: formData.budget,
        days: formData.days,
        people: formData.people,
        hotels: availableHotels.slice(0, 3),
        dailyPlan: dailyPlan,
        totalCost: finalRate,
        breakdown: {
            accommodation: accommodationCost,
            foodDrinks: foodDrinksCost,
            transport: transportCost
        }
    });
};

const InteractiveItineraryDisplay = ({ data }) => (
    <div className="space-y-12 animate-in fade-in duration-700">
        
        {/* 1. Trip Budget Estimate Section */}
        <section className="relative p-8 bg-gradient-to-br from-slate-900 via-zinc-900 to-black rounded-[32px] text-white shadow-2xl overflow-hidden border border-zinc-800">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h3 className="text-xl font-bold text-orange-400">Trip Budget Estimate</h3>
                    <p className="text-sm text-zinc-400 mt-1">Calculated for {data.days} Days • {data.budget} Plan</p>
                </div>
                <div className="text-5xl font-black text-white tracking-tighter flex items-center">
                    ₹{data.totalCost?.toLocaleString('en-IN') || data.totalCost}
                </div>
            </div>
            
            {/* 3 breakdowns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Accommodation</span>
                    <span className="text-2xl font-extrabold text-white mt-2">
                        ₹{data.breakdown?.accommodation?.toLocaleString('en-IN') || '0'}
                    </span>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Food & Drinks</span>
                    <span className="text-2xl font-extrabold text-white mt-2">
                        ₹{data.breakdown?.foodDrinks?.toLocaleString('en-IN') || '0'}
                    </span>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Local Travel</span>
                    <span className="text-2xl font-extrabold text-white mt-2">
                        ₹{data.breakdown?.transport?.toLocaleString('en-IN') || '0'}
                    </span>
                </div>
            </div>
            {/* Decorative glows */}
            <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -top-20 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl"></div>
        </section>

        {/* 2. Your Visual Journey Section */}
        <section>
            <div className="text-center mb-12">
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Your Visual Journey</h3>
                <div className="w-16 h-1 bg-orange-500 mx-auto rounded-full mt-3"></div>
            </div>
            
            <div className="relative border-l-2 border-gray-100 ml-4 md:ml-8 pl-8 md:pl-12 space-y-16">
                {data.dailyPlan && data.dailyPlan.map((day) => (
                    <div key={day.day} className="relative">
                        {/* Day Circle */}
                        <div className="absolute -left-[50px] md:-left-[66px] top-0 w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-orange-500 bg-white flex items-center justify-center text-orange-600 font-extrabold shadow-md z-20">
                            {day.day}
                        </div>
                        
                        <div className="space-y-6">
                            {/* Day Header */}
                            <h4 className="text-2xl font-extrabold text-gray-900 tracking-tight pl-2">Day {day.day}</h4>
                            
                            {/* Slot Cards Stack */}
                            <div className="grid grid-cols-1 gap-6 pl-2">
                                {/* Morning Card */}
                                <div className="group relative bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                                            <Sun className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">Morning</span>
                                            </div>
                                            <h5 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">{day.morning.title}</h5>
                                            <p className="text-gray-500 text-sm leading-relaxed max-w-xl">{day.morning.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:items-end gap-2 shrink-0">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 w-fit">
                                            {day.morning.entryFee || 'Free Entry'}
                                        </span>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100 w-fit">
                                            {day.morning.tag}
                                        </span>
                                    </div>
                                </div>

                                {/* Afternoon Card */}
                                <div className="group relative bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
                                            <Utensils className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">Afternoon</span>
                                            </div>
                                            <h5 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">{day.afternoon.title}</h5>
                                            <p className="text-gray-500 text-sm leading-relaxed max-w-xl">{day.afternoon.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:items-end gap-2 shrink-0">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 w-fit">
                                            {day.afternoon.tag}
                                        </span>
                                    </div>
                                </div>

                                {/* Evening Card */}
                                <div className="group relative bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                            <Moon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">Evening</span>
                                            </div>
                                            <h5 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">{day.evening.title}</h5>
                                            <p className="text-gray-500 text-sm leading-relaxed max-w-xl">{day.evening.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:items-end gap-2 shrink-0">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 w-fit">
                                            {day.evening.tag}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* 3. Hotels / Recommended Stays Section */}
        <section>
            <div className="flex items-center gap-3 mb-8">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Recommended Stays</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-orange-100 text-orange-800 uppercase tracking-wider">
                    {data.budget} Stay
                </span>
            </div>
            
            {data.hotels && data.hotels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {data.hotels.map((hotel, index) => (
                        <div key={index} className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 flex flex-col justify-between min-h-[220px]">
                            <div>
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                        <Hotel className="w-6 h-6" />
                                    </div>
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                                        ₹{hotel.pricePerNight?.toLocaleString('en-IN') || hotel.pricePerNight} / night
                                    </span>
                                </div>
                                <h4 className="font-extrabold text-lg text-gray-900 mb-2 line-clamp-1">{hotel.name}</h4>
                                <p className="text-gray-500 text-xs leading-relaxed line-clamp-3 bg-gray-50/50 p-3 rounded-2xl border border-gray-50">{hotel.description || 'Enjoy a comfortable stay.'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-50 p-8 rounded-3xl text-center border border-dashed border-gray-200">
                    <p className="text-gray-500 italic">No hotels found for this preference.</p>
                </div>
            )}
        </section>
    </div>
);

const fetchWeather = async () => {

  try {

    setWeatherLoading(true);

    const response = await api.get(
      `/weather/${weatherCity}`
    );

    setWeatherData(response.data);

  } catch (err) {

    console.error(err);

    alert("Failed to fetch weather");

  } finally {

    setWeatherLoading(false);

  }

};
  /* ========================= */
  /* ===== SUBMIT ============ */
  /* ========================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    setItinerary('');

    if (plannerType === 'gemini') {

      await generateGeminiPlan();

    } else {

      generateSystemPlan();

    }

    setLoading(false);

  };

  return (

    <div className="max-w-7xl mx-auto px-4 py-3">

      {/* ========================= */}
      {/* ===== HEADER ============ */}
      {/* ========================= */}

      <div className="text-center mb-2">

        <Sparkles className="w-12 h-12 text-emerald-600 mx-auto mb-4" />

        <h1 className="text-4xl font-extrabold text-gray-900">
          AI Itinerary Planner
        </h1>

        <p className="text-lg text-gray-600 mt-2">
          Generate smart personalized travel plans
        </p>

      </div>

      {/* ========================= */}
      {/* ===== TOGGLE ============ */}
      {/* ========================= */}

      <div className="flex justify-center mb-5">

        <div className="bg-white p-2 rounded-2xl shadow border border-gray-200 flex gap-2">

          {/* GEMINI */}

          <button
            onClick={() => setPlannerType('gemini')}
            className={`
              px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all
              ${plannerType === 'gemini'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700'}
            `}
          >

            <Bot className="w-5 h-5" />

            Gemini AI

          </button>

          {/* SYSTEM */}

          <button
            onClick={() => setPlannerType('system')}
            className={`
              px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all
              ${plannerType === 'system'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700'}
            `}
          >

            <Cpu className="w-5 h-5" />

            System Planner

          </button>

        </div>

      </div>
      {/* CROWD PREDICTION WIDGET */}
      <div className="flex justify-end mb-2">
        <CrowdPredictionWidget />
      </div>

      {/* ========================= */}
      {/* ===== MAIN GRID ========= */}
      {/* ========================= */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ========================= */}
        {/* ===== LEFT PANEL ======== */}
        {/* ========================= */}

        <div className="lg:col-span-1 bg-white p-8 rounded-xl shadow-sm border border-gray-200">

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* DESTINATION */}

            <div>

              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">

                <MapIcon className="w-4 h-4 mr-2" />

                Destination

              </label>

              {plannerType === 'system' ? (

                <select
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      destination: e.target.value
                    })
                  }
                  className="
                    w-full
                    p-3
                    border
                    border-gray-300
                    rounded-lg
                    focus:ring-2
                    focus:ring-orange-400
                    focus:outline-none
                  "
                >

{cities.map((city) => {

  const citySpots = spots
    .filter(
      spot => spot.city?.id === city.id
    )
    .slice(0, 5)
    .map(spot => spot.name)
    .join(" • ");

  return (

    <option
      key={city.id}
      value={city.name}
    >
      {city.name}
      {" — "}
      {citySpots}
    </option>

  );

})}

                </select>

              ) : (

                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      destination: e.target.value
                    })
                  }
                  className="
                    w-full
                    p-3
                    border
                    border-gray-300
                    rounded-lg
                    focus:ring-2
                    focus:ring-emerald-500
                    focus:outline-none
                  "
                  required
                />

              )}

            </div>

            {/* DAYS */}

            <div>

              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">

                <Calendar className="w-4 h-4 mr-2" />

                Days

              </label>

              <input
                type="number"
                min="1"
                max="14"
                value={formData.days}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    days: parseInt(e.target.value)
                  })
                }
                className="
                  w-full
                  p-3
                  border
                  border-gray-300
                  rounded-lg
                  focus:ring-2
                  focus:ring-emerald-500
                  focus:outline-none
                "
                required
              />

            </div>

            {/* BUDGET */}

            <div>

              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">

                <Wallet className="w-4 h-4 mr-2" />

                Budget

              </label>

              <select
                value={formData.budget}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: e.target.value
                  })
                }
                className="
                  w-full
                  p-3
                  border
                  border-gray-300
                  rounded-lg
                  focus:ring-2
                  focus:ring-emerald-500
                  focus:outline-none
                "
              >

                <option>
                  Budget-friendly
                </option>

                <option>
                  Moderate
                </option>

                <option>
                  Luxury
                </option>

              </select>

            </div>

            {/* PEOPLE */}

            <div>

              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">

                <Users className="w-4 h-4 mr-2" />

                People

              </label>

              <input
                type="number"
                min="1"
                max="20"
                value={formData.people}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    people: parseInt(e.target.value)
                  })
                }
                className="
                  w-full
                  p-3
                  border
                  border-gray-300
                  rounded-lg
                  focus:ring-2
                  focus:ring-emerald-500
                  focus:outline-none
                "
                required
              />

            </div>

            {/* SYSTEM INFO */}

            {plannerType === 'system' && (

              <div className="
                bg-orange-50
                border
                border-orange-200
                rounded-xl
                p-4
              ">

                <div className="flex items-center gap-2 mb-2">

                  <MapPinned className="w-5 h-5 text-orange-500" />

                  <h3 className="font-bold text-orange-600">
                    System Planner
                  </h3>

                </div>

                <p className="text-sm text-gray-700">

                  Uses stored tourism database,
                  crowd filtering,
                  budget optimization,
                  and predefined travel routes.

                </p>

              </div>

            )}
            

            {/* BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className={`
                w-full
                text-white
                font-bold
                py-3
                rounded-lg
                transition
                disabled:opacity-50
                ${plannerType === 'gemini'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-orange-500 hover:bg-orange-600'}
              `}
            >

              {loading
                ? 'Generating Plan...'
                : plannerType === 'gemini'
                  ? 'Generate AI Plan'
                  : 'Generate System Plan'
              }

            </button>

          </form>

        </div>

        {/* ========================= */}
        {/* ===== OUTPUT PANEL ====== */}
        {/* ========================= */}

        <div
  className="
    lg:col-span-2
    relative
    overflow-hidden
    rounded-[32px]
    border
    border-white/20
    bg-gradient-to-br
    from-white
    via-orange-50/40
    to-emerald-50/30
    shadow-[0_20px_80px_rgba(0,0,0,0.08)]
    backdrop-blur-xl
    min-h-[650px]
  "
>

  {/* BACKGROUND GLOW */}

  <div className="
    absolute
    top-0
    right-0
    w-72
    h-72
    bg-orange-200/20
    blur-3xl
    rounded-full
  " />

  <div className="
    absolute
    bottom-0
    left-0
    w-72
    h-72
    bg-emerald-200/20
    blur-3xl
    rounded-full
  " />

  {/* TOP BAR */}

  <div className="
    relative
    z-10
    flex
    items-center
    justify-between
    px-8
    py-6
    border-b
    border-gray-100
    bg-white/60
    backdrop-blur-xl
  ">

    <div>

      <h2 className="
        text-2xl
        font-black
        text-gray-900
      ">
        {plannerType === 'gemini'
          ? 'AI Generated Journey'
          : 'Smart System Travel Plan'}
      </h2>

      <p className="
        text-sm
        text-gray-500
        mt-1
      ">
        Personalized Maharashtra tourism experience
      </p>

    </div>

    <div className={`
      px-4
      py-2
      rounded-full
      text-sm
      font-bold
      shadow-lg
      ${plannerType === 'gemini'
        ? 'bg-emerald-500 text-white'
        : 'bg-orange-500 text-white'}
    `}>

      {plannerType === 'gemini'
        ? 'Gemini AI'
        : 'System Planner'}

    </div>

  </div>

  {/* CONTENT */}

  <div className="
    relative
    z-10
    p-8
  ">

    {loading ? (

      <div className="
        flex
        flex-col
        items-center
        justify-center
        h-[500px]
      ">

        <div className="
          relative
          mb-8
        ">

          <div className="
            w-28
            h-28
            rounded-full
            border-[6px]
            border-orange-100
          " />

          <div className="
            absolute
            inset-0
            w-28
            h-28
            rounded-full
            border-[6px]
            border-orange-500
            border-t-transparent
            animate-spin
          " />

          <div className="
            absolute
            inset-0
            flex
            items-center
            justify-center
          ">

            <Sparkles className="
              w-10
              h-10
              text-orange-500
              animate-pulse
            " />

          </div>

        </div>

        <h3 className="
          text-3xl
          font-black
          text-gray-900
          mb-3
        ">

          {plannerType === 'gemini'
            ? 'AI Planning Your Trip'
            : 'Generating Smart Route'}

        </h3>

        <p className="
          text-gray-500
          text-lg
          text-center
          max-w-md
        ">

          Optimizing destinations,
          attractions,
          travel flow,
          and personalized experiences.

        </p>

      </div>

    ) : itinerary ? (

      <div className="
        animate-fadeIn
      ">

        {/* STATS */}

        <div className="
          grid
          grid-cols-2
          md:grid-cols-4
          gap-4
          mb-8
        ">

          <div className="
            bg-white/80
            backdrop-blur-xl
            rounded-2xl
            p-5
            border
            border-gray-100
            shadow-sm
          ">

            <p className="
              text-xs
              font-semibold
              text-gray-500
              uppercase
            ">
              Destination
            </p>

            <h3 className="
              text-lg
              font-black
              text-gray-900
              mt-2
            ">
              {formData.destination}
            </h3>

          </div>

          <div className="
            bg-white/80
            backdrop-blur-xl
            rounded-2xl
            p-5
            border
            border-gray-100
            shadow-sm
          ">

            <p className="
              text-xs
              font-semibold
              text-gray-500
              uppercase
            ">
              Duration
            </p>

            <h3 className="
              text-lg
              font-black
              text-gray-900
              mt-2
            ">
              {formData.days} Days
            </h3>

          </div>

          <div className="
            bg-white/80
            backdrop-blur-xl
            rounded-2xl
            p-5
            border
            border-gray-100
            shadow-sm
          ">

            <p className="
              text-xs
              font-semibold
              text-gray-500
              uppercase
            ">
              Budget
            </p>

            <h3 className="
              text-lg
              font-black
              text-gray-900
              mt-2
            ">
              {formData.budget}
            </h3>

          </div>

          <div className="
            bg-white/80
            backdrop-blur-xl
            rounded-2xl
            p-5
            border
            border-gray-100
            shadow-sm
          ">

            <p className="
              text-xs
              font-semibold
              text-gray-500
              uppercase
            ">
              Travelers
            </p>

            <h3 className="
              text-lg
              font-black
              text-gray-900
              mt-2
            ">
              {formData.people}
            </h3>

          </div>

        </div>

        {/* PLAN */}

        <div className="
          bg-white/70
          backdrop-blur-xl
          rounded-[28px]
          p-8
          border
          border-white/50
          shadow-lg
        ">

          <div className="
  prose
  prose-lg
  prose-emerald
  max-w-none
  break-words
  overflow-hidden
  prose-headings:font-black
  prose-headings:text-gray-900
  prose-p:text-gray-700
  prose-p:break-words
  prose-li:break-words
  prose-strong:text-orange-600
  prose-li:text-gray-700
">

            {plannerType === 'system' && typeof itinerary === 'object' ? (
                <InteractiveItineraryDisplay data={itinerary} />
            ) : (
                <ReactMarkdown
                    components={{
                        p: ({ children }) => (
                        <p className="break-words whitespace-pre-wrap">
                            {children}
                        </p>
                        ),
                        li: ({ children }) => (
                        <li className="break-words whitespace-pre-wrap">
                            {children}
                        </li>
                        ),
                    }}
                >
                    {itinerary}
                </ReactMarkdown>
            )}

          </div>

        </div>

      </div>

    ) : (

      <div className="
        h-[500px]
        flex
        flex-col
        items-center
        justify-center
        text-center
      ">

        <div className="
          w-32
          h-32
          rounded-full
          bg-gradient-to-br
          from-orange-100
          to-emerald-100
          flex
          items-center
          justify-center
          mb-8
          shadow-xl
        ">

          <MapIcon className="
            w-16
            h-16
            text-orange-500
          " />

        </div>

        <h2 className="
          text-4xl
          font-black
          text-gray-900
          mb-4
        ">
          Ready For Your Journey?
        </h2>

        <p className="
          text-gray-500
          text-lg
          max-w-xl
          leading-relaxed
        ">

          Generate intelligent travel itineraries
          powered by AI and Maharashtra tourism data.

        </p>

      </div>

    )}

  </div>

</div>

      </div>

    </div>

  );
};

export default AIItinerary;