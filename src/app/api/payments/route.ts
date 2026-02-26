import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - List all payments
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get('loanId') || '';
    const customerId = searchParams.get('customerId') || '';
    const paymentType = searchParams.get('paymentType') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    const where: Record<string, unknown> = {};
    
    if (loanId) {
      where.loanId = loanId;
    }
    
    if (customerId) {
      where.customerId = customerId;
    }
    
    if (paymentType) {
      where.paymentType = paymentType;
    }
    
    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
        include: {
          loan: {
            include: {
              customer: {
                select: {
                  id: true,
                  customerId: true,
                  firstName: true,
                  lastName: true,
                  phone: true,
                }
              }
            }
          },
          receivedByUser: {
            select: { name: true, username: true }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.payment.count({ where })
    ]);
    
    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST - Create new payment
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.loanId || !data.amount || !data.paymentType || !data.paymentMethod) {
      return NextResponse.json(
        { error: 'Loan, amount, payment type, and payment method are required' },
        { status: 400 }
      );
    }
    
    // Get loan
    const loan = await db.loan.findUnique({
      where: { id: data.loanId }
    });
    
    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      );
    }
    
    // Generate payment ID and receipt number
    const paymentCount = await db.payment.count();
    const paymentId = `PAY${String(paymentCount + 1).padStart(8, '0')}`;
    const receiptNumber = `RCP${Date.now()}`;
    
    const amount = parseFloat(data.amount);
    const principalAmount = parseFloat(data.principalAmount) || 0;
    const interestAmount = parseFloat(data.interestAmount) || 0;
    const penaltyAmount = parseFloat(data.penaltyAmount) || 0;
    
    const payment = await db.payment.create({
      data: {
        paymentId,
        loanId: data.loanId,
        customerId: loan.customerId,
        receivedBy: user.id,
        paymentType: data.paymentType,
        amount,
        principalAmount,
        interestAmount,
        penaltyAmount,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId || null,
        receiptNumber,
        notes: data.notes || null,
      },
      include: {
        loan: {
          include: {
            customer: {
              select: {
                customerId: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        }
      }
    });
    
    // Update loan outstanding amounts
    const newOutstandingPrincipal = loan.outstandingPrincipal - principalAmount;
    const newOutstandingInterest = loan.outstandingInterest - interestAmount;
    const newTotalPrincipalPaid = loan.totalPrincipalPaid + principalAmount;
    const newTotalInterestPaid = loan.totalInterestPaid + interestAmount;
    
    // Check if loan is fully paid
    let newStatus = loan.status;
    if (newOutstandingPrincipal <= 0 && data.paymentType === 'FULL_CLOSURE') {
      newStatus = 'CLOSED';
    }
    
    await db.loan.update({
      where: { id: data.loanId },
      data: {
        outstandingPrincipal: Math.max(0, newOutstandingPrincipal),
        outstandingInterest: Math.max(0, newOutstandingInterest),
        totalPrincipalPaid: newTotalPrincipalPaid,
        totalInterestPaid: newTotalInterestPaid,
        status: newStatus,
        closedAt: newStatus === 'CLOSED' ? new Date() : null,
      }
    });
    
    // Update interest ledger if interest payment
    if (interestAmount > 0) {
      const pendingInterest = await db.interestLedger.findFirst({
        where: {
          loanId: data.loanId,
          status: 'PENDING'
        },
        orderBy: { createdAt: 'asc' }
      });
      
      if (pendingInterest) {
        const newPaidAmount = pendingInterest.paidAmount + interestAmount;
        const newStatus = newPaidAmount >= pendingInterest.interestAmount ? 'PAID' : 'PARTIALLY_PAID';
        
        await db.interestLedger.update({
          where: { id: pendingInterest.id },
          data: {
            paidAmount: newPaidAmount,
            status: newStatus,
            paidAt: newStatus === 'PAID' ? new Date() : null,
          }
        });
      }
    }
    
    // Log audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        module: 'PAYMENT',
        recordId: payment.id,
        newValues: JSON.stringify(payment),
      }
    });
    
    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
