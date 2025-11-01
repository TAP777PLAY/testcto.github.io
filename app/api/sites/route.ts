import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const sites = await prisma.site.findMany({
      where: {
        userId: (session.user as any).id,
      },
      include: {
        pages: true,
        theme: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(sites);
  } catch (error) {
    console.error('Ошибка получения сайтов:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении сайтов' },
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

    const { name, slug, description } = await request.json();

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Название и slug обязательны' },
        { status: 400 }
      );
    }

    const existingSite = await prisma.site.findUnique({
      where: { slug },
    });

    if (existingSite) {
      return NextResponse.json(
        { error: 'Сайт с таким slug уже существует' },
        { status: 400 }
      );
    }

    const site = await prisma.site.create({
      data: {
        name,
        slug,
        description,
        userId: (session.user as any).id,
        theme: {
          create: {
            name: 'Стандартная тема',
          },
        },
        pages: {
          create: {
            title: 'Главная',
            slug: 'index',
            isHome: true,
          },
        },
      },
      include: {
        pages: true,
        theme: true,
      },
    });

    return NextResponse.json(site, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания сайта:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании сайта' },
      { status: 500 }
    );
  }
}
