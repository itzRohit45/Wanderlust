const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");

const userController = require("../controllers/users.js");
const bookingController = require("../controllers/bookings.js");

router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup));

router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    wrapAsync(userController.login)
  );

// logout request
router.get("/logout", userController.logout);

// Booking routes
router.get(
  "/bookings/:id",
  isLoggedIn,
  wrapAsync(bookingController.showBooking)
);
router.get(
  "/bookings/:id/receipt",
  isLoggedIn,
  wrapAsync(bookingController.downloadReceipt)
);
router.get(
  "/my-bookings",
  isLoggedIn,
  wrapAsync(bookingController.getUserBookings)
);

module.exports = router;
