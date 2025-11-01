import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/adminAuth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  const auth = await getSession();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const { notificationId } = await params;

    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: auth.userId,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  const auth = await getSession();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const { notificationId } = await params;

    await prisma.notification.delete({
      where: {
        id: notificationId,
        userId: auth.userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
