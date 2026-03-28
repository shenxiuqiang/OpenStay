import React, { useState, useEffect } from 'react';
import './NFTManager.css';

interface StakeRequirements {
  node: number;
  membership: {
    silver: number;
    gold: number;
    diamond: number;
  };
}

interface NFTAsset {
  address: string;
  owner: string;
  moniker: string;
  data: Record<string, unknown>;
}

const NFTManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'node' | 'property' | 'membership'>('node');
  const [requirements, setRequirements] = useState<StakeRequirements | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userNFTs, setUserNFTs] = useState<NFTAsset[]>([]);

  // Node form state
  const [nodeForm, setNodeForm] = useState({
    name: '',
    endpoint: '',
    region: '',
    stake: 100,
    capacity: 1000,
    owner: '',
    pk: '',
  });

  // Property form state
  const [propertyForm, setPropertyForm] = useState({
    propertyId: '',
    propertyName: '',
    location: '',
    propertyType: 'apartment',
    hostDid: '',
    complianceRegion: 'CN',
  });

  // Membership form state
  const [membershipForm, setMembershipForm] = useState({
    hostDid: '',
    hostName: '',
    tier: 'silver' as 'silver' | 'gold' | 'diamond',
    propertyCount: 1,
    totalBookings: 0,
    rating: 5,
  });

  useEffect(() => {
    fetchStakeRequirements();
    fetchUserNFTs();
  }, []);

  const fetchStakeRequirements = async () => {
    try {
      const response = await fetch('/api/nft/stake-requirements');
      const result = await response.json();
      if (result.success) {
        setRequirements(result.data.requirements);
      }
    } catch (error) {
      console.error('Failed to fetch stake requirements:', error);
    }
  };

  const fetchUserNFTs = async () => {
    // Mock user DID - in production this would come from authentication
    const mockDid = 'z1MockUserDid';
    try {
      const response = await fetch(`/api/nft/user/${mockDid}`);
      const result = await response.json();
      if (result.success) {
        setUserNFTs(result.data.assets);
      }
    } catch (error) {
      console.error('Failed to fetch user NFTs:', error);
    }
  };

  const mintNodeNFT = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/nft/node/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nodeForm),
      });
      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: `Node NFT minted: ${result.data.asset.address}` });
        fetchUserNFTs();
      } else {
        setMessage({ type: 'error', text: result.error.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to mint Node NFT' });
    } finally {
      setLoading(false);
    }
  };

  const mintPropertyNFT = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/nft/property/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...propertyForm,
          certifiedAt: new Date().toISOString(),
        }),
      });
      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: `Property Certificate minted: ${result.data.asset.address}` });
        fetchUserNFTs();
      } else {
        setMessage({ type: 'error', text: result.error.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to mint Property Certificate' });
    } finally {
      setLoading(false);
    }
  };

  const mintMembershipNFT = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const benefits = {
        silver: '5% fee reduction, Priority support',
        gold: '10% fee reduction, Priority support, Featured listings',
        diamond: '15% fee reduction, 24/7 support, Featured listings, Early access',
      }[membershipForm.tier];

      const response = await fetch('/api/nft/membership/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...membershipForm,
          memberSince: new Date().toISOString().split('T')[0],
          benefits,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setMessage({ type: 'success', text: `Membership NFT minted: ${result.data.asset.address}` });
        fetchUserNFTs();
      } else {
        setMessage({ type: 'error', text: result.error.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to mint Membership NFT' });
    } finally {
      setLoading(false);
    }
  };

  const getTierStakeAmount = (tier: string) => {
    if (!requirements) return 0;
    return requirements.membership[tier as keyof typeof requirements.membership] || 0;
  };

  return (
    <div className="nft-manager">
      <div className="nft-header">
        <h1>NFT 管理中心</h1>
        <p className="nft-subtitle">管理您的节点质押、房源认证和会员权益</p>
      </div>

      {requirements && (
        <div className="stake-requirements">
          <h3>💰 质押要求</h3>
          <div className="requirements-grid">
            <div className="requirement-card">
              <span className="requirement-label">网络节点</span>
              <span className="requirement-value">{requirements.node} ABT</span>
            </div>
            <div className="requirement-card silver">
              <span className="requirement-label">银牌会员</span>
              <span className="requirement-value">{requirements.membership.silver} ABT</span>
            </div>
            <div className="requirement-card gold">
              <span className="requirement-label">金牌会员</span>
              <span className="requirement-value">{requirements.membership.gold} ABT</span>
            </div>
            <div className="requirement-card diamond">
              <span className="requirement-label">钻石会员</span>
              <span className="requirement-value">{requirements.membership.diamond} ABT</span>
            </div>
          </div>
        </div>
      )}

      <div className="nft-tabs">
        <button
          className={`tab ${activeTab === 'node' ? 'active' : ''}`}
          onClick={() => setActiveTab('node')}
        >
          🖥️ 网络节点
        </button>
        <button
          className={`tab ${activeTab === 'property' ? 'active' : ''}`}
          onClick={() => setActiveTab('property')}
        >
          🏠 房源认证
        </button>
        <button
          className={`tab ${activeTab === 'membership' ? 'active' : ''}`}
          onClick={() => setActiveTab('membership')}
        >
          ⭐ 会员权益
        </button>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="nft-content">
        {activeTab === 'node' && (
          <div className="nft-section">
            <h2>🖥️ 创建网络节点</h2>
            <p className="section-desc">质押 {requirements?.node || 100} ABT 成为 OpenStay 网络节点</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label>节点名称 *</label>
                <input
                  type="text"
                  value={nodeForm.name}
                  onChange={(e) => setNodeForm({ ...nodeForm, name: e.target.value })}
                  placeholder="Asia-Pacific Node #1"
                />
              </div>
              <div className="form-group">
                <label>Endpoint *</label>
                <input
                  type="text"
                  value={nodeForm.endpoint}
                  onChange={(e) => setNodeForm({ ...nodeForm, endpoint: e.target.value })}
                  placeholder="https://node.openstay.network/apac-1"
                />
              </div>
              <div className="form-group">
                <label>区域 *</label>
                <input
                  type="text"
                  value={nodeForm.region}
                  onChange={(e) => setNodeForm({ ...nodeForm, region: e.target.value })}
                  placeholder="APAC-SG"
                />
              </div>
              <div className="form-group">
                <label>质押金额 (ABT) *</label>
                <input
                  type="number"
                  value={nodeForm.stake}
                  onChange={(e) => setNodeForm({ ...nodeForm, stake: Number(e.target.value) })}
                  min={requirements?.node || 100}
                />
              </div>
              <div className="form-group">
                <label>容量 (房源数) *</label>
                <input
                  type="number"
                  value={nodeForm.capacity}
                  onChange={(e) => setNodeForm({ ...nodeForm, capacity: Number(e.target.value) })}
                  min={100}
                />
              </div>
              <div className="form-group">
                <label>Owner DID *</label>
                <input
                  type="text"
                  value={nodeForm.owner}
                  onChange={(e) => setNodeForm({ ...nodeForm, owner: e.target.value })}
                  placeholder="z1..."
                />
              </div>
              <div className="form-group full-width">
                <label>Public Key *</label>
                <input
                  type="text"
                  value={nodeForm.pk}
                  onChange={(e) => setNodeForm({ ...nodeForm, pk: e.target.value })}
                  placeholder="0x..."
                />
              </div>
            </div>

            <button
              className="mint-button"
              onClick={mintNodeNFT}
              disabled={loading || !nodeForm.name || !nodeForm.endpoint}
            >
              {loading ? '处理中...' : `质押 ${nodeForm.stake} ABT 创建节点`}
            </button>
          </div>
        )}

        {activeTab === 'property' && (
          <div className="nft-section">
            <h2>🏠 房源认证</h2>
            <p className="section-desc">为您管理的房源申请链上认证证书</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label>房源 ID *</label>
                <input
                  type="text"
                  value={propertyForm.propertyId}
                  onChange={(e) => setPropertyForm({ ...propertyForm, propertyId: e.target.value })}
                  placeholder="prop_001"
                />
              </div>
              <div className="form-group">
                <label>房源名称 *</label>
                <input
                  type="text"
                  value={propertyForm.propertyName}
                  onChange={(e) => setPropertyForm({ ...propertyForm, propertyName: e.target.value })}
                  placeholder="Cozy Apartment in Downtown"
                />
              </div>
              <div className="form-group">
                <label>位置 *</label>
                <input
                  type="text"
                  value={propertyForm.location}
                  onChange={(e) => setPropertyForm({ ...propertyForm, location: e.target.value })}
                  placeholder="Shanghai, China"
                />
              </div>
              <div className="form-group">
                <label>房源类型 *</label>
                <select
                  value={propertyForm.propertyType}
                  onChange={(e) => setPropertyForm({ ...propertyForm, propertyType: e.target.value })}
                >
                  <option value="apartment">公寓</option>
                  <option value="house">独栋房屋</option>
                  <option value="villa">别墅</option>
                  <option value="hotel">酒店</option>
                  <option value="homestay">民宿</option>
                </select>
              </div>
              <div className="form-group">
                <label>房东 DID *</label>
                <input
                  type="text"
                  value={propertyForm.hostDid}
                  onChange={(e) => setPropertyForm({ ...propertyForm, hostDid: e.target.value })}
                  placeholder="z1..."
                />
              </div>
              <div className="form-group">
                <label>合规区域 *</label>
                <select
                  value={propertyForm.complianceRegion}
                  onChange={(e) => setPropertyForm({ ...propertyForm, complianceRegion: e.target.value })}
                >
                  <option value="CN">中国</option>
                  <option value="US">美国</option>
                  <option value="EU">欧盟</option>
                  <option value="JP">日本</option>
                  <option value="SG">新加坡</option>
                </select>
              </div>
            </div>

            <button
              className="mint-button"
              onClick={mintPropertyNFT}
              disabled={loading || !propertyForm.propertyId || !propertyForm.propertyName}
            >
              {loading ? '处理中...' : '申请房源认证'}
            </button>
          </div>
        )}

        {activeTab === 'membership' && (
          <div className="nft-section">
            <h2>⭐ 会员权益</h2>
            <p className="section-desc">质押 ABT 获取不同等级的会员权益</p>
            
            <div className="tier-cards">
              <div
                className={`tier-card ${membershipForm.tier === 'silver' ? 'selected' : ''}`}
                onClick={() => setMembershipForm({ ...membershipForm, tier: 'silver' })}
              >
                <div className="tier-icon">🥈</div>
                <div className="tier-name">银牌会员</div>
                <div className="tier-stake">{getTierStakeAmount('silver')} ABT</div>
                <ul className="tier-benefits">
                  <li>平台费用减免 5%</li>
                  <li>优先客服支持</li>
                  <li>标准数据分析</li>
                </ul>
              </div>
              <div
                className={`tier-card ${membershipForm.tier === 'gold' ? 'selected' : ''}`}
                onClick={() => setMembershipForm({ ...membershipForm, tier: 'gold' })}
              >
                <div className="tier-icon">🥇</div>
                <div className="tier-name">金牌会员</div>
                <div className="tier-stake">{getTierStakeAmount('gold')} ABT</div>
                <ul className="tier-benefits">
                  <li>平台费用减免 10%</li>
                  <li>优先客服支持</li>
                  <li>房源优先展示</li>
                  <li>高级数据分析</li>
                </ul>
              </div>
              <div
                className={`tier-card ${membershipForm.tier === 'diamond' ? 'selected' : ''}`}
                onClick={() => setMembershipForm({ ...membershipForm, tier: 'diamond' })}
              >
                <div className="tier-icon">💎</div>
                <div className="tier-name">钻石会员</div>
                <div className="tier-stake">{getTierStakeAmount('diamond')} ABT</div>
                <ul className="tier-benefits">
                  <li>平台费用减免 15%</li>
                  <li>24/7 专属客服</li>
                  <li>首页推荐位</li>
                  <li>高级数据分析</li>
                  <li>新功能优先体验</li>
                </ul>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>房东 DID *</label>
                <input
                  type="text"
                  value={membershipForm.hostDid}
                  onChange={(e) => setMembershipForm({ ...membershipForm, hostDid: e.target.value })}
                  placeholder="z1..."
                />
              </div>
              <div className="form-group">
                <label>房东名称 *</label>
                <input
                  type="text"
                  value={membershipForm.hostName}
                  onChange={(e) => setMembershipForm({ ...membershipForm, hostName: e.target.value })}
                  placeholder="Alice Chen"
                />
              </div>
              <div className="form-group">
                <label>房源数量 *</label>
                <input
                  type="number"
                  value={membershipForm.propertyCount}
                  onChange={(e) => setMembershipForm({ ...membershipForm, propertyCount: Number(e.target.value) })}
                  min={1}
                />
              </div>
              <div className="form-group">
                <label>总预订数 *</label>
                <input
                  type="number"
                  value={membershipForm.totalBookings}
                  onChange={(e) => setMembershipForm({ ...membershipForm, totalBookings: Number(e.target.value) })}
                  min={0}
                />
              </div>
              <div className="form-group">
                <label>评分 (1-5) *</label>
                <input
                  type="number"
                  value={membershipForm.rating}
                  onChange={(e) => setMembershipForm({ ...membershipForm, rating: Number(e.target.value) })}
                  min={1}
                  max={5}
                  step={0.1}
                />
              </div>
            </div>

            <button
              className="mint-button"
              onClick={mintMembershipNFT}
              disabled={loading || !membershipForm.hostDid || !membershipForm.hostName}
            >
              {loading ? '处理中...' : `质押 ${getTierStakeAmount(membershipForm.tier)} ABT 成为${
                membershipForm.tier === 'silver' ? '银牌' : membershipForm.tier === 'gold' ? '金牌' : '钻石'
              }会员`}
            </button>
          </div>
        )}
      </div>

      {userNFTs.length > 0 && (
        <div className="user-nfts">
          <h3>我的 NFT</h3>
          <div className="nfts-list">
            {userNFTs.map((nft) => (
              <div key={nft.address} className="nft-card">
                <div className="nft-moniker">{nft.moniker}</div>
                <div className="nft-address">{nft.address}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTManager;
