import React, { useState, useEffect } from 'react';
import {
  Search,
  AlertTriangle,
  RefreshCw,
  QrCode,
  X
} from 'lucide-react';
import { apiRequest } from '../../lib/api.js';
import { Sample, SampleRejectionReason } from '@lab/contracts';

export function SamplesPage() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSample, setSelectedSample] = useState<any | null>(null);

  // Reject Modal State
  const [sampleToReject, setSampleToReject] = useState<Sample | null>(null);
  const [rejectionReason, setRejectionReason] = useState<SampleRejectionReason>('hemolyzed');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Recollect Modal State
  const [sampleToRecollect, setSampleToRecollect] = useState<Sample | null>(null);
  const [recollectReason, setRecollectReason] = useState('');
  const [recollecting, setRecollecting] = useState(false);

  const fetchSamples = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('query', searchQuery);

      const res = await apiRequest<{ items: Sample[]; total: number }>(`/samples?${params.toString()}`);
      setSamples(res.items);
    } catch (err) {
      console.error('Failed to load samples', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSamples();
  }, [statusFilter, searchQuery]);

  const handleCollect = async (id: string) => {
    try {
      await apiRequest(`/samples/${id}/collect`, {
        method: 'POST',
        body: JSON.stringify({ notes: 'Collected at phlebotomy counter' })
      });
      fetchSamples();
    } catch (err: any) {
      alert(err.message || 'Error collecting sample');
    }
  };

  const handleReceive = async (id: string) => {
    try {
      await apiRequest(`/samples/${id}/receive`, {
        method: 'POST',
        body: JSON.stringify({ notes: 'Specimen verified and accessioned in central lab' })
      });
      fetchSamples();
    } catch (err: any) {
      alert(err.message || 'Error receiving sample');
    }
  };

  const handleProcess = async (id: string) => {
    try {
      await apiRequest(`/samples/${id}/process`, {
        method: 'POST',
        body: JSON.stringify({ notes: 'Specimen transferred to automated analyzer rack' })
      });
      fetchSamples();
    } catch (err: any) {
      alert(err.message || 'Error processing sample');
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sampleToReject) return;

    try {
      setRejecting(true);
      await apiRequest(`/samples/${sampleToReject.id}/reject`, {
        method: 'POST',
        body: JSON.stringify({
          reason: rejectionReason,
          notes: rejectionNotes
        })
      });
      setSampleToReject(null);
      setRejectionNotes('');
      fetchSamples();
    } catch (err: any) {
      alert(err.message || 'Error rejecting sample');
    } finally {
      setRejecting(false);
    }
  };

  const handleConfirmRecollect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sampleToRecollect) return;

    try {
      setRecollecting(true);
      await apiRequest(`/samples/${sampleToRecollect.id}/recollect`, {
        method: 'POST',
        body: JSON.stringify({
          reason: recollectReason || 'Recollection requested following specimen rejection'
        })
      });
      setSampleToRecollect(null);
      setRecollectReason('');
      fetchSamples();
    } catch (err: any) {
      alert(err.message || 'Error creating replacement sample');
    } finally {
      setRecollecting(false);
    }
  };

  const handleInspect = async (id: string) => {
    try {
      const full = await apiRequest<any>(`/samples/${id}`);
      setSelectedSample(full);
    } catch (err: any) {
      alert('Failed to load sample details: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Sample Accessioning & Tracking</h2>
          <p className="text-sm text-slate-500">Phlebotomy collection queue, laboratory accessioning, specimen rejection, and recollection</p>
        </div>
      </div>

      {/* Queues & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
          {[
            { id: 'all', label: 'All Queues' },
            { id: 'pending', label: '1. Pending Collection' },
            { id: 'collected', label: '2. Collected (In Transit)' },
            { id: 'received', label: '3. Received (Accessioned)' },
            { id: 'processing', label: '4. Processing' },
            { id: 'rejected', label: 'Rejection Log' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === tab.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Barcode, Patient, or Order #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Samples Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Barcode / Tube</th>
                <th className="py-3 px-4">Order # / Patient</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Chain of Custody</th>
                <th className="py-3 px-4 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">Loading samples...</td>
                </tr>
              ) : samples.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No specimen records in this queue.
                  </td>
                </tr>
              ) : (
                samples.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-slate-400" />
                        <span className="font-mono font-bold text-slate-900">{s.barcode}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{s.sampleType}</div>
                      {s.replacesSampleId && (
                        <span className="inline-block text-[10px] bg-purple-50 text-purple-700 font-semibold px-1.5 py-0.2 rounded border border-purple-200 mt-1">
                          Replacement Sample
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{s.patientName}</div>
                      <div className="text-xs font-mono text-slate-400">{s.orderNumber} ({s.patientMrn})</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        s.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : s.status === 'collected'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : s.status === 'received'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : s.status === 'processing'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : s.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {s.status === 'rejected' && <AlertTriangle className="w-3 h-3" />}
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {s.collectedAt ? (
                        <div>Collected: {new Date(s.collectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      ) : (
                        <div className="text-slate-400">Awaiting phlebotomy</div>
                      )}
                      {s.receivedAt && (
                        <div>Accessioned: {new Date(s.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleInspect(s.id)}
                        className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                      >
                        History
                      </button>

                      {s.status === 'pending' && (
                        <button
                          onClick={() => handleCollect(s.id)}
                          className="px-3 py-1 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition shadow-sm"
                        >
                          Collect
                        </button>
                      )}

                      {s.status === 'collected' && (
                        <button
                          onClick={() => handleReceive(s.id)}
                          className="px-3 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm"
                        >
                          Receive
                        </button>
                      )}

                      {s.status === 'received' && (
                        <button
                          onClick={() => handleProcess(s.id)}
                          className="px-3 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-sm"
                        >
                          Process
                        </button>
                      )}

                      {['pending', 'collected', 'received', 'processing'].includes(s.status) && (
                        <button
                          onClick={() => setSampleToReject(s)}
                          className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          Reject
                        </button>
                      )}

                      {s.status === 'rejected' && (
                        <button
                          onClick={() => setSampleToRecollect(s)}
                          className="px-3 py-1 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition shadow-sm flex-inline items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3 inline mr-1" />
                          Recollect
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Sample Modal */}
      {sampleToReject && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Reject Specimen</span>
              </h3>
              <button
                onClick={() => setSampleToReject(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4 pt-4">
              <p className="text-xs text-slate-600">
                Rejecting specimen <strong className="font-mono text-slate-800">{sampleToReject.barcode}</strong> ({sampleToReject.sampleType}).
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Standardized Rejection Reason</label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none capitalize"
                >
                  <option value="hemolyzed">Hemolyzed specimen</option>
                  <option value="clotted">Clotted (EDTA / anticoagulated blood)</option>
                  <option value="insufficient_volume">Insufficient volume (QNS)</option>
                  <option value="improper_container">Improper tube / container</option>
                  <option value="mislabelled">Mislabelled / discrepancy</option>
                  <option value="contaminated">Contaminated container</option>
                  <option value="temperature_compromised">Temperature compromised</option>
                  <option value="other">Other reason</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Laboratory Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional context for phlebotomy or recollection..."
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSampleToReject(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejecting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition disabled:opacity-50"
                >
                  {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recollect Sample Modal */}
      {sampleToRecollect && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-purple-700 flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                <span>Issue Specimen Recollection</span>
              </h3>
              <button
                onClick={() => setSampleToRecollect(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmRecollect} className="space-y-4 pt-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                This will create a new <strong className="text-purple-700">replacement sample barcode</strong> chained to rejected sample <strong className="font-mono">{sampleToRecollect.barcode}</strong>, keeping all prior rejection logs intact.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recollection Instructions / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please redraw fresh 3mL EDTA tube without hemolysis"
                  value={recollectReason}
                  onChange={(e) => setRecollectReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSampleToRecollect(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recollecting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition disabled:opacity-50"
                >
                  {recollecting ? 'Issuing...' : 'Create Replacement Barcode'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Sample Chain of Custody */}
      {selectedSample && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 animate-in fade-in duration-150 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold border border-slate-200">
                  {selectedSample.barcode}
                </span>
                <h3 className="font-bold text-slate-800 text-base mt-1">Chain of Custody & Event Log</h3>
              </div>
              <button
                onClick={() => setSelectedSample(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedSample.events?.map((ev: any) => (
                <div key={ev.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800 capitalize">
                      {ev.fromStatus ? `${ev.fromStatus} → ${ev.toStatus}` : `Created (${ev.toStatus})`}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(ev.occurredAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    By: <strong className="font-medium text-slate-700">{ev.actorName || 'System'}</strong>
                  </div>
                  {ev.notes && <div className="text-slate-500 italic mt-1 text-[11px]">{ev.notes}</div>}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedSample(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
