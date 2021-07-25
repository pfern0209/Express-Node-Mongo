const Campground=require('../models/campground');
const Review=require('../models/review')

module.exports.createReview=async (req,res)=>{
  const id=req.params.id;
  let campground =await Campground.findById(id);
  const review=new Review(req.body.review);
  review.author=req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash('success','Created new review')
  res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview=async (req,res)=>{
  const campId=req.params.id;
  const reviewId=req.params.reviewId;
  await Campground.findByIdAndUpdate(campId,{$pull:{reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);
  req.flash('success','Successfully deleted review')
  res.redirect(`/campgrounds/${campId}`);
}