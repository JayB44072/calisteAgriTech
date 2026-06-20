import { useState, useEffect, useCallback } from 'react';

export type PlanId = 'gratuit' | 'pro' | 'cooperatif';

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // FCFA/mois, 0 = gratuit
  color: string;
  badge: string;
  badgeColor: string;
  limits: {
    parcelles: number; // -1 = illimité
    aiRequests: number; // par mois, -1 = illimité
    exportPDF: boolean;
    irrigationAvancee: boolean;
    materielIoT: boolean;
    carte: boolean;
    supportPrioritaire: boolean;
    alertesMeteo: boolean;
    multiUtilisateurs: boolean;
  };
}

export const PLANS: Record<PlanId, Plan> = {
  gratuit: {
    id: 'gratuit',
    name: 'Gratuit',
    price: 0,
    color: 'text-gray-600',
    badge: 'Gratuit',
    badgeColor: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    limits: {
      parcelles: 3,
      aiRequests: 5,
      exportPDF: false,
      irrigationAvancee: false,
      materielIoT: false,
      carte: false,
      supportPrioritaire: false,
      alertesMeteo: false,
      multiUtilisateurs: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 9900,
    color: 'text-blue-600',
    badge: 'Pro',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    limits: {
      parcelles: 10,
      aiRequests: 50,
      exportPDF: true,
      irrigationAvancee: true,
      materielIoT: true,
      carte: true,
      supportPrioritaire: false,
      alertesMeteo: true,
      multiUtilisateurs: false,
    },
  },
  cooperatif: {
    id: 'cooperatif',
    name: 'Coopérative',
    price: 24900,
    color: 'text-emerald-600',
    badge: 'Coopérative',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    limits: {
      parcelles: -1,
      aiRequests: -1,
      exportPDF: true,
      irrigationAvancee: true,
      materielIoT: true,
      carte: true,
      supportPrioritaire: true,
      alertesMeteo: true,
      multiUtilisateurs: true,
    },
  },
};

interface SubscriptionState {
  planId: PlanId;
  activeSince: string | null;
  expiresAt: string | null;
  aiUsedThisMonth: number;
  aiResetMonth: string; // "YYYY-MM"
}

const STORAGE_KEY = 'caliste_subscription';

function getDefaultState(): SubscriptionState {
  return {
    planId: 'gratuit',
    activeSince: null,
    expiresAt: null,
    aiUsedThisMonth: 0,
    aiResetMonth: new Date().toISOString().slice(0, 7),
  };
}

function loadState(userId: string): SubscriptionState {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (!raw) return getDefaultState();
    const parsed: SubscriptionState = JSON.parse(raw);
    // Reset AI counter if new month
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (parsed.aiResetMonth !== currentMonth) {
      parsed.aiUsedThisMonth = 0;
      parsed.aiResetMonth = currentMonth;
    }
    // Check expiry
    if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
      return { ...getDefaultState(), aiResetMonth: currentMonth };
    }
    return parsed;
  } catch {
    return getDefaultState();
  }
}

function saveState(userId: string, state: SubscriptionState) {
  localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(state));
}

export function useSubscription(userId?: string) {
  const [state, setState] = useState<SubscriptionState>(getDefaultState);

  useEffect(() => {
    if (!userId) return;
    setState(loadState(userId));
  }, [userId]);

  const plan = PLANS[state.planId];

  const subscribe = useCallback((planId: PlanId) => {
    if (!userId) return;
    const now = new Date();
    const expires = new Date(now);
    expires.setMonth(expires.getMonth() + 1);
    const next: SubscriptionState = {
      planId,
      activeSince: now.toISOString(),
      expiresAt: expires.toISOString(),
      aiUsedThisMonth: state.aiUsedThisMonth,
      aiResetMonth: state.aiResetMonth,
    };
    setState(next);
    saveState(userId, next);
  }, [userId, state]);

  const cancelSubscription = useCallback(() => {
    if (!userId) return;
    const next = getDefaultState();
    setState(next);
    saveState(userId, next);
  }, [userId]);

  const canDoAI = useCallback((): boolean => {
    if (plan.limits.aiRequests === -1) return true;
    return state.aiUsedThisMonth < plan.limits.aiRequests;
  }, [plan, state.aiUsedThisMonth]);

  const consumeAI = useCallback(() => {
    if (!userId) return;
    const next = { ...state, aiUsedThisMonth: state.aiUsedThisMonth + 1 };
    setState(next);
    saveState(userId, next);
  }, [userId, state]);

  const canAddParcelle = useCallback((currentCount: number): boolean => {
    if (plan.limits.parcelles === -1) return true;
    return currentCount < plan.limits.parcelles;
  }, [plan]);

  return {
    plan,
    state,
    subscribe,
    cancelSubscription,
    canDoAI,
    consumeAI,
    canAddParcelle,
    aiRemaining: plan.limits.aiRequests === -1 ? Infinity : plan.limits.aiRequests - state.aiUsedThisMonth,
  };
}
