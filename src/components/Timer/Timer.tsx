import { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { getSettings } from '../../utils/storage';
import { Task } from '../../types';

interface TimerProps {
  workDuration?: number;
  shortBreakDuration?: number;
  longBreakDuration?: number;
  cycleCount?: number;
  onComplete?: () => void;
  selectedTaskId?: string;
}

const Timer: React.FC<TimerProps> = ({
  workDuration = 25,
  shortBreakDuration = 5,
  longBreakDuration = 15,
  cycleCount = 4,
  onComplete,
  selectedTaskId
}) => {
  // 确保时长不少于5秒
  const minDuration = 5 / 60; // 5秒转换为分钟
  const validWorkDuration = Math.max(workDuration, minDuration);
  const validShortBreakDuration = Math.max(shortBreakDuration, minDuration);
  const validLongBreakDuration = Math.max(longBreakDuration, minDuration);

  const [timeLeft, setTimeLeft] = useState(validWorkDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const timerRef = useRef<number | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  // 删除以下行
// const [selectedTaskId, setSelectedTaskId] = useState<string>();
  const saveTasks = (updatedTasks: Task[]) => {
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handlePhaseComplete();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  const handlePhaseComplete = () => {
    // 先播放提示音
    const settings = getSettings();
    const audio = new Audio(`./sounds/${settings.selectedSound}.mp3`);
    audio.volume = settings.soundVolume / 100;
    audio.play().catch(error => {
      console.error('播放提示音失败:', error);
    });

    if (currentPhase === 'work' && selectedTaskId) {
      const updatedTasks = tasks.map(task => 
        task.id === selectedTaskId
          ? { ...task, totalDuration: (task.totalDuration || 0) + validWorkDuration }
          : task
      );
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
    }

    if (currentPhase === 'work') {
      const newCompletedCount = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedCount);

      if (newCompletedCount % cycleCount === 0) {
        // 进入长休息
        setCurrentPhase('longBreak');
        setTimeLeft(validLongBreakDuration * 60);
      } else {
        // 进入短休息
        setCurrentPhase('shortBreak');
        setTimeLeft(validShortBreakDuration * 60);
      }
    } else {
      // 休息结束，开始新的工作阶段
      setCurrentPhase('work');
      setTimeLeft(validWorkDuration * 60);
    }

    setIsRunning(false);
    if (onComplete) onComplete();
  };


  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(validWorkDuration * 60);
    setCurrentPhase('work');
    setCompletedPomodoros(0);
    // 删除此行
    // setSelectedTaskId(undefined);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ textAlign: 'center', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {currentPhase === 'work' ? '工作时间' :
         currentPhase === 'shortBreak' ? '短休息' : '长休息'}
      </Typography>
      
      <Typography variant="h1" sx={{ my: 4 }}>
        {formatTime(timeLeft)}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
        <IconButton
          size="large"
          onClick={toggleTimer}
          color="primary"
          sx={{ border: '2px solid', borderRadius: '50%', p: 2 }}
        >
          {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>

        <IconButton
          size="large"
          onClick={resetTimer}
          color="secondary"
          sx={{ border: '2px solid', borderRadius: '50%', p: 2 }}
        >
          <RestartAltIcon />
        </IconButton>
      </Box>

      <Typography variant="subtitle1">
        已完成 {completedPomodoros} 个番茄钟
      </Typography>
    </Box>
  );
};

export default Timer;