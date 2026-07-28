// backend/src/models/Product.js

import mongoose from 'mongoose';
import slugify from 'slugify';

// Sub-schema mapping image assets
const productImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    fileId: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

// Main Product schema mapping
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU identifier is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price cannot be negative'],
      validate: {
        validator: function (value) {
          // Assert sale price is less than raw cost
          return !value || value < this.price;
        },
        message: 'Sale price must be lower than standard price.',
      },
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
      default: 0,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required'],
      index: true,
    },
    images: [productImageSchema],
    attributes: {
      type: Map,
      of: String, // Flexible attributes such as brand, size, color
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for listing products within a category
productSchema.index({ categoryId: 1, isActive: 1 });

// Text index on name and description for search engines
productSchema.index({ name: 'text', description: 'text' });

// Pre-save hook: Generate unique slugs dynamically from product name
productSchema.pre('save', async function () {
  if (this.isModified('name')) {
    const baseSlug = slugify(this.name, { lower: true, strict: true });
    let uniqueSlug = baseSlug;
    let suffix = 1;

    // Resolve conflicts
    while (true) {
      const existing = await mongoose.models.Product.findOne({
        slug: uniqueSlug,
        _id: { $ne: this._id },
      });

      if (!existing) {
        break;
      }
      uniqueSlug = `${baseSlug}-${suffix}`;
      suffix++;
    }
    this.slug = uniqueSlug;
  }
});

export const Product = mongoose.model('Product', productSchema);
