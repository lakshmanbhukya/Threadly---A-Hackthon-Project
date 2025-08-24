import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { Settings, Calendar, User, Save, X, Upload, Camera } from "lucide-react";
import { fetchProfile, fetchUserProfile, updateProfile } from "../lib/api";
import { toast } from "sonner";
import axios from "axios";

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  const isOwnProfile = !username || currentUser?.username === username;

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      let data;
      if (isOwnProfile) {
        data = await fetchProfile();
      } else {
        data = await fetchUserProfile(username);
      }
      setProfile(data.user);
      setEditForm({
        username: data.user.username || '',
        about: data.user.about || '',
        phone: data.user.phone || '',
        location: data.user.location || ''
      });
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const response = await updateProfile(editForm);
      setProfile(response.user);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingPicture(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await axios.post('http://localhost:3000/users/upload-profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      setProfile({ ...profile, profilePicture: response.data.profilePicture });
      toast.success('Profile picture updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setUpdating(true);
    try {
      const response = await fetch('http://localhost:3000/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Password updated successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error('Failed to update password');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-20">
        <div className="text-muted-foreground text-6xl mb-4">👤</div>
        <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
        <p className="text-muted-foreground mb-4">
          {error || "The user profile you're looking for doesn't exist."}
        </p>
        <Button onClick={() => window.history.back()} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6 mb-6">
        <div className="flex items-start space-x-6">
          <div className="relative">
            <Avatar 
              className="w-24 h-24 text-2xl"
              src={profile.profilePicture}
              fallback={profile.username?.[0]?.toUpperCase() || "U"}
            />
            {isOwnProfile && (
              <div className="absolute -bottom-2 -right-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                    disabled={uploadingPicture}
                  />
                  <div className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary-hover transition-colors">
                    {uploadingPicture ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </div>
                </label>
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {profile.username}
                </h1>
                <p className="text-muted-foreground">
                  {profile.email}
                </p>
              </div>
              {isOwnProfile && (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? <X className="h-4 w-4 mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                  >
                    Change Password
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              {profile.about && (
                <p className="text-foreground">{profile.about}</p>
              )}
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                {profile.location && (
                  <span>📍 {profile.location}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {isOwnProfile && isEditing && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <Input
                value={editForm.username}
                onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                placeholder="Username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">About</label>
              <Textarea
                value={editForm.about}
                onChange={(e) => setEditForm({...editForm, about: e.target.value})}
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <Input
                value={editForm.location}
                onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                placeholder="Your location"
              />
            </div>
            <Button type="submit" disabled={updating}>
              <Save className="h-4 w-4 mr-2" />
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Card>
      )}

      {isOwnProfile && showPasswordForm && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Current Password</label>
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                placeholder="Enter current password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                placeholder="Enter new password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                placeholder="Confirm new password"
                required
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit" disabled={updating}>
                {updating ? 'Updating...' : 'Update Password'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowPasswordForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Activity</h2>
        <div className="text-center py-8">
          <div className="text-muted-foreground text-4xl mb-2">📝</div>
          <p className="text-muted-foreground">
            No activity to show yet. Start creating threads and posts!
          </p>
        </div>
      </Card>
    </div>
  );
}