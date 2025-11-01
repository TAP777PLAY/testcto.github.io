import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const { mediaId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!media) {
      return NextResponse.json(
        { error: 'Медиафайл не найден' },
        { status: 404 }
      );
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    // Users can only see their own media unless they're admin
    if (userRole !== Role.ADMIN && media.userId !== userId) {
      return NextResponse.json(
        { error: 'Недостаточно прав для просмотра' },
        { status: 403 }
      );
    }

    return NextResponse.json(media);
  } catch (error) {
    console.error('Ошибка получения медиафайла:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении медиафайла' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const { mediaId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const existingMedia = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!existingMedia) {
      return NextResponse.json(
        { error: 'Медиафайл не найден' },
        { status: 404 }
      );
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    // Only ADMIN or media owner can edit
    if (userRole !== Role.ADMIN && existingMedia.userId !== userId) {
      return NextResponse.json(
        { error: 'Недостаточно прав для редактирования' },
        { status: 403 }
      );
    }

    const { name, alt, caption } = await request.json();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (alt !== undefined) updateData.alt = alt;
    if (caption !== undefined) updateData.caption = caption;

    const media = await prisma.media.update({
      where: { id: mediaId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error('Ошибка обновления медиафайла:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении медиафайла' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const { mediaId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const existingMedia = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!existingMedia) {
      return NextResponse.json(
        { error: 'Медиафайл не найден' },
        { status: 404 }
      );
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    // Only ADMIN or media owner can delete
    if (userRole !== Role.ADMIN && existingMedia.userId !== userId) {
      return NextResponse.json(
        { error: 'Недостаточно прав для удаления' },
        { status: 403 }
      );
    }

    await prisma.media.delete({
      where: { id: mediaId },
    });

    return NextResponse.json({ message: 'Медиафайл успешно удален' });
  } catch (error) {
    console.error('Ошибка удаления медиафайла:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении медиафайла' },
      { status: 500 }
    );
  }
}
