const fetch = require('node-fetch');
require('dotenv').config();

// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/responses';

/**
 * Generate a roast of user's music taste using OpenAI
 * @param {Array} tracks - Array of top track objects with name and artists
 * @returns {Promise<Array>} - Array of roast bullet points
 */
async function generateMusicRoast(tracks) {
    try {
        console.log('🤖 Generating music roast for tracks:', tracks.map(t => `${t.name} - ${t.artists[0].name}`));
        
        if (!OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY not found in environment variables');
        }

        // Create a formatted list of the user's top tracks
        const trackList = tracks.map((track, index) => 
            `${index + 1}. ${track.name} by ${track.artists.map(artist => artist.name).join(', ')}`
        ).join('\n');

        const prompt = `



brutally roast my music taste. structure your message like a tweet with no periods. start every sentence with a dash and use no other punctuation (and use twitter grammar), use short form like 'u' whenever possible, give me 10 points
you must be witty, no extremely direct and cringe roasts
Sample input + Good answer:
Escape (feat. Hayla)
I Remember - John Summit Remix deadmaus, Kaskade, John Summit
Escape - John Summit Remix
deadmaus, Kaskade, Kx5, HAYLA, John Summit
ILLENIUM, Excision, I Prevail
Gold (Stupid Love)
Excision, ILLENIUM, Shallowsorever
u really put the same song on here twice
ur playlist is just a John Summit sponsorship deal
this the official soundtrack for spending $20 on a festival water bottle
do u cry or do u headbang make up ur mind
ah yes the holy trinity illenium excision and emotional damage
ur music taste peaked at EDC 2023
bro discovered the Beatport top 10 and called it a personality
this is what plays in the background of a crypto bro's instagram story
u must be new here welcome to EDM 101
did Kaskade and deadmau5 pay u for this promo
Sample input + bad answer:
Men I Trust
back to friends sombr
Nobody New
The Marias
Cigarettes After Sex
Always Forever
Cults
yo music taste is straight outta a rainy day tumblr aesthetic thats been dead since 2015
men i trust? more like men i nap to cuz this puts me in a coma quick
back to friends by sombr got u thinkin ur deep but its just recycled heartbreak vibes on loop
nobody new? ironic cuz ur whole list screams "i discovered indie before u" but its all basic af
the marias makin u feel artsy but really its just background noise for overpriced lattes
cigarettes after sex? bold choice for someone whose wildest night is bingein netflix alone
always forever by cults hittin that eternal boredom button u call a playlist
cults overall? u joined the wrong one its all vibes no substance like a filter on a bad selfie
this lineup got more chill than a polar bear in a freezer but zero heat to melt the ice
listenin to this makes me wonder if u ever heard music that doesnt whisper sweet nothins to ur depression 

Actual songs to judge:
${trackList}
`;

        console.log('🤖 Sending prompt to OpenAI:', prompt);

        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-5-mini',
                input: prompt
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
        }

        const data = await response.json();
        console.log('🤖 OpenAI response:', data);

        const roastText = data.output[1].content[0].text;
        console.log('🤖 Generated roast:', roastText);

        // Try to extract bullet points (lines starting with -)
        const bulletPoints = roastText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.startsWith('-'))
            .map(line => line.substring(1).trim()) // Remove the dash
            .filter(line => line.length > 0);

        console.log('🤖 Extracted bullet points:', bulletPoints);

        // If we can't extract proper bullet points, return the full response
        if (bulletPoints.length < 3) {
            console.log('⚠️ Not enough bullet points found, returning full response');
            // Split by lines and filter out empty ones
            const allLines = roastText
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            
            return allLines.length > 0 ? allLines : [roastText];
        }

        // Return the extracted bullet points (up to 9)
        return bulletPoints.slice(0, 9);

    } catch (error) {
        console.error('❌ Error generating music roast:', error);
        
        // Return fallback roast if API fails
        return [
            "ur playlist lowkey reads like u asked spotify “give me indie but sprinkle gang violence”",
            "frank sinatra remastered in 2008 screams u discovered ur grandpas vinyl collection then got bored",
            "nobody new sounds like the title of ur autobiography after one bad date",
            "wave to earth and metro in the same setlist like u can't decide if u wanna sip matcha or start a riot",
            "ur playlist feels like the soundtrack to an arthouse film about a college kid who shoplifts vinyls for clout",
        ];
    }
}

module.exports = { generateMusicRoast }; 