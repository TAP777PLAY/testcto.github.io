import { prisma } from './prisma';

export async function getUserSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });

  return subscription;
}

export async function checkFeatureAccess(
  userId: string,
  feature: 'customDomain' | 'marketplace' | 'ai'
): Promise<boolean> {
  const subscription = await getUserSubscription(userId);

  if (!subscription || subscription.status !== 'active') {
    return false;
  }

  switch (feature) {
    case 'customDomain':
      return subscription.plan.customDomain;
    case 'marketplace':
      return subscription.plan.marketplaceAccess;
    case 'ai':
      return subscription.plan.aiCredits > 0;
    default:
      return false;
  }
}

export async function checkSitesLimit(userId: string): Promise<{
  canCreate: boolean;
  current: number;
  max: number;
}> {
  const subscription = await getUserSubscription(userId);
  const currentSites = await prisma.site.count({
    where: { userId },
  });

  const maxSites = subscription?.plan.maxSites || 1;

  return {
    canCreate: currentSites < maxSites,
    current: currentSites,
    max: maxSites,
  };
}

export async function checkPagesLimit(userId: string, siteId: string): Promise<{
  canCreate: boolean;
  current: number;
  max: number;
}> {
  const subscription = await getUserSubscription(userId);
  const currentPages = await prisma.page.count({
    where: { siteId },
  });

  const maxPages = subscription?.plan.maxPages || 10;

  return {
    canCreate: currentPages < maxPages,
    current: currentPages,
    max: maxPages,
  };
}

export async function checkAICredits(userId: string): Promise<{
  hasCredits: boolean;
  available: number;
  used: number;
}> {
  const subscription = await getUserSubscription(userId);

  if (!subscription || subscription.status !== 'active') {
    return { hasCredits: false, available: 0, used: 0 };
  }

  const available = subscription.plan.aiCredits - subscription.aiCreditsUsed;

  return {
    hasCredits: available > 0,
    available,
    used: subscription.aiCreditsUsed,
  };
}

export async function useAICredit(userId: string, credits: number = 1): Promise<boolean> {
  const check = await checkAICredits(userId);

  if (!check.hasCredits || check.available < credits) {
    return false;
  }

  await prisma.subscription.update({
    where: { userId },
    data: {
      aiCreditsUsed: {
        increment: credits,
      },
    },
  });

  return true;
}

export async function resetAICredits(userId: string): Promise<void> {
  await prisma.subscription.update({
    where: { userId },
    data: {
      aiCreditsUsed: 0,
    },
  });
}
