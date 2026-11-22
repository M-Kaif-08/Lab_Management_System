import React, { useState, useEffect } from 'react';
import { Building2, Save, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../../lib/api.js';
import { LabProfile } from '@lab/contracts';

export function SettingsPage() {
  const [profile, setProfile] = useState<LabProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await apiRequest<LabProfile>('/lab/profile');
        setProfile(data);
      } catch (err) {
        console.error('Failed to load lab profile', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      setSaving(true);
      setSuccess(false);
      const updated = await apiRequest<LabProfile>('/lab/profile', {
        method: 'PUT',
        body: JSON.stringify(profile)
      });
      setProfile(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" /> Lab Configuration & Branding
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Customize your lab identity, address, and report header/footers</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
        {success && (
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg flex items-center gap-2 text-sm text-teal-800">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            <span>Lab settings updated successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Laboratory Name *</label>
            <input
              type="text"
              required
              value={profile?.name || ''}
              onChange={(e) => setProfile(p => p ? { ...p, name: e.target.value } : null)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tagline</label>
            <input
              type="text"
              value={profile?.tagline || ''}
              onChange={(e) => setProfile(p => p ? { ...p, tagline: e.target.value } : null)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Contact Phone *</label>
            <input
              type="text"
              required
              value={profile?.phone || ''}
              onChange={(e) => setProfile(p => p ? { ...p, phone: e.target.value } : null)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              onChange={(e) => setProfile(p => p ? { ...p, email: e.target.value } : null)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Currency Code</label>
            <input
              type="text"
              value={profile?.currency || 'PKR'}
              onChange={(e) => setProfile(p => p ? { ...p, currency: e.target.value } : null)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Address *</label>
            <input
              type="text"
              required
              value={profile?.address || ''}
              onChange={(e) => setProfile(p => p ? { ...p, address: e.target.value } : null)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">City *</label>
            <input
              type="text"
              required
              value={profile?.city || ''}
              onChange={(e) => setProfile(p => p ? { ...p, city: e.target.value } : null)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Report Header Notice</label>
          <textarea
            rows={2}
            value={profile?.reportHeader || ''}
            onChange={(e) => setProfile(p => p ? { ...p, reportHeader: e.target.value } : null)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Report Footer Disclaimer</label>
          <textarea
            rows={2}
            value={profile?.reportFooter || ''}
            onChange={(e) => setProfile(p => p ? { ...p, reportFooter: e.target.value } : null)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
