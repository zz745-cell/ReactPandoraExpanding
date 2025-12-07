### Firebase setup (Email/Password)

#### 1) Create the Firebase project + Web App
- In Firebase Console: create a project
- Add a **Web App** and copy its config values
- Enable **Authentication → Sign-in method → Email/Password**

#### 2) Add these environment variables (CRA)
Create `FrontEnd/.env.local` with:

- **`REACT_APP_FIREBASE_API_KEY`**
- **`REACT_APP_FIREBASE_AUTH_DOMAIN`**
- **`REACT_APP_FIREBASE_PROJECT_ID`**
- **`REACT_APP_FIREBASE_APP_ID`**
- *(optional)* `REACT_APP_FIREBASE_STORAGE_BUCKET`, `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- **`REACT_APP_API_BASE_URL`** (defaults to `http://localhost:5001`)

Restart the React dev server after changing env vars.

#### 3) Backend requirements (Firebase token verification)
Set backend env vars:
- **`AUTH_MODE=firebase`**
- And one of: `FIREBASE_SERVICE_ACCOUNT_PATH` / `FIREBASE_SERVICE_ACCOUNT_JSON` / `GOOGLE_APPLICATION_CREDENTIALS`

#### 4) Admin/write access
To allow product writes, set a custom claim `role=admin` for a Firebase user, then have them sign out/in.


