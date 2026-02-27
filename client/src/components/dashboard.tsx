import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Settings, 
  Calendar, 
  FileText, 
  Users, 
  Mail, 
  Bell, 
  LogOut,
  Plus,
  Filter,
  Search,
  Video,
  ExternalLink,
  AlertTriangle,
  Download,
  Scale,
  DollarSign,
  Gavel,
  Send,
  CheckCircle,
  GraduationCap,
  Vote,
  ClipboardList,
  ShieldCheck,
  MapPin,
  Waves,
  TreePine,
  Heart,
  Clock,
  Phone,
  Landmark,
  Accessibility,
  BookOpen
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import NewsletterGenerator from "@/components/newsletter-generator";
import AdminPanel from "@/components/admin-panel";

interface DashboardHeaderProps {
  user: any;
}

function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <Building2 className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Bramhollow Condominium Assoc Inc</h1>
              <p className="text-xs text-slate-600 font-medium">Established in 1985</p>
              <p className="text-xs text-slate-500">Community Management Portal</p>
            </div>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-800">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500 capitalize">
                  {user?.role?.replace('_', ' ')} • Unit {user?.unitNumber || 'N/A'}
                </p>
              </div>
              {user?.profileImageUrl && (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = '/api/logout'}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function ServiceRequestNotes({ requestId, isManager }: { requestId: string; isManager: boolean }) {
  const [noteText, setNoteText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const { toast } = useToast();

  const { data: notes, isLoading } = useQuery({
    queryKey: ['/api/service-requests', requestId, 'notes'],
    queryFn: async () => {
      const res = await fetch(`/api/service-requests/${requestId}/notes`, { credentials: 'include' });
      return res.json();
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: async (data: { content: string; isInternal: boolean }) => {
      const res = await apiRequest('POST', `/api/service-requests/${requestId}/notes`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests', requestId, 'notes'] });
      setNoteText("");
      setIsInternal(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add note.", variant: "destructive" });
    },
  });

  return (
    <div className="mt-3 border-t pt-3 space-y-3">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Messages & Notes</p>
      {isLoading ? (
        <p className="text-xs text-slate-400">Loading...</p>
      ) : notes && Array.isArray(notes) && notes.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {notes.map((note: any) => (
            <div key={note.id} className={`text-sm p-2 rounded ${note.isInternal ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50 border border-slate-200'}`}>
              <p className="text-slate-700">{note.content}</p>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(note.createdAt).toLocaleString()}
                {note.isInternal && <span className="ml-2 text-amber-600 font-medium">(Internal)</span>}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">No messages yet.</p>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={isManager ? "Add a note or response..." : "Add a message..."}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && noteText.trim()) addNoteMutation.mutate({ content: noteText, isInternal }); }}
          className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isManager && (
          <label className="flex items-center gap-1 text-xs text-amber-700 whitespace-nowrap">
            <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="rounded" />
            Internal
          </label>
        )}
        <Button size="sm" variant="outline" disabled={!noteText.trim() || addNoteMutation.isPending} onClick={() => addNoteMutation.mutate({ content: noteText, isInternal })}>
          <Send className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

function ServiceRequestsTab() {
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'maintenance' as string,
    priority: 'medium' as string,
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const typedUser = user as any;
  const isManager = typedUser?.role === 'manager' || typedUser?.role === 'admin';

  const { data: serviceRequests, isLoading } = useQuery({
    queryKey: ['/api/service-requests'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest('POST', '/api/service-requests', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests'] });
      setShowForm(false);
      setFormData({ title: '', description: '', category: 'maintenance', priority: 'medium' });
      toast({ title: "Service request submitted", description: "Your request has been received and will be reviewed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit service request. Please try again.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest('PATCH', `/api/service-requests/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests'] });
      toast({ title: "Request updated", description: "Service request has been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update request.", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({ title: "Missing fields", description: "Please fill in the title and description.", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  const allRequests = (serviceRequests && Array.isArray(serviceRequests)) ? serviceRequests : [];

  const filteredRequests = allRequests.filter((r: any) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterCategory !== 'all' && r.category !== filterCategory) return false;
    return true;
  });

  const sortedRequests = [...filteredRequests].sort((a: any, b: any) => {
    if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'priority') {
      const order: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
      return (order[a.priority] || 3) - (order[b.priority] || 3);
    }
    if (sortBy === 'status') return (a.status || '').localeCompare(b.status || '');
    return 0;
  });

  const statusCounts = {
    pending: allRequests.filter((r: any) => r.status === 'pending').length,
    assigned: allRequests.filter((r: any) => r.status === 'assigned').length,
    in_progress: allRequests.filter((r: any) => r.status === 'in_progress').length,
    completed: allRequests.filter((r: any) => r.status === 'completed').length,
  };

  const priorityColor = (p: string) => {
    switch (p) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'low': return 'bg-slate-100 text-slate-600 border-slate-300';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-slate-100 text-slate-500';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading service requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold">Service Requests</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'New Request'}
        </Button>
      </div>

      {allRequests.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold text-yellow-700">{statusCounts.pending}</p>
              <p className="text-xs text-yellow-600">Pending</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold text-blue-700">{statusCounts.assigned}</p>
              <p className="text-xs text-blue-600">Assigned</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold text-purple-700">{statusCounts.in_progress}</p>
              <p className="text-xs text-purple-600">In Progress</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4 pb-3 text-center">
              <p className="text-2xl font-bold text-green-700">{statusCounts.completed}</p>
              <p className="text-xs text-green-600">Completed</p>
            </CardContent>
          </Card>
        </div>
      )}

      {showForm && (
        <Card className="border-2 border-blue-300 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-base">Submit a New Service Request</CardTitle>
            <CardDescription>Describe the issue and we'll get it handled.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Title *</label>
                <input
                  type="text"
                  placeholder="Brief summary of the issue"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="hvac">HVAC</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="landscaping">Landscaping</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Description *</label>
                <textarea
                  placeholder="Provide details about the issue — location, what happened, when it started..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  <Send className="w-4 h-4 mr-2" />
                  {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {allRequests.length > 0 && (
        <div className="flex flex-wrap gap-3 items-center bg-slate-50 rounded-lg p-3 border">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-medium text-slate-500">Filters:</span>
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-2 py-1 border border-slate-300 rounded text-xs bg-white">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-2 py-1 border border-slate-300 rounded text-xs bg-white">
            <option value="all">All Categories</option>
            <option value="maintenance">Maintenance</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="hvac">HVAC</option>
            <option value="cleaning">Cleaning</option>
            <option value="landscaping">Landscaping</option>
            <option value="other">Other</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-2 py-1 border border-slate-300 rounded text-xs bg-white">
            <option value="date">Sort: Newest First</option>
            <option value="priority">Sort: Priority</option>
            <option value="status">Sort: Status</option>
          </select>
          <span className="text-xs text-slate-400 ml-auto">{sortedRequests.length} request{sortedRequests.length !== 1 ? 's' : ''}</span>
        </div>
      )}
      
      <div className="grid gap-4">
        {sortedRequests.length > 0 ? sortedRequests.map((request: any) => (
          <Card key={request.id} className={`border ${request.priority === 'urgent' ? 'border-red-300 bg-red-50/20' : request.priority === 'high' ? 'border-orange-200' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{request.title}</CardTitle>
                  {request.priority === 'urgent' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                  {isManager ? (
                    <select
                      value={request.status}
                      onChange={(e) => updateMutation.mutate({ id: request.id, data: { status: e.target.value } })}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium border-0 cursor-pointer ${statusColor(request.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  ) : (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(request.status)}`}>
                      {request.status?.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
              <CardDescription className="capitalize">
                {request.category?.replace('_', ' ')}
                {request.scheduledDate && ` • Scheduled: ${new Date(request.scheduledDate).toLocaleDateString()}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-2">{request.description}</p>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs text-slate-500">
                  Created: {new Date(request.createdAt).toLocaleDateString()}
                  {request.completedDate && ` • Completed: ${new Date(request.completedDate).toLocaleDateString()}`}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                >
                  <Mail className="w-3 h-3 mr-1" />
                  {expandedRequest === request.id ? 'Hide Messages' : 'Messages'}
                </Button>
              </div>
              {expandedRequest === request.id && (
                <ServiceRequestNotes requestId={request.id} isManager={isManager} />
              )}
            </CardContent>
          </Card>
        )) : (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center">
              <Settings className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                {allRequests.length === 0 ? 'No service requests yet.' : 'No requests match the current filters.'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {allRequests.length === 0 ? 'Click "New Request" above to submit one.' : 'Try adjusting your filters.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <VendorProposalsSection isManager={isManager} />
    </div>
  );
}

function VendorProposalsSection({ isManager }: { isManager: boolean }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'maintenance_contract' as string,
    vendorName: '',
    vendorContact: '',
    vendorEmail: '',
    vendorPhone: '',
    proposedAmount: '',
    contractTerm: '',
    scopeOfWork: '',
    dueDate: '',
    notes: '',
  });
  const { toast } = useToast();

  const { data: proposals, isLoading } = useQuery({
    queryKey: ['/api/vendor-proposals'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/vendor-proposals', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-proposals'] });
      setShowForm(false);
      setFormData({ title: '', description: '', category: 'maintenance_contract', vendorName: '', vendorContact: '', vendorEmail: '', vendorPhone: '', proposedAmount: '', contractTerm: '', scopeOfWork: '', dueDate: '', notes: '' });
      toast({ title: "Proposal created", description: "Vendor proposal has been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create proposal.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest('PATCH', `/api/vendor-proposals/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-proposals'] });
      toast({ title: "Proposal updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update proposal.", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({ title: "Missing fields", description: "Please fill in the title and description.", variant: "destructive" });
      return;
    }
    const submitData = {
      ...formData,
      proposedAmount: formData.proposedAmount || undefined,
      dueDate: formData.dueDate || undefined,
    };
    createMutation.mutate(submitData);
  };

  const categoryLabels: Record<string, string> = {
    maintenance_contract: 'Maintenance Contract',
    snow_removal: 'Snow Removal',
    floral_design: 'Floral Design & Setup',
    landscaping: 'Landscaping',
    roofing: 'Roofing',
    parking_lot: 'Parking Lot',
    cleaning: 'Cleaning',
    general: 'General',
  };

  const statusLabels: Record<string, string> = {
    draft: 'Draft',
    open: 'Open for Bids',
    under_review: 'Under Review',
    awarded: 'Awarded',
    rejected: 'Rejected',
    expired: 'Expired',
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    open: 'bg-blue-100 text-blue-800',
    under_review: 'bg-amber-100 text-amber-800',
    awarded: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-700',
    expired: 'bg-slate-100 text-slate-500',
  };

  const allProposals = (proposals && Array.isArray(proposals)) ? proposals : [];

  return (
    <div className="space-y-4 mt-8">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-semibold text-slate-800">Vendor Proposals & RFPs</h4>
          <p className="text-xs text-slate-500">Request for proposals for maintenance service contracts</p>
        </div>
        {isManager && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancel' : 'New RFP'}
          </Button>
        )}
      </div>

      {showForm && isManager && (
        <Card className="border-2 border-teal-300 bg-teal-50/30">
          <CardHeader>
            <CardTitle className="text-base">Create Vendor Proposal / RFP</CardTitle>
            <CardDescription>Define the scope of work and contract details for vendor bidding.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Title *</label>
                  <input type="text" placeholder="e.g., Snow Removal Contract 2026-27" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Category *</label>
                  <select value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white">
                    <option value="maintenance_contract">Maintenance Contract</option>
                    <option value="snow_removal">Snow Removal</option>
                    <option value="floral_design">Floral Design & Setup</option>
                    <option value="landscaping">Landscaping</option>
                    <option value="roofing">Roofing</option>
                    <option value="parking_lot">Parking Lot</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Description *</label>
                <textarea placeholder="Describe the work needed..." value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm resize-vertical" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Scope of Work</label>
                <textarea placeholder="Detailed scope: areas covered, frequency, materials, standards..." value={formData.scopeOfWork} onChange={(e) => setFormData(prev => ({ ...prev, scopeOfWork: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm resize-vertical" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Proposed Amount ($)</label>
                  <input type="text" placeholder="e.g., 4200.00" value={formData.proposedAmount} onChange={(e) => setFormData(prev => ({ ...prev, proposedAmount: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Contract Term</label>
                  <input type="text" placeholder="e.g., Nov 2026 – Mar 2027" value={formData.contractTerm} onChange={(e) => setFormData(prev => ({ ...prev, contractTerm: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Due Date</label>
                  <input type="date" value={formData.dueDate} onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Vendor Information (optional)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Vendor Name</label>
                    <input type="text" placeholder="Company name" value={formData.vendorName} onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Contact Person</label>
                    <input type="text" placeholder="Primary contact" value={formData.vendorContact} onChange={(e) => setFormData(prev => ({ ...prev, vendorContact: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <input type="email" placeholder="vendor@email.com" value={formData.vendorEmail} onChange={(e) => setFormData(prev => ({ ...prev, vendorEmail: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Phone</label>
                    <input type="tel" placeholder="(201) 555-0000" value={formData.vendorPhone} onChange={(e) => setFormData(prev => ({ ...prev, vendorPhone: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Internal Notes</label>
                <textarea placeholder="Board notes, evaluation criteria, comparison notes..." value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm resize-vertical" />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  <ClipboardList className="w-4 h-4 mr-2" />
                  {createMutation.isPending ? 'Creating...' : 'Create Proposal'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading proposals...</p>
      ) : allProposals.length > 0 ? (
        <div className="grid gap-4">
          {allProposals.map((proposal: any) => (
            <Card key={proposal.id} className="border border-slate-200">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm">{proposal.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {categoryLabels[proposal.category] || proposal.category}
                      {proposal.contractTerm && ` • ${proposal.contractTerm}`}
                      {proposal.vendorName && ` • ${proposal.vendorName}`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {proposal.proposedAmount && (
                      <span className="text-sm font-semibold text-green-700">${Number(proposal.proposedAmount).toLocaleString()}</span>
                    )}
                    {isManager ? (
                      <select
                        value={proposal.status}
                        onChange={(e) => updateMutation.mutate({ id: proposal.id, data: { status: e.target.value } })}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium border-0 cursor-pointer ${statusColors[proposal.status] || 'bg-slate-100'}`}
                      >
                        <option value="draft">Draft</option>
                        <option value="open">Open for Bids</option>
                        <option value="under_review">Under Review</option>
                        <option value="awarded">Awarded</option>
                        <option value="rejected">Rejected</option>
                        <option value="expired">Expired</option>
                      </select>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[proposal.status] || 'bg-slate-100'}`}>
                        {statusLabels[proposal.status] || proposal.status}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-2">{proposal.description}</p>
                {proposal.scopeOfWork && (
                  <div className="bg-slate-50 rounded p-2 mb-2 border">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Scope of Work:</p>
                    <p className="text-xs text-slate-600">{proposal.scopeOfWork}</p>
                  </div>
                )}
                {(proposal.vendorContact || proposal.vendorEmail || proposal.vendorPhone) && (
                  <div className="text-xs text-slate-500 space-x-3">
                    {proposal.vendorContact && <span>Contact: {proposal.vendorContact}</span>}
                    {proposal.vendorEmail && <span>Email: {proposal.vendorEmail}</span>}
                    {proposal.vendorPhone && <span>Phone: {proposal.vendorPhone}</span>}
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-slate-400">
                    Created: {new Date(proposal.createdAt).toLocaleDateString()}
                    {proposal.dueDate && ` • Due: ${new Date(proposal.dueDate).toLocaleDateString()}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No vendor proposals yet.</p>
            {isManager && <p className="text-xs text-slate-400 mt-1">Click "New RFP" to create a request for proposals.</p>}
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-4 pb-3">
          <p className="text-xs font-semibold text-slate-500 mb-2">Common Service Contract Categories:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="bg-white rounded p-2 border text-xs">
              <p className="font-medium text-slate-700">Snow Removal</p>
              <p className="text-slate-500">Seasonal contract — parking lots, driveways, sidewalks, salt/sand. Typical term: Nov–Mar.</p>
            </div>
            <div className="bg-white rounded p-2 border text-xs">
              <p className="font-medium text-slate-700">Common Area Floral Design</p>
              <p className="text-slate-500">Seasonal plantings, entrance planters, perennial beds, holiday decorations for common areas.</p>
            </div>
            <div className="bg-white rounded p-2 border text-xs">
              <p className="font-medium text-slate-700">Maintenance Contract</p>
              <p className="text-slate-500">General building maintenance, HVAC inspections, plumbing, electrical, and grounds upkeep.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AnnouncementsTab() {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['/api/announcements'],
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading announcements...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Community Announcements</h3>
      </div>
      
      <div className="grid gap-4">
        {announcements && Array.isArray(announcements) ? announcements.map((announcement: any) => (
          <Card key={announcement.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{announcement.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant={announcement.type === 'newsletter' ? 'default' : 'secondary'}>
                    {announcement.type}
                  </Badge>
                  {announcement.priority === 'high' && (
                    <Badge variant="destructive">High Priority</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-2">{announcement.content.slice(0, 200)}...</p>
              <p className="text-xs text-slate-500">
                Published: {new Date(announcement.publishDate || announcement.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        )) : <p className="text-center text-slate-500">No announcements found.</p>}
      </div>
    </div>
  );
}

function EventsTab() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['/api/events'],
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Upcoming Events</h3>
      </div>

      {/* Zoom Requirements Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-base text-blue-800">Zoom Meeting Requirements</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-700 mb-3">
            All association meetings are available via Zoom. Members are required to have Zoom installed to participate remotely.
          </p>
          <div className="flex gap-3">
            <a 
              href="https://zoom.us/download" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-4 h-4" />
              Download Zoom
            </a>
            <a 
              href="https://support.zoom.us/hc/en-us/articles/201362193-Joining-a-meeting" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-4 h-4" />
              How to Join a Meeting
            </a>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4">
        {events && Array.isArray(events) ? events.map((event: any) => (
          <Card key={event.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{event.title}</CardTitle>
                {(event.isVirtual || event.zoomLink) && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <Video className="w-3 h-3 mr-1" />
                    Zoom Available
                  </Badge>
                )}
              </div>
              <CardDescription>
                {new Date(event.eventDate).toLocaleDateString()} at {new Date(event.eventDate).toLocaleTimeString()}
                {event.location && ` • ${event.location}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-3">{event.description}</p>
              
              {/* Zoom Meeting Info */}
              {event.zoomLink && (
                <div className="bg-slate-50 rounded-lg p-3 mb-3 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">Virtual Meeting Access</span>
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    {event.zoomMeetingId && (
                      <p>Meeting ID: <span className="font-mono">{event.zoomMeetingId}</span></p>
                    )}
                    {event.zoomPasscode && (
                      <p>Passcode: <span className="font-mono">{event.zoomPasscode}</span></p>
                    )}
                  </div>
                  <a 
                    href={event.zoomLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    Join Zoom Meeting
                  </a>
                </div>
              )}
              
              {event.maxAttendees && (
                <p className="text-xs text-slate-500">
                  Max Attendees: {event.maxAttendees}
                </p>
              )}
            </CardContent>
          </Card>
        )) : <p className="text-center text-slate-500">No upcoming events.</p>}
      </div>
    </div>
  );
}

function AmenitiesTab() {
  const { data: amenities, isLoading: amenitiesLoading } = useQuery({
    queryKey: ['/api/amenities'],
  });

  const { data: reservations, isLoading: reservationsLoading } = useQuery({
    queryKey: ['/api/reservations'],
  });

  if (amenitiesLoading || reservationsLoading) {
    return <div className="text-center py-8">Loading amenities...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Amenities & Reservations</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Amenities */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-800">Available Amenities</h4>
          {amenities && Array.isArray(amenities) ? amenities.map((amenity: any) => (
            <Card key={amenity.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{amenity.name}</CardTitle>
                  <Badge variant={amenity.isAvailable ? 'default' : 'secondary'}>
                    {amenity.isAvailable ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                <CardDescription>{amenity.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    {amenity.location && <p>Location: {amenity.location}</p>}
                    {amenity.capacity && <p>Capacity: {amenity.capacity} people</p>}
                    {amenity.hourlyRate && <p>Rate: ${amenity.hourlyRate}/hour</p>}
                  </div>
                  <Button size="sm" disabled={!amenity.isAvailable}>
                    Reserve
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) : <p className="text-slate-500">No amenities available.</p>}
        </div>

        {/* My Reservations */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-800">My Reservations</h4>
          {reservations && Array.isArray(reservations) ? reservations.map((reservation: any) => (
            <Card key={reservation.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Reservation #{reservation.id.slice(-6)}</CardTitle>
                  <Badge variant={
                    reservation.status === 'approved' ? 'default' : 
                    reservation.status === 'pending' ? 'secondary' : 
                    'outline'
                  }>
                    {reservation.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-1">
                  {new Date(reservation.startTime).toLocaleDateString()} • 
                  {new Date(reservation.startTime).toLocaleTimeString()} - 
                  {new Date(reservation.endTime).toLocaleTimeString()}
                </p>
                {reservation.totalCost && (
                  <p className="text-sm text-slate-600">Cost: ${reservation.totalCost}</p>
                )}
              </CardContent>
            </Card>
          )) : <p className="text-slate-500">No reservations found.</p>}
        </div>
      </div>
    </div>
  );
}

function DocumentSearchTool() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const documentSections = [
    {
      document: "Master Deed",
      icon: "deed",
      sections: [
        { title: "Creation of Condominium", reference: "Master Deed, Section 1", content: "The Master Deed creates the condominium known as Bram Hollow Condominium, located in Jersey City, Hudson County, New Jersey, pursuant to N.J.S.A. 46:8B-1 et seq. Recorded in Book 3687, Page 257 of the Hudson County Register.", keywords: ["creation", "establishment", "formation", "condominium", "hudson county", "book 3687"] },
        { title: "Description of Land & Buildings", reference: "Master Deed, Section 2", content: "Describes the land and buildings comprising the condominium property, including the legal description, lot and block numbers, and physical boundaries of the property located in Jersey City.", keywords: ["land", "buildings", "property", "lot", "block", "boundaries", "description"] },
        { title: "Definition of Units", reference: "Master Deed, Section 3", content: "Each residential unit is defined by its boundaries as described in the floor plans filed with the Master Deed. There are 24 residential units in the condominium. Each unit includes interior walls, floors, ceilings, doors, windows, and all fixtures and improvements within the unit boundaries.", keywords: ["units", "boundaries", "24 units", "floor plans", "residential", "interior"] },
        { title: "Common Elements", reference: "Master Deed, Section 4", content: "Common Elements include the land, foundations, structural components, roofs, hallways, stairways, entrances, lobbies, exterior walls, common utility systems (plumbing, electrical, HVAC), parking areas, walkways, landscaping, and all other portions of the property not included within the units.", keywords: ["common elements", "structural", "roof", "hallways", "parking", "utilities", "landscaping", "lobby", "entrance"] },
        { title: "Limited Common Elements", reference: "Master Deed, Section 5", content: "Limited Common Elements are portions of the common elements reserved for the exclusive use of one or more but fewer than all unit owners, including assigned parking spaces, balconies, patios, storage areas, and individual unit entrances.", keywords: ["limited common", "parking spaces", "balconies", "patios", "storage", "exclusive use", "assigned"] },
        { title: "Percentage Interests", reference: "Master Deed, Section 6", content: "Each unit is allocated a percentage interest in the common elements, which determines the unit owner's share of common expenses, voting rights, and ownership interest. The percentage interest is based on the relative value of each unit as set forth in the Master Deed.", keywords: ["percentage", "interest", "common expenses", "voting", "ownership", "share", "value"] },
        { title: "Second Amendment — Parking Areas", reference: "Second Amendment to Master Deed (April 2010)", content: "The Second Amendment to the Master Deed, recorded in April 2010, redesignated certain parking areas as limited common elements, establishing specific maintenance obligations and replacement reserve requirements for the parking lot. Estimated replacement cost: $210,000 (2027 dollars).", keywords: ["second amendment", "parking", "2010", "limited common elements", "replacement", "maintenance", "amendment"] },
        { title: "Association Obligations", reference: "Master Deed, Section 8", content: "The Association is responsible for the maintenance, repair, and replacement of all common elements and limited common elements (except as otherwise specified). This includes structural components, roofs, exterior surfaces, common utility systems, and grounds.", keywords: ["association", "obligations", "maintenance", "repair", "replacement", "structural", "exterior"] },
        { title: "Use Restrictions", reference: "Master Deed, Section 9", content: "Units are restricted to residential use unless otherwise approved. No business, trade, or commercial activity may be conducted in any unit except as permitted by the By-Laws. The condominium is subject to all applicable zoning and municipal regulations.", keywords: ["use restrictions", "residential", "business", "commercial", "zoning", "restrictions"] }
      ]
    },
    {
      document: "By-Laws",
      icon: "bylaws",
      sections: [
        { title: "Name and Location", reference: "By-Laws, Article I", content: "The name of the Association is Bramhollow Condominium Association Inc, located in Jersey City, Hudson County, New Jersey. The Association is incorporated as a nonprofit corporation under New Jersey law.", keywords: ["name", "location", "jersey city", "nonprofit", "incorporated"] },
        { title: "Membership and Voting", reference: "By-Laws, Article II", content: "Every unit owner is automatically a member of the Association. Each unit is entitled to one vote on all matters submitted to a vote of the membership. Voting rights may be exercised in person or by proxy. A majority of units constitutes a quorum.", keywords: ["membership", "voting", "vote", "proxy", "quorum", "member", "owner"] },
        { title: "Board of Directors", reference: "By-Laws, Article III", content: "The affairs of the Association are managed by a Board of Directors elected by the unit owners. The Board consists of not fewer than three and not more than seven members. Directors serve staggered terms and must be unit owners or residents. The Board has the authority to manage all Association affairs, adopt rules, enter contracts, and enforce governing documents.", keywords: ["board", "directors", "elected", "terms", "authority", "manage", "rules", "contracts"] },
        { title: "Officers", reference: "By-Laws, Article IV", content: "The officers of the Association include a President, Vice President, Secretary, and Treasurer, elected by the Board of Directors from among its members. The President presides over meetings, the Secretary maintains records, and the Treasurer oversees financial accounts.", keywords: ["officers", "president", "vice president", "secretary", "treasurer", "duties"] },
        { title: "Meetings of Unit Owners", reference: "By-Laws, Article V", content: "An annual meeting of unit owners shall be held each year for the election of directors and transaction of other business. Special meetings may be called by the Board or upon petition of 25% of unit owners. Written notice of all meetings must be provided at least 48 hours in advance per N.J.S.A. 46:8B-12.", keywords: ["meetings", "annual meeting", "special meeting", "notice", "48 hours", "election", "petition"] },
        { title: "Board Meetings", reference: "By-Laws, Article VI", content: "The Board of Directors shall meet regularly as determined by the Board. Special board meetings may be called by the President or any two directors. All board meetings are open to unit owners. Minutes of all meetings shall be maintained and available for inspection by any unit owner.", keywords: ["board meetings", "open meetings", "minutes", "inspection", "regular meetings"] },
        { title: "Assessments and Budget", reference: "By-Laws, Article VIII", content: "The Board shall adopt a Non-Discretionary Annual Budget setting forth the estimated common expenses for the coming year. Monthly assessments are based on this budget and each unit's percentage interest. No assessment is collectible until the budget is formally adopted and distributed to all owners. Special assessments may be levied for extraordinary expenses with proper notice.", keywords: ["assessments", "budget", "common expenses", "monthly", "special assessment", "percentage interest", "non-discretionary"] },
        { title: "Insurance", reference: "By-Laws, Article IX", content: "The Association shall maintain a master insurance policy covering fire, casualty, and general liability for all common elements and the building structure. Individual unit owners are responsible for insuring their personal property and interior improvements. The Board shall review insurance coverage annually.", keywords: ["insurance", "master policy", "liability", "fire", "casualty", "coverage", "personal property"] },
        { title: "Maintenance Responsibilities", reference: "By-Laws, Article X", content: "The Association is responsible for maintaining all common elements and limited common elements. Unit owners are responsible for maintaining the interior of their units, including fixtures, appliances, and interior surfaces. Damage to common elements caused by a unit owner may be charged to that owner.", keywords: ["maintenance", "common elements", "unit owner", "interior", "fixtures", "damage", "responsibility"] },
        { title: "Rules and Regulations", reference: "By-Laws, Article XI", content: "The Board of Directors may adopt reasonable rules and regulations governing the use of common elements, conduct of residents, and operation of the community. Rules must be consistent with the Master Deed and By-Laws. Violations may result in fines or other enforcement actions.", keywords: ["rules", "regulations", "conduct", "violations", "fines", "enforcement", "common elements"] },
        { title: "Amendments", reference: "By-Laws, Article XII", content: "These By-Laws may be amended by a vote of not less than two-thirds (2/3) of all unit owners. Proposed amendments must be provided to all owners at least 30 days before the vote. Any amendment must be consistent with the Master Deed and applicable law.", keywords: ["amendments", "vote", "two-thirds", "change", "modify", "30 days"] }
      ]
    },
    {
      document: "NJ Condominium Act",
      icon: "law",
      sections: [
        { title: "Purpose and Definitions", reference: "N.J.S.A. 46:8B-1 to 46:8B-3", content: "The New Jersey Condominium Act establishes the legal framework for creating and operating condominiums in New Jersey. Key definitions include 'unit' (individually owned portion), 'common elements' (shared portions), 'association' (governing body), and 'master deed' (document creating the condominium).", keywords: ["definitions", "purpose", "unit", "common elements", "association", "condominium act"] },
        { title: "Creation of Condominium", reference: "N.J.S.A. 46:8B-4 to 46:8B-8", content: "A condominium is created by recording a master deed with the county recording office. The master deed must describe the land, buildings, units, common elements, and percentage interests. Floor plans showing unit boundaries must be filed with the master deed.", keywords: ["creation", "master deed", "recording", "county", "floor plans"] },
        { title: "Meeting Notice Requirements", reference: "N.J.S.A. 46:8B-12", content: "Written notice of every meeting of the governing board or of the unit owners must be given at least 48 hours in advance. The notice must include the date, time, and location of the meeting. This requirement ensures unit owners have adequate opportunity to attend and participate in governance decisions.", keywords: ["meeting notice", "48 hours", "written notice", "board meeting", "owner meeting", "advance notice"] },
        { title: "Association Powers and Duties", reference: "N.J.S.A. 46:8B-14", content: "The association has broad powers including: adopting and amending budgets; making assessments; maintaining common elements; purchasing insurance; hiring personnel; adopting rules and regulations; and enforcing governing documents. The association must maintain financial records and make them available to unit owners upon request.", keywords: ["powers", "duties", "budget", "assessments", "insurance", "records", "financial", "inspection"] },
        { title: "Reserve Funds", reference: "N.J.S.A. 46:8B-14(g)", content: "The association must establish and maintain adequate reserve funds for the repair, replacement, and restoration of major common element components. Reserve funds should be based on a professional reserve study and must be segregated from operating funds. Failure to maintain adequate reserves can result in special assessments.", keywords: ["reserve funds", "replacement", "repair", "restoration", "reserve study", "segregated", "special assessment"] },
        { title: "Board Training Requirements", reference: "N.J.S.A. 46:8B-14.4", content: "All administrative personnel of a condominium association — including board members and managers — are required to complete education and training on the rights and responsibilities of community association governance. Training must cover governance, financial management, fair housing, dispute resolution, and insurance.", keywords: ["training", "education", "board members", "administrative personnel", "fair housing", "governance"] },
        { title: "Owner Rights to Records", reference: "N.J.S.A. 46:8B-14(a)", content: "Every unit owner has the right to inspect and copy the books, records, and financial statements of the association. This includes meeting minutes, financial reports, contracts, insurance policies, and all governing documents. The association cannot refuse access to these records.", keywords: ["records", "inspection", "books", "financial statements", "minutes", "contracts", "owner rights", "access"] },
        { title: "Liens and Assessments", reference: "N.J.S.A. 46:8B-19 to 46:8B-21", content: "Unpaid assessments constitute a lien against the unit. The association may file a lien and pursue foreclosure for delinquent assessments. The lien has priority over most other liens except property tax liens and prior recorded mortgages. Interest and collection costs may be added to the delinquent amount.", keywords: ["liens", "assessments", "unpaid", "foreclosure", "delinquent", "priority", "collection"] },
        { title: "Alternative Dispute Resolution", reference: "NJ DCA Regulations", content: "The New Jersey Department of Community Affairs provides an alternative dispute resolution process for disputes between unit owners and their associations. ADR includes mediation and administrative hearings. This process is designed to be less costly and more accessible than court litigation.", keywords: ["dispute resolution", "ADR", "mediation", "DCA", "hearing", "complaints", "disputes"] },
        { title: "Resale and Disclosure", reference: "N.J.S.A. 46:8B-22 to 46:8B-24", content: "When a unit is being sold, the seller must provide the buyer with copies of the master deed, by-laws, rules and regulations, current budget, and a statement of any outstanding assessments or liens. The association must provide a resale certificate upon request.", keywords: ["resale", "disclosure", "sale", "buyer", "resale certificate", "outstanding assessments"] },
        { title: "Electronic Transactions & Digital Notice", reference: "N.J.S.A. 12A:12-1 et seq. (NJ UETA)", content: "The New Jersey Uniform Electronic Transactions Act validates electronic records, signatures, and communications when parties have consented to conduct transactions electronically. Under UETA, an electronic record satisfies any law requiring a writing, and electronic delivery satisfies requirements for written notice. Condominium associations may adopt policies establishing electronic communication — including website publication — as a valid form of official notice, provided owners are informed and consent is established.", keywords: ["electronic", "UETA", "digital", "electronic transactions", "website", "notice", "email", "electronic record", "consent", "writing"] }
      ]
    },
    {
      document: "Owner Rights",
      icon: "rights",
      sections: [
        { title: "Right to Inspect Records", reference: "N.J.S.A. 46:8B-14(a)", content: "You have the right to inspect all financial records, meeting minutes, contracts, insurance policies, and governing documents maintained by the Association. Simply submit a written request to the Board or management office. Records must be made available within a reasonable time.", keywords: ["inspect", "records", "financial", "minutes", "request", "access", "right"] },
        { title: "Right to a Proper Budget", reference: "By-Laws, Article VIII", content: "You have the right to receive an itemized annual budget before monthly assessments are collected. The budget must be formally adopted by the Board and distributed to every owner. Without a proper budget, the legal basis for collecting assessments is in question.", keywords: ["budget", "assessments", "adopted", "right", "itemized", "distributed"] },
        { title: "Right to Vote", reference: "By-Laws, Article II", content: "Every unit owner in good standing has the right to vote in board elections and on all matters requiring owner approval, including by-law amendments, special assessments, and major decisions. You may vote in person or by proxy.", keywords: ["vote", "election", "proxy", "owner", "good standing", "approval"] },
        { title: "Right to Meeting Notice", reference: "N.J.S.A. 46:8B-12", content: "You are entitled to at least 48 hours' advance written notice of every board meeting and owner meeting. The notice must include the date, time, location, and agenda. You have the right to attend all board meetings.", keywords: ["notice", "48 hours", "meeting", "attend", "board meeting", "agenda"] },
        { title: "Right to Due Process", reference: "By-Laws & NJ Law", content: "Before any fine, penalty, or enforcement action can be taken against you, you must receive written notice and an opportunity to be heard. You cannot be penalized without proper procedures being followed.", keywords: ["due process", "fine", "penalty", "hearing", "notice", "enforcement", "rights"] },
        { title: "Right to ADR", reference: "NJ DCA Regulations", content: "You have the right to request Alternative Dispute Resolution through the New Jersey Department of Community Affairs for any dispute with the Association. ADR provides a formal process outside of court, including mediation and administrative hearings.", keywords: ["ADR", "dispute", "mediation", "DCA", "hearing", "complaint", "resolution"] },
        { title: "Right to Governing Documents", reference: "N.J.S.A. 46:8B-22", content: "You are entitled to copies of all governing documents: the Master Deed, By-Laws, Certificate of Incorporation, Rules and Regulations, and any amendments. The Association must provide these upon request.", keywords: ["governing documents", "master deed", "by-laws", "copies", "entitled", "request"] },
        { title: "Right Against Self-Dealing", reference: "NJ Nonprofit Corporation Act", content: "Board members are prohibited from engaging in self-dealing or conflicts of interest. No board member may vote on or profit from a contract in which they have a personal financial interest. You have the right to raise conflict of interest concerns at any board meeting.", keywords: ["self-dealing", "conflict of interest", "board", "contract", "prohibited", "financial interest"] },
        { title: "Electronic Notice & Digital Communication", reference: "N.J.S.A. 12A:12-1 et seq. (UETA) & Board Policy", content: "Pursuant to the NJ Uniform Electronic Transactions Act and the Board's Digital Communication Policy (effective March 1, 2026), official notices posted to the Bramhollow Management Portal constitute valid notice to all owners. All unit owners are obligated to regularly monitor the website as the primary and first line of communication for Association business. Website publication satisfies written notice requirements under the By-Laws and N.J.S.A. 46:8B-12.", keywords: ["electronic notice", "digital", "website", "communication", "UETA", "portal", "online", "email", "electronic", "monitor"] }
      ]
    }
  ];

  const allSections = documentSections.flatMap(doc =>
    doc.sections.map(section => ({ ...section, document: doc.document, icon: doc.icon }))
  );

  const filteredSections = allSections.filter(section => {
    const matchesCategory = selectedCategory === "all" || section.document === selectedCategory;
    if (!searchQuery.trim()) return matchesCategory;
    const query = searchQuery.toLowerCase();
    return matchesCategory && (
      section.title.toLowerCase().includes(query) ||
      section.content.toLowerCase().includes(query) ||
      section.reference.toLowerCase().includes(query) ||
      section.keywords.some(kw => kw.toLowerCase().includes(query))
    );
  });

  const getDocBadgeColor = (doc: string) => {
    switch (doc) {
      case "Master Deed": return "bg-blue-100 text-blue-800 border-blue-300";
      case "By-Laws": return "bg-purple-100 text-purple-800 border-purple-300";
      case "NJ Condominium Act": return "bg-amber-100 text-amber-800 border-amber-300";
      case "Owner Rights": return "bg-green-100 text-green-800 border-green-300";
      default: return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const highlightMatch = (text: string) => {
    if (!searchQuery.trim()) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark> : part
    );
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center gap-2 mb-2">
        <Search className="w-5 h-5 text-indigo-600" />
        <h4 className="text-base font-semibold text-indigo-900">Document & Law Search</h4>
        <Badge variant="outline" className="text-xs">Unit Owners Only</Badge>
      </div>

      <Card className="border-indigo-200">
        <CardContent className="pt-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search By-Laws, Master Deed, NJ law, owner rights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">All Documents</option>
              <option value="Master Deed">Master Deed</option>
              <option value="By-Laws">By-Laws</option>
              <option value="NJ Condominium Act">NJ Condominium Act</option>
              <option value="Owner Rights">Owner Rights</option>
            </select>
          </div>
          <p className="text-xs text-slate-500">
            {filteredSections.length} result{filteredSections.length !== 1 ? "s" : ""} found
            {searchQuery.trim() && ` for "${searchQuery}"`}
            {selectedCategory !== "all" && ` in ${selectedCategory}`}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredSections.map((section, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h5 className="text-sm font-semibold text-slate-800">{highlightMatch(section.title)}</h5>
                  <p className="text-xs text-slate-500 mt-0.5">{highlightMatch(section.reference)}</p>
                </div>
                <Badge variant="outline" className={`text-xs shrink-0 ${getDocBadgeColor(section.document)}`}>
                  {section.document}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{highlightMatch(section.content)}</p>
            </CardContent>
          </Card>
        ))}
        {filteredSections.length === 0 && (
          <div className="text-center py-8">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No results found for "{searchQuery}"</p>
            <p className="text-xs text-slate-400 mt-1">Try different keywords or select a different document category</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CommunityDefinitionsTab() {
  const [searchTerm, setSearchTerm] = useState("");

  const definitions = [
    {
      term: "Agent (Managing Agent)",
      definition: "The exclusive managing agent appointed by the Association to handle property management, maintenance, and administrative duties. In a community of this size (24 units), these responsibilities may be executed by a part-time manager or superintendent who oversees daily operations and ground maintenance.",
      source: "Master Deed",
      financialNote: null
    },
    {
      term: "Assessments / Common Charges",
      definition: "The monthly fees payable by each Unit Owner to cover the community's Common Expenses. Based on the proposed operating budget, these charges cover items such as insurance, management, and reserves.",
      source: "Master Deed, By-Laws Art. VIII",
      financialNote: { label: "Monthly Assessment per Unit", original: "$86.00/mo", current: "$258.00/mo (2026–27 projected)", note: "CPI-adjusted ~3.1× from 1984 to 2026" }
    },
    {
      term: "Association",
      definition: "Bram Hollow Condominium Association, Inc., a New Jersey Not-For-Profit Corporation. The Association is the legal entity formed to manage, maintain, and administer the property and its affairs.",
      source: "Certificate of Incorporation",
      financialNote: null
    },
    {
      term: "Board of Directors",
      definition: "The governing body responsible for managing the Association's affairs. Their duties include the selection of officers, the enforcement of community rules and regulations, and the oversight of the Managing Agent.",
      source: "By-Laws Art. III",
      financialNote: null
    },
    {
      term: "By-Laws",
      definition: "The governing rules that dictate the internal administration and management of the Association. This document establishes the procedures for meetings, voting requirements, and the specific duties of the Board of Directors.",
      source: "By-Laws of Bramhollow Condominium Assoc Inc",
      financialNote: null
    },
    {
      term: "Certificate of Incorporation",
      definition: "The legal instrument filed with the State of New Jersey to officially establish the Bram Hollow Condominium Association, Inc. as a corporate entity. Recorded at Hudson County Register, Book 3676, Page 335.",
      source: "Hudson County Register",
      financialNote: null
    },
    {
      term: "Common Elements",
      definition: "All portions of the property not included within the individual Units. These areas are owned in common by all Unit Owners and specifically include the land, foundations, structural components of the buildings, the roof, and the parking area.",
      source: "Master Deed, N.J.S.A. 46:8B-3",
      financialNote: null
    },
    {
      term: "Common Expenses",
      definition: "The actual and estimated costs of administration, maintenance, repair, and replacement of the Common Elements, along with any other expenses designated as common by the Association or the Master Deed.",
      source: "Master Deed, N.J.S.A. 46:8B-3",
      financialNote: { label: "Total Annual Operating Budget", original: "$24,768.00 (1984)", current: "$81,580.00 (2026–27 projected)", note: "Based on original Exhibit 11 — 9 line items, CPI-adjusted" }
    },
    {
      term: "Condominium Act",
      definition: "Refers to the New Jersey Condominium Act, P.L. 1969, Ch. 257, R.S. 46:8B-1 et seq., which serves as the primary legislation governing the creation and operation of the community.",
      source: "N.J.S.A. 46:8B-1 et seq.",
      financialNote: null
    },
    {
      term: "First Mortgage Holder",
      definition: "Any institutional holder of a first mortgage lien on a Unit. These holders possess specific rights, including the requirement that at least sixty-seven (67%) percent of all holders of first mortgage liens must provide prior written approval for any material amendments to the governing documents.",
      source: "Master Deed, By-Laws",
      financialNote: null
    },
    {
      term: "Good Standing",
      definition: "The status of a Unit Owner who is current on all monthly assessments and compliant with the restrictions of the Master Deed and By-Laws. Maintaining Good Standing is a prerequisite for exercising voting rights and serving as a member of the Board of Directors.",
      source: "By-Laws Art. II, Art. III",
      financialNote: null
    },
    {
      term: "Grantor / Sponsor",
      definition: "Bram Hollow Development Corporation, the entity that initially developed the property and submitted it to the condominium form of ownership.",
      source: "Master Deed",
      financialNote: null
    },
    {
      term: "Master Deed",
      definition: "The primary legal instrument recorded in the Office of the Register of Hudson County (Book 3687, Page 257). It establishes the condominium form of ownership and defines the boundaries of the Units and Common Elements.",
      source: "Hudson County Register, Book 3687 Page 257",
      financialNote: null
    },
    {
      term: "Nuisance",
      definition: "Any use or practice that is a source of annoyance to residents or interferes with the peaceful possession of the property. Per the By-Laws, this explicitly includes any immoral, improper, offensive, or unlawful use of a Unit or the Common Elements.",
      source: "By-Laws Art. VI",
      financialNote: null
    },
    {
      term: "Percentage Interest",
      definition: "The specific undivided interest of 4.16667% held by each Unit Owner in the Common Elements. This figure is calculated by dividing the individual unit area (1,150 sq. ft.) by the total project dwelling area (27,600 sq. ft.) and determines the owner's share of Common Expenses and voting weight.",
      source: "Master Deed",
      financialNote: null
    },
    {
      term: "The Property",
      definition: "The physical extent of the Bram Hollow Condominium, located at 287-301 Clerk Street and Bramhall Avenue in Jersey City, New Jersey, as detailed in the legal property description and site plans.",
      source: "Master Deed",
      financialNote: null
    },
    {
      term: "Quorum",
      definition: "The minimum voting power required to conduct business at a membership meeting. This is initially set at 60% of the total votes. If a meeting fails to reach this threshold, a subsequent meeting may be called (re-called) where the required quorum is reduced to one-half of the original amount, or 30%.",
      source: "By-Laws Art. II",
      financialNote: null
    },
    {
      term: "Reserve for Replacement",
      definition: "Funds set aside for the long-term repair and replacement of major capital components. The budget specifically accounts for the eventual replacement of the 12,140 sq. ft. parking area and the approximately 12,000 sq. ft. roof.",
      source: "Master Deed, Second Amendment (April 2010)",
      financialNote: { label: "Annual Reserve Contribution", original: "$3,600.00 (1984)", current: "$12,600.00 (2026–27 projected)", note: "Roof: $385,000 est. (25-yr life) | Parking Lot: $210,000 est. (20-yr life, per Second Amendment)" }
    },
    {
      term: "Residential Use",
      definition: "A restriction limiting Units to use as private residences only. The documents prohibit use for business purposes and restrict the accommodation of transient tenants.",
      source: "Master Deed, By-Laws Art. VI",
      financialNote: null
    },
    {
      term: "Right of Access",
      definition: "The Association's legal right to enter a Unit to perform inspections or necessary maintenance and repairs to Common Elements or to address conditions in a Unit that may affect other Units or the common property.",
      source: "Master Deed, By-Laws",
      financialNote: null
    },
    {
      term: "Unit",
      definition: "The individual dwelling space owned in fee simple. Each Unit at Bram Hollow is approximately 1,150 square feet and is designed as a three-bedroom residence.",
      source: "Master Deed",
      financialNote: null
    },
    {
      term: "Unit Owners",
      definition: "Every person or entity who is a record owner of a fee interest in a Unit. Ownership of a Unit is the sole qualification for membership in the Association; however, this term explicitly excludes those holding an interest merely as security for the performance of an obligation, such as a mortgage lender.",
      source: "Master Deed, By-Laws Art. II",
      financialNote: null
    },
    {
      term: "Working Capital Fund",
      definition: "A one-time, non-refundable payment made by each Unit Owner at closing, used for initial maintenance and repairs to Common Elements. This fund is separate from monthly assessments.",
      source: "Purchase Agreement, Exhibit 11",
      financialNote: { label: "Working Capital per Unit", original: "$250.00/unit (1984)", current: "$750.00/unit (2026–27 projected)", note: "Total: 24 units × $750 = $18,000 | Non-refundable, one-time fee" }
    }
  ];

  const filteredDefinitions = definitions.filter(d =>
    d.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.financialNote && (
      d.financialNote.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.financialNote.note.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Community Definitions Glossary</h3>
      </div>

      <Card className="border-2 border-indigo-300 bg-indigo-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-700" />
            <CardTitle className="text-base text-indigo-900">Official Document Definitions</CardTitle>
          </div>
          <CardDescription className="text-indigo-800">
            This glossary is intended to help residents and prospective owners understand the key terms used in
            the Bram Hollow Condominium legal documents. To ensure administrative consistency and professional
            clarity, these definitions are derived directly from the Master Deed, the By-Laws, the New Jersey
            Condominium Act, and the community's financial disclosures.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-indigo-700 italic">
            Financial amounts shown include the original 1984 document amount and the CPI-adjusted 2026–27
            projected amount (approximately 3.1× multiplier). All dollar figures are for reference only and
            subject to Board-adopted budgets.
          </p>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search definitions (e.g., assessment, common elements, reserve...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <p className="text-xs text-slate-500">
        Showing {filteredDefinitions.length} of {definitions.length} definitions
        {searchTerm && ` matching "${searchTerm}"`}
      </p>

      <div className="space-y-4">
        {filteredDefinitions.map((def, index) => (
          <Card key={index} className={`border ${def.financialNote ? 'border-green-200 bg-green-50/30' : 'border-slate-200'}`}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-base text-slate-900">{def.term}</CardTitle>
                <Badge variant="outline" className="text-xs whitespace-nowrap shrink-0">
                  {def.source}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-700 leading-relaxed">{def.definition}</p>
              {def.financialNote && (
                <div className="bg-white border border-green-300 rounded-md p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-700" />
                    <span className="text-sm font-semibold text-green-900">{def.financialNote.label}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-slate-50 rounded px-3 py-2">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Original (1984)</p>
                      <p className="text-sm font-bold text-slate-800">{def.financialNote.original}</p>
                    </div>
                    <div className="bg-green-50 rounded px-3 py-2 border border-green-200">
                      <p className="text-xs text-green-700 uppercase tracking-wider">Current (2026–27)</p>
                      <p className="text-sm font-bold text-green-900">{def.financialNote.current}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 italic">{def.financialNote.note}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDefinitions.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No definitions found matching "{searchTerm}"</p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-6">
          <p className="text-xs text-slate-500 text-center italic">
            Definitions derived from the Master Deed (Book 3687 Page 257), By-Laws, Certificate of Incorporation
            (Book 3676 Page 335), Purchase Agreement (Exhibit 11), and N.J.S.A. 46:8B-1 et seq. This glossary is
            provided for informational reference only and does not supersede the recorded governing documents.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function GoverningDocumentsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Governing Documents</h3>
      </div>

      <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-base font-bold text-amber-900 mb-2">OFFICIAL RECORD NOTICE</h4>
            <p className="text-sm text-amber-800 leading-relaxed">
              The Bram Hollow Condominium Master Deed is recorded at the Hudson County Register in{" "}
              <span className="font-semibold">Book 3687, Page 257</span>.
            </p>
            <p className="text-sm text-amber-800 leading-relaxed mt-1">
              The Certificate of Incorporation is recorded in{" "}
              <span className="font-semibold">Book 3676, Page 335</span>.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-teal-50 border-2 border-teal-400 rounded-lg p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <GraduationCap className="w-6 h-6 text-teal-700 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-base font-bold text-teal-900 mb-2">
              ADMINISTRATIVE PERSONNEL TRAINING REQUIREMENTS
            </h4>
            <p className="text-sm text-teal-800 leading-relaxed mb-3">
              Pursuant to <span className="font-semibold">N.J.S.A. 46:8B-14.4</span>, all members of the Board of Directors
              and association administrators are required to complete education and training on the rights and
              responsibilities of community association governance within a reasonable time after assuming their duties.
            </p>
            <div className="bg-white/60 rounded-md p-4 border border-teal-200">
              <h5 className="text-sm font-semibold text-teal-900 mb-2">Required Training Topics Include:</h5>
              <ul className="text-sm text-teal-800 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">•</span>
                  <span>Governance, fiduciary duties, and ethical obligations of board members</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">•</span>
                  <span>Financial management, budgeting, and reserve fund requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">•</span>
                  <span>New Jersey Condominium Act (N.J.S.A. 46:8B-1 et seq.) and applicable regulations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">•</span>
                  <span>Fair Housing Act compliance and anti-discrimination requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">•</span>
                  <span>Dispute resolution procedures and Alternative Dispute Resolution (ADR)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">•</span>
                  <span>Insurance requirements and risk management for common-interest communities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-600 mt-0.5">•</span>
                  <span>Open meeting requirements, record-keeping, and transparency obligations</span>
                </li>
              </ul>
            </div>
            <p className="text-xs text-teal-700 mt-3 italic">
              Board members and administrators who have not completed the required training should contact the
              management office to arrange enrollment in an approved education program offered by the NJ Department
              of Community Affairs (DCA) or a recognized community association education provider such as CAI-NJ.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-base">Master Deed</CardTitle>
            </div>
            <CardDescription>
              Bram Hollow Condominium Master Deed — Hudson County Register, Book 3687, Page 257
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              The Master Deed establishes the condominium and defines all units, common elements,
              and limited common elements within the Bram Hollow Condominium community.
            </p>
            <Button variant="default" className="w-full" asChild>
              <a href="/documents/master-deed.pdf" target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Download Master Deed (PDF)
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-base">By-Laws</CardTitle>
            </div>
            <CardDescription>
              By-Laws of Bramhollow Condominium Association Inc
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              The By-Laws govern the operation and management of the Association, including
              meeting procedures, voting rights, officer duties, and assessment obligations.
            </p>
            <Button variant="default" className="w-full" asChild>
              <a href="/documents/by-laws.pdf" target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Download By-Laws (PDF)
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-slate-600" />
              <CardTitle className="text-base">Certificate of Incorporation</CardTitle>
            </div>
            <CardDescription>
              Hudson County Register, Book 3676, Page 335
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Official certificate establishing Bramhollow Condominium Association Inc
              as a nonprofit corporation under New Jersey law.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a href="/documents/certificate-of-incorporation.pdf" target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Download Certificate of Incorporation (PDF)
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" />
              <CardTitle className="text-base">Rules & Regulations</CardTitle>
            </div>
            <CardDescription>
              Community rules adopted by the Board of Directors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">
              Current rules and regulations governing community conduct, common area use,
              parking, pets, noise, and other community standards.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a href="/documents/rules-and-regulations.pdf" target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" />
                Download Rules & Regulations (PDF)
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <DocumentSearchTool />

      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-6">
          <p className="text-xs text-slate-500 text-center italic">
            All governing documents are maintained in accordance with N.J.S.A. 46:8B-1 et seq.
            For certified copies, contact the Hudson County Register of Deeds or the Association management office.
            Document search content is provided as a reference guide and does not replace the original recorded documents.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function FinancialTransparencyTab() {
  const operatingBudget = [
    { category: "Part-Time Manager/Superintendent", original1984: "$5,200.00", budgeted2026: "$15,600.00", description: "On-site management, superintendent services (original Master Deed Exhibit 11)" },
    { category: "Common Area Electricity & Heating", original1984: "$2,400.00", budgeted2026: "$8,400.00", description: "Electric, gas for hallways, common areas, exterior lighting" },
    { category: "Insurance", original1984: "$6,274.00", budgeted2026: "$19,450.00", description: "Master policy, general liability, D&O, umbrella coverage" },
    { category: "Ground Maintenance", original1984: "$1,200.00", budgeted2026: "$4,200.00", description: "Lawn care, seasonal plantings, tree trimming, grounds upkeep" },
    { category: "Snow Removal", original1984: "$1,200.00", budgeted2026: "$4,200.00", description: "Seasonal contract — parking lots, driveways, sidewalks, salt/sand" },
    { category: "Miscellaneous Expenses", original1984: "$1,294.00", budgeted2026: "$4,530.00", description: "Office supplies, postage, website, software, meeting expenses" },
    { category: "Legal & Accounting", original1984: "$1,200.00", budgeted2026: "$4,200.00", description: "Association counsel, annual audit, tax preparation" },
    { category: "Contingency Reserve", original1984: "$2,400.00", budgeted2026: "$8,400.00", description: "Emergency repairs, unforeseen expenses" },
    { category: "Reserve for Replacement (Parking Area & Roof)", original1984: "$3,600.00", budgeted2026: "$12,600.00", description: "Per Master Deed — parking lot and roof replacement fund" },
  ];

  const totalOriginal1984 = 24768;
  const totalOperating2026 = 81580;

  const workingCapital = {
    perUnit: "$750.00",
    totalUnits: 24,
    total: "$18,000.00",
    description: "Per Purchase Agreement (Exhibit 11) — non-refundable fee for maintenance and repairs to Common Elements, adjusted to 2026–27 dollars (original: $250.00/unit)"
  };

  const totalBudgetWithCapital = 99580;

  const incomeProjection = [
    { source: "Common Charges (24 Units × $258.00/mo)", original1984: "$24,768.00", projected2026: "$74,304.00", description: "Monthly assessment per unit (original: $86.00/mo adjusted to 2026–27)" },
    { source: "Working Capital Contributions", original1984: "$6,000.00", projected2026: "$18,000.00", description: "24 Units × $750.00 one-time fee (original: $250.00/unit)" },
  ];

  const totalIncome2026 = 92304;

  const reserveSchedule = [
    { item: "Roof Replacement", estLife: "25 yrs", estCost2027: "$385,000", annualContribution: "$7,200.00", note: "Per Master Deed reserve allocation" },
    { item: "Parking Lot Resurface & Maintenance", estLife: "20 yrs", estCost2027: "$210,000", annualContribution: "$5,400.00", note: "Per Second Amendment to Master Deed (April 2010)" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Financial Transparency</h3>
      </div>

      <Card className="border-2 border-red-300 bg-red-50">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-red-900">Assessment Requirement Notice</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-800 leading-relaxed">
            Pursuant to Article VIII of the Association By-Laws, no monthly assessment is informable or collectible
            until a Non-Discretionary Annual Budget is formally adopted and distributed to all owners. Assessments
            must be based on this budget.
          </p>
        </CardContent>
      </Card>

      <Card className="border border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-700" />
            <CardTitle className="text-base text-green-900">Estimated Income — FY 2026</CardTitle>
          </div>
          <CardDescription>
            Based on original Purchase Agreement (Exhibit 11) — 24 units, adjusted to 2026–27 dollars
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-green-100 border-b-2 border-green-300">
                  <th className="text-left py-3 px-4 font-semibold text-green-800">Income Source</th>
                  <th className="text-left py-3 px-4 font-semibold text-green-800 hidden md:table-cell">Description</th>
                  <th className="text-right py-3 px-4 font-semibold text-green-800">Original (1984)</th>
                  <th className="text-right py-3 px-4 font-semibold text-green-800">2026–27 Projected</th>
                </tr>
              </thead>
              <tbody>
                {incomeProjection.map((item, index) => (
                  <tr key={index} className={`border-b border-green-100 ${index % 2 === 0 ? "bg-white" : "bg-green-50/30"}`}>
                    <td className="py-3 px-4 text-slate-700 font-medium">{item.source}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs hidden md:table-cell">{item.description}</td>
                    <td className="py-3 px-4 text-right text-slate-500 font-mono">{item.original1984}</td>
                    <td className="py-3 px-4 text-right text-green-800 font-mono font-semibold">{item.projected2026}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-green-100 border-t-2 border-green-300">
                  <td className="py-3 px-4 font-bold text-green-900">Total Estimated Income</td>
                  <td className="py-3 px-4 hidden md:table-cell"></td>
                  <td className="py-3 px-4 text-right font-bold text-slate-500 font-mono">$30,768.00</td>
                  <td className="py-3 px-4 text-right font-bold text-green-900 font-mono">${totalIncome2026.toLocaleString()}.00</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-slate-600" />
            <CardTitle className="text-base">2026 Statutory Budget — General & Administrative Expenses</CardTitle>
          </div>
          <CardDescription>
            Non-Discretionary Annual Budget — Bramhollow Condominium Association Inc — FY 2026
            <br />
            <span className="text-xs">Derived from Master Deed and Purchase Agreement (Exhibit 11), adjusted to 2026–27 cost of goods.</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-300">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Budget Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 hidden md:table-cell">Description</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Original (1984)</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">2026–27 Budgeted</th>
                </tr>
              </thead>
              <tbody>
                {operatingBudget.map((item, index) => (
                  <tr key={index} className={`border-b border-slate-200 ${index % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                    <td className="py-3 px-4 text-slate-700 font-medium">{item.category}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs hidden md:table-cell">{item.description}</td>
                    <td className="py-3 px-4 text-right text-slate-500 font-mono">{item.original1984}</td>
                    <td className="py-3 px-4 text-right text-slate-700 font-mono">{item.budgeted2026}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 border-t-2 border-slate-300">
                  <td className="py-3 px-4 font-bold text-slate-800">Subtotal Operating Expenses</td>
                  <td className="py-3 px-4 hidden md:table-cell"></td>
                  <td className="py-3 px-4 text-right font-bold text-slate-500 font-mono">${totalOriginal1984.toLocaleString()}.00</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-800 font-mono">${totalOperating2026.toLocaleString()}.00</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-200 bg-purple-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-700" />
            <CardTitle className="text-base text-purple-900">Working Capital Fund — Separate Allocation</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-purple-800 leading-relaxed mb-4">
            Per the Purchase Agreement (Exhibit 11), each buyer pays a one-time, non-refundable fee toward a{" "}
            <span className="font-semibold">Working Capital Account</span> maintained by the Association specifically
            for maintenance and repairs to the Common Elements. This is a separate fund from monthly assessments.
          </p>
          <div className="bg-white/60 rounded-md p-4 border border-purple-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-purple-600 text-xs font-medium">Per Unit Contribution (2026–27)</p>
                <p className="text-purple-900 font-bold text-lg font-mono">{workingCapital.perUnit}</p>
                <p className="text-purple-500 text-xs">Original 1984: $250.00/unit</p>
              </div>
              <div>
                <p className="text-purple-600 text-xs font-medium">Total Working Capital ({workingCapital.totalUnits} Units)</p>
                <p className="text-purple-900 font-bold text-lg font-mono">{workingCapital.total}</p>
                <p className="text-purple-500 text-xs">Original 1984: $6,000.00</p>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-white/60 rounded-md p-3 border border-purple-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-purple-900">Total Allocated Funds (Operating + Working Capital)</span>
              <span className="text-lg font-bold text-purple-900 font-mono">${totalBudgetWithCapital.toLocaleString()}.00</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-base">Capital Reserve Schedule — 2026–2027 Replacement Values</CardTitle>
          </div>
          <CardDescription>
            Per Master Deed reserve allocation and Second Amendment to Master Deed.
            Replacement costs adjusted to 2027 estimated dollars.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-blue-50 border-b-2 border-blue-200">
                  <th className="text-left py-3 px-4 font-semibold text-blue-800">Reserve Component</th>
                  <th className="text-center py-3 px-4 font-semibold text-blue-800">Est. Useful Life</th>
                  <th className="text-right py-3 px-4 font-semibold text-blue-800">Replacement Cost (2027$)</th>
                  <th className="text-right py-3 px-4 font-semibold text-blue-800">Annual Contribution</th>
                  <th className="text-left py-3 px-4 font-semibold text-blue-800 hidden md:table-cell">Source</th>
                </tr>
              </thead>
              <tbody>
                {reserveSchedule.map((item, index) => (
                  <tr key={index} className={`border-b border-blue-100 ${index % 2 === 0 ? "bg-white" : "bg-blue-50/30"}`}>
                    <td className="py-3 px-4 text-slate-700 font-medium">{item.item}</td>
                    <td className="py-3 px-4 text-center text-slate-600">{item.estLife}</td>
                    <td className="py-3 px-4 text-right text-slate-700 font-mono">{item.estCost2027}</td>
                    <td className="py-3 px-4 text-right text-slate-700 font-mono">{item.annualContribution}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs hidden md:table-cell">{item.note}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-blue-50 border-t-2 border-blue-200">
                  <td className="py-3 px-4 font-bold text-blue-900">Total Reserves</td>
                  <td className="py-3 px-4"></td>
                  <td className="py-3 px-4 text-right font-bold text-blue-900 font-mono">$595,000</td>
                  <td className="py-3 px-4 text-right font-bold text-blue-900 font-mono">$12,600.00</td>
                  <td className="py-3 px-4 hidden md:table-cell"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-sm text-amber-900">Parking Lot Reserve — Special Note</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-800 leading-relaxed">
            Per the Second Amendment to the Master Deed (recorded April 22, 2010), parking areas are designated
            as limited common elements. The estimated full replacement cost for the parking lot in 2027 dollars is{" "}
            <span className="font-semibold">$210,000</span>, which includes complete asphalt removal, re-grading,
            new base course, asphalt paving, striping, ADA-compliant accessibility improvements, and drainage upgrades.
          </p>
          <p className="text-sm text-amber-800 leading-relaxed mt-2">
            The snow removal budget of <span className="font-semibold">$4,200.00</span> covers a seasonal contract
            (November–April) for parking lots, driveways, and sidewalks, including salt/sand application. This is
            derived from the original Ground Maintenance allocation split, adjusted to 2026–27 NJ contractor rates.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-6">
          <p className="text-xs text-slate-500 text-center italic">
            This budget is derived from the original Master Deed, Purchase Agreement (Exhibit 11), and By-Laws
            of Bramhollow Condominium Association Inc (1984/1985). All 2026–27 figures are adjusted from original
            amounts using cumulative CPI inflation (~3.1× from 1984 to 2026). Budget is subject to formal
            adoption by the Board of Directors pursuant to N.J.S.A. 46:8B-14 and Article VIII of the By-Laws.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ADRTab() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: "", unitNumber: "", description: "" });
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/adr-requests", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Request Submitted", description: "Your ADR hearing request has been received." });
      setFormData({ name: "", unitNumber: "", description: "" });
      setSubmitted(true);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit request. Please try again.", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.unitNumber.trim() || !formData.description.trim()) {
      toast({ title: "Missing Fields", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    submitMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Alternative Dispute Resolution (ADR)</h3>
      </div>

      <Card className="border-2 border-indigo-200 bg-indigo-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-indigo-700" />
            <CardTitle className="text-base text-indigo-900">ADR Policy</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-indigo-800 leading-relaxed">
            In compliance with New Jersey DCA mandates, Bram Hollow provides a fair and efficient forum for
            resolving internal disputes, including alleged breaches of the peace or nuisance claims. No fine
            or penalty may be levied without first offering the unit owner a hearing before a neutral party.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Request ADR Hearing</CardTitle>
          <CardDescription>
            Complete the form below to request an Alternative Dispute Resolution hearing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-slate-800 mb-2">Request Submitted Successfully</h4>
              <p className="text-sm text-slate-600 mb-4">
                Your ADR hearing request has been received. The management office will contact you
                to schedule a hearing with a neutral party.
              </p>
              <Button variant="outline" onClick={() => setSubmitted(false)}>
                Submit Another Request
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="adr-name" className="text-sm font-medium text-slate-700">Name</label>
                <input
                  id="adr-name"
                  type="text"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="adr-unit" className="text-sm font-medium text-slate-700">Unit Number</label>
                <input
                  id="adr-unit"
                  type="text"
                  placeholder="e.g., 101, 205B"
                  value={formData.unitNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, unitNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="adr-description" className="text-sm font-medium text-slate-700">Description of Dispute</label>
                <textarea
                  id="adr-description"
                  rows={5}
                  placeholder="Please describe the nature of the dispute in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitMutation.isPending}>
                {submitMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Submit ADR Hearing Request
                  </span>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function GovernanceElectionsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Governance & Elections</h3>
      </div>

      <Card className="border-2 border-emerald-300 bg-emerald-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <CardTitle className="text-base text-emerald-900">Owner Standing</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-emerald-800 leading-relaxed">
            Under the Radburn Law, a unit owner is in Good Standing and entitled to vote if they are current on
            all validly assessed fees. Assessments are valid only when derived from an adopted budget as per Article VIII.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Vote className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-base">Special Meeting for Reorganization</CardTitle>
          </div>
          <CardDescription>
            Prepare your voter registration to participate in the upcoming Special Meeting for Reorganization
            of the Board of Directors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            All unit owners in Good Standing are entitled to cast one vote per unit owned at the Special Meeting
            for Reorganization. To confirm your eligibility and register to participate, please complete the
            Voter Registration Form below.
          </p>
          <Button variant="default" className="w-full" asChild>
            <a href="/documents/voter-registration-form.pdf" target="_blank" rel="noopener noreferrer">
              <ClipboardList className="w-4 h-4 mr-2" />
              Voter Registration Form (PDF)
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-sm text-slate-700">Election Procedures</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5 shrink-0">1</Badge>
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-700">Verify Standing:</span> Confirm that all validly
              assessed fees are current. Contact the management office with any questions regarding your account status.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5 shrink-0">2</Badge>
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-700">Register:</span> Complete and submit the Voter
              Registration Form prior to the meeting date.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5 shrink-0">3</Badge>
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-700">Attend:</span> Join the Special Meeting for
              Reorganization in person or via Zoom to cast your vote for Board of Directors candidates.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-0.5 shrink-0">4</Badge>
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-700">Proxy Voting:</span> If you cannot attend, you may
              designate a proxy by completing the proxy form available from the management office.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-6">
          <p className="text-xs text-slate-500 text-center italic">
            Governance procedures are conducted in accordance with the Association By-Laws
            and N.J.S.A. 46:8B-1 et seq. (New Jersey Condominium Act).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function AreaResourcesTab() {
  const pools = [
    {
      name: "Berry Lane Park Pool",
      address: "1000 Bergen Ave, Jersey City, NJ 07306",
      description: "Public outdoor pool operated by Jersey City Parks & Recreation. Open seasonally (Memorial Day through Labor Day). Affordable day passes available for residents.",
      hours: "Memorial Day — Labor Day: 11:00 AM — 7:00 PM daily",
      phone: "(201) 547-4601",
      link: "https://www.jerseycitynj.gov/CityHall/Recreation",
      distance: "Nearest public pool to Bramhollow"
    }
  ];

  const parks = [
    {
      name: "Berry Lane Park",
      address: "1000 Bergen Ave, Jersey City, NJ 07306",
      description: "62-acre urban park featuring walking trails, playground, sports fields, basketball courts, skate park, community garden, and the public swimming pool. Year-round access with seasonal programs.",
      features: ["Walking/jogging trails", "Playground", "Basketball courts", "Skate park", "Community garden", "Picnic areas", "Public pool (seasonal)"],
      link: "https://www.jerseycitynj.gov/CityHall/Recreation"
    },
    {
      name: "Liberty State Park",
      address: "200 Morris Pesin Dr, Jersey City, NJ 07305",
      description: "1,212-acre state park on the Upper New York Bay waterfront with views of the Statue of Liberty, Ellis Island, and Manhattan skyline. Features the Liberty Science Center, nature trails, picnic areas, and ferry service to Liberty and Ellis Islands.",
      features: ["Statue of Liberty views", "Liberty Walk promenade", "Nature trails & bird watching", "Picnic grounds", "Fishing pier", "Ferry to Liberty/Ellis Island", "Playground", "Nature Interpretive Center"],
      link: "https://www.nj.gov/dep/parksandforests/parks/libertystatepark.html"
    }
  ];

  const attractions = [
    {
      name: "Liberty Science Center",
      address: "222 Jersey City Blvd, Jersey City, NJ 07305",
      description: "Interactive science museum and learning center inside Liberty State Park. Features hands-on exhibits, planetarium, IMAX theater, and rotating special exhibitions. Family memberships available.",
      hours: "Wed — Sun: 10:00 AM — 5:00 PM",
      phone: "(201) 200-1000",
      link: "https://lsc.org",
      highlight: "Annual memberships available — great for families with children"
    },
    {
      name: "Statue of Liberty & Ellis Island",
      address: "Ferry from Liberty State Park, Jersey City, NJ",
      description: "National monuments accessible via ferry from Liberty State Park. The Statue of Liberty crown and pedestal tours require advance tickets. Ellis Island features the Immigration Museum with searchable passenger records.",
      hours: "Ferries depart daily — check schedule for seasonal hours",
      phone: "(877) 523-9849",
      link: "https://www.statuecruises.com",
      highlight: "Reserve crown tickets well in advance — they sell out quickly"
    }
  ];

  const jerseyCity = [
    {
      name: "Jersey City Free Public Library",
      address: "472 Jersey Ave, Jersey City, NJ 07302",
      description: "Free library cards for all Jersey City residents. Multiple branches throughout the city offering books, DVDs, computer access, meeting rooms, and community programs.",
      phone: "(201) 547-4500",
      link: "https://www.jclibrary.org",
      services: ["Free library card", "Computer & internet access", "Meeting rooms", "Children's programs", "ESL classes", "Job search assistance"]
    },
    {
      name: "Jersey City Recreation Programs",
      address: "365 Summit Ave, Jersey City, NJ 07306",
      description: "Year-round recreation programs for all ages operated by the city. Includes fitness classes, youth sports leagues, arts programs, senior activities, and seasonal events.",
      phone: "(201) 547-4601",
      link: "https://www.jerseycitynj.gov/CityHall/Recreation",
      services: ["Youth sports leagues", "Fitness classes", "Arts & crafts programs", "Summer camps", "Community events", "Senior programs"]
    },
    {
      name: "Pedestrian Plaza & Downtown Jersey City",
      address: "Newark Ave Pedestrian Plaza, Jersey City, NJ",
      description: "Newark Avenue pedestrian mall in downtown Jersey City featuring restaurants, shops, and regular community events. A gathering spot for food festivals, farmers markets, and cultural celebrations throughout the year.",
      phone: "",
      link: "https://www.jerseycitynj.gov",
      services: ["Restaurants & dining", "Local shopping", "Farmers markets (seasonal)", "Street festivals", "Cultural events"]
    }
  ];

  const seniorServices = [
    {
      name: "Hudson County Office on Aging",
      address: "830 Bergen Ave, Suite 7, Jersey City, NJ 07306",
      description: "Comprehensive services for Hudson County seniors age 60 and older. Provides case management, meal programs, transportation assistance, and referrals to community resources.",
      phone: "(201) 369-4523",
      link: "https://www.hudsoncountynj.org",
      services: ["Meals on Wheels", "Transportation assistance", "Case management", "Caregiver support", "Benefits counseling", "Health screenings"]
    },
    {
      name: "Jersey City Senior Centers",
      address: "Multiple locations throughout Jersey City",
      description: "City-operated senior centers offering daily activities, hot meals, health programs, social events, and educational workshops. Free for Jersey City residents age 60 and older.",
      phone: "(201) 547-4601",
      link: "https://www.jerseycitynj.gov/CityHall/Recreation",
      services: ["Daily hot meals", "Exercise classes", "Social activities", "Health screenings", "Computer classes", "Arts & crafts", "Day trips"]
    },
    {
      name: "PAAD — Pharmaceutical Assistance (State)",
      address: "NJ Department of Human Services",
      description: "New Jersey Pharmaceutical Assistance to the Aged and Disabled (PAAD) helps eligible seniors and disabled residents pay for prescription medications. Income-based eligibility.",
      phone: "(800) 792-9745",
      link: "https://www.nj.gov/humanservices/doas/services/paad/",
      services: ["Prescription drug assistance", "Medicare Part D premium assistance", "Income-based eligibility", "Application assistance available"]
    },
    {
      name: "NJ EASE — Aging & Disability Resource",
      address: "Available by phone and online",
      description: "New Jersey's statewide information and referral service for seniors and adults with disabilities. Connects callers with local services including home care, benefits, housing, and transportation.",
      phone: "(877) 222-3737",
      link: "https://www.nj.gov/humanservices/doas/services/njease/",
      services: ["Information & referral", "Benefits screening", "Home care services", "Transportation options", "Housing assistance", "Long-term care planning"]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Area Resources & Community Services</h3>
      </div>

      <Card className="border border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800 leading-relaxed text-center">
            A guide to local parks, recreation, attractions, and services available to Bramhollow residents
            in Jersey City and Hudson County. All links open in a new tab.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h4 className="text-base font-semibold text-blue-800 flex items-center gap-2">
          <Waves className="w-5 h-5" />
          Nearest Public Pool
        </h4>
        {pools.map((pool, i) => (
          <Card key={i} className="border-blue-200">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{pool.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {pool.address}
                  </CardDescription>
                </div>
                <Badge className="bg-blue-600 text-white shrink-0">{pool.distance}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-slate-600">{pool.description}</p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {pool.hours}</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {pool.phone}</span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={pool.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3 mr-1" /> Visit Website
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="text-base font-semibold text-green-800 flex items-center gap-2">
          <TreePine className="w-5 h-5" />
          Parks & Outdoor Recreation
        </h4>
        {parks.map((park, i) => (
          <Card key={i} className="border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{park.name}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {park.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">{park.description}</p>
              <div className="flex flex-wrap gap-2">
                {park.features.map((feature, j) => (
                  <Badge key={j} variant="outline" className="text-xs border-green-300 text-green-700">{feature}</Badge>
                ))}
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={park.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3 mr-1" /> Visit Website
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="text-base font-semibold text-amber-800 flex items-center gap-2">
          <Landmark className="w-5 h-5" />
          Attractions & Cultural Destinations
        </h4>
        {attractions.map((item, i) => (
          <Card key={i} className="border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{item.name}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {item.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-slate-600">{item.description}</p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.hours}</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {item.phone}</span>
              </div>
              {item.highlight && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-1.5 italic">{item.highlight}</p>
              )}
              <Button variant="outline" size="sm" asChild>
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3 mr-1" /> Visit Website
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="text-base font-semibold text-purple-800 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Jersey City Community & Recreation
        </h4>
        {jerseyCity.map((item, i) => (
          <Card key={i} className="border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{item.name}</CardTitle>
              {item.address && (
                <CardDescription className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" /> {item.address}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">{item.description}</p>
              {item.phone && (
                <p className="text-xs text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {item.phone}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {item.services.map((service, j) => (
                  <Badge key={j} variant="outline" className="text-xs border-purple-300 text-purple-700">{service}</Badge>
                ))}
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3 mr-1" /> Visit Website
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="text-base font-semibold text-rose-800 flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Senior Services & Assistance Programs
        </h4>
        <Card className="border border-rose-200 bg-rose-50">
          <CardContent className="pt-4">
            <p className="text-sm text-rose-800 leading-relaxed">
              The following resources are available to seniors (generally age 60+) and adults with disabilities
              in Hudson County and New Jersey. Most services are free or income-based.
            </p>
          </CardContent>
        </Card>
        {seniorServices.map((item, i) => (
          <Card key={i} className="border-rose-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{item.name}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {item.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">{item.description}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {item.phone}</p>
              <div className="flex flex-wrap gap-2">
                {item.services.map((service, j) => (
                  <Badge key={j} variant="outline" className="text-xs border-rose-300 text-rose-700">{service}</Badge>
                ))}
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3 mr-1" /> Visit Website
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-6">
          <p className="text-xs text-slate-500 text-center italic">
            Resource listings are provided as a community service and do not constitute endorsement by
            Bramhollow Condominium Association Inc. Hours, availability, and contact information may change.
            Please verify details with each organization directly. If you know of a resource that should be
            listed here, please contact the Board.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function OurResetTab() {
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);

  const issueInfo = {
    title: "Our Reset",
    subtitle: "Special Edition Newsletter",
    tagline: "Bringing Bramhollow Back Into Full Statutory Compliance",
    issueNumber: "Vol. 1 — Inaugural Issue",
    date: "Spring 2026",
    description: "\"Our Reset\" is a running special edition newsletter documenting Bramhollow Condominium Association's journey back into full compliance with the New Jersey Condominium Act (N.J.S.A. 46:8B-1 et seq.). Each issue will feature articles on the changes underway, the legal requirements being addressed, and what they mean for every owner."
  };

  const articles = [
    {
      number: 1,
      title: "Why We're Here: Understanding Bramhollow's Compliance Gap",
      status: "Published",
      summary: "An honest look at how the Association drifted from the statutory requirements of the NJ Condominium Act — and why correcting course protects every owner's investment.",
      topics: [
        "Historical context: Bramhollow's founding in 1985 under N.J.S.A. 46:8B-1 et seq.",
        "Key areas where practices diverged from statutory mandates",
        "What 'compliance' actually means for a NJ condominium association",
        "The cost of non-compliance: legal exposure, owner liability, and property values",
        "The reset commitment: transparent governance going forward"
      ],
      content: [
        {
          heading: "A Community Built on Law",
          body: "Bramhollow Condominium Association was established in 1985 under the New Jersey Condominium Act, N.J.S.A. 46:8B-1 et seq. Like every condominium in New Jersey, our community was created by recording a Master Deed with the Hudson County Register (Book 3687, Page 257) and incorporating the Association as a nonprofit entity (Book 3676, Page 335). These documents, along with the By-Laws and Purchase Agreement, form the legal foundation of every owner's property rights — and the rules the Association is required to follow."
        },
        {
          heading: "Where We Drifted",
          body: "Over the years, certain statutory requirements fell out of regular practice. No formal Non-Discretionary Annual Budget was adopted and distributed to owners before assessments were collected — a requirement under Article VIII of the By-Laws. Reserve fund contributions for the roof and parking lot were not maintained at levels consistent with the original Master Deed allocations. Meeting notice procedures did not consistently meet the 48-hour advance requirement under N.J.S.A. 46:8B-12. Board elections and governance procedures were not always conducted in accordance with the By-Laws. Required training for administrative personnel under N.J.S.A. 46:8B-14.4 was not documented or tracked. And governing documents — the very foundation of the Association — were not readily accessible to all owners as required by law."
        },
        {
          heading: "What Compliance Actually Means",
          body: "Compliance is not a bureaucratic exercise. The NJ Condominium Act exists specifically to protect the rights and investments of unit owners. When the statute requires a budget before assessments, it ensures owners know what they are paying for. When it requires 48-hour meeting notices, it ensures every owner has a fair chance to participate in decisions affecting their property. When it mandates reserves, it prevents special assessments and protects property values. Every requirement in the statute corresponds to a right that belongs to you as an owner."
        },
        {
          heading: "The Real Cost of Non-Compliance",
          body: "Operating outside statutory requirements is not just a technical violation — it carries real consequences. Assessments collected without a properly adopted budget may lack legal enforceability. Decisions made at improperly noticed meetings can be challenged. Underfunded reserves lead to deferred maintenance, emergency special assessments, and declining property values. Board members who have not completed required training expose themselves and the Association to liability. And when owners cannot access their own governing documents, trust in the community erodes."
        },
        {
          heading: "The Reset Commitment",
          body: "\"Our Reset\" is exactly what the name says — a new beginning. The Association is undertaking a comprehensive review and correction of all areas where practices have diverged from statutory requirements. This includes reconstructing the annual budget from the original 1984 governing documents, establishing proper reserve funding, ensuring all meeting and election procedures comply with NJ law, making governing documents available to every owner, implementing the ADR process required by the Department of Community Affairs, and building a digital management platform that makes transparency the default rather than the exception. This newsletter will document every step of that journey, openly and honestly."
        }
      ]
    },
    {
      number: 2,
      title: "Your Rights Under the NJ Condominium Act — In Plain Language",
      status: "Published",
      summary: "Every unit owner has rights guaranteed by state law. This article breaks down N.J.S.A. 46:8B-1 et seq. into everyday language so every resident understands what they're entitled to.",
      topics: [
        "Right to inspect association books, records, and governing documents",
        "Right to a properly adopted annual budget before assessments are collected",
        "Right to vote in board elections and on major association decisions",
        "Right to notice of meetings (48 hours minimum per N.J.S.A. 46:8B-12)",
        "Right to Alternative Dispute Resolution through NJ DCA",
        "Protection against conflicts of interest on the board"
      ],
      content: [
        {
          heading: "You Have Rights — And They're Written Into State Law",
          body: "As a unit owner at Bramhollow, you are not just a tenant or a resident — you are a co-owner of a legal entity governed by the New Jersey Condominium Act (N.J.S.A. 46:8B-1 et seq.). This law was enacted specifically to protect people in your position. It establishes a set of rights that the Association is legally required to respect. These are not suggestions or courtesies — they are enforceable obligations."
        },
        {
          heading: "Your Right to See the Books",
          body: "Under N.J.S.A. 46:8B-14, every unit owner has the right to inspect the Association's financial records, meeting minutes, contracts, and governing documents. This means the budget, the bank statements, the management contracts, the insurance policies, and the minutes from every board meeting. If you ask to see these records, the Association must provide access. You should never be told that financial information is \"confidential\" or \"not available.\" It belongs to you as an owner."
        },
        {
          heading: "Your Right to a Proper Budget Before You Pay",
          body: "Article VIII of the Association By-Laws requires that a Non-Discretionary Annual Budget be formally adopted and distributed to all owners before monthly assessments can be collected. This is not optional. If you are being asked to pay a monthly common charge, that amount must be based on an itemized budget that has been approved by the Board and shared with every owner. Without a proper budget, the legal basis for collecting assessments is in question."
        },
        {
          heading: "Your Right to Vote",
          body: "The By-Laws establish your right to vote in board elections and on major decisions affecting the Association. Every unit owner in good standing is entitled to cast a vote for Board of Directors seats. Certain major decisions — such as amendments to the Master Deed or By-Laws, special assessments beyond a threshold, or changes to common elements — require owner approval. Your vote is your voice in how this community is governed."
        },
        {
          heading: "Your Right to Meeting Notice",
          body: "N.J.S.A. 46:8B-12 requires that owners receive at least 48 hours' advance written notice of any board meeting. This notice must include the date, time, location, and agenda. The purpose of this law is simple: you cannot participate in governance if you don't know when decisions are being made. Emergency meetings are permitted under narrow circumstances, but routine board business requires proper notice — every time."
        },
        {
          heading: "Your Right to Dispute Resolution",
          body: "New Jersey law provides a formal Alternative Dispute Resolution (ADR) process through the Department of Community Affairs (DCA). If you have a dispute with the Association — whether it involves assessments, maintenance responsibilities, rule enforcement, or governance — you have the right to request a hearing through the DCA before the matter goes to court. This process is designed to be more accessible and less expensive than litigation. The Association has established an ADR request form on this portal to make it easy for any owner to begin this process."
        },
        {
          heading: "Protection Against Conflicts of Interest",
          body: "The NJ Condominium Act and the Association By-Laws prohibit board members from engaging in self-dealing or conflicts of interest. Board members cannot vote on contracts in which they have a personal financial interest. They cannot use their position to benefit themselves at the expense of the community. If you observe a potential conflict of interest, you have the right to raise the issue — and the board has a duty to address it transparently."
        },
        {
          heading: "How to Exercise Your Rights",
          body: "Knowing your rights is the first step. Exercising them is the next. Request copies of governing documents through the Documents tab of this portal. Review the annual budget in the Financial Transparency section. Attend board meetings — you will receive proper notice. Register to vote using the form in the Governance & Elections section. If you have a dispute, submit an ADR request through the ADR tab. This system was built to make these rights accessible to every owner, not just those with legal training."
        }
      ]
    },
    {
      number: 3,
      title: "The Budget Reset: Reconstructing Our Finances from the Ground Up",
      status: "Published",
      summary: "How the original 1984 Master Deed budget (Exhibit 11) was reconstructed and what the 2026-27 operating budget actually covers — line by line.",
      topics: [
        "The original 9-line-item budget from the Purchase Agreement (Exhibit 11)",
        "Why the Association needs a Non-Discretionary Annual Budget per Article VIII of the By-Laws",
        "Understanding the 3.1× CPI inflation adjustment from 1984 to 2026",
        "Working Capital Fund: what it is, who pays, and how it's used",
        "Reserve for Replacement: the parking lot and roof funds explained",
        "What happens when assessments are collected without a proper budget"
      ],
      content: [
        {
          heading: "Starting from the Source",
          body: "When Bramhollow was established in 1984, the Purchase Agreement included a detailed budget as Exhibit 11. This original budget laid out exactly what the Association's operating expenses were expected to be, how much each unit owner would pay monthly, and how a separate Working Capital fund would be established. That document is the foundation of every financial obligation the Association has today. Rather than create a new budget from scratch, we went back to this source document and reconstructed the budget line by line."
        },
        {
          heading: "The Original Nine Line Items",
          body: "The 1984 budget was straightforward — nine categories covering every aspect of Association operations. Part-Time Manager/Superintendent at $5,200 per year. Common Area Electricity and Heating at $2,400. Insurance at $6,274 — the single largest expense even in 1984. Ground Maintenance and Snow Removal together at $2,400. Miscellaneous Expenses at $1,294. Legal and Accounting at $1,200. A Contingency Reserve of $2,400 for emergencies. And a Reserve for Replacement of $3,600 covering the parking area and roof. Total annual operating expenses: $24,768 — funded by 24 units each paying $86 per month."
        },
        {
          heading: "Why a Formal Budget Matters",
          body: "Article VIII of the By-Laws is clear: no monthly assessment is collectible until a Non-Discretionary Annual Budget is formally adopted and distributed to all owners. This is not a technicality — it is a fundamental protection. The budget tells every owner exactly what their money pays for. It establishes the legal basis for the assessment amount. It ensures the Association is funding its obligations — including reserves — rather than spending based on whatever cash is available. Without a proper budget, assessments lack a documented legal foundation."
        },
        {
          heading: "From 1984 to 2026: The CPI Adjustment",
          body: "Forty-one years of inflation have changed the cost of everything. To bring the original budget categories into 2026-27 dollars, we applied the cumulative Consumer Price Index (CPI) adjustment — approximately 3.1 times the original amounts. This is a standard, defensible method used by reserve study professionals and association accountants nationwide. The Part-Time Manager position that cost $5,200 in 1984 now reflects $15,600 in 2026 dollars. Insurance that was $6,274 is now $19,450. The total operating budget grows from $24,768 to $81,580 — not because expenses were added, but because the same expenses cost more today."
        },
        {
          heading: "Working Capital: A Separate Fund",
          body: "The Purchase Agreement established a Working Capital Account that is distinct from monthly assessments. Each buyer was originally required to contribute a one-time, non-refundable fee of $250 at or before closing. This fund — totaling $6,000 across all 24 units — is maintained by the Association specifically for maintenance and repairs to Common Elements. Adjusted to 2026-27 dollars, this translates to approximately $750 per unit, or $18,000 total. This is not an operating expense — it is a capital reserve held separately for its designated purpose."
        },
        {
          heading: "Reserve for Replacement: Roof and Parking Lot",
          body: "The original budget allocated $3,600 per year to a Reserve for Replacement covering the parking area and roof. In 2026-27 dollars, this contribution is $12,600 annually. The Second Amendment to the Master Deed (recorded April 2010) designated the parking areas as limited common elements, establishing a specific obligation to maintain and replace them. Current estimated replacement costs are $385,000 for the roof (25-year useful life) and $210,000 for the parking lot (20-year useful life). N.J.S.A. 46:8B-14(g) requires the Association to maintain adequate reserves for these major components — not just budget for them, but actually fund them year over year."
        },
        {
          heading: "What Happens Without a Proper Budget",
          body: "When assessments are collected without a formally adopted budget, several problems compound over time. Owners have no documented basis for what they are paying. Reserve contributions may be skipped or diverted to cover operating shortfalls. Deferred maintenance accumulates until it becomes an emergency requiring a special assessment. The legal enforceability of the assessments themselves can be challenged. And perhaps most importantly, trust between the Board and the owners erodes. The budget reconstruction documented on this portal's Financial Transparency tab is designed to end that cycle — permanently."
        },
        {
          heading: "Where to Find the Numbers",
          body: "The complete reconstructed budget is available on the Financial Transparency tab of this portal. Every line item shows both the original 1984 amount and the adjusted 2026-27 figure. The Working Capital Fund is displayed as a separate allocation. The Reserve Schedule shows estimated replacement costs and annual contribution targets. The Estimated Income section shows how monthly assessments and working capital contributions fund the total budget. All of this information is available to every owner, at any time — because that is what the law requires."
        }
      ]
    },
    {
      number: 4,
      title: "Governing Documents: What They Say and Why They Matter Now",
      status: "Planned",
      summary: "The Master Deed, By-Laws, and Certificate of Incorporation aren't just paperwork — they're the legal foundation of your property rights. Here's what every owner should know.",
      topics: [
        "Master Deed (Book 3687, Page 257): what it establishes and its legal weight",
        "Certificate of Incorporation (Book 3676, Page 335): the Association as a legal entity",
        "By-Laws: rules for governance, elections, meetings, and assessments",
        "Second Amendment to Master Deed (April 2010): parking area changes",
        "How to obtain and review your own copies of these documents",
        "When and how governing documents can be amended"
      ]
    },
    {
      number: 5,
      title: "Elections & Owner Standing: Who Can Vote and Who Can Serve",
      status: "Planned",
      summary: "Board elections are the backbone of condominium self-governance. This article covers Radburn Law, voter eligibility, and how to ensure elections are conducted properly.",
      topics: [
        "Radburn Association v. Town of Fair Lawn: the landmark NJ case and its impact",
        "Who is eligible to vote in board elections under the By-Laws",
        "Who can serve on the Board of Directors",
        "Special Meeting for Reorganization: when and why it's needed",
        "Step-by-step election procedures compliant with NJ law",
        "The Voter Registration Form and how to use it"
      ]
    },
    {
      number: 6,
      title: "Reserve Funds: Protecting Our Common Elements for the Long Term",
      status: "Planned",
      summary: "New Jersey law requires condominium associations to maintain adequate reserves. Here's what that means for Bramhollow's roof, parking lot, and shared infrastructure.",
      topics: [
        "N.J.S.A. 46:8B-14(g): the statutory mandate for reserve funding",
        "Roof replacement reserve: $385,000 estimated — how we're planning",
        "Parking lot reserve: $210,000 per the Second Amendment to Master Deed",
        "What a professional Reserve Study covers and why it matters",
        "The difference between operating funds and reserve funds",
        "Underfunded reserves: risks to owners and the association"
      ]
    },
    {
      number: 7,
      title: "Dispute Resolution Without Court: Understanding the ADR Process",
      status: "Planned",
      summary: "New Jersey provides a formal Alternative Dispute Resolution process through the Department of Community Affairs. This article explains how it works and how to access it.",
      topics: [
        "NJ DCA's role in condominium dispute resolution",
        "Types of disputes eligible for ADR proceedings",
        "How to file an ADR hearing request through the Association portal",
        "What to expect during the ADR process",
        "When ADR is required before pursuing court action",
        "Protections for owners who participate in ADR"
      ]
    },
    {
      number: 8,
      title: "Board Member Training: A Legal Requirement, Not a Suggestion",
      status: "Planned",
      summary: "N.J.S.A. 46:8B-14.4 requires administrative personnel to complete training. This article covers what training is mandated and what topics must be addressed.",
      topics: [
        "The statutory training requirement under N.J.S.A. 46:8B-14.4",
        "Required training topics: budgeting, insurance, reserves, fair housing, ethics",
        "Who qualifies as 'administrative personnel' under the statute",
        "Available training resources and programs in New Jersey",
        "Consequences of non-compliance with the training mandate",
        "How Bramhollow will track and verify training completion"
      ]
    },
    {
      number: 9,
      title: "Digital Transparency: Your New Association Management Portal",
      status: "Planned",
      summary: "The new Bramhollow management system puts budgets, documents, service requests, and meeting notices at every owner's fingertips — built for transparency and statutory compliance.",
      topics: [
        "Overview of the new digital management platform",
        "How to access governing documents, budgets, and reserve schedules online",
        "Submitting and tracking service requests",
        "Meeting notices and the 48-hour rule in the digital age",
        "The automation system: how routine compliance tasks are handled",
        "Technical Credits: acknowledging the systems gifted to the Association"
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Published": return <Badge className="bg-green-600 text-white">Published</Badge>;
      case "Featured": return <Badge className="bg-amber-600 text-white">Featured</Badge>;
      case "In Progress": return <Badge className="bg-blue-600 text-white">In Progress</Badge>;
      case "Planned": return <Badge variant="outline">Planned</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-2">
            <div className="bg-amber-700 text-white px-6 py-1 rounded-sm text-xs font-semibold tracking-[0.3em] uppercase">
              Special Edition
            </div>
          </div>
          <CardTitle className="text-3xl font-serif text-amber-900 tracking-tight">{issueInfo.title}</CardTitle>
          <div className="w-24 h-1 bg-amber-600 mx-auto my-2" />
          <p className="text-sm font-medium text-amber-800 italic">{issueInfo.tagline}</p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-amber-700">
            <span>{issueInfo.issueNumber}</span>
            <span className="w-1 h-1 bg-amber-500 rounded-full" />
            <span>{issueInfo.date}</span>
            <span className="w-1 h-1 bg-amber-500 rounded-full" />
            <span>Bramhollow Condominium Assoc Inc</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-white/60 rounded-md p-4 border border-amber-200 mt-2">
            <p className="text-sm text-amber-900 leading-relaxed text-center italic">
              {issueInfo.description}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6 text-center">
            <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">{articles.length}</p>
            <p className="text-xs text-blue-700">Articles Planned</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-900">{articles.filter(a => a.status === "Published").length}</p>
            <p className="text-xs text-amber-700">Published</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6 text-center">
            <Scale className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">N.J.S.A. 46:8B</p>
            <p className="text-xs text-green-700">Statutory Framework</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-amber-600" />
          Article Index
        </h3>

        {articles.map((article) => (
          <Card
            key={article.number}
            className={`cursor-pointer transition-all hover:shadow-md ${
              article.status === "Featured" ? "border-amber-300 bg-amber-50/50" :
              article.status === "In Progress" ? "border-blue-200" : ""
            }`}
            onClick={() => setExpandedArticle(expandedArticle === article.number ? null : article.number)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      Art. {article.number}
                    </span>
                    {getStatusBadge(article.status)}
                  </div>
                  <CardTitle className="text-base text-slate-800 leading-snug">{article.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 leading-relaxed">{article.summary}</p>

              {expandedArticle === article.number && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  {article.content ? (
                    <div className="space-y-6">
                      {article.content.map((section, i) => (
                        <div key={i}>
                          <h4 className="text-sm font-bold text-slate-800 mb-2">{section.heading}</h4>
                          <p className="text-sm text-slate-700 leading-relaxed">{section.body}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Planned Topics</p>
                      <ul className="space-y-2">
                        {article.topics.map((topic, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                            <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-6">
          <p className="text-xs text-slate-500 text-center italic">
            "Our Reset" is published by Bramhollow Condominium Association Inc as part of its commitment to
            statutory compliance and transparent governance under N.J.S.A. 46:8B-1 et seq. New articles will
            be added as compliance milestones are reached. Back issues will remain available for all owners.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function NewsletterTab({ user }: { user: any }) {
  // Only show newsletter generation for managers and admins
  if (user?.role !== 'manager' && user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">Newsletter Generation</h3>
        <p className="text-slate-500">
          Newsletter creation is restricted to managers and administrators.
        </p>
      </div>
    );
  }

  return <NewsletterGenerator />;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Type guard to ensure user has the expected properties
  const typedUser = user as { firstName?: string; lastName?: string; role?: string; profileImageUrl?: string; unitNumber?: string } | null;

  if (!typedUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader user={typedUser} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Welcome back, {typedUser?.firstName || 'User'}!
          </h2>
          <p className="text-slate-600">
            Here's what's happening in your community today.
          </p>
        </div>

        <div className="mb-6 border-2 border-red-600 bg-red-50 rounded-lg p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <Bell className="w-6 h-6 text-red-700 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-base font-extrabold text-red-900 uppercase tracking-wide mb-2">
                OFFICIAL NOTICE — DIGITAL COMMUNICATION POLICY
              </h3>
              <div className="bg-white/70 rounded-md p-4 border border-red-300 space-y-3">
                <p className="text-sm text-red-900 leading-relaxed">
                  <span className="font-bold">Effective Date: March 1, 2026</span>
                  <span className="mx-2">|</span>
                  <span className="font-bold">This Notice Remains in Effect Until Formally Rescinded by the Board of Directors</span>
                </p>
                <div className="border-t border-red-200 pt-3">
                  <p className="text-sm text-red-900 leading-relaxed font-semibold">
                    Pursuant to the New Jersey Uniform Electronic Transactions Act (N.J.S.A. 12A:12-1 et seq.)
                    and in accordance with the Association By-Laws and N.J.S.A. 46:8B-12, the Board of Directors
                    of Bramhollow Condominium Association Inc hereby establishes the following Digital
                    Communication and Notice Policy:
                  </p>
                </div>
                <div className="space-y-2 text-sm text-red-900">
                  <p className="leading-relaxed">
                    <span className="font-bold">1. Official Notice by Website Publication.</span>{" "}
                    All notices, announcements, meeting notices, budget disclosures, policy updates, and official
                    Association communications posted to this website (<span className="font-semibold">Bramhollow Management Portal</span>)
                    shall constitute valid and effective notice to all unit owners, residents, and principals upon
                    the date and time of posting. Publication on this website satisfies the written notice requirements
                    of the Association By-Laws and applicable New Jersey law.
                  </p>
                  <p className="leading-relaxed">
                    <span className="font-bold">2. Owner Obligation to Monitor.</span>{" "}
                    All unit owners, residents, and authorized principals are required to regularly check this
                    website as the <span className="font-bold underline">primary and first line of communication</span>{" "}
                    for all Association business, notices, and correspondence. Failure to check the website does
                    not excuse an owner from the obligations or deadlines contained in any posted notice.
                  </p>
                  <p className="leading-relaxed">
                    <span className="font-bold">3. Contact and Correspondence.</span>{" "}
                    This website serves as the official point of contact for Association personnel, Board
                    communications, service requests, and all other Association-related correspondence. Owners
                    should direct inquiries through the website's service request system, ADR request form, or
                    other designated communication channels.
                  </p>
                  <p className="leading-relaxed">
                    <span className="font-bold">4. Supplemental Notice.</span>{" "}
                    Where required by statute or governing documents, the Association may also provide notice via
                    U.S. mail, email, or physical posting. However, website publication alone shall be deemed
                    sufficient notice for all purposes unless a specific statute requires an additional form of delivery.
                  </p>
                  <p className="leading-relaxed">
                    <span className="font-bold">5. Consent to Electronic Communication.</span>{" "}
                    By accessing and using this website, all unit owners and residents acknowledge and consent
                    to electronic communication and notice in accordance with N.J.S.A. 12A:12-1 et seq.
                    (NJ Uniform Electronic Transactions Act).
                  </p>
                </div>
                <div className="border-t border-red-200 pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-red-800">Adopted by the Board of Directors</p>
                    <p className="text-xs text-red-700">Bramhollow Condominium Association Inc</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-red-800">Effective: March 1, 2026</p>
                    <p className="text-xs text-red-700">Expiration: None — Until Rescinded</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-red-700 mt-3 italic">
                Legal Authority: N.J.S.A. 12A:12-1 et seq. (Uniform Electronic Transactions Act);
                N.J.S.A. 46:8B-12 (Meeting Notice Requirements); Association By-Laws, Articles V & VI.
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className={`inline-flex w-full min-w-fit ${typedUser?.role === 'manager' || typedUser?.role === 'admin' ? '' : ''}`}>
              <TabsTrigger value="overview">
                <Settings className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="announcements">
                <Bell className="w-4 h-4 mr-2" />
                News
              </TabsTrigger>
              <TabsTrigger value="definitions">
                <BookOpen className="w-4 h-4 mr-2" />
                Definitions
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="w-4 h-4 mr-2" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="financial">
                <DollarSign className="w-4 h-4 mr-2" />
                Financial
              </TabsTrigger>
              <TabsTrigger value="adr">
                <Gavel className="w-4 h-4 mr-2" />
                ADR
              </TabsTrigger>
              <TabsTrigger value="governance">
                <Vote className="w-4 h-4 mr-2" />
                Governance
              </TabsTrigger>
              <TabsTrigger value="events">
                <Calendar className="w-4 h-4 mr-2" />
                Events
              </TabsTrigger>
              <TabsTrigger value="amenities">
                <Users className="w-4 h-4 mr-2" />
                Amenities
              </TabsTrigger>
              <TabsTrigger value="area-resources">
                <MapPin className="w-4 h-4 mr-2" />
                Area Resources
              </TabsTrigger>
              <TabsTrigger value="our-reset">
                <FileText className="w-4 h-4 mr-2" />
                Our Reset
              </TabsTrigger>
              <TabsTrigger value="newsletter">
                <Mail className="w-4 h-4 mr-2" />
                Newsletter
              </TabsTrigger>
              {(typedUser?.role === 'manager' || typedUser?.role === 'admin') && (
                <TabsTrigger value="admin">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="overview">
            <ServiceRequestsTab />
          </TabsContent>

          <TabsContent value="announcements">
            <AnnouncementsTab />
          </TabsContent>

          <TabsContent value="definitions">
            <CommunityDefinitionsTab />
          </TabsContent>

          <TabsContent value="documents">
            <GoverningDocumentsTab />
          </TabsContent>

          <TabsContent value="financial">
            <FinancialTransparencyTab />
          </TabsContent>

          <TabsContent value="adr">
            <ADRTab />
          </TabsContent>

          <TabsContent value="governance">
            <GovernanceElectionsTab />
          </TabsContent>

          <TabsContent value="events">
            <EventsTab />
          </TabsContent>

          <TabsContent value="amenities">
            <AmenitiesTab />
          </TabsContent>

          <TabsContent value="area-resources">
            <AreaResourcesTab />
          </TabsContent>

          <TabsContent value="our-reset">
            <OurResetTab />
          </TabsContent>

          <TabsContent value="newsletter">
            <NewsletterTab user={typedUser} />
          </TabsContent>

          {(typedUser?.role === 'manager' || typedUser?.role === 'admin') && (
            <TabsContent value="admin">
              <AdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </main>

      <section className="bg-slate-100 border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Technical Credits</h4>
            <div className="w-16 h-px bg-slate-300 mx-auto mb-4" />
            <p className="text-sm text-slate-600 leading-relaxed">
              Digital Infrastructure and Statutory Reconstruction provided as a professional service by{" "}
              <span className="font-semibold text-slate-800">Mr Scott: Unit 295A 2nd Fl</span>.
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Estimated Value of Technical & Administrative Systems Gifted to Association:{" "}
              <span className="font-semibold text-slate-800">$8,000.00</span>
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-slate-800 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-slate-400 text-center">
            This repository is maintained for Statutory Compliance with N.J.S.A. 46:8B-1 et seq.
          </p>
        </div>
      </footer>
    </div>
  );
}