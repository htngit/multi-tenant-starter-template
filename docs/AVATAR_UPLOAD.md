# Avatar Upload Implementation

## Overview

Implementasi avatar upload menggunakan kombinasi Stack Auth untuk metadata dan Supabase Storage untuk penyimpanan file. Sistem ini memungkinkan user untuk mengupload, menampilkan, dan mengelola avatar mereka dengan aman.

## Architecture

### Stack Auth Integration
- **Metadata Storage**: Avatar URL dan informasi terkait disimpan di `user.clientMetadata`
- **Fields**:
  - `avatarUrl`: Public URL dari Supabase Storage
  - `avatarStoragePath`: Path file di storage bucket
  - `avatarUpdatedAt`: Timestamp terakhir update

### Supabase Storage
- **Bucket**: `user-avatars` (public bucket)
- **File Structure**: `avatars/{userId}-{timestamp}.{ext}`
- **Security**: Row Level Security (RLS) policies
- **Auto Cleanup**: Otomatis menghapus avatar lama saat upload baru

## Setup Instructions

### 1. Supabase Storage Setup

Jalankan migration untuk membuat bucket dan policies:

```bash
npx supabase db push
```

Atau jalankan manual SQL dari `supabase/migrations/20241220000001_create_avatar_storage.sql`

### 2. Environment Variables

Pastikan environment variables Supabase sudah dikonfigurasi:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Bucket Configuration

Bucket `user-avatars` akan dibuat dengan konfigurasi:
- **Public**: `true` (dapat diakses publik)
- **File Size Limit**: 2MB
- **Allowed MIME Types**: `image/jpeg`, `image/png`, `image/gif`

## Implementation Details

### Frontend Components

#### UserSettingsDialog
- **File Selection**: Input file dengan validasi format dan ukuran
- **Preview**: Menampilkan preview sebelum upload
- **Upload Progress**: Loading state dengan spinner
- **Error Handling**: Toast notifications untuk error

#### AppSidebar
- **Avatar Display**: Menggunakan avatar dari metadata atau fallback ke profileImageUrl
- **Consistent Display**: Sama dengan UserSettingsDialog

### Key Functions

#### `handleAvatarSelect()`
```typescript
// Validasi file type dan size
// Buat preview image
// Trigger upload process
```

#### `handleAvatarUpload()`
```typescript
// Upload ke Supabase Storage
// Generate public URL
// Update Stack Auth metadata
// Cleanup dan error handling
```

#### `getAvatarUrl()`
```typescript
// Priority: metadata.avatarUrl > profileImageUrl > empty
```

### Security Features

#### Row Level Security (RLS)
- **Upload**: User hanya bisa upload ke folder mereka sendiri
- **Update**: User hanya bisa update file mereka sendiri
- **Delete**: User hanya bisa delete file mereka sendiri
- **Read**: Semua orang bisa melihat avatar (public)

#### File Validation
- **Format**: JPG, PNG, GIF only
- **Size**: Maximum 2MB
- **Naming**: Unique filename dengan user ID dan timestamp

#### Auto Cleanup
- **Trigger**: Otomatis menghapus avatar lama saat upload baru
- **Storage Optimization**: Mencegah akumulasi file tidak terpakai

## Usage Examples

### Upload Avatar
1. User klik "Ubah Foto" di Profile Settings
2. Pilih file dari device
3. Sistem validasi format dan ukuran
4. Preview ditampilkan
5. File diupload ke Supabase Storage
6. Metadata diupdate di Stack Auth
7. Avatar baru ditampilkan di UI

### Display Avatar
```typescript
// Di komponen manapun
const getAvatarUrl = () => {
  return user?.clientMetadata?.avatarUrl || user?.profileImageUrl || ''
}

<Avatar>
  <AvatarImage src={getAvatarUrl()} />
  <AvatarFallback>{getUserInitials()}</AvatarFallback>
</Avatar>
```

## Error Handling

### Common Errors
- **File too large**: "Ukuran file terlalu besar. Maksimal 2MB."
- **Invalid format**: "Format file tidak didukung. Gunakan JPG, PNG, atau GIF."
- **Upload failed**: "Gagal mengupload avatar. Silakan coba lagi."
- **Network error**: Automatic retry atau manual retry

### Debugging
- Check browser console untuk error details
- Verify Supabase bucket permissions
- Check Stack Auth metadata update
- Validate file format dan size

## Performance Considerations

### Optimization
- **Lazy Loading**: Avatar dimuat saat diperlukan
- **Caching**: Browser cache untuk public URLs
- **Compression**: Client-side image compression (future enhancement)

### Monitoring
- **Storage Usage**: Monitor bucket size
- **Upload Success Rate**: Track upload failures
- **Performance Metrics**: Upload time dan file sizes

## Future Enhancements

### Planned Features
1. **Image Cropping**: Built-in crop tool
2. **Multiple Formats**: WebP support
3. **Compression**: Automatic image optimization
4. **CDN Integration**: CloudFront atau similar
5. **Batch Operations**: Multiple avatar management

### Technical Improvements
1. **Progressive Upload**: Chunked upload untuk file besar
2. **Offline Support**: Queue upload saat offline
3. **Image Processing**: Server-side resize dan optimization
4. **Analytics**: Upload metrics dan user behavior

## Troubleshooting

### Common Issues

#### Avatar tidak muncul
- Check network connection
- Verify Supabase bucket public access
- Check browser console untuk CORS errors

#### Upload gagal
- Verify file format dan size
- Check Supabase storage quota
- Validate RLS policies

#### Metadata tidak update
- Check Stack Auth connection
- Verify user authentication
- Check clientMetadata permissions

### Support
Untuk bantuan lebih lanjut, check:
- Supabase Dashboard untuk storage logs
- Stack Auth Dashboard untuk user metadata
- Browser DevTools untuk network errors