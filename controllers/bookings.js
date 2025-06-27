const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
const { v4: uuidv4 } = require("uuid");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

module.exports.renderBookingForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("owner");
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  res.render("users/book-new.ejs", { listing });
};

module.exports.processPayment = async (req, res) => {
  try {
    // Check if user is authenticated for AJAX requests
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        error: "Authentication required. Please login first.",
        redirect: "/login",
      });
    }

    const { id: listingId } = req.params;
    const { checkin, checkout, guests, total, paymentMethod } = req.body;

    console.log("Payment request received:", {
      listingId,
      checkin,
      checkout,
      guests,
      total,
      paymentMethod,
      userId: req.user._id,
    });

    // Validate listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate payment success (90% success rate for demo)
    const paymentSuccess = Math.random() > 0.1;

    if (!paymentSuccess) {
      return res.json({
        success: false,
        error: "Payment failed. Please try again.",
      });
    }

    // Generate mock payment details
    const paymentId = `pay_${uuidv4().replace(/-/g, "").substr(0, 16)}`;
    const orderId = `order_${uuidv4().replace(/-/g, "").substr(0, 16)}`;
    const signature = `sig_${uuidv4().replace(/-/g, "").substr(0, 20)}`;

    // Create booking
    const bookingId = `WL-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    const booking = new Booking({
      listing: listingId,
      user: req.user._id,
      checkIn: new Date(checkin),
      checkOut: new Date(checkout),
      guests: parseInt(guests),
      totalAmount: parseFloat(total),
      paymentId: paymentId,
      paymentOrderId: orderId,
      paymentSignature: signature,
      paymentStatus: "completed",
      bookingId: bookingId,
    });

    console.log("Creating booking with data:", booking);

    const savedBooking = await booking.save();
    console.log("Booking saved successfully:", savedBooking._id);

    // Generate PDF receipt
    try {
      const receiptPath = await generatePDFReceipt(
        savedBooking,
        listing,
        req.user
      );
      console.log("PDF receipt generated:", receiptPath);

      // Update booking with receipt URL
      savedBooking.receiptUrl = receiptPath;
      await savedBooking.save();
      console.log("Booking updated with receipt URL");
    } catch (pdfError) {
      console.error("PDF generation failed:", pdfError);
      // Continue without PDF - booking is still valid
    }

    res.json({
      success: true,
      bookingId: bookingId,
      redirectUrl: `/bookings/${savedBooking._id}`,
      message: "Payment successful! Booking confirmed.",
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      error: "Payment processing failed: " + error.message,
    });
  }
};

module.exports.showBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate("listing")
      .populate("user");

    if (!booking) {
      req.flash("error", "Booking not found!");
      return res.redirect("/listings");
    }

    // Check if user owns this booking
    if (!booking.user._id.equals(req.user._id)) {
      req.flash("error", "You don't have permission to view this booking!");
      return res.redirect("/listings");
    }

    res.render("users/booking-details.ejs", { booking });
  } catch (error) {
    console.error("Error showing booking:", error);
    req.flash("error", "Error loading booking details");
    res.redirect("/listings");
  }
};

module.exports.downloadReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate("listing")
      .populate("user");

    if (!booking) {
      req.flash("error", "Booking not found!");
      return res.redirect("/listings");
    }

    // Check if user owns this booking
    if (!booking.user._id.equals(req.user._id)) {
      req.flash("error", "You don't have permission to download this receipt!");
      return res.redirect("/listings");
    }

    if (!booking.receiptUrl || !fs.existsSync(booking.receiptUrl)) {
      // Regenerate PDF if it doesn't exist
      const receiptPath = await generatePDFReceipt(
        booking,
        booking.listing,
        booking.user
      );
      booking.receiptUrl = receiptPath;
      await booking.save();
    }

    const filename = `Wanderlust_Receipt_${booking.bookingId}.pdf`;
    res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-type", "application/pdf");

    const filestream = fs.createReadStream(booking.receiptUrl);
    filestream.pipe(res);
  } catch (error) {
    console.error("Error downloading receipt:", error);
    req.flash("error", "Error downloading receipt");
    res.redirect("/listings");
  }
};

// Helper function to generate PDF receipt
async function generatePDFReceipt(booking, listing, user) {
  return new Promise((resolve, reject) => {
    try {
      // Create receipts directory if it doesn't exist
      const receiptsDir = path.join(__dirname, "..", "public", "receipts");
      if (!fs.existsSync(receiptsDir)) {
        fs.mkdirSync(receiptsDir, { recursive: true });
      }

      const filename = `receipt_${booking.bookingId}.pdf`;
      const filepath = path.join(receiptsDir, filename);

      const doc = new PDFDocument({ margin: 50 });
      doc.pipe(fs.createWriteStream(filepath));

      // Header with logo area
      doc.fontSize(28).fillColor("#007bff").text("Wanderlust", 50, 50);
      doc
        .fontSize(12)
        .fillColor("#6c757d")
        .text("Your Home Away From Home", 50, 85);

      // Add a decorative line
      doc.strokeColor("#007bff").lineWidth(3);
      doc.moveTo(50, 110).lineTo(550, 110).stroke();

      // Title
      doc.fontSize(20).fillColor("#333").text("Booking Receipt", 50, 130);

      // Booking details section
      doc
        .fontSize(14)
        .fillColor("#007bff")
        .text("Booking Information", 50, 170);
      doc.fontSize(11).fillColor("#333");
      doc.text(`Booking ID: ${booking.bookingId}`, 70, 195);
      doc.text(
        `Booking Date: ${booking.createdAt.toLocaleDateString()}`,
        70,
        212
      );
      doc.text(`Payment ID: ${booking.paymentId}`, 70, 229);
      doc.text(`Status: ${booking.paymentStatus.toUpperCase()}`, 70, 246);

      // User details section
      doc.fontSize(14).fillColor("#007bff").text("Customer Details", 50, 280);
      doc.fontSize(11).fillColor("#333");
      doc.text(`Name: ${user.username}`, 70, 305);
      doc.text(
        `Email: ${user.email || `${user.username}@example.com`}`,
        70,
        322
      );

      // Listing details section
      doc.fontSize(14).fillColor("#007bff").text("Property Details", 50, 356);
      doc.fontSize(11).fillColor("#333");
      doc.text(`Property: ${listing.title}`, 70, 381);
      doc.text(`Location: ${listing.location}, ${listing.country}`, 70, 398);
      doc.text(
        `Price per night: ₹${listing.price.toLocaleString("en-IN")}`,
        70,
        415
      );

      // Booking details section
      doc.fontSize(14).fillColor("#007bff").text("Stay Details", 50, 449);
      doc.fontSize(11).fillColor("#333");
      doc.text(`Check-in: ${booking.checkIn.toLocaleDateString()}`, 70, 474);
      doc.text(`Check-out: ${booking.checkOut.toLocaleDateString()}`, 70, 491);
      doc.text(`Guests: ${booking.guests}`, 70, 508);

      // Calculate nights
      const nights = Math.ceil(
        (booking.checkOut - booking.checkIn) / (1000 * 60 * 60 * 24)
      );
      doc.text(`Number of nights: ${nights}`, 70, 525);

      // Add separator line
      doc.strokeColor("#dee2e6").lineWidth(1);
      doc.moveTo(50, 550).lineTo(550, 550).stroke();

      // Payment summary section
      doc.fontSize(14).fillColor("#28a745").text("Payment Summary", 50, 570);
      doc.fontSize(11).fillColor("#333");
      doc.text(
        `Subtotal (${nights} nights × ${booking.guests} guests × ₹${listing.price}):`,
        70,
        595
      );
      doc.text(`₹${booking.totalAmount.toLocaleString("en-IN")}`, 350, 595);

      doc.fontSize(13).fillColor("#28a745");
      doc.text(
        `Total Amount Paid: ₹${booking.totalAmount.toLocaleString("en-IN")}`,
        70,
        615
      );

      // Add separator line
      doc.strokeColor("#28a745").lineWidth(2);
      doc.moveTo(50, 640).lineTo(550, 640).stroke();

      // Footer section
      doc
        .fontSize(12)
        .fillColor("#007bff")
        .text("Thank you for choosing Wanderlust!", 50, 670);
      doc.fontSize(10).fillColor("#6c757d");
      doc.text(
        "For any queries, contact us at support@wanderlust.com",
        50,
        690
      );
      doc.text(
        "Visit us at www.wanderlust.com for more amazing destinations",
        50,
        705
      );

      // Add QR code placeholder (text for demo)
      doc.fontSize(8).text("Scan QR: [QR Code would appear here]", 400, 690);

      doc.end();

      doc.on("end", () => {
        resolve(filepath);
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("listing")
      .sort({ createdAt: -1 });

    res.render("users/my-bookings.ejs", { bookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    req.flash("error", "Error loading your bookings");
    res.redirect("/listings");
  }
};
