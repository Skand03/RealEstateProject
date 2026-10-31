# 🔧 Blank Page Troubleshooting Guide

## Issue: Browser shows a blank white page

Follow these steps in order:

---

## Step 1: Check Browser Console (MOST IMPORTANT)

1. Open http://localhost:5173 in your browser
2. Press **F12** (or Right-click → Inspect)
3. Click on the **Console** tab
4. Look for RED error messages

### Common Errors & Solutions:

#### Error: "Cannot find module '@reduxjs/toolkit'"
**Solution:**
```powershell
cd client
npm install @reduxjs/toolkit react-redux
```

#### Error: "Cannot find module 'react-router-dom'"
**Solution:**
```powershell
cd client
npm install react-router-dom
```

#### Error: "Failed to fetch" or Network Error
**Solution:** Backend is not running. Check Terminal 1 (server).

#### Error: "SyntaxError: Unexpected token"
**Solution:** There's a code error. Share the full error message.

---

## Step 2: Verify Both Servers Are Running

### Check Frontend Terminal:
Should show:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

If you see errors, try:
```powershell
cd client
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

### Check Backend Terminal:
Should show:
```
Server running on port 5000
MongoDB Connected successfully
```

If you see MongoDB connection error:
- Check your `server\.env` file
- Verify MONGODB_URI is correct
- Go to MongoDB Atlas → Network Access → Add IP Address → Allow from Anywhere (0.0.0.0/0)

---

## Step 3: Check if Vite is Serving Files

In browser, try accessing:
- http://localhost:5173/ (should show your app)
- http://localhost:5173/about (should show About page)
- http://localhost:5173/login (should show Login page)

If ALL pages are blank, the issue is likely:
1. Missing dependencies
2. Build error in the console
3. Wrong path in vite config

---

## Step 4: Test Backend Connection

Open a new browser tab and go to:
```
http://localhost:5000/api/properties
```

**What you should see:**
- JSON response with properties list (might be empty: `{"data": []}`)

**If you see error:**
- Backend is not running → Check Terminal 1
- Port 5000 not accessible → Check firewall

---

## Step 5: Check Network Tab

In browser DevTools:
1. Go to **Network** tab
2. Refresh the page (F5)
3. Look at the requests

**What to check:**
- Is `main.jsx` or `index.html` loading? (Status 200)
- Are there any failed requests? (Status 404, 500)
- Is the page making API calls?

---

## Step 6: Nuclear Option - Fresh Install

If nothing works, do a complete reset:

```powershell
# Backend
cd server
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install

# Frontend  
cd ../client
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

Then start both servers again.

---

## Step 7: Check for PowerShell Execution Policy Error

If you see "cannot be loaded because running scripts is disabled":

```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🆘 Still Not Working? Share These Details:

1. **Browser Console Errors** (Press F12 → Console tab):
   ```
   [Paste the RED error messages here]
   ```

2. **Frontend Terminal Output**:
   ```
   [Paste what you see when running npm run dev in client folder]
   ```

3. **Backend Terminal Output**:
   ```
   [Paste what you see when running npm run dev in server folder]
   ```

4. **Node Version**:
   ```powershell
   node --version
   ```

5. **NPM Version**:
   ```powershell
   npm --version
   ```

---

## Quick Test - Minimal React App

To verify React is working at all, create a test file:

**Create: `client\src\TestApp.jsx`**
```jsx
function TestApp() {
  return (
    <div style={{ padding: '20px', fontSize: '24px', color: 'blue' }}>
      <h1>React is Working! ✅</h1>
      <p>If you can see this, React is fine.</p>
    </div>
  )
}

export default TestApp
```

**Temporarily edit `client\src\main.jsx`:**
```jsx
import TestApp from './TestApp'  // Add this

// Replace <App /> with <TestApp />
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <TestApp />  {/* Changed from App */}
        <Toaster ... />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
```

If you see the blue text "React is Working!", then React works and the issue is in the App routing.

---

## Most Likely Causes:

1. ✅ **Missing Dependencies** - Run `npm install` in client folder
2. ✅ **Backend Not Running** - Start server with `npm run dev` in server folder
3. ✅ **Console Error** - Check browser console (F12)
4. ✅ **Port Conflict** - Another app using port 5173 or 5000
5. ✅ **Node Version** - Need Node v16 or higher

---

**After checking these, tell me:**
- What errors you see in the browser console (F12 → Console)
- What you see in the frontend terminal
- What you see in the backend terminal

I'll help you fix it! 😊
