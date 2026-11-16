// 날짜 계산 함수 모음 (마감 날짜는 'YYYY-MM-DD' 글자로 다룬다)

// 'YYYY-MM-DD' 글자를 { year, month, day } 숫자로 나눈다
function splitDate(dateString) {
  const parts = dateString.split('-');
  return {
    year: Number(parts[0]),
    month: Number(parts[1]),
    day: Number(parts[2]),
  };
}

// 날짜를 '1970년 1월 1일부터 며칠째인지' 숫자로 바꾼다 (시간대 영향 없음)
function toDayNumber(dateString) {
  const parts = splitDate(dateString);
  const ms = Date.UTC(parts.year, parts.month - 1, parts.day);
  return Math.round(ms / 86400000);
}

// 오늘 날짜를 기기 시간대 기준 'YYYY-MM-DD' 로 돌려준다
export function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

// 마감일 - 오늘 = 며칠 남았는지 (지났으면 음수)
function getDiffDays(dueDate, todayString) {
  return toDayNumber(dueDate) - toDayNumber(todayString);
}

// 기한이 지났는지 (마감일이 오늘보다 앞이면 true)
export function isOverdueDate(dueDate, todayString) {
  if (!dueDate) {
    return false;
  }
  const diff = getDiffDays(dueDate, todayString);
  return diff < 0;
}

// 화면에 보여 줄 마감 글자를 만든다
export function getDueLabel(dueDate, todayString) {
  if (!dueDate) {
    return '마감 없음';
  }
  const diff = getDiffDays(dueDate, todayString);
  if (diff === 0) {
    return '오늘';
  }
  if (diff === 1) {
    return '내일';
  }
  if (diff === -1) {
    return '어제(기한 지남)';
  }
  if (diff < -1) {
    return Math.abs(diff) + '일 지남';
  }
  const parts = splitDate(dueDate);
  return parts.month + '월 ' + parts.day + '일';
}
