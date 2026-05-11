# Deployment Guide - Career Support Platform

## แนะนำ Combo: Vercel + Supabase (ฟรี)

### Step 1: Setup Supabase Database
1. ไปที่ https://supabase.com และสร้าง account
2. สร้าง project ใหม่
3. ไปที่ Settings > Database และ copy Connection string
4. ไปที่ Settings > API และ copy API keys

### Step 2: Setup Vercel
1. ไปที่ https://vercel.com และสร้าง account
2. Connect GitHub repository
3. Configure environment variables:
   ```
   DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=[generate-random-secret]
   ```

### Step 3: Database Migration
```bash
# ใน local machine
npx prisma migrate deploy
npx prisma db push
```

### Step 4: Deploy
1. Push code ไป GitHub
2. Vercel จะ auto-deploy
3. เช็ค deployment ที่ Vercel dashboard

## ตัวเลือกอื่นๆ

### Railway (All-in-one)
- ฟรี 500 hours/month
- PostgreSQL ฟรี 1GB
- Deploy ทั้ง frontend + backend + database ในที่เดียว

### Render + Render Database
- PostgreSQL ฟรี 90 วัน (ต้อง restart ทุก 30 วัน)
- Easy deployment สำหรับ Next.js

### Fly.io
- ฟรี 160 hours/month
- PostgreSQL ฟรี 3GB
- Global deployment

## Cost Comparison (ฟรี)

| Platform | Bandwidth | Database | Build Time | ข้อจำกัด |
|----------|-----------|----------|------------|-----------|
| Vercel | 100GB/month | ต้องจ้างนอก | Unlimited | 100 functions |
| Railway | 100GB/month | 1GB ฟรี | Unlimited | 500 hours |
| Render | 750GB/month | 90 วันฟรี | Unlimited | 750 hours |
| Fly.io | 160GB/month | 3GB ฟรี | Unlimited | 160 hours |

## แนะนำสำหรับโปรเจคนี้
**Vercel + Supabase** เพราะ:
- Next.js ทำงานได้ดีที่สุดบน Vercel
- Supabase มี PostgreSQL ฟรีที่เสถียร
- จัดการง่าย แยกส่วน frontend กับ database ชัดเจน
- Scale ได้ดีเมื่อโปรเจคโตขึ้น
