import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import EventRegistration from '@/models/EventRegistration';
import Notification from '@/models/Notification';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { eventId } = await request.json();

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.registeredCount >= event.maxParticipants) {
      return NextResponse.json({ error: 'Event is fully booked' }, { status: 400 });
    }

    const existing = await EventRegistration.findOne({ eventId, userId: authUser.userId });
    if (existing) {
      return NextResponse.json({ error: 'Already registered for this event' }, { status: 400 });
    }

    await EventRegistration.create({ eventId, userId: authUser.userId });

    // Increment count
    event.registeredCount += 1;
    await event.save();

    // Create notification
    await Notification.create({
      userId: authUser.userId,
      title: 'Event Registration Confirmed',
      message: `You have successfully registered for "${event.title}".`,
      type: 'event_registration',
      link: `/events/${eventId}`,
    });

    return NextResponse.json({ message: 'Registered successfully', registeredCount: event.registeredCount });
  } catch (error: unknown) {
    console.error('Event registration error:', error);
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
    const eventId = searchParams.get('eventId');

    const reg = await EventRegistration.findOneAndDelete({ eventId, userId: authUser.userId });
    if (!reg) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    const event = await Event.findById(eventId);
    if (event && event.registeredCount > 0) {
      event.registeredCount -= 1;
      await event.save();
    }

    return NextResponse.json({ message: 'Registration cancelled' });
  } catch (error: unknown) {
    console.error('Cancel registration error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
