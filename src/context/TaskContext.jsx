import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from './AuthContext.jsx';
import { getTodayString, getDueLabel, isOverdueDate } from '../utils/date.js';

// 할 일 상태 공유를 위한 React Context
const TaskContext = createContext(null);

// 날짜를 '2026.11.16' 모양의 글자로 바꾼다
function formatDate(value) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '.' + month + '.' + day;
}

// [이름 바꾸기 1] 테이블 한 줄(row) → 화면에서 쓰는 할 일 모양
function rowToTask(row) {
  const today = getTodayString();
  let dueDate = '';
  if (row.due_date) {
    dueDate = row.due_date;
  }
  return {
    id: row.id,
    title: row.title,
    tag: row.category,
    priority: row.priority,
    completed: row.is_done,
    starred: row.is_starred,
    dueDate: dueDate, // 원본 날짜 ('2026-11-20' 또는 빈 글자)
    dueLabel: getDueLabel(dueDate, today), // 화면에 보여 줄 글자
    isOverdue: isOverdueDate(dueDate, today),
    createdAt: formatDate(row.created_at),
  };
}

// [이름 바꾸기 2] 화면에서 넘어온 새 할 일 → 테이블에 넣을 모양
// user_id 는 데이터베이스가 자동으로 채우므로 넣지 않는다.
function taskToRow(input) {
  // 마감 날짜: 비어 있으면 null 로 저장한다
  let dueDate = null;
  if (input.dueDate) {
    dueDate = input.dueDate;
  }
  return {
    title: input.title,
    category: input.tag,
    priority: input.priority,
    due_date: dueDate,
    is_starred: Boolean(input.starred),
  };
}

export function TaskProvider({ children }) {
  const auth = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // 로그인한 사람의 id (로그인 안 했으면 빈 값)
  let userId = null;
  if (auth.session) {
    userId = auth.session.user.id;
  }

  // 로그인 상태가 바뀔 때마다 tasks 테이블에서 목록을 읽어 온다
  useEffect(function loadTasks() {
    // 이미 사라진 화면에 결과를 넣지 않기 위한 표시
    let cancelled = false;

    async function fetchTasks() {
      // 로그인 안 했으면 목록을 비운다
      if (!userId) {
        setTasks([]);
        setErrorMessage('');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const result = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (cancelled) {
        return;
      }
      if (result.error) {
        console.error('할 일 불러오기 실패:', result.error);
        setErrorMessage('할 일을 불러오지 못했어요.');
        setTasks([]);
        setIsLoading(false);
        return;
      }

      const loadedTasks = result.data.map(rowToTask);
      setTasks(loadedTasks);
      setErrorMessage('');
      setIsLoading(false);
    }

    fetchTasks();

    return function stopLoading() {
      cancelled = true;
    };
  }, [userId]);

  // 할 일 한 개의 완료 값을 화면에서 바꾼다 (저장 전 미리 보기, 실패 시 되돌리기 겸용)
  function setCompletedInList(id, value) {
    setTasks(function change(prevTasks) {
      return prevTasks.map(function pick(task) {
        if (task.id === id) {
          return { ...task, completed: value };
        }
        return task;
      });
    });
  }

  // 할 일 완료 상태 토글: 화면을 먼저 바꾸고 tasks 테이블에 저장한다
  async function toggleTask(id) {
    const target = tasks.find(function findOne(task) {
      return task.id === id;
    });
    if (!target) {
      return;
    }
    const oldValue = target.completed;
    const newValue = !oldValue;
    setCompletedInList(id, newValue);

    const result = await supabase
      .from('tasks')
      .update({ is_done: newValue })
      .eq('id', id);

    if (result.error) {
      console.error('완료 저장 실패:', result.error);
      setErrorMessage('완료 상태를 저장하지 못했어요.');
      setCompletedInList(id, oldValue); // 실패하면 원래대로
    }
  }

  // 할 일 추가 함수: tasks 테이블에 저장한 뒤 목록 맨 앞에 넣는다
  async function addTask(input) {
    const newRow = taskToRow({
      title: input.title,
      priority: input.priority || 'medium',
      tag: input.tag || '#생활',
      dueDate: input.dueDate,
      starred: input.starred,
    });

    const result = await supabase.from('tasks').insert(newRow).select().single();

    if (result.error) {
      console.error('할 일 저장 실패:', result.error);
      setErrorMessage('할 일을 저장하지 못했어요.');
      return null;
    }

    const newTask = rowToTask(result.data);
    setErrorMessage('');
    setTasks(function addFirst(prev) {
      return [newTask, ...prev];
    });
    return newTask;
  }

  // 할 일 수정 함수: tasks 테이블에 저장하고, 성공하면 true 를 돌려준다
  async function updateTask(id, fields) {
    const changes = taskToRow(fields);
    changes.is_done = Boolean(fields.completed);

    const result = await supabase
      .from('tasks')
      .update(changes)
      .eq('id', id)
      .select()
      .single();

    if (result.error) {
      console.error('할 일 수정 실패:', result.error);
      setErrorMessage('할 일을 수정하지 못했어요.');
      return false;
    }

    const savedTask = rowToTask(result.data);
    setErrorMessage('');
    setTasks(function replace(prevTasks) {
      return prevTasks.map(function pick(task) {
        if (task.id === id) {
          return savedTask;
        }
        return task;
      });
    });
    return true;
  }

  // 할 일 삭제 함수: tasks 테이블에서 지우고, 성공하면 true 를 돌려준다
  async function deleteTask(id) {
    const result = await supabase.from('tasks').delete().eq('id', id);

    if (result.error) {
      console.error('할 일 삭제 실패:', result.error);
      setErrorMessage('할 일을 삭제하지 못했어요.');
      return false;
    }

    setErrorMessage('');
    setTasks(function remove(prevTasks) {
      return prevTasks.filter(function keep(task) {
        return task.id !== id;
      });
    });
    return true;
  }

  // 통계 계산
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const inProgressCount = totalCount - completedCount;
  const starredCount = tasks.filter((t) => t.starred).length;
  let percentage = 0;
  if (totalCount > 0) {
    percentage = Math.round((completedCount / totalCount) * 100);
  }

  // 카테고리별 통계 계산 (#생활, #건강, #공부 등)
  const categories = ['#생활', '#건강', '#공부'];
  const categoryStats = categories.map(function makeStat(cat) {
    const catTasks = tasks.filter((t) => t.tag === cat);
    const catTotal = catTasks.length;
    const catCompleted = catTasks.filter((t) => t.completed).length;
    let catPercentage = 0;
    if (catTotal > 0) {
      catPercentage = Math.round((catCompleted / catTotal) * 100);
    }
    return {
      name: cat,
      total: catTotal,
      completed: catCompleted,
      percentage: catPercentage,
    };
  });

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        errorMessage,
        toggleTask,
        addTask,
        updateTask,
        deleteTask,
        totalCount,
        completedCount,
        inProgressCount,
        starredCount,
        percentage,
        categoryStats,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

// 편의를 위한 Custom Hook
export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
