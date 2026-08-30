import React, { useEffect, useState, useRef } from 'react';
import { fetchAgencyPatterns, fetchRelationshipGraph } from '../services/api';
import { Network, AlertTriangle, Building2, ChevronRight, X, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PatternIntelligence() {
  const [agencies, setAgencies] = useState([]);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [aData, gData] = await Promise.all([
          fetchAgencyPatterns(),
          fetchRelationshipGraph()
        ]);
        setAgencies(aData);
        setGraphData(gData);
      } catch (err) {
        console.error('Error fetching pattern intelligence:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Canvas interactive network graph renderer
  useEffect(() => {
    if (!graphData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Position nodes radially/grid
    const nodes = (graphData.nodes || []).map((n, i) => {
      const angle = (i / (graphData.nodes.length || 1)) * 2 * Math.PI;
      const isAgency = n.group === 'AGENCY' || n.group === 'Agency';
      const radius = isAgency ? 90 : 180;
      const cx = width / 2 + Math.cos(angle) * radius;
      const cy = height / 2 + Math.sin(angle) * radius;
      const nodeSize = n.size || (isAgency ? 24 : 16);
      return { ...n, size: nodeSize, x: cx, y: cy };
    });

    // Draw network graph
    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Draw Edges
      (graphData.edges || []).forEach(e => {
        const fromNode = nodes.find(n => n.id === e.from);
        const toNode = nodes.find(n => n.id === e.to);
        if (fromNode && toNode) {
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(toNode.x, toNode.y);
          ctx.strokeStyle = e.color || '#cbd5e1';
          ctx.lineWidth = e.width || 1.5;
          if (e.dashes) ctx.setLineDash([4, 4]);
          else ctx.setLineDash([]);
          ctx.stroke();

          // Edge label
          if (e.label) {
            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2;
            ctx.fillStyle = '#64748b';
            ctx.font = '9px Inter, sans-serif';
            ctx.fillText(e.label, midX, midY);
          }
        }
      });

      // Draw Nodes
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, 2 * Math.PI);
        ctx.fillStyle = n.color || '#3b82f6';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Node Label
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 10px Inter, sans-serif';
        const labelText = (n.label || n.id || '').split('\n')[0];
        ctx.fillText(labelText, n.x - 30, n.y + n.size + 14);
      });
    }

    draw();

    // Click handler for canvas nodes
    const handleCanvasClick = (evt) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = (evt.clientX - rect.left) * (width / rect.width);
      const clickY = (evt.clientY - rect.top) * (height / rect.height);

      const clicked = nodes.find(n => {
        const dx = n.x - clickX;
        const dy = n.y - clickY;
        return Math.sqrt(dx * dx + dy * dy) <= n.size + 5;
      });

      if (clicked) {
        setSelectedNode(clicked);
      }
    };

    canvas.addEventListener('click', handleCanvasClick);
    return () => canvas.removeEventListener('click', handleCanvasClick);

  }, [graphData]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Analyzing Cross-Project Patterns...</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Network className="w-5 h-5 text-slate-800" />
            Cross-Project Pattern Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Identify recurring contractor anomalies, agency risk density, and systemic risk clusters
          </p>
        </div>
      </div>

      {/* Agency Pattern Cards */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          IMPLEMENTING AGENCY ANOMALY OVERVIEW
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Array.isArray(agencies) ? agencies : []).map((a, idx) => {
            const highRiskCount = typeof a.high_risk_projects === 'number' ? a.high_risk_projects : (Array.isArray(a.high_risk_projects) ? a.high_risk_projects.length : 0);
            const findingsList = Array.isArray(a.findings) ? a.findings : [];

            return (
              <div key={a.agency_id || a.id || idx} className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{a.agency_type || 'Implementing Agency'}</span>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight mt-0.5">{a.agency_name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold bg-red-100 text-red-900 px-2 py-0.5 rounded border border-red-200">
                      {a.pattern_risk_score || 0} / 100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-medium bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div>Total Works: <b>{a.total_projects || 0}</b></div>
                  <div className="text-red-700 font-semibold">High Risk: <b>{highRiskCount}</b></div>
                  <div>Cost Deviation: <b>{a.cost_deviation_cases || 0}</b></div>
                  <div>Delays: <b>{a.delay_cases || 0}</b></div>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Pattern Findings:</span>
                  {findingsList.map((f, i) => (
                    <p key={i} className="text-slate-700 text-[11px] font-medium leading-tight flex items-start gap-1">
                      <span className="text-red-600 font-bold">•</span> {f}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Relationship Graph Canvas */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              INTERACTIVE RELATIONSHIP GRAPH
            </h2>
            <p className="text-xs text-slate-500">Visualizing network linkages between agencies, active projects, and duplicate overlaps</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-800" /> Agency Node</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Critical Project</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High Risk Project</span>
          </div>
        </div>

        <div className="relative w-full h-[450px] bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={850}
            height={450}
            className="w-full h-full cursor-pointer"
          />

          {/* Node detail inspector panel */}
          {selectedNode && (
            <div className="absolute top-4 right-4 bg-slate-900 text-white rounded-lg p-4 shadow-xl border border-slate-700 w-72 text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-300 uppercase">{selectedNode.group} Details</span>
                <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <h4 className="font-extrabold text-sm text-white">{selectedNode.label}</h4>
              {selectedNode.details && (
                <div className="space-y-1 text-[11px] text-slate-300">
                  {selectedNode.details.cost && <p>Cost: ₹{selectedNode.details.cost} Lakh</p>}
                  {selectedNode.details.progress && <p>Physical Progress: {selectedNode.details.progress}%</p>}
                  {selectedNode.details.risk && <p className="font-bold text-red-400">Risk Score: {selectedNode.details.risk}/100</p>}
                </div>
              )}
              {selectedNode.group === 'Project' && (
                <button
                  onClick={() => navigate(`/projects/${selectedNode.label.split(' ')[0]}`)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold py-1 rounded mt-2 text-center"
                >
                  Open Project Intelligence →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
