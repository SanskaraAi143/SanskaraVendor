import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Edit, Save, X, MessageSquare } from 'lucide-react';

interface TaskCardProps {
  task: {
    vendor_task_id: string;
    title: string;
    description?: string;
    status: string;
    priority?: string;
    due_date?: string;
    assigned_staff?: {
      display_name: string;
    };
  };
  onUpdate: () => void;
  showStaffInfo?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, showStaffInfo = false }) => {
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [notes, setNotes] = useState(task.description || '');
  const [saving, setSaving] = useState(false);

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('vendor_tasks')
        .update({ description: notes })
        .eq('vendor_task_id', task.vendor_task_id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Notes updated successfully',
      });
      
      setIsNotesDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notes',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg">{task.title}</h3>
            <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Task Notes</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">{task.title}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this task..."
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveNotes} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Notes'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {task.description && (
            <p className="text-sm text-gray-600">{task.description}</p>
          )}
          
          <div className="flex flex-wrap gap-2">
            <Badge className={getStatusColor(task.status)}>
              {task.status}
            </Badge>
            {task.priority && (
              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                {task.priority} priority
              </Badge>
            )}
          </div>
          
          {showStaffInfo && task.assigned_staff && (
            <p className="text-sm text-gray-500">
              Assigned to: {task.assigned_staff.display_name}
            </p>
          )}
          
          {task.due_date && (
            <p className="text-sm text-gray-500">
              Due: {new Date(task.due_date).toLocaleDateString()}
            </p>
          )}
          
          {task.description && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium mb-1">Notes:</p>
              <p className="text-sm text-gray-700">{task.description}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
