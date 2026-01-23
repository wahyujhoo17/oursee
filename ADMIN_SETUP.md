# Admin Panel Setup - Enhanced Version

## ✨ Installed Packages

### UI & Forms

- **Shadcn/ui** - Modern, customizable UI components
- **React Hook Form** - Form validation & management
- **Zod** - Type-safe schema validation

### File Upload

- **Uploadthing** - Cloud file upload (free 2GB)

### Notifications

- **Sonner** - Beautiful toast notifications

### Data Fetching

- **TanStack Query** - Server state management

## 🚀 Setup Steps

### 1. Get Uploadthing API Key

1. Visit https://uploadthing.com/dashboard
2. Sign up/Login dengan GitHub account
3. Create new app
4. Copy your `UPLOADTHING_TOKEN`
5. Paste ke file `.env`:
   ```
   UPLOADTHING_TOKEN="your_uploadthing_token_here"
   ```

### 2. Generate Prisma Client & Run Migration

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Access Admin Panel

- URL: `http://localhost:3000/admin`

## 🎨 Features

### Enhanced UI

- Modern gradient background
- Card-based layout
- Professional Shadcn/ui components
- Responsive design

### Form Validation

- Real-time validation dengan Zod
- Error messages yang jelas
- Required field indicators
- Type-safe form handling

### Image Upload

- Drag & drop upload via Uploadthing
- Multiple images support
- Set main thumbnail dengan satu klik
- Image preview
- Progress indicators

### Toast Notifications

- Success notifications
- Error handling
- Non-blocking UI
- Auto-dismiss

### Product Management

- Create products dengan validation
- Upload multiple images
- Assign multiple categories
- Set main thumbnail
- Delete products dengan confirmation

### Category Management

- Create categories on-the-fly
- Slug validation
- Toggle categories untuk products

## 📋 Components Used

- `Button` - Actions & submissions
- `Input` - Text & number fields
- `Textarea` - Long text input
- `Card` - Content containers
- `Badge` - Category tags
- `Form` - Form wrapper dengan validation
- `Label` - Accessible labels

## 💡 Usage Tips

1. **Product Code**: Harus unique, contoh: PROD-001, FLOWER-123
2. **Image Upload**: Upload beberapa gambar sekaligus, set satu sebagai main
3. **Categories**: Buat kategori dulu sebelum assign ke product
4. **Slug Format**: Lowercase, gunakan hyphens (contoh: wedding-bouquet)

## 🔒 Security Notes

- Never commit `.env` file
- Keep `UPLOADTHING_TOKEN` secret
- Add `.env` to `.gitignore`
