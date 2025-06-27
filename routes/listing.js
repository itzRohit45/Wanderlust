const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const bookingController = require("../controllers/bookings.js");
const multer = require("multer");
const { storage, cloudinary } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

//new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//search route
router.get("/search", wrapAsync(listingController.searchListings));

//advanced search route
router.get("/advanced-search", wrapAsync(listingController.advancedSearch));

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

//edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

// Booking routes
router.get(
  "/:id/book",
  isLoggedIn,
  wrapAsync(bookingController.renderBookingForm)
);
router.post(
  "/:id/book/process-payment",
  wrapAsync(bookingController.processPayment)
);

module.exports = router;
