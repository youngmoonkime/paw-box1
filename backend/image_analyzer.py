"""
이미지 분석 모듈 (OpenAI GPT-4o Vision)
반려동물 사진에서 박스 치수를 고정밀 추정합니다.
목표 신뢰도: 90%+
"""

import os
import base64
import json
import re
import math
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

# OpenAI
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OpenAI = None
    OPENAI_AVAILABLE = False




class ImageAnalyzer:
    """반려동물 이미지에서 박스 치수를 고정밀 추정합니다."""

    def __init__(self, api_key=None):
        self.openai_key = api_key or os.environ.get('OPENAI_API_KEY')
        
        # OpenAI 클라이언트
        if self.openai_key and OPENAI_AVAILABLE:
            self.openai_client = OpenAI(api_key=self.openai_key)
            self.model = 'openai'
        else:
            self.openai_client = None
            self.model = None

    # ──────────────────────────────────────────────────────────────
    #  OpenCV 보조 분석 — AI에게 추가 힌트 제공
    # ──────────────────────────────────────────────────────────────
    def _opencv_hints(self, image_path):
        """
        OpenCV로 주요 피사체의 픽셀 비율을 계산해 AI 프롬프트 보조 데이터로 사용.
        Returns: dict with pixel_ratio_wh, pixel_ratio_wd, img_w, img_h
        """
        img = cv2.imread(image_path)
        if img is None:
            return {}

        ih, iw = img.shape[:2]
        gray    = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (7, 7), 0)
        edges   = cv2.Canny(blurred, 30, 120)

        # 배경 제거 후 최대 윤곽 (GrabCut 없이 간단 처리)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            return {}

        # 이미지 면적 5% 이상인 윤곽만
        min_area = iw * ih * 0.05
        big = [c for c in contours if cv2.contourArea(c) > min_area]
        if not big:
            big = contours

        largest = max(big, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest)

        # 최소 외접 회전 박스
        rect = cv2.minAreaRect(largest)
        rw, rh = rect[1]
        long_side  = max(rw, rh)
        short_side = min(rw, rh)

        ratio_wh = round(long_side / short_side, 3) if short_side > 0 else 1.0

        return {
            'pixel_bbox_w': int(w),
            'pixel_bbox_h': int(h),
            'pixel_ratio_long_short': ratio_wh,
            'subject_area_ratio': round(w * h / (iw * ih), 3),
            'image_size': f"{iw}x{ih}",
        }

    # ──────────────────────────────────────────────────────────────
    #  프롬프트 생성
    # ──────────────────────────────────────────────────────────────
    def _build_prompt(self, hints: dict) -> str:
        hint_str = ""
        if hints:
            hint_str = f"""
[OpenCV 보조 데이터 — 무조건 참고하세요]
- 피사체 바운딩박스 픽셀: {hints.get('pixel_bbox_w')}px(가로) × {hints.get('pixel_bbox_h')}px(세로)
- 장축:단축 비율: {hints.get('pixel_ratio_long_short')}
- 피사체가 이미지에서 차지하는 비율: {hints.get('subject_area_ratio')}
- 원본 이미지 크기: {hints.get('image_size')}
"""

        return f"""당신은 반려동물 신체 치수 전문 측정 AI입니다.
이 이미지에 찍힌 반려동물(강아지/고양이/토끼 등)이 편안하게 들어갈 수 있는
골판지/MDF 집 박스의 최적 치수를 추정해 주세요.

{hint_str}

[추정 단계 — 반드시 이 순서대로 추론하세요]
STEP 1. 동물 종류와 품종을 파악하세요 (예: 소형견, 고양이, 대형견 등).
STEP 2. 동물의 신체 각 부위(머리, 몸통, 다리)의 표준 신체 치수를 기억합니다.
STEP 3. 이미지 내 동물의 자세(앉음/엎드림/서있음)와 픽셀 비율을 참고해 실제 크기를 보정합니다.
STEP 4. 박스 치수를 계산합니다:
   - 가로(width): 동물 몸통 길이 × 1.3 (여유 공간 포함)
   - 높이(height): 앉았을 때 머리 끝 높이 × 1.2
   - 깊이(depth): 동물 몸통 폭 × 1.4 (들어갈 수 있게)
STEP 5. 각 치수의 신뢰도를 독립적으로 평가하고 종합 신뢰도를 계산합니다.

[신뢰도 가이드]
- 0.90~1.00: 동물 전신이 명확히 보이고 품종이 확실
- 0.75~0.89: 동물이 보이지만 일부 가려지거나 자세가 불명확
- 0.50~0.74: 동물이 모호하게 보임
- 0.50 미만: 동물을 식별하기 어려움

[응답 형식 — 반드시 JSON 코드블록만 반환]
```json
{{
  "animal_type": "동물 종류와 품종",
  "posture": "앉음/엎드림/서있음 중 하나",
  "width": 가로_mm,
  "height": 높이_mm,
  "depth": 깊이_mm,
  "confidence": 신뢰도_0~1,
  "confidence_breakdown": {{
    "animal_recognition": 0.0~1.0,
    "size_estimation": 0.0~1.0,
    "posture_clarity": 0.0~1.0
  }},
  "notes": "추정 근거 한 줄 요약"
}}
```"""

    # ──────────────────────────────────────────────────────────────
    #  OpenAI GPT-4o Vision 분석
    # ──────────────────────────────────────────────────────────────
    def analyze_with_openai(self, image_path: str) -> dict:
        if not self.openai_client:
            raise RuntimeError("OPENAI_API_KEY가 설정되지 않았습니다.")

        # 이미지 → base64
        with open(image_path, 'rb') as f:
            b64 = base64.b64encode(f.read()).decode()

        ext = Path(image_path).suffix.lower().lstrip('.')
        mime = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
                'png': 'image/png', 'webp': 'image/webp',
                'gif': 'image/gif'}.get(ext, 'image/jpeg')

        hints  = self._opencv_hints(image_path)
        prompt = self._build_prompt(hints)

        response = self.openai_client.chat.completions.create(
            model='gpt-4o',
            temperature=0.2,       # 낮은 temperature → 일관된 답변
            max_tokens=800,
            messages=[
                {
                    'role': 'user',
                    'content': [
                        {'type': 'text', 'text': prompt},
                        {'type': 'image_url',
                         'image_url': {'url': f'data:{mime};base64,{b64}',
                                       'detail': 'high'}},
                    ],
                }
            ],
        )

        raw = response.choices[0].message.content
        return self._parse_result(raw, method='openai_gpt4o')



    # ──────────────────────────────────────────────────────────────
    #  OpenCV 단독 분석 (최후 폴백)
    # ──────────────────────────────────────────────────────────────
    def analyze_with_opencv(self, image_path: str, reference_size=None) -> dict:
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"이미지를 로드할 수 없습니다: {image_path}")

        gray    = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges   = cv2.Canny(blurred, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if not contours:
            return {'width': 300.0, 'height': 250.0, 'depth': 300.0,
                    'confidence': 0.2, 'notes': '물체 감지 실패 — 기본값', 'method': 'opencv_fallback'}

        largest = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest)
        scale = (reference_size / max(w, h)) if reference_size else 1.0

        return {
            'width': round(w * scale * 1.3, 1),
            'height': round(h * scale * 1.2, 1),
            'depth': round(w * scale * 0.9, 1),
            'confidence': 0.45,
            'notes': f'OpenCV 전용 (픽셀bbox {w}×{h}px)',
            'method': 'opencv',
        }

    # ──────────────────────────────────────────────────────────────
    #  JSON 파싱 + 검증
    # ──────────────────────────────────────────────────────────────
    def _parse_result(self, raw_text: str, method: str) -> dict:
        try:
            match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', raw_text)
            json_str = match.group(1) if match else raw_text
            data = json.loads(json_str)

            w = float(data.get('width', 300))
            h = float(data.get('height', 250))
            d = float(data.get('depth', 300))

            # 물리적 타당성 검사 (최소 50mm, 최대 2000mm)
            def clamp(v, lo=50, hi=2000):
                return max(lo, min(hi, v))

            w, h, d = clamp(w), clamp(h), clamp(d)

            raw_conf   = float(data.get('confidence', 0.5))
            breakdown  = data.get('confidence_breakdown', {})

            # 세부 항목 신뢰도가 있으면 가중 평균으로 재계산
            if breakdown:
                sub_values = list(breakdown.values())
                if sub_values:
                    weighted = (
                        breakdown.get('animal_recognition', raw_conf) * 0.4 +
                        breakdown.get('size_estimation', raw_conf) * 0.4 +
                        breakdown.get('posture_clarity', raw_conf) * 0.2
                    )
                    confidence = round((raw_conf + weighted) / 2, 3)
                else:
                    confidence = raw_conf
            else:
                confidence = raw_conf

            return {
                'width':      round(w, 1),
                'height':     round(h, 1),
                'depth':      round(d, 1),
                'confidence': round(min(confidence, 0.98), 3),
                'animal_type': data.get('animal_type', ''),
                'posture':    data.get('posture', ''),
                'notes':      data.get('notes', ''),
                'method':     method,
            }

        except Exception as e:
            print(f"[ImageAnalyzer] JSON 파싱 실패: {e}\n응답: {raw_text[:300]}")
            return {
                'width': 300.0, 'height': 250.0, 'depth': 300.0,
                'confidence': 0.3,
                'notes': f'파싱 실패 — 기본값 사용 ({method})',
                'method': f'{method}_fallback',
            }

    # ──────────────────────────────────────────────────────────────
    #  통합 진입점
    # ──────────────────────────────────────────────────────────────
    def analyze(self, image_path: str, method='auto', reference_size=None) -> dict:
        """
        Args:
            image_path: 이미지 경로
            method: 'auto' | 'openai' | 'gemini' | 'opencv'
            reference_size: OpenCV 모드 참조 크기 (mm)
        """
        if method == 'openai' or (method == 'auto' and self.openai_client):
            try:
                return self.analyze_with_openai(image_path)
            except Exception as e:
                print(f"[OpenAI] 실패: {e}")
                if method == 'openai':
                    raise



        return self.analyze_with_opencv(image_path, reference_size)
