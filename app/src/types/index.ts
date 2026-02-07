export interface Agent {
  id: string;
  name: string;
  role: string;
  color: string;
  glowColor: string;
  position: [number, number, number];
  status: 'idle' | 'active' | 'processing' | 'complete';
  description: string;
  icon: string;
}

export interface Iteration {
  id: number;
  name: string;
  status: 'completed' | 'active' | 'planned';
  description: string;
  agentContributions: Record<string, string>;
  timestamp?: string;
}

export interface WorkMode {
  id: string;
  name: string;
  iterations: [number, number];
  layout: {
    creator: number;
    coordinator: number;
    redTeam: number;
    coCreator: number;
    ideaCore: 'large' | 'compact' | 'crystallized' | 'perfected';
  };
  description: string;
}

export interface DoDCard {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  details?: string;
}

export interface CommunicationLogEntry {
  id: string;
  from: string;
  to: string;
  message: string;
  type: 'speech' | 'task' | 'feedback' | 'complete';
  timestamp: string;
}

export type WorkModeType = 'open' | 'closed' | 'review';
export type BannerPanel = 'metrics' | 'chat' | 'summary';
export type RoutingMode = 'all' | 'selected' | 'cycle' | 'sequence' | 'parallel' | 'direct' | 'human' | 'bookmark';

// Access control types
export type UserRole = 'moderator' | 'co-creator' | 'co-creator-middle' | 'co-creator-senior' | 'observer';
export type ChatChannel = 'public' | 'human-only' | 'ai-observe' | 'direct';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  role: UserRole;
  isOnline: boolean;
  isTyping?: boolean;
  lastSeen?: string;
}

export interface ChatMessage {
  id: string;
  channel: ChatChannel;
  from: string;
  fromId: string;
  message: string;
  timestamp: string;
  isThought?: boolean;
}

export interface AppState {
  currentMode: string;
  currentIteration: number;
  sessionDuration: number;
  isPlaying: boolean;
  selectedAgent: string | null;
  showDetails: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  
  // Banner state
  bannerOpen: boolean;
  bannerAgentId: string | null;
  bannerPanel: BannerPanel;
  
  // Routing state
  routingMode: RoutingMode;
  routingTargets: string[];
  
  // Carousel animation
  isCarouselAnimating: boolean;
  
  // Session state
  workMode: WorkModeType;
  communicationLogs: CommunicationLogEntry[];
  doDCards: DoDCard[];
  humanInput: string;
  sessionTitle: string;
  sessionObjective: string;
  successCriteria: string;
  knowledgeBase: string;
  sessionStartTime: string;
  
  // Fullscreen
  isFullscreen: boolean;
}

export interface DeviceCapabilities {
  isTouch: boolean;
  isFoldable: boolean;
  screenSize: 'small' | 'medium' | 'large';
  pixelRatio: number;
  maxParticles: number;
}
