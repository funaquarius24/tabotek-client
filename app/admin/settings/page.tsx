export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure your site settings, appearance, and integrations.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <nav className="space-y-1 p-4">
              <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 font-medium rounded-lg">
                General
              </button>
              <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                Appearance
              </button>
              <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                SEO
              </button>
              <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                Social Media
              </button>
              <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                Email
              </button>
              <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                Analytics
              </button>
              <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                Security
              </button>
              <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium">
                Integrations
              </button>
            </nav>
          </div>
        </div>
        
        {/* Right Column - Settings Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">General Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Site Title
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tech Hub & Life Skills Academy"
                  defaultValue="Tech Hub & Life Skills Academy"
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
                  defaultValue="Your ultimate destination for expert tech reviews, hands‑on tutorials, and practical life‑skill training."
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
                  defaultValue="http://localhost:3000"
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
                  defaultValue="admin@techhub.example.com"
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
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                Save Changes
              </button>
            </div>
          </div>
          
          {/* Appearance Settings */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Appearance</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-600 border-2 border-gray-300"></div>
                  <div className="w-12 h-12 rounded-lg bg-purple-600 border-2 border-gray-300"></div>
                  <div className="w-12 h-12 rounded-lg bg-green-600 border-2 border-gray-300"></div>
                  <div className="w-12 h-12 rounded-lg bg-red-600 border-2 border-gray-300"></div>
                  <div className="w-12 h-12 rounded-lg bg-yellow-500 border-2 border-gray-300"></div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Logo
                </label>
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-3xl">🖼️</span>
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-lg font-medium mb-2">
                      Upload New Logo
                    </button>
                    <p className="text-sm text-gray-500">
                      Recommended: 400x400px PNG or SVG
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Favicon
                </label>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">✨</span>
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-lg font-medium mb-2">
                      Upload New Favicon
                    </button>
                    <p className="text-sm text-gray-500">
                      Recommended: 64x64px ICO or PNG
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Dark Mode</h3>
                  <p className="text-sm text-gray-500">
                    Enable dark mode support
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                Save Appearance
              </button>
            </div>
          </div>
          
          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-red-900 mb-4">Danger Zone</h2>
            <p className="text-red-800 mb-6">
              These actions are irreversible. Please proceed with caution.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                <div>
                  <h3 className="font-medium text-gray-900">Clear Cache</h3>
                  <p className="text-sm text-gray-500">
                    Clear all cached data and rebuild
                  </p>
                </div>
                <button className="px-4 py-2 bg-red-100 text-red-800 hover:bg-red-200 rounded-lg font-medium">
                  Clear Cache
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                <div>
                  <h3 className="font-medium text-gray-900">Reset Site</h3>
                  <p className="text-sm text-gray-500">
                    Reset all content to factory defaults
                  </p>
                </div>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">
                  Reset Site
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                <div>
                  <h3 className="font-medium text-gray-900">Delete Site</h3>
                  <p className="text-sm text-gray-500">
                    Permanently delete all data and configurations
                  </p>
                </div>
                <button className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg font-medium">
                  Delete Site
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}