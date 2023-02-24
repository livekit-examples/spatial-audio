[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flivekit-examples%2Fspatial-audio&env=LIVEKIT_API_KEY,LIVEKIT_API_SECRET,LIVEKIT_WS_URL&envDescription=Get%20these%20from%20your%20cloud%20livekit%20project.&envLink=https%3A%2F%2Fcloud.livekit.io&project-name=my-spatial-audio-app)


This is a demo of spatial audio using LiveKit. Users join a little 2D world, and hear other users' audio in stereo, based on their position and distance relative to you.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Running locally

Clone the repo and install dependencies:

```bash
git clone git@github.com:livekit-examples/spatial-audio.git
cd spatial-audio
npm install
```

Create a new LiveKit project at <http://cloud.livekit.io>. Then create a new key in your [project settings](https://cloud.livekit.io/projects/p_/settings/keys).

Create a new file at `spatial-audio/.env.development` and add your new API key and secret as well as your project's WebSocket URL (found at the top of <http://cloud.livekit.io>):

```
LIVEKIT_API_KEY=<your api key>
LIVEKIT_API_SECRET=<your api secret>
LIVEKIT_WS_URL=wss://<your-project>.livekit.cloud
```

(Note: this file is in `.gitignore`. Never commit your API secret to git.)

Then run the development server:

```bash
npm run dev
```

You can test it by opening <http://localhost:3000> in a browser.

## Deploying for production

This project is a Next.js app. Refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for production deployment.
