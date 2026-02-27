import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Users, 
  Calendar, 
  FileText, 
  Upload, 
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap
} from "lucide-react";
import AutomationDashboard from "./automation-dashboard";

// Form schemas
const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  type: z.enum(["general", "urgent", "newsletter", "maintenance", "financial"]),
  priority: z.enum(["low", "medium", "high"]),
  publishDate: z.string().optional(),
  expirationDate: z.string().optional(),
});

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  eventDate: z.string().min(1, "Event date is required"),
  location: z.string().optional(),
  maxAttendees: z.number().min(1).optional(),
  requiresApproval: z.boolean().default(false),
});

const amenitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().optional(),
  capacity: z.number().min(1).optional(),
  hourlyRate: z.number().min(0).optional(),
  isAvailable: z.boolean().default(true),
  bookingRules: z.string().optional(),
});

const unitSchema = z.object({
  unitNumber: z.string().min(1, "Unit number is required"),
  floor: z.number().min(1, "Floor is required"),
  squareFootage: z.number().min(1).optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  balcony: z.boolean().default(false),
  parkingSpaces: z.number().min(0).default(0),
});

interface AnnouncementFormProps {
  onSuccess: () => void;
  editData?: any;
}

function AnnouncementForm({ onSuccess, editData }: AnnouncementFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm({
    resolver: zodResolver(announcementSchema),
    defaultValues: editData || {
      title: "",
      content: "",
      type: "general",
      priority: "medium",
      publishDate: "",
      expirationDate: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (editData) {
        return await apiRequest('PATCH', `/api/announcements/${editData.id}`, data);
      } else {
        return await apiRequest('POST', '/api/announcements', data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Announcement ${editData ? 'updated' : 'created'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/announcements'] });
      onSuccess();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save announcement",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Announcement title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Announcement content" 
                  rows={6}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="publishDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Publish Date (Optional)</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expirationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiration Date (Optional)</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : editData ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

function AnnouncementManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['/api/announcements'],
  });

  const handleEdit = (announcement: any) => {
    setEditingAnnouncement(announcement);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAnnouncement(null);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading announcements...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Announcement Management</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAnnouncement(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
              </DialogTitle>
              <DialogDescription>
                {editingAnnouncement ? 
                  'Update the announcement details below.' : 
                  'Fill in the details to create a new community announcement.'
                }
              </DialogDescription>
            </DialogHeader>
            <AnnouncementForm 
              onSuccess={handleCloseDialog} 
              editData={editingAnnouncement}
            />
          </DialogContent>
        </Dialog>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(announcement)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-2">
                {announcement.content.slice(0, 200)}...
              </p>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Created: {new Date(announcement.createdAt).toLocaleDateString()}
                </span>
                {announcement.publishDate && (
                  <span>
                    Publish: {new Date(announcement.publishDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )) : <p className="text-center text-slate-500">No announcements found.</p>}
      </div>
    </div>
  );
}

function ServiceRequestManagement() {
  const { data: serviceRequests, isLoading } = useQuery({
    queryKey: ['/api/service-requests'],
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest('PATCH', `/api/service-requests/${id}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Service request status updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading service requests...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Service Request Management</h3>
      
      <div className="grid gap-4">
        {serviceRequests && Array.isArray(serviceRequests) ? serviceRequests.map((request: any) => (
          <Card key={request.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{request.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    request.status === 'completed' ? 'default' : 
                    request.status === 'in_progress' ? 'secondary' : 
                    'outline'
                  }>
                    {request.status === 'in_progress' ? (
                      <><Clock className="w-3 h-3 mr-1" /> In Progress</>
                    ) : request.status === 'completed' ? (
                      <><CheckCircle className="w-3 h-3 mr-1" /> Completed</>
                    ) : (
                      <><AlertCircle className="w-3 h-3 mr-1" /> Pending</>
                    )}
                  </Badge>
                  <Select 
                    onValueChange={(status) => handleStatusUpdate(request.id, status)}
                    defaultValue={request.status}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CardDescription className="capitalize">
                {request.category} • Priority: {request.priority}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-2">{request.description}</p>
              <p className="text-xs text-slate-500">
                Created: {new Date(request.createdAt).toLocaleDateString()} • 
                Requester ID: {request.requesterId}
              </p>
            </CardContent>
          </Card>
        )) : <p className="text-center text-slate-500">No service requests found.</p>}
      </div>
    </div>
  );
}

function UnitManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: units, isLoading } = useQuery({
    queryKey: ['/api/units'],
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading units...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Unit Management</h3>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Unit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {units && Array.isArray(units) ? units.map((unit: any) => (
          <Card key={unit.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Unit {unit.unitNumber}</CardTitle>
              <CardDescription>Floor {unit.floor}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                {unit.squareFootage && <p>Size: {unit.squareFootage} sq ft</p>}
                {unit.bedrooms && <p>Bedrooms: {unit.bedrooms}</p>}
                {unit.bathrooms && <p>Bathrooms: {unit.bathrooms}</p>}
                <p>Parking: {unit.parkingSpaces} spaces</p>
                {unit.balcony && <p>Balcony: Yes</p>}
              </div>
            </CardContent>
          </Card>
        )) : <p className="text-center text-slate-500">No units found.</p>}
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("announcements");

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Settings className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold">Administration Panel</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="announcements">
            <FileText className="w-4 h-4 mr-2" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="service-requests">
            <Settings className="w-4 h-4 mr-2" />
            Requests
          </TabsTrigger>
          <TabsTrigger value="units">
            <Building2 className="w-4 h-4 mr-2" />
            Units
          </TabsTrigger>
          <TabsTrigger value="residents">
            <Users className="w-4 h-4 mr-2" />
            Residents
          </TabsTrigger>
          <TabsTrigger value="automation">
            <Zap className="w-4 h-4 mr-2" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="announcements">
          <AnnouncementManagement />
        </TabsContent>

        <TabsContent value="service-requests">
          <ServiceRequestManagement />
        </TabsContent>

        <TabsContent value="units">
          <UnitManagement />
        </TabsContent>

        <TabsContent value="residents">
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">Resident Management</h3>
            <p className="text-slate-500">
              Resident management features coming soon.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="automation">
          <AutomationDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}