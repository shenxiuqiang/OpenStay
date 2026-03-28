import { useState, useEffect } from 'react';

interface PropertySettings {
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  checkInTime: string;
  checkOutTime: string;
}

function Settings() {
  const [settings, setSettings] = useState<PropertySettings>({
    name: '',
    description: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    checkInTime: '14:00',
    checkOutTime: '12:00',
  });
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/property');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings({
          name: data.data.name || '',
          description: data.data.description || '',
          address: data.data.address || '',
          city: data.data.city || '',
          phone: data.data.phone || '',
          email: data.data.email || '',
          checkInTime: data.data.checkInTime || '14:00',
          checkOutTime: data.data.checkOutTime || '12:00',
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // TODO: Update property settings
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

  return (
    <div className="settings">
      <header className="page-header">
        <h1>店铺设置</h1>
      </header>

      <form onSubmit={handleSubmit} className="settings-form">
        <section className="form-section">
          <h2>基本信息</h2>
          
          <div className="form-group">
            <label>店铺名称 *</label>
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
              <label>城市</label>
              <input
                type="text"
                name="city"
                value={settings.city}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div className="form-group">
              <label>详细地址</label>
              <input
                type="text"
                name="address"
                value={settings.address}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>联系方式</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>联系电话</label>
              <input
                type="tel"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                className="input"
              />
            </div>

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
          </div>
        </section>

        <section className="form-section">
          <h2>入住规则</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>入住时间</label>
              <input
                type="time"
                name="checkInTime"
                value={settings.checkInTime}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div className="form-group">
              <label>退房时间</label>
              <input
                type="time"
                name="checkOutTime"
                value={settings.checkOutTime}
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
