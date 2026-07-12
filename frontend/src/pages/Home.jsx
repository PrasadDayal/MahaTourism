import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  MapPin, Sparkles, Navigation, Calendar, ArrowRight, 
  Heart, Camera, Compass, Landmark, Mountain, 
  Palmtree, Coffee, Flame, Music, Tent, Utensils, Waves, Star 
} from 'lucide-react';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [gatewaySpots, setGatewaySpots] = useState([]);
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: "Majestic Heritage",
      subtitle: "Relive the legacy of Marathas at Raigad Fort",
      image: "https://t4.ftcdn.net/jpg/19/76/13/43/360_F_1976134301_ltjax2f2dt0jhCxLKHMYXLVsrJLJ3PeG.jpg",
      tag: "Historic Heartland",
      location: "Raigad Fort, Maharashtra"
    },
    {
      title: "Pristine Konkan",
      subtitle: "Unwind on the white sands of Tarkarli Beach",
      image: "https://parisabeachresort.com/wp-content/uploads/2025/04/Tsunami_Island_in_Tarkarli_22c6db292f-1024x576.png",
      tag: "Coastal Paradise",
      location: "Tarkarli, Konkan"
    },
    {
      title: "Misty Sahyadris",
      subtitle: "Escape to the lush green peaks and waterfalls of Lonavala",
      image: "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=2000&q=80",
      tag: "Hill Station Retreat",
      location: "Lonavala, Maharashtra"
    },
    {
      title: "Iconic Mumbai",
      subtitle: "The historic Gateway of India standing tall by the Arabian Sea",
      image: "https://images.unsplash.com/photo-1598434192043-71111c1b3f41?w=2000&auto=format&fit=crop&q=80",
      tag: "Urban Marvel",
      location: "Gateway of India, Mumbai"
    }
  ];

  const fallbackCategories = [
    { id: 1, name: "Beach", description: "Pristine golden sands and turquoise waters of the Konkan coast.", imageUrl: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80" },
    { id: 2, name: "Hills and Mountains", description: "Lush greenery and misty peaks of Western Ghats.", imageUrl: "https://plus.unsplash.com/premium_photo-1697729686580-91cb90cdb7b6?w=600&auto=format&fit=crop&q=60" },
    { id: 3, name: "Heritage", description: "Ancient forts and historical monuments.", imageUrl: "https://images.unsplash.com/photo-1663089554801-4562b8ea5388?w=600&auto=format&fit=crop&q=60" },
    { id: 4, name: "Romantic Places", description: "Dreamy escapes and serene retreats.", imageUrl: "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=800&q=80" },
    { id: 5, name: "Nightlife", description: "Vibrant clubs and illuminated skylines.", imageUrl: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80" },
    { id: 6, name: "Weekend Gateways", description: "Perfect short trips from the city to rejuvenate and explore.", imageUrl: "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=800&q=80" }
  ];

  const fallbackCities = [
    { id: 1, name: "Mahabaleshwar", description: "Hill station famous for strawberries.", imageUrl: "https://images.unsplash.com/photo-1611002214172-792c1f90b59a?auto=format&fit=crop&q=80", rating: "4.8" },
    { id: 2, name: "Ganpatipule", description: "Beautiful beach and temple.", imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80", rating: "4.6" },
    { id: 3, name: "Tarkarli", description: "Pristine white sand beaches.", imageUrl: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&q=80", rating: "4.9" },
    { id: 4, name: "Lonavala", description: "Popular weekend getaway.", imageUrl: "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=800&q=80", rating: "4.7" }
  ];

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));
    setUser(storedUser);

    const fetchData = async () => {
      try {
        const [catRes, cityRes, festRes] = await Promise.all([
          api.get('/public/categories').catch(() => ({ data: [] })),
          api.get('/public/cities').catch(() => ({ data: [] })),
          api.get('/public/festivals').catch(() => ({ data: [] }))
        ]);

        const serverCats = catRes.data || [];
        const mergedCats = [...serverCats];
        
        fallbackCategories.forEach(fallback => {
          if (!mergedCats.find(c => c.name.toLowerCase() === fallback.name.toLowerCase())) {
            mergedCats.push(fallback);
          }
        });

        setCategories(mergedCats);

        const gatewayCat = mergedCats.find(c => c.name.toLowerCase().includes('gateway'));
        if (gatewayCat) {
          const spotsRes = await api.get(`/public/spots/category/${gatewayCat.id}`);
          if (spotsRes.data) {
            setGatewaySpots(spotsRes.data.slice(0, 6));
          }
        }

        const trendingCities = (cityRes.data && cityRes.data.length > 0) 
          ? cityRes.data.filter(c => c.name !== 'Mumbai').slice(0, 3) 
          : fallbackCities.filter(c => c.name !== 'Mumbai').slice(0, 3);
        setTrending(trendingCities);
        setFestivals(festRes.data || []);

      } catch (err) {
        console.error("Critical error in Home page:", err);
        setCategories(fallbackCategories);
        setTrending(fallbackCities);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const getIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('beach')) return <Palmtree className="w-10 h-10" />;
    if (n.includes('hill') || n.includes('mountain')) return <Mountain className="w-10 h-10" />;
    if (n.includes('heritage') || n.includes('fort')) return <Landmark className="w-10 h-10" />;
    if (n.includes('romantic')) return <Heart className="w-10 h-10" />;
    if (n.includes('god') || n.includes('religious') || n.includes('spiritual')) return <Flame className="w-10 h-10" />;
    if (n.includes('weekend') || n.includes('gateway')) return <Coffee className="w-10 h-10" />;
    return <Sparkles className="w-10 h-10" />;
  };

  const experiences = [
    { 
      title: 'Heritage & Forts', 
      image: 'https://i.pinimg.com/736x/5d/3c/fe/5d3cfebae1ce9356c9add5d7c2129785.jpg',
      desc: 'Step back in time at ancient Maratha strongholds.',
      link: '/destinations?category=Heritage'
    },
    { 
      title: 'Spiritual Destination', 
      image: 'https://i.pinimg.com/736x/fd/aa/75/fdaa75f0854b00753f0bd8a722676836.jpg',
      desc: 'Find peace at Jyotirlingas and sacred shrines.',
      link: '/destinations?category=Spiritual Destination'
    },
    { 
      title: 'Coastal Escapes', 
      image: 'https://i.pinimg.com/736x/a3/76/56/a3765635327d487a92edbe22f53e3f16.jpg',
      desc: 'Unwind at the pristine white sands of Konkan.',
      link: '/destinations?category=Beach'
    },
    { 
      title: 'Weekend Gateways', 
      image: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=800',
      desc: 'Perfect short trips to rejuvenate and explore.',
      link: '/destinations?category=Weekend Gateways'
    }
  ];

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {/* Cinematic Hero Carousel */}
      <section className="relative h-screen w-full overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img 
              src={slide.image} 
              alt={slide.title} 
              className={`w-full h-full object-cover ${index === currentSlide ? 'animate-slow-zoom' : ''}`} 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
            
            <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-start z-10">
              <div className={`transition-all duration-1000 delay-300 transform ${
                index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <span className="bg-emerald-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.4em] shadow-2xl animate-pulse">
                    {slide.tag}
                  </span>
                  <span className="bg-white/10 backdrop-blur-md border border-white/30 text-emerald-400 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em]">
                    Spotlight: {slide.location.split(',')[0]}
                  </span>
                </div>

                <h1 className="text-6xl md:text-9xl font-black text-white mb-6 leading-none tracking-tighter">
                  {slide.title.split(' ')[0]} <br/> 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-white">
                    {slide.title.split(' ')[1] || ''}
                  </span>
                </h1>
                <p className="text-xl md:text-3xl text-gray-200 max-w-2xl mb-12 leading-relaxed font-medium">
                  {slide.subtitle}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6">
                  <Link to="/destinations" className="bg-emerald-600 text-white px-12 py-6 rounded-2xl font-black text-xl hover:bg-emerald-700 transition-all duration-300 shadow-[0_20px_50px_rgba(5,150,105,0.4)] flex items-center justify-center group">
                    Explore Now <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition" />
                  </Link>
                  <Link to="/ai-itinerary" className="glass text-white px-12 py-6 rounded-2xl font-black text-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center group">
                    AI Planner <Compass className="ml-3 w-6 h-6 group-hover:rotate-45 transition" />
                  </Link>
                </div>
              </div>
            </div>

            <div className={`absolute bottom-32 right-12 z-20 text-right transition-all duration-1000 delay-700 transform ${
              index === currentSlide ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'
            }`}>
              <div className="bg-black/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/10">
                <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.5em] mb-3">Featured Location</p>
                <h2 className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                  {slide.location.split(',')[0]}
                </h2>
                <div className="mt-4 flex items-center justify-end space-x-2">
                  <span className="w-12 h-1 bg-emerald-500 rounded-full"></span>
                  <span className="text-white/60 text-xs font-bold uppercase tracking-widest">{slide.location.split(',')[1] || 'Maharashtra'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex space-x-4 z-20">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 transition-all duration-500 rounded-full ${
                i === currentSlide ? 'w-16 bg-emerald-500' : 'w-4 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white relative z-20 -mt-10 mx-6 rounded-[3rem] shadow-2xl border border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { label: 'Ancient Forts', value: '350+', icon: <Landmark className="w-8 h-8" /> },
            { label: 'Coastline', value: '720km', icon: <Waves className="w-8 h-8" /> },
            { label: 'Yearly Festivals', value: '100+', icon: <Music className="w-8 h-8" /> },
            { label: 'Happy Travelers', value: '1M+', icon: <Heart className="w-8 h-8" /> }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="text-emerald-600 mb-4 animate-float">
                {stat.icon}
              </div>
              <div className="text-4xl md:text-5xl font-black text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-500 font-bold uppercase tracking-widest text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Experiences Grid */}
      <section className="py-40 px-6 bg-mesh-emerald">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-32">
            <div className="relative">
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-200 rounded-full blur-3xl opacity-40 animate-pulse"></div>
              <h2 className="text-sm font-black text-emerald-600 uppercase tracking-[0.5em] mb-6 relative">The Soul of Maharashtra</h2>
              <h3 className="text-6xl md:text-8xl font-black text-gray-900 leading-none tracking-tighter mb-10 relative">
                Beyond the <br/> <span className="text-emerald-600">Ordinary.</span>
              </h3>
              <p className="text-2xl text-gray-500 leading-relaxed max-w-xl font-medium">
                Maharashtra is not just a destination; it's a feeling. From the roar of the Arabian Sea to the silence of ancient caves, every moment is an experience.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {experiences.map((exp, idx) => (
                <Link
                  key={idx} 
                  to={exp.link}
                  className={`relative p-10 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all duration-500 group ${
                    idx % 2 === 1 ? 'mt-12' : ''
                  } overflow-hidden aspect-[4/5] flex flex-col justify-end`}
                >
                  <img src={exp.image} alt={exp.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="relative z-10">
                    <h4 className="text-2xl font-black text-white mb-4">{exp.title}</h4>
                    <p className="text-gray-200 font-medium mb-6 leading-snug opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {exp.desc}
                    </p>
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Weekend Gateways */}
      {gatewaySpots.length > 0 && (
        <section className="py-40 bg-white">
          <div className="max-w-7xl mx-auto px-6 mb-16 flex justify-between items-end">
            <div>
              <h2 className="text-sm font-black text-emerald-600 uppercase tracking-[0.4em] mb-4">Quick Escapes</h2>
              <h3 className="text-6xl font-black text-gray-900">Weekend Gateways</h3>
            </div>
            <Link to="/destinations?category=Weekend Gateways" className="text-xl font-black text-emerald-600 flex items-center group">
              Explore All <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-6">
            {gatewaySpots.map((spot) => (
              <div key={spot.id} className="group bg-white rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100">
                <div className="relative h-72 overflow-hidden">
                  <img src={spot.imageUrl} alt={spot.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" />
                  <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-emerald-800 font-black text-sm shadow-xl flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-500 fill-yellow-500" /> 4.9
                  </div>
                </div>
                <div className="p-10">
                  <div className="flex items-center text-emerald-600 font-black text-xs uppercase tracking-widest mb-4">
                    <MapPin className="w-4 h-4 mr-2" /> {spot.city?.name}
                  </div>
                  <h4 className="text-3xl font-black text-gray-900 mb-4 group-hover:text-emerald-600 transition">{spot.name}</h4>
                  <p className="text-gray-500 text-lg mb-8 line-clamp-2">{spot.description}</p>
                  <Link to={`/spot/${spot.id}`} className="inline-flex items-center text-gray-900 font-black text-lg group/link">
                    View Discovery <ArrowRight className="ml-3 w-5 h-5 text-emerald-600 group-hover/link:translate-x-2 transition" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Categories Scroll */}
      <section className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6 mb-16 flex justify-between items-end">
          <div>
            <h2 className="text-sm font-black text-emerald-600 uppercase tracking-[0.4em] mb-4">Choose Your Spirit</h2>
            <h3 className="text-6xl font-black text-gray-900">Explore by Interest</h3>
          </div>
        </div>

        <div className="flex overflow-x-auto pb-20 px-6 gap-8 snap-x snap-mandatory no-scrollbar">
          {categories.map((cat, idx) => (
            <Link 
              key={idx} 
              to={`/destinations?category=${cat.name}`} 
              className="flex-none w-[450px] group relative h-[650px] rounded-[4rem] overflow-hidden snap-start transition-all duration-700"
            >
              <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
              <div className="absolute top-10 right-10 bg-white/10 backdrop-blur-xl border border-white/20 w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-white group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all duration-500">
                {getIcon(cat.name)}
              </div>
              <div className="absolute bottom-0 left-0 p-16 w-full translate-y-10 group-hover:translate-y-0 transition duration-500">
                <h3 className="text-5xl font-black text-white mb-6 leading-none">{cat.name}</h3>
                <p className="text-gray-300 text-xl opacity-0 group-hover:opacity-100 transition duration-500 leading-relaxed">
                    {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Cities Spotlight */}
      <section className="py-40 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-32">
            <div>
              <h2 className="text-sm font-black text-emerald-600 uppercase tracking-[0.4em] mb-4">Iconic Destinations</h2>
              <h3 className="text-7xl font-black text-gray-900 tracking-tighter">The Heart of <br/> the State</h3>
            </div>
            <Link to="/destinations" className="mt-10 md:mt-0 text-2xl font-black text-gray-900 flex items-center group">
              See All <ArrowRight className="ml-4 w-8 h-8 group-hover:translate-x-2 transition text-emerald-600" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-[700px] bg-gray-100 rounded-[4rem] animate-pulse"></div>)
            ) : (
              trending.map((city, idx) => (
                <Link 
                  to={`/city/${city.id}`} 
                  key={city.id} 
                  className={`group relative h-[700px] rounded-[4rem] overflow-hidden shadow-2xl transition-all duration-700 ${
                    idx === 1 ? 'lg:-translate-y-16' : ''
                  }`}
                >
                  <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-16">
                    <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.4em] mb-4">Discover City</p>
                    <h4 className="text-5xl font-black text-white mb-6 leading-none">{city.name}</h4>
                    <p className="text-gray-300 text-xl line-clamp-2 opacity-0 group-hover:opacity-100 transition duration-500 transform translate-y-10 group-hover:translate-y-0 leading-relaxed">
                      {city.description}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-20 text-center bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-3 text-4xl font-black text-emerald-600">
              <Landmark className="w-12 h-12" />
              <span>MAHATOURISM</span>
            </div>
            <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">Official Tourism Experience of Maharashtra</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
