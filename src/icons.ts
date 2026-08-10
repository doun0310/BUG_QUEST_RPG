/**
 * icons.ts — Custom SVG Icon Library
 * 
 * 프로젝트 전용 독창적 픽토그램 아이콘 시스템.
 * 모두 24×24 viewBox 기준, currentColor 지원, inline SVG.
 * 
 * 사용법: icon('sword', 'color: var(--danger); width: 16px;')
 */

type IconName =
  | 'sword'        // ⚔️ 공격 / 전투
  | 'shield'       // 🛡️ 방어 / Security
  | 'bug'          // 🐛 버그 / 이슈
  | 'crystal'      // 💎 XP / 보상
  | 'lightning'    // ⚡ 스킬 / 에너지
  | 'fire'         // 🔥 광포화 / 위험
  | 'trophy'       // 🏆 랭킹 / 업적
  | 'chart'        // 📊 차트 / 분석
  | 'rocket'       // 🚀 배포 / CI/CD
  | 'robot'        // 🤖 AI / 자동화
  | 'link'         // 🔗 Webhook / 연동
  | 'book'         // 📖 도감 / Codex
  | 'medal'        // 🏅 업적 배지
  | 'ticket'       // 🎫 시즌패스
  | 'users'        // 👥 팀 / 협동
  | 'shop'         // 🛒 상점
  | 'plug'         // 🔌 API 연동
  | 'graph'        // 📈 리포트 / 성장
  | 'paw'          // 🐾 펫
  | 'hammer'       // 🔨 강화
  | 'volume'       // 🔊 볼륨
  | 'globe'        // 🌐 언어
  | 'box'          // 📦 인벤토리
  | 'leaf'         // 🌿 연차 / 휴식
  | 'flask'        // 🔬 시뮬레이터
  | 'checklist'    // 📋 퀘스트
  | 'warning'      // ⚠️ 경고
  | 'check'        // ✓ 완료
  | 'sparkle'      // ✨ 스킬 발동
  | 'target'       // 🎯 타겟
  | 'moon'         // 🌙 다크 모드
  | 'sun'          // ☀️ 라이트 모드
  | 'matrix'       // 💚 매트릭스
  | 'clock'        // ⏰ 마감
  | 'paint'        // 🎨 Frontend
  | 'server'       // 🖥 Backend
  | 'database'     // 🗄️ Database
  | 'brain'        // 🧠 AI 예측
  | 'chat'         // 💬 소셜 피드
  | 'guild'        // ⚔️ 길드 대항전
  | 'radar'        // 📡 스탯 차트
  | 'mute'         // 🔇 음소거
  | 'plus'         // ＋ 추가
  | 'close'        // ✕ 닫기
  | 'pr'           // PR 코드 머지
  | 'slack'        // Slack 챗봇
  | 'coffee'       // ☕ 스타벅스
  | 'potion'       // 🧪 포션
  | 'flag'         // 🚩 마일스톤
  | 'star'         // ⭐ 평가
  | 'clap'         // 👏 박수 / 칭찬
  | 'key'          // 🔑 API 키
  | 'feedback';    // 💡 피드백

const paths: Record<IconName, string> = {
  // ─── SWORD ────────────────────────────────────────────────────────────────
  sword: `<path d="M14.5 2.5L21.5 9.5L9 22L2 22L2 15L14.5 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
          <path d="M15 8L8 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M17 5L19 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M2 22L5 19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,

  // ─── SHIELD ───────────────────────────────────────────────────────────────
  shield: `<path d="M12 3L4 6.5V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6.5L12 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
           <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,

  // ─── BUG ──────────────────────────────────────────────────────────────────
  bug: `<ellipse cx="12" cy="13" rx="4" ry="5" stroke="currentColor" stroke-width="1.5" fill="none"/>
        <path d="M12 8V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M9.5 5.5C9.5 4.1 10.6 3 12 3C13.4 3 14.5 4.1 14.5 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
        <path d="M8 10L4 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M16 10L20 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M8 14H4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M16 14H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M8 18L5 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M16 18L19 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,

  // ─── CRYSTAL ──────────────────────────────────────────────────────────────
  crystal: `<path d="M12 2L17 8H7L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
            <path d="M7 8L4 14L12 22L20 14L17 8H7Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
            <path d="M7 8L12 14L17 8" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
            <path d="M12 14L12 22" stroke="currentColor" stroke-width="1.2"/>`,

  // ─── LIGHTNING ────────────────────────────────────────────────────────────
  lightning: `<path d="M13 2L4 13H11L10 22L20 10H13L13 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>`,

  // ─── FIRE ─────────────────────────────────────────────────────────────────
  fire: `<path d="M12 22C12 22 5 18 5 12C5 9 7 7 9 6C9 6 8.5 10 11 11C11 11 10 8 13 6C13 6 14 9 16 10C17.5 10 19 8.5 19 7C19 10 21 12 21 15C21 19 17 22 12 22Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
         <path d="M12 22C12 22 9 20 9 17C9 15 10.5 14 12 13.5C12 13.5 11.5 16 14 17" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>`,

  // ─── TROPHY ───────────────────────────────────────────────────────────────
  trophy: `<path d="M6 3H18V13C18 16.3 15.3 19 12 19C8.7 19 6 16.3 6 13V3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
           <path d="M6 6H3C3 6 3 11 6 11" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
           <path d="M18 6H21C21 6 21 11 18 11" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
           <path d="M12 19V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
           <path d="M8 22H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,

  // ─── CHART ────────────────────────────────────────────────────────────────
  chart: `<rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <path d="M7 16L10 11L13 14L16 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,

  // ─── ROCKET ───────────────────────────────────────────────────────────────
  rocket: `<path d="M12 2C12 2 20 4 20 12C20 15 18 18 18 18H6C6 18 4 15 4 12C4 4 12 2 12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
           <circle cx="12" cy="10" r="2" stroke="currentColor" stroke-width="1.3" fill="none"/>
           <path d="M8 18L6 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
           <path d="M16 18L18 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,

  // ─── ROBOT ────────────────────────────────────────────────────────────────
  robot: `<rect x="5" y="8" width="14" height="11" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <rect x="9" y="4" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <path d="M9 12H9.01M15 12H15.01" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M9.5 16H14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M2 12H5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M19 12H22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,

  // ─── LINK ─────────────────────────────────────────────────────────────────
  link: `<path d="M10 14C10.9 15.1 12.2 16 14 16C17.3 16 20 13.3 20 10C20 6.7 17.3 4 14 4C12.2 4 10.9 4.9 10 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
         <path d="M14 10C13.1 8.9 11.8 8 10 8C6.7 8 4 10.7 4 14C4 17.3 6.7 20 10 20C11.8 20 13.1 19.1 14 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>`,

  // ─── BOOK ─────────────────────────────────────────────────────────────────
  book: `<path d="M4 4H14C15.1 4 16 4.9 16 6V20C16 21.1 15.1 22 14 22H4C2.9 22 2 21.1 2 20V4C2 2.9 2.9 2 4 2V4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
         <path d="M16 8H19C20.1 8 21 8.9 21 10V22H16" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
         <path d="M6 8H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
         <path d="M6 12H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
         <path d="M6 16H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,

  // ─── MEDAL ────────────────────────────────────────────────────────────────
  medal: `<circle cx="12" cy="15" r="6" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <path d="M8.5 9L6 3H10L12 7L14 3H18L15.5 9" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
          <path d="M12 12V18" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          <path d="M9.5 15H14.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>`,

  // ─── TICKET ───────────────────────────────────────────────────────────────
  ticket: `<rect x="2" y="7" width="20" height="10" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
           <path d="M14 7V17" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2"/>
           <circle cx="17.5" cy="12" r="1.5" stroke="currentColor" stroke-width="1.2" fill="none"/>`,

  // ─── USERS ────────────────────────────────────────────────────────────────
  users: `<circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <path d="M3 20C3 16.7 5.7 14 9 14C10.3 14 11.5 14.4 12.5 15.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="17" cy="12" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <path d="M12.5 20C12.5 17.5 14.5 15.5 17 15.5C19.5 15.5 21.5 17.5 21.5 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,

  // ─── SHOP ─────────────────────────────────────────────────────────────────
  shop: `<path d="M3 3H5L8 16H18L21 7H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
         <circle cx="10" cy="20" r="1.5" stroke="currentColor" stroke-width="1.3" fill="none"/>
         <circle cx="16" cy="20" r="1.5" stroke="currentColor" stroke-width="1.3" fill="none"/>`,

  // ─── PLUG ─────────────────────────────────────────────────────────────────
  plug: `<path d="M7 2V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
         <path d="M17 2V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
         <path d="M5 8H19L18 15C17.5 18 15 20 12 20C9 20 6.5 18 6 15L5 8Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
         <path d="M12 20V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,

  // ─── GRAPH ────────────────────────────────────────────────────────────────
  graph: `<path d="M3 20H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M3 20V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M7 14L11 9L15 12L20 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M20 6L20 10M20 6H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,

  // ─── PAW ──────────────────────────────────────────────────────────────────
  paw: `<circle cx="12" cy="15" r="4" stroke="currentColor" stroke-width="1.5" fill="none"/>
        <circle cx="6" cy="12" r="2" stroke="currentColor" stroke-width="1.3" fill="none"/>
        <circle cx="18" cy="12" r="2" stroke="currentColor" stroke-width="1.3" fill="none"/>
        <circle cx="8.5" cy="7" r="1.8" stroke="currentColor" stroke-width="1.3" fill="none"/>
        <circle cx="15.5" cy="7" r="1.8" stroke="currentColor" stroke-width="1.3" fill="none"/>`,

  // ─── HAMMER ───────────────────────────────────────────────────────────────
  hammer: `<path d="M9 4L5 8L4 12H8L12 8L9 4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
           <path d="M8 12L16 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
           <path d="M14 5L19 10L17 12L12 7L14 5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>`,

  // ─── VOLUME ───────────────────────────────────────────────────────────────
  volume: `<path d="M11 6L6 10H3V14H6L11 18V6Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
           <path d="M15 9C16.3 10.3 16.3 13.7 15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
           <path d="M18 6C21 8.7 21 15.3 18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,

  // ─── GLOBE ────────────────────────────────────────────────────────────────
  globe: `<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <path d="M12 3C12 3 9 7 9 12C9 17 12 21 12 21" stroke="currentColor" stroke-width="1.2"/>
          <path d="M12 3C12 3 15 7 15 12C15 17 12 21 12 21" stroke="currentColor" stroke-width="1.2"/>
          <path d="M3 12H21" stroke="currentColor" stroke-width="1.2"/>`,

  // ─── BOX ──────────────────────────────────────────────────────────────────
  box: `<path d="M3 9H21L19 21H5L3 9Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
        <path d="M3 9L5 3H19L21 9" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
        <path d="M9 9V15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M15 9V15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,

  // ─── LEAF ─────────────────────────────────────────────────────────────────
  leaf: `<path d="M12 22C6 22 4 17 4 12C4 7 8 3 14 3C20 3 21 8 21 11C21 16 18 22 12 22Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
         <path d="M12 22C12 22 10 18 10 14C10 10 14 7 14 7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>`,

  // ─── FLASK ────────────────────────────────────────────────────────────────
  flask: `<path d="M9 3H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M10 3V10L5 19C4.5 20 5.2 21 6.5 21H17.5C18.8 21 19.5 20 19 19L14 10V3" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
          <path d="M7 16H17" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>`,

  // ─── CHECKLIST ────────────────────────────────────────────────────────────
  checklist: `<rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
              <path d="M8 8H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M8 12H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M14 15L16 17L20 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,

  // ─── WARNING ──────────────────────────────────────────────────────────────
  warning: `<path d="M12 3L22 21H2L12 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
            <path d="M12 10V14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <circle cx="12" cy="17.5" r="1" fill="currentColor"/>`,

  // ─── CHECK ────────────────────────────────────────────────────────────────
  check: `<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,

  // ─── SPARKLE ──────────────────────────────────────────────────────────────
  sparkle: `<path d="M12 2L13.5 9L20 10L13.5 11L12 18L10.5 11L4 10L10.5 9L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
            <path d="M5 4L5.5 6L7 6.5L5.5 7L5 9L4.5 7L3 6.5L4.5 6L5 4Z" stroke="currentColor" stroke-width="1" stroke-linejoin="round" fill="none"/>
            <path d="M19 14L19.5 16L21 16.5L19.5 17L19 19L18.5 17L17 16.5L18.5 16L19 14Z" stroke="currentColor" stroke-width="1" stroke-linejoin="round" fill="none"/>`,

  // ─── TARGET ───────────────────────────────────────────────────────────────
  target: `<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/>
           <circle cx="12" cy="12" r="5.5" stroke="currentColor" stroke-width="1.2" fill="none"/>
           <circle cx="12" cy="12" r="2" fill="currentColor"/>
           <path d="M12 3V6M12 18V21M3 12H6M18 12H21" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>`,

  // ─── MOON ─────────────────────────────────────────────────────────────────
  moon: `<path d="M21 12.8C20.3 16.9 16.7 20 12.3 20C7.3 20 3.3 16 3.3 11C3.3 6.6 6.4 3 10.5 2.3C7.7 5.1 7.5 9.9 10.1 12.9C12.7 15.9 17.5 16.4 21 12.8Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>`,

  // ─── SUN ──────────────────────────────────────────────────────────────────
  sun: `<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5" fill="none"/>
        <path d="M12 2V5M12 19V22M2 12H5M19 12H22M4.9 4.9L7.1 7.1M16.9 16.9L19.1 19.1M19.1 4.9L16.9 7.1M7.1 16.9L4.9 19.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,

  // ─── MATRIX ───────────────────────────────────────────────────────────────
  matrix: `<rect x="3" y="3" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.3" fill="none"/>
           <rect x="10" y="3" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.3" fill="none"/>
           <rect x="17" y="3" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.3" fill="none"/>
           <rect x="3" y="10" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.3" fill="none"/>
           <rect x="10" y="10" width="4" height="4" rx="0.5" fill="currentColor"/>
           <rect x="17" y="10" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.3" fill="none"/>
           <rect x="3" y="17" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.3" fill="none"/>
           <rect x="10" y="17" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.3" fill="none"/>
           <rect x="17" y="17" width="4" height="4" rx="0.5" stroke="currentColor" stroke-width="1.3" fill="none"/>`,

  // ─── CLOCK ────────────────────────────────────────────────────────────────
  clock: `<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <path d="M12 7V12L15 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,

  // ─── PAINT ────────────────────────────────────────────────────────────────
  paint: `<path d="M2 20C2 20 7 15 12 15C17 15 22 20 22 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <rect x="8" y="3" width="8" height="10" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <path d="M10 7H14M10 9.5H13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>`,

  // ─── SERVER ───────────────────────────────────────────────────────────────
  server: `<rect x="3" y="4" width="18" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
           <rect x="3" y="14" width="18" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
           <circle cx="7" cy="7" r="1" fill="currentColor"/>
           <circle cx="7" cy="17" r="1" fill="currentColor"/>
           <path d="M11 7H15M11 17H15" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>`,

  // ─── DATABASE ─────────────────────────────────────────────────────────────
  database: `<ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" stroke-width="1.5" fill="none"/>
             <path d="M4 6V12C4 13.7 7.6 15 12 15C16.4 15 20 13.7 20 12V6" stroke="currentColor" stroke-width="1.5" fill="none"/>
             <path d="M4 12V18C4 19.7 7.6 21 12 21C16.4 21 20 19.7 20 18V12" stroke="currentColor" stroke-width="1.5" fill="none"/>`,

  // ─── BRAIN ────────────────────────────────────────────────────────────────
  brain: `<path d="M9 3C6.2 3 4 5.2 4 8C4 9.5 4.6 10.9 5.6 11.9C4.6 12.5 4 13.6 4 14.9C4 17.2 5.8 19 8 19C8 20.7 9.3 22 11 22H13C14.7 22 16 20.7 16 19C18.2 19 20 17.2 20 14.9C20 13.6 19.4 12.5 18.4 11.9C19.4 10.9 20 9.5 20 8C20 5.2 17.8 3 15 3C14.2 3 13.5 3.2 12.8 3.5C12.2 3.2 11.6 3 11 3H9Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
          <path d="M12 3V22" stroke="currentColor" stroke-width="1" stroke-dasharray="1.5 1.5"/>`,

  // ─── CHAT ─────────────────────────────────────────────────────────────────
  chat: `<path d="M4 4H16C17.1 4 18 4.9 18 6V13C18 14.1 17.1 15 16 15H9L5 19V15H4C2.9 15 2 14.1 2 13V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
         <path d="M20 8H21C22.1 8 22 8.9 22 10V17C22 18.1 21.1 19 20 19H19V22L16 19H11C9.9 19 9 18.1 9 17V16" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" fill="none"/>`,

  // ─── GUILD ────────────────────────────────────────────────────────────────
  guild: `<path d="M12 3L21 8V16L12 21L3 16V8L12 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
          <path d="M12 3V21" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2 1.5"/>
          <path d="M3 8L21 8" stroke="currentColor" stroke-width="1.2"/>
          <path d="M3 16L21 16" stroke="currentColor" stroke-width="1.2"/>`,

  // ─── RADAR ────────────────────────────────────────────────────────────────
  radar: `<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.2" fill="none"/>
          <path d="M12 12L17 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="17" cy="5" r="1.5" fill="currentColor"/>`,

  // ─── MUTE ─────────────────────────────────────────────────────────────────
  mute: `<path d="M11 6L6 10H3V14H6L11 18V6Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
         <path d="M17 9L23 15M23 9L17 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,

  // ─── PLUS ─────────────────────────────────────────────────────────────────
  plus: `<path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,

  // ─── CLOSE ────────────────────────────────────────────────────────────────
  close: `<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,

  // ─── PR ───────────────────────────────────────────────────────────────────
  pr: `<circle cx="6" cy="6" r="2.5" stroke="currentColor" stroke-width="1.4" fill="none"/>
       <circle cx="6" cy="18" r="2.5" stroke="currentColor" stroke-width="1.4" fill="none"/>
       <circle cx="18" cy="8" r="2.5" stroke="currentColor" stroke-width="1.4" fill="none"/>
       <path d="M6 8.5V15.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
       <path d="M8.5 6H13C15 6 15.5 6.5 15.5 8.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>`,

  // ─── SLACK ────────────────────────────────────────────────────────────────
  slack: `<rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <path d="M9 9H15V15H9V9Z" stroke="currentColor" stroke-width="1.3" fill="none"/>
          <path d="M9 9V6M15 9V6M9 15V18M15 15V18" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          <path d="M9 12H6M15 12H18" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>`,

  // ─── COFFEE ───────────────────────────────────────────────────────────────
  coffee: `<path d="M5 8H17L16 18C15.8 19.2 14.8 20 13.6 20H8.4C7.2 20 6.2 19.2 6 18L5 8Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
           <path d="M17 10H19C20.1 10 21 10.9 21 12V12C21 13.1 20.1 14 19 14H17" stroke="currentColor" stroke-width="1.5" fill="none"/>
           <path d="M9 4C9 4 9.5 5.5 11 5.5C12.5 5.5 13 7 13 7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>`,

  // ─── POTION ───────────────────────────────────────────────────────────────
  potion: `<path d="M9 4H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
           <path d="M10 4V8L6 13V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V13L14 8V4" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
           <path d="M7 16H17" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
           <circle cx="11" cy="14" r="1" fill="currentColor"/>
           <circle cx="14" cy="17" r="0.8" fill="currentColor"/>`,

  // ─── FLAG ─────────────────────────────────────────────────────────────────
  flag: `<path d="M5 4H19L16 10H5V4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
         <path d="M5 4V20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,

  // ─── STAR ─────────────────────────────────────────────────────────────────
  star: `<path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>`,

  // ─── CLAP ─────────────────────────────────────────────────────────────────
  clap: `<path d="M8 10L8 5.5C8 4.7 8.7 4 9.5 4C10.3 4 11 4.7 11 5.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
         <path d="M11 8.5V4.5C11 3.7 11.7 3 12.5 3C13.3 3 14 3.7 14 4.5V8.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
         <path d="M14 8V5.5C14 4.7 14.7 4 15.5 4C16.3 4 17 4.7 17 5.5V10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
         <path d="M8 10C8 10 7 11 7 13C7 17 10 21 14 21C18 21 21 18 21 14V10C21 9.2 20.3 8.5 19.5 8.5C18.7 8.5 18 9.2 18 10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" fill="none"/>
         <path d="M17 10V8.5C17 7.7 16.3 7 15.5 7C14.7 7 14 7.7 14 8.5" stroke="currentColor" stroke-width="1.3"/>`,

  // ─── KEY ──────────────────────────────────────────────────────────────────
  key: `<circle cx="8" cy="9" r="4" stroke="currentColor" stroke-width="1.5" fill="none"/>
        <path d="M12 12L21 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M17 17L19 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M19 19L21 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,

  // ─── FEEDBACK ─────────────────────────────────────────────────────────────
  feedback: `<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5" fill="none"/>
             <path d="M12 8V13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
             <circle cx="12" cy="16" r="1" fill="currentColor"/>`,
};

/**
 * SVG 아이콘을 인라인 HTML 문자열로 반환합니다.
 * @param name  아이콘 이름
 * @param style 추가 CSS 스타일 (선택)
 * @param size  픽셀 크기 (기본 16)
 * @param cls   추가 클래스 (선택)
 */
export function icon(
  name: IconName,
  style = '',
  size = 16,
  cls = ''
): string {
  const d = paths[name] ?? paths['bug'];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="display:inline-block;vertical-align:middle;flex-shrink:0;${style}" class="icon-svg${cls ? ' ' + cls : ''}" aria-hidden="true">${d}</svg>`;
}

/** 아이콘 + 텍스트 레이블을 가로 flex 행으로 묶어 반환합니다. */
export function iconLabel(
  name: IconName,
  label: string,
  style = '',
  size = 15
): string {
  return `<span style="display:inline-flex;align-items:center;gap:0.4rem;${style}">${icon(name, '', size)}${label}</span>`;
}
