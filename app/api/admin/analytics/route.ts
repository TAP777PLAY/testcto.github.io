import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';
    
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const [
      totalUsers,
      totalSites,
      totalPages,
      publishedSites,
      publishedPages,
      pageViews,
      recentUsers,
      recentActivities,
      pageViewsByPage,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.site.count(),
      prisma.page.count(),
      prisma.site.count({ where: { published: true } }),
      prisma.page.count({ where: { published: true } }),
      prisma.pageView.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.activityLog.findMany({
        where: { createdAt: { gte: startDate } },
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.pageView.groupBy({
        by: ['pageId'],
        where: { createdAt: { gte: startDate } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    const topPages = await Promise.all(
      pageViewsByPage.map(async (pv) => {
        const page = await prisma.page.findUnique({
          where: { id: pv.pageId },
          select: {
            id: true,
            title: true,
            slug: true,
            site: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        });
        return {
          page,
          views: pv._count.id,
        };
      })
    );

    const activityByDay = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT 
        DATE(created_at) as date, 
        COUNT(*) as count
      FROM "ActivityLog"
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const pageViewsByDay = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT 
        DATE(created_at) as date, 
        COUNT(*) as count
      FROM "PageView"
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return NextResponse.json({
      overview: {
        totalUsers,
        totalSites,
        totalPages,
        publishedSites,
        publishedPages,
        pageViews,
        recentUsers,
      },
      charts: {
        activityByDay: activityByDay.map((row) => ({
          date: row.date,
          count: Number(row.count),
        })),
        pageViewsByDay: pageViewsByDay.map((row) => ({
          date: row.date,
          count: Number(row.count),
        })),
      },
      topPages,
      recentActivities,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
