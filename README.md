# Wanderlust - Travel Booking Platform

## Overview
A complete travel booking platform built with Bootstrap,Express.Js, MongoDB, and EJS. Features property listings, user authentication, booking system with mock payments, and PDF receipt generation.

## Current Payment System
The application uses a **Mock Payment System** that simulates real payment processing without requiring external payment gateway credentials. This makes it perfect for development, testing, and demonstration purposes.

### Payment Features:
- ✅ **Multiple Payment Methods**: Card, UPI, NetBanking, Wallet
- ✅ **Realistic Flow**: 2-second processing delay with loading states
- ✅ **Error Simulation**: ~10% failure rate for testing
- ✅ **Auto-generated**: Mock payment IDs and transaction details
- ✅ **PDF Receipts**: Automatic receipt generation
- ✅ **No Setup Required**: Works immediately without credentials

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
The `.env` file is already configured for mock payments. No additional setup needed!

### 3. Start the Application
```bash
npm start          # Production mode (clean output)
# OR
npm run dev        # Development mode with auto-restart
# OR  
npm run start-debug # Debug mode with deprecation warnings
```

### 4. Test the Booking System
1. Browse to `http://localhost:8080`
2. Register/Login to your account
3. Click "BOOK NOW" on any listing
4. Fill in booking details
5. Click "PAY NOW (DEMO)"
6. Watch the mock payment process!

## Features Implemented

### Core Features:
- **User Authentication** (Login/Signup)
- **Property Listings** with image uploads
- **Search & Filter** (by location, price, amenities)
- **Advanced Search** with sorting options
- **Booking System** with date validation
- **Mock Payment Processing**
- **PDF Receipt Generation**
- **My Bookings** page with history
- **Responsive Design**

### Payment System Benefits:
- **No External Dependencies**: No need for payment gateway accounts
- **Instant Testing**: Works immediately after setup
- **Realistic Behavior**: Simulates real payment flows
- **Error Handling**: Tests both success and failure scenarios
- **Development Friendly**: Perfect for demos and development

## Technology Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Frontend**: EJS templating, Bootstrap CSS (vanilla JS - no jQuery dependency)
- **File Upload**: Cloudinary integration
- **Authentication**: Passport.js
- **PDF Generation**: PDFKit
- **Payment**: Mock payment system (no external gateway)

## File Structure
```
├── controllers/        # Route controllers
├── models/            # Database models
├── routes/            # Express routes
├── views/             # EJS templates
├── public/            # Static assets
├── utils/             # Utility functions
└── app.js            # Main application file
```

## Documentation
- `IMPLEMENTATION_COMPLETE.md` - Complete feature documentation
- `MOCK_PAYMENT_SETUP.md` - Mock payment system details

## Future Enhancements
When ready for production, you can easily integrate real payment gateways like:
- Stripe (international)
- Razorpay (India)
- PayPal
- Square

The mock payment system can be replaced without changing the booking flow or UI.
