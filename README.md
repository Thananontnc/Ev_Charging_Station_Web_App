# 🔌 EV Charging Station Management System

**CSX3006 Database System - Second Semester Project**  
**Assumption University (ABAC)**

---

## 📋 Project Overview

A comprehensive web-based platform for managing Electric Vehicle (EV) charging stations across Thailand. This system provides real-time station availability, intelligent booking management, and advanced navigation features for EV drivers, while offering powerful administrative tools for charging station operators.

### 🎯 Key Features

#### For EV Drivers (Users)
- **🗺️ Interactive Map Search** - Real-time charging station locator with Google Maps-style 3D navigation
- **📍 Smart Filtering** - Filter by connector type (Type 2, CCS, CHAdeMO), charging speed (50kW, 120kW, 350kW), and availability
- **📅 Reservation System** - Book charging slots up to 24 hours in advance
- **🧭 Turn-by-Turn Navigation** - GPS-guided directions with ETA, distance remaining, and alternative routes
- **💳 Secure Payments** - Integrated payment processing with automatic invoicing
- **📊 User Dashboard** - View booking history, active reservations, and usage statistics

#### For Station Operators (Admins)
- **📈 Analytics Dashboard** - Real-time KPIs including revenue, bookings, and station performance
- **🏢 Station Management** - Full CRUD operations for charging stations
- **✅ Reservation Control** - Approve, confirm, or cancel bookings
- **💰 Financial Tracking** - Daily revenue, total earnings, and payment management
- **🔍 Advanced Search** - Find reservations by customer name or station with smart suggestions
- **📱 Operator Portal** - Dedicated interface for managing multiple charging locations

#### System Admin Features
- **🌐 Global Overview** - Monitor all stations across the network
- **📊 Multi-Tenant Support** - Manage multiple operators and their stations
- **🔐 Role-Based Access Control** - Separate permissions for users, operators, and system admins

---

## 🛠️ Technology Stack

### Frontend
- **React.js** - Modern UI framework
- **React Router** - Client-side routing
- **Leaflet.js** - Interactive maps with routing
- **Lucide React** - Beautiful icon library
- **CSS3** - Custom styling with animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database management
- **pg** - PostgreSQL client for Node.js

### Additional Libraries
- **Leaflet Routing Machine** - Turn-by-turn navigation
- **bcrypt** - Password hashing
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing

---

## 📁 Project Structure

```
Ev_Web_App_Project/
├── server/
│   ├── db/
│   │   ├── schema.sql          # Database schema
│   │   └── seeds.sql           # Sample data
│   ├── index.js                # Express server & API routes
│   ├── setupDb.js              # Database initialization
│   └── .env                    # Environment variables
├── src/
│   ├── components/
│   │   ├── MapComponent.jsx    # 3D navigation map
│   │   ├── Navbar.jsx          # Navigation bar
│   │   ├── StationModal.jsx    # Station CRUD modal
│   │   └── PaymentDetailModal.jsx
│   ├── pages/
│   │   ├── LandingPage.jsx     # Homepage
│   │   ├── LoginPage.jsx       # Authentication
│   │   ├── RegisterPage.jsx    # User registration
│   │   ├── UserDashboard.jsx   # Driver interface
│   │   ├── AdminDashboard.jsx  # System admin panel
│   │   └── OperatorPortal.jsx  # Station operator dashboard
│   ├── styles/
│   │   ├── Dashboard.css
│   │   ├── LandingPage.css
│   │   └── MapMarker.css       # Navigation UI styles
│   ├── App.jsx                 # Main application
│   └── main.jsx                # Entry point
├── package.json
└── README.md
```

---

## 🗄️ Database Schema

### Core Tables

#### `admins`
- Stores charging station operator/admin credentials
- Fields: `admin_id`, `username`, `password`, `name`, `email`, `contact_info`

#### `customers`
- EV driver accounts
- Fields: `customer_id`, `username`, `password`, `name`, `email`, `phone_number`, `payment_info`

#### `charging_stations`
- Charging station inventory
- Fields: `station_id`, `admin_id`, `station_name`, `latitude`, `longitude`, `connector_type`, `charging_watt`, `total_slots`, `available_slots`, `price_per_kwh`, `status`, `operating_hours`, `average_wait_time`

#### `reservations`
- Booking records
- Fields: `reservation_id`, `customer_id`, `station_id`, `slot_number`, `start_time`, `end_time`, `total_price`, `status`

#### `payments`
- Transaction history
- Fields: `payment_id`, `reservation_id`, `payment_date`, `payment_method`, `amount`, `payment_status`

### Relationships
- `charging_stations.admin_id` → `admins.admin_id`
- `reservations.customer_id` → `customers.customer_id`
- `reservations.station_id` → `charging_stations.station_id`
- `payments.reservation_id` → `reservations.reservation_id`

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/Thananontnc/Ev_Charging_Station_Web_App.git
cd Ev_Charging_Station_Web_App
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 3. Database Setup

**Create PostgreSQL Database:**
```bash
createdb ev_charging_db
```

**Configure Environment Variables:**
Create `server/.env`:
```env
DB_USER=your_postgres_username
DB_HOST=localhost
DB_NAME=ev_charging_db
DB_PASSWORD=your_postgres_password
DB_PORT=5432
PORT=5001
```

**Initialize Database:**
```bash
cd server
node setupDb.js
```

This will:
- Create all tables from `schema.sql`
- Seed sample data from `seeds.sql`
- Set up 40 charging stations across Thailand
- Create demo admin and customer accounts

### 4. Run the Application

**Start Backend Server:**
```bash
cd server
npm run dev
```
Server runs on: `http://localhost:5001`

**Start Frontend (in new terminal):**
```bash
npm run dev
```
Frontend runs on: `http://localhost:5173`

---

## 👥 Demo Accounts

### Admin/Operator Account
- **Username:** `admin1`
- **Password:** `admin123`
- Access: Operator Portal & Admin Dashboard

### Customer Account
- **Username:** `john_driver`
- **Password:** `password123`
- Access: User Dashboard & Booking System

---

## 🎨 Key Features Showcase

### 1. Advanced Navigation System
- **3D Camera Movements** - Smooth flyTo animations when selecting stations
- **ETA Display** - Real-time estimated arrival time
- **Distance Remaining** - Live distance counter
- **Alternative Routes** - Compare up to 3 different paths
- **Route Overview** - Bird's eye view of entire journey
- **Turn-by-Turn Instructions** - Step-by-step directions with icons

### 2. Smart Reservation Management
- **Real-time Availability** - Live slot updates
- **Time-based Pricing** - Dynamic cost calculation
- **Automatic Slot Assignment** - Intelligent slot allocation
- **Cancellation Policy** - Grace period before start time
- **Status Tracking** - Pending → Confirmed → Completed

### 3. Operator Analytics
- **KPI Dashboard** - Total revenue, bookings, daily earnings
- **Station Performance** - Active stations, utilization rates
- **Payment Tracking** - Transaction history with filters
- **Customer Insights** - Booking patterns and trends

### 4. System Administration
- **Multi-Tenant Architecture** - Manage multiple operators
- **Global Monitoring** - View all stations network-wide
- **Data Segregation** - Secure admin-specific data access
- **Bulk Operations** - Manage stations at scale

---

## 🔐 Security Features

- **Password Hashing** - bcrypt encryption for all credentials
- **SQL Injection Prevention** - Parameterized queries
- **Role-Based Access Control** - User/Admin/System Admin permissions
- **Session Management** - LocalStorage-based authentication
- **Data Validation** - Input sanitization on frontend and backend

---

## 📊 API Endpoints

### Authentication
- `POST /api/login` - User/Admin login
- `POST /api/register` - New user registration

### Stations
- `GET /api/stations` - Get all stations
- `GET /api/stations/:id` - Get single station
- `POST /api/operator/stations` - Create station (Admin)
- `PUT /api/operator/stations/:id` - Update station (Admin)
- `DELETE /api/operator/stations/:id` - Delete station (Admin)

### Reservations
- `POST /api/reservations` - Create booking
- `GET /api/reservations` - Get user bookings
- `GET /api/admin/reservations` - Get admin reservations
- `PUT /api/admin/reservations/:id/status` - Update status (Admin)
- `PUT /api/reservations/:id/cancel` - Cancel booking

### Payments
- `GET /api/admin/payments` - Get payment history (Admin)
- `POST /api/payments/:id/refund` - Process refund (Admin)

### Analytics
- `GET /api/admin/stats` - Get admin KPIs
- `GET /api/admin/my-stations` - Get admin's stations
- `GET /api/admin/reservations/suggestions` - Search suggestions

---

## 🎓 Course Information

**Course Code:** CSX3006  
**Course Name:** Database System  
**Institution:** Assumption University (ABAC)  
**Semester:** 2nd Semester, 2nd Year  
**Academic Year:** 2025-2026

### Project Objectives
1. Design and implement a relational database system
2. Develop CRUD operations with SQL
3. Create a full-stack web application with database integration
4. Implement user authentication and authorization
5. Build RESTful APIs for data management
6. Apply database normalization principles
7. Optimize queries for performance

### Learning Outcomes
- ✅ Database schema design and normalization
- ✅ SQL query optimization
- ✅ Transaction management
- ✅ Data integrity and constraints
- ✅ Backend API development
- ✅ Frontend-backend integration
- ✅ Real-world application deployment

---

## 🤝 Contributing

This is an academic project for CSX3006. For suggestions or improvements:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is created for educational purposes as part of the CSX3006 Database System course at Assumption University.

---

## 👨‍💻 Author

**Thananon Chounudom**  
Student ID: 6711424  
Email: thananonza123@gmail.com  
GitHub: [@Thananontnc](https://github.com/Thananontnc)

---

## 🐛 Known Issues & Future Enhancements

### Current Limitations
- Navigation requires internet connection for routing
- Payment integration is simulated (not connected to real payment gateway)
- No real-time notifications (email/SMS)

### Planned Features
- [ ] Real payment gateway integration (Stripe/PayPal)
- [ ] Email notifications for booking confirmations
- [ ] Mobile app (React Native)
- [ ] Voice-guided navigation
- [ ] EV battery range calculator
- [ ] Charging station reviews and ratings
- [ ] Loyalty program and rewards
- [ ] Multi-language support (Thai/English)

---

**Built with ❤️ for CSX3006 Database System**  