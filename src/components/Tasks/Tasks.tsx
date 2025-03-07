import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  Paper,
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { PieChart, Pie, ResponsiveContainer } from 'recharts';
import { Task, saveTasks, getTasks } from '../../utils/storage';

interface TaskStats {
  name: string;
  value: number;
}

const Tasks: React.FC = () => {
  const [currentTask, setCurrentTask] = useState('');
  const [currentDuration, setCurrentDuration] = useState(25);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statRange, setStatRange] = useState<'today' | 'week' | 'month'>('today');


  // 在组件加载时从本地存储加载任务
  useEffect(() => {
    const savedTasks = getTasks();
    setTasks(savedTasks);
  }, []);

  // 当任务列表变化时保存到本地存储
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const handleTaskInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTask(event.target.value);
  };

  const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDuration(Number(event.target.value));
  };

  const handleAddTask = () => {
    if (currentTask.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        content: currentTask.trim(),
        timestamp: Date.now(),
        completed: false,
        duration: currentDuration
      };
      setTasks(prev => [newTask, ...prev]);
      setCurrentTask('');
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // 生成统计数据
  const generateStats = (): TaskStats[] => {
    const filteredTasks = tasks.filter(task => {
      const taskDate = new Date(task.timestamp);
      const now = new Date();
      
      switch(statRange) {
        case 'today':
          return taskDate.getDate() === now.getDate() &&
                 taskDate.getMonth() === now.getMonth() &&
                 taskDate.getFullYear() === now.getFullYear();
        case 'week':
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
          return taskDate >= startOfWeek && taskDate <= endOfWeek;
        case 'month':
          return taskDate.getMonth() === now.getMonth() &&
                 taskDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });

    const tasksByDuration = filteredTasks.reduce((acc, task) => {
      acc[task.content] = (task.duration || 0);
      return acc;
    }, {} as { [key: string]: number });

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    return Object.entries(tasksByDuration).map(([name, value], index) => ({
      name,
      value,
      fill: COLORS[index % COLORS.length]
    }));
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>任务管理</Typography>

      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          label="输入任务内容"
          value={currentTask}
          onChange={handleTaskInput}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
          inputProps={{ maxLength: 200 }}
        />
        <TextField
          type="number"
          label="预计时长（分钟）"
          value={currentDuration}
          onChange={handleDurationChange}
          inputProps={{ min: 1, max: 120 }}
          sx={{ width: 150 }}
        />
      </Box>

      <Paper sx={{ mb: 4 }}>
        <List>
          {tasks.map((task, index) => (
            <div key={task.id}>
              {index > 0 && <Divider />}
              <ListItem
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleDeleteTask(task.id)}>
                    <DeleteIcon />
                  </IconButton>
                }
                onClick={() => handleToggleComplete(task.id)}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemText
                  primary={`${task.content} (${task.duration || 25}分钟)`}
                  secondary={new Date(task.timestamp).toLocaleString('zh-CN')}
                  sx={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? 'text.secondary' : 'text.primary'
                  }}
                />
              </ListItem>
            </div>
          ))}
        </List>
      </Paper>

      <Paper sx={{ p: 2, height: 300 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">任务时间分配</Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>统计范围</InputLabel>
            <Select
              value={statRange}
              label="统计范围"
              onChange={(e) => setStatRange(e.target.value as any)}
            >
              <MenuItem value="today">今日</MenuItem>
              <MenuItem value="week">本周</MenuItem>
              <MenuItem value="month">本月</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={generateStats()}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, value }) => `${name}: ${value}分钟`}
            />
          </PieChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default Tasks;