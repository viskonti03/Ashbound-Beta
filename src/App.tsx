import { useState } from "react";
import {useEffects} from "./settings/display";
import SoundControls from "./components/SoundControls";
import OfflineGame from "./OfflineGame";
import OnlineGame from "./OnlineGame";
import { SESSION_KEY } from "./game/online";
import "./App.css";
import "./Visuals.css";
import "./BattlePolish.css";
import "./LivingWorld.css";
import "./ArenaHeart.css";
import "./Cinematic.css";
import "./Immersive.css";
import "./Stage.css";
import "./RearView.css";
import "./BankaiControls.css";

function initialOnline(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) !== null;
  } catch {
    return false;
  }
}

export default function App() {
  const [online, setOnline] = useState(initialOnline);
  const effects=useEffects();

  return (
    <div className="app-shell" data-effects={effects ? "on" : "off"}>
      <nav aria-label="Play mode" className="mode-nav">
        <button
          type="button"
          className={!online ? "primary" : "secondary"}
          aria-pressed={!online}
          onClick={() => setOnline(false)}
        >
          Practice / Local
        </button>
        <button
          type="button"
          className={online ? "primary" : "secondary"}
          aria-pressed={online}
          onClick={() => setOnline(true)}
        >
          Online rooms
        </button>
        <SoundControls />
      </nav>

      {online ? <OnlineGame /> : <OfflineGame />}
    </div>
  );
}

import "./Signature.css";
import "./VoiceAwakening.css";

import "./CombatAnimation.css";
