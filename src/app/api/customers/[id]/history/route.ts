import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - Get customer history with loans, ornaments, and credit limit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    
    // Get customer with all related data
    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        loans: {
          include: {
            ornaments: true,
            payments: {
              orderBy: { createdAt: 'desc' },
              take: 10
            },
            branch: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        ornaments: {
          include: {
            loan: {
              select: {
                loanReferenceNumber: true,
                status: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        notes: {
          include: {
            user: {
              select: { name: true, username: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        branch: {
          select: { name: true }
        },
        kycDocuments: true
      }
    });
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    // Calculate credit limit and statistics
    const activeLoans = customer.loans.filter(l => l.status === 'ACTIVE' || l.status === 'OVERDUE');
    
    const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.outstandingPrincipal, 0);
    const totalInterestOutstanding = activeLoans.reduce((sum, l) => sum + l.outstandingInterest, 0);
    
    const totalPrincipalPaid = customer.loans.reduce((sum, l) => sum + l.totalPrincipalPaid, 0);
    const totalInterestPaid = customer.loans.reduce((sum, l) => sum + l.totalInterestPaid, 0);
    
    const totalCollateralValue = activeLoans.reduce((sum, l) => sum + l.totalOrnamentValue, 0);
    
    // Get settings for max LTV ratio
    const settings = await db.setting.findMany({
      where: { key: 'max_ltv_ratio' }
    });
    const maxLTV = parseFloat(settings[0]?.value || '75');
    
    // Calculate credit limit based on collateral
    const availableCredit = Math.max(0, (totalCollateralValue * maxLTV / 100) - totalOutstanding);
    
    // Calculate total pledged ornaments value
    const pledgedOrnaments = customer.ornaments.filter(o => o.status === 'PLEDGED');
    const pledgedValue = pledgedOrnaments.reduce((sum, o) => sum + o.valuationAmount, 0);
    
    // Calculate payment history
    const allPayments = customer.loans.flatMap(l => l.payments);
    const totalPaymentsMade = allPayments.reduce((sum, p) => sum + p.amount, 0);
    
    // Calculate risk assessment
    const redZoneLoans = activeLoans.filter(l => l.riskZone === 'RED').length;
    const yellowZoneLoans = activeLoans.filter(l => l.riskZone === 'YELLOW').length;
    const overdueLoans = activeLoans.filter(l => l.status === 'OVERDUE').length;
    
    let riskLevel = 'LOW';
    if (redZoneLoans > 0 || overdueLoans > 1) {
      riskLevel = 'HIGH';
    } else if (yellowZoneLoans > 0 || overdueLoans > 0) {
      riskLevel = 'MEDIUM';
    }
    
    return NextResponse.json({
      customer,
      statistics: {
        totalLoans: customer.loans.length,
        activeLoans: activeLoans.length,
        closedLoans: customer.loans.filter(l => l.status === 'CLOSED').length,
        totalOutstanding,
        totalInterestOutstanding,
        totalPrincipalPaid,
        totalInterestPaid,
        totalPaymentsMade,
        totalCollateralValue,
        pledgedOrnaments: pledgedOrnaments.length,
        pledgedValue,
        availableCredit,
        maxCreditLimit: totalCollateralValue * maxLTV / 100,
        maxLTV,
        riskLevel,
        redZoneLoans,
        yellowZoneLoans,
        overdueLoans
      },
      loans: customer.loans,
      ornaments: customer.ornaments,
      notes: customer.notes,
      payments: allPayments
    });
  } catch (error) {
    console.error('Get customer history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer history' },
      { status: 500 }
    );
  }
}
