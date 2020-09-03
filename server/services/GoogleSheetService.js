const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
let _auth = null;
const path = require('path');
const ServiceResponse = require("../BaseClasses/ServiceResponse").serviceResponse;

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(__dirname, '../utils/token.json');



/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    _auth = oAuth2Client;

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
async function listMajors(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    let _result = null;
    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.get({
            spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
            range: 'Class Data!A2:E',
        }, (err, res) => {
            if (err) {
                console.log('The API returned an error: ' + err);
                reject('The API returned an error: ' + err);

            }
            const rows = res.data.values;
            if (rows.length) {
                console.log('Name, Major:');
                // Print columns A and E, which correspond to indices 0 and 4.
                _result = rows.map((row) => {
                    return (`${row[0]}, ${row[4]}`);
                });
                console.log(_result)
                resolve(_result)
            } else {
                resolve('No data found.');
            }
        });
    })
}

const readSheet = async () => {
    try{
        if (_auth) {
            let _result = await listMajors(_auth)
            console.log("DD", _result)
            let sr = new ServiceResponse(true, _result);
            return sr.getServiceResponse();
        } else {
            // Load client secrets from a local file.
            fs.readFile(path.join(__dirname, '../utils/gSheetCredentials.json'), (err, content) => {
                if (err) return console.log('Error loading client secret file:', err);
                // Authorize a client with credentials, then call the Google Sheets API.
                authorize(JSON.parse(content), listMajors);
            });
        }

    }catch(e){
        let sr = new ServiceResponse(false, e);
        return sr.getServiceResponse();
    }
}
readSheet();

// create sheet
const createSheetPromise = async (auth) => {
    const sheets = google.sheets({ version: 'v4', auth });
    return new Promise((resolve,reject) => {
        const resource = {
            properties: {
              title:`HungerPoint-${new Date().getFullYear()}`,
            },
          };
          sheets.spreadsheets.create({
            resource,
            fields: 'spreadsheetId',
          }, (err, spreadsheet) =>{
            if (err) {
              // Handle error.
              console.log("Error:",err);
              reject(err)
            } else {
              console.log("spreadsheet",spreadsheet);
              resolve(spreadsheet.data)
            }
          });
    })
    
}

const createSheet = async () => {
    try{
        if (_auth) {
            let _result = await createSheetPromise(_auth)
            console.log("PRORO",_result)
            let sr = new ServiceResponse(true, _result);
            return sr.getServiceResponse();
        } else {
            // Load client secrets from a local file.
            fs.readFile(path.join(__dirname, '../utils/gSheetCredentials.json'), (err, content) => {
                if (err) return console.log('Error loading client secret file:', err);
                // Authorize a client with credentials, then call the Google Sheets API.
                authorize(JSON.parse(content), listMajors);
            });
        }

    }catch(e){
        console.log("Error",e)
        let sr = new ServiceResponse(false, e);
        return sr.getServiceResponse();
    }
}
module.exports = {
    readSheet: readSheet,
    createSheet:createSheet
}