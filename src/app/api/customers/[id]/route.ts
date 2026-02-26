import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - Get single customer
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
    
    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        kycDocuments: true,
        ornaments: {
          include: {
            loan: {
              select: {
                loanReferenceNumber: true,
                status: true
              }
            }
          }
        },
        loans: {
          include: {
            _count: {
              select: { ornaments: true, payments: true }
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
          take: 10
        },
        branch: {
          select: { name: true }
        }
      }
    });
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Get customer error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PUT - Update customer
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
    
    const existingCustomer = await db.customer.findUnique({
      where: { id }
    });
    
    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    const customer = await db.customer.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        phone: data.phone,
        alternatePhone: data.alternatePhone || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        pincode: data.pincode || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender || null,
        occupation: data.occupation || null,
        annualIncome: data.annualIncome ? parseFloat(data.annualIncome) : null,
        status: data.status || existingCustomer.status,
        branchId: data.branchId || null,
      }
    });
    
    // Log audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE',
        module: 'CUSTOMER',
        recordId: customer.id,
        oldValues: JSON.stringify(existingCustomer),
        newValues: JSON.stringify(customer),
      }
    });
    
    return NextResponse.json({ success: true, customer });
  } catch (error) {
    console.error('Update customer error:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE - Delete customer
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
    
    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: { loans: true }
        }
      }
    });
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    // Check if customer has active loans
    const activeLoans = await db.loan.count({
      where: {
        customerId: id,
        status: 'ACTIVE'
      }
    });
    
    if (activeLoans > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with active loans' },
        { status: 400 }
      );
    }
    
    // Delete customer (cascade will delete KYC docs, notes)
    await db.customer.delete({
      where: { id }
    });
    
    // Log audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'DELETE',
        module: 'CUSTOMER',
        recordId: id,
        oldValues: JSON.stringify(customer),
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete customer error:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
