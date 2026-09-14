import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Profile from '@/models/Profile';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || authUser.userId;

    await dbConnect();
    let profile = await Profile.findOne({ userId }).populate('userId', 'name email role graduationYear department currentLocation');

    if (!profile && userId === authUser.userId) {
      const user = await User.findById(authUser.userId);
      if (user) {
        profile = await Profile.create({
          userId: user._id,
          fullName: user.name,
          email: user.email,
          graduationYear: user.graduationYear,
          department: user.department,
          currentCity: user.currentLocation,
        });
      }
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error: unknown) {
    console.error('Get profile error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

    let profile = await Profile.findOne({ userId: authUser.userId });

    if (!profile) {
      profile = new Profile({ userId: authUser.userId, ...body });
    } else {
      Object.assign(profile, body);
    }

    await profile.save();

    // Also update User basic info if changed
    if (body.fullName || body.department || body.graduationYear || body.currentCity) {
      const updateData: Record<string, unknown> = {};
      if (body.fullName) updateData.name = body.fullName;
      if (body.department) updateData.department = body.department;
      if (body.graduationYear) updateData.graduationYear = Number(body.graduationYear);
      if (body.currentCity) updateData.currentLocation = body.currentCity;
      await User.findByIdAndUpdate(authUser.userId, updateData);
    }

    return NextResponse.json({ message: 'Profile updated successfully', profile });
  } catch (error: unknown) {
    console.error('Update profile error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
