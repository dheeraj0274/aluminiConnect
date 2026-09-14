import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Donation from '@/models/Donation';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    let campaigns = await Donation.find().sort({ createdAt: -1 });

    // Seed default campaign if none exists
    if (campaigns.length === 0) {
      await Donation.create([
        {
          title: 'Alumni Scholarship Fund 2026',
          description: 'Supporting bright, underprivileged students with tuition grants and academic resources.',
          targetAmount: 500000,
          currentAmount: 175000,
          category: 'student-scholarships',
          donorsCount: 34,
          status: 'active',
        },
        {
          title: 'Campus Innovation Lab & Tech Center',
          description: 'Building a modern research lab equipped with high-performance computing hardware for AI and Robotics research.',
          targetAmount: 1000000,
          currentAmount: 420000,
          category: 'campus-development',
          donorsCount: 58,
          status: 'active',
        },
        {
          title: 'Alumni Emergency Assistance Fund',
          description: 'Providing immediate medical and financial relief to alumni facing sudden hardship or life crises.',
          targetAmount: 300000,
          currentAmount: 120000,
          category: 'alumni-initiatives',
          donorsCount: 22,
          status: 'active',
        },
      ]);

      campaigns = await Donation.find().sort({ createdAt: -1 });
    }

    return NextResponse.json({ campaigns });
  } catch (error: unknown) {
    console.error('Get donations error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();

    const campaign = await Donation.create({
      ...body,
      status: 'active',
      currentAmount: 0,
      donorsCount: 0,
    });

    return NextResponse.json({ message: 'Donation campaign created successfully', campaign }, { status: 201 });
  } catch (error: unknown) {
    console.error('Create donation campaign error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
