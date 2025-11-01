import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const published = searchParams.get('published');

    const where: any = {};

    // Viewers can only see published posts
    if ((session.user as any).role === Role.VIEWER) {
      where.published = true;
    } else if (published) {
      where.published = published === 'true';
    }

    if (siteId) {
      where.siteId = siteId;
    }

    // Editors can only see their own posts
    if ((session.user as any).role === Role.EDITOR) {
      where.authorId = (session.user as any).id;
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Ошибка получения постов:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении постов' },
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

    // Only ADMIN and EDITOR can create posts
    if (userRole !== Role.ADMIN && userRole !== Role.EDITOR) {
      return NextResponse.json(
        { error: 'Недостаточно прав для создания поста' },
        { status: 403 }
      );
    }

    const {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      published,
      publishedAt,
      metaTitle,
      metaDescription,
      tags,
      siteId,
    } = await request.json();

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Название, slug и содержимое обязательны' },
        { status: 400 }
      );
    }

    const existingPost = await prisma.post.findFirst({
      where: {
        slug,
        siteId: siteId || null,
      },
    });

    if (existingPost) {
      return NextResponse.json(
        { error: 'Пост с таким slug уже существует' },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        published: published || false,
        publishedAt: published && publishedAt ? new Date(publishedAt) : published ? new Date() : null,
        metaTitle,
        metaDescription,
        tags: tags || [],
        authorId: (session.user as any).id,
        siteId: siteId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания поста:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании поста' },
      { status: 500 }
    );
  }
}
