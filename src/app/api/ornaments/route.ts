import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - List all ornaments
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
    const customerId = searchParams.get('customerId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    const where: Record<string, unknown> = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { ornamentId: { contains: search } },
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (customerId) {
      where.customerId = customerId;
    }
    
    const [ornaments, total] = await Promise.all([
      db.ornament.findMany({
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
          loan: {
            select: {
              id: true,
              loanReferenceNumber: true,
              status: true,
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.ornament.count({ where })
    ]);
    
    return NextResponse.json({
      ornaments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get ornaments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ornaments' },
      { status: 500 }
    );
  }
}

// POST - Create new ornament
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
    if (!data.customerId || !data.name || !data.type || !data.metalType) {
      return NextResponse.json(
        { error: 'Customer, name, type, and metal type are required' },
        { status: 400 }
      );
    }
    
    if (!data.grossWeight || data.grossWeight <= 0) {
      return NextResponse.json(
        { error: 'Gross weight must be greater than 0' },
        { status: 400 }
      );
    }
    
    // Generate ornament ID
    const ornamentCount = await db.ornament.count();
    const ornamentId = `ORN${String(ornamentCount + 1).padStart(6, '0')}`;
    
    // Get current metal rate for valuation
    let valuationAmount = data.valuationAmount || 0;
    
    if (!valuationAmount && data.metalType && data.karat) {
      const rate = await db.metalRate.findFirst({
        where: {
          metalType: data.metalType,
          karat: data.karat,
        },
        orderBy: { rateDate: 'desc' }
      });
      
      if (rate) {
        valuationAmount = rate.ratePerGram * (data.netWeight || data.grossWeight);
      }
    }
    
    const ornament = await db.ornament.create({
      data: {
        ornamentId,
        customerId: data.customerId,
        name: data.name,
        type: data.type,
        metalType: data.metalType,
        karat: parseFloat(data.karat) || 22,
        grossWeight: parseFloat(data.grossWeight),
        netWeight: parseFloat(data.netWeight || data.grossWeight),
        stoneWeight: parseFloat(data.stoneWeight) || 0,
        description: data.description || null,
        imagePaths: data.imagePaths || null,
        valuationAmount,
        valuationDate: new Date(),
        status: 'AVAILABLE',
      },
      include: {
        customer: {
          select: {
            customerId: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });
    
    // Log audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        module: 'ORNAMENT',
        recordId: ornament.id,
        newValues: JSON.stringify(ornament),
      }
    });
    
    return NextResponse.json({ success: true, ornament });
  } catch (error) {
    console.error('Create ornament error:', error);
    return NextResponse.json(
      { error: 'Failed to create ornament' },
      { status: 500 }
    );
  }
}
