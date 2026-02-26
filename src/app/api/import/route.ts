import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';

// POST - Import data from CSV/JSON
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
    const { type, records } = data;
    
    if (!type || !records || !Array.isArray(records)) {
      return NextResponse.json(
        { error: 'Type and records array are required' },
        { status: 400 }
      );
    }
    
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };
    
    if (type === 'customers') {
      for (const record of records) {
        try {
          const customerCount = await db.customer.count();
          const customerId = `CUS${String(customerCount + 1).padStart(6, '0')}`;
          
          await db.customer.create({
            data: {
              customerId,
              firstName: record.firstName,
              lastName: record.lastName,
              email: record.email || null,
              phone: record.phone,
              alternatePhone: record.alternatePhone || null,
              address: record.address || null,
              city: record.city || null,
              state: record.state || null,
              pincode: record.pincode || null,
              dateOfBirth: record.dateOfBirth ? new Date(record.dateOfBirth) : null,
              gender: record.gender || null,
              occupation: record.occupation || null,
              annualIncome: record.annualIncome ? parseFloat(record.annualIncome) : null,
              status: 'ACTIVE',
            }
          });
          
          results.success++;
        } catch (err) {
          results.failed++;
          results.errors.push(`Failed to import customer: ${record.firstName} ${record.lastName} - ${err}`);
        }
      }
    } else if (type === 'loans') {
      for (const record of records) {
        try {
          // Find customer by phone or customerId
          let customer = null;
          if (record.customerId) {
            customer = await db.customer.findUnique({
              where: { customerId: record.customerId }
            });
          } else if (record.customerPhone) {
            customer = await db.customer.findFirst({
              where: { phone: record.customerPhone }
            });
          }
          
          if (!customer) {
            results.failed++;
            results.errors.push(`Customer not found for loan: ${record.customerId || record.customerPhone}`);
            continue;
          }
          
          const loanCount = await db.loan.count();
          const loanReferenceNumber = `LN${String(loanCount + 1).padStart(8, '0')}`;
          
          const disbursementDate = record.disbursementDate ? new Date(record.disbursementDate) : new Date();
          const tenureMonths = parseInt(record.tenureMonths) || 12;
          const maturityDate = new Date(disbursementDate);
          maturityDate.setMonth(maturityDate.getMonth() + tenureMonths);
          
          const principalAmount = parseFloat(record.principalAmount);
          
          await db.loan.create({
            data: {
              loanReferenceNumber,
              customerId: customer.id,
              principalAmount,
              interestRate: parseFloat(record.interestRate) || 12,
              interestType: record.interestType || 'MONTHLY',
              tenureMonths,
              disbursementDate,
              maturityDate,
              status: record.status || 'ACTIVE',
              riskZone: 'GREEN',
              totalOrnamentValue: principalAmount * 1.33, // Assume 75% LTV
              loanToValueRatio: 75,
              outstandingPrincipal: principalAmount,
            }
          });
          
          results.success++;
        } catch (err) {
          results.failed++;
          results.errors.push(`Failed to import loan: ${record.loanReferenceNumber || 'unknown'} - ${err}`);
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid import type. Supported: customers, loans' },
        { status: 400 }
      );
    }
    
    // Log audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'IMPORT',
        module: type.toUpperCase(),
        newValues: JSON.stringify({ type, success: results.success, failed: results.failed }),
      }
    });
    
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import data' },
      { status: 500 }
    );
  }
}
