import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { 
  useAdminCitizenReports, 
  useUpdateReportStatus, 
  useDeleteReport,
  useAdminSOSAlerts,
  useResolveSOSAlert,
  CitizenReport
} from '../hooks/useAnalytics';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  ShieldAlert, 
  Inbox, 
  Calendar, 
  MapPin, 
  Clock, 
  UserCircle,
  AlertOctagon,
  CheckCircle2,
  LifeBuoy
} from 'lucide-react';
import { toast } from 'sonner';
import { cityCoordinates } from '../components/map/coordinates';

const ReportModeration = () => {
  const { data: reports, isLoading: reportsLoading, refetch: refetchReports } = useAdminCitizenReports();
  const { data: sosAlerts, isLoading: sosLoading, refetch: refetchSOS } = useAdminSOSAlerts();

  const updateStatusMutation = useUpdateReportStatus();
  const deleteMutation = useDeleteReport();
  const resolveSOSMutation = useResolveSOSAlert();

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const handleStatusChange = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      toast.success(`Report status updated to ${status}`);
      refetchReports();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update report status.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this report?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Report deleted successfully.');
      refetchReports();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to delete report.');
    }
  };

  const handleResolveSOS = async (id: number) => {
    try {
      await resolveSOSMutation.mutateAsync(id);
      toast.success('Distress beacon marked as RESOLVED. Alert archived.');
      refetchSOS();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to resolve SOS alert.');
    }
  };

  // Counters
  const countAll = reports?.length || 0;
  const countPending = reports?.filter(r => r.status === 'pending').length || 0;
  const countApproved = reports?.filter(r => r.status === 'approved').length || 0;
  const countRejected = reports?.filter(r => r.status === 'rejected').length || 0;

  // Filtered reports
  const filteredReports = reports?.filter(r => {
    if (activeTab === 'all') return true;
    return r.status === activeTab;
  }) || [];

  const activeSOS = sosAlerts?.filter(a => a.status === 'active') || [];
  const resolvedSOS = sosAlerts?.filter(a => a.status === 'resolved') || [];

  return (
    <div className="flex h-screen bg-slate-950 font-sans overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[120px]" />
      </div>

      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 min-w-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out py-4">
            
            {/* Title / Description */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Incident Command & Dispatch Center</h1>
                <p className="text-slate-400 mt-1.5 text-sm font-medium">Coordinate live citizen distress beacons (SOS) and moderate community incident reports.</p>
              </div>
            </div>

            {/* LIVE SOS ALERT BOARD */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Active Distress SOS Queue */}
              <div className="lg:col-span-1 bg-slate-900/50 rounded-2xl border border-rose-500/20 shadow-2xl flex flex-col h-[480px]">
                <div className="p-5 border-b border-rose-500/20 bg-rose-950/15 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
                    <h3 className="font-bold text-white text-base">Distress Dispatch Queue</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {activeSOS.length} Active Beacons
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {sosLoading ? (
                    <div className="flex justify-center items-center h-48">
                      <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                    </div>
                  ) : activeSOS.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-10">
                      <CheckCircle2 className="w-12 h-12 text-slate-600 mb-2" />
                      <h4 className="font-bold text-white text-sm">All Quiet</h4>
                      <p className="text-xs text-slate-500 mt-1">No active SOS coordinates. Community is safe.</p>
                    </div>
                  ) : (
                    activeSOS.map(alert => (
                      <div 
                        key={alert.id}
                        className="p-4 bg-slate-950/80 border border-rose-500/30 rounded-xl space-y-3 shadow-lg animate-in slide-in-from-left-4 duration-300"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                              <AlertOctagon className="w-4 h-4 text-rose-500" />
                              {alert.username}
                            </h4>
                            <p className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider mt-0.5">SOS Distressed</p>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">#{alert.id}</span>
                        </div>

                        <div className="text-xs text-slate-400 space-y-1.5 border-t border-white/5 pt-2">
                          <p className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            Logged: {alert.timestamp}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            GPS: {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                          </p>
                        </div>

                        <button
                          onClick={() => handleResolveSOS(alert.id)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold tracking-wide border border-transparent shadow hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Mark as Resolved
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Distress GIS Live Map */}
              <div className="lg:col-span-2 bg-slate-900/55 rounded-2xl border border-white/5 shadow-xl overflow-hidden h-[480px] flex flex-col">
                <div className="p-5 border-b border-white/5 bg-slate-950/40">
                  <h3 className="font-bold text-white text-base">Live Crisis Coordinate Map</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Distress SOS coordinates flash in bright red. Vetted logs appear in white.</p>
                </div>
                
                <div className="flex-1 relative z-10">
                  <MapContainer 
                    center={[22.5937, 78.9629]} 
                    zoom={4} 
                    scrollWheelZoom={true} 
                    className="w-full h-full"
                    style={{ background: '#020617', height: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />

                    {/* Plot active SOS beacons */}
                    {activeSOS.map(alert => (
                      <CircleMarker
                        key={`sos-${alert.id}`}
                        center={[alert.latitude, alert.longitude]}
                        radius={16}
                        pathOptions={{
                          fillColor: '#ef4444', // red-500
                          fillOpacity: 0.8,
                          color: '#ffffff',
                          weight: 2,
                          className: 'animate-ping' // CSS animation class
                        }}
                      >
                        <Popup>
                          <div className="p-2 text-slate-800 space-y-1.5 font-sans min-w-44">
                            <h4 className="font-bold text-rose-600 text-xs flex items-center gap-1">
                              <AlertOctagon className="w-3.5 h-3.5" />
                              SOS DISTRESS ALARM!
                            </h4>
                            <p className="text-xs">User: <strong>{alert.username}</strong></p>
                            <p className="text-[10px] text-slate-500">Logged: {alert.timestamp}</p>
                            <p className="text-[10px] text-slate-500">GPS: {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}</p>
                            <button
                              onClick={() => handleResolveSOS(alert.id)}
                              className="w-full mt-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold"
                            >
                              Dispatch Unit & Resolve
                            </button>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}

                    {/* Plot approved reports */}
                    {reports?.filter(r => r.status === 'approved').map(rep => {
                      const cityNameLower = rep.city.toLowerCase().trim();
                      const coords = cityCoordinates[cityNameLower];
                      if (!coords) return null;
                      return (
                        <CircleMarker
                          key={`report-${rep.id}`}
                          center={[coords.lat, coords.lng]}
                          radius={10}
                          pathOptions={{
                            fillColor: '#a855f7', // purple-500
                            fillOpacity: 0.6,
                            color: '#ffffff',
                            weight: 1
                          }}
                        >
                          <Popup>
                            <div className="p-1.5 text-slate-800 text-xs font-sans">
                              <p className="font-bold text-purple-700">{rep.crime_description}</p>
                              <p className="text-[10px] text-slate-500">{rep.city} | {rep.date_of_occurrence}</p>
                            </div>
                          </Popup>
                        </CircleMarker>
                      );
                    })}
                  </MapContainer>
                </div>
              </div>

            </div>

            {/* Stat Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <div 
                onClick={() => setActiveTab('all')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-200 ${activeTab === 'all' ? 'bg-purple-950/25 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'bg-slate-900/40 border-white/5 hover:border-white/10'}`}
              >
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">All Submissions</p>
                <p className="text-3xl font-bold text-white mt-2">{countAll}</p>
              </div>
              <div 
                onClick={() => setActiveTab('pending')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-200 ${activeTab === 'pending' ? 'bg-amber-950/25 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'bg-slate-900/40 border-white/5 hover:border-white/10'}`}
              >
                <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Pending Moderation</p>
                <p className="text-3xl font-bold text-amber-400 mt-2">{countPending}</p>
              </div>
              <div 
                onClick={() => setActiveTab('approved')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-200 ${activeTab === 'approved' ? 'bg-emerald-950/25 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-slate-900/40 border-white/5 hover:border-white/10'}`}
              >
                <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Approved Live</p>
                <p className="text-3xl font-bold text-emerald-400 mt-2">{countApproved}</p>
              </div>
              <div 
                onClick={() => setActiveTab('rejected')}
                className={`p-6 rounded-2xl border cursor-pointer transition-all duration-200 ${activeTab === 'rejected' ? 'bg-rose-950/25 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'bg-slate-900/40 border-white/5 hover:border-white/10'}`}
              >
                <p className="text-rose-400 text-xs font-semibold uppercase tracking-wider">Rejected Archives</p>
                <p className="text-3xl font-bold text-rose-400 mt-2">{countRejected}</p>
              </div>
            </div>

            {/* Moderation Queue List */}
            <div className="bg-slate-900/50 rounded-2xl border border-white/5 shadow-xl overflow-hidden mt-8">
              
              {/* Header / Tabs */}
              <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="font-bold text-white text-lg">Report Moderation Log</h3>
                
                {/* Tabs filter */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${activeTab === tab ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table / List */}
              {reportsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                  <p className="text-slate-400 text-sm font-medium">Fetching report submissions...</p>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-4">
                  <Inbox className="w-12 h-12 text-slate-600" />
                  <h4 className="font-bold text-white text-base">No Reports Found</h4>
                  <p className="text-slate-400 text-xs max-w-sm">No community reports exist for the filter: <span className="font-bold text-purple-400 uppercase">"{activeTab}"</span>.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/40">
                        <th className="p-4 pl-6">ID & Incident</th>
                        <th className="p-4">Jurisdiction</th>
                        <th className="p-4">Occurred Date/Time</th>
                        <th className="p-4">Victim Profile</th>
                        <th className="p-4">Report Details</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 pr-6 text-right">Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                      {filteredReports.map((report) => (
                        <tr key={report.id} className="hover:bg-white/5 transition-colors">
                          
                          {/* ID & Incident */}
                          <td className="p-4 pl-6">
                            <div className="flex flex-col">
                              <span className="font-bold text-white flex items-center gap-1.5">
                                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                                  #{report.id}
                                </span>
                                {report.crime_description}
                              </span>
                            </div>
                          </td>

                          {/* Jurisdiction */}
                          <td className="p-4">
                            <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                              <MapPin className="w-3.5 h-3.5 text-slate-500" />
                              {report.city}
                            </span>
                          </td>

                          {/* Occurred Date/Time */}
                          <td className="p-4">
                            <div className="flex flex-col text-xs text-slate-400 space-y-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {report.date_of_occurrence}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {report.time_of_occurrence}
                              </span>
                            </div>
                          </td>

                          {/* Victim Profile */}
                          <td className="p-4">
                            {report.victim_age || report.victim_gender ? (
                              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <UserCircle className="w-4 h-4 text-slate-500" />
                                <span>
                                  {report.victim_age ? `${report.victim_age} yrs` : 'Age N/A'}
                                  {report.victim_gender ? ` (${report.victim_gender})` : ''}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500 italic">Not Provided</span>
                            )}
                          </td>

                          {/* Details */}
                          <td className="p-4 max-w-xs">
                            <p className="text-xs text-slate-400 truncate hover:text-white cursor-help" title={report.report_details || 'No details provided'}>
                              {report.report_details || <span className="italic text-slate-600">No additional details provided</span>}
                            </p>
                          </td>

                          {/* Status Badge */}
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              report.status === 'approved' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : report.status === 'rejected'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                            }`}>
                              {report.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {report.status !== 'approved' && (
                                <button
                                  onClick={() => handleStatusChange(report.id, 'approved')}
                                  title="Approve Report"
                                  className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              
                              {report.status !== 'rejected' && (
                                <button
                                  onClick={() => handleStatusChange(report.id, 'rejected')}
                                  title="Reject Report"
                                  className="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => handleDelete(report.id)}
                                title="Delete Report"
                                className="p-1.5 bg-slate-800 border border-white/5 text-slate-400 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-600 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportModeration;
