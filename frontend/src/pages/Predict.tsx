// src/pages/Predict.tsx
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchPredictions, fetchCities } from "@/lib/api";

/**
 * AnimatedNumber - smoothly count up to a target value
 */
function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = performance.now();
    const from = 0;
    const to = Number(value) || 0;
    const diff = to - from;
    if (!diff) {
      setDisplay(to);
      return;
    }
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOut
      setDisplay(Math.round(from + diff * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span className="text-3xl font-extrabold tabular-nums">{display}</span>;
}

/**
 * SimplePieChart - small interactive donut/pie chart using inline SVG
 * Expects data: { label, value, color }[]
 */
function SimplePieChart({ data, size = 220 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  const radius = size / 2;
  const innerR = radius * 0.5;
  const [hover, setHover] = useState<{ label: string; value: number } | null>(null);

  let acc = 0;
  const arcs = data.map((d) => {
    const start = acc;
    const portion = total ? d.value / total : 0;
    acc += portion;
    const end = acc;
    return { ...d, portion, start, end };
  });

  const polarToCartesian = (cx: number, cy: number, r: number, t: number) => {
    const angle = 2 * Math.PI * t - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const pathForArc = (start: number, end: number) => {
    if (end - start <= 0) return "";
    const large = end - start > 0.5 ? 1 : 0;
    const startC = polarToCartesian(radius, radius, radius, start);
    const endC = polarToCartesian(radius, radius, radius, end);
    const innerStart = polarToCartesian(radius, radius, innerR, start);
    const innerEnd = polarToCartesian(radius, radius, innerR, end);
    return [
      `M ${startC.x} ${startC.y}`,
      `A ${radius} ${radius} 0 ${large} 1 ${endC.x} ${endC.y}`,
      `L ${innerEnd.x} ${innerEnd.y}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${innerStart.x} ${innerStart.y}`,
      "Z",
    ].join(" ");
  };

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-md drop-shadow">
        <defs>
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="6" floodOpacity="0.12" />
          </filter>
        </defs>

        <g filter="url(#soft)">
          {arcs.map((a, i) => {
            const d = pathForArc(a.start, a.end);
            return (
              <path
                key={i}
                d={d}
                fill={a.color}
                onMouseEnter={() => setHover({ label: a.label, value: a.value })}
                onMouseLeave={() => setHover(null)}
                style={{ transition: "transform 220ms ease", transformOrigin: `${radius}px ${radius}px` }}
                transform={hover && hover.label === a.label ? `scale(1.035)` : undefined}
              />
            );
          })}
        </g>

        {/* center label */}
        <g>
          <circle cx={radius} cy={radius} r={innerR} fill="#0f172a" opacity={0.9} />
          <text x={radius} y={radius - 6} textAnchor="middle" className="text-xs fill-white" style={{ fontSize: 12 }}>
            Total
          </text>
          <text x={radius} y={radius + 18} textAnchor="middle" className="text-xl fill-white font-bold" style={{ fontSize: 18 }}>
            {total}
          </text>
        </g>
      </svg>

      <div className="space-y-2">
        {data.map((d) => (
          <div
            key={d.label}
            className="flex items-center gap-3 px-3 py-2 bg-surface rounded-md transition hover:scale-[1.02]"
            style={{ minWidth: 220 }}
            onMouseEnter={() => setHover({ label: d.label, value: d.value })}
            onMouseLeave={() => setHover(null)}
          >
            <div style={{ width: 12, height: 12, background: d.color, borderRadius: 4 }} />
            <div className="flex-1">
              <div className="text-sm font-semibold uppercase">{d.label}</div>
              <div className="text-xs text-muted-foreground"> {d.value} predicted (total)</div>
            </div>
            <div className="text-lg font-medium tabular-nums">{d.value}</div>
          </div>
        ))}
        {hover && (
          <div className="mt-2 px-3 py-2 rounded bg-white/6 text-sm">
            <strong>{hover.label}</strong>: {hover.value}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Predict() {
  // city empty on refresh
  const [city, setCity] = useState<string>("");
  // months empty on refresh — allow empty string until user inputs a number
  const [months, setMonths] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<{ crime_group: string; predictions: { year_month: string; predicted_count: number }[] }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>([]);

  const palette = useMemo(() => ["#6366f1", "#ef4444", "#f59e0b", "#10b981", "#06b6d4", "#8b5cf6", "#f97316", "#e11d48"], []);

  useEffect(() => {
    let mounted = true;
    fetchCities()
      .then((data: any) => {
        if (!mounted) return;
        let cityList: string[] = [];
        if (Array.isArray(data)) {
          if (data.length && typeof data[0] === "string") cityList = data as string[];
          else cityList = (data as any[]).map((d) => (d.city ? d.city : Object.values(d)[0]));
        }
        cityList = cityList.filter(Boolean).map(String);
        cityList.sort((a, b) => a.localeCompare(b));
        setCities(cityList);
        // NOTE: do NOT auto-select first city — leave blank on refresh
        // if (!city && cityList.length) setCity(cityList[0]);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []); // run only on mount

  const onPredict = async () => {
    if (!city) {
      setError("Please select a city.");
      return;
    }
    if (!months || months === "") {
      setError("Please enter months ahead (1–36).");
      return;
    }
    setLoading(true);
    setError(null);
    setGroups([]);
    try {
      // months is number | "" — safe to coerce
      const monthsNum = typeof months === "number" ? months : Number(months);
      const resp = await fetchPredictions(city, monthsNum);
      let resgroups: any[] = [];
      if (resp.results) resgroups = resp.results;
      else if (resp.predictions) {
        const grouped: Record<string, any[]> = {};
        (resp.predictions || []).forEach((p: any) => {
          const grp = p.crime_group || p.crime || "UNKNOWN";
          grouped[grp] = grouped[grp] || [];
          grouped[grp].push({ year_month: p.year_month, predicted_count: Number(p.crime_count ?? p.predicted_count ?? p.predicted ?? 0) });
        });
        resgroups = Object.keys(grouped).map((k) => ({ crime_group: k, predictions: grouped[k] }));
      } else {
        setError("Unexpected server response.");
      }
      
      // Filter out generic and unspecified categories for specific decision-making
      resgroups = resgroups.filter(g => {
        const labelLower = g.crime_group.toLowerCase().trim();
        return labelLower !== 'other crime' && labelLower !== 'unknown' && labelLower !== 'other';
      });

      setGroups(resgroups);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  const totals = useMemo(() => {
    return groups.map((g, i) => {
      const total = (g.predictions || []).reduce((a, b) => a + Number(b.predicted_count ?? 0), 0);
      return { label: g.crime_group, value: total, color: palette[i % palette.length] };
    });
  }, [groups, palette]);

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <Card className="p-6 shadow-lg">
          <CardHeader className="pb-0">
            <CardTitle className="text-3xl font-extrabold">Crime Forecast</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Totals for the next period — concise and visual.</p>
          </CardHeader>
          <CardContent>
            {/* BACK BUTTON */}
            <div className="mb-6">
              <a href="/" className="inline-block">
                <button className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition shadow">← Back to Home</button>
              </a>
            </div>

            {/* TOP INPUT UI */}
            <div className="flex flex-wrap gap-6 items-end mb-6">
              <div style={{ minWidth: 300 }} className="flex-1">
                <label className="block text-sm font-medium mb-2">City</label>
                <select
                  className="w-full p-3 bg-slate-800 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">-- Select city --</option>
                  {cities.length ? cities.map((c) => <option key={c} value={c} className="bg-slate-800 text-white">{c}</option>) : null}
                </select>
              </div>

              <div style={{ width: 180 }}>
                <label className="block text-sm font-medium mb-2">Months ahead</label>
                <input
                  className="w-full p-3 bg-slate-800 text-white border border-slate-600 rounded-lg text-lg focus:ring-2 focus:ring-indigo-500 shadow"
                  type="number"
                  value={months}
                  min={1}
                  max={36}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setMonths("");
                    } else {
                      const n = Number(val);
                      if (Number.isNaN(n)) setMonths("");
                      else setMonths(Math.max(1, Math.min(36, n)));
                    }
                  }}
                />
              </div>

              <div className="flex items-center gap-4">
                <Button onClick={onPredict} disabled={loading || !city || !months}>
                  {loading ? "Predicting..." : "Predict"}
                </Button>
                <div>
                  <div className="text-xs text-muted-foreground">Display mode</div>
                  <div className="text-sm font-medium">Totals only (default)</div>
                </div>
              </div>
            </div>

            {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="space-y-4">
                {groups.length === 0 && !loading && <div className="text-sm text-muted-foreground">No predictions yet — choose a city and click Predict.</div>}

                {groups.map((g) => {
                  const total = (g.predictions || []).reduce((a: number, b: any) => a + Number(b.predicted_count ?? 0), 0);
                  const avg = g.predictions && g.predictions.length ? total / g.predictions.length : 0;
                  return (
                    <div key={g.crime_group} className="p-5 rounded-lg bg-gradient-to-r from-slate-800/60 to-slate-900/60 border border-surface transition transform hover:-translate-y-1" style={{ boxShadow: "0 6px 18px rgba(2,6,23,0.6)" }}>
                      <div className="flex items-center justify-between gap-6">
                        <div>
                          <div className="text-sm text-muted-foreground">Crime type</div>
                          <div className="text-xl font-semibold uppercase">{g.crime_group}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Total (next {g.predictions?.length ?? months} months)</div>
                          <AnimatedNumber value={total} />
                          <div className="text-xs text-muted-foreground mt-1">Avg/month: {Math.round(avg * 10) / 10}</div>
                        </div>
                      </div>

                      <div className="mt-4 text-sm text-muted-foreground">
                        {g.predictions && g.predictions.length > 0 ? (
                          <span>
                            Next months: <span className="font-medium">{g.predictions.map((p: any) => Math.round(Number(p.predicted_count ?? 0))).join(", ")}</span>
                          </span>
                        ) : <span>-</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-6 rounded-lg bg-surface border border-surface shadow-sm">
                <h4 className="font-semibold mb-4">Distribution</h4>
                {totals.length === 0 ? <div className="text-sm text-muted-foreground">No data to display</div> : <SimplePieChart data={totals} size={260} />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
