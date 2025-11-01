import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role, MediaType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as MediaType | null;

    const where: any = {};

    if (type && Object.values(MediaType).includes(type)) {
      where.type = type;
    }

    // Editors and Viewers can only see their own media
    const userRole = (session.user as any).role;
    if (userRole !== Role.ADMIN) {
      where.userId = (session.user as any).id;
    }

    const media = await prisma.media.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error('Ошибка получения медиафайлов:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении медиафайлов' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const userRole = (session.user as any).role;

    // Only ADMIN and EDITOR can upload media
    if (userRole === Role.VIEWER) {
      return NextResponse.json(
        { error: 'Недостаточно прав для загрузки медиафайлов' },
        { status: 403 }
      );
    }

    const {
      name,
      fileName,
      url,
      type,
      mimeType,
      size,
      width,
      height,
      alt,
      caption,
    } = await request.json();

    if (!name || !fileName || !url || !type || !mimeType || !size) {
      return NextResponse.json(
        { error: 'Имя, fileName, URL, тип, mimeType и размер обязательны' },
        { status: 400 }
      );
    }

    if (!Object.values(MediaType).includes(type)) {
      return NextResponse.json(
        { error: 'Недопустимый тип медиафайла' },
        { status: 400 }
      );
    }

    const media = await prisma.media.create({
      data: {
        name,
        fileName,
        url,
        type,
        mimeType,
        size,
        width,
        height,
        alt,
        caption,
        userId: (session.user as any).id,
      },
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

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания медиафайла:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании медиафайла' },
      { status: 500 }
    );
  }
}
