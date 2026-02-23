import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get dashboard statistics
    const [
      totalCustomers,
      totalLoans,
      activeLoans,
      totalOrnaments,
      totalPayments,
      loansByStatus,
      loansByRiskZone,
      recentLoans,
      recentPayments,
      totalDisbursed,
      totalOutstanding,
      totalInterestCollected,
    ] = await Promise.all([
      db.customer.count(),
      db.loan.count(),
      db.loan.count({ where: { status: 'ACTIVE' } }),
      db.ornament.count(),
      db.payment.count(),
      db.loan.groupBy({
        by: ['status'],
        _count: true,
      }),
      db.loan.groupBy({
        by: ['riskZone'],
        _count: true,
      }),
      db.loan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { firstName: true, lastName: true }
          }
        }
      }),
      db.payment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          loan: {
            include: {
              customer: {
                select: { firstName: true, lastName: true }
              }
            }
          }
        }
      }),
      db.loan.aggregate({
        _sum: { principalAmount: true }
      }),
      db.loan.aggregate({
        _sum: { outstandingPrincipal: true },
        where: { status: 'ACTIVE' }
      }),
      db.payment.aggregate({
        _sum: { interestAmount: true }
      }),
    ]);
    
    // Get monthly loan data for chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyLoans = await db.$queryRaw<Array<{ month: string; count: number; amount: number }>>`
      SELECT 
        strftime('%Y-%m', createdAt) as month,
        COUNT(*) as count,
        SUM(principalAmount) as amount
      FROM Loan
      WHERE createdAt >= datetime(${sixMonthsAgo.toISOString()})
      GROUP BY strftime('%Y-%m', createdAt)
      ORDER BY month ASC
    `;
    
    // Get overdue loans
    const overdueLoans = await db.loan.count({
      where: {
        status: 'OVERDUE'
      }
    });
    
    // Get red zone loans
    const redZoneLoans = await db.loan.count({
      where: {
        riskZone: 'RED'
      }
    });
    
    // Get yellow zone loans
    const yellowZoneLoans = await db.loan.count({
      where: {
        riskZone: 'YELLOW'
      }
    });
    
    return NextResponse.json({
      stats: {
        totalCustomers,
        totalLoans,
        activeLoans,
        totalOrnaments,
        totalPayments,
        overdueLoans,
        redZoneLoans,
        yellowZoneLoans,
        totalDisbursed: totalDisbursed._sum.principalAmount || 0,
        totalOutstanding: totalOutstanding._sum.outstandingPrincipal || 0,
        totalInterestCollected: totalInterestCollected._sum.interestAmount || 0,
      },
      loansByStatus: loansByStatus.map(s => ({ status: s.status, count: s._count })),
      loansByRiskZone: loansByRiskZone.map(r => ({ riskZone: r.riskZone, count: r._count })),
      recentLoans,
      recentPayments,
      monthlyLoans,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
