import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

async function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('Adding sample data...');
  
  // Create sample customers
  const customers = [
    { firstName: 'Rajesh', lastName: 'Kumar', phone: '9876543210', email: 'rajesh@email.com', city: 'Mumbai', status: 'ACTIVE' },
    { firstName: 'Priya', lastName: 'Sharma', phone: '9876543211', email: 'priya@email.com', city: 'Delhi', status: 'ACTIVE' },
    { firstName: 'Amit', lastName: 'Patel', phone: '9876543212', email: 'amit@email.com', city: 'Ahmedabad', status: 'ACTIVE' },
    { firstName: 'Sunita', lastName: 'Verma', phone: '9876543213', email: 'sunita@email.com', city: 'Jaipur', status: 'ACTIVE' },
    { firstName: 'Ravi', lastName: 'Singh', phone: '9876543214', email: 'ravi@email.com', city: 'Lucknow', status: 'ACTIVE' },
  ];
  
  const createdCustomers = [];
  for (let i = 0; i < customers.length; i++) {
    const customerData = customers[i];
    const customerId = `CUS${String(i + 1).padStart(6, '0')}`;
    
    const existing = await prisma.customer.findUnique({ where: { customerId } });
    if (!existing) {
      const customer = await prisma.customer.create({
        data: { ...customerData, customerId }
      });
      createdCustomers.push(customer);
      console.log(`Created customer: ${customer.firstName} ${customer.lastName}`);
    } else {
      createdCustomers.push(existing);
      console.log(`Customer ${customerId} already exists`);
    }
  }
  
  // Create sample ornaments
  const ornaments = [
    { name: 'Gold Necklace', type: 'NECKLACE', metalType: 'GOLD', karat: 22, grossWeight: 25.5, netWeight: 24.0, valuationAmount: 150000 },
    { name: 'Gold Bangle Set', type: 'BANGLE', metalType: 'GOLD', karat: 22, grossWeight: 35.0, netWeight: 34.0, valuationAmount: 200000 },
    { name: 'Gold Earrings', type: 'EARRINGS', metalType: 'GOLD', karat: 22, grossWeight: 8.0, netWeight: 7.5, valuationAmount: 50000 },
    { name: 'Silver Chain', type: 'CHAIN', metalType: 'SILVER', karat: 92.5, grossWeight: 50.0, netWeight: 48.0, valuationAmount: 40000 },
    { name: 'Gold Ring', type: 'RING', metalType: 'GOLD', karat: 24, grossWeight: 5.0, netWeight: 4.8, valuationAmount: 35000 },
  ];
  
  const createdOrnaments = [];
  for (let i = 0; i < ornaments.length; i++) {
    const ornamentData = ornaments[i];
    const ornamentId = `ORN${String(i + 1).padStart(6, '0')}`;
    
    const existing = await prisma.ornament.findUnique({ where: { ornamentId } });
    if (!existing) {
      const ornament = await prisma.ornament.create({
        data: {
          ...ornamentData,
          ornamentId,
          customerId: createdCustomers[i % createdCustomers.length].id,
          status: 'PLEDGED'
        }
      });
      createdOrnaments.push(ornament);
      console.log(`Created ornament: ${ornament.name}`);
    } else {
      createdOrnaments.push(existing);
      console.log(`Ornament ${ornamentId} already exists`);
    }
  }
  
  // Create sample loans
  const loans = [
    { principalAmount: 100000, interestRate: 12, status: 'ACTIVE', riskZone: 'GREEN' },
    { principalAmount: 150000, interestRate: 12, status: 'ACTIVE', riskZone: 'YELLOW' },
    { principalAmount: 80000, interestRate: 12, status: 'ACTIVE', riskZone: 'GREEN' },
    { principalAmount: 200000, interestRate: 12, status: 'OVERDUE', riskZone: 'RED' },
    { principalAmount: 50000, interestRate: 12, status: 'ACTIVE', riskZone: 'GREEN' },
  ];
  
  const createdLoans = [];
  for (let i = 0; i < loans.length; i++) {
    const loanData = loans[i];
    const loanReferenceNumber = `LN${String(Date.now() + i).slice(-8)}`;
    
    const customer = createdCustomers[i % createdCustomers.length];
    const ornament = createdOrnaments[i % createdOrnaments.length];
    
    const existing = await prisma.loan.findFirst({ where: { loanReferenceNumber } });
    if (!existing) {
      const loan = await prisma.loan.create({
        data: {
          ...loanData,
          loanReferenceNumber,
          customerId: customer.id,
          totalOrnamentValue: ornament.valuationAmount,
          loanToValueRatio: (loanData.principalAmount / ornament.valuationAmount) * 100,
          outstandingPrincipal: loanData.principalAmount,
          outstandingInterest: 0,
          totalInterestPaid: 0,
          totalPrincipalPaid: 0,
          penaltyAmount: 0,
          disbursementDate: new Date(Date.now() - (i * 30 * 24 * 60 * 60 * 1000)), // Spread over months
        }
      });
      
      // Link ornament to loan
      await prisma.ornament.update({
        where: { id: ornament.id },
        data: { loanId: loan.id, status: 'PLEDGED' }
      });
      
      createdLoans.push(loan);
      console.log(`Created loan: ${loan.loanReferenceNumber}`);
    } else {
      createdLoans.push(existing);
      console.log(`Loan ${loanReferenceNumber} already exists`);
    }
  }
  
  // Create sample payments
  const payments = [
    { amount: 5000, paymentType: 'INTEREST', paymentMethod: 'CASH' },
    { amount: 10000, paymentType: 'BOTH', paymentMethod: 'UPI' },
    { amount: 3000, paymentType: 'INTEREST', paymentMethod: 'CASH' },
  ];
  
  for (let i = 0; i < payments.length; i++) {
    const paymentData = payments[i];
    const paymentId = `PAY${String(Date.now() + i).slice(-8)}`;
    const loan = createdLoans[i % createdLoans.length];
    
    const existing = await prisma.payment.findUnique({ where: { paymentId } });
    if (!existing) {
      await prisma.payment.create({
        data: {
          ...paymentData,
          paymentId,
          loanId: loan.id,
          customerId: loan.customerId,
          principalAmount: paymentData.paymentType === 'BOTH' ? paymentData.amount * 0.6 : 0,
          interestAmount: paymentData.paymentType === 'INTEREST' ? paymentData.amount : paymentData.amount * 0.4,
          penaltyAmount: 0,
          receiptNumber: `RCP${Date.now() + i}`,
          paymentDate: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)),
        }
      });
      console.log(`Created payment: ${paymentId}`);
    } else {
      console.log(`Payment ${paymentId} already exists`);
    }
  }
  
  // Create sample metal rates
  const rates = [
    { metalType: 'GOLD', karat: 24, ratePerGram: 6500 },
    { metalType: 'GOLD', karat: 22, ratePerGram: 6000 },
    { metalType: 'GOLD', karat: 18, ratePerGram: 5000 },
    { metalType: 'SILVER', karat: 92.5, ratePerGram: 80 },
  ];
  
  for (const rate of rates) {
    const existing = await prisma.metalRate.findFirst({
      where: { metalType: rate.metalType, karat: rate.karat, rateDate: new Date() }
    });
    
    if (!existing) {
      await prisma.metalRate.create({
        data: {
          ...rate,
          rateDate: new Date(),
          source: 'MANUAL'
        }
      });
      console.log(`Created rate: ${rate.metalType} ${rate.karat}K - ₹${rate.ratePerGram}/g`);
    }
  }
  
  console.log('Sample data creation completed!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
