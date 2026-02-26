import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
<<<<<<< HEAD
    console.log('Initializing database...');
    
=======
>>>>>>> 04eb435d1a6e92ce3425f7e254d5829ee4bdb0c7
    // Check if admin exists
    const existingAdmin = await db.user.findUnique({
      where: { username: 'admin' }
    });
    
    if (!existingAdmin) {
      const hashedPassword = await hashPassword('admin');
      await db.user.create({
        data: {
          username: 'admin',
          email: 'admin@olms.com',
          password: hashedPassword,
          name: 'Administrator',
          role: 'ADMIN',
<<<<<<< HEAD
          status: 'ACTIVE',
        }
      });
      console.log('Created admin user');
=======
        }
      });
>>>>>>> 04eb435d1a6e92ce3425f7e254d5829ee4bdb0c7
    }
    
    // Create default branch if not exists
    const existingBranch = await db.branch.findFirst();
    
    if (!existingBranch) {
      await db.branch.create({
        data: {
          name: 'Main Branch',
          address: 'Default Branch Address',
          phone: '+91 1234567890',
          email: 'main@olms.com',
          status: 'ACTIVE',
        }
      });
<<<<<<< HEAD
      console.log('Created default branch');
=======
>>>>>>> 04eb435d1a6e92ce3425f7e254d5829ee4bdb0c7
    }
    
    // Initialize default settings
    const settings = [
      { key: 'default_interest_rate', value: '12', description: 'Default annual interest rate (%)' },
      { key: 'loan_to_value_ratio', value: '75', description: 'Maximum loan to value ratio (%)' },
      { key: 'penalty_rate', value: '2', description: 'Penalty interest rate for overdue (%)' },
      { key: 'yellow_zone_threshold', value: '80', description: 'LTV threshold for yellow zone (%)' },
      { key: 'red_zone_threshold', value: '90', description: 'LTV threshold for red zone (%)' },
      { key: 'overdue_days_red', value: '15', description: 'Days overdue for red zone' },
    ];
    
    for (const setting of settings) {
      const existing = await db.setting.findUnique({
        where: { key: setting.key }
      });
      
      if (!existing) {
        await db.setting.create({ data: setting });
<<<<<<< HEAD
        console.log(`Created setting: ${setting.key}`);
      }
    }
    
    console.log('Database initialized successfully');
    
=======
      }
    }
    
>>>>>>> 04eb435d1a6e92ce3425f7e254d5829ee4bdb0c7
    return NextResponse.json({ 
      success: true, 
      message: 'System initialized successfully' 
    });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json(
<<<<<<< HEAD
      { error: 'Initialization failed', details: error instanceof Error ? error.message : 'Unknown error' },
=======
      { error: 'Initialization failed' },
>>>>>>> 04eb435d1a6e92ce3425f7e254d5829ee4bdb0c7
      { status: 500 }
    );
  }
}
