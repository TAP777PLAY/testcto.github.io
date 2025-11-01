import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activityLogger';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const { userId } = await params;
    const body = await request.json();
    const { role } = body;

    if (!role || !['user', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "user" or "admin"' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await logActivity({
      userId: auth.userId,
      action: 'update',
      entity: 'user',
      entityId: userId,
      details: { role },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const { userId } = await params;

    if (userId === auth.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    await logActivity({
      userId: auth.userId,
      action: 'delete',
      entity: 'user',
      entityId: userId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
