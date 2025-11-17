# 🔧 Next.js Troubleshooting Guide

## ✅ **Issue Resolved: Turbopack Memory Error**

### **Problem**
The Next.js 16.0.1 application was crashing with a **Turbopack memory allocation error**:
```
FATAL ERROR: AlignedAlloc Allocation failed - process out of memory
FATAL: An unexpected Turbopack error occurred
```

### **Root Cause**
- **Next.js 16.0.1** enables **Turbopack by default**
- Turbopack is still **experimental** and has memory issues on Windows
- The application was trying to use both webpack config and Turbopack simultaneously

### **Solution Applied**

#### **1. Force Webpack Usage**
Updated `package.json` to explicitly use webpack:
```json
{
  "scripts": {
    "dev": "cross-env NODE_OPTIONS=--max-old-space-size=4096 next dev --webpack"
  }
}
```

#### **2. Increased Node.js Memory Limit**
- Added `NODE_OPTIONS=--max-old-space-size=4096` to give Node.js 4GB memory
- Used `cross-env` for Windows compatibility

#### **3. Fixed Next.js Configuration**
Updated `next.config.js`:
```javascript
const nextConfig = {
  // Removed experimental.turbo (invalid key)
  // Updated images.domains to images.remotePatterns
  // Optimized webpack config for development
}
```

#### **4. Environment Variables**
Added proper environment configuration in `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NODE_OPTIONS=--max-old-space-size=4096
```

---

## 🚀 **Current Status**

✅ **Working Configuration:**
- **Next.js 16.0.1** with **webpack** (not Turbopack)
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Memory**: 4GB allocated to Node.js process

✅ **Performance:**
- Startup time: ~6 seconds
- No memory crashes
- Stable development environment

---

## 🔄 **Alternative Solutions**

If you encounter similar issues in the future:

### **Option 1: Downgrade Next.js**
```bash
npm install next@15.1.0  # Use stable version
```

### **Option 2: Use Turbopack with fixes**
```bash
# If you want to try Turbopack again
npm run dev-turbo
```

### **Option 3: Adjust Memory Settings**
```bash
# For very large projects
NODE_OPTIONS=--max-old-space-size=8192
```

---

## 📋 **Development Commands**

```bash
# Start with webpack (stable)
npm run dev

# Start with Turbopack (experimental)
npm run dev-turbo

# Build for production
npm run build

# Start production server
npm start
```

---

## 🔍 **Debugging Tips**

### **Memory Issues:**
1. Check Task Manager for Node.js memory usage
2. Increase `--max-old-space-size` if needed
3. Use `--webpack` flag to avoid Turbopack

### **Port Conflicts:**
- Backend API runs on port 3000
- Frontend automatically uses port 3001 if 3000 is busy
- This is normal and expected behavior

### **API Connection:**
- Verify backend is running: http://localhost:3000/health
- Check API endpoints: http://localhost:3000/api
- Frontend API calls use NEXT_PUBLIC_API_URL environment variable

---

## ✅ **Success Indicators**

You know everything is working when you see:
```
✓ Ready in 6.1s
▲ Next.js 16.0.1 (webpack)
- Local: http://localhost:3001
```

The application should now load without memory errors and connect to your API backend successfully! 🎉