"""
박스 도면 생성기 - 웹 서비스
Flask 기반 웹 인터페이스
"""

import os
import uuid
import base64
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_file, url_for
from flask_cors import CORS
from werkzeug.utils import secure_filename

from image_analyzer import ImageAnalyzer
from box_generator import BoxGenerator

from dotenv import load_dotenv
load_dotenv()


app = Flask(__name__)

# CORS 설정 - 외부 호스팅(Cloudflare 등) 환경에서도 접근할 수 있도록 모든 Origin 허용
CORS(app, resources={r"/*": {"origins": "*"}})


# 설정
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['OUTPUT_FOLDER'] = 'outputs'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB 제한
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# 디렉토리 생성
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)

# 전역 객체
analyzer = ImageAnalyzer()
generator = BoxGenerator(output_dir=app.config['OUTPUT_FOLDER'])


def allowed_file(filename):
    """허용된 파일 확장자인지 확인"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


@app.route('/')
def index():
    """메인 페이지"""
    return render_template('index.html')


@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    """이미지 분석 API (FormData)"""
    try:
        # 파일 확인
        if 'image' not in request.files:
            return jsonify({'error': '이미지 파일이 없습니다'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': '파일이 선택되지 않았습니다'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': '허용되지 않은 파일 형식입니다'}), 400
        
        # 파일 저장
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        # 분석 방법
        method = request.form.get('method', 'auto')
        reference_size = request.form.get('reference_size')
        if reference_size:
            reference_size = float(reference_size)
        
        # 이미지 분석
        dimensions = analyzer.analyze(
            filepath,
            method=method,
            reference_size=reference_size
        )
        
        # 결과 반환
        return jsonify({
            'success': True,
            'dimensions': dimensions,
            'image_path': unique_filename
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analyze-base64', methods=['POST'])
def analyze_image_base64():
    """이미지 분석 API (Base64)"""
    try:
        data = request.get_json()
        
        if not data or 'image_base64' not in data:
            return jsonify({'error': '이미지 데이터가 없습니다'}), 400
        
        # Base64 디코딩
        image_data = base64.b64decode(data['image_base64'])
        
        # 임시 파일로 저장
        filename = data.get('filename', 'upload.jpg')
        filename = secure_filename(filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
        with open(filepath, 'wb') as f:
            f.write(image_data)
        
        # 분석 방법
        method = data.get('method', 'auto')
        reference_size = data.get('reference_size')
        if reference_size:
            reference_size = float(reference_size)
        
        # 이미지 분석
        dimensions = analyzer.analyze(
            filepath,
            method=method,
            reference_size=reference_size
        )
        
        # 결과 반환
        return jsonify({
            'success': True,
            'dimensions': dimensions,
            'image_path': unique_filename
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/generate', methods=['POST'])
def generate_box():
    """박스 도면 생성 API"""
    try:
        data = request.get_json()
        
        # 치수
        width = float(data.get('width', 100))
        height = float(data.get('height', 50))
        depth = float(data.get('depth', 100))
        
        # 옵션
        box_type = data.get('box_type', 'Box')
        thickness = float(data.get('thickness', 3.0))
        output_format = data.get('format', 'svg')
        use_simple = data.get('simple', True)
        
        # 도면 생성
        if use_simple or output_format == 'svg':
            output_path = generator.create_simple_box_svg(
                width=width,
                height=height,
                depth=depth,
                thickness=thickness
            )
        else:
            output_path = generator.generate_box(
                width=width,
                height=height,
                depth=depth,
                box_type=box_type,
                thickness=thickness,
                output_format=output_format
            )
        
        # 파일명 추출
        filename = os.path.basename(output_path)
        
        return jsonify({
            'success': True,
            'filename': filename,
            'download_url': url_for('download_file', filename=filename),
            'file_size': os.path.getsize(output_path)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/generate-from-image', methods=['POST'])
def generate_from_image():
    """이미지에서 직접 박스 생성 (통합 API)"""
    try:
        # 파일 확인
        if 'image' not in request.files:
            return jsonify({'error': '이미지 파일이 없습니다'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': '파일이 선택되지 않았습니다'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': '허용되지 않은 파일 형식입니다'}), 400
        
        # 파일 저장
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        # 1. 이미지 분석
        method = request.form.get('method', 'auto')
        dimensions = analyzer.analyze(filepath, method=method)
        
        # 2. 박스 생성
        thickness = float(request.form.get('thickness', 3.0))
        output_format = request.form.get('format', 'svg')
        
        output_path = generator.create_simple_box_svg(
            width=dimensions['width'],
            height=dimensions['height'],
            depth=dimensions['depth'],
            thickness=thickness
        )
        
        output_filename = os.path.basename(output_path)
        
        return jsonify({
            'success': True,
            'dimensions': dimensions,
            'filename': output_filename,
            'download_url': url_for('download_file', filename=output_filename),
            'file_size': os.path.getsize(output_path)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/box-types')
def get_box_types():
    """사용 가능한 박스 타입 목록"""
    types = generator.get_available_box_types()
    return jsonify({
        'box_types': types
    })


@app.route('/download/<filename>')
def download_file(filename):
    """파일 다운로드"""
    filepath = os.path.join(app.config['OUTPUT_FOLDER'], filename)
    if os.path.exists(filepath):
        return send_file(
            filepath,
            as_attachment=True,
            download_name=filename
        )
    else:
        return jsonify({'error': '파일을 찾을 수 없습니다'}), 404


@app.route('/preview/<filename>')
def preview_file(filename):
    """파일 미리보기 (SVG)"""
    filepath = os.path.join(app.config['OUTPUT_FOLDER'], filename)
    if os.path.exists(filepath) and filename.endswith('.svg'):
        return send_file(filepath, mimetype='image/svg+xml')
    else:
        return jsonify({'error': '파일을 찾을 수 없습니다'}), 404


@app.route('/health')
def health_check():
    """헬스 체크"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'gemini_api_available': analyzer.model is not None
    })


if __name__ == '__main__':
    print("=" * 60)
    print("박스 도면 생성기 웹 서비스")
    print("=" * 60)
    print(f"업로드 폴더: {os.path.abspath(app.config['UPLOAD_FOLDER'])}")
    print(f"출력 폴더: {os.path.abspath(app.config['OUTPUT_FOLDER'])}")
    print(f"OpenAI API: {'사용 가능' if analyzer.model == 'openai' else '사용 불가 (OpenCV만 사용)'}")
    print("=" * 60)
    print("서버 시작 중...")
    print("브라우저에서 http://localhost:5000 접속")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
