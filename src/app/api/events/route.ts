import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import EventRegistration from '@/models/EventRegistration';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');

    if (eventId) {
      const event = await Event.findById(eventId).populate('organizer', 'name email role department');
      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      // Check if current user registered
      const authUser = getAuthUser(request);
      let isRegistered = false;
      if (authUser) {
        const reg = await EventRegistration.findOne({ eventId, userId: authUser.userId });
        isRegistered = !!reg;
      }

      return NextResponse.json({ event, isRegistered });
    }

    const query = searchParams.get('q') || '';
    const eventType = searchParams.get('eventType') || '';
    const filterStatus = searchParams.get('status') || '';

    const filter: Record<string, unknown> = {};
    if (eventType) filter.eventType = eventType;
    if (filterStatus) filter.status = filterStatus;

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { venue: { $regex: query, $options: 'i' } },
      ];
    }

    const events = await Event.find(filter)
      .populate('organizer', 'name email role department')
      .sort({ date: 1 });

    // Fetch registered event IDs for auth user if present
    const authUser = getAuthUser(request);
    let registeredEventIds: string[] = [];
    if (authUser) {
      const regs = await EventRegistration.find({ userId: authUser.userId });
      registeredEventIds = regs.map(r => r.eventId.toString());
    }

    return NextResponse.json({ events, registeredEventIds });
  } catch (error: unknown) {
    console.error('Get events error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (authUser.role !== 'alumni' && authUser.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden. Only alumni and admins can create events.' }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();

    const event = await Event.create({
      ...body,
      organizer: authUser.userId,
    });

    return NextResponse.json({ message: 'Event created successfully', event }, { status: 201 });
  } catch (error: unknown) {
    console.error('Create event error:', error);
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
    const eventId = searchParams.get('id');
    const body = await request.json();

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizer.toString() !== authUser.userId && authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    Object.assign(event, body);
    await event.save();

    return NextResponse.json({ message: 'Event updated successfully', event });
  } catch (error: unknown) {
    console.error('Update event error:', error);
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
    const eventId = searchParams.get('id');

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizer.toString() !== authUser.userId && authUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Event.findByIdAndDelete(eventId);
    await EventRegistration.deleteMany({ eventId });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error: unknown) {
    console.error('Delete event error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
