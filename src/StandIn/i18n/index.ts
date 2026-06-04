type Locale = 'zh' | 'en';

function detectLocale(): Locale {
  const override = localStorage.getItem('the_stand_in_locale');
  if (override === 'en' || override === 'zh') return override;
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

const dict: Record<string, { zh: string; en: string }> = {
  brand: { zh: '替身', en: 'The Stand-In' },
  awake_hint: {
    zh: '今晚 11 点，你的账号将被一位在线好友租用 6 小时。',
    en: "At 11 tonight your account will be rented to one online friend for 6 hours.",
  },
  awake_go_to_bed: { zh: '熄灯', en: 'Turn off the light' },
  tucking_in: { zh: '熄灯中…', en: 'Lights out…' },
  asleep_subtitle: { zh: '身体已被借走', en: 'Your body is on loan' },
  asleep_renter_label: { zh: '今夜替你的人：', en: 'Standing in for you tonight:' },
  waking: { zh: '天亮了', en: 'Morning' },
  review_title: { zh: '昨夜的你做了什么', en: 'What you did last night' },
  review_subtitle: {
    zh: '你没做。{name} 用你的身份做的。',
    en: "You didn't. {name} did, as you.",
  },
  action_post_label: { zh: '一条以你身份发出的帖子', en: 'A post under your name' },
  action_bio_label: { zh: '你的 bio 标题被改成了', en: 'Your bio headline became' },
  approve: { zh: '认领', en: 'Approve' },
  disavow: { zh: '撇清', en: 'Disavow' },
  approved_stamp: { zh: '已认领', en: 'Approved' },
  disavowed_stamp: { zh: '已撇清', en: 'Disavowed' },
  ghost_was_here: {
    zh: '[Yin 的替身曾在这里] — 已撇清',
    en: "[Yin's stand-in was here] — disavowed",
  },
  cooldown_hint: {
    zh: '夜还不肯再收留你。',
    en: 'The night won\'t take you back yet.',
  },
  cooldown_ready_in: { zh: '还需 {time}', en: 'in {time}' },
  sleeping_section: { zh: '此刻沉睡', en: 'Asleep right now' },
  stand_in_cta: { zh: '替 ta 上场', en: 'Stand in' },
  stand_in_title: { zh: '趁 {name} 熟睡', en: 'While {name} sleeps' },
  stand_in_as_post: { zh: '以 ta 发帖', en: 'Post as them' },
  stand_in_as_bio: { zh: '改写 ta 的 bio', en: 'Rewrite their bio' },
  stand_in_ph_post: { zh: '替 ta 说点什么…', en: 'Say something as them…' },
  stand_in_ph_bio: { zh: '替 ta 写一句新 bio…', en: 'Write them a new bio…' },
  stand_in_publish: { zh: '替 ta 落笔', en: 'Leave your mark' },
  stand_in_done: { zh: '已替 {name} 落笔', en: 'Left, as {name}' },
  to_ledger: { zh: '查看往夜', en: 'Past nights' },
  back: { zh: '返回', en: 'Back' },
  ledger_title: { zh: '往夜台账', en: 'Ledger' },
  ledger_empty: {
    zh: '还没有过完的夜。',
    en: 'No past nights yet.',
  },
  dev_speed_label: {
    zh: '开发模式 · 30 秒 = 一夜',
    en: 'Dev clock · 30s = one night',
  },
};

let current = detectLocale();

export function t(key: keyof typeof dict, vars?: Record<string, string>): string {
  const entry = dict[key];
  let s = entry ? entry[current] : key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
  }
  return s;
}

export function setLocale(loc: Locale) {
  current = loc;
  localStorage.setItem('the_stand_in_locale', loc);
}

export function getLocale(): Locale {
  return current;
}
