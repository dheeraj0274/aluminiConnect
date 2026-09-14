import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import Notification from '@/models/Notification';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    await dbConnect();

    // Verify user is in conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.map(p => p.toString()).includes(authUser.userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    // Mark unread messages as read
    await Message.updateMany(
      { conversationId, sender: { $ne: authUser.userId }, readBy: { $ne: authUser.userId } },
      { $addToSet: { readBy: authUser.userId } }
    );

    return NextResponse.json({ messages });
  } catch (error: unknown) {
    console.error('Get messages error:', error);
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
    const { conversationId, content } = await request.json();

    if (!conversationId || !content?.trim()) {
      return NextResponse.json({ error: 'Conversation ID and message content are required' }, { status: 400 });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.map(p => p.toString()).includes(authUser.userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const message = await Message.create({
      conversationId,
      sender: authUser.userId,
      content: content.trim(),
      readBy: [authUser.userId],
    });

    // Update conversation lastMessage
    conversation.lastMessage = content.trim();
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Notify recipient
    const recipientId = conversation.participants.find(p => p.toString() !== authUser.userId);
    if (recipientId) {
      await Notification.create({
        userId: recipientId,
        title: 'New Message',
        message: `${authUser.name}: ${content.trim().substring(0, 50)}${content.length > 50 ? '...' : ''}`,
        type: 'message',
        link: `/messages/${conversationId}`,
      });
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error: unknown) {
    console.error('Send message error:', error);
    const errMsg = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
