import { useState, useMemo } from "react";

const showcaseItems = [
  {
    id: 1, title: "루나", subtitle: "더 눅 • V2.0", likes: 245, category: "Cats",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPjvGyR0rtimQPTwo9NdfP-HkAN56NfYtXEgPDlRiIlw0ym5d7MOIojpgL2hixOeDkRvoQfsXHjRk0ty4RKN0CxIahgL3rSvOojzRgIuQ07xJS--qzO8Bt_EDef5IQQVReVC1nvBDuVF727XsUPWs-MQNPNxoLYlE_2YMRrkiutB0cLdctNnvTkeIN0JNASpYt7iNzdiaod6YHoMviF2j5WQ23itC9zJNHm56ii8TqiLektk3EVvSGWwZwrp-GdditIzT5mSaVN1g",
    user: "Sarah J.", userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYqz6eE1tUBRxmZ1L2xAvtHtv5SirWaJXw4b0mQDnx3sWqpF6puxXj0gRQk62rtUXz3GmsyJCMWGr1tQvP49rjqqhk_YS0-BfIw57_5vWo9lkRmhMELNqk7dWoH-7dmEZ8flYpR-KDsFdwW3ZfzlYt5TodCD5uW5I_lzOaSK2wFS1oNEwt_cLfLdWGn4355R9W5VtyY0UhSGAShVyaT3wlyO2VD0vcpvNPfaKUIIQsZxofufQcm1KMxXvk13C3UYT0EGNZqNf4L_s",
    aspect: "aspect-[4/5]", date: new Date("2025-01-10"),
  },
  {
    id: 2, title: "맥스", subtitle: "포트리스 X1", likes: 892, category: "Dogs",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyWyLGCKcxINGevi-l16S6NyVhrH00m9OWA7XKzsc87WIlHB2pFkbjO4wpxG3Pu0tRdZ-NDlBVltVDtjox7MRgeYAGgab957tyVwxCvS1wd7slfI09gDYe_YUOiIHv72s5cikLLPldgPiYwwawpZAsAQReMCCWOa4kN-RaD9t9fAI2kGWIZXoLmZwwMLZjpHdfV1R755j1_F-hQNfOwtfW0JjJOoC2eEWFegU-YQjE7Oixi9aGCO1BYRVj603g9ma65awpTxtKMoM",
    user: "Mike Builds", userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKEPaAf3jdve__SF8vRftta3NC-HpPVMkYIKbpc9DlRvnHiInE90qV_y2A40ACzwmY2misJRCI8GqjIuzOSlL5cuRJipE1lmjqosB9DT3yGWwm8bsRv-OLHF6z6ZKkDnviwHJJhXI8irsI5Po9lCr_UPiw4XDp50PzkJTT0CzMiXQv5DeAoucmktNR8DFd2JMUQsP5ux7JHH4Ss2EzOqxp2XDSvtXVyVAnglWBFBz6xDbFkZ41BTFwemGuZojOKTxygC6IE8PEiFQ",
    aspect: "aspect-square", date: new Date("2025-02-05"),
  },
  {
    id: 3, title: "모찌", subtitle: "헥사-하이브", likes: 1200, category: "Cats",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBU4oEWDZ-rf7Ngu549NddzTSTvfxRdxQCxQXIxpD-g-IcRVWfGLB6Hv7kKNNLxetSo3y9Or0ZIxYgGPl_nHhjKAULW-OcKigPPF1EOdEFrq5jp5nNeoOsR3NXo5FWWC--SRsnuAtqKGPzX-IQ6_jIOlMtR9zWf4NRuQXdj00E0DP43usURGKQA0WaaOajlwxuZMq1Eux479Hau7z8X3MrlztCln1igwi0a069qDUPyUnwyADsgaQc3qA6q-Q_3uukNm5AVwq7N31E",
    user: "CatLover99", userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5jm8KXOGayDfTtL5LJ5fkgDl_52SRTxwCaEnRTRKSYTRHjZhv6Nzus1Nefnaf_0zqbmvjOpu_TlmjeHzZytdaXfsOLRe42b44rQdgbQSX-KpfnyIqa8etObexHA1GrCbl0crq2BiUozzt9XP9F0dZ5hw8dgskJxsIEcKgDN6r8X3aqjGIaw7alCDLPOtvo0EI9FdP7dH8xx7OYsrJ600xSTQu-zqGxqEoqS_kZRrFTGt27WQ6orSoK-O_ulgXkxYcJ_1Ehs17W20",
    aspect: "aspect-[3/4]", date: new Date("2025-01-28"),
  },
  {
    id: 4, title: "봉봉", subtitle: "더 버로우", likes: 56, category: "Rabbits",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4UdVTwYh5UfTECTRjwq0oZOOG5r3IEVRBl0eQND83s_oNyvU5Lj4sUTPwDlwA6xuUqPrjyCI-Hl3swiBQgv_iwKKGJuiCxf1aaA1zyq5Pol0NZmPB5pj50LF6J8_iFOjpSTEFXxM_wbuzwZ6DDzjpT2YXibOn8K70d8uNRlYxSxlFUyPqsPhYs1VR-NfZ9Men3A7O50DZ2_y1q2EGed2KpRC5x6EC3X5e1vRT1cI7oRkWXQN0LpBzPoQxp2yn2rvfTgNoH8QA_Sw",
    user: "Alex R.", userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAUiV_YggWbnaM2nExuv0kRqzcOtdmOzdf8FU5wBbfUK97FUzO47bL_lsy9_swK9nZxhFPVXBMxwQfVUPf6RVop6-Ps38vTizzD7vKTJZFhSlmuP4ws6sZxUw8eEfRmOseNKCSSql5HpC3fF8cug8cFoyItfcgruVFHqoueHRdXsAY-bMLi4wU2GtXILwNR_SQsAlMKyQ0ZsiV5uAR6I_M94bf1ghz7KNRq2mlkCXG28Iz7fdFVWD1rlJTNYHAvLev5sUtrzFowUFE",
    aspect: "aspect-video", date: new Date("2025-02-01"),
  },
  {
    id: 5, title: "쿠퍼", subtitle: "빌라 모더나", likes: 341, category: "Dogs",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCapwsKgGHlPfMNzObgP38PbNsBzmdk1zIQdypI3NoPRLJcc45aP281B7kexGrbwCHMo3r4jDN48K1nAr94Mar_DHEAVHMGa73oofoq0VBI2TZ0IY-0Rz0DOybpdba5DCLM8dByfGtoUMqa6emMEfvj5zb6fSaC9Q7v_2bbwhxGicYareBhyJ8TgGoU2mxUvbWsIDZ3Zur2_KSClyXSfJXKfoig5L413GRimVEhyzqLJu2qHrgMlPYfFPSkP2zMLA6760blUOKIy8I",
    user: "DesignDog", userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBVNMlVASoeiNsl7vQGPbU2Z77WIJ1zOyo6WREj1c4JD4NeFs4F0GYalzG1ytA9LyKMKtvsD3x14WYm9CTisrxWyscR_XOSuhrgeyPC6v-LAecw22sOBU8ixmTwupVOdyhiWqAH-3lEOQu2CtDNffduClTp3F0NAwkda3MykjrPIU3rpa-YVrvu2_SvUFREwESvSeuJvM7PXUgmip_bh5s7XR8QAIpKSvg9DmhmhqiaWZZcy_GMoPxsqhH4pLCHC8foAgahT-O4loI",
    aspect: "aspect-[4/5]", date: new Date("2025-01-15"),
  },
  {
    id: 6, title: "심바", subtitle: "스카이스크래퍼 01", likes: 105, category: "Cats",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCL-sbQjBkUhAWHER_m7J4B0wE2dIv9ECVJeda0wckBOmqLpJRW1NT7W6aTKZMYLCx3yIzieq-Q_S2gtMG468gONmpbnIlOPDZoxZu63swf8xkDqxVIJ-rhQydr6tMdsY1atbbiC0CNPVTFWSuuz6aPYlsntTcIxe0p8IEJ1z4XTfcvEYdpbuGkbJGBzQTpKyUtBqVoLrkyqARs0xjW6L5ic5ZIBGBKQiE1BS03u46pA6F7_IaSjtrhJ-lnvkwaDUXe5ApkJnQO_Wg",
    user: "Jenna K.", userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgbh8_v98fSidEvcmkOkk5afbeltT2jFP82aGYmqb8NhmJG4mQAqpzYz2TSXwwNwKnins_yFtoxRHj8p8LSFopFTqrvE2OiO5QZhFrnhU3yY7O2_C0qraSQ31QZLtTIcSUZUJDWT32VH8M4IJ4P4zBHICzQ3ny3pZ0RwOHmbzKmCESnQyTO1mKt30UkctftdIxvnjJpgCJL1g26nqm-zhAwsaiVyKlK1PC_7G3POfuuroodE4Z7zGoA_jskLxBhhvIWwpggVpXJQY",
    aspect: "aspect-[3/4]", date: new Date("2025-02-10"),
  },
];

type FilterCategory = "전체" | "고양이" | "강아지" | "토끼";
type SortOption = "인기순" | "최신순" | "트렌딩";

const CATEGORY_MAP: Record<FilterCategory, string | null> = {
  "전체": null,
  "고양이": "Cats",
  "강아지": "Dogs",
  "토끼": "Rabbits",
};

export default function ShowcasePage() {
  const [filter, setFilter] = useState<FilterCategory>("전체");
  const [sort, setSort] = useState<SortOption>("인기순");
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());

  const toggleLike = (id: number) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...showcaseItems];
    const categoryFilter = CATEGORY_MAP[filter];
    if (categoryFilter) result = result.filter((i) => i.category === categoryFilter);

    if (sort === "인기순") result.sort((a, b) => b.likes - a.likes);
    else if (sort === "최신순") result.sort((a, b) => b.date.getTime() - a.date.getTime());
    else if (sort === "트렌딩") result.sort((a, b) => (b.likes * 0.7 + b.date.getTime() / 1e10) - (a.likes * 0.7 + a.date.getTime() / 1e10));

    return result;
  }, [filter, sort]);

  return (
    <div className="dark bg-background-dark text-slate-100 font-display min-h-screen flex flex-col antialiased selection:bg-primary/30 selection:text-primary">
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 py-8 flex flex-col gap-8">

        {/* Upload Banner */}
        <section className="relative w-full rounded-xl overflow-hidden bg-surface-dark border border-border-dark shadow-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a3645_1px,transparent_1px),linear-gradient(to_bottom,#2a3645_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-8">
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">내 작품 공유하기</h2>
              <p className="text-slate-400 max-w-lg leading-relaxed">메이커 커뮤니티에 참여하세요! 반려동물이 새 골판지 집을 즐기는 사진을 업로드하고 다른 사람들에게 영감을 주세요.</p>
              <div className="flex gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-mono text-primary bg-primary/10 px-3 py-1.5 rounded border border-primary/20">
                  <span className="material-symbols-outlined text-sm">auto_fix</span>
                  AI 향상됨
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-green-400 bg-green-500/10 px-3 py-1.5 rounded border border-green-500/20">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  검증된 빌드
                </div>
              </div>
            </div>
            <div className="w-full md:w-96">
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-orange-400 opacity-30 group-hover:opacity-70 transition duration-500 blur rounded-xl"></div>
                <div className="relative w-full h-32 rounded-xl bg-surface-darker border-2 border-dashed border-slate-600 group-hover:border-slate-400 flex flex-col items-center justify-center gap-2 transition-colors">
                  <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-white transition-colors">cloud_upload</span>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-300">사진을 여기에 드롭하세요</p>
                    <p className="text-xs text-slate-500">또는 클릭하여 탐색</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-16 z-30 py-4 bg-background-dark/95 backdrop-blur-sm border-b border-border-dark/50">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {(["전체", "고양이", "강아지", "토끼"] as FilterCategory[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    filter === item
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "bg-surface-dark border border-border-dark text-slate-400 hover:text-white hover:border-slate-500"
                  }`}
                >
                  {item}
                </button>
              ))}
              <span className="text-slate-600 text-xs font-mono ml-2">{filteredAndSorted.length}개</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono hidden md:block">정렬:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="bg-surface-dark border border-border-dark text-slate-300 text-xs rounded-lg focus:ring-primary focus:border-primary py-1.5 pl-3 pr-8 outline-none"
              >
                <option>인기순</option>
                <option>최신순</option>
                <option>트렌딩</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {filteredAndSorted.map((item) => {
              const isLiked = likedIds.has(item.id);
              const displayLikes = item.likes + (isLiked ? 1 : 0);
              return (
                <article key={item.id} className="break-inside-avoid group relative bg-surface-dark rounded-xl overflow-hidden border border-border-dark hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/10">
                  <div className={`relative ${item.aspect} overflow-hidden`}>
                    <img alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={item.image} />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-transparent opacity-90"></div>
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => toggleLike(item.id)}
                        className={`size-8 rounded-full backdrop-blur transition-all flex items-center justify-center ${
                          isLiked
                            ? "bg-red-500 text-white scale-110"
                            : "bg-surface-darker/60 text-slate-300 hover:text-red-500 hover:bg-white"
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-4 relative -mt-16">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-white leading-tight">{item.title}</h3>
                        <p className="text-xs text-primary font-mono mt-1">{item.subtitle}</p>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 text-xs font-mono bg-surface-darker/80 px-2 py-1 rounded backdrop-blur">
                        <span className="material-symbols-outlined text-sm text-red-500" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                        {displayLikes >= 1000 ? `${(displayLikes / 1000).toFixed(1)}k` : displayLikes}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <img alt="User avatar" className="size-5 rounded-full border border-border-dark" src={item.userAvatar} />
                      <span className="text-xs text-slate-400">by <span className="text-slate-300 hover:text-white cursor-pointer">{item.user}</span></span>
                    </div>
                    <button className="w-full py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/30 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 group/btn">
                      <span className="material-symbols-outlined text-sm">architecture</span>
                      도면 받기
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredAndSorted.length === 0 && (
            <div className="text-center py-20 text-slate-500">
              <span className="material-symbols-outlined text-5xl mb-4 block">pets</span>
              <p className="text-lg font-bold">이 카테고리의 작품이 없습니다</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
