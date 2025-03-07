import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Typography
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getTasks, saveTasks } from '../../utils/storage';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Task } from '../../utils/storage';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    // 从本地存储加载任务
    const savedTasks = getTasks();
    setTasks(savedTasks);
  }, []);

  useEffect(() => {
    // 保存任务到本地存储
    saveTasks(tasks);
  }, [tasks]);

  const handleAddTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        content: newTask.trim(),
        completed: false,
        timestamp: Date.now(),
        duration: 25 // 添加默认时长
      };
      setTasks([...tasks, task]);
      setNewTask('');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditTask(task);
    setOpenDialog(true);
  };

  const handleUpdateTask = () => {
    if (editTask) {
      setTasks(tasks.map(task => 
        task.id === editTask.id ? editTask : task
      ));
      setOpenDialog(false);
      setEditTask(null);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // 获取今天的任务数据
  const getTodayTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks.filter(task => {
      const taskDate = new Date(task.timestamp);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === today.getTime();
    });
  };

  // 准备饼图数据
  const getPieChartData = () => {
    const todayTasks = getTodayTasks();
    const totalDuration = todayTasks.reduce((sum, task) => sum + (task.duration || 25), 0);
    
    return todayTasks.map(task => ({
      name: task.content,
      value: task.duration || 25,
      percentage: totalDuration > 0 ? ((task.duration || 25) / totalDuration * 100).toFixed(1) : '0.0'
    }));
  };

  // 饼图颜色
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // 自定义提示框
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box sx={{ bgcolor: 'background.paper', p: 1, border: 1, borderColor: 'divider' }}>
          <Typography variant="body2">{data.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {data.value}分钟 ({data.percentage}%)
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Typography variant="h5" gutterBottom>任务列表</Typography>
      
      <Box sx={{ display: 'flex', mb: 2 }}>
        <TextField
          fullWidth
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="添加新任务"
          variant="outlined"
          size="small"
        />
        <Button
          variant="contained"
          onClick={handleAddTask}
          sx={{ ml: 1 }}
          startIcon={<AddIcon />}
        >
          添加
        </Button>
      </Box>

      <List>
        {tasks.map((task) => (
          <ListItem
            key={task.id}
            dense
            divider
          >
            <Checkbox
              edge="start"
              checked={task.completed}
              onChange={() => handleToggleComplete(task.id)}
            />
            <ListItemText
              primary={`${task.content} (${task.duration || 25}分钟)`}
              secondary={new Date(task.timestamp).toLocaleString('zh-CN')}
              sx={{
                textDecoration: task.completed ? 'line-through' : 'none',
                color: task.completed ? 'text.secondary' : 'text.primary'
              }}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                onClick={() => handleEditTask(task)}
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                edge="end"
                onClick={() => handleDeleteTask(task.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {/* 添加今日任务时间统计饼图 */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>今日任务时间占比</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', height: 300 }}>
          <PieChart width={400} height={300}>
            <Pie
              data={getPieChartData()}
              cx="50%"
              cy="50%"
              labelLine={{ stroke: '#666666', strokeWidth: 1 }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, value, percentage }) => `${name}\n(${value}分钟, ${percentage}%)`}
            >
              {getPieChartData().map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  name={entry.name}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value, entry: any) => {
                const { payload } = entry || {};
                if (!payload) return value;
                return `${payload.name} (${payload.value}分钟)`;
              }}
              layout="vertical"
              align="right"
              verticalAlign="middle"
            />
          </PieChart>
        </Box>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>编辑任务</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              value={editTask?.content || ''}
              onChange={(e) => setEditTask(editTask ? { ...editTask, content: e.target.value } : null)}
              margin="dense"
              label="任务内容"
            />
            <TextField
              fullWidth
              type="number"
              label="预计时长（分钟）"
              value={editTask?.duration || 25}
              onChange={(e) => setEditTask(editTask ? { ...editTask, duration: Number(e.target.value) } : null)}
              inputProps={{ min: 1, max: 120 }}
              margin="dense"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>取消</Button>
          <Button onClick={handleUpdateTask} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks;