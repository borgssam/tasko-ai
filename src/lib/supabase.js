import { createClient } from '@supabase/supabase-js';

// .env.local 에서 Supabase 주소와 공개 키를 읽어 온다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// 값이 비어 있으면 콘솔에 알려 준다.
if (!supabaseUrl || !supabasePublishableKey) {
  console.error(
    'Supabase 환경변수가 비어 있습니다. .env.local 에 VITE_SUPABASE_URL 과 VITE_SUPABASE_PUBLISHABLE_KEY 를 넣어 주세요.'
  );
}

// 앱 전체에서 같이 쓰는 Supabase 연결 하나
// 값이 비어 있을 때 앱이 바로 멈추지 않도록 빈 문자열 대신 임시 값을 넣는다.
const safeUrl = supabaseUrl || 'http://localhost';
const safeKey = supabasePublishableKey || 'missing-key';

export const supabase = createClient(safeUrl, safeKey);
