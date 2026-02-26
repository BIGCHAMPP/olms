import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - List audit logs
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const moduleFilter = searchParams.get('module') || '';
    const action = searchParams.get('action') || '';
    const userId = searchParams.get('userId') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;
    
    const where: Record<string, unknown> = {};
    
    if (moduleFilter) {
      where.module = moduleFilter;
    }
    
    if (action) {
      where.action = action;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: {
          user: {
            select: { name: true, username: true }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.auditLog.count({ where })
    ]);
    
    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
