// Dev seed: populates the demo account with channels, today's plan, a backlog,
// and ~2 weeks of completed history so analytics looks alive.
// Usage: set env from .env.local, then `node scripts/seed.mjs`
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SECRET_KEY;
const EMAIL = process.env.SEED_EMAIL || "demo@cadence.test";
if (!URL || !KEY) throw new Error("Missing Supabase env (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY)");
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

const d = (n = 0) => {
  const t = new Date();
  t.setDate(t.getDate() + n);
  return [t.getFullYear(), String(t.getMonth() + 1).padStart(2, "0"), String(t.getDate()).padStart(2, "0")].join("-");
};
async function rest(path, opts = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, { ...opts, headers: { ...H, ...(opts.headers || {}) } });
  if (!res.ok) throw new Error(`${opts.method || "GET"} ${path} -> ${res.status} ${await res.text()}`);
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}

// find user by email
const adminRes = await fetch(`${URL}/auth/v1/admin/users`, { headers: H });
const admin = await adminRes.json();
const user = (admin.users || admin).find((u) => u.email === EMAIL);
if (!user) throw new Error(`User ${EMAIL} not found — sign up first.`);
const USER = user.id;

await rest(`tasks?user_id=eq.${USER}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
await rest(`channels?user_id=eq.${USER}`, { method: "DELETE", headers: { Prefer: "return=minimal" } });
await rest(`profiles?id=eq.${USER}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ onboarded: true, full_name: "Demo User" }) });

const channelDefs = [
  { name: "Work", color: "#6366f1", emoji: "💼" },
  { name: "Deep Work", color: "#8b5cf6", emoji: "🧠" },
  { name: "Personal", color: "#10b981", emoji: "🌱" },
  { name: "Health", color: "#f97316", emoji: "🏃" },
  { name: "Admin", color: "#64748b", emoji: "📥" },
];
const ch = await rest("channels", {
  method: "POST",
  headers: { Prefer: "return=representation" },
  body: JSON.stringify(channelDefs.map((c, i) => ({ ...c, user_id: USER, position: (i + 1) * 1000 }))),
});
const byName = Object.fromEntries(ch.map((c) => [c.name, c.id]));
const names = channelDefs.map((c) => c.name);

let pos = 0;
const P = () => (pos += 1000);
const mk = (t) => ({
  user_id: USER,
  title: t.title,
  channel_id: byName[t.channel] ?? null,
  status: t.status,
  planned_date: t.date ?? null,
  estimated_minutes: t.est ?? 0,
  actual_minutes: t.actual ?? 0,
  priority: t.priority ?? "none",
  position: P(),
});

const curated = [
  { title: "Draft Q3 planning doc", channel: "Work", status: "in_progress", est: 60, actual: 25, date: d(0), priority: "high" },
  { title: "Design the analytics schema", channel: "Deep Work", status: "planned", est: 90, date: d(0), priority: "medium" },
  { title: "Review open pull requests", channel: "Work", status: "done", est: 30, actual: 28, date: d(0) },
  { title: "Reply to customer emails", channel: "Admin", status: "done", est: 20, actual: 22, date: d(0) },
  { title: "Midday walk", channel: "Health", status: "planned", est: 30, date: d(0) },
  { title: "Book dentist appointment", channel: "Personal", status: "planned", est: 10, date: d(0), priority: "low" },
  { title: "Sprint planning", channel: "Work", status: "planned", est: 45, date: d(1) },
  { title: "Prototype chart interactions", channel: "Deep Work", status: "planned", est: 120, date: d(1), priority: "high" },
  { title: "Call mom", channel: "Personal", status: "planned", est: 20, date: d(1) },
  { title: "Grocery run", channel: "Personal", status: "planned", est: 40, date: d(2) },
  { title: "Read 'Deep Work' — chapter 3", channel: "Deep Work", status: "backlog", est: 40 },
  { title: "Plan weekend trip", channel: "Personal", status: "backlog", est: 30 },
  { title: "Refactor the auth module", channel: "Work", status: "backlog", est: 90, priority: "medium" },
  { title: "Renew gym membership", channel: "Health", status: "backlog", est: 15 },
];

// ~2 weeks of completed history
const historyTitles = [
  "Ship onboarding flow", "Team 1:1s", "Workout", "Weekly review", "Inbox zero",
  "Research charting libraries", "Write release notes", "Pair on bug fix", "Meditate",
  "Groceries", "Design review", "Update docs", "Plan sprint", "Deep work block",
  "Standup + triage", "Code review", "Run 5k", "Budget review", "Reading",
];
let hi = 0;
const history = [];
let seed = 7;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
for (let i = 1; i <= 14; i++) {
  const count = 2 + Math.floor(rnd() * 3); // 2-4
  for (let j = 0; j < count; j++) {
    const channel = names[Math.floor(rnd() * names.length)];
    const est = [20, 30, 45, 60, 90][Math.floor(rnd() * 5)];
    const actual = Math.max(10, Math.round(est * (0.7 + rnd() * 0.7)));
    history.push({ title: historyTitles[hi++ % historyTitles.length], channel, status: "done", est, actual, date: d(-i) });
  }
}

const tasks = [...curated, ...history].map(mk);
await rest("tasks", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(tasks) });
console.log(`Seeded ${EMAIL}: ${ch.length} channels, ${tasks.length} tasks (incl. ${history.length} history).`);
