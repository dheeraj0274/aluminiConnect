import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Profile from '@/models/Profile';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q') || '';
    const department = searchParams.get('department') || '';
    const graduationYear = searchParams.get('graduationYear') || '';
    const location = searchParams.get('location') || '';
    const industry = searchParams.get('industry') || '';
    const company = searchParams.get('company') || '';
    const skill = searchParams.get('skill') || '';
    const role = searchParams.get('role') || '';

    // Build filter object for Profile query
    const filter: Record<string, unknown> = {};

    if (department) {
      filter.department = { $regex: department, $options: 'i' };
    }
    if (graduationYear) {
      filter.graduationYear = Number(graduationYear);
    }
    if (location) {
      filter.currentCity = { $regex: location, $options: 'i' };
    }
    if (industry) {
      filter.industry = { $regex: industry, $options: 'i' };
    }
    if (company) {
      filter.company = { $regex: company, $options: 'i' };
    }
    if (skill) {
      filter.skills = { $in: [new RegExp(skill, 'i')] };
    }

    if (query) {
      filter.$or = [
        { fullName: { $regex: query, $options: 'i' } },
        { company: { $regex: query, $options: 'i' } },
        { jobTitle: { $regex: query, $options: 'i' } },
        { department: { $regex: query, $options: 'i' } },
        { currentCity: { $regex: query, $options: 'i' } },
        { skills: { $in: [new RegExp(query, 'i')] } },
      ];
    }

    let profiles = await Profile.find(filter)
      .populate('userId', 'name email role graduationYear department currentLocation isActive')
      .sort({ createdAt: -1 });

    // Filter out inactive users or filter by role if provided
    profiles = profiles.filter(p => {
      const u = p.userId as unknown as { isActive: boolean; role: string };
      if (!u || u.isActive === false) return false;
      if (role && u.role !== role) return false;
      return true;
    });

    // Extract unique values for filter dropdowns
    const allProfiles = await Profile.find({}, 'department graduationYear currentCity industry company skills');
    const filterOptions = {
      departments: Array.from(new Set(allProfiles.map(p => p.department).filter(Boolean))),
      graduationYears: Array.from(new Set(allProfiles.map(p => p.graduationYear).filter(Boolean))).sort((a, b) => b - a),
      locations: Array.from(new Set(allProfiles.map(p => p.currentCity).filter(Boolean))),
      industries: Array.from(new Set(allProfiles.map(p => p.industry).filter(Boolean))),
      companies: Array.from(new Set(allProfiles.map(p => p.company).filter(Boolean))),
    };

    return NextResponse.json({ profiles, filterOptions });
  } catch (error: unknown) {
    console.error('Alumni directory search error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
