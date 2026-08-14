import React, { useMemo } from 'react';
import { Track } from 'livekit-client';
import { AnimatePresence, type MotionProps, motion } from 'motion/react';
import {
  type TrackReference,
  VideoTrack,
  useLocalParticipant,
  useTracks,
  useVoiceAssistant,
  useIsSpeaking,
  useAgent,
} from '@livekit/components-react';
import { cn } from '@/lib/shadcn/utils';
import { AudioVisualizer } from './audio-visualizer';
import { DisasterAvatar } from '@/components/app/disaster-avatar';
import { type AgentState } from '@/components/app/agent-state-indicator';

const ANIMATION_TRANSITION: MotionProps['transition'] = {
  type: 'spring',
  stiffness: 675,
  damping: 75,
  mass: 1,
};

const tileViewClassNames = {
  // GRID
  // 2 Columns x 3 Rows
  grid: [
    'h-full w-full',
    'grid gap-x-2 place-content-center',
    'grid-cols-[1fr_1fr] grid-rows-[90px_1fr_90px]',
  ],
  agentChatOpenWithSecondTile: ['col-start-1 row-start-1', 'self-center justify-self-end'],
  agentChatOpenWithoutSecondTile: ['col-start-1 row-start-1', 'col-span-2', 'place-content-center'],
  agentChatClosed: ['col-start-1 row-start-1', 'col-span-2 row-span-3', 'place-content-center'],
  secondTileChatOpen: ['col-start-2 row-start-1', 'self-center justify-self-start'],
  secondTileChatClosed: ['col-start-2 row-start-3', 'place-content-end'],
};

export function useLocalTrackRef(source: Track.Source) {
  const { localParticipant } = useLocalParticipant();
  const publication = localParticipant.getTrackPublication(source);
  const trackRef = useMemo<TrackReference | undefined>(
    () => (publication ? { source, participant: localParticipant, publication } : undefined),
    [source, publication, localParticipant]
  );
  return trackRef;
}

interface TileLayoutProps {
  chatOpen: boolean;
  audioVisualizerType?: 'bar' | 'wave' | 'grid' | 'radial' | 'aura';
  audioVisualizerColor?: `#${string}`;
  audioVisualizerColorShift?: number;
  audioVisualizerWaveLineWidth?: number;
  audioVisualizerGridRowCount?: number;
  audioVisualizerGridColumnCount?: number;
  audioVisualizerRadialBarCount?: number;
  audioVisualizerRadialRadius?: number;
  audioVisualizerBarCount?: number;
}

export function TileLayout({
  chatOpen,
  audioVisualizerType,
  audioVisualizerColor,
  audioVisualizerColorShift,
  audioVisualizerBarCount,
  audioVisualizerRadialBarCount,
  audioVisualizerRadialRadius,
  audioVisualizerGridRowCount,
  audioVisualizerGridColumnCount,
  audioVisualizerWaveLineWidth,
}: TileLayoutProps) {
  const { videoTrack: agentVideoTrack, agentTranscriptions } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const isUserSpeaking = useIsSpeaking(localParticipant);
  const { state: agentState } = useAgent();
  const [screenShareTrack] = useTracks([Track.Source.ScreenShare]);
  const cameraTrack: TrackReference | undefined = useLocalTrackRef(Track.Source.Camera);

  const isCameraEnabled = cameraTrack && !cameraTrack.publication.isMuted;
  const isScreenShareEnabled = screenShareTrack && !screenShareTrack.publication.isMuted;
  const hasSecondTile = isCameraEnabled || isScreenShareEnabled;

  const animationDelay = chatOpen ? 0 : 0.15;
  const isAvatar = agentVideoTrack !== undefined;
  const videoWidth = agentVideoTrack?.publication.dimensions?.width ?? 0;
  const videoHeight = agentVideoTrack?.publication.dimensions?.height ?? 0;

  const currentAgentState: AgentState =
    agentState === 'speaking'
      ? 'speaking'
      : agentState === 'listening' || agentState === 'thinking'
      ? 'listening'
      : agentState === 'connecting' || agentState === 'initializing'
      ? 'connecting'
      : 'ready';

  const latestAgentText = agentTranscriptions && agentTranscriptions.length > 0
    ? agentTranscriptions[agentTranscriptions.length - 1]?.text || ''
    : '';

  const isShelterSpecialistActive =
    latestAgentText.toLowerCase().includes('shelter information specialist') ||
    latestAgentText.toLowerCase().includes('shelter specialist') ||
    latestAgentText.toLowerCase().includes('connect you to our shelter') ||
    latestAgentText.toLowerCase().includes('shelter policy');

  const activeAgentRole = isShelterSpecialistActive ? 'shelter_specialist' : 'main';

  return (
    <div className="relative w-full h-full min-h-[260px] flex items-center justify-center">
      <div className="relative mx-auto h-full w-full max-w-2xl px-2">
        <div className={cn(tileViewClassNames.grid)}>
          {/* Agent */}
          <div
            className={cn([
              'grid',
              !chatOpen && tileViewClassNames.agentChatClosed,
              chatOpen && hasSecondTile && tileViewClassNames.agentChatOpenWithSecondTile,
              chatOpen && !hasSecondTile && tileViewClassNames.agentChatOpenWithoutSecondTile,
            ])}
          >
            <AnimatePresence mode="wait">
              {!isAvatar && (
                <motion.div
                  key={isUserSpeaking ? 'user-waveform' : 'robot-avatar'}
                  layoutId="agent"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    ...ANIMATION_TRANSITION,
                    delay: animationDelay,
                  }}
                  className="flex items-center justify-center"
                >
                  {isUserSpeaking ? (
                    // Waveform visualizer when user is speaking
                    <AudioVisualizer
                      key="audio-waveform-visualizer"
                      initial={{ scale: 1 }}
                      animate={{ scale: chatOpen ? 0.4 : 1 }}
                      transition={{
                        ...ANIMATION_TRANSITION,
                        delay: animationDelay,
                      }}
                      audioVisualizerType="wave"
                      audioVisualizerColor={audioVisualizerColor || '#2563eb'}
                      audioVisualizerColorShift={audioVisualizerColorShift}
                      audioVisualizerWaveLineWidth={audioVisualizerWaveLineWidth || 4}
                      isChatOpen={chatOpen}
                      className={cn(
                        'size-[280px] md:size-[380px]',
                        'rounded-[50px] transition-all'
                      )}
                      style={{ color: audioVisualizerColor || '#2563eb' }}
                    />
                  ) : (
                    // Agent Avatar with Main Command (Robot) vs Shelter Specialist (Emergency Tent) support
                    <div className={cn('transition-all duration-300', chatOpen && 'scale-75')}>
                      <DisasterAvatar state={currentAgentState} size="lg" agentRole={activeAgentRole} allowToggle={true} />
                    </div>
                  )}
                </motion.div>
              )}

              {isAvatar && (
                // Avatar Agent
                <motion.div
                  key="avatar"
                  layoutId="avatar"
                  initial={{
                    scale: 1,
                    opacity: 1,
                    maskImage:
                      'radial-gradient(circle, rgba(0, 0, 0, 1) 0, rgba(0, 0, 0, 1) 20px, transparent 20px)',
                    filter: 'blur(20px)',
                  }}
                  animate={{
                    maskImage:
                      'radial-gradient(circle, rgba(0, 0, 0, 1) 0, rgba(0, 0, 0, 1) 500px, transparent 500px)',
                    filter: 'blur(0px)',
                    borderRadius: chatOpen ? 6 : 12,
                  }}
                  transition={{
                    ...ANIMATION_TRANSITION,
                    delay: animationDelay,
                    maskImage: {
                      duration: 1,
                    },
                    filter: {
                      duration: 1,
                    },
                  }}
                  className={cn(
                    'overflow-hidden bg-black drop-shadow-xl/80',
                    chatOpen ? 'h-[90px]' : 'h-auto w-full'
                  )}
                >
                  <VideoTrack
                    width={videoWidth}
                    height={videoHeight}
                    trackRef={agentVideoTrack}
                    className={cn(chatOpen && 'size-[90px] object-cover')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div
            className={cn([
              'grid',
              chatOpen && tileViewClassNames.secondTileChatOpen,
              !chatOpen && tileViewClassNames.secondTileChatClosed,
            ])}
          >
            {/* Camera & Screen Share */}
            <AnimatePresence>
              {((cameraTrack && isCameraEnabled) || (screenShareTrack && isScreenShareEnabled)) && (
                <motion.div
                  key="camera"
                  layout="position"
                  layoutId="camera"
                  initial={{
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{
                    ...ANIMATION_TRANSITION,
                    delay: animationDelay,
                  }}
                  className="aspect-square size-[90px] drop-shadow-lg/20"
                >
                  <VideoTrack
                    trackRef={cameraTrack || screenShareTrack}
                    width={(cameraTrack || screenShareTrack)?.publication.dimensions?.width ?? 0}
                    height={(cameraTrack || screenShareTrack)?.publication.dimensions?.height ?? 0}
                    className="bg-muted aspect-square size-[90px] rounded-md object-cover"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
