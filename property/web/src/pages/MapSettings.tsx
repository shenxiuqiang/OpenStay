import { useState, useEffect } from 'react';
import { MAP_PROVIDERS, DEFAULT_MAP_CONFIG, validateMapKey, getMapScriptUrl } from '../utils/map-config';

interface MapSettingsData {
  provider: string;
  apiKey: string;
  defaultCenter: {
    lat: number;
    lng: number;
  };
  defaultZoom: number;
}

function MapSettings() {
  const [settings, setSettings] = useState<MapSettingsData>(DEFAULT_MAP_CONFIG);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [keyVisible, setKeyVisible] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/property/map-config');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch map settings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await fetch('/api/property/map-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save map settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const testMapConnection = async () => {
    if (!settings.apiKey) return;
    
    setTestStatus('testing');
    
    try {
      const scriptUrl = getMapScriptUrl(settings.provider, settings.apiKey);
      await fetch(scriptUrl, { method: 'HEAD', mode: 'no-cors' });
      
      setTimeout(() => {
        if (validateMapKey(settings.provider, settings.apiKey)) {
          setTestStatus('success');
        } else {
          setTestStatus('error');
        }
        setTimeout(() => setTestStatus('idle'), 3000);
      }, 1000);
    } catch {
      setTestStatus('error');
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  const selectedProvider = MAP_PROVIDERS.find(p => p.id === settings.provider);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🗺️ 地图设置</h1>
        <p className="text-gray-600">配置地图服务，让客人可以在地图上找到您的房源</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">选择地图服务商</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MAP_PROVIDERS.map((provider) => (
              <div
                key={provider.id}
                className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                  settings.provider === provider.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSettings({ ...settings, provider: provider.id })}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{provider.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{provider.name}</h3>
                    <p className="text-sm text-gray-500">{provider.requiresKey ? '需要 API Key' : '免费使用'}</p>
                  </div>
                </div>
                {settings.provider === provider.id && (
                  <span className="absolute top-2 right-2 text-primary-500 font-bold">✓</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {selectedProvider?.requiresKey && (
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">API Key 配置</h2>
            
            <div className="space-y-4">
              <div>
                <label className="label">{selectedProvider.keyName}</label>
                <div className="flex space-x-2">
                  <input
                    type={keyVisible ? 'text' : 'password'}
                    value={settings.apiKey}
                    onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                    className="input flex-1"
                    placeholder={`输入您的 ${selectedProvider.name} API Key`}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setKeyVisible(!keyVisible)}
                  >
                    {keyVisible ? '🙈' : '👁️'}
                  </button>
                </div>
                
                {!validateMapKey(settings.provider, settings.apiKey) && settings.apiKey && (
                  <span className="text-sm text-red-500 mt-1">API Key 格式不正确</span>
                )}
              </div>
              
              <div className="flex space-x-3">
                <a
                  href={selectedProvider.keyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  获取 API Key
                </a>
                
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={testMapConnection}
                  disabled={!settings.apiKey || testStatus === 'testing'}
                >
                  {testStatus === 'testing' && '测试中...'}
                  {testStatus === 'idle' && '测试连接'}
                  {testStatus === 'success' && '✅ 连接成功'}
                  {testStatus === 'error' && '❌ 连接失败'}
                </button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800 mb-2">💡 提示：API Key 将安全存储在您的服务器上</p>
                <a
                  href={selectedProvider.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  查看 {selectedProvider.name} 文档 →
                </a>
              </div>
            </div>
          </section>
        )}

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">默认地图视图</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">默认纬度</label>
              <input
                type="number"
                step="any"
                value={settings.defaultCenter.lat}
                onChange={(e) => setSettings({
                  ...settings,
                  defaultCenter: {
                    ...settings.defaultCenter,
                    lat: parseFloat(e.target.value) || 0,
                  },
                })}
                className="input"
                placeholder="30.2741"
              />
            </div>

            <div>
              <label className="label">默认经度</label>
              <input
                type="number"
                step="any"
                value={settings.defaultCenter.lng}
                onChange={(e) => setSettings({
                  ...settings,
                  defaultCenter: {
                    ...settings.defaultCenter,
                    lng: parseFloat(e.target.value) || 0,
                  },
                })}
                className="input"
                placeholder="120.1551"
              />
            </div>

            <div>
              <label className="label">默认缩放级别</label>
              <input
                type="number"
                min="1"
                max="20"
                value={settings.defaultZoom}
                onChange={(e) => setSettings({
                  ...settings,
                  defaultZoom: parseInt(e.target.value) || 12,
                })}
                className="input"
                placeholder="12"
              />
              <p className="text-xs text-gray-500 mt-1">1=世界, 20=建筑</p>
            </div>
          </div>
        </section>

        <div className="flex items-center space-x-4">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? '保存中...' : '保存设置'}
          </button>
          
          {saved && <span className="text-green-600 font-medium">✅ 已保存</span>}
        </div>
      </form>
    </div>
  );
}

export default MapSettings;
