import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Story from '@/models/Story';
import Profile from '@/models/Profile';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const filter: Record<string, unknown> = { status: 'approved', published: true };
    if (category) filter.category = category;

    const stories = await Story.find(filter)
      .populate('author', 'name email role department graduationYear')
      .sort({ createdAt: -1 });

    return NextResponse.json({ stories });
  } catch (error: unknown) {
    console.error('Get stories error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

    const profile = await Profile.findOne({ userId: authUser.userId });

    const story = await Story.create({
      ...body,
      author: authUser.userId,
      profilePhoto: profile?.profilePhoto || '',
      company: profile?.company || body.company || '',
      designation: profile?.jobTitle || body.designation || '',
      graduationYear: profile?.graduationYear || body.graduationYear || 0,
      status: 'pending',
      published: false,
    });

    return NextResponse.json({ message: 'Story submitted successfully for admin review', story }, { status: 201 });
  } catch (error: unknown) {
    console.error('Submit story error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
