import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

// 로그인 상태(session)를 앱 전체에서 같이 쓰기 위한 Context
const AuthContext = createContext(null);

/**
 * 로그인 상태 제공자
 * - session: 로그인한 사람의 정보 (로그인 안 했으면 null)
 * - loading: 처음 로그인 상태를 확인하는 중인지 여부
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(function watchAuth() {
    // 1) 앱이 처음 열릴 때 이미 로그인되어 있는지 확인
    supabase.auth.getSession().then(function handleSession(result) {
      setSession(result.data.session);
      setLoading(false);
    });

    // 2) 로그인·로그아웃이 일어날 때마다 상태를 갱신
    const listener = supabase.auth.onAuthStateChange(function handleChange(event, newSession) {
      setSession(newSession);
      setLoading(false);
    });
    const subscription = listener.data.subscription;

    // 화면이 사라질 때 감시를 멈춘다
    return function stopWatching() {
      subscription.unsubscribe();
    };
  }, []);

  const value = { session: session, loading: loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 다른 화면에서 로그인 상태를 꺼내 쓰는 함수
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 안에서만 쓸 수 있습니다.');
  }
  return context;
}
