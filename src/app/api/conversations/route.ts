import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Conversation from '@/models/Conversation';
import Profile from '@/models/Profile';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const conversations = await Conversation.find({
      participants: authUser.userId,
    })
      .populate('participants', 'name email role graduationYear department currentLocation')
      .sort({ updatedAt: -1 });

    // Fetch participant profiles for photos
    const otherUserIds = conversations
      .map(c => {
        const other = c.participants.find(p => p._id.toString() !== authUser.userId);
        return other?._id.toString();
      })
      .filter((id): id is string => Boolean(id));

    const profiles = await Profile.find({ userId: { $in: otherUserIds } }, 'userId profilePhoto jobTitle company');

    const result = conversations.map(c => {
      const other = c.participants.find(p => p._id.toString() !== authUser.userId);
      const profile = profiles.find(pr => pr.userId.toString() === other?._id.toString());
      return {
        id: c._id.toString(),
        otherUser: other ? {
          id: other._id.toString(),
          name: (other as unknown as { name: string }).name,
          role: (other as unknown as { role: string }).role,
          department: (other as unknown as { department: string }).department,
          profilePhoto: profile?.profilePhoto || '',
          jobTitle: profile?.jobTitle || '',
          company: profile?.company || '',
        } : null,
        lastMessage: c.lastMessage,
        updatedAt: c.updatedAt,
      };
    });

    return NextResponse.json({ conversations: result });
  } catch (error: unknown) {
    console.error('Get conversations error:', error);
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

    let conversation = await Conversation.findOne({
      participants: { $all: [authUser.userId, recipientId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [authUser.userId, recipientId],
        lastMessage: '',
        lastMessageAt: new Date(),
      });
    }

    return NextResponse.json({ conversationId: conversation._id.toString() }, { status: 201 });
  } catch (error: unknown) {
    console.error('Create conversation error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
