import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  AppState, 
  WorkMode, 
  Iteration, 
  Agent, 
  DoDCard, 
  CommunicationLogEntry,
  WorkModeType,
  BannerPanel,
  RoutingMode
} from '@/types';

interface AppStore extends AppState {
  // Banner actions
  openBanner: (agentId: string) => void;
  closeBanner: () => void;
  setBannerPanel: (panel: BannerPanel) => void;
  
  // Routing actions
  setRoutingMode: (mode: RoutingMode) => void;
  setRoutingTargets: (targets: string[]) => void;
  
  // Carousel actions
  setCarouselAnimating: (animating: boolean) => void;
  
  // Core actions
  setMode: (mode: string) => void;
  setIteration: (iteration: number) => void;
  incrementSessionTime: () => void;
  togglePlay: () => void;
  selectAgent: (agentId: string | null) => void;
  toggleDetails: () => void;
  toggleReducedMotion: () => void;
  toggleHighContrast: () => void;
  resetSession: () => void;
  setWorkMode: (mode: WorkModeType) => void;
  addCommunicationLog: (from: string, to: string, message: string, type: 'speech' | 'task' | 'feedback' | 'complete') => void;
  updateDoDStatus: (cardId: string, status: 'pending' | 'in-progress' | 'completed') => void;
  setHumanInput: (input: string) => void;
  sendHumanInput: () => void;
  
  // Fullscreen
  toggleFullscreen: () => void;
  
  // Derived
  getCurrentMode: () => WorkMode | undefined;
  getProgress: () => number;
  getDoDProgress: () => number;
}

export const workModes: WorkMode[] = [
  {
    id: 'exploration',
    name: 'Exploration',
    iterations: [1, 4],
    layout: { creator: 40, coordinator: 20, redTeam: 15, coCreator: 10, ideaCore: 'large' },
    description: 'Generate possibilities, explore approaches',
  },
  {
    id: 'refinement',
    name: 'Refinement',
    iterations: [5, 8],
    layout: { creator: 25, coordinator: 25, redTeam: 35, coCreator: 20, ideaCore: 'compact' },
    description: 'Critical analysis, identify weaknesses',
  },
  {
    id: 'synthesis',
    name: 'Synthesis',
    iterations: [9, 12],
    layout: { creator: 15, coordinator: 25, redTeam: 15, coCreator: 45, ideaCore: 'crystallized' },
    description: 'Combine insights, merge approaches',
  },
  {
    id: 'validation',
    name: 'Validation',
    iterations: [13, 15],
    layout: { creator: 10, coordinator: 50, redTeam: 15, coCreator: 20, ideaCore: 'perfected' },
    description: 'Final verification, polish delivery',
  },
];

export const agents: Agent[] = [
  {
    id: 'creator',
    name: 'Claude 3',
    role: 'Creator',
    color: '#4CAF50',
    glowColor: 'rgba(76, 175, 80, 0.4)',
    position: [-4, 0, 0],
    status: 'active',
    description: 'Organic ideation, creative exploration',
    icon: 'Sprout',
  },
  {
    id: 'coordinator',
    name: 'You (AI)',
    role: 'Coordinator',
    color: '#2196F3',
    glowColor: 'rgba(33, 150, 243, 0.4)',
    position: [0, 0, 2],
    status: 'processing',
    description: 'Neutral orchestration, flow management',
    icon: 'Zap',
  },
  {
    id: 'red-team',
    name: 'ChatGPT-4',
    role: 'Red Team',
    color: '#FF5722',
    glowColor: 'rgba(255, 87, 34, 0.4)',
    position: [4, 0, 0],
    status: 'idle',
    description: 'Critical analysis, stress testing',
    icon: 'Flame',
  },
  {
    id: 'co-creator',
    name: 'Gemini Pro',
    role: 'Co-Creator',
    color: '#9C27B0',
    glowColor: 'rgba(156, 39, 176, 0.4)',
    position: [0, 0, -3],
    status: 'idle',
    description: 'Synthesis, pattern recognition',
    icon: 'Waves',
  },
];

export const iterations: Iteration[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: `Iteration ${i + 1}`,
  status: i < 7 ? 'completed' : i === 7 ? 'active' : 'planned',
  description: `Phase ${Math.floor(i / 4) + 1} development cycle`,
  agentContributions: {
    creator: i < 4 ? 'High' : i < 8 ? 'Medium' : 'Low',
    coordinator: 'Constant',
    redTeam: i < 4 ? 'Low' : i < 8 ? 'High' : 'Medium',
    coCreator: i < 8 ? 'Low' : 'High',
  },
  timestamp: i < 7 ? new Date(Date.now() - (7 - i) * 3600000).toISOString() : undefined,
}));

export const defaultDoDCards: DoDCard[] = [
  { id: 'hypothesis', title: 'Hypothesis Card', description: 'Pricing model for enterprise clients is viable', status: 'in-progress', details: 'What: "Pricing model for enterprise clients is viable"\nWhy: "Enterprise segment represents 60% of TAM"\nSuccess Criteria: LTV:CAC > 3, Churn < 20%' },
  { id: 'run-config', title: 'Run Config', description: 'Parameters: TAM=500 companies, ARPU=$50k, Churn=15%', status: 'completed', details: 'Input variables: TAM, ARPU, Churn\nConstraints: Enterprise segment only\nSuccess thresholds: LTV:CAC > 3' },
  { id: 'run-output', title: 'Run Output', description: 'Metrics: LTV=$250k, CAC=$30k, ROI=733%', status: 'completed', details: 'Metrics achieved: LTV=$250k, CAC=$30k\nLogs: 12 validation tests passed\nAnomalies: None detected' },
  { id: 'debrief', title: 'Debrief Note', description: 'Analysis of iteration results', status: 'pending', details: 'What happened and why?\nWhat worked well?\nWhat didn\'t work?\nUnexpected insights:' },
  { id: 'decision', title: 'Decision', description: 'Next steps based on results', status: 'pending', details: 'What are we changing?\nWhat are we keeping?\nWhat\'s the next hypothesis?\nAction items:' },
];

export const defaultCommunicationLogs: CommunicationLogEntry[] = [
  { id: '1', from: 'Human', to: 'Coordinator', message: 'Focus on pricing model', type: 'task', timestamp: '14:35:22' },
  { id: '2', from: 'Coordinator', to: 'Red Team', message: 'Analyze risks', type: 'task', timestamp: '14:35:23' },
  { id: '3', from: 'Red Team', to: 'Creator', message: 'Suggested alternatives', type: 'feedback', timestamp: '14:35:45' },
  { id: '4', from: 'Creator', to: 'Co-Creator', message: 'Refine approach', type: 'task', timestamp: '14:36:12' },
  { id: '5', from: 'Co-Creator', to: 'Coordinator', message: 'Synthesis ready', type: 'complete', timestamp: '14:36:30' },
];

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentMode: 'refinement',
      currentIteration: 7,
      sessionDuration: 0,
      isPlaying: true,
      selectedAgent: null,
      showDetails: false,
      reducedMotion: false,
      highContrast: false,
      
      // Banner state
      bannerOpen: false,
      bannerAgentId: null,
      bannerPanel: 'metrics',
      
      // Routing state
      routingMode: 'all',
      routingTargets: [],
      
      // Carousel animation
      isCarouselAnimating: false,
      
      // Session state
      workMode: 'open' as WorkModeType,
      communicationLogs: defaultCommunicationLogs,
      doDCards: defaultDoDCards,
      humanInput: '',
      sessionTitle: 'Концепт бизнес-модели digital twins startup',
      sessionObjective: 'Develop scalable B2B SaaS model for DT',
      successCriteria: '3 validated hypotheses, 1 MVP concept',
      knowledgeBase: 'ai3-venture/dt-mvp',
      sessionStartTime: '2026-02-03 14:30',

      // Banner actions
      openBanner: (agentId) => set({ bannerOpen: true, bannerAgentId: agentId }),
      closeBanner: () => set({ bannerOpen: false, bannerAgentId: null }),
      setBannerPanel: (panel) => set({ bannerPanel: panel }),
      
      // Routing actions
      setRoutingMode: (mode) => set({ routingMode: mode }),
      setRoutingTargets: (targets) => set({ routingTargets: targets }),
      
      // Carousel actions
      setCarouselAnimating: (animating) => set({ isCarouselAnimating: animating }),

      // Core actions
      setMode: (mode) => set({ currentMode: mode }),
      
      setIteration: (iteration) => {
        const mode = workModes.find(m => iteration >= m.iterations[0] && iteration <= m.iterations[1]);
        set({ currentIteration: iteration, currentMode: mode?.id || get().currentMode });
      },
      
      incrementSessionTime: () => set((state) => ({ sessionDuration: state.sessionDuration + 1 })),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      selectAgent: (agentId) => set({ selectedAgent: agentId }),
      toggleDetails: () => set((state) => ({ showDetails: !state.showDetails })),
      toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),
      toggleHighContrast: () => set((state) => ({ highContrast: !state.highContrast })),
      resetSession: () => set({ currentIteration: 1, sessionDuration: 0, selectedAgent: null }),

      setWorkMode: (mode) => set({ workMode: mode }),

      addCommunicationLog: (from, to, message, type) => {
        const newLog: CommunicationLogEntry = {
          id: Date.now().toString(),
          from, to, message, type,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
        set((state) => ({ communicationLogs: [newLog, ...state.communicationLogs.slice(0, 49)] }));
      },

      updateDoDStatus: (cardId, status) => {
        set((state) => ({ doDCards: state.doDCards.map(card => card.id === cardId ? { ...card, status } : card) }));
      },

      setHumanInput: (input) => set({ humanInput: input }),

      sendHumanInput: () => {
        const input = get().humanInput;
        if (input.trim()) {
          get().addCommunicationLog('Human', 'Coordinator', input, 'speech');
          set({ humanInput: '' });
        }
      },
      
      // Fullscreen
      isFullscreen: false,
      toggleFullscreen: () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
          set({ isFullscreen: true });
        } else {
          document.exitFullscreen().catch(() => {});
          set({ isFullscreen: false });
        }
      },

      // Derived
      getCurrentMode: () => workModes.find(m => m.id === get().currentMode),
      getProgress: () => (get().currentIteration / 15) * 100,
      getDoDProgress: () => {
        const cards = get().doDCards;
        const completed = cards.filter(c => c.status === 'completed').length;
        return (completed / cards.length) * 100;
      },
    }),
    {
      name: 'ai3lab-storage',
      partialize: (state) => ({
        reducedMotion: state.reducedMotion,
        highContrast: state.highContrast,
        workMode: state.workMode,
      }),
    }
  )
);
