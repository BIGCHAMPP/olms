import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - List metal rates
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
    const metalType = searchParams.get('metalType') || '';
    const limit = parseInt(searchParams.get('limit') || '30');
    
    const where: Record<string, unknown> = {};
    
    if (metalType) {
      where.metalType = metalType;
    }
    
    const rates = await db.metalRate.findMany({
      where,
      orderBy: { rateDate: 'desc' },
      take: limit
    });
    
    // Get latest rates for each metal type and karat
    const latestRates = await db.$queryRaw<Array<{ metalType: string; karat: number; ratePerGram: number; rateDate: string }>>`
      SELECT metalType, karat, ratePerGram, rateDate
      FROM MetalRate
      WHERE id IN (
        SELECT MAX(id) FROM MetalRate GROUP BY metalType, karat
      )
      ORDER BY metalType, karat
    `;
    
    return NextResponse.json({ rates, latestRates });
  } catch (error) {
    console.error('Get rates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rates' },
      { status: 500 }
    );
  }
}

// POST - Add new rate
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
    
    if (!data.metalType || !data.karat || !data.ratePerGram) {
      return NextResponse.json(
        { error: 'Metal type, karat, and rate are required' },
        { status: 400 }
      );
    }
    
    const rateDate = data.rateDate ? new Date(data.rateDate) : new Date();
    
    // Check if rate already exists for this date
    const existingRate = await db.metalRate.findFirst({
      where: {
        metalType: data.metalType,
        karat: parseFloat(data.karat),
        rateDate,
      }
    });
    
    if (existingRate) {
      // Update existing rate
      const rate = await db.metalRate.update({
        where: { id: existingRate.id },
        data: {
          ratePerGram: parseFloat(data.ratePerGram),
          source: data.source || 'MANUAL',
        }
      });
      
      return NextResponse.json({ success: true, rate });
    }
    
    const rate = await db.metalRate.create({
      data: {
        metalType: data.metalType,
        karat: parseFloat(data.karat),
        ratePerGram: parseFloat(data.ratePerGram),
        rateDate,
        source: data.source || 'MANUAL',
      }
    });
    
    // Log audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE',
        module: 'RATE',
        recordId: rate.id,
        newValues: JSON.stringify(rate),
      }
    });
    
    return NextResponse.json({ success: true, rate });
  } catch (error) {
    console.error('Create rate error:', error);
    return NextResponse.json(
      { error: 'Failed to create rate' },
      { status: 500 }
    );
  }
}
