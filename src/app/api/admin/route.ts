import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Profile from '@/models/Profile';
import Job from '@/models/Job';
import Event from '@/models/Event';
import Story from '@/models/Story';
import Announcement from '@/models/Announcement';
import Connection from '@/models/Connection';
import { requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = requireRole(request, ['admin']);

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section'); // 'stats' | 'users' | 'jobs' | 'stories' | 'announcements' | 'events'

    if (section === 'stats') {
      const totalUsers = await User.countDocuments();
      const totalAlumni = await User.countDocuments({ role: 'alumni' });
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalEvents = await Event.countDocuments();
      const totalJobs = await Job.countDocuments();
      const totalStories = await Story.countDocuments();
      const totalConnections = await Connection.countDocuments({ status: 'accepted' });
      const pendingStories = await Story.countDocuments({ status: 'pending' });

      // Unique companies from profiles
      const companies = await Profile.distinct('company');
      const totalCompanies = companies.filter(Boolean).length;

      return NextResponse.json({
        stats: {
          totalUsers,
          totalAlumni,
          totalStudents,
          totalEvents,
          totalJobs,
          totalStories,
          totalConnections,
          pendingStories,
          totalCompanies,
        },
      });
    }

    if (section === 'users') {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      const profiles = await Profile.find();
      const userList = users.map(u => {
        const p = profiles.find(pr => pr.userId.toString() === u._id.toString());
        return {
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          role: u.role,
          graduationYear: u.graduationYear,
          department: u.department,
          currentLocation: u.currentLocation,
          isActive: u.isActive,
          createdAt: u.createdAt,
          company: p?.company || '',
          jobTitle: p?.jobTitle || '',
        };
      });
      return NextResponse.json({ users: userList });
    }

    if (section === 'jobs') {
      const jobs = await Job.find().populate('postedBy', 'name email role').sort({ createdAt: -1 });
      return NextResponse.json({ jobs });
    }

    if (section === 'stories') {
      const stories = await Story.find().populate('author', 'name email role').sort({ createdAt: -1 });
      return NextResponse.json({ stories });
    }

    if (section === 'announcements') {
      const announcements = await Announcement.find().populate('author', 'name email').sort({ createdAt: -1 });
      return NextResponse.json({ announcements });
    }

    if (section === 'events') {
      const events = await Event.find().populate('organizer', 'name email').sort({ date: -1 });
      return NextResponse.json({ events });
    }

    return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Admin GET error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    requireRole(request, ['admin']);

    await dbConnect();
    const body = await request.json();
    const { target, id, action, data } = body; // target: 'user' | 'job' | 'story' | 'announcement' | 'event'

    if (target === 'user') {
      const user = await User.findById(id);
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      if (action === 'toggle-active') {
        user.isActive = !user.isActive;
      } else if (action === 'change-role') {
        user.role = data.role;
      } else if (data) {
        Object.assign(user, data);
      }
      await user.save();
      return NextResponse.json({ message: 'User updated successfully', user });
    }

    if (target === 'job') {
      const job = await Job.findById(id);
      if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

      if (action === 'update-status') {
        job.status = data.status;
      } else if (data) {
        Object.assign(job, data);
      }
      await job.save();
      return NextResponse.json({ message: 'Job updated successfully', job });
    }

    if (target === 'story') {
      const story = await Story.findById(id);
      if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 });

      if (action === 'approve') {
        story.status = 'approved';
        story.published = true;
      } else if (action === 'reject') {
        story.status = 'rejected';
        story.published = false;
      } else if (action === 'toggle-publish') {
        story.published = !story.published;
      }
      await story.save();
      return NextResponse.json({ message: 'Story status updated', story });
    }

    if (target === 'announcement') {
      const announcement = await Announcement.findById(id);
      if (!announcement) return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });

      if (action === 'toggle-publish') {
        announcement.published = !announcement.published;
      } else if (data) {
        Object.assign(announcement, data);
      }
      await announcement.save();
      return NextResponse.json({ message: 'Announcement updated', announcement });
    }

    return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Admin PUT error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    requireRole(request, ['admin']);

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const target = searchParams.get('target');
    const id = searchParams.get('id');

    if (!target || !id) {
      return NextResponse.json({ error: 'Target and ID required' }, { status: 400 });
    }

    if (target === 'user') {
      await User.findByIdAndDelete(id);
      await Profile.findOneAndDelete({ userId: id });
    } else if (target === 'job') {
      await Job.findByIdAndDelete(id);
    } else if (target === 'story') {
      await Story.findByIdAndDelete(id);
    } else if (target === 'announcement') {
      await Announcement.findByIdAndDelete(id);
    } else if (target === 'event') {
      await Event.findByIdAndDelete(id);
    }

    return NextResponse.json({ message: `${target} deleted successfully` });
  } catch (error: unknown) {
    console.error('Admin DELETE error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
