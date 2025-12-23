# Santa Tracker 2025

A fun, lightweight React app with an 8-bit/retro gaming aesthetic that lets you track Santa's Christmas journey and even call him directly!

## Features

- **Santa Tracker**: Real-time countdown to Christmas and Santa's journey with animated destinations
- **Call Santa**: Interactive voice call feature using AI (OpenAI + ElevenLabs)
- **8-bit Retro Design**: Nostalgic pixel-art style inspired by classic Google Santa Tracker
- **Fully Responsive**: Works great on desktop and mobile devices

## Tech Stack

- React 18
- Vite
- CSS3 with custom 8-bit styling
- Supabase Edge Functions (secure backend)
- Google Santa Tracker API integration
- OpenAI Whisper (speech-to-text)
- OpenAI GPT (Santa's responses)
- ElevenLabs (text-to-speech)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and add your Supabase configuration:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Security Architecture

The Call Santa feature uses a secure backend architecture:

- API keys (OpenAI & ElevenLabs) are stored securely in Supabase Edge Functions
- Frontend never exposes sensitive credentials
- All AI API calls are proxied through secure backend endpoints
- Edge Functions: `transcribe-audio`, `santa-chat`, `santa-voice`

## Deployment

This app is configured for Vercel deployment. Simply:

1. Push to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard (Supabase URL and Anon Key)
4. Configure OpenAI and ElevenLabs API keys in Supabase Edge Functions dashboard
5. Deploy!

## How to Use

### Track Santa
- View real-time countdown to Christmas
- See Santa's current location and journey progress
- Check presents delivered and fun Christmas facts

### Call Santa
- Press and hold the microphone button
- Speak your message
- Release the button
- Wait for Santa to respond with voice!

Note: The Call Santa feature requires properly configured Supabase Edge Functions with OpenAI and ElevenLabs API keys.
