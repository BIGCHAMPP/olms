import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - Get single loan
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
    
    const loan = await db.loan.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            customerId: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            address: true,
          }
        },
        branch: {
          select: { name: true }
        },
        ornaments: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        interestLedger: {
          orderBy: { createdAt: 'desc' },
          take: 12
        },
        notes: {
          include: {
            user: {
              select: { name: true, username: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
    
    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ loan });
  } catch (error) {
    console.error('Get loan error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loan' },
      { status: 500 }
    );
  }
}

// PUT - Update loan
export async function PUT(
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
    const data = await request.json();
    
    const existingLoan = await db.loan.findUnique({
      where: { id }
    });
    
    if (!existingLoan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      );
    }
    
    const loan = await db.loan.update({
      where: { id },
      data: {
        interestRate: data.interestRate ? parseFloat(data.interestRate) : existingLoan.interestRate,
        interestType: data.interestType || existingLoan.interestType,
        tenureMonths: data.tenureMonths ? parseInt(data.tenureMonths) : existingLoan.tenureMonths,
        status: data.status || existingLoan.status,
        riskZone: data.riskZone || existingLoan.riskZone,
        outstandingPrincipal: data.outstandingPrincipal !== undefined 
          ? parseFloat(data.outstandingPrincipal) 
          : existingLoan.outstandingPrincipal,
        outstandingInterest: data.outstandingInterest !== undefined 
          ? parseFloat(data.outstandingInterest) 
          : existingLoan.outstandingInterest,
        dueDate: data.dueDate ? new Date(data.dueDate) : existingLoan.dueDate,
        maturityDate: data.maturityDate ? new Date(data.maturityDate) : existingLoan.maturityDate,
      }
    });
    
    // Log audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE',
        module: 'LOAN',
        recordId: loan.id,
        oldValues: JSON.stringify(existingLoan),
        newValues: JSON.stringify(loan),
      }
    });
    
    return NextResponse.json({ success: true, loan });
  } catch (error) {
    console.error('Update loan error:', error);
    return NextResponse.json(
      { error: 'Failed to update loan' },
      { status: 500 }
    );
  }
}

// DELETE - Delete loan (only if closed)
export async function DELETE(
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
    
    const loan = await db.loan.findUnique({
      where: { id }
    });
    
    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      );
    }
    
    if (loan.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot delete active loan' },
        { status: 400 }
      );
    }
    
    await db.loan.delete({
      where: { id }
    });
    
    // Log audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'DELETE',
        module: 'LOAN',
        recordId: id,
        oldValues: JSON.stringify(loan),
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete loan error:', error);
    return NextResponse.json(
      { error: 'Failed to delete loan' },
      { status: 500 }
    );
  }
}
