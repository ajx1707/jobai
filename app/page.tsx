import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BriefcaseIcon } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="flex items-center space-x-2">
            <BriefcaseIcon className="h-12 w-12" />
            <h1 className="text-4xl font-bold">JobMatch AI</h1>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-2xl">
            Your AI-powered career partner. Find the perfect job match and optimize your resume with our advanced AI screening technology.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle>Smart Matching</CardTitle>
                <CardDescription>AI-powered job recommendations based on your skills and experience</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resume Analysis</CardTitle>
                <CardDescription>Get instant feedback on how well your resume matches job requirements</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Direct Connect</CardTitle>
                <CardDescription>Message recruiters and track your application status in real-time</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="flex gap-4">
            <Link href="/login">
              <Button size="lg">Login</Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline">Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}