import React, { useState } from 'react';

// 브라우저에 모드를 저장할 때 쓰는 이름표
const STORAGE_KEY = 'tasko-theme';

/**
 * 라이트/다크 모드 전환 버튼
 * - 라이트 모드일 때는 달 모양, 다크 모드일 때는 해 모양을 보여 준다.
 * - 누르면 <html>의 dark 클래스를 켜고 끄고, 고른 모드를 localStorage에 저장한다.
 * - 처음 모드는 index.html의 스크립트가 이미 정해 두었으므로 여기서는 그 결과를 읽기만 한다.
 */
export default function ThemeToggle() {
  // 지금 다크 모드인지 (index.html 스크립트가 붙여 둔 dark 클래스를 읽는다)
  const [isDark, setIsDark] = useState(function readCurrentMode() {
    return document.documentElement.classList.contains('dark');
  });

  function handleToggle() {
    const nextIsDark = !isDark;

    // 화면에 모드 적용
    if (nextIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setIsDark(nextIsDark);

    // 새로고침해도 유지되도록 저장 (저장소를 못 쓰는 브라우저에서도 에러가 나지 않게 try/catch)
    let savedValue = 'light';
    if (nextIsDark) {
      savedValue = 'dark';
    }
    try {
      localStorage.setItem(STORAGE_KEY, savedValue);
    } catch (error) {
      console.warn('모드를 저장하지 못했습니다.', error);
    }
  }

  // 모드에 맞는 아이콘과 안내 문구 고르기
  let icon = (
    // 달 모양 (누르면 다크 모드로 바뀜)
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  );
  let label = '다크 모드로 바꾸기';
  if (isDark) {
    icon = (
      // 해 모양 (누르면 라이트 모드로 바뀜)
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
    );
    label = '라이트 모드로 바꾸기';
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={label}
      className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F8F9FA] dark:hover:bg-[#121417] text-[#495057] dark:text-[#ADB5BD] active:scale-95 transition-all cursor-pointer"
    >
      {icon}
    </button>
  );
}
