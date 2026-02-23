import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - List branches
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const branches = await db.branch.findMany({
      include: {
        _count: {
          select: { users: true, customers: true, loans: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json({ branches });
  } catch (error) {
    console.error('Get branches error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branches' },
      { status: 500 }
    );
  }
}

// POST - Create branch
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const data = await request.json();
    
    if (!data.name) {
      return NextResponse.json(
        { error: 'Branch name is required' },
        { status: 400 }
      );
    }
    
    const branch = await db.branch.create({
      data: {
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        email: data.email || null,
        status: data.status || 'ACTIVE',
      }
    });
    
    return NextResponse.json({ success: true, branch });
  } catch (error) {
    console.error('Create branch error:', error);
    return NextResponse.json(
      { error: 'Failed to create branch' },
      { status: 500 }
    );
  }
}
