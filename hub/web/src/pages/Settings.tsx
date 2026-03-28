import { useState, useEffect } from 'react';

interface HubSettings {
  name: string;
  description: string;
  region: string;
  category: string;
  email: string;
  website: string;
}

function Settings() {
  const [settings, setSettings] = useState<HubSettings>({
    name: '',
    description: '',
    region: '',
    category: '',
    email: '',
    website: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/hub');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings({
          name: data.data.name || '',
          description: data.data.description || '',
          region: data.data.region || '',
          category: data.data.category || '',
          email: data.data.email || '',
          website: data.data.website || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // TODO: Update hub settings
      await new Promise(resolve => setTimeout(resolve, 500));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <div className="loading">加载中...⏳</div>;
  }

  return (
    <div className="settings">
      <header className="page-header">
        <h1>Hub 设置</h1>
      </header>

      <form onSubmit={handleSubmit} className="settings-form">
        <section className="form-section">
          <h2>基本信息</h2>
          
          <div className="form-group">
            <label>Hub 名称 *</label>
            <input
              type="text"
              name="name"
              value={settings.name}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label>描述</label>
            <textarea
              name="description"
              value={settings.description}
              onChange={handleChange}
              className="input"
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>覆盖区域</label>
              <input
                type="text"
                name="region"
                value={settings.region}
                onChange={handleChange}
                className="input"
                placeholder="例如：云南、大理"
              />
            </div>

            <div className="form-group">
              <label>垂类分类</label>
              <input
                type="text"
                name="category"
                value={settings.category}
                onChange={handleChange}
                className="input"
                placeholder="例如：民宿、酒店"
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>联系方式</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>电子邮箱</label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div className="form-group">
              <label>网站</label>
              <input
                type="url"
                name="website"
                value={settings.website}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
        </section>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? '保存中...' : '保存设置'}
          </button>
          
          {saved && <span className="save-success">✅ 已保存</span>}
        </div>
      </form>
    </div>
  );
}

export default Settings;
