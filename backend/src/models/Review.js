// backend/src/models/Review.js

import mongoose from 'mongoose';

/**
 * Review Mongoose Schema.
 * Maps user product ratings and reviews.
 */
const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating score is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxLength: [1000, 'Comment cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: enforces that a user can review a specific product only once
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Compound index: speeds up product review listings sorted by date
reviewSchema.index({ productId: 1, createdAt: -1 });


/**
 * Static method to calculate and update average ratings and counts in Product.
 * Uses MongoDB Aggregation framework.
 */
reviewSchema.statics.calculateAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: '$productId',
        reviewsCount: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  const Product = mongoose.model('Product');

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      reviewsCount: stats[0].reviewsCount,
      averageRating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal place
    });
  } else {
    // Reset stats if no reviews remain
    await Product.findByIdAndUpdate(productId, {
      reviewsCount: 0,
      averageRating: 0,
    });
  }
};

// Hook: Calculate statistics post save
reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.productId);
});

// Hook: Calculate statistics post delete (Mongoose findOneAndDelete)
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await mongoose.models.Review.calculateAverageRating(doc.productId);
  }
});

export const Review = mongoose.model('Review', reviewSchema);
