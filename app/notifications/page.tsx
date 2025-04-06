"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent } from "@/components/ui/card";
import { NavigationBar } from "@/components/navigation-bar";
import { Bell, CheckCircle, XCircle, User } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";

interface Notification {
  id: string;
  type: "application" | "status";
  jobTitle: string;
  company: string;
  status?: "accepted" | "rejected" | "pending";
  jobId: string;
  applicant?: {
    name: string;
    matchScore: number;
  };
  timestamp: string;
  timestamp_readable?: string;
  read: boolean;
}

// Fallback mock notifications if API fails
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "application",
    jobTitle: "Senior Frontend Developer",
    company: "Tech Corp",
    jobId: "1",
    applicant: {
      name: "John Doe",
      matchScore: 85,
    },
    timestamp: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "status",
    jobTitle: "Full Stack Developer",
    company: "Innovation Labs",
    jobId: "2",
    status: "accepted",
    timestamp: "1 day ago",
    read: false,
  },
];

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching notifications...');
        
        const response = await api.get('/notifications');
        console.log('Notifications API response:', response);
        
        if (response.data && response.data.notifications) {
          console.log('Received notifications:', response.data.notifications);
          setNotifications(response.data.notifications);
        } else {
          // Fallback to mock data if API response is not structured as expected
          console.warn('Unexpected API response structure:', response.data);
          setNotifications(mockNotifications);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again later.');
        // Fallback to mock data
        setNotifications(mockNotifications);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center p-6 bg-red-50 rounded-lg text-red-800">
            <p>{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-10">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
            <p className="text-muted-foreground">
              You will receive notifications about your job applications and other updates here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href={notification.type === "application" 
                  ? {pathname: `/applications/${notification.jobId || notification.id}`}
                  : {pathname: `/job/${notification.jobId || notification.id}`}
                }
              >
                <Card className="hover:bg-accent transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        {notification.type === "application" ? (
                          <User className="h-5 w-5" />
                        ) : notification.status === "accepted" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : notification.status === "rejected" ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Bell className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">
                              {notification.type === "application"
                                ? `New application for ${notification.jobTitle || "Job"}`
                                : `Application ${notification.status || "updated"} for ${notification.jobTitle || "Job"}`}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {notification.company || ""}
                            </p>
                            {notification.applicant && (
                              <p className="text-sm mt-2">
                                Applicant: {notification.applicant.name} (
                                {notification.applicant.matchScore}% match)
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {notification.timestamp_readable || notification.timestamp || ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      <NavigationBar />
    </div>
  );
}