import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MentorshipRequest from '@/models/MentorshipRequest';
import Profile from '@/models/Profile';
import Notification from '@/models/Notification';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view'); // 'available' | 'my-requests'

    if (view === 'available') {
      // Find profiles where availableForMentorship is true
      const mentors = await Profile.find({ availableForMentorship: true })
        .populate('userId', 'name email role graduationYear department currentLocation')
        .sort({ updatedAt: -1 });

      return NextResponse.json({ mentors });
    }

    // Get user's mentorship requests (sent or received)
    const requests = await MentorshipRequest.find({
      $or: [{ mentor: authUser.userId }, { mentee: authUser.userId }],
    })
      .populate('mentor', 'name email role department')
      .populate('mentee', 'name email role department')
      .sort({ createdAt: -1 });

    return NextResponse.json({ requests });
  } catch (error: unknown) {
    console.error('Get mentorship error:', error);
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
    const { mentorId, areas, message } = await request.json();

    if (!mentorId || !message) {
      return NextResponse.json({ error: 'Mentor ID and message are required' }, { status: 400 });
    }

    const mentorshipReq = await MentorshipRequest.create({
      mentor: mentorId,
      mentee: authUser.userId,
      areas: areas || [],
      message,
      status: 'requested',
    });

    // Notify mentor
    await Notification.create({
      userId: mentorId,
      title: 'New Mentorship Request',
      message: `${authUser.name} requested your mentorship.`,
      type: 'connection_request',
      link: '/mentorship',
    });

    return NextResponse.json({ message: 'Mentorship request sent successfully', mentorshipRequest: mentorshipReq }, { status: 201 });
  } catch (error: unknown) {
    console.error('Send mentorship request error:', error);
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
    const { requestId, status } = await request.json(); // status: 'accepted' | 'rejected' | 'completed'

    const reqDoc = await MentorshipRequest.findById(requestId);
    if (!reqDoc) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (reqDoc.mentor.toString() !== authUser.userId && reqDoc.mentee.toString() !== authUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    reqDoc.status = status;
    await reqDoc.save();

    // Notify mentee
    if (reqDoc.mentor.toString() === authUser.userId) {
      await Notification.create({
        userId: reqDoc.mentee,
        title: `Mentorship Request ${status.toUpperCase()}`,
        message: `${authUser.name} has ${status} your mentorship request.`,
        type: 'connection_accept',
        link: '/mentorship',
      });
    }

    return NextResponse.json({ message: `Mentorship request status updated to ${status}`, mentorshipRequest: reqDoc });
  } catch (error: unknown) {
    console.error('Update mentorship error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
