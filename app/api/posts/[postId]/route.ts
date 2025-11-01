import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
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

    if (!post) {
      return NextResponse.json({ error: 'Пост не найден' }, { status: 404 });
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    // Viewers can only see published posts
    if (userRole === Role.VIEWER && !post.published) {
      return NextResponse.json(
        { error: 'Недостаточно прав для просмотра' },
        { status: 403 }
      );
    }

    // Editors can only see their own unpublished posts
    if (
      userRole === Role.EDITOR &&
      !post.published &&
      post.authorId !== userId
    ) {
      return NextResponse.json(
        { error: 'Недостаточно прав для просмотра' },
        { status: 403 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Ошибка получения поста:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении поста' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Пост не найден' }, { status: 404 });
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    // Only ADMIN or post author can edit
    if (userRole !== Role.ADMIN && existingPost.authorId !== userId) {
      return NextResponse.json(
        { error: 'Недостаточно прав для редактирования' },
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

    // Check slug uniqueness if changing
    if (slug && slug !== existingPost.slug) {
      const postWithSlug = await prisma.post.findFirst({
        where: {
          slug,
          siteId: siteId !== undefined ? siteId : existingPost.siteId,
          NOT: { id: postId },
        },
      });

      if (postWithSlug) {
        return NextResponse.json(
          { error: 'Пост с таким slug уже существует' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (tags !== undefined) updateData.tags = tags;
    if (siteId !== undefined) updateData.siteId = siteId;

    if (published !== undefined) {
      updateData.published = published;
      if (published && !existingPost.publishedAt) {
        updateData.publishedAt = publishedAt ? new Date(publishedAt) : new Date();
      }
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: updateData,
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

    return NextResponse.json(post);
  } catch (error) {
    console.error('Ошибка обновления поста:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении поста' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Пост не найден' }, { status: 404 });
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    // Only ADMIN or post author can delete
    if (userRole !== Role.ADMIN && existingPost.authorId !== userId) {
      return NextResponse.json(
        { error: 'Недостаточно прав для удаления' },
        { status: 403 }
      );
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return NextResponse.json({ message: 'Пост успешно удален' });
  } catch (error) {
    console.error('Ошибка удаления поста:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении поста' },
      { status: 500 }
    );
  }
}
