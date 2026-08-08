'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { AnimatePresence, motion } from 'motion/react';
import { ConnectionState } from 'livekit-client';
import { useSessionContext, useAgent } from '@livekit/components-react';
import type { AppConfig } from '@/app-config';
import { AgentSessionView_01 } from '@/components/agents-ui/blocks/agent-session-view-01';
import { WelcomeView } from '@/components/app/welcome-view';
import { ConnectingView } from '@/components/app/connecting-view';
import { CallEndedView } from '@/components/app/call-ended-view';
import { MicErrorAlert } from '@/components/app/mic-error-alert';

const MotionWelcomeView = motion.create(WelcomeView);
const MotionConnectingView = motion.create(ConnectingView);
const MotionSessionView = motion.create(AgentSessionView_01);
const MotionCallEndedView = motion.create(CallEndedView);

const VIEW_MOTION_PROPS = {
  variants: {
    visible: { opacity: 1, scale: 1 },
    hidden: { opacity: 0, scale: 0.98 },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  transition: { duration: 0.35, ease: 'easeInOut' },
};

interface ViewControllerProps {
  appConfig: AppConfig;
}

export function ViewController({ appConfig }: ViewControllerProps) {
  const session = useSessionContext();
  const { isConnected, start } = session;
  const isConnecting = session.connectionState === ConnectionState.Connecting;
  const { resolvedTheme } = useTheme();
  const { state: agentState } = useAgent();

  const [hasStartedOnce, setHasStartedOnce] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [micError, setMicError] = useState(false);
  const [isAttemptingStart, setIsAttemptingStart] = useState(false);

  // Monitor connection transition to detect when a call ends
  useEffect(() => {
    if (isConnected) {
      setHasStartedOnce(true);
      setHasEnded(false);
      setIsAttemptingStart(false);
      setMicError(false);
    } else if (hasStartedOnce && !isConnected && !isConnecting && !isAttemptingStart) {
      setHasEnded(true);
    }
  }, [isConnected, isConnecting, hasStartedOnce, isAttemptingStart]);

  // Monitor agent failures for mic/connection issues
  useEffect(() => {
    if (agentState === 'failed') {
      setMicError(true);
      setIsAttemptingStart(false);
    }
  }, [agentState]);

  // Handler to start call with mic permission check
  const handleStartCall = useCallback(async () => {
    setMicError(false);
    setHasEnded(false);
    setIsAttemptingStart(true);

    try {
      // Check microphone permissions explicitly
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      await start();
    } catch (err: any) {
      console.error('Microphone or connection permission error:', err);
      setIsAttemptingStart(false);
      setMicError(true);
    }
  }, [start]);

  // Restart call handler from Call Ended screen
  const handleRestartCall = useCallback(() => {
    setHasEnded(false);
    handleStartCall();
  }, [handleStartCall]);

  // Determine current active view state
  const isConnectingState = (isAttemptingStart || isConnecting) && !isConnected && !micError;
  const isSessionActive = isConnected && !hasEnded;
  const isCallEndedState = hasEnded && !isConnected && !isConnectingState;
  const isReadyState = !isSessionActive && !isConnectingState && !isCallEndedState && !micError;

  return (
    <div className="relative w-full h-full min-h-svh flex items-center justify-center bg-slate-950 overflow-hidden">
      
      {/* Microphone Permission Error Modal Overlay (Step 4) */}
      {micError && (
        <MicErrorAlert
          onRetry={handleStartCall}
          onClose={() => setMicError(false)}
        />
      )}

      <AnimatePresence mode="wait">
        {/* State 1: Ready View */}
        {isReadyState && (
          <MotionWelcomeView
            key="ready-view"
            {...VIEW_MOTION_PROPS}
            startButtonText={appConfig.startButtonText || 'START EMERGENCY CALL'}
            onStartCall={handleStartCall}
          />
        )}

        {/* State 2: Connecting View */}
        {isConnectingState && (
          <MotionConnectingView
            key="connecting-view"
            {...VIEW_MOTION_PROPS}
          />
        )}

        {/* State 3 & 4: Listening / Speaking Active Session View */}
        {isSessionActive && (
          <MotionSessionView
            key="session-view"
            {...VIEW_MOTION_PROPS}
            supportsChatInput={appConfig.supportsChatInput}
            supportsVideoInput={appConfig.supportsVideoInput}
            supportsScreenShare={appConfig.supportsScreenShare}
            isPreConnectBufferEnabled={appConfig.isPreConnectBufferEnabled}
            audioVisualizerType={appConfig.audioVisualizerType}
            audioVisualizerColor={
              resolvedTheme === 'dark'
                ? appConfig.audioVisualizerColorDark
                : appConfig.audioVisualizerColor
            }
            audioVisualizerColorShift={appConfig.audioVisualizerColorShift}
            audioVisualizerBarCount={appConfig.audioVisualizerBarCount}
            audioVisualizerGridRowCount={appConfig.audioVisualizerGridRowCount}
            audioVisualizerGridColumnCount={appConfig.audioVisualizerGridColumnCount}
            audioVisualizerRadialBarCount={appConfig.audioVisualizerRadialBarCount}
            audioVisualizerRadialRadius={appConfig.audioVisualizerRadialRadius}
            audioVisualizerWaveLineWidth={appConfig.audioVisualizerWaveLineWidth}
            className="fixed inset-0"
          />
        )}

        {/* State 5: Call Ended View */}
        {isCallEndedState && (
          <MotionCallEndedView
            key="call-ended-view"
            {...VIEW_MOTION_PROPS}
            onRestartCall={handleRestartCall}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
