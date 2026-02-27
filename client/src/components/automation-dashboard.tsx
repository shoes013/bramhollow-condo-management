import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Zap, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Play,
  RefreshCw,
  Bell,
  Calendar,
  FileText,
  Wrench,
  Shield,
  Trash2
} from "lucide-react";

interface AutomationTask {
  id: string;
  name: string;
  description: string;
  schedule: string;
  lastRun: string | null;
  nextRun: string | null;
  isEnabled: boolean;
  category: 'notices' | 'reminders' | 'maintenance' | 'compliance' | 'cleanup';
}

interface AutomationLog {
  id: string;
  taskId: string;
  taskName: string;
  status: 'success' | 'failed' | 'skipped';
  message: string;
  timestamp: string;
  itemsProcessed: number;
}

const categoryIcons: Record<string, any> = {
  notices: Bell,
  reminders: Clock,
  maintenance: Wrench,
  compliance: Shield,
  cleanup: Trash2
};

const categoryColors: Record<string, string> = {
  notices: 'bg-blue-100 text-blue-700',
  reminders: 'bg-purple-100 text-purple-700',
  maintenance: 'bg-orange-100 text-orange-700',
  compliance: 'bg-green-100 text-green-700',
  cleanup: 'bg-gray-100 text-gray-700'
};

export default function AutomationDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: tasks, isLoading: tasksLoading } = useQuery<AutomationTask[]>({
    queryKey: ['/api/automation/tasks'],
  });

  const { data: logs, isLoading: logsLoading } = useQuery<AutomationLog[]>({
    queryKey: ['/api/automation/logs'],
  });

  const { data: summary } = useQuery({
    queryKey: ['/api/automation/summary'],
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, enabled }: { taskId: string; enabled: boolean }) => {
      return apiRequest('POST', `/api/automation/tasks/${taskId}/toggle`, { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automation/tasks'] });
      toast({ title: "Task updated", description: "Automation task status changed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update task.", variant: "destructive" });
    }
  });

  const runTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return apiRequest('POST', `/api/automation/run/${taskId}`);
    },
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/automation/logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/automation/tasks'] });
      toast({ title: "Task executed", description: `Automation task ${taskId} has been run.` });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to run task.", variant: "destructive" });
    }
  });

  const runAllMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/automation/run-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automation/logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/automation/tasks'] });
      toast({ title: "All tasks executed", description: "All automation tasks have been run." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to run all tasks.", variant: "destructive" });
    }
  });

  if (tasksLoading) {
    return <div className="text-center py-8">Loading automation dashboard...</div>;
  }

  const tasksByCategory = tasks?.reduce((acc, task) => {
    if (!acc[task.category]) acc[task.category] = [];
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, AutomationTask[]>) || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-yellow-500" />
          <div>
            <h2 className="text-xl font-semibold">Automation Center</h2>
            <p className="text-sm text-slate-500">Manage automated tasks and scheduled processes</p>
          </div>
        </div>
        <Button 
          onClick={() => runAllMutation.mutate()}
          disabled={runAllMutation.isPending}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${runAllMutation.isPending ? 'animate-spin' : ''}`} />
          Run All Tasks
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{tasks?.length || 0}</p>
                <p className="text-sm text-slate-500">Total Tasks</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{tasks?.filter(t => t.isEnabled).length || 0}</p>
                <p className="text-sm text-slate-500">Active Tasks</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{logs?.filter(l => l.status === 'success').length || 0}</p>
                <p className="text-sm text-slate-500">Successful Runs</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{logs?.filter(l => l.status === 'failed').length || 0}</p>
                <p className="text-sm text-slate-500">Failed Runs</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notices">Notices</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="logs">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {tasks?.map((task) => {
              const CategoryIcon = categoryIcons[task.category] || Zap;
              return (
                <Card key={task.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${categoryColors[task.category]}`}>
                          <CategoryIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{task.name}</CardTitle>
                          <CardDescription>{task.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{task.schedule}</Badge>
                        <Switch
                          checked={task.isEnabled}
                          onCheckedChange={(checked) => 
                            toggleTaskMutation.mutate({ taskId: task.id, enabled: checked })
                          }
                        />
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => runTaskMutation.mutate(task.id)}
                          disabled={runTaskMutation.isPending || !task.isEnabled}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Run
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {task.lastRun && (
                    <CardContent className="pt-0">
                      <p className="text-xs text-slate-500">
                        Last run: {new Date(task.lastRun).toLocaleString()}
                      </p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {['notices', 'reminders', 'maintenance', 'compliance'].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-4">
              {tasksByCategory[category]?.map((task) => {
                const CategoryIcon = categoryIcons[task.category] || Zap;
                return (
                  <Card key={task.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${categoryColors[task.category]}`}>
                            <CategoryIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{task.name}</CardTitle>
                            <CardDescription>{task.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{task.schedule}</Badge>
                          <Switch
                            checked={task.isEnabled}
                            onCheckedChange={(checked) => 
                              toggleTaskMutation.mutate({ taskId: task.id, enabled: checked })
                            }
                          />
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => runTaskMutation.mutate(task.id)}
                            disabled={runTaskMutation.isPending || !task.isEnabled}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Run Now
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        {task.lastRun && (
                          <span>Last run: {new Date(task.lastRun).toLocaleString()}</span>
                        )}
                        <span className={task.isEnabled ? 'text-green-600' : 'text-slate-400'}>
                          {task.isEnabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              }) || <p className="text-slate-500 text-center py-4">No tasks in this category.</p>}
            </div>
          </TabsContent>
        ))}

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <CardDescription>Log of recent automation task executions</CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <p className="text-center py-4">Loading logs...</p>
              ) : logs && logs.length > 0 ? (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {log.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : log.status === 'failed' ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{log.taskName}</p>
                          <p className="text-xs text-slate-500">{log.message}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={log.status === 'success' ? 'default' : log.status === 'failed' ? 'destructive' : 'secondary'}>
                          {log.itemsProcessed} processed
                        </Badge>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">No activity logs yet. Run a task to see logs.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
