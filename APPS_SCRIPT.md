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
// Optional: Test function — run this manually in the editor to verify
function testDoPost() {
  const mockEvent = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        url: "https://github.com/torvalds",
        username: "torvalds",
        name: "Linus Torvalds",
        emails: ["torvalds@linux-foundation.org"],
        bio: "Creator of Linux kernel",
        location: "Portland, OR",
        website: "https://kernel.org",
        linkedin: "",
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

| Column    | Source                                  |
| --------- | --------------------------------------- |
| Timestamp | When the button was clicked             |
| URL       | Current GitHub page URL                 |
| Username  | From URL path (`github.com/<username>`) |
| Full Name | From profile page DOM                   |
| Emails    | Regex + mailto links scan               |
| Bio       | Profile bio section                     |
| Location  | Profile location field                  |
| Website   | Profile website link                    |
| LinkedIn  | Any `linkedin.com/in/` link on the page |

> **Note**: Only emails that are publicly visible on the GitHub page are collected.
> GitHub users must have their email set to "public" in their settings for it to appear.
