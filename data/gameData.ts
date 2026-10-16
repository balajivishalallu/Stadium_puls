import { Team, MerchandiseHub, FanChatMessage, Poll, Incident, MatchFixture } from '@/types'

export const TEAMS: Team[] = [
  { flag:'🇧🇷', name:'Brazil', group:'E', color:'#1a6b3a' },
  { flag:'🇦🇷', name:'Argentina', group:'A', color:'#74acdf' },
  { flag:'🇩🇪', name:'Germany', group:'C', color:'#d4af37' },
  { flag:'🇫🇷', name:'France', group:'B', color:'#002395' },
  { flag:'🇪🇸', name:'Spain', group:'F', color:'#c60b1e' },
  { flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', name:'England', group:'D', color:'#cf081f' },
  { flag:'🇵🇹', name:'Portugal', group:'G', color:'#006600' },
  { flag:'🇳🇱', name:'Netherlands', group:'H', color:'#ff6600' },
  { flag:'🇧🇪', name:'Belgium', group:'A', color:'#c8102e' },
  { flag:'🇺🇸', name:'USA', group:'B', color:'#b22234' },
  { flag:'🇲🇽', name:'Mexico', group:'C', color:'#006847' },
  { flag:'🇯🇵', name:'Japan', group:'D', color:'#bc002d' },
  { flag:'🇰🇷', name:'South Korea', group:'E', color:'#003478' },
  { flag:'🇲🇦', name:'Morocco', group:'F', color:'#c1272d' },
  { flag:'🇸🇳', name:'Senegal', group:'G', color:'#00853f' },
  { flag:'🇨🇦', name:'Canada', group:'H', color:'#d52b1e' },
  { flag:'🇺🇾', name:'Uruguay', group:'A', color:'#75aadb' },
  { flag:'🇨🇴', name:'Colombia', group:'B', color:'#fcd116' },
  { flag:'🇦🇺', name:'Australia', group:'E', color:'#00008b' },
  { flag:'🇵🇱', name:'Poland', group:'F', color:'#dc143c' },
  { flag:'🇩🇰', name:'Denmark', group:'G', color:'#c60c30' },
  { flag:'🇨🇷', name:'Costa Rica', group:'A', color:'#002b7f' },
  { flag:'🇬🇭', name:'Ghana', group:'B', color:'#006b3f' },
  { flag:'🇪🇨', name:'Ecuador', group:'C', color:'#ffda00' },
  { flag:'🇨🇲', name:'Cameroon', group:'D', color:'#007a5e' },
  { flag:'🇮🇷', name:'Iran', group:'E', color:'#239f40' },
  { flag:'🇵🇪', name:'Peru', group:'F', color:'#d91023' },
  { flag:'🇸🇰', name:'Slovakia', group:'G', color:'#005da4' },
  { flag:'🇳🇬', name:'Nigeria', group:'H', color:'#008751' },
  { flag:'🇸🇦', name:'Saudi Arabia', group:'D', color:'#006c35' },
  { flag:'🇨🇱', name:'Chile', group:'C', color:'#d52b1e' },
  { flag:'🇸🇮', name:'Slovenia', group:'H', color:'#003da5' },
]

export const MERCH_HUBS: Record<string, MerchandiseHub[]> = {
  metlife: [
    { name:'Brazil Fan Zone', icon:'🇧🇷', distance:'180m', section:'Section 110 Fan Plaza, Field Level', desc:'Official Seleção jerseys, scarves, flags. Caipirinha bar adjacent. Drum circle at kickoff.', team:'Brazil' },
    { name:'Argentina Corner', icon:'🇦🇷', distance:'250m', section:'Gate A Concourse, NW entry', desc:'Albiceleste gear, signed memorabilia, mate drink stands. Face painting available.', team:'Argentina' },
    { name:'Germany Haus', icon:'🇩🇪', distance:'320m', section:'Club Level East, Section 220', desc:'DFB kits, beer garden atmosphere, official DFB merchandise and bratwurst stand nearby.', team:'Germany' },
    { name:'USA Home Base', icon:'🇺🇸', distance:'90m', section:'West Concourse, Gate D plaza', desc:'Stars & Stripes gear, official FIFA 2026 host edition merchandise and patriotic fan zone.', team:'USA' },
    { name:'England End', icon:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', distance:'210m', section:'Section 220 Mezzanine, Club access', desc:'Three Lions kits, official FA merchandise. Fish & chips pie vendors immediately adjacent.', team:'England' },
    { name:'Global Fan Village', icon:'🌍', distance:'400m', section:'South End Plaza — all teams', desc:'All 32 nations under one roof — flags, scarves, trading cards, food fusion market.', team:'All' },
    { name:'Portugal Pavilion', icon:'🇵🇹', distance:'280m', section:'Section 133, Gate D side', desc:'Official FPF merchandise, pastel de nata café stand, Ronaldo memorabilia.', team:'Portugal' },
    { name:'France Carré', icon:'🇫🇷', distance:'300m', section:'Upper Level entrance, Section 301', desc:'Les Bleus kits, official FFF gear, crepe and pastry stand alongside.', team:'France' },
  ],
  att: [
    { name:'South America Zone', icon:'🌎', distance:'120m', section:'West Plaza Main — all gates entry', desc:'Brazil, Argentina, Colombia, Uruguay — samba, music, culture and authentic merchandise combined.', team:'Brazil' },
    { name:'Europe & Africa Hub', icon:'🌍', distance:'200m', section:'East Plaza — Gates 1 & 2 side', desc:'France, Germany, Morocco, Senegal — multicultural fan village with food and music.', team:'France' },
    { name:'Mexico Fan Zone ¡Tri!', icon:'🇲🇽', distance:'80m', section:'Gate 6 Entrance Plaza, West main', desc:'El Tri jerseys, Aztec motifs, lucha libre masks, torta and churro vendors next door.', team:'Mexico' },
    { name:'USA Home Zone', icon:'🇺🇸', distance:'60m', section:'Gate 5 West side, main concourse', desc:'Official US Soccer Store, host nation FIFA 2026 limited edition specials and memorabilia.', team:'USA' },
    { name:'Asia Pacific Hub', icon:'🌏', distance:'350m', section:'North Concourse, Section 301 area', desc:'Japan, South Korea, Australia, Saudi Arabia fan zones — merchandise and fan meetups.', team:'Japan' },
    { name:'Africa Pride Village', icon:'🌍', distance:'280m', section:'Section 135, South America Cantina area', desc:'Morocco, Senegal, Ghana, Nigeria — vibrant colors, drumming circles, afro-fusion food.', team:'Morocco' },
    { name:'Argentina Corner TX', icon:'🇦🇷', distance:'190m', section:'Gate 4 North Plaza', desc:'Albiceleste gear, official AFA store, mate bar and empanada food truck.', team:'Argentina' },
    { name:'Brazil Sambódromo', icon:'🇧🇷', distance:'150m', section:'West Fan Zone, Gate 6 area', desc:'Full Brazil fan experience — caipirinha bar, live samba, official CBF merchandise.', team:'Brazil' },
  ],
}

export const FAN_CHAT_MESSAGES: FanChatMessage[] = [
  { user:'Carlos M.', flag:'🇲🇽', msg:'¡Vamos México! ¿Alguien sabe dónde está la zona de México aquí?', lang:'es', type:'normal' },
  { user:'Emma J.', flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', msg:'Gate B2 is absolutely packed — impossible to move through! Stewards not helping 😤', lang:'en', type:'flagged', flag_reason:'⚠️ Congestion reported at Gate B2' },
  { user:'Ryo T.', flag:'🇯🇵', msg:'日本ファンゾーンはどこですか？ステージはありますか？', lang:'ja', type:'normal' },
  { user:'Sofia A.', flag:'🇧🇷', msg:'Alguém pode me ajudar? Perdi minha mochila vermelha Nike perto da seção 118!', lang:'pt', type:'flagged', flag_reason:'🔍 Lost item — red backpack Section 118' },
  { user:'Ahmed K.', flag:'🇸🇦', msg:'أين أقرب مكان للإسعافات الأولية؟ أحتاج مساعدة عاجلة', lang:'ar', type:'critical', flag_reason:'🚨 Urgent medical assistance inquiry' },
  { user:'Marc D.', flag:'🇫🇷', msg:'Incroyable ambiance ce soir! Allez les Bleus! On les a!! 🔵⚪🔴', lang:'fr', type:'normal' },
  { user:'Jake R.', flag:'🇺🇸', msg:'The food at Section 118 (Global Bites) is ABSOLUTELY INSANE. Those empanadas 🔥🔥', lang:'en', type:'normal' },
  { user:'Ana L.', flag:'🇨🇴', msg:'Hay mucha gente en el pasillo D4, no podemos pasar con silla de ruedas para nada 😟', lang:'es', type:'critical', flag_reason:'🚨 Wheelchair access blocked — Corridor D4' },
  { user:'Kevin O.', flag:'🇳🇬', msg:'Super Eagles fans section is ELECTRIC tonight! Gate C was super smooth, great job! 👏🦅', lang:'en', type:'normal' },
  { user:'Ji-ho P.', flag:'🇰🇷', msg:'대한민국!! 한국 응원단 어디 모여요? 응원 같이해요! 🇰🇷', lang:'ko', type:'normal' },
  { user:'Luciana V.', flag:'🇦🇷', msg:'Encontré un monedero en la sección 140, lo llevo a perdidos y hallados ahora', lang:'es', type:'flagged', flag_reason:'📦 Found item reported — wallet Sec 140' },
  { user:'Tom B.', flag:'🇩🇪', msg:'The NJ Transit rail from Secaucus was PERFECT. Easy 8 mins from NYC! Highly recommend 👍', lang:'en', type:'normal' },
  { user:'Priya S.', flag:'🇮🇳', msg:"Gate A2 is really well managed! Step-free access worked great for my grandfather's wheelchair 🙏", lang:'en', type:'normal' },
  { user:'Yusuf A.', flag:'🇲🇦', msg:'المغرب المغرب! مشجعو الأسود في القسم 135 🦁❤️', lang:'ar', type:'normal' },
  { user:'Claire M.', flag:'🇨🇦', msg:"Concession line at Section 311 is about 15+ minutes. Is there a faster option nearby? It's urgent!", lang:'en', type:'flagged', flag_reason:'⚠️ Long wait time — Section 311 concessions' },
]

export const POLLS: Poll[] = [
  {
    question: 'How would you rate the overall stadium experience so far today?',
    options: [
      { label: '⭐⭐⭐⭐⭐ Excellent — world class!', votes: 1204 },
      { label: '⭐⭐⭐⭐ Very Good', votes: 891 },
      { label: '⭐⭐⭐ Good — some issues', votes: 487 },
      { label: '⭐⭐ Needs significant improvement', votes: 265 },
    ],
  },
  {
    question: 'Which stadium facility needs the most improvement today?',
    options: [
      { label: '🍕 Food & drink queue times', votes: 823 },
      { label: '🚻 Restroom capacity', votes: 612 },
      { label: '📡 Mobile signal & WiFi', votes: 445 },
      { label: '🚌 Transport coordination', votes: 389 },
    ],
  },
  {
    question: 'Would you use AI-powered stadium navigation again at a future match?',
    options: [
      { label: '✅ Absolutely yes — loved it', votes: 1892 },
      { label: '🤔 Probably yes', votes: 534 },
      { label: '😐 Maybe, depends on accuracy', votes: 98 },
      { label: '❌ Prefer traditional maps', votes: 34 },
    ],
  },
  {
    question: "How was the accessibility support at your entry gate today?",
    options: [
      { label: '♿ Excellent — smooth and helpful', votes: 643 },
      { label: '👍 Good — minor wait', votes: 412 },
      { label: '😐 Average — could be better', votes: 211 },
      { label: '❌ Poor — needs urgent improvement', votes: 89 },
    ],
  },
]

export const INCIDENTS: Incident[] = [
  { id:'INC-001', time:'16:42', type:'Congestion', severity:'HIGH', gate:'B2', desc:'Crowd density reached 94% — crowd mitigation directive broadcast active', status:'Active' },
  { id:'INC-002', time:'15:33', type:'Lost Item', severity:'LOW', gate:'A1', desc:'Camera bag (Canon DSLR) found near media zone — sent to Lost & Found', status:'Resolved' },
  { id:'INC-003', time:'14:22', type:'Medical', severity:'MEDIUM', gate:'FA-106', desc:'Fan reported dizziness near Section 106 — medical team dispatched, condition stable', status:'Monitoring' },
  { id:'INC-004', time:'13:45', type:'Accessibility', severity:'MEDIUM', gate:'D4', desc:'Wheelchair user unable to navigate Corridor D4 due to crowd — escort team provided', status:'Resolved' },
  { id:'INC-005', time:'12:05', type:'Lost Item', severity:'LOW', gate:'C2', desc:'Brown leather wallet found near Gate C turnstile — owner notified', status:'Resolved' },
  { id:'INC-006', time:'11:50', type:'Transport', severity:'MEDIUM', gate:'Gate B', desc:'NJ Transit Route 352 delayed 5 minutes — fans advised of alternative Route 351', status:'Monitoring' },
]

export const MATCH_FIXTURES: MatchFixture[] = [
  { team1: { flag:'🇪🇸', name:'Spain' }, team2: { flag:'🇧🇪', name:'Belgium' }, score:[2,1], minute:67, venue:'metlife' },
  { team1: { flag:'🇦🇷', name:'Argentina' }, team2: { flag:'🇪🇬', name:'Egypt' }, score:[3,2], minute:88, venue:'att' },
  { team1: { flag:'🇺🇸', name:'USA' }, team2: { flag:'🇲🇽', name:'Mexico' }, score:[0,0], minute:34, venue:'metlife' },
]
