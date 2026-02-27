import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CodeEditor } from "@/components/ui/code-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  Copy, 
  Eye, 
  Smartphone, 
  Monitor, 
  Code, 
  HelpCircle, 
  Trash2,
  FileText,
  Mail,
  FileImage,
  Info,
  CheckCircle,
  Inbox,
  FlaskConical,
  ArrowLeftRight,
  LayoutGrid,
  LayoutList,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  Sparkles
} from "lucide-react";
import { 
  convertMarkdownToHTML, 
  generateEmailHTML, 
  formatFileSize, 
  downloadFile, 
  copyToClipboard 
} from "@/lib/markdown-converter";
import { emailTemplates, getTemplateByName } from "@/lib/email-templates";

interface ABTestVersion {
  id: string;
  name: string;
  content: string;
  template: string;
  votes: number;
  notes: string;
}

export default function NewsletterGenerator() {
  const [markdownContent, setMarkdownContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("Community Update");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showABTestModal, setShowABTestModal] = useState(false);
  
  // A/B Testing State
  const [abTestingEnabled, setABTestingEnabled] = useState(false);
  const [abVersionA, setABVersionA] = useState<ABTestVersion>({
    id: "A",
    name: "Version A",
    content: "",
    template: "Community Update",
    votes: 0,
    notes: ""
  });
  const [abVersionB, setABVersionB] = useState<ABTestVersion>({
    id: "B",
    name: "Version B",
    content: "",
    template: "Community Update",
    votes: 0,
    notes: ""
  });
  const [abCompareLayout, setABCompareLayout] = useState<"side-by-side" | "stacked">("side-by-side");
  const [activeABTab, setActiveABTab] = useState<"edit" | "compare">("edit");
  const [editingVersion, setEditingVersion] = useState<"A" | "B">("A");

  const { toast } = useToast();

  // Initialize with default template content
  useEffect(() => {
    const defaultTemplate = getTemplateByName(selectedTemplate);
    setMarkdownContent(defaultTemplate.defaultContent);
  }, [selectedTemplate]);

  // Sync A/B version A with main content when not in A/B mode
  useEffect(() => {
    if (!abTestingEnabled) {
      setABVersionA(prev => ({ ...prev, content: markdownContent, template: selectedTemplate }));
    }
  }, [markdownContent, selectedTemplate, abTestingEnabled]);

  // Convert markdown to HTML
  const conversionResult = useMemo(() => {
    if (!markdownContent.trim()) {
      return {
        html: '<p class="text-slate-500 text-center py-8">Start typing your newsletter content...</p>',
        characterCount: 0,
        wordCount: 0,
        estimatedSize: 0
      };
    }
    return convertMarkdownToHTML(markdownContent);
  }, [markdownContent]);

  // A/B Test conversion results
  const abVersionAResult = useMemo(() => {
    if (!abVersionA.content.trim()) {
      return {
        html: '<p class="text-slate-500 text-center py-8">No content for Version A...</p>',
        characterCount: 0,
        wordCount: 0,
        estimatedSize: 0
      };
    }
    return convertMarkdownToHTML(abVersionA.content);
  }, [abVersionA.content]);

  const abVersionBResult = useMemo(() => {
    if (!abVersionB.content.trim()) {
      return {
        html: '<p class="text-slate-500 text-center py-8">No content for Version B...</p>',
        characterCount: 0,
        wordCount: 0,
        estimatedSize: 0
      };
    }
    return convertMarkdownToHTML(abVersionB.content);
  }, [abVersionB.content]);

  const emailHTML = useMemo(() => {
    return generateEmailHTML(conversionResult.html);
  }, [conversionResult.html]);

  const handleTemplateChange = (templateName: string) => {
    setSelectedTemplate(templateName);
  };

  const handleClearInput = () => {
    setMarkdownContent("");
    toast({
      title: "Content cleared",
      description: "Markdown content has been cleared."
    });
  };

  const handleCopyHTML = async () => {
    try {
      await copyToClipboard(emailHTML);
      toast({
        title: "HTML copied!",
        description: "Newsletter HTML has been copied to clipboard."
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy HTML to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleExportHTML = () => {
    downloadFile(emailHTML, "newsletter.html", "text/html");
    toast({
      title: "HTML exported!",
      description: "Newsletter HTML file has been downloaded."
    });
    setShowExportModal(false);
  };

  const handleExportEML = () => {
    const emlContent = `Subject: Newsletter
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

${emailHTML}`;
    
    downloadFile(emlContent, "newsletter.eml", "application/octet-stream");
    toast({
      title: "EML exported!",
      description: "Newsletter EML file has been downloaded."
    });
    setShowExportModal(false);
  };

  const handleExportPDF = () => {
    toast({
      title: "PDF Export",
      description: "PDF export feature coming soon! Use HTML export for now.",
      variant: "destructive"
    });
    setShowExportModal(false);
  };

  const handleCopySource = async () => {
    try {
      await copyToClipboard(emailHTML);
      toast({
        title: "Source copied!",
        description: "HTML source code has been copied to clipboard."
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy source code to clipboard.",
        variant: "destructive"
      });
    }
  };

  // A/B Testing Functions
  const handleEnableABTesting = () => {
    setABTestingEnabled(true);
    setABVersionA(prev => ({ ...prev, content: markdownContent, template: selectedTemplate }));
    setABVersionB(prev => ({ 
      ...prev, 
      content: markdownContent, 
      template: selectedTemplate 
    }));
    setShowABTestModal(true);
    toast({
      title: "A/B Testing Enabled",
      description: "You can now create and compare two versions of your newsletter."
    });
  };

  const handleDisableABTesting = () => {
    setABTestingEnabled(false);
    setShowABTestModal(false);
    toast({
      title: "A/B Testing Disabled",
      description: "Returned to single newsletter mode."
    });
  };

  const handleVote = (version: "A" | "B") => {
    if (version === "A") {
      setABVersionA(prev => ({ ...prev, votes: prev.votes + 1 }));
    } else {
      setABVersionB(prev => ({ ...prev, votes: prev.votes + 1 }));
    }
    toast({
      title: `Vote recorded for Version ${version}`,
      description: "Your preference has been saved."
    });
  };

  const handleResetVotes = () => {
    setABVersionA(prev => ({ ...prev, votes: 0 }));
    setABVersionB(prev => ({ ...prev, votes: 0 }));
    toast({
      title: "Votes reset",
      description: "All votes have been cleared."
    });
  };

  const handleSelectWinner = (version: "A" | "B") => {
    const selectedVersion = version === "A" ? abVersionA : abVersionB;
    setMarkdownContent(selectedVersion.content);
    setSelectedTemplate(selectedVersion.template);
    setABTestingEnabled(false);
    setShowABTestModal(false);
    toast({
      title: `Version ${version} Selected!`,
      description: "The winning version has been set as your main newsletter content."
    });
  };

  const handleCopyABVersion = async (version: "A" | "B") => {
    const content = version === "A" ? abVersionA.content : abVersionB.content;
    const result = convertMarkdownToHTML(content);
    const html = generateEmailHTML(result.html);
    try {
      await copyToClipboard(html);
      toast({
        title: `Version ${version} HTML copied!`,
        description: "Newsletter HTML has been copied to clipboard."
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy HTML to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleExportABVersion = (version: "A" | "B") => {
    const content = version === "A" ? abVersionA.content : abVersionB.content;
    const versionName = version === "A" ? abVersionA.name : abVersionB.name;
    const result = convertMarkdownToHTML(content);
    const html = generateEmailHTML(result.html);
    downloadFile(html, `newsletter-${versionName.toLowerCase().replace(/\s+/g, '-')}.html`, "text/html");
    toast({
      title: `Version ${version} exported!`,
      description: `Newsletter HTML for ${versionName} has been downloaded.`
    });
  };

  const getTotalVotes = () => abVersionA.votes + abVersionB.votes;
  const getVotePercentage = (votes: number) => {
    const total = getTotalVotes();
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Inbox className="text-white w-4 h-4" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-800">Newsletter Generator</h1>
                <p className="text-xs text-slate-500">Markdown to Email HTML</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {/* A/B Testing Toggle */}
              <Button
                variant={abTestingEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => abTestingEnabled ? setShowABTestModal(true) : handleEnableABTesting()}
                className={abTestingEnabled ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                <FlaskConical className="w-4 h-4 mr-2" />
                A/B Test
                {abTestingEnabled && (
                  <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                    Active
                  </Badge>
                )}
              </Button>

              {/* Template Selector */}
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Association Templates</div>
                  {emailTemplates.filter(t => t.category === "association").map((template) => (
                    <SelectItem key={template.name} value={template.name}>
                      <div className="flex flex-col">
                        <span>{template.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 border-t">General</div>
                  {emailTemplates.filter(t => t.category === "general").map((template) => (
                    <SelectItem key={template.name} value={template.name}>
                      <div className="flex flex-col">
                        <span>{template.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Preview Toggle (Mobile) */}
              <Button 
                variant="outline" 
                size="sm" 
                className="lg:hidden"
                onClick={() => setViewMode(viewMode === "desktop" ? "mobile" : "desktop")}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>

              {/* Export Button */}
              <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-accent hover:bg-accent/90">
                    <Download className="w-4 h-4 mr-2" />
                    Export HTML
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Export Options</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Button 
                      onClick={handleExportHTML}
                      className="w-full justify-start h-auto p-4"
                      variant="outline"
                    >
                      <FileText className="w-5 h-5 mr-4 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">HTML File</div>
                        <div className="text-sm text-slate-600">Download complete HTML with inline styles</div>
                      </div>
                    </Button>
                    
                    <Button 
                      onClick={handleExportEML}
                      className="w-full justify-start h-auto p-4"
                      variant="outline"
                    >
                      <Mail className="w-5 h-5 mr-4 text-accent" />
                      <div className="text-left">
                        <div className="font-medium">EML File</div>
                        <div className="text-sm text-slate-600">Email format for direct import</div>
                      </div>
                    </Button>
                    
                    <Button 
                      onClick={handleExportPDF}
                      className="w-full justify-start h-auto p-4"
                      variant="outline"
                    >
                      <FileImage className="w-5 h-5 mr-4 text-orange-500" />
                      <div className="text-left">
                        <div className="font-medium">PDF File</div>
                        <div className="text-sm text-slate-600">Printable version for archiving</div>
                      </div>
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Copy Button */}
              <Button onClick={handleCopyHTML} className="bg-primary hover:bg-primary/90">
                <Copy className="w-4 h-4 mr-2" />
                Copy HTML
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* A/B Testing Modal */}
      <Dialog open={showABTestModal} onOpenChange={setShowABTestModal}>
        <DialogContent className="max-w-7xl h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl">A/B Testing Preview</DialogTitle>
                  <p className="text-sm text-slate-500">Compare two versions of your newsletter side-by-side</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setABCompareLayout(abCompareLayout === "side-by-side" ? "stacked" : "side-by-side")}
                >
                  {abCompareLayout === "side-by-side" ? (
                    <LayoutList className="w-4 h-4 mr-2" />
                  ) : (
                    <LayoutGrid className="w-4 h-4 mr-2" />
                  )}
                  {abCompareLayout === "side-by-side" ? "Stacked" : "Side-by-Side"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDisableABTesting}
                >
                  Exit A/B Test
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* A/B Test Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeABTab} onValueChange={(v) => setActiveABTab(v as "edit" | "compare")} className="h-full flex flex-col">
              <div className="px-6 py-2 border-b bg-slate-50">
                <TabsList>
                  <TabsTrigger value="edit" className="flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Edit Versions
                  </TabsTrigger>
                  <TabsTrigger value="compare" className="flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4" />
                    Compare & Vote
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Edit Tab */}
              <TabsContent value="edit" className="flex-1 overflow-hidden m-0">
                <div className="h-full flex">
                  {/* Version Selector Sidebar */}
                  <div className="w-48 border-r bg-white p-4 space-y-3">
                    <Label className="text-xs text-slate-500 uppercase tracking-wide">Select Version</Label>
                    <div className="space-y-2">
                      <Button
                        variant={editingVersion === "A" ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setEditingVersion("A")}
                      >
                        <Badge className="mr-2 bg-blue-500">A</Badge>
                        {abVersionA.name}
                      </Button>
                      <Button
                        variant={editingVersion === "B" ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setEditingVersion("B")}
                      >
                        <Badge className="mr-2 bg-green-500">B</Badge>
                        {abVersionB.name}
                      </Button>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-slate-500">Version Name</Label>
                        <Input
                          value={editingVersion === "A" ? abVersionA.name : abVersionB.name}
                          onChange={(e) => {
                            if (editingVersion === "A") {
                              setABVersionA(prev => ({ ...prev, name: e.target.value }));
                            } else {
                              setABVersionB(prev => ({ ...prev, name: e.target.value }));
                            }
                          }}
                          className="mt-1"
                          placeholder="Enter version name"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs text-slate-500">Template</Label>
                        <Select 
                          value={editingVersion === "A" ? abVersionA.template : abVersionB.template}
                          onValueChange={(value) => {
                            if (editingVersion === "A") {
                              setABVersionA(prev => ({ ...prev, template: value }));
                            } else {
                              setABVersionB(prev => ({ ...prev, template: value }));
                            }
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {emailTemplates.map((template) => (
                              <SelectItem key={template.name} value={template.name}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Editor */}
                  <div className="flex-1 flex flex-col">
                    <div className="border-b px-4 py-2 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={editingVersion === "A" ? "bg-blue-500" : "bg-green-500"}>
                          {editingVersion}
                        </Badge>
                        <span className="font-medium">
                          {editingVersion === "A" ? abVersionA.name : abVersionB.name}
                        </span>
                        <Badge variant="secondary">
                          {editingVersion === "A" ? abVersionAResult.characterCount : abVersionBResult.characterCount} chars
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-1 flex">
                      {/* Markdown Editor */}
                      <div className="w-1/2 border-r p-4">
                        <CodeEditor
                          value={editingVersion === "A" ? abVersionA.content : abVersionB.content}
                          onChange={(e) => {
                            if (editingVersion === "A") {
                              setABVersionA(prev => ({ ...prev, content: e.target.value }));
                            } else {
                              setABVersionB(prev => ({ ...prev, content: e.target.value }));
                            }
                          }}
                          placeholder="Enter your newsletter content in Markdown format..."
                          className="w-full h-full min-h-[400px]"
                        />
                      </div>
                      
                      {/* Preview */}
                      <div className="w-1/2 p-4 bg-slate-50 overflow-auto">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                          <div 
                            className="newsletter-preview"
                            dangerouslySetInnerHTML={{ 
                              __html: editingVersion === "A" ? abVersionAResult.html : abVersionBResult.html 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Compare Tab */}
              <TabsContent value="compare" className="flex-1 overflow-hidden m-0">
                <div className="h-full flex flex-col">
                  {/* Voting Stats Bar */}
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-green-50 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-5 h-5 text-slate-600" />
                          <span className="font-medium">Voting Results</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-blue-500">{abVersionA.name}</Badge>
                            <span className="text-lg font-bold">{abVersionA.votes}</span>
                            <span className="text-slate-500">({getVotePercentage(abVersionA.votes)}%)</span>
                          </div>
                          <span className="text-slate-400">vs</span>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-green-500">{abVersionB.name}</Badge>
                            <span className="text-lg font-bold">{abVersionB.votes}</span>
                            <span className="text-slate-500">({getVotePercentage(abVersionB.votes)}%)</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={handleResetVotes}>
                          Reset Votes
                        </Button>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    {getTotalVotes() > 0 && (
                      <div className="mt-3 h-3 bg-slate-200 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-blue-500 transition-all duration-300"
                          style={{ width: `${getVotePercentage(abVersionA.votes)}%` }}
                        />
                        <div 
                          className="bg-green-500 transition-all duration-300"
                          style={{ width: `${getVotePercentage(abVersionB.votes)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Comparison View */}
                  <div className={`flex-1 overflow-auto p-6 ${
                    abCompareLayout === "side-by-side" ? "flex gap-6" : "space-y-6"
                  }`}>
                    {/* Version A */}
                    <Card className={`${abCompareLayout === "side-by-side" ? "flex-1" : ""} border-blue-200`}>
                      <CardHeader className="bg-blue-50 border-b border-blue-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge className="bg-blue-500 text-lg px-3 py-1">A</Badge>
                            <div>
                              <CardTitle>{abVersionA.name}</CardTitle>
                              <CardDescription>{abVersionAResult.wordCount} words</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCopyABVersion("A")}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleExportABVersion("A")}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Export
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleVote("A")}
                              className="bg-blue-500 hover:bg-blue-600"
                            >
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              Vote A
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 max-h-[500px] overflow-auto">
                        <div 
                          className="newsletter-preview bg-white rounded border p-6"
                          dangerouslySetInnerHTML={{ __html: abVersionAResult.html }}
                        />
                      </CardContent>
                    </Card>

                    {/* Version B */}
                    <Card className={`${abCompareLayout === "side-by-side" ? "flex-1" : ""} border-green-200`}>
                      <CardHeader className="bg-green-50 border-b border-green-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge className="bg-green-500 text-lg px-3 py-1">B</Badge>
                            <div>
                              <CardTitle>{abVersionB.name}</CardTitle>
                              <CardDescription>{abVersionBResult.wordCount} words</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCopyABVersion("B")}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleExportABVersion("B")}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Export
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleVote("B")}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              Vote B
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 max-h-[500px] overflow-auto">
                        <div 
                          className="newsletter-preview bg-white rounded border p-6"
                          dangerouslySetInnerHTML={{ __html: abVersionBResult.html }}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Winner Selection */}
                  <div className="px-6 py-4 bg-white border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-slate-600">
                        <Sparkles className="w-5 h-5" />
                        <span>Ready to choose a winner? Select the version you want to use as your final newsletter.</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button 
                          onClick={() => handleSelectWinner("A")}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Use Version A
                        </Button>
                        <Button 
                          onClick={() => handleSelectWinner("B")}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Use Version B
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        {/* Input Panel */}
        <div className="w-full lg:w-1/2 flex flex-col bg-white border-r border-slate-200">
          {/* Input Header */}
          <div className="border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-medium text-slate-800">Markdown Input</h2>
                <Badge variant="secondary">
                  {conversionResult.characterCount} characters
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                {/* Format Help */}
                <Dialog open={showHelpModal} onOpenChange={setShowHelpModal}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <HelpCircle className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                      <DialogTitle>Markdown Syntax Guide</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-slate-800 mb-3">Headers</h4>
                          <div className="bg-slate-100 rounded p-3 font-mono text-sm">
                            # Large Header<br/>
                            ## Medium Header<br/>
                            ### Small Header
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-slate-800 mb-3">Text Formatting</h4>
                          <div className="bg-slate-100 rounded p-3 font-mono text-sm">
                            **Bold Text**<br/>
                            *Italic Text*<br/>
                            ***Bold & Italic***
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-slate-800 mb-3">Lists</h4>
                          <div className="bg-slate-100 rounded p-3 font-mono text-sm">
                            - Bullet point<br/>
                            - Another point<br/>
                            1. Numbered list<br/>
                            2. Second item
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-slate-800 mb-3">Links & Images</h4>
                          <div className="bg-slate-100 rounded p-3 font-mono text-sm">
                            [Link text](URL)<br/>
                            ![Alt text](image-url)
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-slate-800 mb-3">Special Elements</h4>
                        <div className="bg-slate-100 rounded p-3 font-mono text-sm">
                          {'>'} Blockquote text<br/>
                          --- (Horizontal rule)<br/>
                          `Inline code`
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                {/* Clear Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearInput}
                  className="text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Markdown Editor */}
          <div className="flex-1 p-6">
            <CodeEditor
              value={markdownContent}
              onChange={(e) => setMarkdownContent(e.target.value)}
              placeholder="Enter your newsletter content in Markdown format..."
              className="w-full h-full min-h-[500px]"
            />
          </div>

          {/* Input Footer */}
          <div className="border-t border-slate-200 px-6 py-3 bg-slate-50">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4 text-slate-500">
                <span className="flex items-center">
                  <Info className="w-4 h-4 mr-1" />
                  Supports GitHub Flavored Markdown
                </span>
                <span className="flex items-center">
                  <Smartphone className="w-4 h-4 mr-1" />
                  Mobile Optimized Output
                </span>
              </div>
              <div className="text-slate-600">
                Auto-converting...
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="w-full lg:w-1/2 flex flex-col bg-slate-50">
          {/* Preview Header */}
          <div className="border-b border-slate-200 px-6 py-4 bg-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-slate-800">Email Preview</h2>
              <div className="flex items-center space-x-3">
                {/* Responsive Toggle */}
                <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
                  <Button
                    size="sm"
                    variant={viewMode === "desktop" ? "default" : "ghost"}
                    onClick={() => setViewMode("desktop")}
                    className="h-8 px-3"
                  >
                    <Monitor className="w-4 h-4 mr-1" />
                    Desktop
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "mobile" ? "default" : "ghost"}
                    onClick={() => setViewMode("mobile")}
                    className="h-8 px-3"
                  >
                    <Smartphone className="w-4 h-4 mr-1" />
                    Mobile
                  </Button>
                </div>
                
                {/* View Source */}
                <Dialog open={showSourceModal} onOpenChange={setShowSourceModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Code className="w-4 h-4 mr-2" />
                      View HTML
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl h-[80vh]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center justify-between">
                        <div>
                          <div>Generated HTML Source</div>
                          <p className="text-sm text-slate-600 font-normal">Copy this code for use in your email client</p>
                        </div>
                        <Button onClick={handleCopySource} className="ml-4">
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Source
                        </Button>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto">
                      <div className="bg-slate-900 rounded-lg p-4 h-full">
                        <pre className="text-green-400 font-mono text-sm overflow-auto h-full whitespace-pre-wrap">
                          {emailHTML}
                        </pre>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-slate-600 flex items-center">
                        <Info className="w-4 h-4 mr-2" />
                        Optimized for Microsoft 365, Gmail, and Outlook
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 p-6 overflow-auto">
            <div 
              className={`mx-auto bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden ${
                viewMode === "mobile" ? "max-w-sm" : "max-w-2xl"
              }`}
            >
              <div 
                className="newsletter-preview p-8" 
                dangerouslySetInnerHTML={{ __html: conversionResult.html }}
              />
            </div>
          </div>

          {/* Preview Footer */}
          <div className="border-t border-slate-200 px-6 py-3 bg-white">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4 text-slate-500">
                <span className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-accent" />
                  Microsoft 365 Compatible
                </span>
                <span className="flex items-center">
                  <Smartphone className="w-4 h-4 mr-1" />
                  Responsive Design
                </span>
              </div>
              <div className="text-slate-600">
                HTML Size: {formatFileSize(conversionResult.estimatedSize)}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
