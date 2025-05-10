'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2 } from "lucide-react"

interface UserProfile {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    avatar_url?: string
    provider?: string
    picture?: string
    name?: string
  }
  profile?: {
    full_name?: string
    avatar_url?: string
  }
}

export default function AccountPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    avatar_url: '',
  })
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/profile')
        if (!response.ok) {
          throw new Error('Failed to fetch user profile')
        }
        const data = await response.json()
        setUser(data)
        
        // Use Google profile data if available
        const googleName = data.user_metadata?.name
        const googlePicture = data.user_metadata?.picture
        
        setFormData({
          full_name: googleName || data.user_metadata?.full_name || data.profile?.full_name || '',
          avatar_url: googlePicture || data.user_metadata?.avatar_url || data.profile?.avatar_url || '',
        })
      } catch (error) {
        console.error('Error fetching user:', error)
        toast.error('Failed to load profile')
      }
    }

    fetchUser()
  }, [])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${user?.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }))
      toast.success('Avatar uploaded successfully')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Failed to upload avatar')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user?.email || '', {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      toast.success('Password reset email sent')
    } catch (error) {
      console.error('Error sending password reset:', error)
      toast.error('Failed to send password reset email')
    } finally {
      setIsLoading(false)
    }
  }

  const isGoogleUser = user?.user_metadata?.provider === 'google'

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              {isGoogleUser ? 'Your Google profile information' : 'Update your account information'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={formData.avatar_url} />
                  <AvatarFallback>
                    {formData.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!isGoogleUser && (
                  <div className="space-y-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <Label
                      htmlFor="avatar-upload"
                      className="cursor-pointer"
                    >
                      <Button variant="outline" size="sm" type="button">
                        Change Avatar
                      </Button>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      JPG, GIF or PNG. Max size of 800K
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter your name"
                  disabled={isGoogleUser}
                />
                {isGoogleUser && (
                  <p className="text-sm text-muted-foreground">
                    Your name is managed by your Google account
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                />
                {isGoogleUser && (
                  <p className="text-sm text-muted-foreground">
                    Your email is managed by your Google account
                  </p>
                )}
              </div>
              {!isGoogleUser && (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isGoogleUser && (
              <div className="space-y-2">
                <Label>Password</Label>
                <Button
                  variant="outline"
                  onClick={handleChangePassword}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </div>
            )}
            <div className="space-y-2">
              <Label>Two-Factor Authentication</Label>
              <Button variant="outline" disabled>
                Enable 2FA
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 