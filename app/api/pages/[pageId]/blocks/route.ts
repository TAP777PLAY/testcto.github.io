import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { type, content, order } = await request.json();

    if (!type || content === undefined) {
      return NextResponse.json(
        { error: 'Тип и содержимое блока обязательны' },
        { status: 400 }
      );
    }

    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        site: {
          userId: (session.user as any).id,
        },
      },
      include: {
        blocks: true,
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Страница не найдена' }, { status: 404 });
    }

    const blockOrder = order !== undefined ? order : page.blocks.length;

    const block = await prisma.block.create({
      data: {
        type,
        content,
        order: blockOrder,
        pageId,
      },
    });

    return NextResponse.json(block, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания блока:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании блока' },
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

    const { blocks } = await request.json();

    if (!Array.isArray(blocks)) {
      return NextResponse.json(
        { error: 'Некорректный формат данных' },
        { status: 400 }
      );
    }

    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        site: {
          userId: (session.user as any).id,
        },
      },
      include: {
        blocks: true,
      },
    });

    if (!page) {
      return NextResponse.json({ error: 'Страница не найдена' }, { status: 404 });
    }

    // Verify all blocks belong to this page
    const pageBlockIds = new Set(page.blocks.map((b) => b.id));
    const invalidBlocks = blocks.filter((block: any) => !pageBlockIds.has(block.id));
    
    if (invalidBlocks.length > 0) {
      return NextResponse.json(
        { error: 'Некоторые блоки не принадлежат этой странице' },
        { status: 400 }
      );
    }

    const updatePromises = blocks.map((block: any, index: number) =>
      prisma.block.update({
        where: { 
          id: block.id,
        },
        data: {
          type: block.type,
          content: block.content,
          order: index,
        },
      })
    );

    await Promise.all(updatePromises);

    const updatedBlocks = await prisma.block.findMany({
      where: { pageId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(updatedBlocks);
  } catch (error) {
    console.error('Ошибка обновления блоков:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении блоков' },
      { status: 500 }
    );
  }
}
