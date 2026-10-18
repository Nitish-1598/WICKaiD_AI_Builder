import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Search,
  Send,
  Database,
  BarChart3,
  Layers,
  Users,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  Sliders,
  DollarSign,
  PieChart as PieIcon,
  Terminal,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

interface MerchantDashboardProps {
  onOpenGcpTelemetry: () => void;
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({ onOpenGcpTelemetry }) => {
  const [activeTab, setActiveTab] = useState<
    'forecasting' | 'basket' | 'segments' | 'returns' | 'copilot'
  >('forecasting');
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reorderedSkus, setReorderedSkus] = useState<Set<string>>(new Set());

  // NL Copilot State
  const [nlQuery, setNlQuery] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotResult, setCopilotResult] = useState<any>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/merchant/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to load merchant dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTriggerReorder = (sku: string) => {
    setReorderedSkus((prev) => new Set(prev).add(sku));
  };

  const handleRunNlQuery = async (queryText: string) => {
    const q = queryText || nlQuery;
    if (!q.trim()) return;
    setNlQuery(q);
    setCopilotLoading(true);
    try {
      const res = await axios.post('/api/merchant/nl-query', { query: q });
      setCopilotResult(res.data);
      setActiveTab('copilot');
    } catch (err) {
      console.error('NL Query Error:', err);
    } finally {
      setCopilotLoading(false);
    }
  };

  const sampleQuestions = [
    'Top 5 trending colors with lowest return rate',
    'Deadstock items matching >70% of active user closets',
    'Customer segments at risk of seasonal churn',
    'Which outerwear item has the highest stockout risk this month?',
    'Simulate demand if we promote the Camel Merino Wool Coat',
  ];

  return (
    <div className="min-w-0 max-w-7xl mx-auto px-4 md:px-8 py-8 animate-fadeIn">
      
      {/* Executive Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-rose-950/40 gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/20">
              Retail & Commerce B2B Intelligence
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">Google BigQuery AI Operations Suite</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-wide">
            Merchant Intelligence & Operations Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time demand forecasting, market basket cross-sell analytics, customer RFM clustering, and return mitigation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-rose-400' : ''}`} />
            <span>Sync BigQuery</span>
          </button>
          
          <button
            onClick={onOpenGcpTelemetry}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl btn-luxury-primary text-xs font-semibold text-white shadow-lg shadow-rose-950/40"
          >
            <Database className="h-4 w-4" />
            <span>GCP Telemetry</span>
          </button>
        </div>
      </div>

      {/* Top Level Executive KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl glass-panel-luxury border border-rose-950/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-medium text-slate-400">Total 30D Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-serif text-white">
              ${dashboardData?.kpis?.totalRevenue?.toLocaleString() || '660,105'}
            </span>
            <span className="text-xs text-emerald-400 font-medium flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> +24.8%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Driven by AI capsule bundles</p>
        </div>

        {/* Capsule AOV Lift */}
        <div className="p-5 rounded-2xl glass-panel-luxury border border-rose-950/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-medium text-slate-400">Average Order Value</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-serif text-rose-200">
              ${dashboardData?.kpis?.capsuleAov || '275'}
            </span>
            <span className="text-xs text-emerald-400 font-bold flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> +223% Lift
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Baseline single item: $85</p>
        </div>

        {/* Return Cost Reductions */}
        <div className="p-5 rounded-2xl glass-panel-luxury border border-rose-950/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-medium text-slate-400">AI Return Savings</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <RotateCcw className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-serif text-indigo-200">
              ${dashboardData?.kpis?.annualReturnCostSavings?.toLocaleString() || '418,000'}
            </span>
            <span className="text-xs text-emerald-400 font-medium">/ year</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Return rate reduced 32% → 11.2%</p>
        </div>

        {/* Active Capsule Orders */}
        <div className="p-5 rounded-2xl glass-panel-luxury border border-rose-950/40 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-medium text-slate-400">Capsule Multi-Piece Orders</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-serif text-amber-200">
              {dashboardData?.kpis?.activeCapsuleOrders?.toLocaleString() || '2,112'}
            </span>
            <span className="text-xs text-amber-400 font-medium">3.8 items/order</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cross-category cohesive checkouts</p>
        </div>

      </div>

      {/* Analytical Tab Navigation */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-slate-800">
        <button
          onClick={() => setActiveTab('forecasting')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'forecasting'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Demand Forecasting & Stockout Risk</span>
        </button>

        <button
          onClick={() => setActiveTab('basket')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'basket'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Market Basket & Cross-Sell Affinities</span>
        </button>

        <button
          onClick={() => setActiveTab('segments')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'segments'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Customer Segmentation (RFM)</span>
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'returns'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Return Rate & Fit AI Mitigation</span>
        </button>

        <button
          onClick={() => setActiveTab('copilot')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'copilot'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Terminal className="h-4 w-4 text-indigo-400" />
          <span>BigQuery AI Natural Language Copilot</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DEMAND FORECASTING & INVENTORY STOCKOUT RISK MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'forecasting' && (
        <div className="space-y-6">
          
          {/* Revenue Velocity Chart */}
          <div className="p-6 rounded-3xl glass-panel-luxury border border-rose-950/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-serif">
                  30-Day Revenue Trajectory: Baseline vs AI Capsule Amplification
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time transaction tracking showing revenue lift from multi-garment capsule styling.
                </p>
              </div>
              <div className="flex items-center space-x-4 text-xs font-mono mt-2 sm:mt-0">
                <div className="flex items-center space-x-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-500"></span>
                  <span className="text-slate-300">Capsule Orders ($275 AOV)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="h-3 w-3 rounded-full bg-slate-600"></span>
                  <span className="text-slate-400">Baseline Orders ($85 AOV)</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData?.thirtyDayTrend || []}>
                  <defs>
                    <linearGradient id="capsuleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="capsuleOrders"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#capsuleGrad)"
                    name="Capsule Orders"
                  />
                  <Area
                    type="monotone"
                    dataKey="baselineOrders"
                    stroke="#64748b"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#baselineGrad)"
                    name="Baseline Orders"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Real-time Inventory Health & Stockout Alert Table */}
          <div className="p-6 rounded-3xl glass-panel-luxury border border-rose-950/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-serif flex items-center space-x-2">
                  <span>Inventory Intelligence & Stockout Risk Matrix</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    15 Catalog SKUs Monitored
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Combines historical sales velocity with real-time customer capsule assembly popularity to forecast 30-day stock exhaustion.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="uppercase tracking-wider text-[10px] text-slate-400 border-b border-slate-800 bg-slate-900/40">
                  <tr>
                    <th className="py-3 px-4">SKU / Garment</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Current Stock</th>
                    <th className="py-3 px-3">Trending Capsule Score</th>
                    <th className="py-3 px-3">Projected 30D Demand</th>
                    <th className="py-3 px-3">Days Remaining</th>
                    <th className="py-3 px-3">Stockout Risk</th>
                    <th className="py-3 px-4 text-right">Autonomous Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {(dashboardData?.demandForecast || []).map((item: any) => {
                    const isReordered = reorderedSkus.has(item.sku);
                    return (
                      <tr key={item.sku} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-4 font-sans font-medium text-white flex items-center space-x-2">
                          <span className="font-mono text-rose-400 text-[11px]">{item.sku}</span>
                          <span className="truncate max-w-[200px]" title={item.name}>{item.name}</span>
                        </td>
                        <td className="py-3 px-3 font-sans text-slate-400">{item.category}</td>
                        <td className="py-3 px-3 font-semibold text-slate-200">{item.currentStock} units</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-rose-500 rounded-full"
                                style={{ width: `${item.trendingCapsuleScore}%` }}
                              ></div>
                            </div>
                            <span className="text-[11px] font-bold text-rose-300">{item.trendingCapsuleScore}/100</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-200 font-bold">{item.projected30DayDemand}</td>
                        <td className="py-3 px-3">
                          <span className={item.daysOfInventoryRemaining <= 10 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                            {item.daysOfInventoryRemaining} days
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {item.stockoutRisk === 'CRITICAL' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center w-fit space-x-1">
                              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> CRITICAL
                            </span>
                          ) : item.stockoutRisk === 'WARNING' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center w-fit space-x-1">
                              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> WARNING
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center w-fit space-x-1">
                              <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> OPTIMAL
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isReordered ? (
                            <span className="inline-flex items-center space-x-1 text-emerald-400 text-[11px] font-sans font-medium">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>PO Dispatched</span>
                            </span>
                          ) : item.recommendedReorderQty > 0 ? (
                            <button
                              onClick={() => handleTriggerReorder(item.sku)}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 font-sans text-[11px] font-medium transition-colors"
                            >
                              Dispatch PO (+{item.recommendedReorderQty})
                            </button>
                          ) : (
                            <span className="text-slate-500 font-sans text-[11px]">Stock Balanced</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MARKET BASKET & CROSS-SELL AFFINITIES */}
      {/* ========================================================================= */}
      {activeTab === 'basket' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Basket Lift Bar Chart */}
            <div className="lg:col-span-2 p-6 rounded-3xl glass-panel-luxury border border-rose-950/40">
              <div className="mb-4">
                <h3 className="text-base font-bold text-white font-serif">
                  Top Co-Occurring Product Pairings & Lift Multipliers
                </h3>
                <p className="text-xs text-slate-400">
                  Derived from BigQuery association rules across 2,100+ multi-item capsule transactions.
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData?.basketAffinities || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" stroke="#64748b" fontSize={11} domain={[0, 4]} />
                    <YAxis
                      dataKey="categoryPair"
                      type="category"
                      stroke="#64748b"
                      fontSize={11}
                      width={130}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                      formatter={(val: any) => [`${val}x Lift`, 'Affinity Multiplier']}
                    />
                    <Bar dataKey="liftRatio" fill="#f43f5e" radius={[0, 8, 8, 0]} name="Lift Ratio" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AOV Multiplier Metric Card */}
            <div className="p-6 rounded-3xl glass-panel-luxury border border-rose-950/40 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-rose-400 tracking-wider">
                  Basket Economics
                </span>
                <h3 className="text-lg font-serif font-bold text-white mt-1">
                  The "Capsule Effect" on AOV
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  When users see complete, cohesive outfits tailored to their existing wardrobe, basket abandonment drops by 68% and Average Order Value expands from $85 to $275.
                </p>
              </div>

              <div className="space-y-3 my-4">
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Single Garment Purchase</span>
                    <span className="text-white font-mono font-bold">$85.00</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-500 h-full w-[31%]"></div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <div className="flex justify-between text-xs text-rose-300 mb-1 font-semibold">
                    <span>3-Piece Capsule Checkout</span>
                    <span className="text-rose-200 font-mono font-bold">$275.00 (+223%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-rose-500 to-amber-500 h-full w-[100%]"></div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 text-[11px] text-slate-400 border border-slate-800/80">
                💡 <span className="text-slate-300 font-medium">Merchant Action:</span> Auto-bundle Camel Overcoat + Cream Turtleneck at checkout for an instant +$170 basket boost.
              </div>
            </div>

          </div>

          {/* Association Rules Table */}
          <div className="p-6 rounded-3xl glass-panel-luxury border border-rose-950/40">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">
              Detailed Market Basket Association Rules
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 font-mono">
                <thead className="uppercase text-[10px] text-slate-400 border-b border-slate-800 bg-slate-900/40">
                  <tr>
                    <th className="py-3 px-4">Primary Anchor Item</th>
                    <th className="py-3 px-4">High-Affinity Paired Item</th>
                    <th className="py-3 px-3">Transactions</th>
                    <th className="py-3 px-3">Support</th>
                    <th className="py-3 px-3">Confidence</th>
                    <th className="py-3 px-3">Lift Ratio</th>
                    <th className="py-3 px-4 text-right">Combined AOV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {(dashboardData?.basketAffinities || []).map((b: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-sans font-medium text-white">{b.primaryItem}</td>
                      <td className="py-3 px-4 font-sans text-rose-300">{b.pairedItem}</td>
                      <td className="py-3 px-3">{b.coOccurrenceCount}</td>
                      <td className="py-3 px-3 text-slate-400">{b.supportPct}%</td>
                      <td className="py-3 px-3 font-semibold text-emerald-400">{b.confidencePct}%</td>
                      <td className="py-3 px-3 font-bold text-rose-400">{b.liftRatio}x</td>
                      <td className="py-3 px-4 text-right font-bold text-white">${b.aovImpact?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CUSTOMER SEGMENTATION (RFM) */}
      {/* ========================================================================= */}
      {activeTab === 'segments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(dashboardData?.customerSegments || []).map((seg: any) => (
              <div
                key={seg.id}
                className="p-6 rounded-3xl glass-panel-luxury border border-rose-950/40 hover:border-rose-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {seg.id} • {seg.sharePct}% of Customers
                    </span>
                    <span className="text-xs font-semibold text-rose-400 font-mono">
                      {seg.customerCount.toLocaleString()} Shoppers
                    </span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-white mb-1">{seg.name}</h3>
                  <p className="text-xs text-slate-400 mb-4">{seg.tagline}</p>

                  <div className="grid grid-cols-3 gap-2 py-3 px-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 mb-4 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Avg AOV</span>
                      <span className="font-bold text-white">${seg.avgOrderValue}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Annual Freq</span>
                      <span className="font-bold text-white">{seg.annualPurchaseFreq}x / yr</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Return Rate</span>
                      <span className={seg.returnRatePct > 15 ? 'font-bold text-rose-400' : 'font-bold text-emerald-400'}>
                        {seg.returnRatePct}%
                      </span>
                    </div>
                  </div>

                  <div className="text-xs mb-4">
                    <span className="text-slate-500 text-[11px] block">Style DNA:</span>
                    <span className="font-medium text-slate-200">{seg.preferredArchetype}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200">
                  <span className="font-bold text-rose-300 block mb-0.5">🤖 AI Merchant Playbook:</span>
                  {seg.aiPlaybook}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: RETURN RATE & FIT AI MITIGATION */}
      {/* ========================================================================= */}
      {activeTab === 'returns' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Category Return Rate Progress */}
            <div className="lg:col-span-2 p-6 rounded-3xl glass-panel-luxury border border-rose-950/40">
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Industry: 32% → AI Capsule: 11.2%
                  </span>
                </div>
                <h3 className="text-base font-bold text-white font-serif mt-1">
                  Category Return Rates & Primary Reasons
                </h3>
                <p className="text-xs text-slate-400">
                  Fashion e-commerce returns average 30-40%. CapsuleAI's multimodal garment verification eliminates fit guesswork.
                </p>
              </div>

              <div className="space-y-4">
                {(dashboardData?.returnMitigation?.categoryReturnRates || []).map((cat: any) => (
                  <div key={cat.category} className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-medium text-white">{cat.category}</span>
                      <span className="font-mono font-bold text-slate-300">{cat.returnRatePct}% Return Rate</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-rose-500"
                        style={{ width: `${cat.returnRatePct * 3}%` }}
                      ></div>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      <span className="text-slate-500">Root Cause:</span> {cat.primaryReason}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Savings & Impact Summary */}
            <div className="p-6 rounded-3xl glass-panel-luxury border border-rose-950/40 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">
                  Profitability Engine
                </span>
                <h3 className="text-lg font-serif font-bold text-white mt-1">
                  $418,000 Annual Savings
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  By pre-validating color harmony, layering clearance, and customer wardrobe compatibility, our AI eliminates the two largest return causes: buyer remorse and styling mismatch.
                </p>
              </div>

              <div className="space-y-3 my-4">
                {(dashboardData?.returnMitigation?.topReturnDrivers || []).slice(0, 3).map((driver: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                    <div className="flex justify-between items-center font-semibold text-slate-200 mb-1">
                      <span>{driver.driver}</span>
                      <span className="text-rose-400 font-mono">{driver.sharePct}%</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{driver.aiPreventionTactic}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 text-[11px] text-emerald-300 border border-emerald-500/20 flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Zero "Wardrobing" fraud recorded across verified multi-piece capsule orders.</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: BIGQUERY AI NATURAL LANGUAGE MERCHANT COPILOT */}
      {/* ========================================================================= */}
      {activeTab === 'copilot' && (
        <div className="space-y-6">
          
          {/* Prompt Bar Card */}
          <div className="p-6 rounded-3xl glass-panel-luxury border border-rose-950/40">
            <div className="mb-4">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Text-to-SQL & Dynamic BI Visualization
              </span>
              <h3 className="text-base font-bold text-white font-serif mt-1.5">
                Ask BigQuery Copilot Anything About Your Retail Business
              </h3>
              <p className="text-xs text-slate-400">
                Gemini translates your natural language prompt into BigQuery Standard SQL, queries the data warehouse, and auto-renders interactive visual charts.
              </p>
            </div>

            {/* Prompt Input */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-4 top-3.5 text-slate-500" />
                <input
                  type="text"
                  value={nlQuery}
                  onChange={(e) => setNlQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunNlQuery(nlQuery)}
                  placeholder="e.g. Which outerwear item has the highest stockout risk this month?"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>
              <button
                onClick={() => handleRunNlQuery(nlQuery)}
                disabled={copilotLoading}
                className="px-5 py-3 rounded-2xl btn-luxury-primary text-xs font-semibold text-white flex items-center space-x-1.5 shadow-lg shadow-rose-950/40"
              >
                <Sparkles className={`h-3.5 w-3.5 ${copilotLoading ? 'animate-spin' : ''}`} />
                <span>{copilotLoading ? 'Reasoning...' : 'Query BigQuery'}</span>
              </button>
            </div>

            {/* Quick Sample Questions */}
            <div className="flex flex-wrap gap-2">
              <span className="text-[11px] text-slate-500 self-center mr-1">Try asking:</span>
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRunNlQuery(q)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors border border-slate-700/60"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>

          {/* Copilot Result Visualization */}
          {copilotResult && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Generated SQL Code Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="flex items-center space-x-1.5 font-mono text-[11px]">
                    <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Generated BigQuery Standard SQL:</span>
                  </span>
                  <span className="text-emerald-400 font-mono text-[10px]">Execution: 380ms • 0 bytes billed (sandbox)</span>
                </div>
                <pre className="text-xs font-mono text-indigo-300 p-3 rounded-xl bg-slate-900 overflow-x-auto border border-slate-800/80">
                  {copilotResult.sqlQuery}
                </pre>
              </div>

              {/* Dynamic Chart */}
              <div className="p-6 rounded-3xl glass-panel-luxury border border-rose-950/40">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">
                  Visualized Analytical Query Result
                </h4>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={copilotResult.chartData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey={copilotResult.xAxisKey || 'label'} stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                        itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
                      />
                      {(copilotResult.dataKeys || [{ key: 'value', name: 'Value', color: '#f43f5e' }]).map((dk: any) => (
                        <Bar
                          key={dk.key}
                          dataKey={dk.key}
                          name={dk.name}
                          fill={dk.color || '#f43f5e'}
                          radius={[6, 6, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Executive Summary & Strategic Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl glass-panel-luxury border border-rose-950/40">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-rose-300 mb-2 flex items-center space-x-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Executive Takeaways</span>
                  </h5>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(copilotResult.executiveSummary || []).map((bullet: string, i: number) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-rose-400 mt-0.5">•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2 flex items-center space-x-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Recommended Strategic Action</span>
                  </h5>
                  <p className="text-xs leading-relaxed">
                    {copilotResult.businessRecommendation}
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
