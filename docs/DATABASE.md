# OpenStay 数据库配置指南

## 支持的数据库

- **SQLite** - 开发环境（默认）
- **PostgreSQL** - 生产环境（推荐）

## PostgreSQL 配置

### 1. 安装 PostgreSQL

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql
brew services start postgresql

# Docker
docker run -d \
  --name openstay-postgres \
  -e POSTGRES_USER=openstay \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=openstay \
  -p 5432:5432 \
  postgres:16
```

### 2. 创建数据库

```bash
# 进入 PostgreSQL
sudo -u postgres psql

# 创建数据库和用户
CREATE DATABASE openstay;
CREATE USER openstay WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE openstay TO openstay;

# 退出
\q
```

### 3. 配置环境变量

```bash
# .env 文件
DATABASE_URL=postgresql://openstay:your_password@localhost:5432/openstay

# 或者分别配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=openstay
DB_USER=openstay
DB_PASSWORD=your_password
DB_SSL=false
```

### 4. 初始化数据库

```bash
# Property Studio
cd property/web
export DATABASE_URL=postgresql://openstay:your_password@localhost:5432/openstay
npm run db:migrate

# Hospitality Hub
cd hub/web
export DATABASE_URL=postgresql://openstay:your_password@localhost:5432/openstay
npm run db:migrate

# Travel App
cd travel-app/web
export DATABASE_URL=postgresql://openstay:your_password@localhost:5432/openstay
npm run db:migrate
```

## 数据库结构

### Property Studio

```sql
-- 房源表
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  did VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  cover_image_url VARCHAR(500),
  facilities JSON DEFAULT '[]',
  is_public BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 房型表
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'CNY',
  capacity INTEGER,
  amenities JSON DEFAULT '[]',
  images JSON DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 订单表
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  room_id UUID REFERENCES rooms(id),
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255),
  guest_phone VARCHAR(50),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER,
  total_price DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'CNY',
  status VARCHAR(50) DEFAULT 'pending',
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Hospitality Hub

```sql
-- 房源索引表
CREATE TABLE indexed_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id VARCHAR(255) NOT NULL,
  property_id VARCHAR(255) UNIQUE NOT NULL,
  property_did VARCHAR(255),
  property_endpoint VARCHAR(500),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  cover_image_url VARCHAR(500),
  facilities JSON DEFAULT '[]',
  min_price DECIMAL(10, 2) DEFAULT 0,
  max_price DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'CNY',
  tier VARCHAR(20) DEFAULT 'basic',
  hub_tags JSON DEFAULT '[]',
  is_featured BOOLEAN DEFAULT false,
  sync_status VARCHAR(50) DEFAULT 'syncing',
  last_sync_at TIMESTAMP,
  view_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  booking_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 入驻申请
CREATE TABLE join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id VARCHAR(255) NOT NULL,
  property_did VARCHAR(255),
  property_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  property_type VARCHAR(100),
  room_count INTEGER,
  address TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Travel App

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  did VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  name VARCHAR(255),
  avatar_url VARCHAR(500),
  preferences JSON DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 预订表
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  property_id VARCHAR(255) NOT NULL,
  room_id VARCHAR(255),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER,
  total_price DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'CNY',
  status VARCHAR(50) DEFAULT 'confirmed',
  guest_info JSON,
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 收藏表
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  property_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, property_id)
);
```

## 性能优化

### 索引

```sql
-- 地理坐标索引
CREATE INDEX idx_properties_coords ON properties(latitude, longitude);
CREATE INDEX idx_indexed_properties_coords ON indexed_properties(latitude, longitude);

-- 搜索索引
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_indexed_properties_sync ON indexed_properties(sync_status);

-- 时间索引
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_bookings_status ON bookings(status);
```

## 备份与恢复

```bash
# 备份
pg_dump -U openstay -d openstay > openstay_backup.sql

# 恢复
psql -U openstay -d openstay < openstay_backup.sql
```

## 监控

```sql
-- 查看连接数
SELECT count(*) FROM pg_stat_activity;

-- 查看慢查询
SELECT query, calls, mean_time, total_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```
