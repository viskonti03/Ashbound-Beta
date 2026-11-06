import type { Unit } from "./types";
export const AWAKENING_VOICES = {
  "dan": {
    "src": "/audio/voices/dan.mp3",
    "durationMs": 17753,
    "title": "TOURGEN, SHOGUN OF DEATH",
    "lines": [
      {
        "speaker": "Dan",
        "text": "Tourgen… release your hunger."
      },
      {
        "speaker": "Tourgen",
        "text": "Black flames… turn all things to ash, and all life to despair."
      },
      {
        "speaker": "Both",
        "text": "BANKAI — TOURGEN, SHOGUN OF DEATH!"
      }
    ]
  },
  "kidou": {
    "src": "/audio/voices/kidou.mp3",
    "durationMs": 18642,
    "title": "ECHOES OF A THOUSAND BLADES",
    "lines": [
      {
        "speaker": "Kidou",
        "text": "One sword is all I need…"
      },
      {
        "speaker": "Kidou",
        "text": "But its voice is not the only one."
      },
      {
        "speaker": "Kidou",
        "text": "O blades of a thousand ages, answer my call."
      },
      {
        "speaker": "Kidou",
        "text": "BANKAI — ECHOES OF A THOUSAND BLADES!"
      }
    ]
  },
  "blade": {
    "src": "/audio/voices/blade-v2.mp3",
    "durationMs": 19792,
    "title": "ETERNAL VOW",
    "lines": [
      {
        "speaker": "Blade",
        "text": "Since the day death took you from me… I have never forgiven the world."
      },
      {
        "speaker": "Wife",
        "text": "But I'm still here… within your blade."
      },
      {
        "speaker": "Blade",
        "text": "Then we shall never be separated again."
      },
      {
        "speaker": "Both",
        "text": "BANKAI — ETERNAL VOW!"
      }
    ]
  },
  "drake": {
    "src": "/audio/voices/drake.mp3",
    "durationMs": 29247,
    "title": "ESSENCE OF DESTRUCTION",
    "lines": [
      {
        "speaker": "Drake",
        "text": "Whatever I touch… has no future."
      },
      {
        "speaker": "Drake",
        "text": "Swords, souls, even fate itself… all shall vanish without a trace."
      },
      {
        "speaker": "Drake",
        "text": "Remember this… destruction is not merely an ending."
      },
      {
        "speaker": "Drake",
        "text": "It is the return of existence itself to nothingness."
      },
      {
        "speaker": "Drake",
        "text": "BANKAI — ESSENCE OF DESTRUCTION!"
      }
    ]
  },
  "lane": {
    "src": "/audio/voices/lane.mp3",
    "durationMs": 26086,
    "title": "HEART OF TEN THOUSAND STARS",
    "lines": [
      {
        "speaker": "Lane",
        "text": "Can you hear it…?"
      },
      {
        "speaker": "Lane",
        "text": "The heartbeat of the stars."
      },
      {
        "speaker": "Lane",
        "text": "Cores of distant worlds… gather your power within me."
      },
      {
        "speaker": "Lane",
        "text": "I do not remain still because I am afraid."
      },
      {
        "speaker": "Lane",
        "text": "It is because with this single strike… the galaxy shall fall silent."
      },
      {
        "speaker": "Lane",
        "text": "BANKAI — HEART OF TEN THOUSAND STARS!"
      }
    ]
  },
  "gin": {
    "src": "/audio/voices/gin.mp3",
    "durationMs": 16526,
    "title": "THE INFINITE ABYSS",
    "lines": [
      {
        "speaker": "Gin",
        "text": "Can you hear it…?"
      },
      {
        "speaker": "Gin",
        "text": "The world is drawing its final breath."
      },
      {
        "speaker": "Gin",
        "text": "Even that power… I shall take for myself."
      },
      {
        "speaker": "Gin",
        "text": "BANKAI — THE INFINITE ABYSS!"
      }
    ]
  },
  "tomamaru": {
    "src": "/audio/voices/tomamaru.mp3",
    "durationMs": 17440,
    "title": "THE IMMORTAL THUNDER",
    "lines": [
      {
        "speaker": "Tomamaru",
        "text": "I once believed that when lightning fades, the storm comes to an end."
      },
      {
        "speaker": "Tomamaru",
        "text": "But I was wrong."
      },
      {
        "speaker": "Tomamaru",
        "text": "Thunder never disappears. As long as I remain… it will roar again and again."
      },
      {
        "speaker": "Tomamaru",
        "text": "BANKAI — THE IMMORTAL THUNDER!"
      }
    ]
  },
  "kami": {
    "src": "/audio/voices/kami.mp3",
    "durationMs": 12660,
    "title": "VANISHING POINT",
    "lines": [
      {
        "speaker": "Kami",
        "text": "Running is pointless…"
      },
      {
        "speaker": "Kami",
        "text": "This shot doesn't pierce flesh. It pierces existence itself."
      },
      {
        "speaker": "Kami",
        "text": "BANKAI — VANISHING POINT!"
      }
    ]
  },
  "afrodi": {
    "src": "/audio/voices/afrodi.mp3",
    "durationMs": 10935,
    "title": "PROCESSION OF THE DAMNED",
    "lines": [
      {
        "speaker": "Afrodi",
        "text": "The dead have gathered…"
      },
      {
        "speaker": "Afrodi",
        "text": "Worshippers of Hell, drag them into the depths of the abyss."
      },
      {
        "speaker": "Afrodi",
        "text": "BANKAI — PROCESSION OF THE DAMNED!"
      }
    ]
  }
} as const;
export function awakeningVoice(character: Unit["character"]) { return (AWAKENING_VOICES as Partial<Record<Unit["character"], (typeof AWAKENING_VOICES)[keyof typeof AWAKENING_VOICES]>>)[character]; }
export function awakeningDuration(character: Unit["character"]) { return awakeningVoice(character)?.durationMs ?? 6000; }
