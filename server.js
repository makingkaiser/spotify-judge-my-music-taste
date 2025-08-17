const express = require('express');
const request = require('request');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const { generateMusicRoast } = require('./openai-roast');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Spotify credentials - set these in your environment variables
const CLIENT_ID = process.env.CLIENT_ID || 'your_spotify_client_id';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'your_spotify_client_secret';
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3001/callback';

const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

app.use(express.static(__dirname + '/public'))
   .use(cookieParser());

// Home page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Login route - redirect to Spotify authorization
app.get('/login', (req, res) => {
  const state = generateRandomString(16);
  res.cookie('spotify_auth_state', state);

  const scope = 'user-read-private user-read-email user-top-read playlist-modify-public';
  
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI,
      state: state
    })
  );
});

// Callback route - handle Spotify's response
app.get('/callback', (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies['spotify_auth_state'] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#error=state_mismatch');
    return;
  }

  res.clearCookie('spotify_auth_state');

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
    },
    json: true
  };

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const access_token = body.access_token;
      
      // Redirect to the frontend with the access token
      res.redirect('/#access_token=' + access_token);
    } else {
      res.redirect('/#error=invalid_token');
    }
  });
});

// Endpoint to generate music roast
app.post('/api/roast', express.json(), async (req, res) => {
  try {
    console.log('🤖 Roast request received:', req.body);
    const { tracks } = req.body;
    
    if (!tracks || !Array.isArray(tracks)) {
      return res.status(400).json({ error: 'Invalid tracks data' });
    }

    const roastBulletPoints = await generateMusicRoast(tracks);
    
    res.json({ 
      success: true, 
      roast: roastBulletPoints,
      count: roastBulletPoints.length 
    });
    
  } catch (error) {
    console.error('❌ Error in roast endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to generate roast', 
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Make sure to set your Spotify CLIENT_ID and CLIENT_SECRET environment variables!');
  console.log('Make sure to set your OPENAI_API_KEY environment variable for music roasts!');
}); 