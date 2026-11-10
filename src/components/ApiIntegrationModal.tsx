import React, { useState } from 'react';
import { CarparkService } from '../services/carparkService';
import {
  X,
  Code2,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Send,
  Database,
  Server,
  Zap,
} from 'lucide-react';

interface ApiIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEndpointUpdated: () => void;
}

export const ApiIntegrationModal: React.FC<ApiIntegrationModalProps> = ({
  isOpen,
  onClose,
  onEndpointUpdated,
}) => {
  const [endpointUrl, setEndpointUrl] = useState<string>(CarparkService.getCustomEndpoint());
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    setTesting(true);
    setTestResult(null);

    CarparkService.setCustomEndpoint(endpointUrl);
    onEndpointUpdated();

    if (!endpointUrl.trim()) {
      setTestResult({
        success: true,
        message: 'Endpoint cleared. Reset to high-fidelity live simulation stream.',
      });
      setTesting(false);
      return;
    }

    const result = await CarparkService.fetchFromBackend(endpointUrl.trim());
    setTestResult(result);
    setTesting(false);
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(key);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const EXPRESS_PROXY_SNIPPET = `// server.ts - Example Express Proxy for Data.gov.sg or LTA DataMall
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Real-Time HDB Carpark Availability Proxy
app.get('/api/carpark-availability', async (req, res) => {
  try {
    const response = await fetch(
      'https://api.data.gov.sg/v1/transport/carpark-availability',
      { headers: { 'Accept': 'application/json' } }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch carpark telemetry' });
  }
});

// LTA DataMall v2 Carpark Availability Proxy
app.get('/api/lta/carparks', async (req, res) => {
  try {
    const response = await fetch(
      'http://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
      {
        headers: {
          'AccountKey': process.env.LTA_DATAMALL_KEY || '',
          'accept': 'application/json'
        }
      }
    );
    const data = await response.json();
    res.json(data.value);
  } catch (error) {
    res.status(500).json({ error: 'LTA API proxy error' });
  }
});`;

  const CLIENT_CONTRACT_SNIPPET = `// Expected JSON Contract for Data.gov.sg:
{
  "items": [
    {
      "timestamp": "2026-11-09T19:30:00+08:00",
      "carpark_data": [
        {
          "carpark_number": "ACB",
          "update_datetime": "2026-11-09T19:28:42",
          "carpark_info": [
            {
              "total_lots": "450",
              "lot_type": "C",
              "lots_available": "112"
            }
          ]
        }
      ]
    }
  ]
}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Backend Connection Studio</h2>
              <p className="text-xs text-slate-400">
                Seamlessly wire your real Singapore Carpark API or Node.js server
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          {/* Current Status banner */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-100 text-sm mb-0.5">
                Frontend Architecture: Decoupled &amp; API-Ready
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                The frontend currently operates in standalone high-fidelity mode with real Singapore coordinates, authentic HDB/URA/Commercial rate formulas, and real-time vehicle entry/exit simulation. When you're ready to integrate your backend, plug your proxy endpoint below.
              </p>
            </div>
          </div>

          {/* Test Bench Input */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/80 space-y-3">
            <label className="block text-xs font-semibold text-slate-200">
              Custom Backend API Endpoint URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
                placeholder="e.g. /api/carpark-availability or http://localhost:5000/api/carparks"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                onClick={handleSaveAndTest}
                disabled={testing}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                {testing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{testing ? 'Testing...' : 'Save & Test Ping'}</span>
              </button>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400">Project Endpoints:</span>
              <button
                type="button"
                onClick={() => {
                  setEndpointUrl('/api/carparkavailability');
                }}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-mono cursor-pointer"
              >
                /api/carparkavailability
              </button>
              <button
                type="button"
                onClick={async () => {
                  setTesting(true);
                  try {
                    const res = await fetch('/api/health');
                    const healthData = await res.json();
                    setTestResult({
                      success: true,
                      message: `Health check: ${healthData.status} (Uptime: ${healthData.uptimeSeconds}s). LTA AccountKey configured: ${healthData.ltaDataMall?.accountKeyConfigured ? 'Yes' : 'No (Pending user key)'}.`,
                    });
                  } catch (e: any) {
                    setTestResult({
                      success: false,
                      message: `Health check failed: ${e.message}`,
                    });
                  } finally {
                    setTesting(false);
                  }
                }}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-mono cursor-pointer"
              >
                Test /api/health
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">{testResult.success ? 'Connection Validated' : 'Connection Error'}</div>
                  <div>{testResult.message}</div>
                </div>
              </div>
            )}
          </div>

          {/* Integration Blueprint Snippets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Backend Proxy Implementation Guide</span>
              </h3>
              <a
                href="https://beta.data.gov.sg/collections/13/datasets/d_06ff0d55e0c50d3dd32155d3148102a0/view"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>Data.gov.sg API Docs</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Code Snippet 1 */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
              <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px]">
                <span className="font-mono text-slate-400">Express / Node.js Backend Route</span>
                <button
                  onClick={() => handleCopy('express', EXPRESS_PROXY_SNIPPET)}
                  className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedSnippet === 'express' ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-[11px] font-mono text-slate-300 leading-relaxed">
                {EXPRESS_PROXY_SNIPPET}
              </pre>
            </div>

            {/* Code Snippet 2 */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
              <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px]">
                <span className="font-mono text-slate-400">Supported Carpark Availability JSON Schema</span>
                <button
                  onClick={() => handleCopy('schema', CLIENT_CONTRACT_SNIPPET)}
                  className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedSnippet === 'schema' ? 'Copied!' : 'Copy Schema'}</span>
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-[11px] font-mono text-slate-300 leading-relaxed">
                {CLIENT_CONTRACT_SNIPPET}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
