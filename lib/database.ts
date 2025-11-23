import { prisma } from './prisma';

// Notifications
export async function getNotifications(teamId: string, limit = 10) {
  return await prisma.notification.findMany({
    where: { teamId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  });
}

// Report Schedules
export async function getReportSchedules(teamId: string) {
  return await prisma.reportSchedule.findMany({
    where: {
      template: { teamId }
    },
    include: {
      template: true,
      owner: {
        select: { name: true, email: true }
      }
    }
  });
}

// Tutorials
export async function getTutorials(teamId: string) {
  return await prisma.tutorial.findMany({
    where: { teamId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getTutorialProgress(userId: string, teamId: string) {
  const tutorials = await prisma.tutorial.findMany({
    where: { teamId },
    include: {
      progress: {
        where: { userId }
      }
    }
  });

  return tutorials.map((tutorial: any) => ({
    id: tutorial.id,
    title: tutorial.title,
    duration: `${Math.floor(tutorial.duration / 60)}:${String(tutorial.duration % 60).padStart(2, '0')}`,
    status: tutorial.progress[0]?.status || 'Pendente'
  }));
}

// Onboarding
export async function getOnboardingProgress(userId: string, teamId: string) {
  const steps = await prisma.onboardingStep.findMany({
    where: { teamId },
    orderBy: { order: 'asc' },
    include: {
      progress: {
        where: { userId }
      }
    }
  });

  return steps.map((step: any) => ({
    id: step.id,
    label: step.label,
    done: step.progress[0]?.completed || false
  }));
}

// Team Members
export async function getTeamMembers(teamId: string) {
  return await prisma.teamMember.findMany({
    where: { teamId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          updatedAt: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

// Audit Logs
export async function getAuditLogs(teamId: string, limit = 20) {
  return await prisma.auditLog.findMany({
    where: { teamId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: {
        select: { name: true }
      }
    }
  });
}

// AB Tests
export async function getAbTests(teamId: string) {
  return await prisma.abTest.findMany({
    where: { teamId },
    include: {
      variants: true,
      owner: {
        select: { name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

// Predictive Performance
export async function getPredictivePerformance(teamId: string) {
  const sessions = await prisma.predictiveSession.findMany({
    where: { teamId },
    include: {
      interventions: true
    }
  });

  const sessionsScoreHigh = sessions.filter((s: any) => s.abandonmentScore >= 70).length;
  const chatInterventions = sessions.reduce((acc: number, s: any) => acc + s.interventions.length, 0);
  const savedConversions = sessions.reduce((acc: number, s: any) =>
    acc + s.interventions.filter((i: any) => i.converted).length, 0
  );

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { intensity: true }
  });

  return {
    sessionsScoreHigh,
    chatInterventions,
    savedConversions,
    intensity: team?.intensity || 'BALANCEADO'
  };
}

// Webhooks
export async function getWebhooks(teamId: string) {
  return await prisma.webhookEndpoint.findMany({
    where: { teamId },
    include: {
      deliveries: {
        orderBy: { deliveredAt: 'desc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

// Chat Inbox
export async function getChatThreads(teamId: string, limit = 20) {
  return await prisma.chatThread.findMany({
    where: { teamId },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    include: {
      tags: {
        include: {
          tag: true
        }
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });
}

// User Profile
export async function getUserProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true
    }
  });
}
