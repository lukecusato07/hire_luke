import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink, RefreshCw, Download, Upload } from 'lucide-react';
import './index.css';

const App = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Load jobs from storage on mount
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const result = await window.storage.get('job-tracker-data');
      if (result && result.value) {
        setJobs(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('No existing jobs found, starting fresh');
    } finally {
      setLoading(false);
    }
  };

  const saveJobs = async (updatedJobs) => {
    try {
      await window.storage.set('job-tracker-data', JSON.stringify(updatedJobs));
      setJobs(updatedJobs);
    } catch (error) {
      console.error('Error saving jobs:', error);
      alert('Failed to save jobs. Please try again.');
    }
  };

  const simulateScrape = async () => {
    setScraping(true);
    // Simulate scraping delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const scrapedJobs = [
      {
        id: Date.now() + 1,
        company: 'Google',
        title: 'Software Engineer, New Grad',
        location: 'Mountain View, CA',
        pay: '$130,000 - $160,000',
        link: 'https://careers.google.com/jobs/example',
        status: 'Not Applied',
        notes: '',
        dateAdded: new Date().toISOString()
      },
      {
        id: Date.now() + 2,
        company: 'Meta',
        title: 'Software Engineer, University Grad',
        location: 'Menlo Park, CA',
        pay: '$125,000 - $155,000',
        link: 'https://www.metacareers.com/jobs/example',
        status: 'Not Applied',
        notes: '',
        dateAdded: new Date().toISOString()
      },
      {
        id: Date.now() + 3,
        company: 'Amazon',
        title: 'SDE I - New Grad',
        location: 'Seattle, WA',
        pay: '$115,000 - $140,000',
        link: 'https://amazon.jobs/en/jobs/example',
        status: 'Not Applied',
        notes: '',
        dateAdded: new Date().toISOString()
      },
      {
        id: Date.now() + 4,
        company: 'Microsoft',
        title: 'Software Engineer',
        location: 'Redmond, WA',
        pay: '$120,000 - $150,000',
        link: 'https://careers.microsoft.com/example',
        status: 'Not Applied',
        notes: '',
        dateAdded: new Date().toISOString()
      },
      {
        id: Date.now() + 5,
        company: 'Apple',
        title: 'Software Engineer, Entry Level',
        location: 'Cupertino, CA',
        pay: '$125,000 - $155,000',
        link: 'https://jobs.apple.com/example',
        status: 'Not Applied',
        notes: '',
        dateAdded: new Date().toISOString()
      }
    ];

    // Merge with existing jobs, avoiding duplicates
    const existingLinks = new Set(jobs.map(j => j.link));
    const newJobs = scrapedJobs.filter(j => !existingLinks.has(j.link));
    const merged = [...jobs, ...newJobs];
    
    await saveJobs(merged);
    setScraping(false);
    alert(`Added ${newJobs.length} new jobs!`);
  };

  const addManualJob = async () => {
    const newJob = {
      id: Date.now(),
      company: '',
      title: '',
      location: '',
      pay: '',
      link: '',
      status: 'Not Applied',
      notes: '',
      dateAdded: new Date().toISOString()
    };
    const updated = [newJob, ...jobs];
    await saveJobs(updated);
    setEditingId(newJob.id);
  };

  const updateJob = async (id, field, value) => {
    const updated = jobs.map(job =>
      job.id === id ? { ...job, [field]: value } : job
    );
    await saveJobs(updated);
  };

  const deleteJob = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      const updated = jobs.filter(job => job.id !== id);
      await saveJobs(updated);
    }
  };

  const exportToCSV = () => {
    const headers = ['Company', 'Job Title', 'Location', 'Pay', 'Application Link', 'Status', 'Notes', 'Date Added'];
    const rows = jobs.map(job => [
      job.company,
      job.title,
      job.location,
      job.pay,
      job.link,
      job.status,
      job.notes,
      new Date(job.dateAdded).toLocaleDateString()
    ]);
    
    const csv = [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-applications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const clearAllData = async () => {
    if (window.confirm('Are you sure you want to delete ALL jobs? This cannot be undone.')) {
      await saveJobs([]);
    }
  };

  const statusOptions = ['Not Applied', 'Applied', 'Interview', 'Offer', 'Rejected'];
  const statusColors = {
    'Not Applied': 'bg-gray-100 text-gray-700',
    'Applied': 'bg-blue-100 text-blue-700',
    'Interview': 'bg-yellow-100 text-yellow-700',
    'Offer': 'bg-green-100 text-green-700',
    'Rejected': 'bg-red-100 text-red-700'
  };

  const filteredJobs = filterStatus === 'all' 
    ? jobs 
    : jobs.filter(job => job.status === filterStatus);

  const stats = {
    total: jobs.length,
    notApplied: jobs.filter(j => j.status === 'Not Applied').length,
    applied: jobs.filter(j => j.status === 'Applied').length,
    interview: jobs.filter(j => j.status === 'Interview').length,
    offer: jobs.filter(j => j.status === 'Offer').length,
    rejected: jobs.filter(j => j.status === 'Rejected').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading your jobs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🎯 Job Application Tracker</h1>
          <p className="text-gray-600">Track your new grad software engineering applications</p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-4">
            <div className="bg-gray-50 rounded p-3 text-center">
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="bg-gray-100 rounded p-3 text-center">
              <div className="text-2xl font-bold text-gray-700">{stats.notApplied}</div>
              <div className="text-xs text-gray-600">Not Applied</div>
            </div>
            <div className="bg-blue-100 rounded p-3 text-center">
              <div className="text-2xl font-bold text-blue-700">{stats.applied}</div>
              <div className="text-xs text-blue-600">Applied</div>
            </div>
            <div className="bg-yellow-100 rounded p-3 text-center">
              <div className="text-2xl font-bold text-yellow-700">{stats.interview}</div>
              <div className="text-xs text-yellow-600">Interview</div>
            </div>
            <div className="bg-green-100 rounded p-3 text-center">
              <div className="text-2xl font-bold text-green-700">{stats.offer}</div>
              <div className="text-xs text-green-600">Offers</div>
            </div>
            <div className="bg-red-100 rounded p-3 text-center">
              <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
              <div className="text-xs text-red-600">Rejected</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={simulateScrape}
              disabled={scraping}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              <RefreshCw className={`w-4 h-4 ${scraping ? 'animate-spin' : ''}`} />
              {scraping ? 'Scraping...' : 'Scrape New Jobs'}
            </button>
            <button
              onClick={addManualJob}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Plus className="w-4 h-4" />
              Add Job Manually
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              <Download className="w-4 h-4" />
              Export to CSV
            </button>
            <button
              onClick={clearAllData}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition ml-auto"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>

          {/* Filter */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Filter:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="all">All Jobs</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Job Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pay</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Link</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Notes</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                      No jobs yet. Click "Scrape New Jobs" or "Add Job Manually" to get started!
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={job.company}
                          onChange={(e) => updateJob(job.id, 'company', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-200 rounded focus:border-blue-500 focus:outline-none"
                          placeholder="Company"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={job.title}
                          onChange={(e) => updateJob(job.id, 'title', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-200 rounded focus:border-blue-500 focus:outline-none"
                          placeholder="Job Title"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={job.location}
                          onChange={(e) => updateJob(job.id, 'location', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-200 rounded focus:border-blue-500 focus:outline-none"
                          placeholder="Location"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={job.pay}
                          onChange={(e) => updateJob(job.id, 'pay', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-200 rounded focus:border-blue-500 focus:outline-none"
                          placeholder="$$$"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={job.link}
                            onChange={(e) => updateJob(job.id, 'link', e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-200 rounded focus:border-blue-500 focus:outline-none"
                            placeholder="https://..."
                          />
                          {job.link && (
                            <a
                              href={job.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={job.status}
                          onChange={(e) => updateJob(job.id, 'status', e.target.value)}
                          className={`w-full px-2 py-1 rounded text-sm font-medium ${statusColors[job.status]}`}
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={job.notes}
                          onChange={(e) => updateJob(job.id, 'notes', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-200 rounded focus:border-blue-500 focus:outline-none"
                          placeholder="Notes..."
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteJob(job.id)}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Click "Scrape New Jobs" to simulate fetching jobs (demo mode). 
            All your data is saved automatically and persists across sessions. You can edit any field directly in the table!
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;