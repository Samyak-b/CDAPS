import React from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { useChoropleth, useTopCities, useDashboardStats, useGenderStats, useTimeOfDayStats } from '../hooks/useAnalytics';
import { KPICards } from '../components/dashboard/KPICards';
import { Charts } from '../components/dashboard/Charts';
import { GenderChart } from '../components/dashboard/GenderChart';
import { TimeOfDayChart } from '../components/dashboard/TimeOfDayChart';
import { CrimeReport } from '../components/dashboard/CrimeReport';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { data: rawMapData, isLoading: mapLoading } = useChoropleth();
  const { data: topData, isLoading: topLoading } = useTopCities(10);
  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: genderData, isLoading: genderLoading } = useGenderStats();
  const { data: timeData, isLoading: timeLoading } = useTimeOfDayStats();

  const mapData = rawMapData?.features?.map((f: any) => f.properties) || [];

  if (mapLoading || topLoading || statsLoading || genderLoading || timeLoading) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 font-sans selection:bg-purple-500/30 overflow-hidden">
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
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Intelligence Dashboard</h1>
                <p className="text-slate-400 mt-1.5 text-sm font-medium">Real-time analytical insights derived from integrated prediction indices.</p>
              </div>
            </div>

            <KPICards dashboardStats={statsData} />
            <Charts mapData={mapData || []} topData={topData || []} />
            <GenderChart genderData={genderData || []} />
            <TimeOfDayChart timeData={timeData || []} />
            <CrimeReport mapData={mapData || []} topData={topData || []} />

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
