const Listing = require("../models/listing.js");
const opencage = require("opencage-api-client");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.searchListings = async (req, res) => {
  const { destination } = req.query;

  if (!destination || destination.trim() === "") {
    req.flash("error", "Please enter a destination to search!");
    return res.redirect("/listings");
  }

  try {
    // Create a case-insensitive search query for location, country, and title
    const searchQuery = {
      $or: [
        { location: { $regex: destination, $options: "i" } },
        { country: { $regex: destination, $options: "i" } },
        { title: { $regex: destination, $options: "i" } },
        { description: { $regex: destination, $options: "i" } },
      ],
    };

    const searchResults = await Listing.find(searchQuery);

    if (searchResults.length === 0) {
      req.flash(
        "error",
        `No listings found for "${destination}". Try a different search term.`
      );
      return res.redirect("/listings");
    }

    res.render("listings/search-results.ejs", {
      listings: searchResults,
      destination: destination,
      searchCount: searchResults.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    req.flash(
      "error",
      "Something went wrong while searching. Please try again."
    );
    res.redirect("/listings");
  }
};

module.exports.advancedSearch = async (req, res) => {
  const { destination, minPrice, maxPrice, sortBy } = req.query;

  try {
    let searchQuery = {};

    // Add destination filter if provided
    if (destination && destination.trim() !== "") {
      searchQuery.$or = [
        { location: { $regex: destination, $options: "i" } },
        { country: { $regex: destination, $options: "i" } },
        { title: { $regex: destination, $options: "i" } },
        { description: { $regex: destination, $options: "i" } },
      ];
    }

    // Add price range filter
    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = parseInt(minPrice);
      if (maxPrice) searchQuery.price.$lte = parseInt(maxPrice);
    }

    let query = Listing.find(searchQuery);

    // Add sorting
    switch (sortBy) {
      case "price_low":
        query = query.sort({ price: 1 });
        break;
      case "price_high":
        query = query.sort({ price: -1 });
        break;
      case "newest":
        query = query.sort({ createdAt: -1 });
        break;
      case "oldest":
        query = query.sort({ createdAt: 1 });
        break;
      default:
        query = query.sort({ title: 1 });
    }

    const searchResults = await query.exec();

    res.render("listings/advanced-search-results.ejs", {
      listings: searchResults,
      searchFilters: req.query,
      searchCount: searchResults.length,
    });
  } catch (error) {
    console.error("Advanced search error:", error);
    req.flash(
      "error",
      "Something went wrong while searching. Please try again."
    );
    res.redirect("/listings");
  }
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing Does Not Exist!");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      req.flash("error", "Please upload an image for your listing!");
      return res.redirect("/listings/new");
    }

    let url = req.file.path;
    let filename = req.file.filename;
    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    // Use OpenCage API to get coordinates for the location
    try {
      let response = await opencage.geocode({ q: req.body.listing.location });

      if (response.results && response.results.length > 0) {
        newListing.geometry = [
          response.results[0].geometry.lat,
          response.results[0].geometry.lng,
        ];
        console.log(
          `Geocoded ${req.body.listing.location} to:`,
          newListing.geometry
        );
      } else {
        // If no results found, use default coordinates but warn user
        newListing.geometry = [28.6139, 77.209]; // Delhi coordinates
        req.flash(
          "warning",
          "Could not find exact location on map. Using default coordinates."
        );
      }
    } catch (geocodeError) {
      console.error("Geocoding failed:", geocodeError);
      // If geocoding fails, use default coordinates
      newListing.geometry = [28.6139, 77.209]; // Delhi coordinates
      req.flash(
        "warning",
        "Geocoding service unavailable. Using default map coordinates."
      );
    }

    let savedListing = await newListing.save();
    req.flash("success", "New Listing Created Successfully!");
    res.redirect("/listings");
  } catch (error) {
    console.error("Error creating listing:", error);
    req.flash("error", "Error creating listing: " + error.message);
    res.redirect("/listings/new");
  }
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing Does Not Exist!");
    res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  try {
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // If location was updated, re-geocode it
    if (req.body.listing.location) {
      try {
        let response = await opencage.geocode({ q: req.body.listing.location });

        if (response.results && response.results.length > 0) {
          listing.geometry = [
            response.results[0].geometry.lat,
            response.results[0].geometry.lng,
          ];
          console.log(
            `Re-geocoded ${req.body.listing.location} to:`,
            listing.geometry
          );
        }
      } catch (geocodeError) {
        console.error("Geocoding failed during update:", geocodeError);
        // Keep existing coordinates if geocoding fails
      }
    }

    if (typeof req.file !== "undefined") {
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = { url, filename }; // Fixed: was 'username', should be 'filename'
    }

    await listing.save();
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  } catch (error) {
    console.error("Error updating listing:", error);
    req.flash("error", "Error updating listing: " + error.message);
    res.redirect(`/listings/${id}/edit`);
  }
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
