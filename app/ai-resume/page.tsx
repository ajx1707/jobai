"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { NavigationBar } from "@/components/navigation-bar";
import { Upload, CheckCircle, XCircle, Plus, LightbulbIcon, FileText } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface SkillMatch {
  skill: string;
  score: number;
  jobMatch?: boolean;
}

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

interface AnalysisResults {
  atsScore: number;
  skillMatches: SkillMatch[];
  suggestions: string[];
  skillRecommendations: SkillRecommendation[];
  fullAnalysis?: string;
  fileName?: string;
  jobRole?: string;
  jobDescription?: string;
}

// Colors for the pie charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Custom Tooltip for skill details
const CustomTooltip = ({ active, payload, label, ...props }: any) => {
  if (active && payload && payload.length) {
    const skill = payload[0].payload; // Get the original skill data
    return (
      <div className="bg-background p-2 border rounded-md shadow-md">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-sm">{`Score: ${payload[0].value}%`}</p>
        {skill.jobMatch !== undefined && (
          <p className="text-xs mt-1">
            {skill.jobMatch ? 
              <span className="text-green-500">✓ Matches job requirements</span> : 
              <span className="text-gray-500">Not mentioned in job</span>
            }
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Custom Tooltip for ATS score details
const ATSScoreTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-2 border rounded-md shadow-md">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-sm">{`${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

// Function to get job-role-specific information
const getJobRoleInfo = (jobRole: string | undefined) => {
  const defaultInfo = {
    title: "Skills Analysis",
    description: "Key skills identified in your resume"
  };

  if (!jobRole) return defaultInfo;

  const jobRoleInfo = {
    "cloud engineer": {
      title: "Cloud Engineering Skills",
      description: "Cloud platforms, infrastructure, and deployment technologies"
    },
    "frontend developer": {
      title: "Frontend Development Skills",
      description: "UI frameworks, styling, and browser technologies"
    },
    "backend developer": {
      title: "Backend Development Skills",
      description: "Server-side technologies, APIs, and databases"
    },
    "full stack": {
      title: "Full Stack Skills",
      description: "End-to-end development technologies"
    },
    "data scientist": {
      title: "Data Science Skills",
      description: "ML/AI, data analysis, and statistical methods"
    },
    "devops": {
      title: "DevOps Skills",
      description: "CI/CD, infrastructure, and operational tools"
    },
    "UI/UX Designer": {
      title: "UI/UX Design Skills",
      description: "Design tools, prototyping, and user research"
    }
  };

  return jobRoleInfo[jobRole as keyof typeof jobRoleInfo] || defaultInfo;
};

// Format the full analysis text to remove markdown symbols and improve formatting
const formatAnalysisText = (text: string) => {
  if (!text) return '';
  
  // Remove the "ResumeChecker's Analysis:" header
  let formattedText = text.replace(/^ResumeChecker's Analysis:\s*/i, '');
  
  // Format numbered section headers
  formattedText = formattedText.replace(/(\d+)\.\s+([A-Z][A-Za-z\s]+):/g, 
    '<h3 class="text-lg font-semibold mt-6 mb-3 text-primary">$1. $2</h3>');
  
  // Format strengths and areas of improvement subsections
  formattedText = formattedText.replace(/(Strengths|Areas of Improvement|Key Points):/g, 
    '<h4 class="font-medium mt-4 mb-2 text-foreground">$1:</h4>');
  
  // Remove markdown ** bold markers
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Split into paragraphs first
  const paragraphs = formattedText.split(/\n{2,}/);
  
  // Process each paragraph
  const processedParagraphs = paragraphs.map(paragraph => {
    // Handle bullet points within paragraphs
    if (paragraph.match(/^[-*]\s+/m)) {
      const bulletItems = paragraph.split(/\n\s*[-*]\s+/).filter(Boolean);
      
      if (bulletItems.length > 0) {
        const listItems = bulletItems.map((item, i) => {
          if (i === 0 && !item.startsWith('-')) {
            // This might be a header before the list
            return `<p class="mb-2">${item}</p>`;
          }
          // Process bullet points with more space between bullet and text
          return `<li class="flex items-start mb-2">
            <span class="inline-block w-2 h-2 rounded-full bg-primary mr-3 mt-2 flex-shrink-0"></span>
            <span class="flex-1">${item.replace(/^-\s+/, '')}</span>
          </li>`;
        }).join('');
        
        return `<ul class="my-3 space-y-2">${listItems}</ul>`;
      }
    }
    
    // Format specific action items with proper indentation
    if (paragraph.includes('Tailor') || 
        paragraph.includes('Add') || 
        paragraph.includes('Include') || 
        paragraph.includes('Remove') ||
        paragraph.includes('Update') ||
        paragraph.includes('Improve')) {
      
      return `<div class="suggestion-item my-2 pl-6">${paragraph}</div>`;
    }
    
    // Regular paragraph
    return `<p class="mb-3">${paragraph}</p>`;
  });
  
  // Join processed paragraphs
  formattedText = processedParagraphs.join('');
  
  // Format ratings for consistency
  formattedText = formattedText.replace(/([A-Za-z\s]+):\s*(\d+)\/(\d+)/g, 
    '<div class="flex items-center gap-2 my-2 pl-4"><span class="font-medium">$1:</span> <span class="text-primary font-bold">$2/$3</span></div>');
  
  // Wrap everything in a container with proper padding and spacing
  formattedText = `<div class="analysis-container">${formattedText}</div>`;
  
  // Clean up any empty paragraphs
  formattedText = formattedText.replace(/<p>\s*<\/p>/g, '');
  formattedText = formattedText.replace(/<p><\/p>/g, '');
  
  return formattedText;
};

// Helper function to get ATS score message
const getATSScoreMessage = (score: number) => {
  if (score >= 80) {
    return "Excellent score! Your resume is well-optimized for ATS systems.";
  } else if (score >= 60) {
    return "Good score. Consider making a few adjustments to improve ATS compatibility.";
  } else {
    return "Your resume needs optimization for ATS systems. Consider revising your format and keywords.";
  }
};

// Helper function to get ATS score badge variant
const getATSScoreVariant = (score: number) => {
  if (score >= 80) return "default";
  if (score >= 60) return "secondary";
  return "destructive";
};

export default function AIResumePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [analysisType, setAnalysisType] = useState<string>("quick");
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  // Load previous analysis results from localStorage when component mounts
  useEffect(() => {
    try {
      const savedResults = localStorage.getItem('analysisResults');
      if (savedResults) {
        const parsedResults = JSON.parse(savedResults) as AnalysisResults;
        setResults(parsedResults);
        
        // If we have a saved file name, we can display it
        if (parsedResults.fileName) {
          // We can't restore the actual File object, but we can show the name
          console.log(`Previous analysis loaded for: ${parsedResults.fileName}`);
        }
      }
    } catch (error) {
      console.error('Error loading saved analysis:', error);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  const analyzeResume = async () => {
    if (!file) return;
    
    setAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('jobDescription', jobDescription);
      formData.append('analysisType', analysisType);
      
      const response = await fetch('http://localhost:5000/api/analyze-resume', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const resultsData: AnalysisResults = {
          atsScore: data.atsScore,
          skillMatches: data.skillMatches,
          suggestions: data.suggestions,
          skillRecommendations: data.skillRecommendations || [],
          fullAnalysis: data.fullAnalysis,
          fileName: file.name, // Save the file name for display purposes
          jobRole: data.jobRole,
          jobDescription: data.jobDescription,
        };
        
        setResults(resultsData);
        
        // Save complete analysis results to localStorage
        localStorage.setItem('analysisResults', JSON.stringify(resultsData));
        
        // Also save skill recommendations separately for the suggestions page
        localStorage.setItem('skillRecommendations', JSON.stringify(data.skillRecommendations || []));
      } else {
        throw new Error(data.error || 'Failed to analyze resume');
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Prepare ATS score data for pie chart
  const prepareAtsScoreData = () => {
    if (!results) return [];
    return [
      { name: 'Score', value: results.atsScore },
      { name: 'Remaining', value: 100 - results.atsScore },
    ];
  };

  // Prepare skills data for pie chart
  const prepareSkillsData = () => {
    if (!results) return [];
    return results.skillMatches.map(match => ({
      name: match.skill,
      value: match.score,
      jobMatch: match.jobMatch
    }));
  };

  // Custom label for the ATS score pie
  const renderCustomizedATSLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, index }: any) => {
    if (index !== 0) return null; // Only show for the main slice
    
    return (
      <text 
        x={cx} 
        y={cy} 
        textAnchor="middle" 
        dominantBaseline="central"
        className="fill-foreground font-bold"
      >
        <tspan x={cx} y={cy - 10} fontSize="24px">{`${value}%`}</tspan>
        <tspan x={cx} y={cy + 15} fontSize="12px" className="fill-muted-foreground">ATS Score</tspan>
      </text>
    );
  };

  const goToSuggestions = () => {
    router.push('/suggestions');
  };

  const startNewAnalysis = () => {
    setFile(null);
    setResults(null);
    setJobDescription("");
    setShowFullAnalysis(false);
  };

  // Prepare data for components
  const matchingSkills = results?.skillMatches?.filter(s => s.jobMatch) || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto p-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>AI Resume Analyzer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {!results ? (
                <>
                  <div className="flex items-center justify-center border-2 border-dashed border-border rounded-lg p-8">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <div className="flex flex-col items-center">
                        <Upload className="h-12 w-12 mb-4" />
                        <span className="text-lg mb-2">
                          {file ? file.name : "Upload your resume"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          PDF format only
                        </span>
                      </div>
                    </label>
                  </div>

                  {file && !analyzing && !results && (
                    <>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Job Description (Optional)
                          </label>
                          <textarea 
                            className="w-full p-2 border rounded-md" 
                            rows={4}
                            placeholder="Paste the job description for better analysis"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Analysis Type
                          </label>
                          <select 
                            className="w-full p-2 border rounded-md"
                            value={analysisType}
                            onChange={(e) => setAnalysisType(e.target.value)}
                          >
                            <option value="quick">Quick Scan</option>
                            <option value="detailed">Detailed Analysis</option>
                            <option value="ats">ATS Optimization</option>
                          </select>
                        </div>
                      </div>
                      
                      <Button
                        className="w-full"
                        onClick={analyzeResume}
                      >
                        Analyze Resume
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  {results.fileName && (
                    <div className="bg-muted p-4 rounded-md mb-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">Resume Analysis for:</h3>
                        <p className="text-sm">{results.fileName}</p>
                      </div>
                      <Button variant="outline" onClick={startNewAnalysis} size="sm">
                        Analyze Another Resume
                      </Button>
                    </div>
                  )}
                </>
              )}

              {analyzing && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Analyzing your resume...</p>
                </div>
              )}

              {results && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ATS Score */}
                    {results.atsScore !== undefined && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">ATS Compatibility Score</h3>
                        <div className="bg-muted p-4 rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">ATS Compatibility</span>
                            <Badge variant={getATSScoreVariant(results.atsScore)}>
                              {results.atsScore}%
                            </Badge>
                          </div>
                          
                          <div className="relative h-4 rounded-full bg-background overflow-hidden">
                            <div 
                              className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all shadow-[0_0_8px_rgba(0,0,0,0.1)]"
                              style={{ width: `${results.atsScore}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                            </div>
                          </div>
                          
                          <div className="mt-3 text-sm text-muted-foreground">
                            {getATSScoreMessage(results.atsScore)}
                          </div>
                        </div>
                        
                        {/* ATS Score Chart */}
                        <div className="mt-4 bg-muted p-4 rounded-md">
                          <h3 className="text-lg font-semibold mb-2 text-center">ATS Score Visualization</h3>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={prepareAtsScoreData()}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  paddingAngle={5}
                                  dataKey="value"
                                  labelLine={false}
                                  label={renderCustomizedATSLabel}
                                >
                                  <Cell key={`cell-0`} fill="hsl(var(--primary))" />
                                  <Cell key={`cell-1`} fill="hsl(var(--secondary))" />
                                </Pie>
                                <Tooltip content={<ATSScoreTooltip />} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Skills Pie Chart */}
                    <div className="bg-muted p-4 rounded-md">
                      <h3 className="text-lg font-semibold mb-2 text-center">
                        {results.jobRole ? `${getJobRoleInfo(results.jobRole).title}` : "Skill Matches"}
                      </h3>
                      {results.jobRole && (
                        <p className="text-sm text-center text-muted-foreground mb-4">
                          {getJobRoleInfo(results.jobRole).description}
                        </p>
                      )}
                      
                      {/* Job match summary */}
                      {results.jobDescription && results.skillMatches.some(s => s.jobMatch !== undefined) && (
                        <div className="bg-background p-3 rounded-md mb-4 text-sm">
                          <p className="font-medium mb-1">Job Match Summary:</p>
                          <p className="mb-2">
                            {matchingSkills.length} of {results.skillMatches.length} skills 
                            match the job requirements
                          </p>
                          {matchingSkills.length === 0 && (
                            <p className="text-yellow-600 text-xs italic">
                              Consider tailoring your resume to include more skills from the job description
                            </p>
                          )}
                          {matchingSkills.length > 0 && matchingSkills.length < 3 && (
                            <p className="text-yellow-600 text-xs italic">
                              Adding more relevant skills from the job description could improve your match
                            </p>
                          )}
                          {matchingSkills.length >= 3 && (
                            <p className="text-green-600 text-xs italic">
                              Good job! Your resume contains several skills from the job description
                            </p>
                          )}
                        </div>
                      )}
                      
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={prepareSkillsData()}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {prepareSkillsData().map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.jobMatch ? '#10B981' : COLORS[index % COLORS.length]} 
                                />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Skills Card */}
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-4">Skills Analysis</h3>
                    
                    {/* Job Match Summary */}
                    {results.jobDescription && results.skillMatches.some(s => s.jobMatch !== undefined) && (
                      <div className="mb-4 p-3 bg-background rounded-md border">
                        <h4 className="font-medium mb-2">Job Match Summary</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {matchingSkills.length === 0 && (
                            <>
                              No skills from your resume match this job description. 
                              Consider tailoring your resume to include relevant skills.
                            </>
                          )}
                          {matchingSkills.length > 0 && matchingSkills.length < 3 && (
                            <>
                              Found <span className="font-medium text-foreground">{matchingSkills.length}</span> skills matching the job requirements. 
                              Consider adding more relevant skills to improve your chances.
                            </>
                          )}
                          {matchingSkills.length >= 3 && (
                            <>
                              Great! <span className="font-medium text-foreground">{matchingSkills.length}</span> skills match the job requirements, 
                              increasing your chances of getting through the ATS.
                            </>
                          )}
                        </p>
                        
                        {matchingSkills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {matchingSkills.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                                {skill.skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Skills List */}
                    <div className="space-y-4">
                      {results.skillMatches.map((skill, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <span className="font-medium">{skill.skill}</span>
                              {skill.jobMatch && (
                                <Badge className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                                  Job Match
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm font-medium">{skill.score}%</span>
                          </div>
                          
                          <div className="relative h-3 rounded-full bg-background overflow-hidden">
                            <div 
                              className={`absolute top-0 left-0 h-full rounded-full transition-all shadow-[0_0_6px_rgba(0,0,0,0.1)] ${
                                skill.jobMatch 
                                  ? "bg-green-600 dark:bg-green-500" 
                                  : "bg-gradient-to-r from-primary/80 to-primary"
                              }`}
                              style={{ width: `${skill.score}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-4">Suggestions</h3>
                    <ul className="space-y-2">
                      {results.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          {suggestion.toLowerCase().includes("add") || suggestion.toLowerCase().includes("include") ? (
                            <Plus className="h-5 w-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                          )}
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Skill Development Recommendations Teaser */}
                  {results.skillRecommendations && results.skillRecommendations.length > 0 && (
                    <div className="bg-muted p-4 rounded-md">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold flex items-center">
                          <LightbulbIcon className="h-5 w-5 mr-2 text-yellow-500" />
                          Skill Development Recommendations
                        </h3>
                      </div>
                      <p className="mb-4">
                        We&apos;ve analyzed your resume and prepared personalized skill development recommendations to help advance your career.
                      </p>
                      <Button className="w-full" onClick={goToSuggestions}>
                        View Skill Recommendations
                      </Button>
                    </div>
                  )}
                  
                  {/* Full Analysis Card */}
                  {results.fullAnalysis && (
                    <div className="bg-muted p-4 rounded-md mt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Detailed Analysis Report</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowFullAnalysis(!showFullAnalysis)}
                        >
                          {showFullAnalysis ? "Hide Details" : "Show Details"}
                        </Button>
                      </div>
                      
                      {!showFullAnalysis ? (
                        <p className="text-muted-foreground">Click &quot;Show Details&quot; to view the complete analysis of your resume.</p>
                      ) : (
                        <div 
                          className="border rounded-md p-6 max-h-[500px] overflow-y-auto custom-scrollbar bg-background"
                          dangerouslySetInnerHTML={{ __html: formatAnalysisText(results.fullAnalysis) }}
                        />
                      )}
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={startNewAnalysis}
                  >
                    Analyze Another Resume
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <NavigationBar />
    </div>
  );
}