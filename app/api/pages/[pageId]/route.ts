import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        site: {
          userId: (session.user as any).id,
        },
      },
      include: {
        blocks: {
          orderBy: {
            order: 'asc',
          },
        },
        site: {
          include: {
            theme: true,
          },
        },
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Страница не найдена' }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('Ошибка получения страницы:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении страницы' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { title, slug, published, metaTitle, metaDescription } = await request.json();

    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        site: {
          userId: (session.user as any).id,
        },
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Страница не найдена' }, { status: 404 });
    }

    const updatedPage = await prisma.page.update({
      where: { id: pageId },
      data: {
        title,
        slug,
        published,
        metaTitle,
        metaDescription,
      },
      include: {
        blocks: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error('Ошибка обновления страницы:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении страницы' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        site: {
          userId: (session.user as any).id,
        },
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Страница не найдена' }, { status: 404 });
    }

    if (page.isHome) {
      return NextResponse.json(
        { error: 'Нельзя удалить главную страницу' },
        { status: 400 }
      );
    }

    await prisma.page.delete({
      where: { id: pageId },
    });

    return NextResponse.json({ message: 'Страница успешно удалена' });
  } catch (error) {
    console.error('Ошибка удаления страницы:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении страницы' },
      { status: 500 }
    );
  }
}
