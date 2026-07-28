// src/models/Category.js

import mongoose from 'mongoose';
import slugify from 'slugify';

/**
 * Category Mongoose Schema.
 * Maps store categories, supporting nested hierarchies (parentId self-references).
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
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

// Pre-save hook: Generate unique slugs dynamically from the category name
categorySchema.pre('save', async function () {
  if (this.isModified('name')) {
    const baseSlug = slugify(this.name, { lower: true, strict: true });
    let uniqueSlug = baseSlug;
    let suffix = 1;

    // Resolve slug conflicts recursively
    while (true) {
      const existing = await mongoose.models.Category.findOne({
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

export const Category = mongoose.model('Category', categorySchema);
