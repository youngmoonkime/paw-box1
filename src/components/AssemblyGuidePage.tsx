import { useState } from "react";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: 1,
    title: "바닥판 준비",
    subtitle: "패널 A1 + A2",
    status: "completed" as const,
    description: "두 개의 바닥 패널을 나란히 놓으세요. 번호가 바깥쪽을 향하도록 배치합니다.",
    panels: [
      { id: "A1", name: "바닥 패널 (좌)", spec: "골판지 · 6mm" },
      { id: "A2", name: "바닥 패널 (우)", spec: "골판지 · 6mm" },
    ],
    tips: ["패널의 주름 방향이 같은지 확인하세요.", "평평한 바닥 위에서 작업하면 편합니다."],
  },
  {
    id: 2,
    title: "옆면 패널 연결",
    subtitle: "현재 단계",
    status: "active" as const,
    description: "두 개의 옆면 패널을 세워 놓으세요. 상단 연결부의 둥근 구멍을 맞춘 후, 페트병 뚜껑을 두 레이어에 끼워 고정합니다.",
    panels: [
      { id: "B1", name: "옆면 패널 (좌)", spec: "골판지 · 6mm" },
      { id: "B2", name: "옆면 패널 (우)", spec: "골판지 · 6mm" },
      { id: null, name: "페트병 뚜껑", spec: "표준 PCO 1881", icon: "recycling" },
    ],
    tips: ["시계 방향으로 뚜껑을 돌려 저항이 느껴질 때까지 조입니다.", "너무 세게 조이면 골판지가 눌릴 수 있습니다.", "패널의 로고가 바깥쪽을 향하도록 하세요."],
  },
  {
    id: 3,
    title: "지붕 설치",
    subtitle: "패널 C1",
    status: "pending" as const,
    description: "지붕 패널을 옆면 패널 위에 올려 놓고, 4개의 모서리를 뚜껑으로 고정합니다.",
    panels: [
      { id: "C1", name: "지붕 패널", spec: "골판지 · 6mm" },
      { id: null, name: "페트병 뚜껑", spec: "x4", icon: "recycling" },
    ],
    tips: ["지붕이 수평인지 확인하세요.", "모서리 4개를 동시에 약하게 고정 후 균형 잡아 조입니다."],
  },
  {
    id: 4,
    title: "입구 부착",
    subtitle: "패널 D2 + 클립",
    status: "pending" as const,
    description: "입구 패널을 앞면에 맞추고, 위아래 두 지점에서 뚜껑으로 고정합니다.",
    panels: [
      { id: "D2", name: "입구 패널", spec: "골판지 · 6mm" },
      { id: null, name: "페트병 뚜껑", spec: "x2", icon: "recycling" },
    ],
    tips: ["입구 크기가 반려동물이 통과할 수 있는지 확인하세요."],
  },
  {
    id: 5,
    title: "최종 점검",
    subtitle: "모든 잠금 확인",
    status: "pending" as const,
    description: "모든 뚜껑 조인트가 단단히 고정되었는지 확인하세요. 구조물을 살짝 흔들어 안전한지 테스트합니다.",
    panels: [],
    tips: ["느슨한 조인트는 재조임하세요.", "완성 후 사진을 커뮤니티에 공유해보세요!"],
  },
];

export default function AssemblyGuidePage() {
  const [currentStep, setCurrentStep] = useState(2);
  const [is3DView, setIs3DView] = useState(true);

  const step = steps.find((s) => s.id === currentStep)!;
  const progress = Math.round(((currentStep - 1) / (steps.length - 1)) * 100);

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, steps.length));
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 1));

  return (
    <div className="dark bg-background-dark text-slate-100 font-display min-h-screen flex flex-col antialiased selection:bg-primary/30 selection:text-primary">
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 py-6 h-[calc(100vh-64px)] overflow-hidden flex flex-col gap-6">

        {/* Top Bar */}
        <div className="flex justify-between items-center pb-4 border-b border-border-dark/50">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <a className="hover:text-primary" href="#">더 눅</a>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-white">조립 가이드</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 font-mono">진행 중</span>
          </div>
          <div className="flex gap-3">
            <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
              예상 남은 시간: <span className="text-white">{(steps.length - currentStep + 1) * 5}분</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">

          {/* Left Sidebar: Steps */}
          <section className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
            <div className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden flex flex-col shadow-lg h-full">
              <div className="p-4 border-b border-border-dark bg-surface-darker/50">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">조립 단계</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {steps.map((s) => {
                  const isDone = s.id < currentStep;
                  const isActive = s.id === currentStep;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setCurrentStep(s.id)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg flex items-start gap-3 transition-all relative overflow-hidden group",
                        isActive ? "bg-primary/10 border border-primary/30 shadow-[0_0_15px_rgba(249,120,21,0.2)]" : "hover:bg-white/5 opacity-60 hover:opacity-100"
                      )}
                    >
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                      <div className={cn(
                        "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10",
                        isDone ? "bg-primary/20 text-primary border border-primary/30" :
                        isActive ? "bg-primary text-white shadow-lg" :
                        "bg-surface-darker border border-slate-600 text-slate-500 font-mono"
                      )}>
                        {isDone ? <span className="material-symbols-outlined text-sm">check</span> : s.id}
                      </div>
                      <div className="flex flex-col z-10">
                        <span className={cn("text-sm font-medium", isDone ? "text-slate-300 line-through decoration-slate-500" : isActive ? "text-white" : "text-slate-400")}>
                          {s.title}
                        </span>
                        <span className={cn("text-[10px]", isActive ? "text-primary font-mono" : "text-slate-600")}>
                          {s.subtitle}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="p-4 border-t border-border-dark bg-surface-darker/30">
                <div className="w-full bg-surface-darker rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-mono">
                  <span>진행률</span>
                  <span>{progress}%</span>
                </div>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <section className="flex-1 flex flex-col gap-4 min-w-0">
            <div className="bg-surface-darker border border-border-dark rounded-xl overflow-hidden flex flex-col h-full shadow-lg relative">
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <span className="px-2 py-1 bg-surface-darker/80 backdrop-blur border border-primary/30 rounded text-xs font-mono text-primary shadow-lg">
                  STEP {String(currentStep).padStart(2, "0")}/{steps.length}
                </span>
              </div>
              <div className="absolute top-4 right-4 z-20">
                <div className="flex items-center gap-2 bg-surface-dark/90 backdrop-blur border border-border-dark rounded-lg p-1">
                  <span className="text-[10px] font-bold text-slate-400 pl-2 uppercase">3D 뷰</span>
                  <button
                    onClick={() => setIs3DView(!is3DView)}
                    className={cn("relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out", is3DView ? "bg-primary" : "bg-slate-700")}
                  >
                    <span className={cn("pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out", is3DView ? "translate-x-4" : "translate-x-0")}></span>
                  </button>
                </div>
              </div>

              <div className="flex-1 relative flex items-center justify-center bg-[linear-gradient(to_right,#2a3645_1px,transparent_1px),linear-gradient(to_bottom,#2a3645_1px,transparent_1px)] bg-[size:40px_40px] bg-surface-darker">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-darker/80 pointer-events-none"></div>
                <div className="relative w-full max-w-2xl aspect-video p-8">
                  <svg className="w-full h-full drop-shadow-[0_0_30px_rgba(249,120,21,0.1)]" preserveAspectRatio="xMidYMid meet" viewBox="0 0 800 600">
                    <defs>
                      <linearGradient id="cardboard" x1="0%" x2="100%" y1="0%" y2="0%">
                        <stop offset="0%" stopColor="#2a3645"/>
                        <stop offset="50%" stopColor="#374151"/>
                        <stop offset="100%" stopColor="#2a3645"/>
                      </linearGradient>
                      <marker id="arrowHead" markerHeight="7" markerWidth="10" orient="auto" refX="9" refY="3.5">
                        <polygon fill="#f97815" points="0 0, 10 3.5, 0 7"/>
                      </marker>
                    </defs>
                    <path d="M 100 450 L 350 350 L 350 150 L 100 250 Z" fill="#1e293b" stroke="#475569" strokeWidth="2"/>
                    <path d="M 100 450 L 100 460 L 350 360 L 350 350 Z" fill="#0f172a" stroke="#475569" strokeWidth="1"/>
                    <text fill="rgba(255,255,255,0.3)" fontFamily="monospace" fontSize="14" transform="rotate(-20 225 300)" x="200" y="320">패널 B1</text>
                    <path d="M 360 350 L 610 450 L 610 250 L 360 150 Z" fill="#1e293b" stroke="#475569" strokeWidth="2"/>
                    <path d="M 360 350 L 360 360 L 610 460 L 610 450 Z" fill="#0f172a" stroke="#475569" strokeWidth="1"/>
                    <text fill="rgba(255,255,255,0.3)" fontFamily="monospace" fontSize="14" transform="rotate(20 485 300)" x="450" y="320">패널 B2</text>
                    <circle cx="355" cy="250" fill="none" r="40" stroke="#f97815" strokeDasharray="4 4" strokeWidth="2">
                      <animate attributeName="stroke-dashoffset" dur="3s" from="0" repeatCount="indefinite" to="8"/>
                    </circle>
                    <g transform="translate(355, 180)">
                      <path d="M -15 -10 L 15 -10 L 15 10 L -15 10 Z" fill="#f97815" opacity="0.8"/>
                      <ellipse cx="0" cy="-10" fill="#fb923c" rx="15" ry="5"/>
                      <ellipse cx="0" cy="10" fill="#f97815" rx="15" ry="5"/>
                    </g>
                    <path d="M 355 160 L 355 220" fill="none" markerEnd="url(#arrowHead)" stroke="#f97815" strokeWidth="3"/>
                    <rect fill="#0f172a" height="24" opacity="0.8" rx="4" width="100" x="305" y="120"/>
                    <text fill="#f97815" fontFamily="monospace" fontSize="12" fontWeight="bold" textAnchor="middle" x="355" y="136">뚜껑 삽입</text>
                  </svg>
                </div>

                <div className="absolute bottom-8 left-8 right-8 bg-surface-darker/90 backdrop-blur border border-border-dark p-4 rounded-xl max-w-2xl mx-auto shadow-2xl">
                  <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-sm text-slate-400">{step.description}</p>
                </div>
              </div>

              <div className="p-4 bg-surface-dark border-t border-border-dark flex justify-between items-center">
                <button
                  onClick={goPrev}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border-dark bg-surface-darker hover:bg-surface-dark text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors group"
                >
                  <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                  <span className="text-sm font-medium">이전 단계</span>
                </button>
                {currentStep < steps.length ? (
                  <button
                    onClick={goNext}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold shadow-[0_0_20px_rgba(249,120,21,0.3)] hover:shadow-[0_0_25px_rgba(249,120,21,0.5)] transition-all group"
                  >
                    <span className="text-sm">다음 단계</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                ) : (
                  <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold transition-all">
                    <span className="material-symbols-outlined">check_circle</span>
                    <span className="text-sm">조립 완성! 🎉</span>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Right Sidebar: Parts & Tips */}
          <section className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-4">
            <div className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden shadow-lg">
              <div className="p-3 border-b border-border-dark bg-surface-darker/50 flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">필요 부품</h2>
                <span className="material-symbols-outlined text-slate-500 text-sm">inventory_2</span>
              </div>
              <div className="p-4 space-y-3">
                {step.panels.length > 0 ? step.panels.map((part, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded flex items-center justify-center", "icon" in part && part.icon ? "bg-primary/10 border border-primary/30" : "bg-surface-darker border border-border-dark")}>
                      {"icon" in part && part.icon
                        ? <span className="material-symbols-outlined text-primary text-sm">{part.icon}</span>
                        : <span className="text-xs font-mono text-white">{part.id}</span>
                      }
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-200">{part.name}</div>
                      <div className="text-[10px] text-slate-500">{part.spec}</div>
                    </div>
                    <span className="text-xs font-mono text-primary">x1</span>
                  </div>
                )) : (
                  <p className="text-xs text-slate-500 text-center py-4">별도 부품 없음 — 점검 단계입니다.</p>
                )}
              </div>
            </div>

            <div className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden shadow-lg flex-1">
              <div className="p-3 border-b border-border-dark bg-surface-darker/50 flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">프로 팁</h2>
                <span className="material-symbols-outlined text-yellow-500 text-sm">lightbulb</span>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {step.tips.map((tip, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-darker flex items-center justify-center flex-shrink-0 text-primary font-mono text-xs border border-primary/20">{i + 1}</div>
                      <p className="text-xs text-slate-400 pt-1">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-auto p-4 border-t border-border-dark bg-surface-darker/30">
                <button className="w-full py-2 border border-dashed border-slate-600 rounded text-xs text-slate-400 hover:text-white hover:border-white transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">videocam</span>
                  영상 튜토리얼 보기
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
