
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface Task {
  id: number;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  isDone: boolean;
  booking: string;
}

const tasks: Task[] = [
  {
    id: 1,
    title: 'Confirm menu details with client',
    dueDate: '2025-06-10',
    priority: 'high',
    isDone: false,
    booking: 'Arjun & Meera',
  },
  {
    id: 2,
    title: 'Order flowers for ceremony',
    dueDate: '2025-06-12',
    priority: 'medium',
    isDone: false,
    booking: 'Rahul & Priya',
  },
  {
    id: 3,
    title: 'Schedule venue inspection',
    dueDate: '2025-06-15',
    priority: 'high',
    isDone: false,
    booking: 'Vikram & Ananya',
  },
  {
    id: 4,
    title: 'Equipment check for sound system',
    dueDate: '2025-06-18',
    priority: 'low',
    isDone: true,
    booking: 'Arjun & Meera',
  },
];

const UpcomingTasks: React.FC = () => {
  const [taskList, setTaskList] = React.useState(tasks);
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const toggleTaskDone = (id: number) => {
    setTaskList(taskList.map(task => 
      task.id === id ? { ...task, isDone: !task.isDone } : task
    ));
  };
  
  return (
    <Card className="sanskara-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Upcoming Tasks</span>
          <span className="text-sm font-normal text-sanskara-red flex items-center cursor-pointer hover:underline">
            View All <ArrowUpRight className="ml-1 h-4 w-4" />
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {taskList.slice(0, 4).map((task) => (
            <div key={task.id} className={`flex items-start justify-between p-2 rounded-md border ${task.isDone ? 'bg-muted/50 border-dashed' : 'bg-white'}`}>
              <div className="flex items-start gap-3">
                <Checkbox 
                  checked={task.isDone}
                  onCheckedChange={() => toggleTaskDone(task.id)}
                  className="mt-1"
                />
                <div>
                  <p className={`text-sm ${task.isDone ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Badge className="text-[10px] py-0 h-4" variant="outline">{task.booking}</Badge>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
              {!task.isDone && (
                <Badge className={`${getPriorityColor(task.priority)} h-5 text-[10px]`}>
                  {task.priority}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingTasks;
