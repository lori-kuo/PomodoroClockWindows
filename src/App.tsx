import { useState } from 'react';
import { Box, Container, Paper, Tabs, Tab } from '@mui/material';
import Timer from './components/Timer/Timer';
import Settings from './components/Settings/Settings';
import Tasks from './components/Tasks/Tasks';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const [timerSettings, setTimerSettings] = useState({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    cycleCount: 4,
    soundVolume: 50,
    selectedSound: 'bell'
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleSettingsSave = (newSettings: typeof timerSettings) => {
    setTimerSettings(newSettings);
  };

  return (
    <Container maxWidth={false} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%', padding: 2 }}>
      <Paper sx={{ width: '100%', maxWidth: '800px', minHeight: '80vh' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange} centered>
            <Tab label="番茄钟" />
            <Tab label="任务" />
            <Tab label="设置" />
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          <Timer
            workDuration={timerSettings.workDuration}
            shortBreakDuration={timerSettings.shortBreakDuration}
            longBreakDuration={timerSettings.longBreakDuration}
            cycleCount={timerSettings.cycleCount}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Tasks />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Settings
            initialSettings={timerSettings}
            onSave={handleSettingsSave}
          />
        </TabPanel>
      </Paper>
    </Container>
  );
}

export default App;
