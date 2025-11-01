import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        userId: (session.user as any).id,
      },
      include: {
        pages: {
          include: {
            blocks: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        theme: true,
      },
    });

    if (!site) {
      return NextResponse.json({ error: 'Сайт не найден' }, { status: 404 });
    }

    return NextResponse.json(site);
  } catch (error) {
    console.error('Ошибка получения сайта:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении сайта' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { name, slug, description, published } = await request.json();

    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        userId: (session.user as any).id,
      },
    });

    if (!site) {
      return NextResponse.json({ error: 'Сайт не найден' }, { status: 404 });
    }

    const updatedSite = await prisma.site.update({
      where: { id: siteId },
      data: {
        name,
        slug,
        description,
        published,
      },
      include: {
        pages: true,
        theme: true,
      },
    });

    return NextResponse.json(updatedSite);
  } catch (error) {
    console.error('Ошибка обновления сайта:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении сайта' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        userId: (session.user as any).id,
      },
    });

    if (!site) {
      return NextResponse.json({ error: 'Сайт не найден' }, { status: 404 });
    }

    await prisma.site.delete({
      where: { id: siteId },
    });

    return NextResponse.json({ message: 'Сайт успешно удален' });
  } catch (error) {
    console.error('Ошибка удаления сайта:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении сайта' },
      { status: 500 }
    );
  }
}
