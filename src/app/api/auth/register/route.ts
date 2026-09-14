import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Profile from '@/models/Profile';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, email, password, role, graduationYear, department, currentLocation } = body;

    if (!name || !email || !password || !graduationYear || !department) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const userRole = role === 'student' ? 'student' : 'alumni';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: userRole,
      graduationYear: Number(graduationYear),
      department,
      currentLocation: currentLocation || '',
    });

    // Create initial profile
    await Profile.create({
      userId: user._id,
      fullName: name,
      email: email.toLowerCase(),
      graduationYear: Number(graduationYear),
      department: department,
      currentCity: currentLocation || '',
    });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          graduationYear: user.graduationYear,
          department: user.department,
          currentLocation: user.currentLocation,
        },
      },
      { status: 201 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    console.error('Registration error:', error);
    const message = error instanceof Error ? error.message : 'Server error during registration';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
