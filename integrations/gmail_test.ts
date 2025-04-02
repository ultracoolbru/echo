import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const TOKEN_PATH = path.resolve(__dirname, './token.json');
const CREDENTIALS_PATH = path.resolve(__dirname, './client_secret.json');

async function authorize() {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const { client_secret, client_id, redirect_uris } = credentials.installed;

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(token);

    return oAuth2Client;
}

async function listRecentEmails() {
    const auth = await authorize();
    const gmail = google.gmail({ version: 'v1', auth });

    const res = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 5,
        labelIds: ['INBOX']
    });

    const messages = res.data.messages || [];

    if (!messages.length) {
        console.log('📭 No recent emails found.');
        return;
    }

    console.log(`📬 Showing ${messages.length} recent emails:\n`);

    for (const message of messages) {
        const msg = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
            format: 'metadata',
            metadataHeaders: ['Subject', 'From']
        });

        const headers = msg.data.payload?.headers || [];
        const subject = headers.find(h => h.name === 'Subject')?.value ?? '[No Subject]';
        const from = headers.find(h => h.name === 'From')?.value ?? '[No Sender]';

        console.log(`- ${subject} (${from})`);
    }
}

listRecentEmails();
