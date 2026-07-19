/**
 * SENN — Sweet Seventeen | Google Apps Script backend
 * ---------------------------------------------------------------------
 * Stores RSVP submissions in a Google Sheet and serves them back to the
 * Admin Dashboard in real time.
 *
 * SETUP
 * 1. Go to https://sheets.google.com and create a new spreadsheet
 *    (e.g. "Senn Sweet 17 RSVP").
 * 2. In the sheet, go to Extensions > Apps Script.
 * 3. Delete any starter code and paste this entire file in.
 * 4. Click Deploy > New deployment.
 *      - Select type: "Web app"
 *      - Execute as: "Me"
 *      - Who has access: "Anyone"
 * 5. Click Deploy, authorize the permissions Google asks for, then copy
 *    the Web App URL it gives you.
 * 6. Paste that URL into js/config.js as GAS_URL.
 *
 * That's it — new RSVP submissions will now be appended as rows in the
 * "Guests" sheet tab, and the Admin Dashboard will read from it whenever
 * the GAS_URL is set.
 */

const SHEET_NAME = 'Guests';
const HEADERS = ['ID', 'Name', 'Phone Number', 'Attendance', 'Message', 'Submitted At'];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function doGet(e) {
  const action = e.parameter.action || 'list';

  if (action === 'list') {
    const sheet = getSheet_();
    const data = sheet.getDataRange().getValues();
    const rows = data.slice(1).map((r) => ({
      id: String(r[0]),
      name: r[1],
      phone: String(r[2]),
      attendance: r[3],
      message: r[4],
      submittedAt: r[5]
    })).reverse();

    return ContentService
      .createTextOutput(JSON.stringify(rows))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ error: 'Unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === 'add') {
      const g = body.payload;
      const sheet = getSheet_();
      sheet.appendRow([g.id, g.name, g.phone, g.attendance, g.message, g.submittedAt]);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'delete') {
      const id = body.payload.id;
      const sheet = getSheet_();
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(id)) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
