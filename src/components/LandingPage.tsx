import React, { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { analyzeImage, generateBox, getPreviewUrl, getDownloadUrl, type Dimensions } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import LoginModal from "./LoginModal";

type AnalysisState = "idle" | "uploading" | "analyzing" | "done" | "error";

export default function LandingPage() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const [svgFilename, setSvgFilename] = useState<string | null>(null);
  const [svgPreviewUrl, setSvgPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selected: File) => {
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setAnalysisState("idle");
    setDimensions(null);
    setSvgFilename(null);
    setSvgPreviewUrl(null);
    setErrorMsg("");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith("image/")) handleFileSelect(dropped);
  }, [handleFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFileSelect(selected);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalysisState("analyzing");
    setErrorMsg("");
    try {
      const result = await analyzeImage(file, "auto");
      setDimensions(result.dimensions);
      setAnalysisState("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "분석 실패");
      setAnalysisState("error");
    }
  };

  const handleGenerateBlueprint = async () => {
    if (!dimensions) return;
    setAnalysisState("uploading");
    try {
      const result = await generateBox(dimensions);
      setSvgFilename(result.filename);
      setSvgPreviewUrl(getPreviewUrl(result.filename));
      setAnalysisState("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "도면 생성 실패");
      setAnalysisState("error");
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-amber-200/20 rounded-full blur-3xl -z-10"></div>

        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Hero Content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-primary text-xs font-bold uppercase tracking-wide mb-6">
                AI 기반 디자인
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-6 text-slate-900">
                반려동물을 위한 <span className="text-primary">완벽한 집</span>을 만들어 드립니다
              </h1>
              <p className="text-lg sm:text-xl text-stone-600 mb-8 leading-relaxed max-w-lg">
                사진을 업로드하세요. AI가 도면을 설계합니다. 골판지와 페트병 뚜껑으로 조립하는 스냅핏 기술을 활용하세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-primary hover:bg-primary-dark text-white font-bold text-lg py-4 px-8 rounded-xl shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group"
                >
                  AI 분석 시작하기
                </button>
                <Link to="/assembly" className="bg-white border border-stone-200 hover:border-primary text-stone-700 font-bold text-lg py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2">
                  조립 가이드 보기
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-4 text-sm text-stone-500">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-stone-200 bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBirgDtT9OcWOuHkGV2CmJ6i-fucA24mfxHeKj3goYtz9_n_hbVZG1OVAAKtYAm_FKzTE5xGiMMJ3klpeSTEEzv5Qfmw7xzRQbhzP-wqkFTaOP3VO-zRG-zYgxXwB33ZqiohCm6hg1D9CybVTpxGrkAxLGDWLufZageGyleIRSDI93NW9xxRbRNMpWyT7SPn7PkdIEtUhqljpkb3YcoBfTNehVa5tHdRYnNfhrVuKjQqdfx1S6rYhg8CzF9JHRidJWJmdOhTL_k2TI')"}}></div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-stone-300 bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA8ltdBkuyiaHfml8_AWLCTyFJDYKCdUWtZoRGj69ySpyPVKqX5ZRVGnW0OpDjvgpvDUEjs0Jk8c2SRV9TmivFqQF5ECsNwIwHRyTBh7gv7DrvM32WaRC5gG93E4Ou65z2dQRy76VdLEClOEYVhV3nLwyh09uIfb4cYxn3xquURn39dqcvkZ3-KaJDVMlUuBnYnHsDEQtWSorBfPhQsOOmE1bENWuHwS5GRq0TgsTx5x0K0tVAWqRlGSieOmpynsKrpGPG3YBbRtno')"}}></div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-stone-400 bg-cover bg-center" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDDF3MUzdBRegNTh8fxOgI2JXpwbWXhHocT_qhEVsOcQH03JRE0PyJ7oitdirmU_NjbvVSEHcC8_PUmhdkyBfMqmWqvwuCyI4SOQUcchmoNHZwkVvOwQGVJfyVt_LP924Wjv8FfeglG_EYz0H71CMANLdnKsCH_75kUhlxRs7QyOkapqnOvbeuw-Oj2BiDRjwtGRW1UUAQQyQRY2PKbP_KMDfu6FYyxv0ZVssGop4EEE5Ac7D7JjiTVLcrugS5RYN3rLJJeS4OgTNw')"}}></div>
                </div>
                <p>10,000+ 마리의 행복한 반려동물이 사랑하는 서비스</p>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="relative w-full aspect-square max-w-[500px] lg:max-w-none">
                <div className="absolute inset-4 bg-stone-200 rounded-[3rem] transform rotate-3 z-0"></div>
                <div className="absolute inset-4 bg-stone-100 rounded-[3rem] transform -rotate-2 z-0"></div>
                <div className="relative z-10 w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white group">
                  <div className="w-full h-full bg-cover bg-center transform transition-transform duration-700 group-hover:scale-105" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDJp0h0COjOniSdyJXgGdBO3ZWIhCXG9K2s1Y-jOA2BJqx7wqNlRBAlK8gQ7aXfIFQeUsuqO5VVxpGHrJtB193BUr3rlvx4q2N3uALnysiLwwV2CA5ATg_56sYgNpaep861cBadeoNFscV6NBsPVoHJARZpZK-hl-pGnioSq_8L9yTs7a41HEg37cWyQdb-fG1hmKAzheuW2aSrPFe1nfcvYONXtvH6Vk71b_UcIvGQ4_QzsIGqH5rDJ2zry2-I8lf8PMY1sXL9e4A')"}}></div>
                  <div className="absolute top-8 right-8 bg-white/90 backdrop-blur p-3 rounded-xl shadow-lg border border-stone-100 animate-[bounce_3s_infinite]">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/20 p-2 rounded-lg text-primary">
                        ♻
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-500 uppercase">재료</p>
                        <p className="font-bold text-slate-900">재활용 골판지</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-12 left-8 bg-white/90 backdrop-blur p-3 rounded-xl shadow-lg border border-stone-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        ⚡
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-500 uppercase">조립</p>
                        <p className="font-bold text-slate-900">스냅핏 조인트</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI 분석 위젯 ── */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-primary font-bold tracking-wider uppercase text-sm mb-3">AI 도면 생성</h2>
            <h3 className="text-3xl md:text-4xl font-black mb-6 text-slate-900">반려동물 사진으로 시작하기</h3>
            <p className="text-lg text-stone-600">사진을 업로드하면 AI가 크기를 분석하고 맞춤형 골판지 집 도면을 자동으로 생성합니다.</p>
          </div>

          {/* 히든 file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />

          {/* 단일 통합 카드 */}
          <div className="relative max-w-2xl mx-auto">
            {/* 비로그인 잠금 오버레이 */}
            {!user && (
              <div className="absolute inset-0 z-10 rounded-3xl bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-center p-8">
                <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center text-4xl">🔒</div>
                <div>
                  <p className="text-xl font-black text-slate-900 mb-2">로그인 후 이용 가능합니다</p>
                  <p className="text-stone-500 text-sm">AI 분석 기능을 사용하려면 구글 계정으로 로그인해 주세요</p>
                </div>
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
                >
                  🔑 &nbsp;구글로 로그인하기
                </button>
              </div>
            )}

            <div className="bg-stone-50 rounded-3xl border border-stone-200 shadow-sm overflow-hidden">

              {/* ① 업로드 영역 */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="group cursor-pointer border-b border-stone-200 p-8 text-center transition-all duration-300 hover:bg-orange-50 flex flex-col items-center justify-center gap-4 min-h-[220px]"
              >
                {previewUrl ? (
                  <div className="flex items-center gap-6 w-full">
                    <img src={previewUrl} alt="업로드된 이미지" className="h-32 w-32 rounded-2xl object-cover shadow-md flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-bold text-slate-800">{file?.name}</p>
                      <p className="text-sm text-stone-500 mt-1">클릭하면 다른 사진으로 변경</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-700">클릭하거나 사진을 끌어다 놓으세요</p>
                      <p className="text-sm text-stone-400 mt-1">PNG, JPG, WEBP · 최대 16MB</p>
                    </div>
                  </>
                )}
              </div>

              {/* ② 분석 버튼 */}
              {file && (
                <div className="px-8 py-4 border-b border-stone-200">
                  <button
                    onClick={handleAnalyze}
                    disabled={analysisState === "analyzing" || analysisState === "uploading"}
                    className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {analysisState === "analyzing" ? (
                      <>
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        AI가 분석 중...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">auto_awesome</span>
                        AI로 크기 분석하기
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* ③ 오류 */}
              {analysisState === "error" && (
                <div className="px-8 py-4 border-b border-stone-200 bg-red-50">
                  <p className="text-red-700 text-sm"><span className="font-bold">오류: </span>{errorMsg}</p>
                  <p className="text-xs mt-1 text-red-400">Flask 백엔드(localhost:5000)가 실행 중인지 확인하세요.</p>
                </div>
              )}

              {/* ④ 분석 결과 */}
              {dimensions && (
                <div className="px-8 py-6 border-b border-stone-200">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                    <h4 className="font-bold text-slate-900">AI 분석 완료</h4>
                    <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-mono">
                      신뢰도 {Math.round(dimensions.confidence * 100)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: "가로", value: dimensions.width },
                      { label: "높이", value: dimensions.height },
                      { label: "깊이", value: dimensions.depth },
                    ].map((dim) => (
                      <div key={dim.label} className="bg-white rounded-xl p-4 text-center shadow-sm border border-stone-100">
                        <p className="text-xs text-stone-500 font-medium mb-1">{dim.label}</p>
                        <p className="text-2xl font-black text-primary">{Math.round(dim.value)}</p>
                        <p className="text-xs text-stone-400">mm</p>
                      </div>
                    ))}
                  </div>
                  {dimensions.notes && <p className="text-xs text-stone-500 italic mb-4">{dimensions.notes}</p>}
                  <button
                    onClick={handleGenerateBlueprint}
                    disabled={analysisState === "uploading"}
                    className="w-full bg-slate-900 hover:bg-slate-700 disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {analysisState === "uploading" ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        도면 생성 중...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">architecture</span>
                        SVG 도면 생성하기
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* ⑤ SVG 도면 미리보기 */}
              {svgFilename && svgPreviewUrl && (
                <div className="px-8 py-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">architecture</span>
                      <h4 className="font-bold text-slate-900">도면 미리보기</h4>
                    </div>
                    <a
                      href={getDownloadUrl(svgFilename)}
                      download={svgFilename}
                      className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      다운로드
                    </a>
                  </div>
                  <div className="bg-white rounded-xl border border-stone-200 overflow-hidden p-4">
                    <img src={svgPreviewUrl} alt="박스 도면" className="w-full object-contain max-h-64" />
                  </div>
                  <p className="text-xs text-stone-400 mt-3 text-center">레이저 커터 또는 커터칼로 직접 사용 가능한 SVG 파일</p>
                </div>
              )}

              {/* ⑥ 아직 분석 전 안내 (파일 없을 때) */}
              {!file && !dimensions && analysisState === "idle" && (
                <div className="px-8 py-6 flex items-center gap-3 text-stone-400">
                  <span className="material-symbols-outlined">pets</span>
                  <p className="text-sm">반려동물 사진을 올리면 AI가 치수를 분석하고 맞춤 도면을 만들어드립니다</p>
                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-stone-50">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-primary font-bold tracking-wider uppercase text-sm mb-3">간단한 3단계</h2>
            <h3 className="text-3xl md:text-4xl font-black mb-6 text-slate-900">사진 한 장으로 궁전 완성</h3>
            <p className="text-lg text-stone-600">AI가 반려동물의 크기를 분석하고, 재활용 재료로 만들 수 있는 맞춤형 도면을 자동 생성합니다.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: 1, icon: "photo_camera", title: "AI 사진 분석", desc: "비전 엔진이 사진 한 장으로 반려동물의 크기를 측정해 완벽한 핏을 보장합니다." },
              { step: 2, icon: "architecture", title: "파라메트릭 설계", desc: "낭비를 최소화하고 표준 골판지로 구조적 강도를 극대화한 도면을 자동 생성합니다." },
              { step: 3, icon: "build", title: "다운로드 & 조립", desc: "맞춤형 PDF 가이드를 다운받아 부품을 자르고, 페트병 뚜껑으로 스냅핏 조립하세요." },
            ].map((item) => (
              <div key={item.step} className="group relative bg-white rounded-2xl p-8 hover:bg-orange-50 transition-colors duration-300 border border-transparent hover:border-primary/20">
                <div className="absolute top-6 right-6 text-6xl font-black text-stone-200 group-hover:text-primary/20 transition-colors select-none">{item.step}</div>
                <div className="w-16 h-16 bg-stone-50 rounded-2xl shadow-sm flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300 border border-stone-100">
                  <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                </div>
                <h4 className="text-xl font-bold mb-3 text-slate-900">{item.title}</h4>
                <p className="text-stone-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Snap-Fit Feature */}
      <section className="py-20 lg:py-32 overflow-hidden bg-stone-50">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="bg-stone-900 rounded-[2.5rem] p-8 md:p-12 lg:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full opacity-10" style={{backgroundImage: "radial-gradient(#f97815 1px, transparent 1px)", backgroundSize: "24px 24px"}}></div>
            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wide mb-6">
                  <span className="material-symbols-outlined text-sm">eco</span>
                  친환경
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">스냅핏 기술</h2>
                <p className="text-lg text-stone-300 mb-8 leading-relaxed">
                  접착제가 필요 없습니다. 재활용 페트병 뚜껑을 활용한 독자적인 조인트 시스템으로 반려동물에게 안전하고 지구에도 좋은 구조물을 만드세요.
                </p>
                <ul className="space-y-4 mb-8">
                  {["일반 플라스틱 페트병 뚜껑 사용 가능", "접착제 없이 조립 — 유해 화학물질 없음", "모듈식 설계로 쉬운 수리 가능"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-stone-200">
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/assembly" className="bg-white text-stone-900 hover:bg-stone-100 font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 w-fit">
                  조립 가이드 보기
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-stone-700 aspect-video group cursor-pointer">
                  <div className="absolute inset-0 bg-cover bg-center transform transition-transform duration-700 group-hover:scale-105" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDjT_uHBy4HDHYYM2A_hJnrCsIRHiHQYDuF1SjF73QNyrEqBsS3b3pjZVA68wQGjeNtoKjugxpmz8djFjrmCexo3Q2PFLnNOtSNr6tajnDH9ihmoco4LQHF_1WRUpbfPrgVa6FDE4X_q_RtAWRxnoKRS6cDmonfZDFhLO7myfi3PnSX_N3YnuBASr55kKtORi4vKLi23_4jMZRc8OHXfJXcxsjbvIjIha9NZFK6IpvUY8hz8kM0_cLjlyNSLasflciyT8VFgUwW5PY')"}}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <div>
                      <p className="text-white font-bold text-lg">지속 가능하고 튼튼한</p>
                      <p className="text-stone-300 text-sm">조인트가 맞춰지는 과정을 확인하세요.</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-white text-3xl ml-1">play_arrow</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Gallery */}
      <section className="py-20 bg-stone-50">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-black mb-2 text-slate-900">반려동물 집사들의 작품</h2>
              <p className="text-stone-600">창의적인 반려동물 집사 커뮤니티에 합류하세요.</p>
            </div>
            <Link to="/showcase" className="text-primary font-bold hover:text-orange-600 flex items-center gap-1">
              갤러리 전체보기 <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "https://lh3.googleusercontent.com/aida-public/AB6AXuA7u8VFn9eUKWbERJf4AlGt4gDZ26sYkyHeRBtEsQqN7Oi7BZiJrUcnvW2LA084AxLoK28YIa-ClaMMG4dpx0Y0UKc6j0xVYsgIMxo4KzEM-PyjVaQriqDB_2cum41Xl39Sj0VnjDcE_RzW0WaQEzvTo15fcN8nOPSypyHJ8pmjvz5upzP7m_zHvu7oOJQnbFp2e8V5txquyqR8-2G7NZWNb89hn_P8FqkuR-Pc-TUA69qsGDOQmFktQVzdK2GmAo6PrPGt5VYWA38",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuC7xl3c_vl7YU-NUMwy_1fE3k6bMAvHo59XdVMILCKLLGhMuj9JW8ItNAnM6ANcl4CqJQzXwmlaPihskxsDWXgtUc14_QWxoxZS-H_IM-ax6GFD46GXtfcEDMxEDJyzcly8-LJf0FhoiXm1Ym_-YhTjMQAysXe-HTqNByJC-OCsantLTD4foYcfm_y86hMuEoAI7TIo7n1jvZEEmNnOIbIVuSAPQ4551iUZcNLNi_SEXElOF2Yg-PFBXQ0Of0VG9rC29wbfdhfYm7g",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuD0eauH_zY5D8tikV5VF_4Gjc-_2rYs98Uy0O57CUCsERn5J0nAWFUga_e7KQHCfZbQ8wHIqfAMY42n9Skyd214tQg_-tM11uURZfxMZ17QgTBaepUECogrozljZoHt2Odacfipnmq2jA2UjA5-fdoofhb-K84lvXoJs973ZpOhQ9XFcI1zuw9U",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuALeDJoOXY8GIwvn4CrYelnb6z9N4IFV-xPI5_uYgWWFUrTqD_K2B5x266KyuvfGejfv9Ii1KqFkM0IaWWL9xAniaW8XHM9EP9GcFwJgs_DsDdxAo47xRzUxaD8qqEjZjAiTAts5QyPaWtjpcr3-9EwFpqWRjvg0f-bVI7Eo6wlTRVfiaKroHob5ajjXzweayHN6iJtlQtv4y4Gc7pLbeTmX82tOE61pPfcS-GWGI2KogYqfZvOPF2ug-0auNXMrtnQL57_Mbryzzc",
            ].map((img, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-stone-200 relative group">
                <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{backgroundImage: `url('${img}')`}}></div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">favorite</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
