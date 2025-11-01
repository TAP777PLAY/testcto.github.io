import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { title, slug } = await request.json();

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Название и slug обязательны' },
        { status: 400 }
      );
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

    const existingPage = await prisma.page.findUnique({
      where: {
        siteId_slug: {
          siteId,
          slug,
        },
      },
    });

    if (existingPage) {
      return NextResponse.json(
        { error: 'Страница с таким slug уже существует' },
        { status: 400 }
      );
    }

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        siteId,
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания страницы:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании страницы' },
      { status: 500 }
    );
  }
}
