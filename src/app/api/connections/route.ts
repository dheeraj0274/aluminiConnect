import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Connection from '@/models/Connection';
import Profile from '@/models/Profile';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const currentUserId = authUser.userId;

    // Get all connections where user is requester or recipient
    const connections = await Connection.find({
      $or: [{ requester: currentUserId }, { recipient: currentUserId }],
    })
      .populate('requester', 'name email role graduationYear department currentLocation')
      .populate('recipient', 'name email role graduationYear department currentLocation');

    const acceptedConnections = connections.filter(c => c.status === 'accepted');
    const incomingRequests = connections.filter(c => c.recipient._id.toString() === currentUserId && c.status === 'pending');
    const outgoingRequests = connections.filter(c => c.requester._id.toString() === currentUserId && c.status === 'pending');

    // Extract connected user IDs
    const connectedUserIds = acceptedConnections.map(c =>
      c.requester._id.toString() === currentUserId ? c.recipient._id.toString() : c.requester._id.toString()
    );

    // Pending IDs (incoming + outgoing)
    const pendingUserIds = connections
      .filter(c => c.status === 'pending')
      .map(c => (c.requester._id.toString() === currentUserId ? c.recipient._id.toString() : c.requester._id.toString()));

    const excludedIds = [currentUserId, ...connectedUserIds, ...pendingUserIds];

    // Fetch profiles for connected users
    const connectedProfiles = await Profile.find({ userId: { $in: connectedUserIds } });

    // Suggested alumni
    const currentUserDoc = await User.findById(currentUserId);
    const suggestedProfiles = await Profile.find({
      userId: { $nin: excludedIds },
      $or: [
        { department: currentUserDoc?.department },
        { graduationYear: currentUserDoc?.graduationYear },
      ],
    })
      .limit(6)
      .populate('userId', 'name email role graduationYear department currentLocation');

    return NextResponse.json({
      acceptedConnections,
      connectedProfiles,
      incomingRequests,
      outgoingRequests,
      suggestedProfiles,
    });
  } catch (error: unknown) {
    console.error('Get connections error:', error);
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
    const { recipientId } = await request.json();

    if (!recipientId || recipientId === authUser.userId) {
      return NextResponse.json({ error: 'Invalid recipient' }, { status: 400 });
    }

    const existing = await Connection.findOne({
      $or: [
        { requester: authUser.userId, recipient: recipientId },
        { requester: recipientId, recipient: authUser.userId },
      ],
    });

    if (existing) {
      return NextResponse.json({ error: 'Connection or request already exists' }, { status: 400 });
    }

    const connection = await Connection.create({
      requester: authUser.userId,
      recipient: recipientId,
      status: 'pending',
    });

    // Notify recipient
    await Notification.create({
      userId: recipientId,
      title: 'New Connection Request',
      message: `${authUser.name} sent you a connection request.`,
      type: 'connection_request',
      link: '/network',
    });

    return NextResponse.json({ message: 'Connection request sent', connection }, { status: 201 });
  } catch (error: unknown) {
    console.error('Send connection request error:', error);
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
    const { connectionId, action } = await request.json(); // action: 'accept' | 'reject'

    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return NextResponse.json({ error: 'Connection request not found' }, { status: 404 });
    }

    // Verify recipient
    if (connection.recipient.toString() !== authUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (action === 'accept') {
      connection.status = 'accepted';
      await connection.save();

      // Notify requester
      await Notification.create({
        userId: connection.requester,
        title: 'Connection Accepted',
        message: `${authUser.name} accepted your connection request.`,
        type: 'connection_accept',
        link: '/network',
      });
    } else {
      connection.status = 'rejected';
      await connection.save();
    }

    return NextResponse.json({ message: `Connection ${action}ed successfully`, connection });
  } catch (error: unknown) {
    console.error('Update connection error:', error);
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
    const connectionId = searchParams.get('id');

    if (!connectionId) {
      return NextResponse.json({ error: 'Connection ID required' }, { status: 400 });
    }

    const connection = await Connection.findById(connectionId);
    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // Verify user ownership
    if (
      connection.requester.toString() !== authUser.userId &&
      connection.recipient.toString() !== authUser.userId
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Connection.findByIdAndDelete(connectionId);
    return NextResponse.json({ message: 'Connection removed successfully' });
  } catch (error: unknown) {
    console.error('Delete connection error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
