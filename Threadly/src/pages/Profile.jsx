import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Settings, Calendar, User } from "lucide-react";
import { fetchProfile, fetchUserProfile } from "../lib/api";
import { toast } from "sonner";

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
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
          <Avatar 
            className="w-24 h-24 text-2xl"
            src={profile.profilePicture}
            fallback={profile.username?.[0]?.toUpperCase() || "U"}
          />

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
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
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