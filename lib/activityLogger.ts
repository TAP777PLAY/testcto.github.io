import { prisma } from './prisma';

type ActivityAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'publish' 
  | 'unpublish' 
  | 'login' 
  | 'logout';

type ActivityEntity = 
  | 'site' 
  | 'page' 
  | 'block' 
  | 'user' 
  | 'settings' 
  | 'media';

interface LogActivityParams {
  userId: string;
  action: ActivityAction;
  entity: ActivityEntity;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

export async function logActivity({
  userId,
  action,
  entity,
  entityId,
  details,
  ipAddress,
}: LogActivityParams) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details: details || {},
        ipAddress,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function createNotification({
  userId,
  title,
  message,
  type,
  link,
}: {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
}) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}
