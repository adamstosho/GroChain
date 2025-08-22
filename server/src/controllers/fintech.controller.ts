import { Request, Response } from 'express';
import { 
  LoanApplication, 
  InsurancePolicy, 
  FinancialHealth, 
  FinancialGoal 
} from '../models/fintech.model';
import { logger } from '../utils/logger';

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Loan Management Controllers
export const getLoanApplications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { farmerId, status, limit = 10, page = 1 } = req.query;
    const userId = req.user?.id;

    // Build query based on user role and permissions
    let query: any = {};
    
    if (req.user?.role === 'farmer') {
      query.farmerId = userId;
    } else if (farmerId) {
      query.farmerId = farmerId;
    }
    
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [applications, total] = await Promise.all([
      LoanApplication.find(query)
        .populate('farmerId', 'firstName lastName phone location')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      LoanApplication.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    return res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalItems: total,
          itemsPerPage: Number(limit)
        }
      }
    });
  } catch (error: any) {
    logger.error('Error fetching loan applications:', error?.message || error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch loan applications'
    });
  }
};

export const createLoanApplication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { amount, purpose, term, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Calculate loan details
    const interestRate = 12.5;
    const monthlyPayment = (amount * (1 + interestRate / 100)) / term;
    const totalRepayment = amount * (1 + interestRate / 100);
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + term);

    const loanApplication = new LoanApplication({
      farmerId: userId,
      amount,
      purpose,
      term,
      interestRate,
      monthlyPayment,
      totalRepayment,
      dueDate,
      description
    });

    await loanApplication.save();

    return res.status(201).json({
      success: true,
      data: loanApplication
    });
  } catch (error: any) {
    logger.error('Error creating loan application:', error?.message || error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create loan application'
    });
  }
};

export const getLoanStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    let query: any = {};
    if (req.user?.role === 'farmer') {
      query.farmerId = userId;
    }

    const [
      totalApplications,
      approved,
      pending,
      rejected
    ] = await Promise.all([
      LoanApplication.countDocuments(query),
      LoanApplication.countDocuments({ ...query, status: 'approved' }),
      LoanApplication.countDocuments({ ...query, status: 'submitted' }),
      LoanApplication.countDocuments({ ...query, status: 'rejected' })
    ]);

    const stats = {
      totalApplications,
      approved,
      pending,
      rejected,
      totalDisbursed: 2500000,
      totalRepaid: 1800000,
      averageInterestRate: 13.2,
      repaymentRate: totalApplications > 0 ? Math.round((approved / totalApplications) * 100) : 0
    };

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    logger.error('Error fetching loan stats:', error?.message || error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch loan statistics'
    });
  }
};

// Insurance Management Controllers
export const createInsuranceClaim = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { policyId, amount, description, incidentDate } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Verify policy exists and belongs to user
    const policy = await InsurancePolicy.findOne({ 
      _id: policyId, 
      farmerId: userId,
      status: 'active'
    });

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Insurance policy not found or inactive'
      });
    }

    const claim = {
      id: `claim_${Date.now()}`,
      policyId,
      amount,
      description,
      incidentDate,
      status: 'submitted',
      createdAt: new Date()
    };

    return res.status(200).json({
      success: true,
      data: claim
    });
  } catch (error: any) {
    logger.error('Error creating insurance claim:', error?.message || error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit insurance claim'
    });
  }
};

// Insurance Policies Controller
export const getInsurancePolicies = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { farmerId, type, status, limit = 10, page = 1 } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    let query: any = {};
    
    if (req.user?.role === 'farmer') {
      query.farmerId = userId;
    } else if (farmerId) {
      query.farmerId = farmerId;
    }
    
    if (type) query.type = type;
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    
    const [policies, total] = await Promise.all([
      InsurancePolicy.find(query)
        .populate('farmerId', 'firstName lastName location')
        .sort({ startDate: -1 })
        .skip(skip)
        .limit(Number(limit)),
      InsurancePolicy.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    return res.status(200).json({
      success: true,
      data: {
        policies,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalItems: total,
          itemsPerPage: Number(limit)
        }
      }
    });
  } catch (error: any) {
    logger.error('Error fetching insurance policies:', error?.message || error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch insurance policies'
    });
  }
};

// Insurance Stats Controller
export const getInsuranceStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    let query: any = {};
    if (req.user?.role === 'farmer') {
      query.farmerId = userId;
    }

    const [
      totalPolicies,
      activePolicies,
      totalCoverage,
      totalPremiums,
      totalClaims,
      claimsPaid
    ] = await Promise.all([
      InsurancePolicy.countDocuments(query),
      InsurancePolicy.countDocuments({ ...query, status: 'active' }),
      InsurancePolicy.aggregate([
        { $match: { ...query, status: 'active' } },
        { $group: { _id: null, total: { $sum: '$coverage' } } }
      ]),
      InsurancePolicy.aggregate([
        { $match: { ...query, status: 'active' } },
        { $group: { _id: null, total: { $sum: '$premium' } } }
      ]),
      // These would come from a claims model
      Promise.resolve(5),
      Promise.resolve(3)
    ]);

    const coverageAmount = totalCoverage[0]?.total || 0;
    const premiumAmount = totalPremiums[0]?.total || 0;

    const stats = {
      totalPolicies,
      activePolicies,
      totalCoverage: coverageAmount,
      totalPremiums: premiumAmount,
      totalClaims,
      claimsPaid,
      averageProcessingTime: 48 // This would be calculated from actual data
    };

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    logger.error('Error fetching insurance stats:', error?.message || error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch insurance statistics'
    });
  }
};

// Insurance Quote Controller
export const createInsuranceQuote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, coverage, description, location } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Calculate premium based on type and coverage
    let premium = 0;
    let deductible = 0;

    switch (type) {
      case 'crop':
        premium = coverage * 0.05; // 5% of coverage
        deductible = coverage * 0.1; // 10% of coverage
        break;
      case 'livestock':
        premium = coverage * 0.08; // 8% of coverage
        deductible = coverage * 0.15; // 15% of coverage
        break;
      case 'equipment':
        premium = coverage * 0.03; // 3% of coverage
        deductible = coverage * 0.05; // 5% of coverage
        break;
      default:
        premium = coverage * 0.06; // 6% of coverage
        deductible = coverage * 0.12; // 12% of coverage
    }

    const quote = {
      id: `quote_${Date.now()}`,
      type,
      coverage,
      premium: Math.round(premium),
      deductible: Math.round(deductible),
      description,
      location,
      status: 'submitted',
      createdAt: new Date()
    };

    return res.status(200).json({
      success: true,
      data: quote
    });
  } catch (error: any) {
    logger.error('Error creating insurance quote:', error?.message || error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create insurance quote'
    });
  }
};

// Financial Tools Controllers
export const getFinancialHealth = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    let financialHealth = await FinancialHealth.findOne({ farmerId: userId });

    if (!financialHealth) {
      // Create default financial health profile
      financialHealth = new FinancialHealth({
        farmerId: userId,
        netWorth: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        savingsRate: 0,
        debtToIncomeRatio: 0,
        emergencyFund: 0,
        investmentPortfolio: 0
      });
      await financialHealth.save();
    }

    // Get financial goals
    const goals = await FinancialGoal.find({ 
      farmerId: userId, 
      status: 'active' 
    }).sort({ priority: -1, targetDate: 1 });

    // Calculate additional metrics
    const savingsRate = financialHealth.monthlyIncome > 0 
      ? ((financialHealth.monthlyIncome - financialHealth.monthlyExpenses) / financialHealth.monthlyIncome) * 100 
      : 0;

    financialHealth.savingsRate = Math.max(0, Math.min(100, savingsRate));

    const financialData = {
      ...financialHealth.toObject(),
      goals
    };

    return res.status(200).json({
      success: true,
      data: financialData
    });
  } catch (error: any) {
    logger.error('Error fetching financial health:', error?.message || error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch financial health data'
    });
  }
};

export const getCropFinancials = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Mock crop financial data - this would come from actual crop and financial models
    const cropFinancials = [
      {
        cropType: "Tomatoes",
        investment: 150000,
        expectedRevenue: 300000,
        profitMargin: 50,
        riskScore: 25,
        seasonality: "Year-round",
        marketTrend: "up"
      },
      {
        cropType: "Cassava",
        investment: 80000,
        expectedRevenue: 180000,
        profitMargin: 55.6,
        riskScore: 15,
        seasonality: "Seasonal",
        marketTrend: "stable"
      }
    ];

    return res.status(200).json({
      success: true,
      data: cropFinancials
    });
  } catch (error: any) {
    logger.error('Error fetching crop financials:', error?.message || error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch crop financial data'
    });
  }
};

export const getFinancialProjections = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Generate 12-month projections
    const projections = [];
    const currentDate = new Date();
    let currentNetWorth = 2500000; // This would come from actual data

    for (let i = 0; i < 12; i++) {
      const month = new Date(currentDate);
      month.setMonth(month.getMonth() + i);
      
      const monthlyIncome = 450000 + (i * 5000); // Growing income
      const monthlyExpenses = 280000 + (i * 2000); // Growing expenses
      const savings = monthlyIncome - monthlyExpenses;
      currentNetWorth += savings;

      projections.push({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income: monthlyIncome,
        expenses: monthlyExpenses,
        savings,
        netWorth: currentNetWorth
      });
    }

    return res.status(200).json({
      success: true,
      data: projections
    });
  } catch (error: any) {
    logger.error('Error fetching financial projections:', error?.message || error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch financial projections'
    });
  }
};

export const createFinancialGoal = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, targetAmount, targetDate, priority, category } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const financialGoal = new FinancialGoal({
      farmerId: userId,
      name,
      targetAmount,
      targetDate: new Date(targetDate),
      priority,
      category,
      currentAmount: 0,
      status: 'active'
    });

    await financialGoal.save();

    return res.status(201).json({
      success: true,
      data: financialGoal
    });
  } catch (error: any) {
    logger.error('Error creating financial goal:', error?.message || error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create financial goal'
    });
  }
};

// Credit Score Controller
export const getCreditScore = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { farmerId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Mock credit score data - this would come from actual credit scoring system
    const creditScore = {
      farmerId,
      score: Math.floor(Math.random() * 300) + 500, // 500-800 range
      rating: 'Good',
      factors: [
        'Payment History',
        'Credit Utilization',
        'Length of Credit History',
        'Types of Credit',
        'Recent Credit Inquiries'
      ],
      lastUpdated: new Date().toISOString(),
      recommendations: [
        'Maintain timely payments',
        'Keep credit utilization below 30%',
        'Avoid opening too many new accounts'
      ]
    };

    return res.status(200).json({
      success: true,
      data: creditScore
    });
  } catch (error: any) {
    logger.error('Error fetching credit score:', error?.message || error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch credit score'
    });
  }
};

// Loan Referral Controller
export const createLoanReferral = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { farmer, amount, partner } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Create loan referral
    const referral = {
      id: `referral_${Date.now()}`,
      farmer,
      amount,
      partner,
      referredBy: userId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: 'Loan referral created by partner'
    };

    return res.status(201).json({
      success: true,
      data: referral
    });
  } catch (error: any) {
    logger.error('Error creating loan referral:', error?.message || error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create loan referral'
    });
  }
};
