import { useEffect, useState } from 'react';
import './JoinRequests.css';

interface JoinRequest {
  id: string;
  propertyName: string;
  propertyDid: string;
  requestedTier: 'basic' | 'pro' | 'premium';
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  createdAt: string;
}

function JoinRequests() {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      const url = filter === 'all' 
        ? '/api/join-requests' 
        : `/api/join-requests?status=${filter}`;
      
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setRequests(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/join-requests/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, tier: 'basic' }),
      });

      if (res.ok) {
        fetchRequests();
      }
    } catch (error) {
      console.error('Failed to review:', error);
    }
  };

  if (loading) {
    return <div className="loading">加载中...⏳</div>;
  }

  return (
    <div className="join-requests">
      <header className="page-header">
        <h1>入驻申请</h1>
        <select 
          className="filter-select"
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="pending">待处理</option>
          <option value="under_review">审核中</option>
          <option value="approved">已通过</option>
          <option value="rejected">已拒绝</option>
          <option value="all">全部</option>
        </select>
      </header>

      {requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>暂无申请</h3>
        </div>
      ) : (
        <div className="requests-list">
          {requests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="request-info">
                <h3 className="request-name">{request.propertyName}</h3>
                <p className="request-did">{request.propertyDid.slice(0, 20)}...{request.propertyDid.slice(-8)}</p>
                <div className="request-meta">
                  <span className={`tier-badge tier-${request.requestedTier}`}>
                    {request.requestedTier}
                  </span>
                  <span className={`status-badge status-${request.status}`}>
                    {request.status === 'pending' && '待处理'}
                    {request.status === 'under_review' && '审核中'}
                    {request.status === 'approved' && '已通过'}
                    {request.status === 'rejected' && '已拒绝'}
                  </span>
                  <span className="request-date">
                    {new Date(request.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>

              {request.status === 'pending' && (
                <div className="request-actions">
                  <button 
                    className="btn btn-success"
                    onClick={() => handleReview(request.id, 'approve')}
                  >
                    通过
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleReview(request.id, 'reject')}
                  >
                    拒绝
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default JoinRequests;
