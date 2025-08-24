import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  listingId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  listingId: {
    type: Schema.Types.ObjectId,
    ref: 'MarketplaceListing',
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can only favorite a listing once
FavoriteSchema.index({ userId: 1, listingId: 1 }, { unique: true });

// Virtual for populating listing details
FavoriteSchema.virtual('listing', {
  ref: 'MarketplaceListing',
  localField: 'listingId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are included in JSON output
FavoriteSchema.set('toJSON', { virtuals: true });
FavoriteSchema.set('toObject', { virtuals: true });

export const Favorite = mongoose.model<IFavorite>('Favorite', FavoriteSchema);

export default Favorite;
