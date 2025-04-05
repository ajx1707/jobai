"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NavigationBar } from "@/components/navigation-bar";
import { ExternalLink, Sparkles, UserIcon, BookOpen } from "lucide-react";

interface Course {
  title: string;
  platform: string;
  url: string;
}

interface SkillRecommendation {
  skill: string;
  why: string;
  courses: Course[];
}

export default function SuggestionsPage() {
  const [recommendations, setRecommendations] = useState<SkillRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumeUploaded, setResumeUploaded] = useState(false);

  // Check localStorage on component mount
  useEffect(() => {
    // Check if we have stored skill recommendations
    const storedRecommendations = localStorage.getItem('skillRecommendations');
    if (storedRecommendations) {
      try {
        setRecommendations(JSON.parse(storedRecommendations));
        setResumeUploaded(true);
      } catch (e) {
        console.error("Error parsing stored recommendations:", e);
      }
    }
    
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto p-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Skill Development Suggestions
            </CardTitle>
            <CardDescription>
              Personalized recommendations to enhance your career prospects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading recommendations...</p>
              </div>
            ) : !resumeUploaded ? (
              <div className="text-center py-12 space-y-4">
                <UserIcon className="h-16 w-16 mx-auto text-muted-foreground" />
                <h3 className="text-xl font-semibold">No Resume Analyzed Yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  To get personalized skill development suggestions, please upload your resume in the AI Resume Analyzer section.
                </p>
                <Button className="mt-4" asChild>
                  <a href="/ai-resume">Go to AI Resume Analyzer</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {recommendations.length === 0 ? (
                  <div className="text-center py-12">
                    <p>No skill recommendations available yet. Try analyzing your resume again.</p>
                  </div>
                ) : (
                  recommendations.map((recommendation, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="bg-primary h-2"></div>
                      <CardHeader>
                        <CardTitle className="text-xl">{recommendation.skill}</CardTitle>
                        <CardDescription>{recommendation.why}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <h4 className="font-medium flex items-center mb-3">
                          <BookOpen className="h-4 w-4 mr-2" /> 
                          Recommended Learning Resources
                        </h4>
                        <div className="space-y-3">
                          {recommendation.courses.map((course, courseIndex) => (
                            <a 
                              key={courseIndex} 
                              href={course.url} 
                              target="_blank"
                              rel="noopener noreferrer" 
                              className="flex items-start justify-between p-3 border rounded-md hover:bg-muted transition-colors"
                            >
                              <div>
                                <div className="font-medium">{course.title}</div>
                                <div className="text-sm text-muted-foreground">{course.platform}</div>
                              </div>
                              <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            </a>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <NavigationBar />
    </div>
  );
} 