import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
import path from 'path';
import open from 'open';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Token will still be saved locally for reuse
const TOKEN_PATH = path.resolve(__dirname, '../token.json');

async function authorize() {
    const client_id = process.env.GOOGLE_CLIENT_ID;
    const client_secret = process.env.GOOGLE_CLIENT_SECRET;
    const redirect_uri = process.env.GOOGLE_REDIRECT_URI;

    if (!client_id || !client_secret || !redirect_uri) {
        throw new Error('Missing required Google OAuth credentials in .env');
    }

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);

    if (fs.existsSync(TOKEN_PATH)) {
        oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8')));
        return oAuth2Client;
    }

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    });

    console.log('Authorize Echo by visiting this URL:\n', authUrl);
    await open(authUrl);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const code = await new Promise<string>((resolve) => {
        rl.question('Enter the code from the page: ', (c) => {
            rl.close();
            resolve(c);
        });
    });

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    console.log('✅ Token saved.');
    return oAuth2Client;
}

export async function getUpcomingEvents() {
    const auth = await authorize();
    const calendar = google.calendar({ version: 'v3', auth });

    const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 5,
        singleEvents: true,
        orderBy: 'startTime'
    });

    return res.data.items || [];
}

export async function getRecentEmails() {
    const auth = await authorize();
    const gmail = google.gmail({ version: 'v1', auth });

    const res = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 5,
        labelIds: ['INBOX']
    });

    return res.data.messages || [];
}
