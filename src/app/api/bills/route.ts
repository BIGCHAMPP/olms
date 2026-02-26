import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, unlink, writeFile } from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// GET - Generate bill PDF
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
    const paymentId = searchParams.get('paymentId');
    const loanId = searchParams.get('loanId');
    const type = searchParams.get('type') || 'customer'; // customer or admin
    
    if (!paymentId && !loanId) {
      return NextResponse.json(
        { error: 'Payment ID or Loan ID is required' },
        { status: 400 }
      );
    }
    
    let payment: any = null;
    let loan: any = null;
    
    if (paymentId) {
      payment = await db.payment.findUnique({
        where: { id: paymentId },
        include: {
          loan: {
            include: {
              customer: true,
              ornaments: true,
              branch: true
            }
          },
          receivedByUser: true
        }
      });
      
      if (!payment) {
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        );
      }
      
      loan = payment.loan;
    } else if (loanId) {
      loan = await db.loan.findUnique({
        where: { id: loanId },
        include: {
          customer: true,
          ornaments: true,
          branch: true,
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });
      
      if (!loan) {
        return NextResponse.json(
          { error: 'Loan not found' },
          { status: 404 }
        );
      }
      
      payment = loan.payments[0] || null;
    }
    
    // Get settings for signature and company info
    const settings = await db.setting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });
    
    const companyInfo = {
      name: settingsMap['company_name'] || 'OLMS Gold Loan',
      address: settingsMap['company_address'] || '',
      phone: settingsMap['company_phone'] || '',
      email: settingsMap['company_email'] || '',
      gstin: settingsMap['company_gstin'] || '',
      signaturePath: settingsMap['signature_path'] || ''
    };
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `bill_${type}_${payment?.paymentId || loan.loanReferenceNumber}_${timestamp}.pdf`;
    const outputPath = path.join('/tmp', filename);
    
    // Generate PDF using Python script
    const pythonScript = generateBillPDF({
      payment,
      loan,
      type,
      companyInfo,
      outputPath
    });
    
    // Write and execute Python script
    const scriptPath = path.join('/tmp', `generate_bill_${timestamp}.py`);
    await writeFile(scriptPath, pythonScript);
    
    await execAsync(`python3 "${scriptPath}"`);
    
    // Read the generated PDF
    const pdfBuffer = await readFile(outputPath);
    
    // Cleanup
    await unlink(scriptPath);
    await unlink(outputPath);
    
    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Generate bill error:', error);
    return NextResponse.json(
      { error: 'Failed to generate bill' },
      { status: 500 }
    );
  }
}

function generateBillPDF(data: {
  payment: any;
  loan: any;
  type: string;
  companyInfo: any;
  outputPath: string;
}): string {
  const { payment, loan, type, companyInfo, outputPath } = data;
  const customer = loan.customer;
  
  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  
  const formatAmount = (amt: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amt || 0);
  };
  
  const title = type === 'customer' ? 'RECEIPT - CUSTOMER COPY' : 'RECEIPT - OFFICE COPY';
  
  return `
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib import colors
from reportlab.lib.units import inch, cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# Register fonts
pdfmetrics.registerFont(TTFont('Times', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))

# Create document
doc = SimpleDocTemplate(
    "${outputPath}",
    pagesize=A4,
    rightMargin=1*cm,
    leftMargin=1*cm,
    topMargin=1*cm,
    bottomMargin=1*cm
)

styles = getSampleStyleSheet()

# Custom styles
title_style = ParagraphStyle(
    'Title',
    parent=styles['Heading1'],
    fontName='Times',
    fontSize=18,
    alignment=TA_CENTER,
    spaceAfter=10
)

subtitle_style = ParagraphStyle(
    'Subtitle',
    parent=styles['Normal'],
    fontName='Times',
    fontSize=14,
    alignment=TA_CENTER,
    spaceAfter=20
)

header_style = ParagraphStyle(
    'Header',
    parent=styles['Normal'],
    fontName='Times',
    fontSize=12,
    alignment=TA_CENTER
)

body_style = ParagraphStyle(
    'Body',
    parent=styles['Normal'],
    fontName='Times',
    fontSize=11,
    alignment=TA_LEFT
)

bold_style = ParagraphStyle(
    'Bold',
    parent=styles['Normal'],
    fontName='Times',
    fontSize=11,
    alignment=TA_LEFT
)

story = []

# Header
story.append(Paragraph("<b>${companyInfo.name}</b>", title_style))
story.append(Paragraph("${companyInfo.address}", header_style))
story.append(Paragraph("Phone: ${companyInfo.phone} | Email: ${companyInfo.email}", header_style))
${companyInfo.gstin ? 'story.append(Paragraph("GSTIN: ' + companyInfo.gstin + '", header_style))' : ''}
story.append(Spacer(1, 0.3*inch))

# Divider line
story.append(Table([['']], colWidths=[18*cm], rowHeights=[2]))
story[-1].setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), colors.black)]))
story.append(Spacer(1, 0.2*inch))

# Title
story.append(Paragraph("<b>${title}</b>", subtitle_style))
story.append(Spacer(1, 0.2*inch))

# Receipt Info
receipt_data = [
    ['Receipt No:', '${payment?.receiptNumber || loan.loanReferenceNumber}', 'Date:', '${payment ? formatDate(payment.paymentDate) : formatDate(loan.disbursementDate)}'],
    ['Loan Ref:', '${loan.loanReferenceNumber}', 'Payment ID:', '${payment?.paymentId || 'N/A'}'],
]

receipt_table = Table(receipt_data, colWidths=[3*cm, 6*cm, 3*cm, 6*cm])
receipt_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'Times'),
    ('FONTSIZE', (0, 0), (-1, -1), 11),
    ('FONTNAME', (0, 0), (0, -1), 'Times'),
    ('FONTNAME', (2, 0), (2, -1), 'Times'),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
]))
story.append(receipt_table)
story.append(Spacer(1, 0.3*inch))

# Customer Details
story.append(Paragraph("<b>CUSTOMER DETAILS</b>", bold_style))
story.append(Spacer(1, 0.1*inch))

customer_data = [
    ['Name:', '${customer.firstName} ${customer.lastName}', 'Customer ID:', '${customer.customerId}'],
    ['Phone:', '${customer.phone}', 'Alt Phone:', '${customer.alternatePhone || 'N/A'}'],
    ['Address:', '${customer.address || 'N/A'}, ${customer.city || ''}, ${customer.state || ''} - ${customer.pincode || ''}', '', ''],
]

customer_table = Table(customer_data, colWidths=[3*cm, 6*cm, 3*cm, 6*cm])
customer_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'Times'),
    ('FONTSIZE', (0, 0), (-1, -1), 10),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('SPAN', (1, 2), (3, 2)),
]))
story.append(customer_table)
story.append(Spacer(1, 0.3*inch))

# Loan Details
story.append(Paragraph("<b>LOAN DETAILS</b>", bold_style))
story.append(Spacer(1, 0.1*inch))

loan_data = [
    ['Principal Amount:', '${formatAmount(loan.principalAmount)}', 'Interest Rate:', '${loan.interestRate}% p.a.'],
    ['Outstanding:', '${formatAmount(loan.outstandingPrincipal)}', 'Disbursement Date:', '${formatDate(loan.disbursementDate)}'],
    ['Branch:', '${loan.branch?.name || 'Main Branch'}', 'Status:', '${loan.status}'],
]

loan_table = Table(loan_data, colWidths=[3.5*cm, 5.5*cm, 3.5*cm, 5.5*cm])
loan_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'Times'),
    ('FONTSIZE', (0, 0), (-1, -1), 10),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(loan_table)
story.append(Spacer(1, 0.3*inch))

${payment ? `
# Payment Details
story.append(Paragraph("<b>PAYMENT DETAILS</b>", bold_style))
story.append(Spacer(1, 0.1*inch))

payment_data = [
    ['Payment Type:', '${payment.paymentType}', 'Payment Method:', '${payment.paymentMethod}'],
    ['Total Amount:', '${formatAmount(payment.amount)}', '', ''],
    ['Principal Component:', '${formatAmount(payment.principalAmount)}', 'Interest Component:', '${formatAmount(payment.interestAmount)}'],
    ['Penalty (if any):', '${formatAmount(payment.penaltyAmount)}', '', ''],
]

payment_table = Table(payment_data, colWidths=[3.5*cm, 5.5*cm, 3.5*cm, 5.5*cm])
payment_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'Times'),
    ('FONTSIZE', (0, 0), (-1, -1), 10),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('FONTNAME', (1, 1), (1, 1), 'Times'),
]))
story.append(payment_table)
story.append(Spacer(1, 0.3*inch))
` : ''}

# Ornament Details
story.append(Paragraph("<b>ORNAMENT DETAILS</b>", bold_style))
story.append(Spacer(1, 0.1*inch))

ornament_header = [['S.No', 'Item Name', 'Metal', 'Weight (g)', 'Value']]
ornament_rows = [
${loan.ornaments?.map((o: any, i: number) => 
  `    ['${i + 1}', '${o.name}', '${o.metalType} (${o.karat}K)', '${o.netWeight.toFixed(2)}', '${formatAmount(o.valuationAmount)}'],`
).join('\n') || "    ['1', 'N/A', '-', '-', '-'],"}
]

ornament_data = ornament_header + ornament_rows
ornament_table = Table(ornament_data, colWidths=[1.5*cm, 6*cm, 3*cm, 3*cm, 4.5*cm])
ornament_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'Times'),
    ('FONTSIZE', (0, 0), (-1, -1), 10),
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
]))
story.append(ornament_table)
story.append(Spacer(1, 0.5*inch))

# Total Amount in Words
${payment ? `
total_in_words = "${numberToWords(Math.round(payment.amount))} Rupees Only"
story.append(Paragraph("<b>Amount in Words: </b>" + total_in_words, body_style))
story.append(Spacer(1, 0.3*inch))
` : ''}

# Signature Section
story.append(Spacer(1, 0.5*inch))

sig_data = [
    ['Customer Signature', '', 'Authorized Signatory'],
    ['', '', ''],
    ['', '', ''],
]

sig_table = Table(sig_data, colWidths=[6*cm, 6*cm, 6*cm])
sig_table.setStyle(TableStyle([
    ('FONTNAME', (0, 0), (-1, -1), 'Times'),
    ('FONTSIZE', (0, 0), (-1, -1), 10),
    ('ALIGN', (0, 0), (0, 0), 'LEFT'),
    ('ALIGN', (2, 0), (2, 0), 'RIGHT'),
    ('LINEABOVE', (2, 1), (2, 1), 1, colors.black),
    ('LINEABOVE', (0, 1), (0, 1), 1, colors.black),
]))
story.append(sig_table)

${companyInfo.signaturePath && type === 'admin' ? `
# Add signature image for admin copy
if os.path.exists("${companyInfo.signaturePath}"):
    sig_img = Image("${companyInfo.signaturePath}", width=3*cm, height=1.5*cm)
    sig_img.hAlign = 'RIGHT'
    story.append(sig_img)
` : ''}

# Footer
story.append(Spacer(1, 0.5*inch))
story.append(Paragraph("This is a computer generated receipt.", ParagraphStyle('Footer', parent=styles['Normal'], fontName='Times', fontSize=9, alignment=TA_CENTER, textColor=colors.grey)))
story.append(Paragraph("Thank you for your business!", ParagraphStyle('Footer2', parent=styles['Normal'], fontName='Times', fontSize=10, alignment=TA_CENTER)))

# Build PDF
doc.build(story)
print("PDF generated successfully")

def numberToWords(n):
    ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
    teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
    
    if n == 0:
        return 'Zero'
    
    result = ''
    
    if n >= 10000000:
        result += ones[n // 10000000] + ' Crore '
        n %= 10000000
    
    if n >= 100000:
        result += ones[n // 100000] + ' Lakh '
        n %= 100000
    
    if n >= 1000:
        result += ones[n // 1000] + ' Thousand '
        n %= 1000
    
    if n >= 100:
        result += ones[n // 100] + ' Hundred '
        n %= 100
    
    if n >= 20:
        result += tens[n // 10] + ' '
        n %= 10
    
    if n >= 10:
        result += teens[n - 10] + ' '
        n = 0
    
    if n > 0:
        result += ones[n] + ' '
    
    return result.strip()
`;
}
