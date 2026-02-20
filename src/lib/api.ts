/**
 * Paw-Box API 서비스 레이어
 * Flask 백엔드(localhost:5000)와 통신합니다.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface Dimensions {
    width: number;
    height: number;
    depth: number;
    confidence: number;
    notes: string;
    method: string;
}

export interface AnalyzeResponse {
    success: boolean;
    dimensions: Dimensions;
    image_path: string;
    error?: string;
}

export interface GenerateResponse {
    success: boolean;
    filename: string;
    download_url: string;
    file_size: number;
    error?: string;
}

export interface GenerateFromImageResponse {
    success: boolean;
    dimensions: Dimensions;
    filename: string;
    download_url: string;
    file_size: number;
    error?: string;
}

/** 이미지 업로드 → 치수 분석 */
export async function analyzeImage(
    file: File,
    method: "auto" | "gemini" | "opencv" = "auto",
): Promise<AnalyzeResponse> {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("method", method);

    const response = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "서버 오류" }));
        throw new Error(err.error || "분석 실패");
    }

    return response.json();
}

/** 치수 → SVG 도면 생성 */
export async function generateBox(
    dimensions: Pick<Dimensions, "width" | "height" | "depth">,
    thickness = 3.0,
): Promise<GenerateResponse> {
    const response = await fetch(`${API_BASE}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...dimensions,
            thickness,
            format: "svg",
            simple: true,
        }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "서버 오류" }));
        throw new Error(err.error || "도면 생성 실패");
    }

    return response.json();
}

/** 이미지에서 직접 박스 도면 생성 (통합) */
export async function generateFromImage(
    file: File,
    thickness = 3.0,
): Promise<GenerateFromImageResponse> {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("thickness", String(thickness));
    formData.append("format", "svg");

    const response = await fetch(`${API_BASE}/api/generate-from-image`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "서버 오류" }));
        throw new Error(err.error || "도면 생성 실패");
    }

    return response.json();
}

/** SVG 파일 다운로드 URL 반환 */
export function getDownloadUrl(filename: string): string {
    return `${API_BASE}/download/${filename}`;
}

/** SVG 파일 미리보기 URL 반환 */
export function getPreviewUrl(filename: string): string {
    return `${API_BASE}/preview/${filename}`;
}

/** 백엔드 헬스 체크 */
export async function checkHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}/health`, {
            signal: AbortSignal.timeout(3000),
        });
        return response.ok;
    } catch {
        return false;
    }
}
