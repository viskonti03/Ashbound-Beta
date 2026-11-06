# Ashbound — Voice Edition (0.13.0)

Extract this complete project into a new folder. From the folder containing package.json:

    npm ci
    npm run build

Stop your old server and dev terminal (Ctrl+C), then start two terminals in this new folder:

    npm run server

    npm run dev

Use the URL printed by Vite. Both online players should refresh after the server restarts. Turn Sound ON; Music and Voice can be controlled separately in Settings.

## Included

- Your recorded Bankai voices for Dan, Afrodi, Blade, Drake, Gin, Kami, Kidou, Lane and Tomamaru.
- English dialogue from VA.txt beside the Bankai character artwork. All lines remain readable throughout the scene; these are not word-timed subtitles.
- Each cinematic and its online action lock lasts for that character's recording plus a short ending beat.
- Awakening music plays softly under the recording. When the awakening finishes, the battle theme starts from zero. Every new Bankai interrupts the previous music/voice and repeats this sequence.
- Skipping visuals closes the cinematic but leaves the audio and shared battle timing intact.
- Existing roster, signature abilities, Kidou chooser, artwork and game mechanics retained.

Blade now uses the replacement recording directly at public/audio/voices/blade-v2.mp3, without cuts or mixing. The cinematic lasts 19.792 seconds. The English Eternal Vow dialogue is unchanged.

Audio mapping, dialogue and scene lengths: src/game/awakeningVoices.ts. Original text: public/audio/voices/VA.txt.
