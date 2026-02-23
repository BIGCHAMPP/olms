import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - Get single ornament
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
    
    const ornament = await db.ornament.findUnique({
      where: { id },
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
          include: {
            customer: true
          }
        }
      }
    });
    
    if (!ornament) {
      return NextResponse.json(
        { error: 'Ornament not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ ornament });
  } catch (error) {
    console.error('Get ornament error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ornament' },
      { status: 500 }
    );
  }
}

// PUT - Update ornament
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
    
    const existingOrnament = await db.ornament.findUnique({
      where: { id }
    });
    
    if (!existingOrnament) {
      return NextResponse.json(
        { error: 'Ornament not found' },
        { status: 404 }
      );
    }
    
    const ornament = await db.ornament.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        metalType: data.metalType,
        karat: parseFloat(data.karat) || existingOrnament.karat,
        grossWeight: parseFloat(data.grossWeight) || existingOrnament.grossWeight,
        netWeight: parseFloat(data.netWeight) || existingOrnament.netWeight,
        stoneWeight: parseFloat(data.stoneWeight) || 0,
        description: data.description || null,
        imagePaths: data.imagePaths || existingOrnament.imagePaths,
        valuationAmount: parseFloat(data.valuationAmount) || existingOrnament.valuationAmount,
        status: data.status || existingOrnament.status,
      }
    });
    
    // Log audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE',
        module: 'ORNAMENT',
        recordId: ornament.id,
        oldValues: JSON.stringify(existingOrnament),
        newValues: JSON.stringify(ornament),
      }
    });
    
    return NextResponse.json({ success: true, ornament });
  } catch (error) {
    console.error('Update ornament error:', error);
    return NextResponse.json(
      { error: 'Failed to update ornament' },
      { status: 500 }
    );
  }
}

// DELETE - Delete ornament
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
    
    const ornament = await db.ornament.findUnique({
      where: { id }
    });
    
    if (!ornament) {
      return NextResponse.json(
        { error: 'Ornament not found' },
        { status: 404 }
      );
    }
    
    // Check if ornament is pledged
    if (ornament.status === 'PLEDGED') {
      return NextResponse.json(
        { error: 'Cannot delete pledged ornament' },
        { status: 400 }
      );
    }
    
    await db.ornament.delete({
      where: { id }
    });
    
    // Log audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'DELETE',
        module: 'ORNAMENT',
        recordId: id,
        oldValues: JSON.stringify(ornament),
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete ornament error:', error);
    return NextResponse.json(
      { error: 'Failed to delete ornament' },
      { status: 500 }
    );
  }
}
