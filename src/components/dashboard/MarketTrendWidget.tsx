import React, { useEffect, useState } from 'react';

interface MarketTrendWidgetProps {
  language: string;
}

const MOCK_DATA = {
  overview: {
    total_jobs: 217251,
    total_companies: 55948,
    total_locations: 2849,
    data_from: "2026-05-31",
    data_until: "2026-05-31",
  },
  top_categories: [
    { category: "Accounting", job_count: 23334 },
    { category: "Manufacturing, Transport & Logistics", job_count: 21536 },
    { category: "Engineering", job_count: 21209 },
    { category: "Sales", job_count: 21024 },
    { category: "Information & Communication Technology", job_count: 18271 },
    { category: "Administration & Office Support", job_count: 17225 },
    { category: "Marketing & Communications", job_count: 12631 },
    { category: "Retail & Consumer Products", job_count: 12301 },
    { category: "Hospitality & Tourism", job_count: 9561 },
    { category: "Human Resources & Recruitment", job_count: 8990 },
  ],
  top_locations: [
    { location: "Kuala Lumpur, Malaysia", job_count: 21449 },
    { location: "Singapore", job_count: 10138 },
    { location: "Petaling, Indonesia", job_count: 9622 },
    { location: "Jakarta, Indonesia", job_count: 5508 },
    { location: "Central Region, Singapore", job_count: 5349 },
    { location: "Johor Bahru District, Indonesia", job_count: 4385 },
    { location: "Selangor, Malaysia", job_count: 3885 },
  ],
  salary_by_category: [
    {
      category: "CEO & General Management",
      median_salary_min: 15000000,
      median_salary_max: 20000000,
      sample_size: 21,
    },
    {
      category: "Information & Communication Technology",
      median_salary_min: 6500000,
      median_salary_max: 8000000,
      sample_size: 1049,
    },
    {
      category: "Engineering",
      median_salary_min: 5000000,
      median_salary_max: 6000000,
      sample_size: 1451,
    },
    {
      category: "Accounting",
      median_salary_min: 5000000,
      median_salary_max: 6000000,
      sample_size: 2535,
    },
    {
      category: "Sales",
      median_salary_min: 4500000,
      median_salary_max: 5714950,
      sample_size: 3562,
    },
    {
      category: "Marketing & Communications",
      median_salary_min: 4500000,
      median_salary_max: 5750000,
      sample_size: 2463,
    },
  ],
  employment_type_distribution: [
    {
      employment_type: "Full Time",
      job_count: 184605,
      percentage: 84.97,
    },
    {
      employment_type: "Contract/Temp",
      job_count: 25013,
      percentage: 11.51,
    },
    { employment_type: "Part Time", job_count: 3497, percentage: 1.61 },
  ],
  top_skills: [
    { skill: "Communication", demand: 87670 },
    { skill: "Sales", demand: 50006 },
    { skill: "English", demand: 47757 },
    { skill: "Compliance", demand: 38846 },
    { skill: "Reporting", demand: 36541 },
    { skill: "Excel", demand: 35326 },
    { skill: "Marketing", demand: 31629 },
    { skill: "Leadership", demand: 25354 },
    { skill: "Finance", demand: 25155 },
    { skill: "Accounting", demand: 23205 },
  ],
};

function formatNumber(num: number | undefined | null) {
  if (num === undefined || num === null) return "—";
  return num.toLocaleString("en-US");
}

function formatSalaryIDR(value: number | undefined | null) {
  if (!value && value !== 0) return "—";
  return "Rp " + Math.round(value).toLocaleString("id-ID");
}

const MarketTrendWidget: React.FC<MarketTrendWidgetProps> = ({ language }) => {
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'live' | 'mock'>('loading');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setStatus('loading');

        // Try to fetch with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const apiUrl = import.meta.env.VITE_MARKET_TRENDS_API || 'http://capstone-prototype.haneya.space:8000/market-trends';
        
        const response = await fetch(apiUrl, {
          mode: "cors",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();

        // Success - update with real data
        setData(result);
        setStatus('live');
      } catch (err) {
        console.warn("API fetch failed, using mock data:", err);

        // Use mock data
        setData(MOCK_DATA);
        setStatus('mock');
      }
    };

    loadDashboard();
  }, []);

  if (!data) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600 font-medium">{language === 'id' ? 'Memuat data tren...' : 'Loading trend data...'}</span>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f7fc] -mx-5 lg:-mx-8 -mb-6 px-5 lg:px-8 pb-8 pt-6 rounded-b-2xl font-sans" style={{ fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
      <style>{`
        .card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -12px rgba(0, 0, 0, 0.1);
        }
        .scrollable-table {
          scrollbar-width: thin;
        }
        .scrollable-table::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .scrollable-table::-webkit-scrollbar-track {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .scrollable-table::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 10px;
        }
        .gradient-head {
          background: linear-gradient(135deg, #1e2a5e 0%, #2c3e6d 100%);
        }
      `}</style>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-800 flex items-center gap-3">
            <i className="fas fa-chart-line text-indigo-600 text-3xl"></i>
            Market Trends Dashboard
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <i className="fas fa-briefcase text-sm"></i> Real-time job market intelligence & salary insights
          </p>
        </div>
        <div className="bg-white rounded-full px-4 py-2 shadow-sm flex items-center gap-3 text-sm">
          {status === 'loading' && (
            <>
              <i className="fas fa-database text-emerald-600"></i>
              <span className="font-medium text-gray-700">Loading data...</span>
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
            </>
          )}
          {status === 'live' && (
            <>
              <i className="fas fa-check-circle text-green-600"></i>
              <span className="font-medium text-gray-700">Live data</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            </>
          )}
          {status === 'mock' && (
            <>
              <i className="fas fa-database text-amber-600"></i>
              <span className="font-medium text-gray-700">Demo mode (mock data)</span>
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 card-hover">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Jobs</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {formatNumber(data.overview?.total_jobs)}
              </p>
            </div>
            <i className="fas fa-list-ul text-indigo-300 text-2xl"></i>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 card-hover">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Companies</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {formatNumber(data.overview?.total_companies)}
              </p>
            </div>
            <i className="fas fa-building text-emerald-300 text-2xl"></i>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 card-hover">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Unique Locations</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {formatNumber(data.overview?.total_locations)}
              </p>
            </div>
            <i className="fas fa-map-marker-alt text-rose-300 text-2xl"></i>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 card-hover">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Data Range</p>
              <p className="text-lg font-semibold text-gray-800 mt-1 leading-tight">
                {data.overview?.data_from || "—"} — {data.overview?.data_until || "—"}
              </p>
            </div>
            <i className="fas fa-chart-simple text-sky-400 text-2xl"></i>
          </div>
        </div>
      </div>

      {/* Top Categories & Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-lg text-gray-700">
              <i className="fas fa-tags text-indigo-500 mr-2"></i> Top Job Categories
            </h2>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">by job count</span>
          </div>
          <div className="p-4 max-h-[420px] overflow-y-auto scrollable-table">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="text-left text-gray-500 text-xs font-medium">
                  <th className="py-2 px-2">#</th>
                  <th className="py-2 px-2">Category</th>
                  <th className="py-2 px-2 text-right">Jobs</th>
                </tr>
              </thead>
              <tbody>
                {data.top_categories?.slice(0, 15).map((cat: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2 text-gray-400">{idx + 1}</td>
                    <td className="py-2 px-2 font-medium text-gray-700">{cat.category}</td>
                    <td className="py-2 px-2 text-right font-semibold text-indigo-700">{formatNumber(cat.job_count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-lg text-gray-700">
              <i className="fas fa-location-dot text-rose-500 mr-2"></i> Top Locations
            </h2>
            <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">job hotspots</span>
          </div>
          <div className="p-4 max-h-[420px] overflow-y-auto scrollable-table">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr className="text-left text-gray-500 text-xs font-medium">
                  <th className="py-2 px-2">#</th>
                  <th className="py-2 px-2">Location</th>
                  <th className="py-2 px-2 text-right">Job Count</th>
                </tr>
              </thead>
              <tbody>
                {data.top_locations?.slice(0, 15).map((loc: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2 text-gray-400">{idx + 1}</td>
                    <td className="py-2 px-2 text-gray-700">{loc.location}</td>
                    <td className="py-2 px-2 text-right font-semibold text-rose-600">{formatNumber(loc.job_count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Salary & Employment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 shrink-0">
            <h2 className="font-semibold text-lg text-gray-700">
              <i className="fas fa-coins text-amber-500 mr-2"></i> Salary Estimates (IDR/month)
            </h2>
          </div>
          <div className="overflow-x-auto flex-1 h-[400px] overflow-y-auto scrollable-table">
            <table className="min-w-[800px] w-full text-xs md:text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr className="text-left text-gray-600 font-medium">
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Median (Min)</th>
                  <th className="px-4 py-3">Median (Max)</th>
                  <th className="px-4 py-3 text-center">Sample</th>
                </tr>
              </thead>
              <tbody>
                {data.salary_by_category?.slice(0, 20).map((item: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-800 text-xs md:text-sm">{item.category}</td>
                    <td className="px-4 py-2 text-gray-700 text-xs">{formatSalaryIDR(item.median_salary_min)}</td>
                    <td className="px-4 py-2 text-gray-700 text-xs">{formatSalaryIDR(item.median_salary_max)}</td>
                    <td className="px-4 py-2 text-center text-gray-500 text-xs">{item.sample_size || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col">
          <div className="mb-5 flex-1">
            <div className="flex items-center gap-2 border-b pb-2 mb-3">
              <i className="fas fa-briefcase-clock text-indigo-500"></i>
              <h2 className="font-semibold text-gray-800">Employment Type</h2>
            </div>
            <div className="space-y-3">
              {data.employment_type_distribution?.map((type: any, idx: number) => {
                const percent = type.percentage || 0;
                return (
                  <div key={idx} className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-600">{type.employment_type}</span>
                      <span className="text-gray-500">{percent.toFixed(1)}% ({formatNumber(type.job_count)})</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(percent, 100)}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="border-t pt-4 shrink-0">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-gray-800">
                <i className="fas fa-microchip mr-1"></i> Top Skills
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {data.top_skills?.slice(0, 8).map((skill: any, idx: number) => (
                <div key={idx} className="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  {skill.skill} <span className="ml-1 text-indigo-600">({formatNumber(skill.demand)})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full Skills */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-6 py-3 bg-gray-50 border-b">
          <h2 className="font-semibold text-gray-700">
            <i className="fas fa-chart-line mr-2"></i> Most In-Demand Skills
          </h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {data.top_skills?.slice(0, 20).map((skill: any, idx: number) => (
              <div key={idx} className="flex justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                <span className="text-sm text-gray-700 truncate mr-2" title={skill.skill}>{skill.skill}</span>
                <span className="text-xs font-semibold text-gray-600 shrink-0">{formatNumber(skill.demand)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketTrendWidget;
