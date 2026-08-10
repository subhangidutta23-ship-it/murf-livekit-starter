'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, type MotionProps, motion } from 'motion/react';
import { useAgent, useSessionContext, useSessionMessages } from '@livekit/components-react';
import { AgentChatTranscript } from '@/components/agents-ui/agent-chat-transcript';
import {
  AgentControlBar,
  type AgentControlBarControls,
} from '@/components/agents-ui/agent-control-bar';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { cn } from '@/lib/shadcn/utils';
import { TileLayout } from './tile-view';
import { AgentStateIndicator, type AgentState } from '@/components/app/agent-state-indicator';
import { SpeakerVisualizer } from '@/components/app/speaker-visualizer';
import { Radio, MessageSquareText } from 'lucide-react';

const MotionMessage = motion.create(Shimmer);

const BOTTOM_VIEW_MOTION_PROPS: MotionProps = {
  variants: {
    visible: {
      opacity: 1,
      translateY: '0%',
    },
    hidden: {
      opacity: 0,
      translateY: '100%',
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: {
    duration: 0.3,
    delay: 0.5,
    ease: 'easeOut',
  },
};

const CHAT_MOTION_PROPS: MotionProps = {
  variants: {
    hidden: {
      opacity: 0,
      transition: {
        ease: 'easeOut',
        duration: 0.3,
      },
    },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        ease: 'easeOut',
        duration: 0.3,
      },
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
};

const SHIMMER_MOTION_PROPS: MotionProps = {
  variants: {
    visible: {
      opacity: 1,
      transition: {
        ease: 'easeIn',
        duration: 0.5,
        delay: 0.8,
      },
    },
    hidden: {
      opacity: 0,
      transition: {
        ease: 'easeIn',
        duration: 0.5,
        delay: 0,
      },
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
};

interface FadeProps {
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export function Fade({ top = false, bottom = false, className }: FadeProps) {
  return (
    <div
      className={cn(
        'from-background pointer-events-none h-4 bg-linear-to-b to-transparent',
        top && 'bg-linear-to-b',
        bottom && 'bg-linear-to-t',
        className
      )}
    />
  );
}

export interface AgentSessionView_01Props {
  /**
   * Message shown above the controls before the first chat message is sent.
   *
   * @default 'Agent is listening, ask it a question'
   */
  preConnectMessage?: string;
  /**
   * Enables or disables the chat toggle and transcript input controls.
   *
   * @default true
   */
  supportsChatInput?: boolean;
  /**
   * Enables or disables camera controls in the bottom control bar.
   *
   * @default true
   */
  supportsVideoInput?: boolean;
  /**
   * Enables or disables screen sharing controls in the bottom control bar.
   *
   * @default true
   */
  supportsScreenShare?: boolean;
  /**
   * Shows a pre-connect buffer state with a shimmer message before messages appear.
   *
   * @default true
   */
  isPreConnectBufferEnabled?: boolean;

  /** Selects the visualizer style rendered in the main tile area. */
  audioVisualizerType?: 'bar' | 'wave' | 'grid' | 'radial' | 'aura';
  /** Primary hex color used by supported audio visualizer variants. */
  audioVisualizerColor?: `#${string}`;
  /** Hue shift intensity used by certain visualizers. */
  audioVisualizerColorShift?: number;
  /** Number of bars to render when `audioVisualizerType` is `bar`. */
  audioVisualizerBarCount?: number;
  /** Number of rows in the visualizer when `audioVisualizerType` is `grid`. */
  audioVisualizerGridRowCount?: number;
  /** Number of columns in the visualizer when `audioVisualizerType` is `grid`. */
  audioVisualizerGridColumnCount?: number;
  /** Number of radial bars when `audioVisualizerType` is `radial`. */
  audioVisualizerRadialBarCount?: number;
  /** Base radius of the radial visualizer when `audioVisualizerType` is `radial`. */
  audioVisualizerRadialRadius?: number;
  /** Stroke width of the wave path when `audioVisualizerType` is `wave`. */
  audioVisualizerWaveLineWidth?: number;
  /** Optional class name merged onto the outer `<section>` container. */
  className?: string;
}

export function AgentSessionView_01({
  preConnectMessage = 'Agent is listening, ask it a question',
  supportsChatInput = true,
  supportsVideoInput = true,
  supportsScreenShare = true,
  isPreConnectBufferEnabled = true,

  audioVisualizerType,
  audioVisualizerColor,
  audioVisualizerColorShift,
  audioVisualizerBarCount,
  audioVisualizerGridRowCount,
  audioVisualizerGridColumnCount,
  audioVisualizerRadialBarCount,
  audioVisualizerRadialRadius,
  audioVisualizerWaveLineWidth,
  ref,
  className,
  ...props
}: React.ComponentProps<'section'> & AgentSessionView_01Props) {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const [chatOpen, setChatOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { state: agentState } = useAgent();

  const currentAgentState: AgentState =
    agentState === 'speaking'
      ? 'speaking'
      : agentState === 'listening' || agentState === 'thinking'
      ? 'listening'
      : agentState === 'connecting' || agentState === 'initializing'
      ? 'connecting'
      : 'listening';

  const controls: AgentControlBarControls = {
    leave: true,
    microphone: true,
    chat: supportsChatInput,
    camera: supportsVideoInput,
    screenShare: supportsScreenShare,
  };

  useEffect(() => {
    // Automatically open split-screen chat when conversation begins
    if (messages.length > 0 && !chatOpen) {
      setChatOpen(true);
    }

    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, chatOpen]);

  return (
    <section
      ref={ref}
      className={cn('bg-background relative z-10 h-full w-full overflow-hidden', className)}
      {...props}
    >
      <Fade top className="absolute inset-x-4 top-0 z-10 h-24 pointer-events-none" />

      {/* Top Disaster Response Status Pill */}
      <div className="absolute top-2.5 inset-x-0 z-30 flex items-center justify-center pointer-events-none px-4">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/80 bg-white/90 dark:bg-slate-900/90 px-3.5 py-1 text-[11px] font-mono font-bold tracking-wider text-sky-900 dark:text-sky-200 uppercase shadow-sm backdrop-blur-md">
          <span>DISASTER RESPONSE • VOICE COMMAND ACTIVE</span>
        </div>
      </div>

      {/* Split Screen Container: Left Side Agent Console, Right Side Live Transcript */}
      <div className="absolute inset-x-3 md:inset-x-8 top-12 bottom-24 md:top-14 md:bottom-28 z-40 max-w-7xl mx-auto h-[calc(100%-100px)] flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
        
        {/* LEFT COLUMN: Agent Robot Console & Audio Visualizer */}
        <div
          className={cn(
            'relative flex flex-col items-center justify-center transition-all duration-300 h-full',
            chatOpen ? 'w-full md:w-1/2' : 'w-full'
          )}
        >
          <div
            className={cn(
              'relative w-full h-full flex flex-col items-center justify-start rounded-3xl p-5 md:p-8 transition-all duration-300 overflow-hidden',
              chatOpen && 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-sky-200/60 dark:border-sky-800/60 shadow-xl'
            )}
          >
            {/* Agent State Indicator neatly contained at top with clear margin */}
            <div className="mb-6 md:mb-8 flex flex-col items-center justify-center shrink-0 z-10">
              <AgentStateIndicator state={currentAgentState} />
            </div>

            {/* Sentinel Robot Avatar dragged down with generous clearance */}
            <div className="mt-4 md:mt-6 w-full flex-1 flex items-center justify-center">
              <TileLayout
                chatOpen={chatOpen}
                audioVisualizerType={audioVisualizerType}
                audioVisualizerColor={audioVisualizerColor}
                audioVisualizerColorShift={audioVisualizerColorShift}
                audioVisualizerBarCount={audioVisualizerBarCount}
                audioVisualizerRadialBarCount={audioVisualizerRadialBarCount}
                audioVisualizerRadialRadius={audioVisualizerRadialRadius}
                audioVisualizerGridRowCount={audioVisualizerGridRowCount}
                audioVisualizerGridColumnCount={audioVisualizerGridColumnCount}
                audioVisualizerWaveLineWidth={audioVisualizerWaveLineWidth}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Conversation Transcript Stream */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              {...CHAT_MOTION_PROPS}
              className="w-full md:w-1/2 h-full flex flex-col justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-amber-300/80 dark:border-amber-700/80 rounded-3xl p-4 md:p-5 shadow-2xl overflow-hidden transition-all duration-300"
            >
              {/* Transcript Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span>LIVE CONVERSATION LOG</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                  {messages.length} Messages
                </span>
              </div>

              {/* Scrollable Conversation Stream with Bottom Clearance */}
              <div ref={scrollAreaRef} className="flex-1 overflow-y-auto py-3 pr-1 pb-10">
                <AgentChatTranscript
                  agentState={agentState}
                  messages={messages}
                  className="w-full pb-8 [&_.is-user>div]:bg-amber-500 [&_.is-user>div]:text-white [&_.is-user>div]:rounded-2xl [&_.is-user>div]:p-3 [&_.is-assistant>div]:bg-slate-100 [&_.is-assistant>div]:dark:bg-slate-800 [&_.is-assistant>div]:rounded-2xl [&_.is-assistant>div]:p-3 [&>div>div]:px-2 [&>div>div]:pt-2"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Control Bar */}
      <motion.div
        {...BOTTOM_VIEW_MOTION_PROPS}
        className="absolute inset-x-3 bottom-0 z-50 md:inset-x-12"
      >
        {/* Pre-connect message */}
        {isPreConnectBufferEnabled && (
          <AnimatePresence>
            {messages.length === 0 && (
              <MotionMessage
                key="pre-connect-message"
                duration={2}
                aria-hidden={messages.length > 0}
                {...SHIMMER_MOTION_PROPS}
                className="pointer-events-none mx-auto block w-full max-w-2xl pb-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                {preConnectMessage}
              </MotionMessage>
            )}
          </AnimatePresence>
        )}
        <div className="bg-background relative mx-auto max-w-2xl pb-3 md:pb-8">
          <Fade bottom className="absolute inset-x-0 top-0 h-4 -translate-y-full pointer-events-none" />
          <AgentControlBar
            variant="livekit"
            controls={controls}
            isChatOpen={chatOpen}
            isConnected={session.isConnected}
            onDisconnect={session.end}
            onIsChatOpenChange={setChatOpen}
          />
        </div>
      </motion.div>
    </section>
  );
}
