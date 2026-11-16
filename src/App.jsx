import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TaskProvider } from './context/TaskContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute.jsx';
import DeviceFrame from './components/DeviceFrame.jsx';
import LoginScreen from './screens/LoginScreen.jsx';
import SignupScreen from './screens/SignupScreen.jsx';
import DashboardScreen from './screens/DashboardScreen.jsx';
import AllTasksScreen from './screens/AllTasksScreen.jsx';
import TaskDetailScreen from './screens/TaskDetailScreen.jsx';

/**
 * Tasko 메인 애플리케이션 컴포넌트
 * - React Router 7을 이용한 화면 이동 라우팅
 * - 첫 화면은 로그인(/login) 화면으로 설정
 * - 5개 지정 화면 라우트 구성:
 *   1. 로그인 (/login)
 *   2. 회원가입 (/signup)
 *   3. 대시보드 (/dashboard)
 *   4. 전체 할 일 목록 (/tasks)
 *   5. 할 일 상세/수정 (/tasks/:id)
 */
export default function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <BrowserRouter>
          <DeviceFrame>
            <Routes>
              {/* 로그인·회원가입: 이미 로그인했으면 대시보드로 보낸다 */}
              <Route path="/" element={<PublicOnlyRoute><LoginScreen /></PublicOnlyRoute>} />
              <Route path="/login" element={<PublicOnlyRoute><LoginScreen /></PublicOnlyRoute>} />
              <Route path="/signup" element={<PublicOnlyRoute><SignupScreen /></PublicOnlyRoute>} />
              {/* 아래 화면은 로그인한 사람만 볼 수 있다 */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardScreen /></ProtectedRoute>} />
              <Route path="/tasks" element={<ProtectedRoute><AllTasksScreen /></ProtectedRoute>} />
              <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetailScreen /></ProtectedRoute>} />
              {/* 알 수 없는 경로는 로그인으로 리디렉트 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </DeviceFrame>
        </BrowserRouter>
      </TaskProvider>
    </AuthProvider>
  );
}
