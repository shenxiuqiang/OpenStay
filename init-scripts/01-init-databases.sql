-- Initialize databases for OpenStay
-- This script runs when PostgreSQL container starts for the first time

-- Create databases for each service
CREATE DATABASE openstay_property;
CREATE DATABASE openstay_hub;
CREATE DATABASE openstay_travel;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE openstay_property TO openstay;
GRANT ALL PRIVILEGES ON DATABASE openstay_hub TO openstay;
GRANT ALL PRIVILEGES ON DATABASE openstay_travel TO openstay;

-- Enable PostGIS extension (optional, for advanced geospatial queries)
-- \c openstay_property
-- CREATE EXTENSION IF NOT EXISTS postgis;
-- CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- \c openstay_hub
-- CREATE EXTENSION IF NOT EXISTS postgis;
-- CREATE EXTENSION IF NOT EXISTS postgis_topology;
