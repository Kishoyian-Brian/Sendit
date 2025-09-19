# SendIt - Parcel Delivery Management System

**The best option for parcel delivery with real-time tracking and comprehensive management**

SendIt is a full-stack parcel delivery management system built with Angular frontend and NestJS backend, featuring real-time tracking, role-based access control, and advanced route optimization.

## 🚀 Features

### 📦 **Parcel Management**
- Real-time parcel tracking with live location updates
- Comprehensive parcel lifecycle management (pending → in_transit → delivered)
- Advanced route optimization using OSRM (Open Source Routing Machine)
- Interactive map visualization with Leaflet
- Distance and estimated delivery time calculations

### 👥 **Multi-Role System**
- **Admin**: Complete system management, user/driver oversight, analytics
- **Driver**: Delivery management, location updates, route optimization
- **User**: Parcel tracking, profile management, delivery history

### 🗺️ **Advanced Mapping**
- Interactive parcel tracking with multiple location types
- Real-time driver location updates
- Route visualization with waypoints
- Geocoding and reverse geocoding services
- Distance calculations and travel time estimates

### 🔐 **Security & Authentication**
- JWT-based authentication system
- Role-based access control with guards
- Secure password reset with OTP verification
- Protected routes and API endpoints

### 📊 **Analytics & Reporting**
- Real-time statistics dashboard
- Delivery performance metrics
- Activity monitoring and logging
- Comprehensive admin analytics

## 🏗️ Architecture

### Frontend (Angular)
```
frontend/
├── src/app/
│   ├── components/
│   │   ├── admin/           # Admin dashboard and management
│   │   ├── auth/            # Authentication components
│   │   ├── driver/          # Driver dashboard and tools
│   │   ├── landingpage/     # Public pages (home, about, contact)
│   │   ├── map/             # Interactive map component
│   │   ├── toast/           # Notification system
│   │   └── user/            # User dashboard and profile
│   ├── guards/              # Route protection guards
│   ├── models/              # TypeScript interfaces
│   ├── pipes/               # Data transformation pipes
│   ├── services/            # API and business logic services
│   └── shared/              # Reusable components (navbar, footer)
```

### Backend (NestJS)
```
backend/
├── src/
│   ├── admin/               # Admin module and controllers
│   ├── auth/                # Authentication and authorization
│   ├── driver/              # Driver-specific functionality
│   ├── parcel/              # Parcel management
│   ├── user/                # User management
│   ├── tracking/            # Real-time tracking with WebSockets
│   ├── mailer/              # Email services
│   └── shared/              # Common utilities and DTOs
├── prisma/                  # Database schema and migrations
└── restclient/              # API testing endpoints
```

## 🛠️ Technology Stack

### Frontend
- **Angular 17+** - Modern web framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Leaflet** - Interactive maps
- **RxJS** - Reactive programming

### Backend
- **NestJS** - Scalable Node.js framework
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Primary database
- **JWT** - Authentication tokens
- **WebSockets** - Real-time communication

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SendIt
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Configure your database and other environment variables
   npx prisma generate
   npx prisma db push
   npm run start:dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000

## 📱 User Roles & Capabilities

### 🔑 Admin
- **Dashboard**: System overview with statistics
- **Parcel Management**: Create, edit, delete, and track parcels
- **Driver Management**: Promote users to drivers, manage driver assignments
- **User Management**: View and manage all users with pagination
- **Analytics**: Real-time statistics and activity monitoring

### 🚚 Driver
- **Dashboard**: Personal delivery statistics and performance
- **Active Deliveries**: Manage assigned parcels and update status
- **Location Updates**: Real-time location tracking and updates
- **Route Optimization**: Access to optimized delivery routes
- **Delivery History**: Track completed deliveries

### 📦 User
- **Tracking**: Track parcels using tracking numbers
- **Dashboard**: View personal parcel history and status
- **Profile Management**: Update personal information
- **Contact Support**: Submit inquiries and feedback

## 🗺️ Map Features

- **Real-time Tracking**: Live parcel location updates
- **Interactive Markers**: Different markers for pickup, delivery, and driver locations
- **Route Visualization**: Optimized delivery routes with waypoints
- **Distance Calculation**: Accurate distance and time estimates
- **Multiple Map Views**: Different perspectives for tracking and management

## 🔧 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Password reset initiation
- `POST /auth/verify-otp` - OTP verification
- `POST /auth/reset-password` - Password reset completion

### Parcel Management
- `GET /parcel/track/:trackingNumber` - Track parcel
- `GET /parcel/my-parcels` - User's parcels
- `POST /admin/parcels` - Create parcel (Admin)
- `PATCH /admin/parcels/:id` - Update parcel (Admin)
- `DELETE /admin/parcels/:id` - Delete parcel (Admin)

### Driver Operations
- `GET /driver/parcels` - Driver's assigned parcels
- `PATCH /driver/parcels/:id/location` - Update parcel location
- `PATCH /driver/parcels/:id/status` - Update parcel status
- `PATCH /driver/location` - Update driver location

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
```

### Frontend Testing
```bash
cd frontend
npm run test          # Unit tests
npm run e2e           # End-to-end tests
```

## 📊 Database Schema

The system uses PostgreSQL with Prisma ORM, featuring:
- **Users**: Authentication and profile data
- **Parcels**: Delivery information and tracking
- **Drivers**: Driver profiles and vehicle information
- **Tracking**: Real-time location and status updates

## 🔒 Security Features

- JWT token-based authentication
- Role-based access control
- Password encryption with bcrypt
- CORS protection
- Input validation and sanitization
- SQL injection prevention with Prisma

## 📈 Performance Optimizations

- Lazy loading for Angular modules
- Pagination for large datasets
- Real-time updates with WebSockets
- Efficient database queries with Prisma
- Caching for frequently accessed data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@sendit.com or join our Slack channel.

## 🔮 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] SMS notifications
- [ ] Advanced route optimization
- [ ] Driver performance scoring
- [ ] Customer rating system

---

**Built with ❤️ for efficient parcel delivery management**