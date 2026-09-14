import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Profile from '@/models/Profile';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    await dbConnect();
    const user = await User.findById(authUser.userId).select('-password');
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const profile = await Profile.findOne({ userId: user._id });

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        graduationYear: user.graduationYear,
        department: user.department,
        currentLocation: user.currentLocation,
        profilePhoto: profile?.profilePhoto || '',
      },
    });
  } catch (error: unknown) {
    console.error('Me endpoint error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
