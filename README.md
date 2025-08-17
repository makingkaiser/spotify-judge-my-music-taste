# Judge My Top Songs (Inspired By Receiptify)

This app judges your top songs by pulling in your top songs. 

[image](roast-result.png)

felt a little called out after this one. 

Unfortunately, due to Spotify's web API restrictions after May 15, 2025, only 25 users may authenticate with an app unless you have 250,000 monthly active units. Bummer. Would have been really fun to release this. 



## Setup Instructions

### 1. Get Spotify Developer Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in the details:
   - **App Name**: `Barebones Spotify App`
   - **App Description**: `Simple app to display top tracks and artists`
5. After creating, note down your:
   - **Client ID**
   - **Client Secret**
6. Click "Edit Settings" and add redirect URI:
   - `http://localhost:3001/callback`

### 2. Install Dependencies

```bash
cd barebones-spotify-app
npm install
```

### 3. Set Environment Variables

Create a `.env` file in the project root:

```env
CLIENT_ID=your_spotify_client_id_here
CLIENT_SECRET=your_spotify_client_secret_here
REDIRECT_URI=http://localhost:3001/callback
OPENAI_API_KEY=your_api_key
PORT=3001
```

## Troubleshooting

**"Invalid client" error**: Check that your CLIENT_ID and CLIENT_SECRET are correct

**"Invalid redirect URI"**: Make sure you added `http://localhost:3001/callback` to your Spotify app settings

**"Insufficient client scope"**: The app requests `user-read-private`, `user-read-email`, and `user-top-read` scopes

**No data showing**: Make sure you have listening history on Spotify (the app needs data to display)

---

*This is a minimal implementation for learning purposes. For production apps, add proper error handling, security measures, and token refresh functionality.* 