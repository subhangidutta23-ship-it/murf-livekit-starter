'use client';

import { RoomAudioRenderer, SessionProvider, useSession } from '@livekit/components-react';
import { TokenSource } from 'livekit-client';
import { ViewController } from '@/components/app/view-controller';
import { StartAudioButton } from '@/components/agents-ui/start-audio-button';
import { APP_CONFIG_DEFAULTS } from '@/app-config';

export default function Page() {
  const session = useSession(TokenSource.endpoint('/api/token'));

  const appConfig = APP_CONFIG_DEFAULTS;

  return (
    <SessionProvider session={session}>
      <ViewController appConfig={appConfig} />
      <RoomAudioRenderer />
      <div className="fixed top-4 left-4 z-50 pointer-events-auto">
        <StartAudioButton label="Click to allow audio playback" />
      </div>
    </SessionProvider>
  );
}
