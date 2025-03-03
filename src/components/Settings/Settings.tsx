import { useState } from 'react';
import {
  Box,
  Typography,
  Slider,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { TimerSettings, saveSettings, getSettings } from '../../utils/storage';
import { SelectChangeEvent } from '@mui/material';

interface SettingsProps {
  onSave: (settings: TimerSettings) => void;
  initialSettings?: TimerSettings;
}

const Settings: React.FC<SettingsProps> = ({ onSave, initialSettings }) => {
  const [settings, setSettings] = useState<TimerSettings>(() => {
    // 优先使用传入的初始设置，如果没有则从本地存储获取，最后使用默认值
    return initialSettings || getSettings();
  });

  const sounds = [
    { id: 'bell', name: '铃声' },
    { id: 'bird', name: '鸟鸣' },
    { id: 'water', name: '流水' },
    { id: 'wind', name: '微风' },
    { id: 'forest', name: '森林' }
  ];

  const handleSelectChange = (field: keyof TimerSettings) => (
    event: SelectChangeEvent<string>
  ) => {
    const value = event.target.value;
    setSettings(prev => {
      const newSettings = { ...prev, [field]: value };
      if (field === 'selectedSound') {
        const audio = new Audio(`/sounds/${value}.mp3`);
        audio.volume = settings.soundVolume / 100;
        audio.play().catch(error => {
          console.error('播放提示音失败:', error);
        });
      }
      return newSettings;
    });
  };

  const handleInputChange = (field: keyof TimerSettings) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setSettings(prev => ({ ...prev, [field]: Number(value) }));
  };

  const handleSliderChange = (field: keyof TimerSettings) => (
    _: Event,
    value: number | number[]
  ) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    saveSettings(settings); // 保存到本地存储
    onSave(settings); // 通知父组件
  };

  const playSound = () => {
    const audio = new Audio(`/sounds/${settings.selectedSound}.mp3`);
    audio.volume = settings.soundVolume / 100;
    audio.play().catch(error => {
      console.error('播放提示音失败:', error);
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>时间设置</Typography>
      
      <FormControl fullWidth sx={{ mb: 3 }}>
        <Typography gutterBottom>工作时长 ({settings.workDuration < 1 ? `${Math.round(settings.workDuration * 60)}秒` : `${settings.workDuration}分钟`})</Typography>
        <Slider
          value={settings.workDuration}
          onChange={handleSliderChange('workDuration')}
          min={5/60}
          max={120}
          step={5/60}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => value < 1 ? `${Math.round(value * 60)}秒` : `${value}分钟`}
        />
      </FormControl>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <Typography gutterBottom>短休息时长 ({settings.shortBreakDuration}分钟)</Typography>
        <Slider
          value={settings.shortBreakDuration}
          onChange={handleSliderChange('shortBreakDuration')}
          min={1}
          max={30}
          valueLabelDisplay="auto"
        />
      </FormControl>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <Typography gutterBottom>长休息时长 ({settings.longBreakDuration}分钟)</Typography>
        <Slider
          value={settings.longBreakDuration}
          onChange={handleSliderChange('longBreakDuration')}
          min={5}
          max={60}
          valueLabelDisplay="auto"
        />
      </FormControl>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <Typography gutterBottom>循环次数</Typography>
        <TextField
          type="number"
          value={settings.cycleCount}
          onChange={handleInputChange('cycleCount')}
          inputProps={{ min: 1, max: 99 }}
        />
      </FormControl>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>提示音设置</Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>提示音</InputLabel>
        <Select
          value={settings.selectedSound}
          onChange={handleSelectChange('selectedSound')}
          label="提示音"
        >
          {sounds.map(sound => (
            <MenuItem key={sound.id} value={sound.id}>{sound.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <Typography gutterBottom>音量</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Slider
            value={settings.soundVolume}
            onChange={handleSliderChange('soundVolume')}
            min={0}
            max={100}
            valueLabelDisplay="auto"
          />
          <IconButton onClick={playSound} color="primary">
            <VolumeUpIcon />
          </IconButton>
        </Box>
      </FormControl>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSave}
        sx={{ mt: 2 }}
      >
        保存设置
      </Button>
    </Box>
  );
};

export default Settings;