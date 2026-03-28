import { useState } from 'react';

function Rooms() {
  const [rooms, setRooms] = useState([]);
  
  return (
    <div>
      <header className="page-header">
        <h1>房型管理</h1>
        <button className="btn btn-primary">+ 添加房型</button>
      </header>
      
      {rooms.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛏️</div>
          <h3>暂无房型</h3>
          <p>添加您的第一个房型，开始接待客人</p>
          <button className="btn btn-primary">添加房型</button>
        </div>
      ) : (
        <div className="rooms-list">房型列表</div>
      )}
    </div>
  );
}

export default Rooms;
