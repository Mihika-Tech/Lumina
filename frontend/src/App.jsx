import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, ShieldCheck, AlertTriangle, Server, Play, Terminal } from 'lucide-react';

const Dashboard = () => {
  // 1. State for the Form Inputs
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('General Knowledge');
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);

  // 2. State for the Graphs
  const [data, setData] = useState([]);
  const [metrics, setMetrics] = useState({
    total_requests: 0,
    avg_latency: 0,
    hallucination_rate: 0
  });

  // 3. Function to Send Request to Backend
  const handleAnalyze = async (e) => {
    e.preventDefault(); // Stop page reload
    if (!prompt) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/analyze?prompt=${encodeURIComponent(prompt)}&context=${encodeURIComponent(context)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const result = await res.json();
      setLastResponse(result); // Save the response to show the user

      // Add new point to graph
      const newPoint = {
        time: new Date().toLocaleTimeString(),
        latency: result.latency,
        score: result.metrics.score * 100 // Convert 0.8 to 80%
      };

      setData(prev => [...prev.slice(-19), newPoint]); // Keep last 20 points
      
      // Update summary stats
      setMetrics(prev => ({
        total_requests: prev.total_requests + 1,
        avg_latency: Math.round((prev.avg_latency * prev.total_requests + result.latency) / (prev.total_requests + 1)),
        hallucination_rate: result.metrics.status === "HALLUCINATION" ? prev.hallucination_rate + 1 : prev.hallucination_rate
      }));

    } catch (err) {
      console.error("Failed to analyze:", err);
      alert("Error connecting to backend. Is Docker running?");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-mono">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-700 pb-4">
        <div className="flex items-center gap-2">
          <Activity className="text-blue-400" />
          <h1 className="text-2xl font-bold tracking-wider text-blue-400">LUMINA <span className="text-white text-sm opacity-50">OBSERVABILITY</span></h1>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-900/30 rounded border border-green-800 text-green-400">
            <Server size={14} /> SYSTEM ONLINE
          </div>
        </div>
      </div>

      {/* INPUT SECTION (NEW) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <Terminal size={18} /> LIVE INFERENCE
          </h2>
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">PROMPT</label>
              <textarea 
                className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-sm focus:border-blue-500 focus:outline-none text-white h-24"
                placeholder="e.g. Explain Quantum Physics..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">EXPECTED CONTEXT</label>
              <input 
                type="text" 
                className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-sm focus:border-blue-500 focus:outline-none text-white"
                placeholder="e.g. Science"
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-2 px-4 rounded font-bold flex items-center justify-center gap-2 transition-all ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
            >
              {loading ? "PROCESSING..." : <><Play size={16} /> RUN ANALYSIS</>}
            </button>
          </form>
        </div>

        {/* LATEST RESULT CARD */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg relative overflow-hidden">
          <h2 className="text-lg font-bold mb-4 text-white">LATEST TRACE</h2>
          {lastResponse ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex gap-4">
                 <div className={`px-3 py-1 rounded text-xs font-bold border ${lastResponse.metrics.status === 'HEALTHY' ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-red-900/30 border-red-700 text-red-400'}`}>
                    {lastResponse.metrics.status}
                 </div>
                 <div className="px-3 py-1 rounded text-xs font-bold bg-blue-900/30 border border-blue-700 text-blue-400">
                    SCORE: {(lastResponse.metrics.score * 100).toFixed(1)}%
                 </div>
                 <div className="px-3 py-1 rounded text-xs font-bold bg-purple-900/30 border border-purple-700 text-purple-400">
                    LATENCY: {lastResponse.latency}ms
                 </div>
              </div>
              <div className="p-4 bg-gray-900/50 rounded border border-gray-700 font-mono text-sm text-gray-300 leading-relaxed">
                {/* Shows the first 300 chars of the response */}
                 {lastResponse.metrics.generated_text || "Analysis complete."}
              </div>
            </div>
          ) : (
             <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                Waiting for input...
             </div>
          )}
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">TOTAL REQUESTS</p>
              <h3 className="text-3xl font-bold text-white mt-1">{metrics.total_requests}</h3>
            </div>
            <Activity className="text-blue-500 opacity-80" size={32} />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">AVG LATENCY</p>
              <h3 className="text-3xl font-bold text-white mt-1">{metrics.avg_latency} <span className="text-sm text-gray-500">ms</span></h3>
            </div>
            <ShieldCheck className="text-green-500 opacity-80" size={32} />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">HALLUCINATIONS</p>
              <h3 className="text-3xl font-bold text-red-400 mt-1">{metrics.hallucination_rate}</h3>
            </div>
            <AlertTriangle className="text-orange-500 opacity-80" size={32} />
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
          <h3 className="text-gray-200 font-bold mb-4">Semantic Consistency Score</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" tick={{fontSize: 12}} />
                <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#fff' }}
                />
                <Line type="monotone" dataKey="score" stroke="#60A5FA" strokeWidth={2} dot={{fill: '#60A5FA'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
          <h3 className="text-gray-200 font-bold mb-4">System Latency (ms)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" tick={{fontSize: 12}} />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#fff' }}
                />
                <Line type="monotone" dataKey="latency" stroke="#34D399" strokeWidth={2} dot={{fill: '#34D399'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;