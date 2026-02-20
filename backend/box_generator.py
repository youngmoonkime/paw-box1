"""
boxes.py 통합 모듈
치수 정보를 받아 레이저 커터용 박스 도면을 생성합니다.
"""

import os
import subprocess
import math
from pathlib import Path


class BoxGenerator:
    """boxes.py를 사용하여 박스 도면 생성"""
    
    def __init__(self, output_dir='outputs'):
        """
        Args:
            output_dir: 출력 파일을 저장할 디렉토리
        """
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
    
    def generate_box(self, width, height, depth, 
                     box_type='Box', 
                     thickness=3.0,
                     output_format='svg',
                     filename=None):
        """
        박스 도면 생성
        
        Args:
            width: 가로 (mm)
            height: 높이 (mm)
            depth: 깊이/세로 (mm)
            box_type: 박스 타입 ('Box', 'TypeTray', 'ClosedBox' 등)
            thickness: 재료 두께 (mm)
            output_format: 출력 형식 ('svg', 'pdf', 'dxf', 'ps')
            filename: 출력 파일명 (없으면 자동 생성)
            
        Returns:
            str: 생성된 파일 경로
        """
        # 파일명 생성
        if filename is None:
            filename = f"{box_type}_{width}x{height}x{depth}.{output_format}"
        
        output_path = os.path.join(self.output_dir, filename)
        
        # boxes.py 명령어 구성
        cmd = [
            'boxes',
            box_type,
            '--x', str(width),
            '--y', str(depth),
            '--h', str(height),
            '--thickness', str(thickness),
            '--output', output_path,
            '--format', output_format
        ]
        
        try:
            result = subprocess.run(
                cmd,
                check=True,
                capture_output=True,
                text=True
            )
            
            if os.path.exists(output_path):
                return output_path
            else:
                raise Exception(f"출력 파일이 생성되지 않았습니다: {output_path}")
                
        except subprocess.CalledProcessError as e:
            raise Exception(f"boxes 명령 실행 실패: {e.stderr}")
        except FileNotFoundError:
            # boxes가 설치되지 않은 경우, Python 모듈로 시도
            return self._generate_with_python_module(
                width, height, depth, box_type, thickness, output_format, output_path
            )
    
    def _generate_with_python_module(self, width, height, depth, 
                                     box_type, thickness, output_format, output_path):
        """
        boxes Python 모듈을 직접 사용하여 생성
        """
        try:
            import boxes
            
            box_class = getattr(boxes, box_type, boxes.Box)
            box = box_class()
            box.x = width
            box.y = depth
            box.h = height
            box.thickness = thickness
            box.output = output_path
            box.format = output_format
            box.open()
            box.render()
            box.close()
            
            return output_path
            
        except ImportError:
            raise Exception(
                "boxes.py가 설치되지 않았습니다.\n"
                "설치 방법:\n"
                "  pip install boxes\n"
                "또는:\n"
                "  git clone https://github.com/florianfesti/boxes.git\n"
                "  cd boxes\n"
                "  python setup.py install"
            )
        except Exception as e:
            raise Exception(f"박스 생성 실패: {str(e)}")
    
    def get_available_box_types(self):
        """사용 가능한 박스 타입 목록 반환"""
        common_types = [
            'Box', 'ClosedBox', 'TypeTray',
            'Shelf', 'FlexBox', 'DisplayShelf', 'StorageShelf',
        ]
        try:
            import boxes
            all_types = [
                name for name in dir(boxes)
                if not name.startswith('_') and 
                hasattr(getattr(boxes, name), '__bases__')
            ]
            return all_types
        except:
            return common_types
    
    def create_simple_box_svg(self, width, height, depth, thickness=3.0):
        """
        탭/슬롯 결합부와 치수 주석이 있는 정밀 SVG 박스 전개도 생성
        
        배치(십자형):
                  [Top]
        [Left] [Front] [Right] [Back]
                 [Bottom]
        
        Args:
            width, height, depth: 치수 (mm)
            thickness: 재료 두께 (mm)
            
        Returns:
            str: 생성된 SVG 파일 경로
        """
        filename = f"box_{int(width)}x{int(height)}x{int(depth)}.svg"
        output_path = os.path.join(self.output_dir, filename)
        
        svg_content = self._generate_precise_svg(width, height, depth, thickness)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(svg_content)
        
        return output_path

    # ──────────────────────────────────────────────────────────
    #  SVG 생성 헬퍼
    # ──────────────────────────────────────────────────────────

    def _tab_path(self, x0, y0, length, direction, num_tabs=None, t=3.0, invert=False):
        """
        탭/슬롯 결합부 경로 생성.

        direction: 'right' | 'down' | 'left' | 'up'
        invert: True → 슬롯(오목), False → 탭(볼록)
        반환: SVG path d 문자열 (현재 위치에서 시작)
        """
        tab_ratio   = 0.3          # 탭 길이 비율 (전체 면 길이 대비)
        tab_h       = t            # 탭 높이 = 재료 두께

        if num_tabs is None:
            num_tabs = max(2, int(length / 40))

        seg   = length / (2 * num_tabs)   # 탭/슬롯 교대 세그먼트 길이
        sign  = -1 if invert else 1

        # 방향에 따른 진행 벡터 & 탭 수직 벡터
        if direction == 'right':
            dx, dy   = 1, 0
            nx, ny   = 0, sign
        elif direction == 'down':
            dx, dy   = 0, 1
            nx, ny   = -sign, 0
        elif direction == 'left':
            dx, dy   = -1, 0
            nx, ny   = 0, -sign
        else:  # up
            dx, dy   = 0, -1
            nx, ny   = sign, 0

        path = ""
        cx, cy = x0, y0

        for i in range(2 * num_tabs):
            # 평면 이동
            ex = cx + dx * seg
            ey = cy + dy * seg
            path += f" L {ex:.2f},{ey:.2f}"

            if i % 2 == 0:
                # 탭(또는 슬롯) 돌출
                path += (
                    f" L {ex + nx*tab_h:.2f},{ey + ny*tab_h:.2f}"
                    f" L {ex + nx*tab_h + dx*seg:.2f},{ey + ny*tab_h + dy*seg:.2f}"
                    f" L {ex + dx*seg:.2f},{ey + dy*seg:.2f}"
                )
                cx = ex + dx * seg
                cy = ey + dy * seg
            else:
                cx, cy = ex, ey

        return path

    def _rect_with_tabs(self, x, y, w, h, t, label, tab_sides=None):
        """
        4변에 선택적으로 탭/슬롯을 가진 직사각형 패널 SVG 반환.
        tab_sides: dict {'top': bool, 'right': bool, 'bottom': bool, 'left': bool}
                   True = 탭 돌출, False = 슬롯(오목)
                   None = 일반 직선
        """
        if tab_sides is None:
            tab_sides = {}

        nt = max(2, int(min(w, h) / 40))
        tab_h = t

        def side(direction, edge_len, invert):
            return self._tab_path(0, 0, edge_len, direction, num_tabs=nt, t=tab_h, invert=invert)

        # 시작점: 좌상단
        d = f"M {x:.2f},{y:.2f}"

        # 위쪽 → 오른쪽
        ts = tab_sides.get('top')
        if ts is None:
            d += f" L {x+w:.2f},{y:.2f}"
        else:
            d += self._tab_path(x, y, w, 'right', nt, tab_h, invert=(not ts))

        # 오른쪽 → 아래쪽
        ts = tab_sides.get('right')
        if ts is None:
            d += f" L {x+w:.2f},{y+h:.2f}"
        else:
            d += self._tab_path(x+w, y, h, 'down', nt, tab_h, invert=(not ts))

        # 아래쪽 → 왼쪽
        ts = tab_sides.get('bottom')
        if ts is None:
            d += f" L {x:.2f},{y+h:.2f}"
        else:
            d += self._tab_path(x+w, y+h, w, 'left', nt, tab_h, invert=(not ts))

        # 왼쪽 → 위쪽
        ts = tab_sides.get('left')
        if ts is None:
            d += f" L {x:.2f},{y:.2f}"
        else:
            d += self._tab_path(x, y+h, h, 'up', nt, tab_h, invert=(not ts))

        d += " Z"

        # 레이블 + 치수 텍스트
        lx = x + w / 2
        ly = y + h / 2
        fs = max(4, min(8, min(w, h) / 8))
        txt = (
            f'<text x="{lx:.1f}" y="{ly:.1f}" '
            f'font-size="{fs}" font-family="Arial,sans-serif" '
            f'text-anchor="middle" dominant-baseline="middle" fill="#555">'
            f'{label}</text>\n'
            f'<text x="{lx:.1f}" y="{ly + fs*1.6:.1f}" '
            f'font-size="{fs*0.85:.1f}" font-family="Arial,sans-serif" '
            f'text-anchor="middle" dominant-baseline="middle" fill="#999">'
            f'{w:.0f}×{h:.0f}mm</text>'
        )

        return f'<path d="{d}" fill="none" stroke="#E02020" stroke-width="0.5"/>\n{txt}\n'

    def _dim_arrow(self, x1, y1, x2, y2, label, offset=8):
        """치수선 (양방향 화살표 + 레이블)"""
        mx = (x1 + x2) / 2
        my = (y1 + y2) / 2
        fs = 5

        # 수평/수직 판별
        horiz = abs(y2 - y1) < 0.5

        if horiz:
            ox, oy   = 0, -offset
            ax1, ay1 = x1, y1 - offset
            ax2, ay2 = x2, y2 - offset
            lx, ly   = mx, my - offset - 2
        else:
            ox, oy   = -offset, 0
            ax1, ay1 = x1 - offset, y1
            ax2, ay2 = x2 - offset, y2
            lx, ly   = mx - offset - 2, my

        ah = 3  # 화살표 크기
        # 화살표 path
        def arrowhead(tx, ty, dx, dy):
            px = -dy * ah
            py = dx * ah
            return f"M {tx},{ty} L {tx-dx*ah*2+px},{ty-dy*ah*2+py} L {tx-dx*ah*2-px},{ty-dy*ah*2-py} Z"

        length = math.hypot(x2-x1, y2-y1)
        if length < 0.1:
            return ""
        dx = (x2-x1)/length
        dy = (y2-y1)/length

        lines = (
            f'<line x1="{ax1:.1f}" y1="{ay1:.1f}" x2="{ax2:.1f}" y2="{ay2:.1f}" '
            f'stroke="#4488FF" stroke-width="0.4" stroke-dasharray="2,2"/>\n'
            f'<path d="{arrowhead(ax1,ay1,dx,dy)}" fill="#4488FF"/>\n'
            f'<path d="{arrowhead(ax2,ay2,-dx,-dy)}" fill="#4488FF"/>\n'
            f'<text x="{lx:.1f}" y="{ly:.1f}" font-size="{fs}" '
            f'font-family="Arial,sans-serif" text-anchor="middle" fill="#4488FF">'
            f'{label}</text>\n'
        )
        return lines

    def _generate_precise_svg(self, w, h, d, t):
        """
        정확한 십자형 전개도 SVG 생성.

        레이아웃 (margin=20, spacing=5):

              [Top  w×d]
        [L d×h][Front w×h][R d×h][Back w×h]
              [Bottom w×d]
        """
        margin  = 20
        sp      = 8   # 패널 간격

        # 캔버스 계산
        canvas_w = margin * 2 + d + w + d + w + sp * 3
        canvas_h = margin * 2 + d + h + d + sp * 2

        # 패널 좌상단 좌표
        # 첫 번째 열: Left (d×h)
        left_x = margin
        left_y = margin + d + sp

        # 두 번째 열: Front (w×h), Top (w×d), Bottom (w×d)
        front_x = margin + d + sp
        front_y = margin + d + sp
        top_x   = front_x
        top_y   = margin
        bot_x   = front_x
        bot_y   = margin + d + sp + h + sp

        # 세 번째 열: Right (d×h)
        right_x = front_x + w + sp
        right_y = left_y

        # 네 번째 열: Back (w×h)
        back_x  = right_x + d + sp
        back_y  = left_y

        svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{canvas_w:.1f}mm" height="{canvas_h:.1f}mm"
     viewBox="0 0 {canvas_w:.1f} {canvas_h:.1f}"
     xmlns="http://www.w3.org/2000/svg">

  <title>Pet Box {w:.0f}x{h:.0f}x{d:.0f}mm · t={t:.1f}mm</title>

  <!-- 배경 -->
  <rect width="{canvas_w:.1f}" height="{canvas_h:.1f}" fill="#FAFAFA"/>

  <!-- 제목 -->
  <text x="{canvas_w/2:.1f}" y="9" font-size="7" font-family="Arial,sans-serif"
        text-anchor="middle" fill="#222" font-weight="bold">
    반려동물 집 전개도 · W{w:.0f} × H{h:.0f} × D{d:.0f} mm · 재료두께 {t:.1f}mm
  </text>

  <!-- 컷 라인 레이어 -->
  <g id="cut">
'''
        # ── 6개 패널 ──────────────────────────────────────────────
        # Top (w × d): 아래→Front, 양옆→Left/Right 탭
        svg += self._rect_with_tabs(
            top_x, top_y, w, d, t, "Top",
            {'top': None, 'right': None, 'bottom': True, 'left': None}
        )

        # Front (w × h): 위→Top 슬롯, 좌→Left 탭, 우→Right 탭, 아래→Bottom 슬롯
        svg += self._rect_with_tabs(
            front_x, front_y, w, h, t, "Front",
            {'top': False, 'right': True, 'bottom': False, 'left': True}
        )

        # Bottom (w × d)
        svg += self._rect_with_tabs(
            bot_x, bot_y, w, d, t, "Bottom",
            {'top': True, 'right': None, 'bottom': None, 'left': None}
        )

        # Left (d × h)
        svg += self._rect_with_tabs(
            left_x, left_y, d, h, t, "Left",
            {'top': None, 'right': False, 'bottom': None, 'left': None}
        )

        # Right (d × h)
        svg += self._rect_with_tabs(
            right_x, right_y, d, h, t, "Right",
            {'top': None, 'right': None, 'bottom': None, 'left': False}
        )

        # Back (w × h)
        svg += self._rect_with_tabs(
            back_x, back_y, w, h, t, "Back",
            {'top': None, 'right': None, 'bottom': None, 'left': False}
        )

        svg += "  </g>\n\n"

        # ── 치수선 레이어 ──────────────────────────────────────────
        svg += '  <g id="dimensions">\n'
        # 폭 (W)
        svg += self._dim_arrow(front_x, front_y, front_x + w, front_y, f"W={w:.0f}mm", offset=10)
        # 높이 (H)
        svg += self._dim_arrow(front_x, front_y, front_x, front_y + h, f"H={h:.0f}mm", offset=12)
        # 깊이 (D)
        svg += self._dim_arrow(top_x, top_y, top_x, top_y + d, f"D={d:.0f}mm", offset=12)
        svg += "  </g>\n\n"

        # ── 범례 ──────────────────────────────────────────────────
        leg_x = margin
        leg_y = canvas_h - 7
        svg += f'''  <g id="legend" font-size="4.5" font-family="Arial,sans-serif" fill="#666">
    <line x1="{leg_x}" y1="{leg_y-1}" x2="{leg_x+10}" y2="{leg_y-1}"
          stroke="#E02020" stroke-width="0.8"/>
    <text x="{leg_x+12}" y="{leg_y}">컷 라인 (빨간색)</text>
    <line x1="{leg_x+60}" y1="{leg_y-1}" x2="{leg_x+70}" y2="{leg_y-1}"
          stroke="#4488FF" stroke-width="0.4" stroke-dasharray="2,2"/>
    <text x="{leg_x+72}" y="{leg_y}">치수선 (파란색)</text>
    <text x="{canvas_w - margin:.1f}" y="{leg_y}"
          text-anchor="end">재료두께 {t:.1f}mm · Generated by Paw-Box</text>
  </g>

</svg>'''

        return svg


def test_generator():
    """테스트 함수"""
    print("BoxGenerator 테스트")
    print("-" * 50)
    
    generator = BoxGenerator(output_dir='outputs')
    
    print("\n[정밀 SVG 생성]")
    svg_path = generator.create_simple_box_svg(
        width=200,
        height=150,
        depth=180,
        thickness=3.0
    )
    print(f"생성됨: {svg_path}")


if __name__ == '__main__':
    test_generator()
