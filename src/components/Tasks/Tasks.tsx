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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Task, saveTasks, getTasks } from '../../utils/storage';

interface TaskStats {
  date: string;
  count: number;
}

const Tasks: React.FC = () => {
  const [currentTask, setCurrentTask] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');

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

  const handleAddTask = () => {
    if (currentTask.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        content: currentTask.trim(),
        timestamp: Date.now(),
        completed: false
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
    const now = new Date();
    const stats: TaskStats[] = [];

    switch (timeRange) {
      case 'day':
        // 按小时统计当天数据
        for (let i = 0; i < 24; i++) {
          const date = `${i}:00`;
          const count = tasks.filter(task => {
            const taskDate = new Date(task.timestamp);
            return taskDate.getHours() === i &&
                   taskDate.getDate() === now.getDate() &&
                   taskDate.getMonth() === now.getMonth();
          }).length;
          stats.push({ date, count });
        }
        break;

      case 'week':
        // 按天统计本周数据
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const count = tasks.filter(task => {
            const taskDate = new Date(task.timestamp);
            return taskDate.getDate() === date.getDate() &&
                   taskDate.getMonth() === date.getMonth();
          }).length;
          stats.push({
            date: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
            count
          });
        }
        break;

      case 'month':
        // 按周统计本月数据
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        for (let i = 0; i < daysInMonth; i += 7) {
          const startDate = new Date(now.getFullYear(), now.getMonth(), i + 1);
          const endDate = new Date(now.getFullYear(), now.getMonth(), Math.min(i + 7, daysInMonth));
          const count = tasks.filter(task => {
            const taskDate = new Date(task.timestamp);
            return taskDate >= startDate && taskDate < endDate;
          }).length;
          stats.push({
            date: `第${Math.floor(i / 7) + 1}周`,
            count
          });
        }
        break;
    }

    return stats;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>任务管理</Typography>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="输入任务内容"
          value={currentTask}
          onChange={handleTaskInput}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
          inputProps={{ maxLength: 200 }}
          sx={{ mb: 2 }}
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
                  primary={task.content}
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

      <Box sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>时间范围</InputLabel>
          <Select
            value={timeRange}
            label="时间范围"
            onChange={(e) => setTimeRange(e.target.value as 'day' | 'week' | 'month')}
          >
            <MenuItem value="day">今日</MenuItem>
            <MenuItem value="week">本周</MenuItem>
            <MenuItem value="month">本月</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ p: 2, height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={generateStats()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" name="完成任务数" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default Tasks;