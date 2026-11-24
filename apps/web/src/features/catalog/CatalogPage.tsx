import React, { useState, useEffect } from 'react';
import { Search, Plus, Layers, FlaskConical, X, ChevronRight, Clock, Tag } from 'lucide-react';
import { apiRequest } from '../../lib/api.js';
import { TestCatalogItem, Panel, CreateTestCatalogItem } from '@lab/contracts';

export function CatalogPage() {
  const [activeTab, setActiveTab] = useState<'tests' | 'panels'>('tests');
  const [tests, setTests] = useState<TestCatalogItem[]>([]);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTest, setSelectedTest] = useState<TestCatalogItem | null>(null);

  // New Test Modal State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [newTest, setNewTest] = useState<CreateTestCatalogItem>({
    code: '',
    name: '',
    department: 'Hematology',
    sampleType: 'EDTA Whole Blood',
    price: 500,
    turnaroundHours: 12,
    isActive: true
  });
  const [savingTest, setSavingTest] = useState(false);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const [testsRes, panelsRes] = await Promise.all([
        apiRequest<{ items: TestCatalogItem[]; total: number }>(`/catalog/tests?query=${encodeURIComponent(searchQuery)}`),
        apiRequest<Panel[]>('/catalog/panels')
      ]);
      setTests(testsRes.items);
      setPanels(panelsRes);
    } catch (err) {
      console.error('Failed to load catalog', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [searchQuery]);

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingTest(true);
      await apiRequest('/catalog/tests', {
        method: 'POST',
        body: JSON.stringify(newTest)
      });
      setIsTestModalOpen(false);
      setNewTest({
        code: '',
        name: '',
        department: 'Hematology',
        sampleType: 'EDTA Whole Blood',
        price: 500,
        turnaroundHours: 12,
        isActive: true
      });
      fetchCatalog();
    } catch (err: any) {
      alert(err.message || 'Failed to create test');
    } finally {
      setSavingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Test Catalog & Panels</h2>
          <p className="text-sm text-slate-500">Configure laboratory test parameters, reference ranges, specimen tubes, and pricing</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsTestModalOpen(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Test</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'tests' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Individual Tests ({tests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('panels')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'panels' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Panels & Profiles ({panels.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by code, test, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading catalog items...</div>
      ) : activeTab === 'tests' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Test List Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Code / Test Name</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Sample Type</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">TAT</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {tests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No tests match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    tests.map((test) => (
                      <tr
                        key={test.id}
                        onClick={() => setSelectedTest(test)}
                        className={`hover:bg-teal-50/40 cursor-pointer transition ${
                          selectedTest?.id === test.id ? 'bg-teal-50/70' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <span className="font-mono text-xs px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 mr-2 border border-slate-200">
                            {test.code}
                          </span>
                          {test.name}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">{test.department}</td>
                        <td className="py-3.5 px-4 text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/50">
                            {test.sampleType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          PKR {Number(test.price).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 flex items-center gap-1 pt-4">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {test.turnaroundHours}h
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTest(test);
                            }}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-teal-700"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Test Parameters & Ranges Inspector */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Test Details & Parameters</span>
              {selectedTest && (
                <span className="text-[11px] font-mono px-2 py-0.5 bg-teal-50 text-teal-700 rounded border border-teal-200">
                  {selectedTest.code}
                </span>
              )}
            </h3>

            {!selectedTest ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Select a test from the table to inspect its reporting parameters and reference ranges.
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 text-base">{selectedTest.name}</h4>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-slate-500">{selectedTest.department}</span>
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs text-teal-700 font-medium">PKR {Number(selectedTest.price).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Reporting Parameters ({selectedTest.parameters?.length || 0})
                  </div>
                  {(!selectedTest.parameters || selectedTest.parameters.length === 0) ? (
                    <p className="text-xs text-slate-400 italic">No sub-parameters configured for this test.</p>
                  ) : (
                    selectedTest.parameters.map((param) => (
                      <div key={param.id || param.name} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                        <div className="flex justify-between font-semibold text-slate-800">
                          <span>{param.name}</span>
                          <span className="font-mono text-[11px] text-slate-500">{param.unit || 'No unit'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex gap-2">
                          <span>Type: <strong className="font-medium text-slate-700">{param.resultType}</strong></span>
                        </div>
                        {param.ranges && param.ranges.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 space-y-1">
                            <span className="font-medium text-slate-700 block">Biological Reference Intervals:</span>
                            {param.ranges.map((r, idx) => (
                              <div key={idx} className="flex justify-between bg-white px-2 py-1 rounded border border-slate-200/50">
                                <span className="capitalize">{r.gender}:</span>
                                <span className="font-mono text-slate-800">
                                  {r.normalLow !== null && r.normalHigh !== null
                                    ? `${r.normalLow} - ${r.normalHigh} ${param.unit || ''}`
                                    : r.normalText || 'Normal'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Panels List View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {panels.length === 0 ? (
            <div className="col-span-3 p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-400">
              No diagnostic panels configured.
            </div>
          ) : (
            panels.map((panel) => (
              <div key={panel.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs px-2 py-0.5 bg-amber-50 text-amber-800 rounded font-bold border border-amber-200">
                      {panel.code}
                    </span>
                    <h3 className="font-bold text-slate-800 text-base mt-2">{panel.name}</h3>
                  </div>
                  <span className="font-bold text-teal-700 text-base">
                    PKR {Number(panel.price || 0).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {panel.description || 'Bundled diagnostic panel with atomic specimen collection.'}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Included Tests ({panel.items?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {panel.items?.map((item: any) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-1 bg-slate-100 text-slate-700 rounded-md font-medium border border-slate-200/60"
                      >
                        <Tag className="w-3 h-3 text-slate-400" />
                        {item.testName || item.testCode}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* New Test Modal */}
      {isTestModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 animate-in fade-in duration-150">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Create New Catalog Test</h3>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Test Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CBC, FBS, LFT"
                    value={newTest.code}
                    onChange={(e) => setNewTest({ ...newTest, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm uppercase font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={newTest.department}
                    onChange={(e) => setNewTest({ ...newTest, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Hematology">Hematology</option>
                    <option value="Chemical Pathology">Chemical Pathology</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Immunology">Immunology</option>
                    <option value="Molecular">Molecular</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Test Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Blood Count"
                  value={newTest.name}
                  onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Specimen Tube / Type</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EDTA Whole Blood, Serum"
                    value={newTest.sampleType}
                    onChange={(e) => setNewTest({ ...newTest, sampleType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newTest.price}
                    onChange={(e) => setNewTest({ ...newTest, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Turnaround Time (Hours)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newTest.turnaroundHours}
                  onChange={(e) => setNewTest({ ...newTest, turnaroundHours: parseInt(e.target.value) || 24 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTest}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  {savingTest ? 'Saving...' : 'Save Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
