import { supabase } from "./supabase";

// ─── Brand palette ────────────────────────────────────────────────────────────
const C = {
  navy:     "#0e3a55",
  navyMid:  "#1a5276",
  ocean:    "#1d7ea8",
  sand:     "#f4efe6",
  cream:    "#faf7f2",
  ivory:    "#fcfaf7",
  warm:     "#c9a96e",
  warmPale: "#e8d9bf",
  coral:    "#d4604a",
  sage:     "#6ba585",
  muted:    "#8fa3b0",
  border:   "#d6e4ec",
  white:    "#ffffff",
  text:     "#1a2f3d",
  light:    "#eaf4f9",
};
const FONT = `'Noto Serif JP','Noto Sans JP',serif`;
const SANS = `'Noto Sans JP',sans-serif`;

// ─── Age helpers ──────────────────────────────────────────────────────────────
const calcMonths = (birthdate) => {
  if (!birthdate) return null;
  const b = new Date(birthdate), n = new Date();
  return (n.getFullYear() - b.getFullYear()) * 12 + n.getMonth() - b.getMonth();
};
const ageLabel = (months) => {
  if (months === null) return "—";
  if (months < 0) return "0ヶ月";
  return months >= 12
    ? `${Math.floor(months / 12)}歳${months % 12 > 0 ? months % 12 + "ヶ月" : ""}`
    : `${months}ヶ月`;
};

// ─── Stage logic ──────────────────────────────────────────────────────────────
const STAGES = [
  { label: "子犬（離乳〜4ヶ月）",  coeff: 3.0 },
  { label: "子犬（4ヶ月〜1歳）",   coeff: 2.5 },
  { label: "成犬・去勢/避妊済み",  coeff: 1.6 },
  { label: "成犬・未去勢/未避妊",  coeff: 1.8 },
  { label: "高齢犬（7歳以上）",    coeff: 1.4 },
  { label: "肥満傾向",             coeff: 1.2 },
  { label: "減量中",               coeff: 1.0 },
  { label: "妊娠中",               coeff: 3.0 },
  { label: "授乳中",               coeff: 4.8 },
];

const suggestStage = (profile) => {
  const months = calcMonths(profile?.birthdate);
  if (months === null) return profile?.neutered ? 2 : 3;
  if (months < 4)   return 0;
  if (months < 12)  return 1;
  if (months >= 84) return 4;
  return profile?.neutered ? 2 : 3;
};

// ─── Calc ─────────────────────────────────────────────────────────────────────
const calcRER   = (w)     => Math.round(70 * Math.pow(w, 0.75));
const calcDER   = (w, si) => Math.round(calcRER(w) * STAGES[si].coeff);
const calcGrams = (d, kc) => Math.round((d / kc) * 100);

// ─── Icons ────────────────────────────────────────────────────────────────────
const PATHS = {
  home:    "M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z M9 21V12h6v9",
  weight:  "M12 3a4 4 0 014 4v1h3a1 1 0 011 1v11a1 1 0 01-1 1H5a1 1 0 01-1-1V9a1 1 0 011-1h3V7a4 4 0 014-4zm0 2a2 2 0 00-2 2v1h4V7a2 2 0 00-2-2zm-1 8v4h2v-4h-2z",
  feed:    "M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3",
  vomit:   "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
  profile: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 110 8 4 4 0 010-8z",
  plus:    "M12 5v14M5 12h14",
  camera:  "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11zM12 17a4 4 0 100-8 4 4 0 000 8z",
  video:   "M15 10l4.553-2.276A1 1 0 0121 8.677V15.32a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z",
  trash:   "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  back:    "M15 18l-6-6 6-6",
  chevron: "M9 18l6-6-6-6",
  edit:    "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  spin:    "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
};

const Icon = ({ n, size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={PATHS[n] || ""} />
  </svg>
);

// ─── Loading spinner ──────────────────────────────────────────────────────────
const Spinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
    <svg width={32} height={32} viewBox="0 0 24 24" fill="none"
      stroke={C.ocean} strokeWidth="2" strokeLinecap="round"
      style={{ animation: "spin 1s linear infinite" }}>
      <path d={PATHS.spin} />
    </svg>
  </div>
);

// ─── Shared UI ────────────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{
    background: C.ivory, borderRadius: 16,
    boxShadow: "0 2px 16px rgba(14,58,85,0.08)",
    overflow: "hidden", ...style,
  }}>{children}</div>
);

const Lbl = ({ children, light }) => (
  <div style={{
    fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
    color: light ? "rgba(255,255,255,0.5)" : C.muted, marginBottom: 6, fontFamily: SANS,
  }}>{children}</div>
);

const iStyle = {
  width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10,
  padding: "11px 13px", fontSize: 15, color: C.text,
  background: C.cream, fontFamily: SANS, outline: "none",
  boxSizing: "border-box", WebkitAppearance: "none",
};

const PBtn = ({ children, onClick, style = {}, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{
    border: "none", borderRadius: 11, padding: "13px 20px",
    background: disabled ? C.muted : `linear-gradient(135deg,${C.navy},${C.navyMid})`,
    color: C.white, cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 14, fontWeight: 700, fontFamily: SANS, letterSpacing: "0.04em",
    boxShadow: `0 4px 14px rgba(14,58,85,0.25)`,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    ...style,
  }}>{children}</button>
);

const GBtn = ({ children, onClick }) => (
  <button onClick={onClick} style={{
    border: `1.5px solid ${C.border}`, borderRadius: 11,
    padding: "13px 20px", background: "transparent",
    color: C.muted, cursor: "pointer", fontSize: 14,
    fontWeight: 600, fontFamily: SANS,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  }}>{children}</button>
);

const PageHeader = ({ title, sub, onBack, action }) => (
  <header style={{
    position: "sticky", top: 0, zIndex: 50,
    background: C.ivory, borderBottom: `1px solid ${C.border}`,
    padding: "14px 16px", display: "flex", alignItems: "center", gap: 10,
    boxShadow: "0 1px 10px rgba(14,58,85,0.06)",
  }}>
    {onBack && (
      <button onClick={onBack} style={{ border: "none", background: "none", padding: 4, cursor: "pointer" }}>
        <Icon n="back" size={22} color={C.navy} />
      </button>
    )}
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: C.navy, fontFamily: FONT }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, fontFamily: SANS, marginTop: 1 }}>{sub}</div>}
    </div>
    {action}
  </header>
);

// ─── Sparkline ────────────────────────────────────────────────────────────────
const Sparkline = ({ weights }) => {
  if (weights.length < 2) return null;
  const vals = weights.map(w => w.value);
  const min = Math.min(...vals) - 0.05, max = Math.max(...vals) + 0.05;
  const W = 300, H = 64;
  const x = i => (i / (vals.length - 1)) * W;
  const y = v => H - ((v - min) / (max - min)) * H;
  const pts  = vals.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = `M${x(0)},${y(vals[0])} ` +
    vals.slice(1).map((v, i) => `L${x(i + 1)},${y(v)}`).join(" ") +
    ` L${W},${H} L0,${H}Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H, display: "block" }}>
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.ocean} stopOpacity=".22" />
            <stop offset="100%" stopColor={C.ocean} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#sg)" />
        <polyline points={pts} fill="none" stroke={C.ocean} strokeWidth="2" strokeLinejoin="round" />
        {vals.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r="3.5"
            fill={C.ivory} stroke={C.ocean} strokeWidth="2" />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between",
        fontSize: 10, color: C.muted, marginTop: 3, fontFamily: SANS }}>
        {weights.map(w => <span key={w.id}>{w.recorded_at?.slice(5)}</span>)}
      </div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = ({ weights, feedSettings, profile, onNav }) => {
  const latest = weights[0];
  const w   = latest?.value;
  const der = w && feedSettings ? calcDER(w, feedSettings.stage_index) : null;
  const g   = der && feedSettings?.kcal_per_100g ? calcGrams(der, feedSettings.kcal_per_100g) : null;
  const months = calcMonths(profile?.birthdate);

  return (
    <div style={{ minHeight: "100vh", background: C.sand, paddingBottom: 90 }}>
      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          width: "100%", aspectRatio: "4/3", maxHeight: 380,
          background: `linear-gradient(160deg,${C.navy} 0%,${C.navyMid} 100%)`,
          position: "relative", overflow: "hidden",
        }}>
          {profile?.photo_url ? (
            <img src={profile.photo_url} alt={profile.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }} />
          ) : (
            <div style={{
              width: "100%", height: "100%", display: "flex",
              flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                border: `2px solid rgba(255,255,255,0.2)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon n="camera" size={32} color="rgba(255,255,255,0.25)" />
              </div>
              <button onClick={() => onNav("profile")} style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: 20, padding: "8px 16px",
                color: "rgba(255,255,255,0.7)", cursor: "pointer",
                fontSize: 13, fontFamily: SANS,
              }}>プロフィールで写真を設定</button>
            </div>
          )}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "60%",
            background: `linear-gradient(to top,${C.navy}f0 0%,${C.navy}80 35%,transparent 100%)`,
          }} />
          <div style={{ position: "absolute", bottom: -1, left: 0, right: 0 }}>
            <svg viewBox="0 0 430 30" preserveAspectRatio="none"
              style={{ width: "100%", height: 30, display: "block" }}>
              <path d="M0,20 C70,5 140,30 215,15 C290,0 360,25 430,12 L430,30 L0,30 Z" fill={C.sand} />
            </svg>
          </div>
          <div style={{ position: "absolute", bottom: 32, left: 20 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.22em",
              color: "rgba(255,255,255,0.55)", fontFamily: SANS, marginBottom: 4, textTransform: "uppercase" }}>
              {profile?.breed || "パピヨン"} · Shonan
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: C.white, fontFamily: FONT, lineHeight: 1 }}>
              {profile?.name || "Noma"}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: SANS, marginTop: 3 }}>
              ビビりなのに、冒険家。 · {ageLabel(months)}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: "18px 16px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Card>
            <div style={{ padding: "16px 14px" }}>
              <Lbl>現在の体重</Lbl>
              {w ? (
                <>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.navy, fontFamily: FONT, lineHeight: 1 }}>
                    {Number(w).toFixed(2)}<span style={{ fontSize: 13, fontWeight: 400, color: C.muted }}> kg</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4, fontFamily: SANS }}>
                    {latest.recorded_at}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: C.muted, fontFamily: SANS }}>未記録</div>
              )}
            </div>
          </Card>
          <Card style={{ background: `linear-gradient(135deg,${C.navy},${C.navyMid})` }}>
            <div style={{ padding: "16px 14px" }}>
              <Lbl light>必要カロリー</Lbl>
              {der ? (
                <>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.white, fontFamily: FONT, lineHeight: 1 }}>
                    {der}<span style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.6)" }}> kcal</span>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4, fontFamily: SANS }}>
                    1日の目安 / DER
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontFamily: SANS }}>設定が必要</div>
              )}
            </div>
          </Card>
        </div>

        {g && (
          <Card>
            <div style={{ padding: "16px 16px 18px" }}>
              <Lbl>1回あたりの給餌量（2回食）</Lbl>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                {[["🌅", "朝ごはん"], ["🌙", "夜ごはん"]].map(([emoji, label]) => (
                  <div key={label} style={{
                    flex: 1, textAlign: "center",
                    background: C.sand, borderRadius: 12, padding: "14px 8px",
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{emoji}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: C.navy, fontFamily: FONT, lineHeight: 1 }}>
                      {Math.round(g / 2)}<span style={{ fontSize: 13, fontWeight: 400, color: C.muted }}>g</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 3, fontFamily: SANS }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: C.muted, fontFamily: SANS }}>
                1日合計 <strong style={{ color: C.navy }}>{g}g</strong>
                　·　{feedSettings.kcal_per_100g} kcal/100g
              </div>
            </div>
          </Card>
        )}

        {weights.length >= 2 && (
          <Card>
            <div style={{ padding: "16px 16px 14px" }}>
              <Lbl>体重推移</Lbl>
              <div style={{ marginTop: 6 }}>
                <Sparkline weights={[...weights].slice(0, 8).reverse()} />
              </div>
            </div>
          </Card>
        )}

        {!latest && (
          <div style={{ textAlign: "center", padding: "32px 16px",
            color: C.muted, fontSize: 13, fontFamily: SANS, lineHeight: 1.8 }}>
            体重タブから最初の記録を追加してください<br />🐾
          </div>
        )}

        <div style={{ textAlign: "center", padding: "8px 0 4px",
          fontSize: 11, color: C.warmPale, letterSpacing: "0.18em", fontFamily: SANS }}>
          NOMA DIARY · SHONAN
        </div>
      </div>
    </div>
  );
};

// ─── Weight Page ──────────────────────────────────────────────────────────────
const WeightPage = ({ weights, setWeights }) => {
  const [show, setShow]   = useState(false);
  const [val,  setVal]    = useState("");
  const [date, setDate]   = useState(new Date().toISOString().slice(0, 10));
  const [memo, setMemo]   = useState("");
  const [saving, setSaving] = useState(false);

  const add = async () => {
    const v = parseFloat(val);
    if (isNaN(v) || v <= 0 || v > 30) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("weights")
      .insert({ value: v, memo, recorded_at: date })
      .select()
      .single();
    if (!error && data) {
      const updated = [data, ...weights].sort((a, b) => b.recorded_at.localeCompare(a.recorded_at));
      setWeights(updated);
      setVal(""); setMemo(""); setShow(false);
    }
    setSaving(false);
  };

  const del = async (id) => {
    await supabase.from("weights").delete().eq("id", id);
    setWeights(weights.filter(w => w.id !== id));
  };

  return (
    <div style={{ minHeight: "100vh", background: C.sand, paddingBottom: 90 }}>
      <PageHeader title="体重記録" sub="Weight Log" action={
        <PBtn onClick={() => setShow(!show)} style={{ padding: "8px 14px", fontSize: 13 }}>
          <Icon n="plus" size={15} color={C.white} />追加
        </PBtn>
      } />
      <div style={{ padding: "16px 16px 0" }}>
        {show && (
          <Card style={{ marginBottom: 14 }}>
            <div style={{ padding: "18px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, fontFamily: FONT }}>
                体重を記録する
              </div>
              <div><Lbl>日付</Lbl>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={iStyle} /></div>
              <div><Lbl>体重 (kg)</Lbl>
                <input type="number" value={val} step="0.01"
                  onChange={e => setVal(e.target.value)} placeholder="例：1.85" style={iStyle} /></div>
              <div><Lbl>メモ（任意）</Lbl>
                <input type="text" value={memo}
                  onChange={e => setMemo(e.target.value)} placeholder="体調など" style={iStyle} /></div>
              <div style={{ display: "flex", gap: 8 }}>
                <GBtn onClick={() => setShow(false)}>キャンセル</GBtn>
                <PBtn onClick={add} disabled={saving} style={{ flex: 1 }}>
                  {saving ? "保存中..." : "保存"}
                </PBtn>
              </div>
            </div>
          </Card>
        )}

        {weights.length >= 2 && (
          <Card style={{ marginBottom: 12 }}>
            <div style={{ padding: "16px" }}>
              <Lbl>体重グラフ</Lbl>
              <div style={{ marginTop: 6 }}>
                <Sparkline weights={[...weights].slice(0, 10).reverse()} />
              </div>
            </div>
          </Card>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {weights.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: C.muted, fontFamily: SANS, fontSize: 13 }}>
              まだ記録がありません 🐾
            </div>
          )}
          {weights.map((w, i) => (
            <Card key={w.id}>
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: C.light,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, flexShrink: 0 }}>⚖️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.navy, fontFamily: FONT, lineHeight: 1 }}>
                    {Number(w.value).toFixed(2)}<span style={{ fontSize: 13, fontWeight: 400, color: C.muted }}> kg</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, fontFamily: SANS, marginTop: 2 }}>
                    {w.recorded_at}{w.memo && ` · ${w.memo}`}
                  </div>
                </div>
                {i < weights.length - 1 && (
                  <div style={{ fontSize: 12, fontWeight: 700, fontFamily: SANS,
                    color: w.value >= weights[i + 1]?.value ? C.coral : C.sage }}>
                    {w.value >= weights[i + 1]?.value ? "▲" : "▼"}
                    {Math.abs(w.value - weights[i + 1]?.value).toFixed(2)}
                  </div>
                )}
                <button onClick={() => del(w.id)} style={{ border: "none", background: "none", padding: 6, cursor: "pointer" }}>
                  <Icon n="trash" size={17} color={C.muted} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Feeding Page ─────────────────────────────────────────────────────────────
const FeedingPage = ({ feedSettings, setFeedSettings, weights, profile }) => {
  const suggested = suggestStage(profile);
  const [si,      setSi]      = useState(feedSettings?.stage_index ?? suggested);
  const [kcal,    setKcal]    = useState(feedSettings?.kcal_per_100g ?? 350);
  const [ok,      setOk]      = useState(false);
  const [saving,  setSaving]  = useState(false);

  const w   = weights[0]?.value;
  const rer = w ? calcRER(w) : null;
  const der = w ? calcDER(w, si) : null;
  const g   = der && kcal ? calcGrams(der, kcal) : null;

  const months   = calcMonths(profile?.birthdate);
  const autoLabel = months !== null
    ? `プロフィール情報（${ageLabel(months)}・${profile?.neutered ? "去勢/避妊済み" : "未去勢/未避妊"}）からステージを自動提案`
    : "生年月日を設定すると自動提案されます";

  const saveS = async () => {
    setSaving(true);
    const payload = { stage_index: si, kcal_per_100g: Number(kcal), updated_at: new Date().toISOString() };
    if (feedSettings?.id) {
      const { data } = await supabase.from("feed_settings").update(payload).eq("id", feedSettings.id).select().single();
      if (data) setFeedSettings(data);
    } else {
      const { data } = await supabase.from("feed_settings").insert(payload).select().single();
      if (data) setFeedSettings(data);
    }
    setOk(true);
    setTimeout(() => setOk(false), 2200);
    setSaving(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.sand, paddingBottom: 90 }}>
      <PageHeader title="給餌量設定" sub="Feeding Calculator" />
      <div style={{ padding: "16px 16px", display: "flex", flexDirection: "column", gap: 14 }}>

        <div style={{
          background: `${C.ocean}14`, border: `1px solid ${C.ocean}30`,
          borderRadius: 12, padding: "11px 14px",
          fontSize: 12, color: C.ocean, lineHeight: 1.6, fontFamily: SANS,
        }}>
          💡 {autoLabel}
        </div>

        <Card>
          <div style={{ padding: "18px 16px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, fontFamily: FONT, marginBottom: 12 }}>
              ライフステージ
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {STAGES.map((s, i) => (
                <button key={i} onClick={() => setSi(i)} style={{
                  border: si === i ? `2px solid ${C.navy}` : `1.5px solid ${C.border}`,
                  borderRadius: 10, padding: "11px 14px",
                  background: si === i ? `${C.navy}0d` : C.cream,
                  cursor: "pointer", textAlign: "left",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  fontFamily: SANS,
                }}>
                  <span style={{ fontSize: 14, color: C.navy, fontWeight: si === i ? 700 : 400 }}>{s.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {i === suggested && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, fontFamily: SANS,
                        background: `${C.ocean}20`, color: C.ocean,
                        borderRadius: 6, padding: "2px 7px",
                      }}>推奨</span>
                    )}
                    <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>× {s.coeff}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ padding: "18px 16px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, fontFamily: FONT, marginBottom: 10 }}>
              フードのカロリー
            </div>
            <Lbl>kcal / 100g</Lbl>
            <input type="number" value={kcal} onChange={e => setKcal(Number(e.target.value))} style={iStyle} />
            <div style={{ fontSize: 12, color: C.muted, marginTop: 5, fontFamily: SANS }}>
              フードパッケージの裏面を確認してください
            </div>
          </div>
        </Card>

        {der && (
          <Card style={{ background: `linear-gradient(135deg,${C.navy},${C.navyMid})` }}>
            <div style={{ padding: "20px 16px" }}>
              <Lbl light>計算結果 — 体重 {w}kg</Lbl>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
                {[
                  { l: "RER", v: rer, u: "kcal" },
                  { l: `DER ×${STAGES[si].coeff}`, v: der, u: "kcal" },
                  { l: "給餌量", v: g, u: "g/日" },
                ].map(item => (
                  <div key={item.l} style={{
                    background: "rgba(255,255,255,0.1)", borderRadius: 10,
                    padding: "12px 6px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 4, fontFamily: SANS }}>{item.l}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: C.white, fontFamily: FONT, lineHeight: 1 }}>{item.v ?? "—"}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2, fontFamily: SANS }}>{item.u}</div>
                  </div>
                ))}
              </div>
              {g && (
                <div style={{
                  marginTop: 12, background: "rgba(255,255,255,0.12)",
                  borderRadius: 10, padding: "12px", textAlign: "center",
                  color: C.white, fontFamily: SANS, fontSize: 13,
                }}>
                  朝: <strong>{Math.round(g / 2)}g</strong>　夜: <strong>{Math.round(g / 2)}g</strong>
                </div>
              )}
            </div>
          </Card>
        )}

        {!w && (
          <div style={{ textAlign: "center", padding: 16, color: C.muted,
            fontSize: 13, fontFamily: SANS, background: C.ivory, borderRadius: 12 }}>
            先に体重を記録してください
          </div>
        )}

        <PBtn onClick={saveS} disabled={saving} style={{
          width: "100%", padding: "15px",
          background: ok
            ? `linear-gradient(135deg,${C.sage},#4a9870)`
            : `linear-gradient(135deg,${C.navy},${C.navyMid})`,
        }}>
          {ok ? "✓ 保存しました" : saving ? "保存中..." : "設定を保存"}
        </PBtn>
      </div>
    </div>
  );
};

// ─── Vomit Page ───────────────────────────────────────────────────────────────
const VomitPage = ({ logs, setLogs }) => {
  const [show,   setShow]   = useState(false);
  const [date,   setDate]   = useState(new Date().toISOString().slice(0, 10));
  const [time,   setTime]   = useState(new Date().toTimeString().slice(0, 5));
  const [memo,   setMemo]   = useState("");
  const [file,   setFile]   = useState(null);
  const [preview, setPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const imgRef = useRef();
  const vidRef = useRef();

  const handleFile = (e, type) => {
    const f = e.target.files?.[0]; if (!f) return;
    setFile(f);
    setMediaType(type);
    const r = new FileReader();
    r.onload = ev => setPreview(ev.target.result);
    r.readAsDataURL(f);
    e.target.value = "";
  };

  const add = async () => {
    setSaving(true);
    let media_url = null;

    if (file) {
      const ext  = file.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("vomit-media")
        .upload(path, file, { contentType: file.type });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("vomit-media").getPublicUrl(path);
        media_url = urlData.publicUrl;
      }
    }

    const { data, error } = await supabase
      .from("vomit_logs")
      .insert({
        recorded_date: date,
        recorded_time: time,
        memo,
        media_url,
        media_type: mediaType,
      })
      .select()
      .single();

    if (!error && data) {
      setLogs([data, ...logs]);
      setDate(new Date().toISOString().slice(0, 10));
      setTime(new Date().toTimeString().slice(0, 5));
      setMemo(""); setFile(null); setPreview(null); setMediaType(null); setShow(false);
    }
    setSaving(false);
  };

  const del = async (id, media_url) => {
    if (media_url) {
      const path = media_url.split("/vomit-media/")[1];
      if (path) await supabase.storage.from("vomit-media").remove([path]);
    }
    await supabase.from("vomit_logs").delete().eq("id", id);
    setLogs(logs.filter(l => l.id !== id));
    setDetail(null);
  };

  if (detail) return (
    <div style={{ minHeight: "100vh", background: C.sand, paddingBottom: 90 }}>
      <PageHeader title="詳細" sub={`${detail.recorded_date} ${detail.recorded_time?.slice(0, 5)}`}
        onBack={() => setDetail(null)}
        action={
          <button onClick={() => del(detail.id, detail.media_url)} style={{
            border: "none", background: "none", padding: 6, cursor: "pointer" }}>
            <Icon n="trash" size={20} color={C.coral} />
          </button>
        } />
      <div style={{ padding: 16 }}>
        <Card>
          <div style={{ padding: "18px 16px" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, fontFamily: FONT, marginBottom: 8 }}>
              {detail.recorded_date}　{detail.recorded_time?.slice(0, 5)}
            </div>
            {detail.memo && (
              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.7, fontFamily: SANS, marginBottom: 14 }}>
                {detail.memo}
              </div>
            )}
            {detail.media_url && detail.media_type === "image" && (
              <img src={detail.media_url} alt="記録"
                style={{ width: "100%", borderRadius: 12, objectFit: "cover" }} />
            )}
            {detail.media_url && detail.media_type === "video" && (
              <video src={detail.media_url} controls
                style={{ width: "100%", borderRadius: 12, maxHeight: 400, background: "#000" }} />
            )}
            {!detail.memo && !detail.media_url && (
              <div style={{ color: C.muted, fontFamily: SANS, fontSize: 13 }}>メモ・写真なし</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.sand, paddingBottom: 90 }}>
      <PageHeader title="嘔吐記録" sub="Health Log for Vet" action={
        <PBtn onClick={() => setShow(!show)}
          style={{ padding: "8px 14px", fontSize: 13,
            background: `linear-gradient(135deg,${C.coral},#b84535)` }}>
          <Icon n="plus" size={15} color={C.white} />追加
        </PBtn>
      } />
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{
          background: `${C.warm}1a`, border: `1px solid ${C.warmPale}`,
          borderRadius: 12, padding: "11px 14px", marginBottom: 12,
          fontSize: 12, color: C.warm, lineHeight: 1.6, fontFamily: SANS,
        }}>
          📋 獣医師への診察時に活用できる記録です。写真・動画・メモを詳しく残しましょう。
        </div>

        {show && (
          <Card style={{ marginBottom: 14 }}>
            <div style={{ padding: "18px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, fontFamily: FONT }}>
                嘔吐を記録する
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><Lbl>日付</Lbl>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} style={iStyle} /></div>
                <div><Lbl>時刻</Lbl>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} style={iStyle} /></div>
              </div>
              <div><Lbl>状態・メモ</Lbl>
                <textarea value={memo} onChange={e => setMemo(e.target.value)}
                  placeholder="色・量・食後の時間など" rows={3}
                  style={{ ...iStyle, resize: "vertical" }} /></div>

              {preview ? (
                <div style={{ position: "relative" }}>
                  {mediaType === "image"
                    ? <img src={preview} alt="preview" style={{ width: "100%", borderRadius: 10, objectFit: "cover", maxHeight: 200 }} />
                    : <video src={preview} controls style={{ width: "100%", borderRadius: 10, maxHeight: 200, background: "#000" }} />
                  }
                  <button onClick={() => { setFile(null); setPreview(null); setMediaType(null); }} style={{
                    position: "absolute", top: 8, right: 8,
                    background: "rgba(0,0,0,0.55)", border: "none",
                    borderRadius: "50%", width: 28, height: 28,
                    color: C.white, cursor: "pointer", fontSize: 14,
                  }}>✕</button>
                </div>
              ) : (
                <>
                  <input ref={imgRef} type="file" accept="image/*" capture="environment"
                    style={{ display: "none" }} onChange={e => handleFile(e, "image")} />
                  <input ref={vidRef} type="file" accept="video/*" capture="environment"
                    style={{ display: "none" }} onChange={e => handleFile(e, "video")} />
                  <Lbl>写真 / 動画</Lbl>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { ref: imgRef, icon: "camera", label: "写真を撮影" },
                      { ref: vidRef, icon: "video",  label: "動画を撮影" },
                    ].map(btn => (
                      <button key={btn.label} onClick={() => btn.ref.current?.click()} style={{
                        border: `2px dashed ${C.border}`, borderRadius: 10, padding: "18px 8px",
                        background: C.sand, cursor: "pointer",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                        color: C.muted, fontFamily: SANS,
                      }}>
                        <Icon n={btn.icon} size={22} color={C.muted} />
                        <span style={{ fontSize: 12 }}>{btn.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <GBtn onClick={() => setShow(false)}>キャンセル</GBtn>
                <PBtn onClick={add} disabled={saving}
                  style={{ flex: 1, background: `linear-gradient(135deg,${C.coral},#b84535)` }}>
                  {saving ? "保存中..." : "保存"}
                </PBtn>
              </div>
            </div>
          </Card>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {logs.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: C.muted, fontFamily: SANS, fontSize: 13 }}>
              まだ記録がありません 🐾
            </div>
          )}
          {logs.map(log => (
            <Card key={log.id}>
              <button onClick={() => setDetail(log)} style={{
                width: "100%", border: "none", background: "none", cursor: "pointer", padding: 0 }}>
                <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                  {log.media_url && log.media_type === "image" ? (
                    <img src={log.media_url} alt="" style={{
                      width: 52, height: 52, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                  ) : log.media_url && log.media_type === "video" ? (
                    <div style={{ width: 52, height: 52, borderRadius: 10,
                      background: `${C.navy}18`, display: "flex",
                      alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon n="video" size={22} color={C.navy} />
                    </div>
                  ) : (
                    <div style={{ width: 52, height: 52, borderRadius: 10,
                      background: `${C.coral}15`, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      flexShrink: 0, fontSize: 24 }}>🤢</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, fontFamily: FONT }}>
                      {log.recorded_date}　{log.recorded_time?.slice(0, 5)}
                    </div>
                    <div style={{ fontSize: 13, color: C.muted, marginTop: 2, fontFamily: SANS,
                      overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", maxWidth: 200 }}>
                      {log.memo || "メモなし"}
                    </div>
                  </div>
                  <Icon n="chevron" size={18} color={C.muted} />
                </div>
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Profile Page ─────────────────────────────────────────────────────────────
const ProfilePage = ({ profile, setProfile }) => {
  const [name,      setName]      = useState(profile?.name      || "ノマ");
  const [breed,     setBreed]     = useState(profile?.breed     || "パピヨン");
  const [birthdate, setBirthdate] = useState(profile?.birthdate || "2025-04-09");
  const [neutered,  setNeutered]  = useState(profile?.neutered  || false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(profile?.photo_url || null);
  const [saving,    setSaving]    = useState(false);
  const [ok,        setOk]        = useState(false);
  const photoRef = useRef();

  const months    = calcMonths(birthdate);
  const suggested = suggestStage({ birthdate, neutered });

  const handlePhoto = e => {
    const f = e.target.files?.[0]; if (!f) return;
    setPhotoFile(f);
    const r = new FileReader();
    r.onload = ev => setPhotoPreview(ev.target.result);
    r.readAsDataURL(f);
    e.target.value = "";
  };

  const saveProfile = async () => {
    setSaving(true);
    let photo_url = profile?.photo_url || null;

    if (photoFile) {
      const ext  = photoFile.name.split(".").pop();
      const path = `profile.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("profile-photos")
        .upload(path, photoFile, { upsert: true, contentType: photoFile.type });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("profile-photos").getPublicUrl(path);
        photo_url = urlData.publicUrl + "?t=" + Date.now();
      }
    }

    const payload = { name, breed, birthdate, neutered, photo_url, updated_at: new Date().toISOString() };

    let result;
    if (profile?.id) {
      const { data } = await supabase.from("profiles").update(payload).eq("id", profile.id).select().single();
      result = data;
    } else {
      const { data } = await supabase.from("profiles").insert(payload).select().single();
      result = data;
    }

    if (result) setProfile(result);
    setOk(true);
    setTimeout(() => setOk(false), 2200);
    setSaving(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.sand, paddingBottom: 90 }}>
      <PageHeader title="プロフィール設定" sub="Profile" />
      <div style={{ padding: "16px 16px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Photo */}
        <Card>
          <div style={{ padding: "20px 16px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, fontFamily: FONT, marginBottom: 14 }}>
              プロフィール写真
            </div>
            <input ref={photoRef} type="file" accept="image/*"
              style={{ display: "none" }} onChange={handlePhoto} />
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div onClick={() => photoRef.current?.click()} style={{
                width: 80, height: 80, borderRadius: "50%",
                border: `2px solid ${photoPreview ? C.navy : C.border}`,
                overflow: "hidden", flexShrink: 0, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: photoPreview ? "transparent" : `${C.navy}14`,
              }}>
                {photoPreview
                  ? <img src={photoPreview} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <Icon n="camera" size={28} color={C.muted} />
                }
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <PBtn onClick={() => photoRef.current?.click()} style={{ padding: "10px 14px", fontSize: 13 }}>
                  <Icon n="camera" size={15} color={C.white} />
                  {photoPreview ? "写真を変更" : "写真を選択"}
                </PBtn>
                {photoPreview && (
                  <GBtn onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}>削除</GBtn>
                )}
              </div>
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 10, fontFamily: SANS }}>
              カメラロールから選択できます
            </div>
          </div>
        </Card>

        {/* Basic info */}
        <Card>
          <div style={{ padding: "18px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, fontFamily: FONT }}>基本情報</div>
            <div><Lbl>なまえ</Lbl>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="ノマ" style={iStyle} /></div>
            <div><Lbl>犬種</Lbl>
              <input type="text" value={breed} onChange={e => setBreed(e.target.value)}
                placeholder="パピヨン" style={iStyle} /></div>
            <div>
              <Lbl>生年月日</Lbl>
              <input type="date" value={birthdate} onChange={e => setBirthdate(e.target.value)} style={iStyle} />
              {months !== null && (
                <div style={{ fontSize: 12, color: C.ocean, marginTop: 5, fontFamily: SANS }}>
                  現在 {ageLabel(months)} · 給餌推奨ステージ：{STAGES[suggested].label}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Neutered */}
        <Card>
          <div style={{ padding: "18px 16px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, fontFamily: FONT, marginBottom: 12 }}>
              去勢 / 避妊
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { val: true,  emoji: "✅", label: "済み" },
                { val: false, emoji: "⬜", label: "未実施" },
              ].map(opt => (
                <button key={String(opt.val)} onClick={() => setNeutered(opt.val)} style={{
                  border: neutered === opt.val ? `2px solid ${C.navy}` : `1.5px solid ${C.border}`,
                  borderRadius: 12, padding: "16px 12px",
                  background: neutered === opt.val ? `${C.navy}0d` : C.cream,
                  cursor: "pointer", textAlign: "center", fontFamily: SANS,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                }}>
                  <span style={{ fontSize: 24 }}>{opt.emoji}</span>
                  <span style={{ fontSize: 14, fontWeight: neutered === opt.val ? 700 : 400, color: C.navy }}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 8, fontFamily: SANS }}>
              給餌カロリー計算の活動係数に影響します
            </div>
          </div>
        </Card>

        <PBtn onClick={saveProfile} disabled={saving} style={{
          width: "100%", padding: "15px",
          background: ok
            ? `linear-gradient(135deg,${C.sage},#4a9870)`
            : `linear-gradient(135deg,${C.navy},${C.navyMid})`,
        }}>
          {ok ? "✓ 保存しました" : saving ? "保存中..." : "プロフィールを保存"}
        </PBtn>
      </div>
    </div>
  );
};

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Home",  icon: "home"    },
  { id: "weight",    label: "体重",  icon: "weight"  },
  { id: "feeding",   label: "給餌",  icon: "feed"    },
  { id: "vomit",     label: "記録",  icon: "vomit"   },
  { id: "profile",   label: "設定",  icon: "profile" },
];

const BottomNav = ({ active, onNav }) => (
  <nav style={{
    position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
    width: "100%", maxWidth: 430,
    background: C.ivory, borderTop: `1px solid ${C.border}`,
    display: "flex", paddingBottom: "env(safe-area-inset-bottom,8px)",
    zIndex: 100, boxShadow: "0 -4px 20px rgba(14,58,85,0.09)",
  }}>
    {NAV.map(({ id, label, icon }) => {
      const a = active === id;
      return (
        <button key={id} onClick={() => onNav(id)} style={{
          flex: 1, border: "none", background: "none",
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 3, padding: "10px 4px 6px",
          color: a ? C.navy : C.muted, cursor: "pointer",
          fontSize: 10, fontWeight: a ? 700 : 400,
          fontFamily: SANS, letterSpacing: "0.04em",
        }}>
          <span style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 38, height: 26,
            background: a ? `${C.navy}12` : "transparent",
            borderRadius: 12, transition: "background 0.2s",
          }}>
            <Icon n={icon} size={20} color={a ? C.navy : C.muted} />
          </span>
          {label}
        </button>
      );
    })}
  </nav>
);

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page,         setPage]         = useState("dashboard");
  const [profile,      setProfile]      = useState(null);
  const [weights,      setWeights]      = useState([]);
  const [feedSettings, setFeedSettings] = useState(null);
  const [vomit,        setVomit]        = useState([]);
  const [loading,      setLoading]      = useState(true);

  // Load all data from Supabase on mount
  useEffect(() => {
    const fetchAll = async () => {
      const [
        { data: prof },
        { data: wts },
        { data: feed },
        { data: logs },
      ] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at").limit(1).single(),
        supabase.from("weights").select("*").order("recorded_at", { ascending: false }),
        supabase.from("feed_settings").select("*").order("updated_at", { ascending: false }).limit(1).single(),
        supabase.from("vomit_logs").select("*").order("recorded_date", { ascending: false }),
      ]);
      if (prof)  setProfile(prof);
      if (wts)   setWeights(wts);
      if (feed)  setFeedSettings(feed);
      if (logs)  setVomit(logs);
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div style={{
      minHeight: "100vh", background: C.sand,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 16,
    }}>
      <div style={{ fontSize: 36 }}>🐾</div>
      <div style={{ color: C.muted, fontFamily: SANS, fontSize: 14 }}>読み込み中...</div>
      <Spinner />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{
      maxWidth: 430, margin: "0 auto",
      minHeight: "100vh", position: "relative",
      background: C.sand, fontFamily: SANS,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;800&family=Noto+Serif+JP:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes spin{to{transform:rotate(360deg)}}
        input[type=number]::-webkit-inner-spin-button{opacity:0.4;}
        input,textarea,button{-webkit-tap-highlight-color:transparent;}
        textarea{font-family:'Noto Sans JP',sans-serif;}
      `}</style>

      {page === "dashboard" && (
        <Dashboard weights={weights} feedSettings={feedSettings} profile={profile} onNav={setPage} />
      )}
      {page === "weight"   && <WeightPage weights={weights} setWeights={setWeights} />}
      {page === "feeding"  && (
        <FeedingPage feedSettings={feedSettings} setFeedSettings={setFeedSettings}
          weights={weights} profile={profile} />
      )}
      {page === "vomit"   && <VomitPage logs={vomit} setLogs={setVomit} />}
      {page === "profile" && <ProfilePage profile={profile} setProfile={setProfile} />}

      <BottomNav active={page} onNav={setPage} />
    </div>
  );
}
