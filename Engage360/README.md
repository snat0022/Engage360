# Engage360 - Advanced Fitness Program Management Platform

A comprehensive Vue.js application for managing fitness programs with advanced features including serverless cloud functions, geolocation services, accessibility compliance, and robust data export capabilities.

## 🚀 Advanced Features Implemented

### BR (E.1): Cloud Functions ✅
- **Firebase Cloud Functions** for serverless server-side processing
- **Automated email notifications** and bulk email management
- **Data export generation** in multiple formats (CSV, PDF, Excel)
- **Real-time notifications** and admin activity logging
- **Scheduled data validation** and cleanup
- **SendGrid integration** for robust email delivery

### BR (E.2): Geo Location Services ✅
- **MapBox integration** with interactive maps and multiple map styles
- **Places of Interest Search** with category filtering and radius-based discovery
- **Advanced Trip Planning** with multi-destination support and route optimization
- **Real-Time Navigation** with turn-by-turn directions and voice guidance
- **Geolocation Services** with location tracking and permission management
- **Interactive Map Explorer** with traffic, weather, and satellite overlays
- **Location Management** with favorites, reviews, and detailed place information

### BR (E.3): Accessibility Compliance (WCAG 2.1 AA) ✅
- **Keyboard navigation** with skip links and focus management
- **Screen reader support** with ARIA labels and live regions
- **High contrast mode** and large text options
- **Reduced motion** support for users with vestibular disorders
- **Focus management** for modals and dynamic content
- **Accessibility validation** tools and automated testing

### BR (E.4): Enhanced Data Export ✅
- **Multiple formats**: CSV, PDF, Excel, JSON
- **Advanced filtering** with date ranges, text search, and status filters
- **Real-time preview** of export data before download
- **Export history** and management system
- **Batch processing** for large datasets
- **Custom field selection** and data transformation

## 🛠️ Technology Stack

### Frontend
- **Vue.js 3** with Composition API
- **Bootstrap 5** for responsive design
- **MapBox GL JS** for mapping functionality
- **Firebase SDK** for real-time data

### Backend
- **Firebase Cloud Functions** (Node.js 20)
- **Firestore** for data storage
- **Firebase Storage** for file management
- **SendGrid** for email services

### Development Tools
- **Vite** for build tooling
- **ESLint** for code quality
- **TypeScript** for Cloud Functions
- **Git** for version control

## Getting Started

### Prerequisites
- Node.js 20.19.0 or higher
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Create .env file
   VITE_SENDGRID_API_KEY=your_sendgrid_api_key
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

### Firebase Setup

1. Create a Firebase project
2. Enable Authentication with Google and Email/Password providers
3. Update `src/firebase/config.js` with your Firebase configuration

### SendGrid Setup

1. Create a SendGrid account
2. Generate an API key
3. Add the API key to your environment variables
4. Verify your sender email address

## Deployment

### Cloudflare Pages

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to Cloudflare Pages:
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set build output directory: `dist`
   - Add environment variables in Cloudflare Pages settings

## Project Structure

```
src/
├── components/
│   ├── InteractiveTable.vue    # Reusable table component
│   ├── EmailComposer.vue       # Email composition component
│   ├── MapContainer.vue        # Interactive map component
│   ├── PlacesOfInterest.vue    # Places discovery component
│   ├── TripPlanner.vue         # Trip planning component
│   ├── NavigationPanel.vue     # Navigation component
│   └── Bheader.vue             # Navigation header
├── views/
│   ├── AdminView.vue           # Admin dashboard with tables
│   ├── RatingsView.vue         # Ratings management
│   ├── MapsView.vue            # Interactive maps and navigation
│   └── Login.vue               # Authentication page
├── stores/
│   └── firebaseAuth.js         # Firebase auth store
├── services/
│   ├── emailService.js         # SendGrid email service
│   ├── mapService.js           # MapBox integration service
│   └── geolocationService.js   # Geolocation tracking service
└── firebase/
    └── config.js               # Firebase configuration
```

## Features Overview

### Authentication System
- Google OAuth integration
- Email/password authentication
- Role-based access control (admin/user)
- Secure session management

### Email Management
- Compose emails with rich text
- File attachment support
- Email templates for welcome messages
- Error handling and validation

### Data Management
- Interactive tables with sorting and searching
- Pagination for large datasets
- Real-time data updates
- Export functionality (CSV)

### Interactive Maps & Navigation
- **Map Explorer**: Interactive MapBox integration with multiple map styles
- **Places Discovery**: Search and filter places of interest by category and radius
- **Trip Planning**: Multi-destination trip planning with route optimization
- **Real-Time Navigation**: Turn-by-turn directions with voice guidance simulation
- **Location Services**: GPS tracking, geolocation, and location management
- **Map Controls**: Traffic overlay, weather information, satellite/terrain views

### Admin Dashboard
- User management with CRUD operations
- Security logs monitoring
- Registration submissions tracking
- Statistics overview

## Security Features

- Firebase Authentication for secure user management
- Role-based route protection
- Input validation and sanitization
- File upload security (type and size validation)
- Environment variable protection for API keys

## Performance Optimizations

- Lazy loading for components
- Efficient data pagination
- Optimized Firebase queries
- Responsive design for mobile devices
- Build optimization with Vite

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.