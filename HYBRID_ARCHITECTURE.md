# Hybrid Backend Architecture

## Overview

This project uses a **hybrid architecture** that combines:

1. **Direct Supabase Calls** - Fast, realtime-enabled database access
2. **Express Backend API** - Server-side logic, authentication, complex operations

## When to Use Each Approach

### Use Direct Supabase (Default)

**Best for:**
- ✅ Simple CRUD operations
- ✅ Realtime subscriptions
- ✅ Quick data fetching
- ✅ Client-side filtering/sorting
- ✅ Reads that don't require server logic

**Location:** `lib/database.ts` and `lib/api.ts`

### Use Express Backend

**Best for:**
- ✅ Complex business logic
- ✅ Server-side validation
- ✅ Aggregated/computed data
- ✅ Operations requiring multiple database calls
- ✅ Sensitive operations requiring server-side security
- ✅ Third-party API integrations
- ✅ Email/notification sending
- ✅ File processing
- ✅ Rate limiting per user

**Location:** `backend/src/api/`

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐              ┌─────────────────────┐   │
│  │  lib/supabase   │              │     lib/api.ts      │   │
│  │  (Direct calls) │              │   (Hybrid client)   │   │
│  └────────┬────────┘              └──────────┬──────────┘   │
│           │                                  │               │
│           │ Fast Path                        │ Flexible Path │
│           │                                  │               │
└───────────┼──────────────────────────────────┼───────────────┘
            │                                  │
            │                                  │
            ▼                                  ▼
┌───────────────────────┐         ┌────────────────────────────┐
│                       │         │     Express Backend        │
│      Supabase         │◀────────│      (Port 3001)           │
│    (PostgreSQL +      │         ├────────────────────────────┤
│     Realtime)         │         │  GET  /api/admin/students  │
│                       │         │  POST /api/admin/students  │
└───────────────────────┘         │  PUT  /api/admin/fees/:id  │
                                  │  etc...                    │
                                  └────────────────────────────┘
```

---

## API Endpoints

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get dashboard statistics |
| GET | `/students` | Get all students |
| GET | `/students/:id` | Get student by ID |
| POST | `/students` | Create student |
| PUT | `/students/:id` | Update student |
| DELETE | `/students/:id` | Delete student |
| GET | `/teachers` | Get all teachers |
| GET | `/teachers/:id` | Get teacher by ID |
| POST | `/teachers` | Create teacher |
| PUT | `/teachers/:id` | Update teacher |
| DELETE | `/teachers/:id` | Delete teacher |
| GET | `/parents` | Get all parents |
| GET | `/fees` | Get all fees |
| PUT | `/fees/:id/status` | Update fee status |
| GET | `/notices` | Get all notices |
| POST | `/notices` | Create notice |
| DELETE | `/notices/:id` | Delete notice |
| GET | `/attendance` | Get attendance by class/date |
| POST | `/attendance` | Save attendance records |

---

## Usage Examples

### Frontend - Using Hybrid API Client

```typescript
import { api } from '../lib/api';

// Method 1: Direct Supabase (default - faster)
const students = await api.getStudents();

// Method 2: Via Express Backend (more control)
const students = await api.getStudents({ useBackend: true });

// Realtime subscriptions (Supabase only)
api.subscribeToStudents((payload) => {
    console.log('Change:', payload);
    refreshStudentList();
});
```

### Backend - Adding New Features

```typescript
// backend/src/api/controllers/admin.controller.ts

export const complexOperation = async (req, res) => {
    try {
        // 1. Validate input
        const { studentId, amount } = req.body;
        
        // 2. Complex business logic
        const student = await SupabaseService.getStudentById(studentId);
        const hasPermission = await checkPermissions(req.user, student);
        
        // 3. Multiple database operations
        await SupabaseService.updateFeeStatus(feeId, 'Paid', amount);
        await SupabaseService.createAuditLog(req.user, 'fee_payment', { studentId, amount });
        await sendPaymentConfirmationEmail(student.email);
        
        // 4. Return result
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

---

## Running Both Services

### Development Mode

```bash
# Terminal 1: Frontend (Vite)
npm run dev
# Runs on http://localhost:3000

# Terminal 2: Backend (Express)
cd backend
npm run dev
# Runs on http://localhost:3001
```

### Production Mode

```bash
# Build frontend
npm run build

# Build backend
cd backend
npm run build

# Run backend
npm start

# Deploy frontend dist/ to CDN/static hosting
```

---

## Environment Variables

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001/api
```

### Backend (.env)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
PORT=3001
JWT_SECRET=your-jwt-secret
```

---

## Files Structure

```
school-app/
├── lib/
│   ├── supabase.ts        # Direct Supabase client
│   ├── database.ts        # Direct Supabase operations
│   └── api.ts             # Hybrid API client (NEW)
│
├── backend/
│   └── src/
│       ├── server.ts      # Express server entry
│       └── api/
│           ├── controllers/
│           │   ├── admin.controller.ts  # Admin operations
│           │   └── ...
│           ├── services/
│           │   ├── supabase.service.ts  # Backend Supabase (NEW)
│           │   └── ...
│           ├── routes/
│           │   ├── admin.routes.ts      # Admin API routes
│           │   └── ...
│           └── middleware/
│               └── auth.middleware.ts
```

---

## Recommendations

### For Your Current Stage

1. **Use Direct Supabase** for most operations (already implemented)
2. **Use Express Backend** when you need:
   - Server-side validation
   - Complex workflows
   - Email/SMS notifications
   - Third-party integrations

### Future Enhancements

1. Add JWT authentication to Express routes
2. Implement role-based access control
3. Add request validation middleware
4. Set up logging and monitoring
5. Add caching layer (Redis)
6. Implement background jobs (Bull)

---

## Benefits of Hybrid Approach

| Feature | Direct Supabase | Express Backend |
|---------|-----------------|-----------------|
| Speed | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Realtime | ✅ Yes | ❌ No |
| Complex Logic | ❌ Limited | ✅ Full |
| Server Security | Row Level | Full Control |
| Third-Party APIs | ❌ No | ✅ Yes |
| Background Jobs | ❌ No | ✅ Yes |
| Scalability | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Best of Both Worlds!** 🎯
