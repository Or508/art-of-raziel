const { GoogleSpreadsheet } = require('google-spreadsheet');

const {
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY,
  GOOGLE_SHEET_ID,
} = process.env;

let docPromise = null;

async function getDoc() {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
    console.warn('Google Sheets not configured (missing env vars), skipping append.');
    throw new Error('GOOGLE_SHEETS_NOT_CONFIGURED');
  }

  if (!docPromise) {
    docPromise = (async () => {
      const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID);
      await doc.useServiceAccountAuth({
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
      await doc.loadInfo();
      return doc;
    })();
  }

  return docPromise;
}

async function appendContactToSheet(requestData) {
  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByIndex[0];

    const now = new Date();
    const row = {
      Date: now.toISOString(),
      Name: requestData.fullName || '',
      Email: requestData.email || '',
      Phone: requestData.phone || '',
      'Meeting Type': requestData.meetingType || '',
      Channel: requestData.channel || '',
      'Meeting Date': requestData.meeting_date || '',
      'Meeting Time': requestData.meeting_time || '',
      Notes: requestData.notes || '',
    };

    await sheet.addRow(row);
  } catch (err) {
    if (err.message === 'GOOGLE_SHEETS_NOT_CONFIGURED') {
      // already logged – safe to ignore
      return;
    }
    console.warn('appendContactToSheet error:', err.message);
  }
}

module.exports = {
  appendContactToSheet,
};

