import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  useCitizenReports, 
  useCreateCitizenReport, 
  useCityList,
  useCreateSOSAlert
} from '../hooks/useAnalytics';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ShieldAlert, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  User as UserIcon, 
  AlertTriangle, 
  Loader2, 
  LogOut,
  ChevronRight,
  Lock,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { cityCoordinates } from '../components/map/coordinates';

const crimeCategories = [
  'THEFT',
  'BURGLARY',
  'ASSAULT',
  'ROBBERY',
  'KIDNAPPING',
  'HOMICIDE',
  'IDENTITY THEFT',
  'FRAUD',
  'HARASSMENT',
  'OTHER'
];

const CitizenPortal = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isCitizen = user?.role === 'citizen';
  const isAdmin = user?.role === 'admin';

  const { data: approvedReports, isLoading: reportsLoading, refetch } = useCitizenReports();
  const { data: availableCities } = useCityList();
  
  const createReportMutation = useCreateCitizenReport();
  const createSOSMutation = useCreateSOSAlert();

  // Form State
  const [city, setCity] = useState('');
  const [crimeDesc, setCrimeDesc] = useState('');
  const [dateOccurred, setDateOccurred] = useState('');
  const [timeOccurred, setTimeOccurred] = useState('');
  const [victimAge, setVictimAge] = useState('');
  const [victimGender, setVictimGender] = useState('');
  const [details, setDetails] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);

  // Fallback lists if API not loaded
  const citiesList = availableCities || [
    'Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
    'Ahmedabad', 'Jaipur', 'Lucknow', 'Bhopal', 'Patna', 'Chandigarh'
  ];

  const handleSOS = async () => {
    if (!isCitizen) {
      toast.error('You must log in as a Citizen to trigger SOS alerts.');
      navigate('/citizen/login');
      return;
    }

    setSosLoading(true);
    
    const triggerSOSAPI = async (lat: number, lng: number) => {
      try {
        await createSOSMutation.mutateAsync({ latitude: lat, longitude: lng });
        toast.success(
          `EMERGENCY SOS BROADCASTED!\nTransmitted GPS telemetry (${lat.toFixed(4)}, ${lng.toFixed(4)}) to active police dispatch. Dispatch units are en route.`,
          { duration: 6000 }
        );
      } catch (err: any) {
        toast.error('Failed to log SOS alert with server. Please dial 112 directly.');
      }
    };

    // Attempt browser Geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await triggerSOSAPI(latitude, longitude);
          setSosLoading(false);
        },
        async () => {
          // Geolocation failed or blocked, fall back to registered coordinates (mock coordinates)
          toast.warning('GPS unavailable. Broadcasting based on regional fallback coordinates.');
          // Pune default fallback
          await triggerSOSAPI(18.5204, 73.8567);
          setSosLoading(false);
        }
      );
    } else {
      await triggerSOSAPI(18.5204, 73.8567);
      setSosLoading(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCitizen) {
      toast.error('Please log in as a Citizen to file incident logs.');
      navigate('/citizen/login');
      return;
    }

    if (!city || !crimeDesc || !dateOccurred || !timeOccurred) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createReportMutation.mutateAsync({
        city,
        crime_description: crimeDesc,
        date_of_occurrence: dateOccurred,
        time_of_occurrence: timeOccurred,
        victim_age: victimAge ? parseInt(victimAge) : null,
        victim_gender: victimGender || null,
        report_details: details || null
      });

      toast.success('Incident logged successfully! The record is queued for police review.');
      
      // Clear Form
      setCity('');
      setCrimeDesc('');
      setDateOccurred('');
      setTimeOccurred('');
      setVictimAge('');
      setVictimGender('');
      setDetails('');
      
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find coordinates for approved reports to render on map
  const renderMarkers = approvedReports?.map((r) => {
    const cityNameLower = r.city.toLowerCase().trim();
    const coords = cityCoordinates[cityNameLower];
    
    // Add jitter so reports don't completely overlap
    const position: [number, number] = coords 
      ? [coords.lat + (Math.random() - 0.5) * 0.03, coords.lng + (Math.random() - 0.5) * 0.03]
      : [22.5937 + (Math.random() - 0.5) * 4, 78.9629 + (Math.random() - 0.5) * 4];

    return {
      ...r,
      position
    };
  }) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-purple-500/30 overflow-x-hidden relative pb-12">
      {/* Dynamic Background Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[450px] h-[450px] rounded-full bg-purple-900/10 blur-[130px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[130px]" />
      </div>

      {/* Navigation Header */}
      <header className="h-[72px] bg-slate-950/65 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 md:px-12 sticky top-0 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="w-7 h-7 text-purple-400" />
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent uppercase tracking-wide">
            CDAPS
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {isCitizen ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-semibold text-slate-300">
                Welcome, <span className="text-purple-400">{user?.username}</span> (Citizen)
              </span>
              <button
                onClick={logout}
                title="Sign Out"
                className="flex items-center justify-center p-2 rounded-xl text-slate-400 bg-slate-900 hover:bg-red-500/15 hover:text-red-400 border border-transparent transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : isAdmin ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-semibold text-amber-400">
                Logged in as Admin ({user?.username})
              </span>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-1.5 text-xs font-semibold rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-black transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/citizen/login')}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-full border border-white/10 bg-slate-900/50 hover:bg-slate-800 hover:text-white transition-all hover:border-purple-500/30"
            >
              <span>Citizen Sign In</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Hero section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 z-10 relative">
        
        {/* Role prompt notification banner */}
        {!isCitizen && !isAdmin && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-sm text-amber-300 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span>You are viewing in <strong>Guest Mode</strong>. You must log in as a citizen to file incidents or trigger distress alerts.</span>
            </div>
            <Link to="/citizen/login" className="font-bold underline text-amber-400 hover:text-amber-300 ml-4 shrink-0">
              Sign In Now &rarr;
            </Link>
          </div>
        )}

        <div className="text-center md:text-left md:flex items-center justify-between bg-gradient-to-r from-purple-950/40 to-slate-900/40 border border-white/5 rounded-3xl p-8 md:p-12 mb-12 shadow-2xl">
          <div className="max-w-xl space-y-4 mb-8 md:mb-0">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/25 border border-purple-500/30 text-purple-300">
              Community Incident Portal
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Report Crime, <br />
              <span className="text-purple-400">Secure Your Community</span>
            </h1>
            <p className="text-slate-400 text-base">
              A collaborative citizen-driven logging portal. Log incidents to warn peers, track verified neighborhood activities, and receive alert forecasts.
            </p>
          </div>

          {/* Distress SOS Simulation Panel */}
          <div className="bg-slate-950/80 border border-white/15 p-6 rounded-2xl md:w-[350px] shadow-2xl flex flex-col items-center relative overflow-hidden">
            {!isCitizen && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 text-center">
                <Lock className="w-8 h-8 text-slate-500 mb-2" />
                <h4 className="font-bold text-sm text-white">Distress SOS Locked</h4>
                <p className="text-slate-500 text-xs mt-1 mb-3">Sign in as citizen to unlock emergency dispatcher triggers.</p>
                <Link to="/citizen/login" className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-all">
                  Sign In
                </Link>
              </div>
            )}

            <h3 className="text-sm uppercase font-semibold text-rose-400 tracking-wider flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              Emergency SOS Response
            </h3>
            
            <button
              onClick={handleSOS}
              disabled={sosLoading}
              className="w-36 h-36 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:shadow-[0_0_40px_rgba(239,68,68,0.6)] flex flex-col items-center justify-center border border-white/10 active:scale-95 transition-all text-white group cursor-pointer"
            >
              {sosLoading ? (
                <Loader2 className="w-12 h-12 animate-spin" />
              ) : (
                <>
                  <ShieldAlert className="w-14 h-14 group-hover:scale-110 transition-transform text-white" />
                  <span className="font-black text-lg tracking-wider mt-1 uppercase text-white">SOS</span>
                </>
              )}
            </button>
            <p className="text-xs text-slate-400 text-center mt-4">
              Pressing SOS broadcasts emergency tags with location details to nearby emergency responders.
            </p>
          </div>
        </div>

        {/* Info Grid / Helplines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase">National Emergency Helpline</p>
              <p className="text-xl font-bold font-mono text-white">112</p>
            </div>
          </div>
          <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase">Women Helpline Number</p>
              <p className="text-xl font-bold font-mono text-white">1091</p>
            </div>
          </div>
          <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase">Cyber Crime Helpline</p>
              <p className="text-xl font-bold font-mono text-white">1930</p>
            </div>
          </div>
        </div>

        {/* Content Section: Map and Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Map Column */}
          <div className="lg:col-span-2 flex flex-col bg-slate-900/55 rounded-3xl border border-white/5 shadow-xl overflow-hidden min-h-[450px]">
            <div className="p-5 border-b border-white/5 bg-slate-950/40 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Citizen Report Heatmap</h3>
                <p className="text-slate-400 text-xs mt-1">Markers denote community-submitted cases vetted by local police admins.</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/35 text-emerald-400">
                {renderMarkers.length} Active Incidents
              </span>
            </div>

            <div className="flex-1 relative min-h-[400px] z-10">
              {reportsLoading ? (
                <div className="absolute inset-0 bg-slate-950/80 z-20 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
              ) : null}
              
              <MapContainer 
                center={[22.5937, 78.9629]} 
                zoom={4} 
                scrollWheelZoom={true} 
                className="w-full h-full"
                style={{ background: '#020617', height: '100%', minHeight: '400px' }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                {renderMarkers.map((marker) => (
                  <CircleMarker
                    key={marker.id}
                    center={marker.position}
                    radius={12}
                    pathOptions={{
                      fillColor: '#f43f5e', 
                      fillOpacity: 0.65,
                      color: '#ffffff',
                      weight: 1.5
                    }}
                  >
                    <Popup>
                      <div className="p-2 text-slate-800 space-y-2 min-w-48 font-sans">
                        <div className="flex items-center justify-between border-b pb-1.5 mb-1.5">
                          <span className="font-bold text-xs uppercase tracking-wide bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                            {marker.crime_description}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            ID: #{marker.id}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <p className="flex items-center gap-1.5 font-semibold text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {marker.city}
                          </p>
                          <p className="flex items-center gap-1.5 text-slate-600">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {marker.date_of_occurrence}
                          </p>
                          <p className="flex items-center gap-1.5 text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {marker.time_of_occurrence}
                          </p>
                          {marker.victim_age || marker.victim_gender ? (
                            <p className="flex items-center gap-1.5 text-slate-600">
                              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                              Victim: {marker.victim_age || 'N/A'} yrs | {marker.victim_gender || 'N/A'}
                            </p>
                          ) : null}
                          {marker.report_details ? (
                            <div className="mt-2 pt-2 border-t text-[11px] text-slate-600 bg-slate-50 p-2 rounded italic">
                              "{marker.report_details}"
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Form Column */}
          <div className="bg-slate-900/55 rounded-3xl border border-white/5 shadow-xl p-6 md:p-8 flex flex-col relative overflow-hidden">
            {!isCitizen && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center">
                <Lock className="w-10 h-10 text-slate-500 mb-2 animate-bounce" />
                <h4 className="font-bold text-base text-white">Reporting Gated</h4>
                <p className="text-slate-500 text-xs mt-1 mb-4 max-w-xs">You must register and log in to file secure reports for verification.</p>
                <Link to="/citizen/login" className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold transition-all">
                  Sign In as Citizen
                </Link>
              </div>
            )}

            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-purple-400" />
              Log Incident Report
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Complete the log. False reporting is subject to police verification under statutory IPC sections.
            </p>

            <form onSubmit={handleReportSubmit} className="space-y-4 flex-1 flex flex-col">
              
              {/* City Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">City <span className="text-rose-500">*</span></label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-slate-500"
                  required
                >
                  <option value="" disabled>-- Select City --</option>
                  {citiesList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Crime Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Incident Type <span className="text-rose-500">*</span></label>
                <select
                  value={crimeDesc}
                  onChange={(e) => setCrimeDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  required
                >
                  <option value="" disabled>-- Select Type --</option>
                  {crimeCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Date <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    value={dateOccurred}
                    onChange={(e) => setDateOccurred(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Time <span className="text-rose-500">*</span></label>
                  <input
                    type="time"
                    value={timeOccurred}
                    onChange={(e) => setTimeOccurred(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Victim Age & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Victim Age (Optional)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="e.g. 25"
                    value={victimAge}
                    onChange={(e) => setVictimAge(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Victim Gender (Optional)</label>
                  <select
                    value={victimGender}
                    onChange={(e) => setVictimGender(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  >
                    <option value="">-- Choose Gender --</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1.5 flex-1 flex flex-col">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Additional Details</label>
                <textarea
                  placeholder="Describe location, suspect details or weapon if any..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full min-h-[80px] flex-1 bg-slate-950 border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-sm font-semibold tracking-wide border border-transparent shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Log...
                  </>
                ) : (
                  'File Secure Report'
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CitizenPortal;
