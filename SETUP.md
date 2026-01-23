# Setup Instructions

## Database Setup

1. **Konfigurasi Database**
   - Buka file `.env` di root project
   - Update `DATABASE_URL` dengan kredensial PostgreSQL Anda:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/oursee?schema=public"
   ```

2. **Generate Prisma Client & Jalankan Migration**

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

3. **Jalankan Development Server**

   ```bash
   npm run dev
   ```

4. **Akses Admin Panel**
   - Buka browser dan akses: `http://localhost:3000/admin`
   - Gunakan form untuk:
     - Menambah kategori produk
     - Upload produk dengan:
       - Product code (unique)
       - Nama produk
       - Deskripsi
       - Harga
       - Multiple images (set salah satu sebagai main/thumbnail)
       - Pilih kategori (bisa multiple)

## Features

### Database Schema

- **Product**: Menyimpan data produk dengan product code unique
- **ProductImage**: Multiple images per produk dengan flag `isMain` untuk thumbnail utama
- **Category**: Kategori produk
- **ProductCategory**: Relasi many-to-many antara Product dan Category

### API Endpoints

- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `DELETE /api/products?id={id}` - Delete product
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category

### Admin Panel Features

- Upload produk dengan multiple images
- Set main thumbnail untuk setiap produk
- Assign multiple categories ke produk
- View dan delete existing products
- Create new categories on-the-fly

### Homepage

- Products ditampilkan dari database
- Main image ditampilkan sebagai thumbnail
- Modal detail menampilkan semua images dengan navigation
- Categories ditampilkan di setiap produk card
