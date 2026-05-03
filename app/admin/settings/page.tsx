'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getSiteSettings, saveSiteSettings } from '@/lib/api';

export default function AdminSettingsPage() {
  const { userSettings, updateSettings } = useAuth();

  const [siteForm, setSiteForm] = useState<Record<string, string | boolean>>({});
  const [userForm, setUserForm] = useState<Record<string, string | boolean | number>>({});
  const [savingSite, setSavingSite] = useState(false);
  const [savingUser, setSavingUser] = useState(false);

  useEffect(() => {
    getSiteSettings()
      .then(data => {
        const form: Record<string, string | boolean> = {};
        for (const [key, value] of Object.entries(data.settings)) {
          if (typeof value === 'string' || typeof value === 'boolean') {
            form[key] = value;
          }
        }
        setSiteForm(form);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const form: Record<string, string | boolean | number> = {};
    for (const [key, value] of Object.entries(userSettings)) {
      if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') {
        form[key] = value;
      }
    }
    setUserForm(form);
  }, [userSettings]);

  const setSiteField = useCallback((key: string, value: string | boolean) => {
    setSiteForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const setUserField = useCallback((key: string, value: string | boolean | number) => {
    setUserForm(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSaveSite = useCallback(async () => {
    setSavingSite(true);
    try {
      await saveSiteSettings({ ...siteForm });
    } finally {
      setSavingSite(false);
    }
  }, [siteForm]);

  const handleSaveUser = useCallback(async () => {
    setSavingUser(true);
    try {
      await updateSettings({ ...userForm });
    } finally {
      setSavingUser(false);
    }
  }, [userForm, updateSettings]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure site-wide settings and your personal preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <nav className="space-y-1 p-4">
              <a href="#general" className="block px-4 py-3 bg-blue-50 text-blue-700 font-medium rounded-lg">
                General
              </a>
              <a href="#appearance" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                Appearance
              </a>
              <a href="#editor" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                Editor
              </a>
            </nav>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* General Settings - Site-wide */}
          <div id="general" className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold text-gray-900">General Settings</h2>
              <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Site-wide</span>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Site Title
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tech Hub & Life Skills Academy"
                  value={(siteForm.siteTitle as string) || ''}
                  onChange={e => setSiteField('siteTitle', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Site Description
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Your ultimate destination for expert tech reviews, hands‑on tutorials, and practical life‑skill training."
                  value={(siteForm.siteDescription as string) || ''}
                  onChange={e => setSiteField('siteDescription', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Site URL
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://yourdomain.com"
                  value={(siteForm.siteUrl as string) || ''}
                  onChange={e => setSiteField('siteUrl', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="contact@example.com"
                  value={(siteForm.contactEmail as string) || ''}
                  onChange={e => setSiteField('contactEmail', e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Maintenance Mode</h3>
                  <p className="text-sm text-gray-500">
                    Temporarily disable public access to the site
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={!!siteForm.maintenanceMode}
                    onChange={e => setSiteField('maintenanceMode', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors ${savingSite ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleSaveSite}
                disabled={savingSite}
              >
                {savingSite ? 'Saving...' : 'Save Site Settings'}
              </button>
            </div>
          </div>

          {/* Appearance Settings - Site-wide */}
          <div id="appearance" className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold text-gray-900">Appearance</h2>
              <span className="px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Site-wide</span>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-4">
                  {['blue', 'purple', 'green', 'red', 'yellow'].map(color => (
                    <button
                      key={color}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        siteForm.primaryColor === color ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: { blue: '#2563eb', purple: '#9333ea', green: '#16a34a', red: '#dc2626', yellow: '#eab308' }[color] }}
                      onClick={() => setSiteField('primaryColor', color)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors ${savingSite ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleSaveSite}
                disabled={savingSite}
              >
                {savingSite ? 'Saving...' : 'Save Site Settings'}
              </button>
            </div>
          </div>

          {/* Editor Preferences - Personal */}
          <div id="editor" className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-bold text-gray-900">Editor Preferences</h2>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Personal</span>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Font Family
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={(userForm.editorFontFamily as string) || 'Geist Mono'}
                  onChange={e => setUserField('editorFontFamily', e.target.value)}
                >
                  {['Geist Mono', 'Consolas', 'Courier New', 'monospace'].map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Font Size
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={(userForm.editorFontSize as number) || 14}
                  onChange={e => setUserField('editorFontSize', parseInt(e.target.value))}
                >
                  {[10, 12, 13, 14, 15, 16, 18, 20, 22, 24].map(s => (
                    <option key={s} value={s}>{s}px</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Show Table of Contents</h3>
                  <p className="text-sm text-gray-500">
                    Display the table of contents panel in the editor
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={userForm.editorShowToc !== false}
                    onChange={e => setUserField('editorShowToc', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Dark Mode</h3>
                  <p className="text-sm text-gray-500">
                    Use dark theme in the editor
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={!!userForm.darkMode}
                    onChange={e => setUserField('darkMode', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors ${savingUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleSaveUser}
                disabled={savingUser}
              >
                {savingUser ? 'Saving...' : 'Save Personal Preferences'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}