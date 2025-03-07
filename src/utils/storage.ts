// 本地存储的键名常量
const STORAGE_KEYS = {
  TASKS: 'tomato-todo-tasks',
  SETTINGS: 'tomato-todo-settings'
} as const;

// 任务接口
export interface Task {
  id: string;
  content: string;
  timestamp: number;
  completed: boolean;
  duration?: number;
}

// 计时器设置接口
export interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  cycleCount: number;
  soundVolume: number;
  selectedSound: string;
}

// 默认的计时器设置
export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  cycleCount: 4,
  soundVolume: 50,
  selectedSound: 'bell'
};

// 保存任务列表
export const saveTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error('保存任务失败:', error);
  }
};

// 获取任务列表
export const getTasks = (): Task[] => {
  try {
    const tasksJson = localStorage.getItem(STORAGE_KEYS.TASKS);
    return tasksJson ? JSON.parse(tasksJson) : [];
  } catch (error) {
    console.error('获取任务失败:', error);
    return [];
  }
};

// 保存计时器设置
export const saveSettings = (settings: TimerSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('保存设置失败:', error);
  }
};

// 获取计时器设置
export const getSettings = (): TimerSettings => {
  try {
    const settingsJson = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settingsJson ? JSON.parse(settingsJson) : DEFAULT_TIMER_SETTINGS;
  } catch (error) {
    console.error('获取设置失败:', error);
    return DEFAULT_TIMER_SETTINGS;
  }
};