import { useState, useEffect } from 'react';

interface Property {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  price: number;
  city: string;
  type: string;
  status: 'active' | 'pending' | 'inactive';
  image?: string;
}

function MapView() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'pending'>('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    cities: 0,
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [properties, viewMode]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/hub/properties/all/coords');
      const data = await res.json();
      if (data.success) {
        setProperties(data.data || []);
        calculateStats(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (props: Property[]) => {
    const cities = new Set(props.map(p => p.city)).size;
    setStats({
      total: props.length,
      active: props.filter(p => p.status === 'active').length,
      pending: props.filter(p => p.status === 'pending').length,
      cities,
    });
  };

  const filterProperties = () => {
    let filtered = properties;
    if (viewMode !== 'all') {
      filtered = properties.filter(p => p.status === viewMode);
    }
    setFilteredProperties(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '已上线';
      case 'pending': return '审核中';
      case 'inactive': return '未上线';
      default: return '未知';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🗺️ 房源地图</h1>
            <p className="text-gray-600 mt-1">可视化查看平台所有房源分布</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white rounded-lg shadow px-4 py-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">总房源</div>
            </div>
            <div className="bg-white rounded-lg shadow px-4 py-3 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-500">已上线</div>
            </div>
            <div className="bg-white rounded-lg shadow px-4 py-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-500">审核中</div>
            </div>
            <div className="bg-white rounded-lg shadow px-4 py-3 text-center">
              <div className="text-2xl font-bold text-primary-600">{stats.cities}</div>
              <div className="text-sm text-gray-500">覆盖城市</div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setViewMode('all')}
            >
              全部房源
            </button>
            <button
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'active'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setViewMode('active')}
            >
              已上线
            </button>
            <button
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setViewMode('pending')}
            >
              审核中
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              已上线
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              审核中
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-gray-500"></span>
              未上线
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center mb-6">
        <div className="text-center">
          <p className="text-gray-500 mb-2">地图功能正在迁移到 Tailwind CSS</p>
          <p className="text-sm text-gray-400">当前显示 {filteredProperties.length} 个房源</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">📋 房源列表 ({filteredProperties.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">城市</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">价格</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">坐标</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProperties.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{p.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.city}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">¥{p.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(p.status)} text-white`}>
                      {getStatusText(p.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="text-primary-600 hover:text-primary-900"
                      onClick={() => setSelectedProperty(p)}
                    >
                      查看
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{selectedProperty.name}</h3>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setSelectedProperty(null)}
              >
                ×
              </button>
            </div>

            <div className="space-y-2 mb-6">
              <p>📍 {selectedProperty.city}</p>
              <p>🏠 {selectedProperty.type}</p>
              <p className="text-2xl font-bold text-primary-600">¥{selectedProperty.price}/晚</p>
              <p className="text-sm text-gray-500">
                坐标: {selectedProperty.latitude.toFixed(4)}, {selectedProperty.longitude.toFixed(4)}
              </p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedProperty.status)} text-white`}>
                {getStatusText(selectedProperty.status)}
              </span>
            </div>

            <div className="flex gap-3">
              <a
                href={`/properties/${selectedProperty.id}`}
                className="btn btn-primary flex-1 text-center"
              >
                查看详情
              </a>
              <a
                href={`https://maps.google.com/?q=${selectedProperty.latitude},${selectedProperty.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary flex-1 text-center"
              >
                在地图中打开
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapView;
