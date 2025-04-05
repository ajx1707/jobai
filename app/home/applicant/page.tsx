"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { NavigationBar } from "@/components/navigation-bar";
import { Search, Briefcase, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import AuthGuard from "@/components/auth-guard";
import api from "@/lib/axios";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";

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
  createdAt: string;
  active?: boolean;
}

export default function ApplicantHomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await api.get('/jobs');
        console.log('Fetched jobs:', response.data);
        setJobs(response.data.jobs || []);
      } catch (error: any) {
        console.error('Error fetching jobs:', error);
        toast({
          title: "Error",
          description: "Failed to load job listings. Please try again.",
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
    job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (job.skills && job.skills.some(skill => 
      skill.name.toLowerCase().includes(searchQuery.toLowerCase())
    ))
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
    <AuthGuard requiredRole="applicant">
      <div className="min-h-screen bg-background pb-20">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Welcome, Job Seeker!</h1>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Search jobs by title, company, location or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Link href="/ai-resume">
              <Button>Optimize Resume</Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <p>Loading available jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-10 border rounded-lg">
              <h3 className="text-xl font-medium mb-2">No jobs available</h3>
              <p className="text-muted-foreground mb-4">Check back soon for new opportunities</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-10 border rounded-lg">
              <h3 className="text-xl font-medium mb-2">No matching jobs found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search criteria</p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>Clear Search</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Link href={`/job/${job._id}`} key={job._id}>
                  <Card className="hover:bg-accent transition-colors">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                            <div className="flex items-center">
                              <Briefcase className="h-4 w-4 mr-1" />
                              {job.company}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {job.location}
                            </div>
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
                        <Button variant="secondary">View Job</Button>
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