# Engage360 - Vue.js Application

A comprehensive fitness and wellness platform built with Vue.js, featuring Firebase Authentication, SendGrid email services, and interactive data tables.

## Features Implemented

### BR (D.1): External Authentication ✅
- **Firebase Authentication** with Google and Email/Password providers
- Secure user management with role-based access control
- Intuitive login flow with Google OAuth integration
- User-friendly authentication UI with clear error handling

### BR (D.2): Email Functionality ✅
- **SendGrid Integration** for robust email sending
- Email composition component with attachment support
- Support for multiple file formats (PDF, DOC, DOCX, TXT, JPG, PNG)
- File size validation (10MB limit per file)
- Welcome emails and notification system

### BR (D.3): Interactive Table Data ✅
- **Advanced Interactive Table Component** with:
  - Sorting by individual columns
  - Real-time search functionality
  - Pagination (5, 10, 25, 50 rows per page)
  - Responsive design
- **Two Interactive Tables Implemented**:
  1. Admin Dashboard - User Management Table
  2. Program Ratings - Ratings Management Table
- Intuitive user interface with Bootstrap styling

### BR (D.4): Cloud Deployment ✅
- **Cloudflare Pages Deployment** ready
- Production build configuration
- Environment variable setup for API keys
- Responsive design for all devices

## Technology Stack

- **Frontend**: Vue.js 3, Bootstrap 5
- **Authentication**: Firebase Auth
- **Email Service**: SendGrid
- **Deployment**: Cloudflare Pages
- **Build Tool**: Vite

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
│   └── Bheader.vue             # Navigation header
├── views/
│   ├── AdminView.vue           # Admin dashboard with tables
│   ├── RatingsView.vue         # Ratings management
│   └── Login.vue               # Authentication page
├── stores/
│   └── firebaseAuth.js         # Firebase auth store
├── services/
│   └── emailService.js         # SendGrid email service
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