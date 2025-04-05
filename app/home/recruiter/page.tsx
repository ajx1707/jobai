"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NavigationBar } from "@/components/navigation-bar";
import { Search, Briefcase, Users, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import AuthGuard from "@/components/auth-guard";
import api from "@/lib/axios";
import { useToast } from "@/components/ui/use-toast";
import { format, formatDistanceToNow } from "date-fns";

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  skills: Array<{
    name: string;
    weight: number;
  }>;
  type?: string;
  applicants?: number;
  createdAt: string;
  active?: boolean;
}

export default function RecruiterHomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await api.get('/recruiter/jobs');
        console.log('Fetched recruiter jobs:', response.data);
        setJobs(response.data.jobs || []);
      } catch (error: any) {
        console.error('Error fetching jobs:', error);
        toast({
          title: "Error",
          description: "Failed to load your job postings. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [toast]);

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return "Recently";
    }
  };

  return (
    <AuthGuard requiredRole="recruiter">
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Welcome, Recruiter!</h1>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Search posted jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Link href="/post-job">
              <Button>Post New Job</Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <p>Loading your job postings...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-10 border rounded-lg">
              <h3 className="text-xl font-medium mb-2">No jobs posted yet</h3>
              <p className="text-muted-foreground mb-4">Create your first job listing to attract candidates</p>
              <Link href="/post-job">
                <Button>Post Your First Job</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Link href={`/job/${job._id}/manage`} key={job._id}>
                  <Card className="hover:bg-accent transition-colors">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <h3 className="text-lg font-semibold">{job.title}</h3>
                            {job.active === false && (
                              <span className="ml-2 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">Inactive</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {job.location}
                            </div>
                            {job.applicants !== undefined && (
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {job.applicants} applicants
                              </div>
                            )}
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDate(job.createdAt)}
                            </div>
                          </div>
                          {job.skills && job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {job.skills.slice(0, 3).map((skill, index) => (
                                <span 
                                  key={index} 
                                  className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                                >
                                  {skill.name}
                                </span>
                              ))}
                              {job.skills.length > 3 && (
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                                  +{job.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <Button variant="outline">Manage</Button>
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
    </AuthGuard>
  );
} 