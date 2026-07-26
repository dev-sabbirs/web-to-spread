# Google Apps Script Setup Guide

This is a **one-time setup** to connect the extension to your Google Sheet.

---

## Step 1 — Create a Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet
2. Name it something like **"GitHub Leads"**
3. Rename the first sheet tab to **"Leads"** (or whatever you prefer — just match it in the extension popup)

---

## Step 2 — Open the Apps Script Editor

In your spreadsheet, click **Extensions → Apps Script**

---

## Step 3 — Paste the Script

Delete any existing code and paste the following:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Ping check (connection test from options page)
    if (data.type === 'ping') {
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, message: 'Pong' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const platform = data.platform || 'github';
    const defaultTabName = platform === 'linkedin' ? 'LinkedIn Leads' : 'GitHub Leads';
    const sheetName = data.sheetName || defaultTabName;
    let sheet = ss.getSheetByName(sheetName);

    // Action: Read table data for dashboard preview
    if (data.action === 'getLeads') {
      if (!sheet || sheet.getLastRow() === 0) {
        return ContentService
          .createTextOutput(JSON.stringify({ success: true, data: { headers: [], rows: [] } }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const values = sheet.getDataRange().getValues();
      const headers = values[0] || [];
      const rows = values.slice(1) || [];

      return ContentService
        .createTextOutput(JSON.stringify({ success: true, data: { headers, rows } }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Action: Flush / clear all rows (keeping header row intact)
    if (data.action === 'flushSheet') {
      if (sheet && sheet.getLastRow() > 1) {
        sheet.deleteRows(2, sheet.getLastRow() - 1);
      }
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, message: 'Sheet flushed successfully.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    // Platform-specific headers
    const isLinkedIn = platform === 'linkedin';
    const headers = isLinkedIn
      ? [
          'Timestamp',
          'Name',
          'Headline',
          'About / Summary',
          'Company',
          'Location',
          'Primary Email',
          'Secondary Emails',
          'LinkedIn Profile URL',
          'Website / Contact Link',
          'Connection Degree',
          'Source Platform',
          'Notes'
        ]
      : [
          'Timestamp',
          'Username',
          'Full Name',
          'Company',
          'Primary Email',
          'Secondary Emails',
          'Bio',
          'Location',
          'Website',
          'Twitter / X',
          'LinkedIn',
          'Repositories',
          'Followers',
          'Following',
          'GitHub URL',
          'Notes'
        ];

    // Create header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground(isLinkedIn ? '#0a66c2' : '#1a73e8')
        .setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    const primaryEmail = data.primaryEmail || (data.emails && data.emails[0]) || '';
    const secondaryEmails = data.secondaryEmails || (data.emails && data.emails.slice(1).join(', ')) || '';

    // Append structured lead record
    const row = isLinkedIn
      ? [
          data.timestamp || new Date().toISOString(),
          data.name || '',
          data.headline || '',
          data.about || data.bio || '',
          data.company || '',
          data.location || '',
          primaryEmail,
          secondaryEmails,
          data.url || data.linkedin || '',
          data.website || '',
          data.connectionDegree || '',
          'LinkedIn',
          '' // Empty Notes column for manual entry
        ]
      : [
          data.timestamp || new Date().toISOString(),
          data.username || '',
          data.name || '',
          data.company || '',
          primaryEmail,
          secondaryEmails,
          data.bio || '',
          data.location || '',
          data.website || '',
          data.twitter || '',
          data.linkedin || '',
          data.repositoriesCount || '',
          data.followers || '',
          data.following || '',
          data.url || '',
          '' // Empty Notes column for manual entry
        ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: Test function — run this manually in the editor to verify
function testDoPost() {
  const mockEvent = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        url: "https://github.com/torvalds",
        username: "torvalds",
        name: "Linus Torvalds",
        company: "Linux Foundation",
        primaryEmail: "torvalds@linux-foundation.org",
        secondaryEmails: "",
        emails: ["torvalds@linux-foundation.org"],
        bio: "Creator of Linux kernel & Git",
        location: "Portland, OR",
        website: "https://kernel.org",
        twitter: "",
        linkedin: "",
        repositoriesCount: "12",
        followers: "230000",
        following: "0",
        sheetName: "Leads",
      }),
    },
  };
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
```

---

## Step 4 — Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the ⚙️ gear icon next to "Type" → select **Web app**
3. Set:
   - **Description**: GitHub Lead Extractor
   - **Execute as**: `Me`
   - **Who has access**: `Anyone` ← **important, otherwise the extension can't POST**
4. Click **Deploy**
5. Click **Authorize access** and complete the Google auth flow
6. Copy the **Web app URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```

---

## Step 5 — Configure the Extension

1. Click the extension icon in Chrome toolbar
2. Paste the Web app URL into the **Apps Script Web App URL** field
3. Set the **Sheet / Tab Name** to match your sheet tab (e.g. `Leads`)
4. Click **Save Settings**

---

## Step 6 — Test It

1. Navigate to a GitHub profile, e.g. `https://github.com/sindresorhus`
2. Click the **purple phone icon** button (bottom-right corner)
3. A toast notification confirms success
4. Check your Google Sheet — a new row should appear!

---

## Troubleshooting

| Problem                         | Fix                                                   |
| ------------------------------- | ----------------------------------------------------- |
| `❌ No Apps Script URL set`     | Open extension popup and save the URL                 |
| `❌ HTTP 302` or redirect error | Make sure "Who has access" is set to **Anyone**       |
| `❌ Network error`              | Check if the Apps Script URL is correct and deployed  |
| Button not appearing            | Refresh the GitHub page                               |
| No email found                  | The engineer hasn't made their email public on GitHub |

---

## Data Collected Per Row

| Column           | Source                                           |
| ---------------- | ------------------------------------------------ |
| Timestamp        | System clock (ISO 8601 when button clicked)      |
| Username         | Profile URL (`github.com/<username>`)            |
| Full Name        | Profile display name                             |
| Company          | Work / Organization attribute                    |
| Primary Email    | Main extracted email address                     |
| Secondary Emails | Additional comma-separated emails found on page  |
| Bio              | Profile biography statement                      |
| Location         | Stated location/city                             |
| Website          | Personal site/blog URL                           |
| Twitter / X      | Twitter or X profile URL                         |
| LinkedIn         | LinkedIn profile URL                             |
| Repositories     | Public repository count                          |
| Followers        | Follower count                                   |
| Following        | Following count                                  |
| GitHub URL       | Full GitHub profile page link                    |

> **Note**: Only emails that are publicly visible on the GitHub page are collected.
> GitHub users must have their email set to "public" in their settings for it to appear.
