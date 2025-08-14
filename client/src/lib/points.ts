import dayjs from "dayjs";
import type { Child, Task, TaskCompletion, PointsHistory, Settings } from "@shared/schema";
import { calculateAgeAdjustedPoints } from "./profile-options";

export interface PointsRule {
  id: string;
  name: string;
  description: string;
  points: number;
  condition: (data: PointsCalculationData) => boolean;
}

export interface PointsCalculationData {
  child: Child;
  completions: TaskCompletion[];
  tasks: Task[];
  history: PointsHistory[];
  date: string;
  settings?: Settings;
}

export const defaultPointsRules: PointsRule[] = [
  {
    id: "all_tasks_by_deadline",
    name: "Early Bird",
    description: "Complete all tasks by 8:00 AM",
    points: 10,
    condition: ({ completions, tasks, date }) => {
      const todayCompletions = completions.filter(c => c.dateISO === date);
      const todayTasks = tasks.filter(t => {
        const dayOfWeek = dayjs(date).day();
        const mondayBasedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        return t.weekdayMask[mondayBasedDay] === '1';
      });
      
      // Check if all tasks are completed
      if (todayCompletions.length !== todayTasks.length) return false;
      
      // Check if all were completed by 8:00 AM
      return todayCompletions.every(c => {
        const completedAt = dayjs(c.completedAt);
        return completedAt.hour() < 8;
      });
    }
  },
  {
    id: "all_tasks_today",
    name: "Task Master",
    description: "Complete all tasks today",
    points: 10,
    condition: ({ completions, tasks, date }) => {
      const todayCompletions = completions.filter(c => c.dateISO === date);
      const todayTasks = tasks.filter(t => {
        const dayOfWeek = dayjs(date).day();
        const mondayBasedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        return t.weekdayMask[mondayBasedDay] === '1';
      });
      
      return todayCompletions.length === todayTasks.length && todayTasks.length > 0;
    }
  },
  {
    id: "five_day_streak",
    name: "Streak Champion",
    description: "Complete all tasks for 5 days in a row",
    points: 50,
    condition: ({ completions, tasks, date }) => {
      const dates = [];
      for (let i = 0; i < 5; i++) {
        dates.push(dayjs(date).subtract(i, 'day').format('YYYY-MM-DD'));
      }
      
      return dates.every(d => {
        const dayCompletions = completions.filter(c => c.dateISO === d);
        const dayTasks = tasks.filter(t => {
          const dayOfWeek = dayjs(d).day();
          const mondayBasedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          return t.weekdayMask[mondayBasedDay] === '1';
        });
        
        return dayCompletions.length === dayTasks.length && dayTasks.length > 0;
      });
    }
  },
  {
    id: "twenty_days_month",
    name: "Monthly Hero",
    description: "Complete all tasks for 20 days in the current month",
    points: 500,
    condition: ({ completions, tasks, date }) => {
      const startOfMonth = dayjs(date).startOf('month');
      const endOfMonth = dayjs(date).endOf('month');
      
      let completeDays = 0;
      let currentDay = startOfMonth;
      
      while (currentDay.isBefore(endOfMonth) || currentDay.isSame(endOfMonth)) {
        const dayStr = currentDay.format('YYYY-MM-DD');
        const dayCompletions = completions.filter(c => c.dateISO === dayStr);
        const dayTasks = tasks.filter(t => {
          const dayOfWeek = currentDay.day();
          const mondayBasedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          return t.weekdayMask[mondayBasedDay] === '1';
        });
        
        if (dayCompletions.length === dayTasks.length && dayTasks.length > 0) {
          completeDays++;
        }
        
        currentDay = currentDay.add(1, 'day');
      }
      
      return completeDays >= 20;
    }
  }
];

export function calculateBonusPoints(data: PointsCalculationData, rules: PointsRule[] = defaultPointsRules): PointsRule[] {
  return rules.filter(rule => rule.condition(data));
}
