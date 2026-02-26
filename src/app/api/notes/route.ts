import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - List notes
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
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const where: Record<string, unknown> = {};
    
    if (loanId) {
      where.loanId = loanId;
    }
    
    if (customerId) {
      where.customerId = customerId;
    }
    
    const notes = await db.note.findMany({
      where,
      include: {
        user: {
          select: { name: true, username: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    
    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Get notes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// POST - Create note
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
    
    if (!data.content) {
      return NextResponse.json(
        { error: 'Note content is required' },
        { status: 400 }
      );
    }
    
    const note = await db.note.create({
      data: {
        loanId: data.loanId || null,
        customerId: data.customerId || null,
        userId: user.id,
        content: data.content,
      },
      include: {
        user: {
          select: { name: true, username: true }
        }
      }
    });
    
    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error('Create note error:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
