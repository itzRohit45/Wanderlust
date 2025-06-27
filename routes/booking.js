const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");

const bookingController = require("../controllers/bookings.js");

// Show booking form
router.get(
  "/:id/book",
  isLoggedIn,
  wrapAsync(bookingController.renderBookingForm)
);

// Create payment order
router.post(
  "/:id/book/create-order",
  isLoggedIn,
  wrapAsync(bookingController.createPaymentOrder)
);

// Verify payment and create booking
router.post(
  "/:id/book/verify-payment",
  isLoggedIn,
  wrapAsync(bookingController.verifyPayment)
);

// Show booking details
router.get(
  "/bookings/:id",
  isLoggedIn,
  wrapAsync(bookingController.showBooking)
);

// Download receipt
router.get(
  "/bookings/:id/receipt",
  isLoggedIn,
  wrapAsync(bookingController.downloadReceipt)
);

// User's bookings
router.get(
  "/my-bookings",
  isLoggedIn,
  wrapAsync(bookingController.getUserBookings)
);

module.exports = router;
