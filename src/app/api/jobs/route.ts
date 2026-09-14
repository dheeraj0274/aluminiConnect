import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Job from '@/models/Job';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('id');

    if (jobId) {
      const job = await Job.findById(jobId).populate('postedBy', 'name email role department');
      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      return NextResponse.json({ job });
    }

    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || '';
    const location = searchParams.get('location') || '';

    const filter: Record<string, unknown> = { status: 'active' };

    if (type) filter.employmentType = type;
    if (location) filter.location = { $regex: location, $options: 'i' };

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { company: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { skillsRequired: { $in: [new RegExp(query, 'i')] } },
      ];
    }

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name email role department')
      .sort({ createdAt: -1 });

    return NextResponse.json({ jobs });
  } catch (error: unknown) {
    console.error('Get jobs error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'alumni' && authUser.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden. Only alumni and admins can post jobs.' }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();

    const job = await Job.create({
      ...body,
      postedBy: authUser.userId,
      status: 'active',
    });

    // Send notifications to students
    const students = await User.find({ role: 'student' }).select('_id');
    const notifications = students.map(s => ({
      userId: s._id,
      title: 'New Job Opportunity',
      message: `${job.title} at ${job.company} was posted by an alumnus.`,
      type: 'job_post',
      link: `/jobs/${job._id}`,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return NextResponse.json({ message: 'Job posted successfully', job }, { status: 201 });
  } catch (error: unknown) {
    console.error('Post job error:', error);
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
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('id');
    const body = await request.json();

    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.postedBy.toString() !== authUser.userId && authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    Object.assign(job, body);
    await job.save();

    return NextResponse.json({ message: 'Job updated successfully', job });
  } catch (error: unknown) {
    console.error('Update job error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('id');

    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.postedBy.toString() !== authUser.userId && authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Job.findByIdAndDelete(jobId);
    return NextResponse.json({ message: 'Job post deleted' });
  } catch (error: unknown) {
    console.error('Delete job error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
