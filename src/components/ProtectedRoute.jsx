import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * 로그인한 사람만 볼 수 있는 화면을 감싸는 부품
 * - 확인 중이면 빈 배경만 보여 준다.
 * - 로그인하지 않았으면 로그인 화면으로 보낸다.
 */
export function ProtectedRoute({ children }) {
  const auth = useAuth();

  if (auth.loading) {
    return <div className="w-full h-full bg-[#F8F9FA] dark:bg-[#121417]"></div>;
  }
  if (!auth.session) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/**
 * 로그인 / 회원가입 화면을 감싸는 부품
 * - 이미 로그인한 사람은 대시보드로 보낸다.
 */
export function PublicOnlyRoute({ children }) {
  const auth = useAuth();

  if (auth.loading) {
    return <div className="w-full h-full bg-[#F8F9FA] dark:bg-[#121417]"></div>;
  }
  if (auth.session) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
