-- Insert Mock Admins
INSERT INTO admins (username, password, name, email, contact_info) VALUES 
('admin_tesla', 'admin123', 'Tesla Admin', 'admin@tesla.com', '02-123-4567'),
('admin_pea', 'admin123', 'PEA Volta Admin', 'admin@pea.co.th', '02-987-6543');

-- Insert Mock Customers
INSERT INTO customers (username, password, name, email, phone_number) VALUES 
('driver01', 'password123', 'John Driver', 'john@test.com', '081-234-5678'),
('jane_doe', 'password123', 'Jane Doe', 'jane@test.com', '089-876-5432');

-- Insert Charging Stations
INSERT INTO charging_stations (admin_id, station_name, latitude, longitude, connector_type, charging_watt, total_slots, available_slots, price_per_kwh, status, description) VALUES 
-- Bangkok
(1, 'Tesla Supercharger - Central World', 13.7466, 100.5393, 'Supercharger', 250, 4, 2, 7.50, 'Available', 'Located at B1 Parking'),
(2, 'PEA Volta - Bangchak', 13.7845, 100.5623, 'CCS2', 150, 2, 0, 6.50, 'Busy', 'Near Coffee Shop'),
(2, 'EA Anywhere - Siam Paragon', 13.7469, 100.5349, 'Type 2', 50, 6, 6, 8.00, 'Available', 'Floor 3, Pillar 24'),
(1, 'EVgo - Don Mueang Airport', 13.9137, 100.6046, 'CHAdeMO', 50, 2, 0, 7.00, 'Maintenance', 'Temporarily closed'),
(1, 'Shell Recharge - Sukhumvit', 13.7302, 100.5694, 'CCS', 100, 2, 2, 9.00, 'Available', '24/7 Access'),

-- Upcountry
(2, 'Pattaya EV Station', 12.9276, 100.8771, 'CCS2', 120, 2, 2, 7.00, 'Available', 'Beach Road Access'),
(2, 'Hua Hin Charging Hub', 12.5684, 99.9577, 'Type 2', 22, 4, 3, 5.50, 'Available', 'Shopping Mall Parking'),
(2, 'Ayutthaya Historical Park', 14.3532, 100.5693, 'Type 2', 40, 2, 2, 6.00, 'Available', 'Tourist Center'),
(2, 'Chiang Mai EV Point', 18.7961, 98.9793, 'CCS2', 120, 3, 3, 7.00, 'Available', 'Nimman Soi 5'),
(1, 'Phuket Supercharger', 7.8804, 98.3923, 'Supercharger', 250, 4, 1, 8.00, 'Busy', 'Central Phuket Floresta'),

-- More Bangkok & Suburbs
(1, 'PTT Station - Ratchadapisek', 13.7744, 100.5744, 'CCS', 120, 4, 3, 6.50, 'Available', 'Next to Lotus Ratchada'),
(2, 'MG Super Charge - Mega Bangna', 13.6467, 100.6806, 'CCS', 150, 6, 4, 7.00, 'Available', 'Main Parking Area'),
(2, 'PEA VOLTA - Rama 2', 13.6667, 100.4333, 'CCS2', 120, 2, 1, 6.50, 'Available', 'Inside Bangchak Station'),
(2, 'MEA EV - Phloen Chit', 13.7433, 100.5489, 'Type 2', 44, 4, 4, 7.50, 'Available', 'MEA Head Office'),
(1, 'Shell Recharge - Rama 3', 13.6933, 100.5433, 'CCS', 100, 2, 2, 8.00, 'Available', 'Shell Gas Station'),
(1, 'EA Anywhere - IconSiam', 13.7267, 100.5106, 'Type 2', 22, 10, 8, 9.00, 'Available', 'Floor B1, B2'),
(1, 'Tesla Supercharger - EmQuartier', 13.7317, 100.5689, 'Supercharger', 250, 8, 3, 7.50, 'Available', 'Building C, Floor B1'),
(1, 'PTT EV Station PluZ - Vibhavadi', 13.8444, 100.5606, 'CCS', 120, 4, 4, 6.50, 'Available', 'Near Kasetsart University'),
(2, 'Caltex - Ladprao', 13.8044, 100.5844, 'CCS', 50, 2, 0, 7.00, 'Busy', 'Caltex Station'),
(2, 'Bangchak - Srinakarin', 13.6644, 100.6444, 'CHAdeMO', 50, 2, 2, 6.50, 'Available', 'Near Paradise Park'),
(2, 'MG Super Charge - Nonthaburi', 13.8589, 100.4856, 'CCS', 120, 4, 2, 7.00, 'Available', 'Rattanathibet Road'),
(1, 'EA Anywhere - Pathum Thani', 13.9844, 100.6144, 'Type 2', 22, 4, 4, 6.50, 'Available', 'Future Park Rangsit'),
(2, 'MEA EV - Benjakitti Park', 13.7311, 100.5589, 'Type 2', 44, 6, 6, 7.00, 'Available', 'Gate 1 Parking'),
(2, 'Bangchak - On Nut', 13.7044, 100.6044, 'CCS', 120, 2, 1, 6.50, 'Available', 'Sukhumvit 62 Area'),
(1, 'Caltex - Ramintra', 13.8544, 100.6544, 'CCS', 150, 4, 4, 7.00, 'Available', 'Ramintra KM 4'),

-- Regional Thailand
(2, 'PEA VOLTA - Saraburi', 14.5244, 100.9144, 'CCS2', 120, 2, 2, 6.50, 'Available', 'Friendship Highway'),
(1, 'PTT Station - Nakhon Pathom', 13.8244, 100.0444, 'CCS', 120, 4, 3, 6.50, 'Available', 'Phet Kasem Road'),
(1, 'EA Anywhere - Khao Yai', 14.5444, 101.3444, 'Type 2', 22, 2, 2, 8.50, 'Available', 'Near National Park Entrance'),
(2, 'MG Super Charge - Chonburi', 13.3644, 100.9844, 'CCS', 120, 4, 4, 7.00, 'Available', 'By-Pass Chonburi'),
(1, 'Shell Recharge - Rayong', 12.6844, 101.2744, 'CCS', 100, 2, 2, 7.50, 'Available', 'Sukhumvit Rayong'),
(2, 'PEA VOLTA - Khon Kaen', 16.4411, 102.8311, 'CCS2', 120, 2, 1, 6.50, 'Available', 'Mitrapap Highway'),
(1, 'PTT EV Station - Udon Thani', 17.4111, 102.7911, 'CCS', 120, 4, 4, 6.50, 'Available', 'Near UD Town'),
(1, 'EA Anywhere - Nakhon Ratchasima', 14.9744, 102.1044, 'Type 2', 44, 4, 4, 7.00, 'Available', 'The Mall Korat'),
(2, 'MG Super Charge - Surat Thani', 9.1411, 99.3311, 'CCS', 120, 2, 2, 7.00, 'Available', 'Highway 41'),
(2, 'PEA VOLTA - Krabi', 8.0811, 98.9111, 'CCS2', 120, 2, 1, 6.50, 'Available', 'Near Krabi Town'),
(1, 'Tesla Supercharger - Maya Chiang Mai', 18.8022, 98.9672, 'Supercharger', 250, 8, 5, 7.50, 'Available', 'Parking Floor B1'),
(1, 'PTT EV Station - Chiang Rai', 19.9044, 99.8344, 'CCS', 120, 2, 2, 6.50, 'Available', 'Near Chiang Rai Airport'),
(1, 'PTT Station - Samut Songkhram', 13.4144, 99.9944, 'CCS', 50, 2, 2, 6.50, 'Available', 'Rama 2 Outbound'),
(2, 'PEA VOLTA - Phetchaburi', 13.1111, 99.9411, 'CCS2', 120, 2, 2, 6.50, 'Available', 'Phet Kasem Road NB'),
(1, 'Shell Recharge - Songkhla', 7.1911, 100.5911, 'CCS', 100, 2, 2, 7.50, 'Available', 'Hat Yai City Area');

-- Insert Mock Reservations
INSERT INTO reservations (customer_id, station_id, admin_id, slot_number, start_time, end_time, status) VALUES
(1, 1, 1, 1, '2025-01-16 10:00:00', '2025-01-16 12:00:00', 'Confirmed'),
(2, 2, 2, 1, '2025-01-16 14:00:00', '2025-01-16 14:30:00', 'Pending');

-- Insert Mock Payments
INSERT INTO payments (reservation_id, amount, payment_method, payment_status) VALUES
(1, 450.00, 'Credit Card', 'Success');
