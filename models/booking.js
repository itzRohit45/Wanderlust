const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },
  guests: {
    type: Number,
    required: true,
    min: 1,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentId: {
    type: String,
    required: true,
  },
  paymentOrderId: {
    type: String,
    required: true,
  },
  paymentSignature: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  bookingId: {
    type: String,
    required: true,
    unique: true,
  },
  receiptUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Booking", bookingSchema);
