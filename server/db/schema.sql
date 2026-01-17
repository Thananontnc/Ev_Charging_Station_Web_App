-- Drop tables if they exist (to reset schema)
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS charging_stations;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS customers;

-- 1. Admin Table (Station Owners/Managers)
CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Store hashed passwords in production
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    contact_info VARCHAR(100)
);

-- 2. Customer Table (Drivers)
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    payment_info VARCHAR(255), -- Storing tokenized card info or preference
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Charging Station Table
CREATE TABLE charging_stations (
    station_id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(admin_id) ON DELETE SET NULL, -- Station belongs to an Admin
    station_name VARCHAR(200) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    connector_type VARCHAR(50), -- e.g., 'CCSD', 'Type 2'
    charging_watt INTEGER, -- e.g., 150 (kW)
    total_slots INTEGER DEFAULT 1,
    available_slots INTEGER DEFAULT 1,
    price_per_kwh DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'Available',
    description TEXT,
    operating_hours VARCHAR(100) DEFAULT '24/7',
    average_wait_time INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Reservation Table
CREATE TABLE reservations (
    reservation_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id) ON DELETE CASCADE,
    station_id INTEGER REFERENCES charging_stations(station_id) ON DELETE CASCADE,
    admin_id INTEGER REFERENCES admins(admin_id), -- Optional: useful for quick admin lookups
    slot_number INTEGER,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    total_price DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'Pending' -- 'Pending', 'Confirmed', 'Cancelled', 'Completed'
);

-- 5. Payment Table
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES reservations(reservation_id) ON DELETE CASCADE,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50), -- 'Credit Card', 'PayPal', 'PromptPay'
    amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'Pending' -- 'Pending', 'Success', 'Failed'
);


-- for https://dbdiagram.io/d

-- Table admins {
--   admin_id int [pk, increment]
--   username varchar(100) [unique, not null]
--   password varchar(255) [not null]
--   name varchar(100) [not null]
--   email varchar(100) [unique, not null]
--   contact_info varchar(100)
-- }

-- Table customers {
--   customer_id int [pk, increment]
--   username varchar(100) [unique, not null]
--   password varchar(255) [not null]
--   name varchar(100) [not null]
--   email varchar(100) [unique, not null]
--   phone_number varchar(20)
--   payment_info varchar(255)
--   created_at timestamp
-- }

-- Table charging_stations {
--   station_id int [pk, increment]
--   admin_id int
--   station_name varchar(200) [not null]
--   latitude decimal(10,6) [not null]
--   longitude decimal(10,6) [not null]
--   connector_type varchar(50)
--   charging_watt int
--   total_slots int
--   available_slots int
--   price_per_kwh decimal(10,2)
--   status varchar(20)
--   description text
--   operating_hours varchar(100)
--   average_wait_time int
--   last_updated timestamp
-- }

-- Table reservations {
--   reservation_id int [pk, increment]
--   customer_id int
--   station_id int
--   admin_id int
--   slot_number int
--   start_time timestamp [not null]
--   end_time timestamp [not null]
--   total_price decimal(10,2)
--   status varchar(20)
-- }

-- Table payments {
--   payment_id int [pk, increment]
--   reservation_id int
--   payment_date timestamp
--   payment_method varchar(50)
--   amount decimal(10,2) [not null]
--   payment_status varchar(50)
-- }

-- Ref: charging_stations.admin_id > admins.admin_id
-- Ref: reservations.customer_id > customers.customer_id
-- Ref: reservations.station_id > charging_stations.station_id
-- Ref: reservations.admin_id > admins.admin_id
-- Ref: payments.reservation_id > reservations.reservation_id
