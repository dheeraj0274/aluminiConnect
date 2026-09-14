import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Announcement from '@/models/Announcement';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const filter: Record<string, unknown> = { published: true };
    if (category) filter.category = category;

    const announcements = await Announcement.find(filter)
      .populate('author', 'name email role')
      .sort({ date: -1 });

    return NextResponse.json({ announcements });
  } catch (error: unknown) {
    console.error('Get announcements error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();

    const announcement = await Announcement.create({
      ...body,
      author: authUser.userId,
      published: true,
    });

    return NextResponse.json({ message: 'Announcement created successfully', announcement }, { status: 201 });
  } catch (error: unknown) {
    console.error('Create announcement error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
