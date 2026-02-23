import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - List all loans
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
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const riskZone = searchParams.get('riskZone') || '';
    const customerId = searchParams.get('customerId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { loanReferenceNumber: { contains: search } },
        { customer: { firstName: { contains: search } } },
        { customer: { lastName: { contains: search } } },
        { customer: { phone: { contains: search } } },
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (riskZone) {
      where.riskZone = riskZone;
    }
    
    if (customerId) {
      where.customerId = customerId;
    }
    
    const [loans, total] = await Promise.all([
      db.loan.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              customerId: true,
              firstName: true,
              lastName: true,
              phone: true,
            }
          },
          branch: {
            select: { name: true }
          },
          _count: {
            select: { ornaments: true, payments: true }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.loan.count({ where })
    ]);
    
    return NextResponse.json({
      loans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get loans error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loans' },
      { status: 500 }
    );
  }
}

// POST - Create new loan
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
    if (!data.customerId || !data.principalAmount || !data.interestRate) {
      return NextResponse.json(
        { error: 'Customer, principal amount, and interest rate are required' },
        { status: 400 }
      );
    }
    
    if (!data.ornamentIds || data.ornamentIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one ornament must be pledged' },
        { status: 400 }
      );
    }
    
    // Get ornaments and calculate total value
    const ornaments = await db.ornament.findMany({
      where: {
        id: { in: data.ornamentIds },
        status: 'AVAILABLE'
      }
    });
    
    if (ornaments.length !== data.ornamentIds.length) {
      return NextResponse.json(
        { error: 'Some ornaments are not available or not found' },
        { status: 400 }
      );
    }
    
    const totalOrnamentValue = ornaments.reduce((sum, o) => sum + o.valuationAmount, 0);
    const principalAmount = parseFloat(data.principalAmount);
    const loanToValueRatio = (principalAmount / totalOrnamentValue) * 100;
    
    // Get settings for LTV check
    const ltvSetting = await db.setting.findUnique({
      where: { key: 'loan_to_value_ratio' }
    });
    const maxLTV = parseFloat(ltvSetting?.value || '75');
    
    if (loanToValueRatio > maxLTV) {
      return NextResponse.json(
        { error: `Loan to value ratio (${loanToValueRatio.toFixed(2)}%) exceeds maximum allowed (${maxLTV}%)` },
        { status: 400 }
      );
    }
    
    // Generate loan reference number
    const loanCount = await db.loan.count();
    const loanReferenceNumber = `LN${String(loanCount + 1).padStart(8, '0')}`;
    
    // Calculate due date and maturity date
    const disbursementDate = new Date();
    const tenureMonths = parseInt(data.tenureMonths) || 12;
    const maturityDate = new Date(disbursementDate);
    maturityDate.setMonth(maturityDate.getMonth() + tenureMonths);
    
    const dueDate = new Date(disbursementDate);
    dueDate.setMonth(dueDate.getMonth() + 1);
    
    // Determine initial risk zone
    const yellowThreshold = await db.setting.findUnique({
      where: { key: 'yellow_zone_threshold' }
    });
    
    let riskZone = 'GREEN';
    if (loanToValueRatio >= parseFloat(yellowThreshold?.value || '80')) {
      riskZone = 'YELLOW';
    }
    
    // Create loan with ornaments
    const loan = await db.loan.create({
      data: {
        loanReferenceNumber,
        customerId: data.customerId,
        branchId: data.branchId || user.branchId,
        principalAmount,
        interestRate: parseFloat(data.interestRate),
        interestType: data.interestType || 'MONTHLY',
        tenureMonths,
        disbursementDate,
        dueDate,
        maturityDate,
        status: 'ACTIVE',
        riskZone,
        totalOrnamentValue,
        loanToValueRatio,
        outstandingPrincipal: principalAmount,
      }
    });
    
    // Update ornaments to link with loan
    await db.ornament.updateMany({
      where: { id: { in: data.ornamentIds } },
      data: {
        loanId: loan.id,
        status: 'PLEDGED'
      }
    });
    
    // Create initial interest ledger entry
    await db.interestLedger.create({
      data: {
        loanId: loan.id,
        fromDate: disbursementDate,
        toDate: dueDate,
        interestRate: parseFloat(data.interestRate),
        interestAmount: (principalAmount * parseFloat(data.interestRate)) / 100 / 12,
      }
    });
    
    // Log audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        module: 'LOAN',
        recordId: loan.id,
        newValues: JSON.stringify({ ...loan, ornaments: data.ornamentIds }),
      }
    });
    
    return NextResponse.json({ success: true, loan });
  } catch (error) {
    console.error('Create loan error:', error);
    return NextResponse.json(
      { error: 'Failed to create loan' },
      { status: 500 }
    );
  }
}
