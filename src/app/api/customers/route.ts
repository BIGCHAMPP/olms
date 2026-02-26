import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - List all customers
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
        { customerId: { contains: search } },
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    const [customers, total] = await Promise.all([
      db.customer.findMany({
        where,
        include: {
          _count: {
            select: { loans: true, ornaments: true }
          },
          branch: {
            select: { name: true }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.customer.count({ where })
    ]);
    
    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST - Create new customer
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
    
    // Generate customer ID
    const customerCount = await db.customer.count();
    const customerId = `CUS${String(customerCount + 1).padStart(6, '0')}`;
    
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.phone) {
      return NextResponse.json(
        { error: 'First name, last name, and phone are required' },
        { status: 400 }
      );
    }
    
    // Check for duplicate phone
    const existingPhone = await db.customer.findFirst({
      where: { phone: data.phone }
    });
    
    if (existingPhone) {
      return NextResponse.json(
        { error: 'A customer with this phone number already exists' },
        { status: 400 }
      );
    }
    
    const customer = await db.customer.create({
      data: {
        customerId,
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
        status: 'ACTIVE',
        branchId: data.branchId || user.branchId || null,
      },
      include: {
        branch: {
          select: { name: true }
        }
      }
    });
    
    // Log audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        module: 'CUSTOMER',
        recordId: customer.id,
        newValues: JSON.stringify(customer),
      }
    });
    
    return NextResponse.json({ success: true, customer });
  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
