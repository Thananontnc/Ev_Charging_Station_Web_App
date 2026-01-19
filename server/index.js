const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    user: process.env.DB_USER || 'thananonchounudom',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'ev_charging_db',
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false // Enable SSL for production
});

// Test database connection
pool.connect()
    .then(() => console.log('✅ Connected to PostgreSQL Database'))
    .catch(err => console.error('❌ Database connection error:', err.stack));

// ============= AUTH ROUTES =============

// Register User (Drivers)
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }

        // Generate username from email
        const username = email.split('@')[0] + Math.floor(Math.random() * 1000);

        const result = await pool.query(`
            INSERT INTO customers (username, password, name, email)
            VALUES ($1, $2, $3, $4)
            RETURNING customer_id as id, name, email, username
        `, [username, password, name, email]);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ success: false, error: 'Email or username already exists' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

// Login User/Admin
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }

        let queryText = '';
        if (role === 'admin') {
            queryText = 'SELECT admin_id as id, name, email, username, password FROM admins WHERE email = $1';
        } else {
            queryText = 'SELECT customer_id as id, name, email, username, password FROM customers WHERE email = $1';
        }

        const result = await pool.query(queryText, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // In production, use bcrypt.compare
        if (user.password !== password) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        // Remove password before sending back
        delete user.password;

        res.json({
            success: true,
            message: 'Login successful',
            user: { ...user, role }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============= API ROUTES =============

// GET all stations (with optional filtering)
app.get('/api/stations', async (req, res) => {
    try {
        const { search, type, available } = req.query;
        let queryText = `
            SELECT 
                station_id as id,
                station_name as name,
                CONCAT(latitude, ', ', longitude) as address,
                latitude as lat,
                longitude as lng,
                connector_type as type,
                status,
                price_per_kwh as price,
                total_slots,
                available_slots
            FROM charging_stations
            WHERE 1=1
        `;
        const queryParams = [];

        if (search) {
            queryParams.push(`%${search}%`);
            queryText += ` AND (station_name ILIKE $${queryParams.length} OR CAST(latitude AS TEXT) ILIKE $${queryParams.length} OR CAST(longitude AS TEXT) ILIKE $${queryParams.length})`;
        }

        if (type && type !== 'All Types') {
            queryParams.push(type);
            queryText += ` AND connector_type = $${queryParams.length}`;
        }

        if (available === 'true') {
            queryText += ` AND available_slots > 0`;
        }

        queryText += ` ORDER BY station_id`;

        const result = await pool.query(queryText, queryParams);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching stations:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET single station by ID (from database)
app.get('/api/stations/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                station_id as id,
                station_name as name,
                CONCAT(latitude, ', ', longitude) as address,
                latitude as lat,
                longitude as lng,
                connector_type as type,
                status,
                price_per_kwh as price,
                total_slots,
                available_slots,
                description
            FROM charging_stations
            WHERE station_id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Station not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error fetching station:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST create a new reservation (to database)
app.post('/api/reservations', async (req, res) => {
    const client = await pool.connect();
    try {
        const { station, date, timeSlot, duration, notes, customerId } = req.body;

        if (!station || !date || !timeSlot || !duration || !customerId) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        await client.query('BEGIN');

        // 1. Check if station has available slots
        const stationRes = await client.query('SELECT available_slots, total_slots, price_per_kwh FROM charging_stations WHERE station_id = $1 FOR UPDATE', [station.id]);

        if (stationRes.rows.length === 0) {
            throw new Error('Station not found');
        }

        const { available_slots, total_slots, price_per_kwh } = stationRes.rows[0];

        if (available_slots <= 0) {
            throw new Error('No slots available at this station');
        }

        // 2. Calculate end time and total price
        const startTime = new Date(`${date} ${timeSlot}`);
        const now = new Date();

        if (startTime < now) {
            throw new Error('Cannot book a time in the past');
        }

        const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);

        // Mocking kWh based on duration and a constant charging rate (e.g., 50kW)
        const estimatedKwh = duration * 50;
        const totalPrice = estimatedKwh * price_per_kwh;

        // 3. Insert reservation
        const assignedSlot = total_slots - available_slots + 1;
        const reservationResult = await client.query(`
            INSERT INTO reservations (customer_id, station_id, slot_number, start_time, end_time, total_price, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING reservation_id as id, start_time, end_time, total_price, status, slot_number
        `, [
            customerId,
            station.id,
            assignedSlot,
            startTime,
            endTime,
            totalPrice,
            'Confirmed'
        ]);

        // 4. Update station's available slots
        const newAvailableSlots = available_slots - 1;
        const newStatus = newAvailableSlots === 0 ? 'Busy' : 'Available';

        await client.query(`
            UPDATE charging_stations 
            SET available_slots = $1, status = $2 
            WHERE station_id = $3
        `, [newAvailableSlots, newStatus, station.id]);

        await client.query('COMMIT');

        const newBooking = {
            id: reservationResult.rows[0].id,
            stationId: station.id,
            stationName: station.name,
            address: station.address,
            date,
            time: timeSlot,
            duration,
            totalPrice: totalPrice.toFixed(2),
            slotNumber: assignedSlot,
            status: 'Confirmed'
        };

        res.status(201).json({
            success: true,
            message: 'Reservation created successfully',
            data: newBooking
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating reservation:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
});

// GET all bookings/reservations (from database)
app.get('/api/reservations', async (req, res) => {
    try {
        const { customerId } = req.query;
        let queryText = `
            SELECT 
                r.reservation_id as id,
                cs.station_name as "stationName",
                CONCAT(cs.latitude, ', ', cs.longitude) as address,
                TO_CHAR(r.start_time, 'YYYY-MM-DD') as date,
                TO_CHAR(r.start_time, 'HH24:MI') as time,
                EXTRACT(HOUR FROM (r.end_time - r.start_time)) as duration,
                r.total_price as "totalPrice",
                r.slot_number as "slotNumber",
                r.status
            FROM reservations r
            JOIN charging_stations cs ON r.station_id = cs.station_id
        `;
        const queryParams = [];

        if (customerId) {
            queryParams.push(customerId);
            queryText += ` WHERE r.customer_id = $1`;
        }

        queryText += ` ORDER BY r.start_time DESC`;

        const result = await pool.query(queryText, queryParams);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============= ADMIN API ROUTES =============

// GET Admin Dashboard Stats
app.get('/api/admin/stats', async (req, res) => {
    try {
        const { adminId } = req.query;
        if (!adminId) return res.status(400).json({ success: false, error: 'Admin ID required' });

        let resCount, pendingCount, revenue, dailyRevenue, stationCount;

        if (adminId === 'all') {
            resCount = await pool.query('SELECT COUNT(*) FROM reservations');
            pendingCount = await pool.query("SELECT COUNT(*) FROM reservations WHERE status = 'Pending'");
            revenue = await pool.query("SELECT SUM(total_price) FROM reservations WHERE status != 'Cancelled'");
            dailyRevenue = await pool.query("SELECT SUM(total_price) FROM reservations WHERE status != 'Cancelled' AND start_time >= NOW() - INTERVAL '1 day'");
            stationCount = await pool.query("SELECT COUNT(*) FROM charging_stations WHERE status != 'Maintenance'");
        } else {
            resCount = await pool.query('SELECT COUNT(*) FROM reservations r JOIN charging_stations cs ON r.station_id = cs.station_id WHERE cs.admin_id = $1', [adminId]);
            pendingCount = await pool.query("SELECT COUNT(*) FROM reservations r JOIN charging_stations cs ON r.station_id = cs.station_id WHERE cs.admin_id = $1 AND r.status = 'Pending'", [adminId]);
            revenue = await pool.query('SELECT SUM(r.total_price) FROM reservations r JOIN charging_stations cs ON r.station_id = cs.station_id WHERE cs.admin_id = $1 AND r.status != $2', [adminId, 'Cancelled']);
            dailyRevenue = await pool.query(`
                SELECT SUM(r.total_price) 
                FROM reservations r 
                JOIN charging_stations cs ON r.station_id = cs.station_id 
                WHERE cs.admin_id = $1 AND r.status != $2 AND r.start_time >= NOW() - INTERVAL '1 day'
            `, [adminId, 'Cancelled']);
            stationCount = await pool.query("SELECT COUNT(*) FROM charging_stations WHERE admin_id = $1 AND status != 'Maintenance'", [adminId]);
        }

        res.json({
            success: true,
            data: {
                totalReservations: parseInt(resCount.rows[0].count),
                pendingApprovals: parseInt(pendingCount.rows[0].count),
                totalRevenue: parseFloat(revenue.rows[0].sum || 0).toFixed(2),
                dailyRevenue: parseFloat(dailyRevenue.rows[0].sum || 0).toFixed(2),
                activeStations: parseInt(stationCount.rows[0].count)
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET Admin Reservations (with filters)
app.get('/api/admin/reservations', async (req, res) => {
    try {
        const { adminId, status, stationId, search } = req.query;
        if (!adminId) return res.status(400).json({ success: false, error: 'Admin ID required' });

        let queryText = `
            SELECT 
                r.reservation_id as id,
                c.name as "userName",
                cs.station_name as "stationName",
                TO_CHAR(r.start_time, 'Mon DD, YYYY HH:MI AM') as start,
                TO_CHAR(r.end_time, 'Mon DD, YYYY HH:MI AM') as "end",
                r.total_price as total,
                r.status,
                r.slot_number as slot,
                r.customer_id as "userId"
            FROM reservations r
            JOIN customers c ON r.customer_id = c.customer_id
            JOIN charging_stations cs ON r.station_id = cs.station_id
        `;
        const queryParams = [];
        let whereClause = '';

        if (adminId !== 'all') {
            queryParams.push(adminId);
            whereClause = ` WHERE cs.admin_id = $${queryParams.length}`;
        } else {
            whereClause = ` WHERE 1=1`;
        }

        if (status && status !== 'All statuses') {
            queryParams.push(status);
            whereClause += ` AND r.status = $${queryParams.length}`;
        }

        if (stationId && stationId !== 'Select a station' && stationId !== 'all') {
            queryParams.push(stationId);
            whereClause += ` AND r.station_id = $${queryParams.length}`;
        }

        if (search) {
            queryParams.push(`%${search}%`);
            whereClause += ` AND (c.name ILIKE $${queryParams.length} OR cs.station_name ILIKE $${queryParams.length})`;
        }

        queryText += whereClause + ` ORDER BY r.start_time DESC`;

        const result = await pool.query(queryText, queryParams);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching admin reservations:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET Search Suggestions for Reservations
app.get('/api/admin/reservations/suggestions', async (req, res) => {
    try {
        const { search, adminId } = req.query;
        if (!search) return res.json({ success: true, data: [] });

        const queryParams = [`%${search}%`];
        let adminFilter = '';
        if (adminId && adminId !== 'all') {
            queryParams.push(adminId);
            adminFilter = ` AND cs.admin_id = $2`;
        }

        const query = `
            (SELECT DISTINCT c.name as suggestion, 'User' as type
             FROM reservations r
             JOIN customers c ON r.customer_id = c.customer_id
             JOIN charging_stations cs ON r.station_id = cs.station_id
             WHERE c.name ILIKE $1 ${adminFilter})
            UNION
            (SELECT DISTINCT cs.station_name as suggestion, 'Station' as type
             FROM reservations r
             JOIN charging_stations cs ON r.station_id = cs.station_id
             WHERE cs.station_name ILIKE $1 ${adminFilter})
            LIMIT 10
        `;

        const result = await pool.query(query, queryParams);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET Admin Payments
app.get('/api/admin/payments', async (req, res) => {
    try {
        const { adminId } = req.query;
        if (!adminId) return res.status(400).json({ success: false, error: 'Admin ID required' });

        let queryText = `
            SELECT 
                p.payment_id as id,
                p.reservation_id as "reservationId",
                p.amount,
                p.payment_method as method,
                p.payment_status as status,
                TO_CHAR(p.payment_date, 'Mon DD, YYYY HH:MI AM') as "createdAt"
            FROM payments p
            JOIN reservations r ON p.reservation_id = r.reservation_id
            JOIN charging_stations cs ON r.station_id = cs.station_id
        `;
        const queryParams = [];

        if (adminId !== 'all') {
            queryText += ` WHERE cs.admin_id = $1`;
            queryParams.push(adminId);
        }

        queryText += ` ORDER BY p.payment_date DESC`;
        const result = await pool.query(queryText, queryParams);

        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching admin payments:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET Single Payment Detail
app.get('/api/admin/payments/:id', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.payment_id as id,
                p.reservation_id as "reservationId",
                p.amount,
                p.payment_method as method,
                p.payment_status as status,
                TO_CHAR(p.payment_date, 'Mon DD, YYYY HH:MI AM') as "createdAt",
                r.customer_id as "userId",
                c.name as "userName"
            FROM payments p
            JOIN reservations r ON p.reservation_id = r.reservation_id
            JOIN customers c ON r.customer_id = c.customer_id
            WHERE p.payment_id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET All Stations for a specific Operator
app.get('/api/operator/stations', async (req, res) => {
    try {
        const { adminId } = req.query;
        if (!adminId) return res.status(400).json({ success: false, error: 'Admin ID required' });

        const result = await pool.query('SELECT * FROM charging_stations WHERE admin_id = $1 ORDER BY station_id ASC', [adminId]);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// CREATE New Station
app.post('/api/operator/stations', async (req, res) => {
    try {
        const { admin_id, station_name, latitude, longitude, connector_type, charging_watt, total_slots, price_per_kwh, status, description, operating_hours, average_wait_time } = req.body;

        const result = await pool.query(`
            INSERT INTO charging_stations 
            (admin_id, station_name, latitude, longitude, connector_type, charging_watt, total_slots, available_slots, price_per_kwh, status, description, operating_hours, average_wait_time)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `, [admin_id, station_name, latitude, longitude, connector_type, charging_watt, total_slots, price_per_kwh, status, description, operating_hours, average_wait_time || 0]);

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// UPDATE Station Info
app.put('/api/operator/stations/:id', async (req, res) => {
    try {
        const { station_name, latitude, longitude, connector_type, charging_watt, total_slots, price_per_kwh, status, description, operating_hours, average_wait_time } = req.body;

        const result = await pool.query(`
            UPDATE charging_stations 
            SET station_name = $1, latitude = $2, longitude = $3, connector_type = $4, charging_watt = $5, 
                total_slots = $6, available_slots = LEAST(available_slots, $6), price_per_kwh = $7, 
                status = $8, description = $9, operating_hours = $10, average_wait_time = $11
            WHERE station_id = $12
            RETURNING *
        `, [station_name, latitude, longitude, connector_type, charging_watt, total_slots, price_per_kwh, status, description, operating_hours, average_wait_time, req.params.id]);

        if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Station not found' });
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE Station
app.delete('/api/operator/stations/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM reservations WHERE station_id = $1', [req.params.id]);
        const result = await pool.query('DELETE FROM charging_stations WHERE station_id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Station not found' });
        res.json({ success: true, message: 'Station deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET Admin's Stations (for filters) ... (kept)

// UPDATE Payment Status
app.put('/api/admin/payments/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const result = await pool.query(
            'UPDATE payments SET payment_status = $1 WHERE payment_id = $2 RETURNING *',
            [status, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }
        res.json({ success: true, message: 'Status updated successfully', data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// PROCESS Refund
app.post('/api/admin/payments/:id/refund', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Get payment and reservation details
        const paymentResult = await client.query(`
            SELECT p.reservation_id, p.amount, r.station_id 
            FROM payments p 
            JOIN reservations r ON p.reservation_id = r.reservation_id 
            WHERE p.payment_id = $1 FOR UPDATE
        `, [req.params.id]);

        if (paymentResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Payment not found' });
        }

        const { reservation_id, station_id } = paymentResult.rows[0];

        // 2. Update payment status to Refunded
        await client.query('UPDATE payments SET payment_status = $1 WHERE payment_id = $2', ['Refunded', req.params.id]);

        // 3. Update reservation status to Cancelled
        await client.query('UPDATE reservations SET status = $1 WHERE reservation_id = $2', ['Cancelled', reservation_id]);

        // 4. Free up the slot at the station
        await client.query(`
            UPDATE charging_stations 
            SET available_slots = LEAST(total_slots, available_slots + 1),
                status = 'Available'
            WHERE station_id = $1
        `, [station_id]);

        await client.query('COMMIT');
        res.json({ success: true, message: 'Refund processed successfully and reservation cancelled.' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Refund error:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
});

// ADMIN: Update reservation status (Confirm/Cancel)
app.put('/api/admin/reservations/:id/status', async (req, res) => {
    const { status } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Get current reservation status and station
        const resvResult = await client.query('SELECT station_id, status FROM reservations WHERE reservation_id = $1 FOR UPDATE', [req.params.id]);
        if (resvResult.rows.length === 0) return res.status(404).json({ success: false, error: 'Reservation not found' });

        const oldStatus = resvResult.rows[0].status;
        const stationId = resvResult.rows[0].station_id;

        // 2. Update status
        await client.query('UPDATE reservations SET status = $1 WHERE reservation_id = $2', [status, req.params.id]);

        // 3. Logic for slots if cancelling
        if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
            await client.query(`
                UPDATE charging_stations 
                SET available_slots = LEAST(total_slots, available_slots + 1),
                    status = 'Available'
                WHERE station_id = $1
            `, [stationId]);
        }

        await client.query('COMMIT');
        res.json({ success: true, message: `Reservation marked as ${status}` });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
});

// GET Admin's Stations (for filters)
app.get('/api/admin/my-stations', async (req, res) => {
    try {
        const { adminId } = req.query;
        if (!adminId) return res.status(400).json({ success: false, error: 'Admin ID required' });

        let query = 'SELECT station_id as id, station_name as name FROM charging_stations';
        const params = [];

        if (adminId !== 'all') {
            query += ' WHERE admin_id = $1';
            params.push(adminId);
        }

        query += ' ORDER BY station_id ASC';
        const result = await pool.query(query, params);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// CANCEL a reservation (update status and free up slot)
app.put('/api/reservations/:id/cancel', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Get reservation details including start_time
        const resvResult = await client.query('SELECT station_id, status, start_time FROM reservations WHERE reservation_id = $1 FOR UPDATE', [req.params.id]);

        if (resvResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Reservation not found' });
        }

        const { station_id, status, start_time } = resvResult.rows[0];

        // TIME LOGIC: Compare normalized dates
        const now = new Date();
        const startTimeDate = new Date(start_time);

        // Give 5 minutes of "grace period" or just check if it's clearly passed
        // We allow cancellation if it hasn't started yet, with a small 5-min buffer
        const gracePeriodMs = 5 * 60 * 1000;
        if ((startTimeDate.getTime() + gracePeriodMs) < now.getTime()) {
            return res.status(400).json({
                success: false,
                error: `This reservation started at ${startTimeDate.toLocaleTimeString()}. You can only cancel before it starts.`
            });
        }

        if (status === 'Cancelled') {
            return res.status(400).json({ success: false, error: 'This reservation is already cancelled.' });
        }

        // 2. Update reservation status
        await client.query('UPDATE reservations SET status = $1 WHERE reservation_id = $2', ['Cancelled', req.params.id]);

        // 3. Increment available slots at the station (only if it was Confirmed/Pending)
        await client.query(`
            UPDATE charging_stations 
            SET available_slots = LEAST(total_slots, available_slots + 1),
                status = 'Available'
            WHERE station_id = $1
        `, [station_id]);

        await client.query('COMMIT');
        res.json({ success: true, message: 'Reservation cancelled successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error cancelling reservation:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📍 API Endpoints:`);
    console.log(`   GET  /api/stations - Get all stations`);
    console.log(`   GET  /api/stations/:id - Get single station`);
    console.log(`   POST /api/reservations - Create reservation`);
    console.log(`   GET  /api/reservations - Get all reservations`);
    console.log(`   DELETE /api/reservations/:id - Delete reservation`);
});
