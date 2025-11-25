# 2FA, Phone Registration, Settings, Calendar, and Bookmarks Walkthrough

I have implemented Two-Factor Authentication (2FA), Phone Number registration, Authentication Controls in Settings, a new Calendar feature, and a robust Bookmarks system.

## Changes

### Backend (FastAPI)
- **User Model**: Added `phone_number` and `two_factor_method` fields.
- **Registration**: Updated to accept phone numbers and 2FA preferences.
- **Login**:
    - Supports login via Username, Email, or Phone Number.
    - Checks if the user has 2FA enabled.
    - If 2FA is enabled, generates a 6-digit code and prints it to the **Backend Console** (Mock SMS/Email).
    - Returns a `two_factor_required` flag and a temporary token.
- **Verification**: Added `/api/auth/verify-2fa` endpoint to validate the code and issue the final access token.

### Frontend (React Native)
- **Sign Up**:
    - Added "Phone Number" input field.
    - Added "Two-Factor Authentication" selection (None, SMS, Email).
- **Login**:
    - Updated username input to accept "Username, Email, or Phone".
    - Implemented a verification flow for 2FA.
- **Settings**:
    - Added an **Account** section.
    - **Guest Users**: See a "Create Account" button that links to the Sign Up screen.
    - **Signed-in Users**: See a "Log Out" button that signs them out.
- **Calendar**:
    - Added a new **Calendar** tab.
    - Allows toggling between **Gregorian (GC)** and **Ethiopian (EC)** calendars.
    - **Live Clock**: Displays current time (HH:MM:SS) in both formats.
    - **Grid View**: Full monthly grid for both calendars.
    - **Ethiopian Polish**:
        - Uses **Arabic Numerals** (e.g., 1, 2, 3) for days and years.
        - Always displays **Amharic Month Names** (e.g., መስከረም) when in Ethiopian mode.
        - **Fixes**: Corrected Amharic Tuesday to "ማክሰኞ" and reduced weekday font size.
- **Map**:
    - **Guest Mode**: Added robust error handling to ensure map loads or fails gracefully.
    - **Bookmarks**: Added a "Bookmark" button to the Church Details sheet.
- **Bookmarks**:
    - **Tabs**: Added "Verses" and "Churches" tabs.
    - **Verses**: Lists saved bible verses.
    - **Churches**: Lists saved churches. Tapping a church navigates to the Map.

### Guest Mode
- **Persistence**: Guest sessions are **no longer persisted**. If a guest user closes and reopens the app, they will be directed to the **Login Screen**.

## Verification Steps

### 1. Register with 2FA
1.  Go to the **Sign Up** screen.
2.  Enter a username, email, and password.
3.  Enter a **Phone Number**.
4.  Select **SMS** or **EMAIL** as the 2FA method.
5.  Tap "Sign Up".

### 2. Login with 2FA
1.  Go to the **Login** screen.
2.  Enter the username (or email/phone) and password of the new user.
3.  Tap "Sign In".
4.  **Check the Backend Terminal**: You should see a log message with the verification code.
5.  Enter the code in the app and tap "Verify".

### 3. Settings Controls
1.  **As Guest**:
    - Log in as Guest.
    - Go to **Settings**.
    - Tap **Create Account**.
    - Verify you are taken to the Sign Up screen.
2.  **As User**:
    - Log in as a registered user.
    - Go to **Settings**.
    - Tap **Log Out**.
    - Verify you are logged out and returned to the Login screen.

### 4. Calendar
1.  Tap the new **Calendar** tab.
2.  **Check Clock**: Verify the seconds are ticking.
3.  **Toggle to EC**:
    - Verify the time changes (should be ~6 hours difference).
    - Verify the grid shows Ethiopian months (30 days).
    - **Verify Polish**: Ensure you see Amharic month names but **standard numbers**.
    - **Verify Fixes**: Check that Tuesday is "ማክሰኞ" and the weekday text fits.

### 5. Guest Persistence
1.  Log in as **Guest**.
2.  Close and Restart the App (or Reload).
3.  Verify you are back at the **Login Screen**.

### 6. Bookmarks & Map
1.  **Guest Map**: Log in as Guest -> Go to Map -> Verify it loads.
2.  **Bookmark Church**:
    - Select a church on the Map.
    - Tap the **Bookmark** icon.
3.  **View Bookmarks**:
    - Go to **Bookmarks** tab.
    - Switch to **Churches** tab.
    - Verify the church is listed.
    - Tap it -> Verify it takes you to the Map.
