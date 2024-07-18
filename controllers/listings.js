const Listing=require("../models/listing.js");
const opencage = require('opencage-api-client');

module.exports.index=async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing=async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({
        path:"reviews",
        populate:{path:"author",
        }
    })
    .populate("owner");
    if(!listing)
        {
            req.flash("error","Listing Does Not Exist!");
            res.redirect("/listings");
        }
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing=async (req,res,next)=>{

    let response=await opencage
         .geocode({ q: req.body.listing.location });
    let url=req.file.path;
    let filename=req.file.filename;
    let newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};

    newListing.geometry=[response.results[0].geometry.lat,response.results[0].geometry.lng];
    let savedListing=await newListing.save();
    console.log(savedListing);
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm=async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing)
        {
            req.flash("error","Listing Does Not Exist!");
            res.redirect("/listings");
        }
        res.render("listings/edit.ejs",{listing});
};

module.exports.updateListing=async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file!=="undefined")
        {
            let url=req.file.path;
            let filename=req.file.filename;
            listing.image={url,username};
            await listing.save();
        }
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing=async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};

