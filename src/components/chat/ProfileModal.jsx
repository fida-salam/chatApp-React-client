import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/userService';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { X, Camera, Loader2, Check, AlertCircle } from 'lucide-react';

export default function ProfileModal({ onClose }) {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const updateMutation = useMutation({
    mutationFn: async () => {
      let avatarUrl = user?.avatar;

      // Upload avatar first if changed
      if (avatarFile) {
        const avatarData = await userService.uploadAvatar(avatarFile);
        avatarUrl = avatarData.url || avatarData.avatar;
      }

      return userService.updateProfile({ username, email, avatar: avatarUrl });
    },
    onSuccess: (data) => {
      const updatedUser = data.user || data;
      setUser(updatedUser); // update auth store
      queryClient.invalidateQueries(['myProfile']);
      setSuccessMsg('Profile updated successfully!');
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile');
      setSuccessMsg('');
    },
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const hasChanges =
    username !== user?.username ||
    email !== user?.email ||
    avatarFile !== null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Profile Settings</CardTitle>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={
                  avatarPreview ||
                  `https://ui-avatars.com/api/?name=${user?.username}&size=96`
                }
                alt={user?.username}
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Click the camera to change photo
            </p>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>

          {/* Status messages */}
          {successMsg && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              <Check className="w-4 h-4" />
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {errorMsg}
            </div>
          )}

          {/* Save Button */}
          <Button
            onClick={() => updateMutation.mutate()}
            disabled={!hasChanges || updateMutation.isPending}
            className="w-full"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}