import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ blockId: string }> }
) {
  try {
    const { blockId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const block = await prisma.block.findFirst({
      where: {
        id: blockId,
        page: {
          site: {
            userId: (session.user as any).id,
          },
        },
      },
    });

    if (!block) {
      return NextResponse.json({ error: 'Блок не найден' }, { status: 404 });
    }

    await prisma.block.delete({
      where: { id: blockId },
    });

    return NextResponse.json({ message: 'Блок успешно удален' });
  } catch (error) {
    console.error('Ошибка удаления блока:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении блока' },
      { status: 500 }
    );
  }
}
