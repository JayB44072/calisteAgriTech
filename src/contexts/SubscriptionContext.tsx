import { createContext, useContext, type ReactNode } from 'react';
import { useSubscription, type PlanId, type Plan, PLANS } from '../hooks/useSubscription';

interface SubscriptionContextType {
  plan: Plan;
  planId: PlanId;
  canDoAI: () => boolean;
  consumeAI: () => void;
  canAddParcelle: (count: number) => boolean;
  aiRemaining: number;
  subscribe: (planId: PlanId) => void;
  cancelSubscription: () => void;
  isPremium: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ userId, children }: { userId?: string; children: ReactNode }) {
  const sub = useSubscription(userId);

  return (
    <SubscriptionContext.Provider value={{
      plan: sub.plan,
      planId: sub.state.planId,
      canDoAI: sub.canDoAI,
      consumeAI: sub.consumeAI,
      canAddParcelle: sub.canAddParcelle,
      aiRemaining: sub.aiRemaining,
      subscribe: sub.subscribe,
      cancelSubscription: sub.cancelSubscription,
      isPremium: sub.state.planId !== 'gratuit',
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) return {
    plan: PLANS.gratuit, planId: 'gratuit' as PlanId,
    canDoAI: () => true, consumeAI: () => {}, canAddParcelle: () => true,
    aiRemaining: 5, subscribe: () => {}, cancelSubscription: () => {}, isPremium: false,
  };
  return ctx;
}
