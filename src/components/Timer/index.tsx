import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import { getSettings } from '../../utils/storage';

interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  cycleCount: number;
}

const defaultSettings: TimerSettings = {
  workDuration: 25 * 60, // 25分钟
  shortBreakDuration: 5 * 60, // 5分钟
  longBreakDuration: 15 * 60, // 15分钟
  cycleCount: 4 // 4个番茄钟后长休息
};

const Timer: React.FC = () => {
  const [settings, setSettings] = useState<TimerSettings>(defaultSettings);
  const [timeLeft, setTimeLeft] = useState(settings.workDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  
  const timerRef = useRef<number | undefined>(undefined);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const savedSettings = getSettings();
    if (savedSettings) {
      setSettings(savedSettings);
      setTimeLeft(savedSettings.workDuration);
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  const handleTimerComplete = () => {
    playSound();
    setIsRunning(false);
    
    if (isBreak) {
      // 休息结束，开始新的工作时段
      setIsBreak(false);
      setTimeLeft(settings.workDuration);
    } else {
      // 工作时段结束
      const newCyclesCompleted = cyclesCompleted + 1;
      setCyclesCompleted(newCyclesCompleted);
      setIsBreak(true);

      // 判断是短休息还是长休息
      if (newCyclesCompleted % settings.cycleCount === 0) {
        setTimeLeft(settings.longBreakDuration);
      } else {
        setTimeLeft(settings.shortBreakDuration);
      }
    }
  };

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const calculateProgress = (): number => {
    const totalTime = isBreak
      ? (cyclesCompleted % settings.cycleCount === 0
        ? settings.longBreakDuration
        : settings.shortBreakDuration)
      : settings.workDuration;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleStop = () => {
    setIsRunning(false);
    setTimeLeft(settings.workDuration);
    setIsBreak(false);
    setCyclesCompleted(0);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', textAlign: 'center', p: 3 }}>
      <audio ref={audioRef} src="/sounds/bell.mp3" />

      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
        <CircularProgress
          variant="determinate"
          value={calculateProgress()}
          size={200}
          thickness={2}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h3" component="div">
            {formatTime(timeLeft)}
          </Typography>
        </Box>
      </Box>

      <Typography variant="h6" gutterBottom>
        {isBreak ? '休息时间' : '工作时间'}
      </Typography>

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
        <IconButton
          onClick={handleStartPause}
          color="primary"
          size="large"
        >
          {isRunning ? <PauseIcon /> : <PlayIcon />}
        </IconButton>
        <IconButton
          onClick={handleStop}
          color="error"
          size="large"
        >
          <StopIcon />
        </IconButton>
      </Stack>

      <Typography variant="body2" color="text.secondary">
        已完成 {cyclesCompleted} 个番茄钟
      </Typography>
    </Box>
  );
};

export default Timer;