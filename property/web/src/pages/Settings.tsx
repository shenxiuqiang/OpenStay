import { useState, useEffect } from 'react';

interface PropertySettings {
  name: string;
  description: string;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
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
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    checkInTime: '14:00',
    checkOutTime: '12:00',
  });
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

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
          latitude: data.data.latitude?.toString() || '',
          longitude: data.data.longitude?.toString() || '',
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

  // 获取当前位置
  const getCurrentLocation = () => {
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError('您的浏览器不支持地理定位');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setSettings(prev => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }));
      },
      (error) => {
        let errorMsg = '无法获取您的位置';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = '请允许访问您的位置信息';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = '位置信息不可用';
            break;
          case error.TIMEOUT:
            errorMsg = '获取位置超时';
            break;
        }
        setLocationError(errorMsg);
      }
    );
  };

  // 通过地址获取坐标（模拟）
  const geocodeAddress = async () => {
    if (!settings.address && !settings.city) {
      setLocationError('请先填写地址和城市');
      return;
    }

    setLocationError(null);
    
    // 模拟地理编码 - 实际项目中应该调用高德/百度地图 API
    // 这里生成随机偏移的坐标作为演示
    const baseLat = 30.2741; // 杭州
    const baseLng = 120.1551;
    const offset = 0.05;
    
    const randomLat = baseLat + (Math.random() - 0.5) * offset;
    const randomLng = baseLng + (Math.random() - 0.5) * offset;
    
    setSettings(prev => ({
      ...prev,
      latitude: randomLat.toFixed(6),
      longitude: randomLng.toFixed(6),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // TODO: Update property settings with coordinates
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

  // 验证坐标格式
  const isValidCoordinate = (value: string, type: 'lat' | 'lng'): boolean => {
    if (!value) return true;
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (type === 'lat' && (num < -90 || num > 90)) return false;
    if (type === 'lng' && (num < -180 || num > 180)) return false;
    return true;
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
                placeholder="如：杭州"
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
                placeholder="如：西湖区文三路 123 号"
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>📍 地理位置</h2>
          <p className="section-desc">设置准确的坐标，让客人能在地图上找到您</p>
          
          {locationError && (
            <div className="location-error">{locationError}</div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label>纬度 (Latitude)</label>
              <input
                type="text"
                name="latitude"
                value={settings.latitude}
                onChange={handleChange}
                className={`input ${!isValidCoordinate(settings.latitude, 'lat') ? 'error' : ''}`}
                placeholder="如：30.274100"
              />
              {!isValidCoordinate(settings.latitude, 'lat') && (
                <span className="field-error">请输入有效的纬度 (-90 ~ 90)</span>
              )}
            </div>

            <div className="form-group">
              <label>经度 (Longitude)</label>
              <input
                type="text"
                name="longitude"
                value={settings.longitude}
                onChange={handleChange}
                className={`input ${!isValidCoordinate(settings.longitude, 'lng') ? 'error' : ''}`}
                placeholder="如：120.155100"
              />
              {!isValidCoordinate(settings.longitude, 'lng') && (
                <span className="field-error">请输入有效的经度 (-180 ~ 180)</span>
              )}
            </div>
          </div>

          <div className="location-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={getCurrentLocation}
            >
              📍 使用当前位置
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={geocodeAddress}
            >
              🔍 根据地址获取坐标
            </button>
          </div>

          {settings.latitude && settings.longitude && (
            <div className="coordinate-preview">
              <p>✅ 已设置坐标：{settings.latitude}, {settings.longitude}</p>
              <a 
                href={`https://map.baidu.com/search/${settings.latitude},${settings.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="map-link"
              >
                在地图中查看 →
              </a>
            </div>
          )}
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
