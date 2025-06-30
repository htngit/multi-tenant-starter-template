"use client"

import * as React from "react"
import { useEffect } from "react"
import { useUser } from "@stackframe/stack"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import {
  User,
  Mail,
  Calendar,
  Shield,
  Palette,
  Bell,
  Lock,
  Globe,
  Smartphone,
  Key,
  Settings,
  Save,
  Camera,
  Upload,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { createClientComponentClient } from "@/lib/supabase"

interface UserSettingsDialogProps {
  children: React.ReactNode
}

/**
 * Dialog komponen untuk pengaturan personal user
 * Menampilkan informasi profil, pengaturan tema, notifikasi, keamanan, dll
 */
export function UserSettingsDialog({ children }: UserSettingsDialogProps) {
  const user = useUser()
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false)
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const supabase = createClientComponentClient()
  
  // Debug Supabase configuration on component mount
  useEffect(() => {
    console.log('🔍 Debugging Supabase Configuration:')
    console.log('Environment Variables:', {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      supabaseUrlValue: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
    })
    
    console.log('Supabase Client:', {
      hasSupabaseClient: !!supabase,
      hasStorageMethod: !!supabase?.storage,
      clientType: supabase?.constructor?.name || 'Unknown'
    })
    
    // Test basic Supabase connectivity
    const testConnection = async () => {
      try {
        console.log('🧪 Testing Supabase connection...')
        const { data, error } = await supabase.storage.listBuckets()
        if (error) {
          console.error('❌ Connection test failed:', error)
        } else {
          console.log('✅ Connection test successful. Buckets:', data?.map(b => b.name))
        }
      } catch (err) {
        console.error('💥 Connection test error:', err)
      }
    }
    
    testConnection()
  }, [])

  // State untuk form data
  const [profileData, setProfileData] = React.useState({
    displayName: user?.displayName || "",
    email: user?.primaryEmail || "",
    phone: "", // Stack Auth mungkin tidak menyediakan phone, bisa ditambahkan custom
    bio: "",
  })

  const [notificationSettings, setNotificationSettings] = React.useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    securityAlerts: true,
  })

  const [privacySettings, setPrivacySettings] = React.useState({
    profileVisibility: "team", // public, team, private
    showEmail: false,
    showLastActive: true,
  })

  // Update profile data ketika user data berubah
  React.useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        displayName: user.displayName || "",
        email: user.primaryEmail || "",
      }))
    }
  }, [user])

  /**
   * Handle avatar file selection
   */
  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format file tidak didukung. Gunakan JPG, PNG, atau GIF.')
      return
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar. Maksimal 2MB.')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload avatar
    handleAvatarUpload(file)
  }

  /**
   * Handle avatar upload to Supabase Storage and update Stack Auth metadata
   */
  const handleAvatarUpload = async (file: File) => {
    console.log('🚀 Starting avatar upload process...')
    console.log('📁 File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    })
    
    if (!user?.id) {
      console.error('❌ No user ID found')
      toast.error('User tidak ditemukan. Silakan login ulang.')
      return
    }
    
    console.log('👤 User context:', {
      userId: user.id,
      email: user.primaryEmail,
      hasClientMetadata: !!user.clientMetadata
    })

    setIsUploadingAvatar(true)
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`
      
      console.log('📝 Generated file path:', filePath)
      console.log('🔧 Supabase client status:', {
        hasSupabase: !!supabase,
        hasStorage: !!supabase?.storage
      })

      // Check if bucket exists and is accessible
      console.log('🪣 Checking bucket access...')
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
      
      if (bucketError) {
        console.error('❌ Bucket list error:', bucketError)
        throw new Error(`Bucket access error: ${bucketError.message}`)
      }
      
      console.log('📋 Available buckets:', buckets?.map(b => b.name))
      const userAvatarsBucket = buckets?.find(b => b.name === 'user-avatars')
      
      if (!userAvatarsBucket) {
        console.error('❌ user-avatars bucket not found')
        throw new Error('Storage bucket tidak ditemukan. Silakan hubungi administrator.')
      }
      
      console.log('✅ Bucket found:', userAvatarsBucket)

      // Upload to Supabase Storage
      console.log('⬆️ Starting file upload...')
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      console.log('📤 Upload result:', { uploadData, uploadError })

      if (uploadError) {
        console.error('❌ Upload error details:', {
          message: uploadError.message,
          statusCode: uploadError.statusCode,
          error: uploadError.error
        })
        throw uploadError
      }

      console.log('✅ File uploaded successfully:', uploadData)

      // Get public URL
      console.log('🔗 Getting public URL...')
      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath)
        
      console.log('🌐 Public URL generated:', publicUrl)

      // Update Stack Auth user metadata
      console.log('👤 Updating Stack Auth metadata...')
      const metadataUpdate = {
        clientMetadata: {
          ...user.clientMetadata,
          avatarUrl: publicUrl,
          avatarStoragePath: filePath,
          avatarUpdatedAt: new Date().toISOString()
        }
      }
      
      console.log('📝 Metadata to update:', metadataUpdate)
      
      await user.update(metadataUpdate)
      
      console.log('✅ Stack Auth metadata updated successfully')

      toast.success('Avatar berhasil diperbarui!')
      setAvatarPreview(null)
    } catch (error: any) {
      console.error('💥 Avatar upload error occurred:')
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      console.error('Error message:', error?.message)
      console.error('Error stack:', error?.stack)
      console.error('Full error object:', error)
      
      // More specific error handling
      let errorMessage = 'Gagal mengupload avatar. Silakan coba lagi.'
      
      if (error?.message?.includes('bucket')) {
        errorMessage = 'Storage bucket tidak tersedia. Silakan hubungi administrator.'
      } else if (error?.message?.includes('permission') || error?.message?.includes('unauthorized')) {
        errorMessage = 'Tidak memiliki izin untuk mengupload. Silakan login ulang.'
      } else if (error?.message?.includes('size') || error?.message?.includes('too large')) {
        errorMessage = 'File terlalu besar. Maksimal 2MB.'
      } else if (error?.message?.includes('format') || error?.message?.includes('type')) {
        errorMessage = 'Format file tidak didukung. Gunakan JPG, PNG, atau GIF.'
      } else if (error?.statusCode === 413) {
        errorMessage = 'File terlalu besar. Maksimal 2MB.'
      } else if (error?.statusCode === 401 || error?.statusCode === 403) {
        errorMessage = 'Tidak memiliki izin akses. Silakan login ulang.'
      }
      
      toast.error(errorMessage)
      setAvatarPreview(null)
    } finally {
      setIsUploadingAvatar(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      console.log('🏁 Avatar upload process completed')
    }
  }

  /**
   * Get avatar URL from Stack Auth metadata or fallback to profileImageUrl
   */
  const getAvatarUrl = () => {
    return user?.clientMetadata?.avatarUrl || user?.profileImageUrl || ''
  }

  /**
   * Handle save profile changes
   */
  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      // Update user profile via Stack Auth
      await user?.update({
        displayName: profileData.displayName,
        clientMetadata: {
          ...user.clientMetadata,
          phone: profileData.phone,
          bio: profileData.bio,
          profileUpdatedAt: new Date().toISOString()
        }
      })
      
      toast.success("Profil berhasil diperbarui")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Gagal memperbarui profil")
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle theme change
   */
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    toast.success(`Tema berhasil diubah ke ${newTheme === 'dark' ? 'gelap' : newTheme === 'light' ? 'terang' : 'sistem'}`)
  }

  /**
   * Get user initials for avatar fallback
   */
  const getUserInitials = () => {
    if (!user?.displayName) return "U"
    return user.displayName
      .split(" ")
      .map(name => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  /**
   * Format date untuk display
   */
  const formatDate = (date: Date | null) => {
    if (!date) return "Tidak diketahui"
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (!user) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Pengaturan Personal
          </DialogTitle>
          <DialogDescription>
            Kelola profil, preferensi, dan pengaturan keamanan akun Anda
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="appearance">Tampilan</TabsTrigger>
            <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
            <TabsTrigger value="security">Keamanan</TabsTrigger>
            <TabsTrigger value="privacy">Privasi</TabsTrigger>
          </TabsList>

          {/* Tab Profil */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Profil
                </CardTitle>
                <CardDescription>
                  Kelola informasi dasar profil Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage 
                        src={avatarPreview || getAvatarUrl()} 
                        alt={user.displayName || "User"} 
                      />
                      <AvatarFallback className="text-lg">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleAvatarSelect}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                    >
                      {isUploadingAvatar ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Mengupload...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4" />
                          Ubah Foto
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG atau GIF. Maksimal 2MB.
                    </p>
                    {user?.clientMetadata?.avatarUpdatedAt && (
                      <p className="text-xs text-muted-foreground">
                        Terakhir diperbarui: {new Date(user.clientMetadata.avatarUpdatedAt).toLocaleDateString('id-ID')}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nama Lengkap</Label>
                    <Input
                      id="displayName"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email tidak dapat diubah. Hubungi admin untuk perubahan.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+62 xxx-xxxx-xxxx"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status Akun</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Aktif
                      </Badge>
                      {user.hasVerifiedEmail && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          Email Terverifikasi
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    className="w-full min-h-[80px] px-3 py-2 border border-input bg-background rounded-md text-sm"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Ceritakan sedikit tentang diri Anda..."
                  />
                </div>

                {/* Account Info */}
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Bergabung:</span>
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Terakhir aktif:</span>
                    <span>{formatDate(user.lastActiveAt)}</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={isLoading} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Tampilan */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Pengaturan Tampilan
                </CardTitle>
                <CardDescription>
                  Sesuaikan tampilan aplikasi sesuai preferensi Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Tema</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      onClick={() => handleThemeChange("light")}
                      className="h-20 flex-col gap-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200" />
                      Terang
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      onClick={() => handleThemeChange("dark")}
                      className="h-20 flex-col gap-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-900 border-2 border-gray-700" />
                      Gelap
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      onClick={() => handleThemeChange("system")}
                      className="h-20 flex-col gap-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-white to-gray-900 border-2 border-gray-400" />
                      Sistem
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>Preferensi Lainnya</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Animasi Reduced Motion</p>
                        <p className="text-sm text-muted-foreground">Kurangi animasi untuk performa lebih baik</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Sidebar Compact</p>
                        <p className="text-sm text-muted-foreground">Tampilkan sidebar dalam mode compact</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Notifikasi */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Pengaturan Notifikasi
                </CardTitle>
                <CardDescription>
                  Kelola bagaimana Anda menerima notifikasi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notifikasi Email</p>
                      <p className="text-sm text-muted-foreground">Terima notifikasi melalui email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notifikasi Push</p>
                      <p className="text-sm text-muted-foreground">Terima notifikasi push di browser</p>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Marketing</p>
                      <p className="text-sm text-muted-foreground">Terima email tentang fitur baru dan tips</p>
                    </div>
                    <Switch
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Alert Keamanan</p>
                      <p className="text-sm text-muted-foreground">Notifikasi untuk aktivitas keamanan penting</p>
                    </div>
                    <Switch
                      checked={notificationSettings.securityAlerts}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, securityAlerts: checked }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Keamanan */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Pengaturan Keamanan
                </CardTitle>
                <CardDescription>
                  Kelola keamanan akun dan autentikasi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Password</p>
                        <p className="text-sm text-muted-foreground">Terakhir diubah 30 hari yang lalu</p>
                      </div>
                    </div>
                    <Button variant="outline">Ubah Password</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Tambahan keamanan untuk akun Anda</p>
                      </div>
                    </div>
                    <Button variant="outline">Setup 2FA</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Sesi Aktif</p>
                        <p className="text-sm text-muted-foreground">Kelola perangkat yang terhubung</p>
                      </div>
                    </div>
                    <Button variant="outline">Lihat Sesi</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Privasi */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Pengaturan Privasi
                </CardTitle>
                <CardDescription>
                  Kontrol siapa yang dapat melihat informasi Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Tampilkan Email</p>
                      <p className="text-sm text-muted-foreground">Email Anda akan terlihat oleh anggota tim</p>
                    </div>
                    <Switch
                      checked={privacySettings.showEmail}
                      onCheckedChange={(checked) => 
                        setPrivacySettings(prev => ({ ...prev, showEmail: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Tampilkan Status Aktif</p>
                      <p className="text-sm text-muted-foreground">Anggota tim dapat melihat kapan Anda terakhir aktif</p>
                    </div>
                    <Switch
                      checked={privacySettings.showLastActive}
                      onCheckedChange={(checked) => 
                        setPrivacySettings(prev => ({ ...prev, showLastActive: checked }))
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>Data & Export</Label>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      Download Data Saya
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                      Hapus Akun
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}