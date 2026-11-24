import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { apiRequest } from '../../lib/api.js';

interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  ipAddress: string | null;
}

export function AuditPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const response = await apiRequest<{ items: AuditLogItem[] }>('/audit');
        setLogs(response.items);
      } catch (err) {
        console.error('Failed to load audit logs', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" /> Security & Audit Trail
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Immutable record of security events and medical record changes</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Entity Type</th>
              <th className="py-3 px-4">Target ID</th>
              <th className="py-3 px-4">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">Loading audit trail...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">No audit events recorded yet.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-xs font-mono text-slate-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-teal-700">
                    <span className="px-2 py-0.5 bg-teal-50 border border-teal-200 rounded text-xs font-mono">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 capitalize text-slate-700">{log.entityType}</td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">{log.entityId || '—'}</td>
                  <td className="py-3 px-4 text-xs text-slate-400">{log.ipAddress || 'local'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
