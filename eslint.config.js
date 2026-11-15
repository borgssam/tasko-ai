import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  // 검사하지 않을 폴더
  { ignores: ['dist', 'node_modules'] },

  // 화면·컴포넌트 코드(.js, .jsx) 검사 설정
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      // React Hooks 규칙
      ...reactHooks.configs.recommended.rules,
      // Vite 빠른 새로고침 규칙
      // useTasks는 TaskContext와 한 파일에 두는 훅이므로 예외로 허용
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true, allowExportNames: ['useTasks'] },
      ],
      // JSX에서 쓴 컴포넌트(motion 등)를 "안 쓴 변수"로 오인하지 않도록 대문자 시작 이름은 제외
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },

  // vite.config.js는 브라우저가 아니라 Node에서 실행되므로 process 같은 Node 전역을 허용
  {
    files: ['vite.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
];
