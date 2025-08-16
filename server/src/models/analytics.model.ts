import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalyticsData extends Document {
  date: Date;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  region: string;
  metrics: {
    farmers: {
      total: number;
      active: number;
      new: number;
      verified: number;
      byGender: {
        male: number;
        female: number;
        other: number;
      };
      byAgeGroup: {
        '18-25': number;
        '26-35': number;
        '36-45': number;
        '46-55': number;
        '55+': number;
      };
      byEducation: {
        none: number;
        primary: number;
        secondary: number;
        tertiary: number;
      };
      byRegion: Record<string, number>;
    };
    transactions: {
      total: number;
      volume: number;
      averageValue: number;
      byStatus: {
        pending: number;
        completed: number;
        failed: number;
        cancelled: number;
      };
      byPaymentMethod: {
        mobileMoney: number;
        bankTransfer: number;
        cash: number;
        card: number;
      };
      trend: Array<{ date: string; value: number }>;
    };
    harvests: {
      total: number;
      totalVolume: number;
      averageYield: number;
      byCrop: Record<string, number>;
      byQuality: {
        premium: number;
        standard: number;
        basic: number;
      };
      postHarvestLoss: number;
      trend: Array<{ date: string; volume: number }>;
    };
    marketplace: {
      listings: number;
      orders: number;
      revenue: number;
      commission: number;
      activeProducts: number;
      topProducts: Array<{
        productId: string;
        name: string;
        sales: number;
        revenue: number;
      }>;
    };
    fintech: {
      creditScores: {
        total: number;
        average: number;
        distribution: {
          poor: number;
          fair: number;
          good: number;
          excellent: number;
        };
      };
      loans: {
        total: number;
        amount: number;
        averageAmount: number;
        repaymentRate: number;
        defaultRate: number;
      };
    };
    impact: {
      incomeIncrease: number;
      productivityImprovement: number;
      foodSecurity: number;
      employmentCreated: number;
      carbonFootprintReduction: number;
      waterConservation: number;
    };
    partners: {
      total: number;
      active: number;
      farmerReferrals: number;
      revenueGenerated: number;
      performanceScore: number;
      topPerformers: Array<{
        partnerId: string;
        name: string;
        referrals: number;
        revenue: number;
        score: number;
      }>;
    };
    weather: {
      averageTemperature: number;
      averageHumidity: number;
      rainfall: number;
      droughtDays: number;
      favorableDays: number;
      impact: {
        favorable: number;
        moderate: number;
        unfavorable: number;
      };
    };
  };
  metadata: {
    lastUpdated: Date;
    dataSource: string;
    version: string;
  };
}

const analyticsSchema = new Schema<IAnalyticsData>({
  date: {
    type: Date,
    required: true,
    index: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    required: true,
    index: true
  },
  region: {
    type: String,
    required: true,
    index: true
  },
  metrics: {
    farmers: {
      total: { type: Number, default: 0 },
      active: { type: Number, default: 0 },
      new: { type: Number, default: 0 },
      verified: { type: Number, default: 0 },
      byGender: {
        male: { type: Number, default: 0 },
        female: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
      },
      byAgeGroup: {
        '18-25': { type: Number, default: 0 },
        '26-35': { type: Number, default: 0 },
        '36-45': { type: Number, default: 0 },
        '46-55': { type: Number, default: 0 },
        '55+': { type: Number, default: 0 }
      },
      byEducation: {
        none: { type: Number, default: 0 },
        primary: { type: Number, default: 0 },
        secondary: { type: Number, default: 0 },
        tertiary: { type: Number, default: 0 }
      },
      byRegion: { type: Schema.Types.Mixed, default: {} }
    },
    transactions: {
      total: { type: Number, default: 0 },
      volume: { type: Number, default: 0 },
      averageValue: { type: Number, default: 0 },
      byStatus: {
        pending: { type: Number, default: 0 },
        completed: { type: Number, default: 0 },
        failed: { type: Number, default: 0 },
        cancelled: { type: Number, default: 0 }
      },
      byPaymentMethod: {
        mobileMoney: { type: Number, default: 0 },
        bankTransfer: { type: Number, default: 0 },
        cash: { type: Number, default: 0 },
        card: { type: Number, default: 0 }
      },
      trend: [{ 
        date: { type: String, required: true },
        value: { type: Number, required: true }
      }]
    },
    harvests: {
      total: { type: Number, default: 0 },
      totalVolume: { type: Number, default: 0 },
      averageYield: { type: Number, default: 0 },
      byCrop: { type: Schema.Types.Mixed, default: {} },
      byQuality: {
        premium: { type: Number, default: 0 },
        standard: { type: Number, default: 0 },
        basic: { type: Number, default: 0 }
      },
      postHarvestLoss: { type: Number, default: 0 },
      trend: [{
        date: { type: String, required: true },
        volume: { type: Number, required: true }
      }]
    },
    marketplace: {
      listings: { type: Number, default: 0 },
      orders: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      commission: { type: Number, default: 0 },
      activeProducts: { type: Number, default: 0 },
      topProducts: [{
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String },
        sales: { type: Number },
        revenue: { type: Number }
      }]
    },
    fintech: {
      creditScores: {
        total: { type: Number, default: 0 },
        average: { type: Number, default: 0 },
        distribution: {
          poor: { type: Number, default: 0 },
          fair: { type: Number, default: 0 },
          good: { type: Number, default: 0 },
          excellent: { type: Number, default: 0 }
        }
      },
      loans: {
        total: { type: Number, default: 0 },
        amount: { type: Number, default: 0 },
        averageAmount: { type: Number, default: 0 },
        repaymentRate: { type: Number, default: 0 },
        defaultRate: { type: Number, default: 0 }
      }
    },
    impact: {
      incomeIncrease: { type: Number, default: 0 },
      productivityImprovement: { type: Number, default: 0 },
      foodSecurity: { type: Number, default: 0 },
      employmentCreated: { type: Number, default: 0 },
      carbonFootprintReduction: { type: Number, default: 0 },
      waterConservation: { type: Number, default: 0 }
    },
    partners: {
      total: { type: Number, default: 0 },
      active: { type: Number, default: 0 },
      farmerReferrals: { type: Number, default: 0 },
      revenueGenerated: { type: Number, default: 0 },
      performanceScore: { type: Number, default: 0 },
      topPerformers: [{
        partnerId: { type: String },
        name: { type: String },
        referrals: { type: Number },
        revenue: { type: Number },
        score: { type: Number }
      }]
    },
    weather: {
      averageTemperature: { type: Number, default: 0 },
      averageHumidity: { type: Number, default: 0 },
      rainfall: { type: Number, default: 0 },
      droughtDays: { type: Number, default: 0 },
      favorableDays: { type: Number, default: 0 },
      impact: {
        favorable: { type: Number, default: 0 },
        moderate: { type: Number, default: 0 },
        unfavorable: { type: Number, default: 0 }
      }
    }
  },
  metadata: {
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    dataSource: {
      type: String,
      default: 'system'
    },
    version: {
      type: String,
      default: '1.0.0'
    }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
analyticsSchema.index({ date: 1, period: 1, region: 1 });
analyticsSchema.index({ period: 1, region: 1 });
analyticsSchema.index({ date: 1, period: 1 });

export default mongoose.model<IAnalyticsData>('Analytics', analyticsSchema);
