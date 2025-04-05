"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NavigationBar } from "@/components/navigation-bar";
import { Plus, Minus, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/axios";
import AuthGuard from "@/components/auth-guard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

interface Education {
  degree: string;
  institution: string;
  year: string;
}

interface Profile {
  userId?: string;
  name: string;
  email: string;
  location: string;
  bio: string;
  profileImage?: string;
  experiences: Experience[];
  education: Education[];
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: user?.email || "",
    location: "",
    bio: "",
    profileImage: "",
    experiences: [],
    education: []
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch profile data on component mount
  useEffect(() => {
    if (user) {
      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No authentication token found!");
        toast({
          title: "Authentication Error",
          description: "You are not logged in. Redirecting to login page...",
          variant: "destructive"
        });
        
        // Redirect to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }
      
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      console.log("Fetching profile data");
      // Let axios interceptor handle the token
      const response = await api.get('/profile');
      console.log("Profile data received:", response.data);
      setProfile(response.data);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      if (error.response?.status === 422 || error.response?.status === 401) {
        // Token might be invalid - try to refresh or redirect to login
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please login again.",
          variant: "destructive"
        });
        // You might want to redirect to login here
      } else {
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      console.log("Preparing profile data for save");
      
      // Create a copy of the profile without the image for logging
      const profileForLogging = {
        ...profile,
        profileImage: profile.profileImage ? '[IMAGE DATA]' : '',
      };
      console.log("Profile data (without image):", profileForLogging);
      
      // Create a clean profile object to save
      const profileToSave: Profile = {
        userId: profile.userId,
        name: profile.name || '',
        email: profile.email || '',
        location: profile.location || '',
        bio: profile.bio || '',
        profileImage: '',  // Initialize with empty string
        experiences: Array.isArray(profile.experiences) ? profile.experiences : [],
        education: Array.isArray(profile.education) ? profile.education : [],
      };
      
      // Handle the profile image - check its size
      if (profile.profileImage) {
        // Check image size - if it's too large, we might need to compress it
        if (profile.profileImage.length > 1000000) {
          console.log("Image is large, considering compression");
          // For now, we'll still include it but in future we could implement compression
        }
        profileToSave.profileImage = profile.profileImage;
      }
      
      // Make API request - let axios interceptor handle the token
      console.log("Making API request to update profile");
      const saveResponse = await api.post('/profile', profileToSave);
      
      console.log("Profile saved successfully:", saveResponse.status);
      console.log("Response data:", saveResponse.data);
      
      toast({
        title: "Success",
        description: "Profile saved successfully!",
      });
      
      // Refresh profile data
      await fetchProfile();
    } catch (error: any) {
      console.error("Error saving profile:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      if (error.response?.status === 422 || error.response?.status === 401) {
        // Token might be invalid
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please login again.",
          variant: "destructive"
        });
        // You might want to redirect to login here
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.error || "Failed to save profile data. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddExperience = () => {
    setProfile({
      ...profile,
      experiences: [
        ...profile.experiences,
        { title: "", company: "", duration: "", description: "" }
      ]
    });
  };

  const handleAddEducation = () => {
    setProfile({
      ...profile,
      education: [
        ...profile.education,
        { degree: "", institution: "", year: "" }
      ]
    });
  };

  const handleRemoveExperience = (index: number) => {
    setProfile({
      ...profile,
      experiences: profile.experiences.filter((_, i) => i !== index)
    });
  };

  const handleRemoveEducation = (index: number) => {
    setProfile({
      ...profile,
      education: profile.education.filter((_, i) => i !== index)
    });
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const newExperiences = [...profile.experiences];
    newExperiences[index] = {
      ...newExperiences[index],
      [field]: value
    };
    setProfile({
      ...profile,
      experiences: newExperiences
    });
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const newEducation = [...profile.education];
    newEducation[index] = {
      ...newEducation[index],
      [field]: value
    };
    setProfile({
      ...profile,
      education: newEducation
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image file size is too large. Please select an image under 5MB.",
        variant: "destructive"
      });
      return;
    }

    // For now, create a preview URL for the image
    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);
    
    // Use FileReader to convert the image to a Data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        const result = reader.result as string;
        
        // Optionally compress the image if it's still large
        if (result.length > 1000000) {
          console.log("Image is large, consider implementing compression");
        }
        
        setProfile({
          ...profile,
          profileImage: result
        });
      } catch (error) {
        console.error("Error processing image:", error);
        toast({
          title: "Error",
          description: "Failed to process the image. Please try another image.",
          variant: "destructive"
        });
      }
    };
    
    reader.onerror = () => {
      console.error("Error reading file");
      toast({
        title: "Error",
        description: "Failed to read the image file. Please try again.",
        variant: "destructive"
      });
    };
    
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-4xl mx-auto p-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <Avatar className="h-24 w-24">
                      {(imagePreview || profile.profileImage) ? (
                        <AvatarImage src={imagePreview || profile.profileImage} alt={profile.name} />
                      ) : (
                        <AvatarFallback>{profile.name?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <label 
                      htmlFor="profile-image" 
                      className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer"
                    >
                      <Upload className="h-4 w-4" />
                      <span className="sr-only">Upload profile image</span>
                    </label>
                    <Input 
                      id="profile-image" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <Input 
                    placeholder="Full Name" 
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                  <Input 
                    placeholder="Email" 
                    value={profile.email} 
                    disabled 
                  />
                  <Input 
                    placeholder="Location" 
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  />
                  <Textarea 
                    placeholder="Bio" 
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Experience</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddExperience}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.experiences.map((exp, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-lg">
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveExperience(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input 
                        placeholder="Job Title" 
                        value={exp.title}
                        onChange={(e) => updateExperience(index, "title", e.target.value)}
                      />
                      <Input 
                        placeholder="Company" 
                        value={exp.company}
                        onChange={(e) => updateExperience(index, "company", e.target.value)}
                      />
                      <Input 
                        placeholder="Duration" 
                        value={exp.duration}
                        onChange={(e) => updateExperience(index, "duration", e.target.value)}
                      />
                      <Textarea 
                        placeholder="Description" 
                        value={exp.description}
                        onChange={(e) => updateExperience(index, "description", e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Education</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddEducation}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-lg">
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveEducation(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input 
                        placeholder="Degree" 
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, "degree", e.target.value)}
                      />
                      <Input 
                        placeholder="Institution" 
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, "institution", e.target.value)}
                      />
                      <Input 
                        placeholder="Year" 
                        value={edu.year}
                        onChange={(e) => updateEducation(index, "year", e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button className="w-full" onClick={handleSaveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>
        <NavigationBar />
      </div>
    </AuthGuard>
  );
}