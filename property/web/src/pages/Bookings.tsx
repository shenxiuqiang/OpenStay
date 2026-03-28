import { useState } from 'react';

function Bookings() {
  const [bookings, setBookings] = useState([]);
  
  return (
    <div>
      <header className="page-header">
        <h1>订单管理</h1>
        <div className="filter-tabs">
          <button className="filter-tab active">全部</button>
          <button className="filter-tab">待确认</button>
          <button className="filter-tab">已确认</button>
          <button className="filter-tab">已完成</button>
        </div>
      </header>
      
      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>暂无订单</h3>
          <p>订单将在这里显示</p>
        </div>
      ) : (
        <div className="bookings-list">订单列表</div>
      )}
    </div>
  );
}

export default Bookings;
