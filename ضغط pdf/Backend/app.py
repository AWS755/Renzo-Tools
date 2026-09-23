import os
import uuid
from io import BytesIO

import fitz  # PyMuPDF
from PIL import Image
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

# ============================================================
# Tool Hub - PDF Compressor
# Backend API (Enhanced with PyMuPDF & Pillow)
# ============================================================

app = Flask(__name__)
CORS(app)

# ============================================================
# Configuration
# ============================================================

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
OUTPUT_FOLDER = "compressed_files"
ALLOWED_EXTENSIONS = {".pdf"}

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# ============================================================
# Helper Functions
# ============================================================

def is_pdf(filename):
    if not filename:
        return False
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS


def calculate_saving(original_size, compressed_size):
    if original_size <= 0:
        return 0
    saving = ((original_size - compressed_size) / original_size) * 100
    return max(0, round(saving))


def create_output_filename():
    file_id = uuid.uuid4().hex
    return file_id, f"{file_id}.pdf"


# ============================================================
# Home / Health Check
# ============================================================

@app.get("/")
def home():
    return jsonify({
        "success": True,
        "message": "Tool Hub PDF Compressor API is running."
    })


# ============================================================
# PDF Compression Logic
# ============================================================

@app.post("/api/compress-pdf")
def compress_pdf():

    if "file" not in request.files:
        return jsonify({"success": False, "error": "لم يتم إرسال ملف PDF."}), 400

    uploaded_file = request.files["file"]
    original_filename = uploaded_file.filename

    if not original_filename or not is_pdf(original_filename):
        return jsonify({"success": False, "error": "نوع الملف غير صالح. يسمح بملفات PDF فقط."}), 400

    try:
        file_bytes = uploaded_file.read()
    except Exception as error:
        print("File read error:", error)
        return jsonify({"success": False, "error": "تعذر قراءة الملف."}), 400

    if not file_bytes:
        return jsonify({"success": False, "error": "الملف فارغ."}), 400

    original_size = len(file_bytes)

    if original_size > MAX_FILE_SIZE:
        return jsonify({"success": False, "error": "حجم الملف أكبر من 50MB."}), 400

    compression_level = request.form.get("compression", "recommended")

    # إعدادات ضغط الصور حسب المستوى المختار
    quality_map = {
        "high": {"quality": 30, "dpi": 96},        # ضغط قوي (حجم أصغر)
        "maximum": {"quality": 30, "dpi": 96},
        "medium": {"quality": 60, "dpi": 150},      # ضغط متوسط (متوازن)
        "recommended": {"quality": 60, "dpi": 150},
        "low": {"quality": 80, "dpi": 200},         # ضغط منخفض (جودة أعلى)
        "quality": {"quality": 80, "dpi": 200}
    }

    config = quality_map.get(compression_level, quality_map["medium"])

    try:
        # فتح المستند باستخدام PyMuPDF
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        page_count = len(doc)

        if page_count == 0:
            return jsonify({"success": False, "error": "ملف PDF لا يحتوي على صفحات."}), 400

        # ضغط الصور داخل كل صفحة
        for page in doc:
            image_list = page.get_images(full=True)

            for img_info in image_list:
                xref = img_info[0]

                try:
                    base_image = doc.extract_image(xref)
                    image_bytes = base_image["image"]

                    # فتح الصورة بواسطة Pillow وإعادة تشفيرها
                    img = Image.open(BytesIO(image_bytes))

                    if img.mode in ("RGBA", "P"):
                        img = img.convert("RGB")

                    output_img_io = BytesIO()
                    img.save(
                        output_img_io,
                        format="JPEG",
                        quality=config["quality"],
                        optimize=True
                    )
                    new_image_bytes = output_img_io.getvalue()

                    # استبدال الصورة القديمة إذا كان حجم الجديدة أصغر
                    if len(new_image_bytes) < len(image_bytes):
                        page.replace_image(xref, stream=new_image_bytes)

                except Exception as img_err:
                    print("Image compression skipped:", img_err)

        # حفظ المستند المكتمل مع تنظيف وإزالة المكونات غير المستخدمة
        output_buffer = BytesIO()
        doc.save(
            output_buffer,
            garbage=4,     # إزالة العناصر المهملة والهياكل الزائدة
            deflate=True,   # ضغط مجاري البيانات
            clean=True     # تنظيف بكتيريا الكود والصفحات
        )
        doc.close()

        compressed_bytes = output_buffer.getvalue()
        compressed_size = len(compressed_bytes)

        # في حال لم يقل الحجم نرجع الملف الأصلي
        if compressed_size >= original_size:
            compressed_bytes = file_bytes
            compressed_size = original_size

        saving = calculate_saving(original_size, compressed_size)
        file_id, output_filename = create_output_filename()
        output_path = os.path.join(OUTPUT_FOLDER, output_filename)

        with open(output_path, "wb") as output_file:
            output_file.write(compressed_bytes)

        return jsonify({
            "success": True,
            "filename": original_filename,
            "pages": page_count,
            "original_size": original_size,
            "compressed_size": compressed_size,
            "saving": saving,
            "compression": compression_level,
            "download_url": f"/api/download/{file_id}"
        })

    except Exception as error:
        print("PDF Compression Error:", error)
        return jsonify({"success": False, "error": "تعذر ضغط ملف PDF."}), 500


# ============================================================
# Download Compressed File
# ============================================================

@app.get("/api/download/<file_id>")
def download_compressed_file(file_id):

    if not file_id:
        return jsonify({"success": False, "error": "معرف الملف غير صالح."}), 400

    filename = f"{file_id}.pdf"
    file_path = os.path.join(OUTPUT_FOLDER, filename)

    if not os.path.isfile(file_path):
        return jsonify({"success": False, "error": "الملف غير موجود أو لم يعد متاحًا."}), 404

    try:
        return send_file(
            file_path,
            as_attachment=True,
            download_name="compressed.pdf",
            mimetype="application/pdf"
        )
    except Exception as error:
        print("Download error:", error)
        return jsonify({"success": False, "error": "تعذر إرسال الملف للتحميل."}), 500


# ============================================================
# Error Handlers
# ============================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({"success": False, "error": "المسار المطلوب غير موجود."}), 404


@app.errorhandler(413)
def request_too_large(error):
    return jsonify({"success": False, "error": "حجم الطلب أكبر من الحد المسموح."}), 413


@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({"success": False, "error": "حدث خطأ داخلي في الخادم."}), 500


# ============================================================
# Run Server
# ============================================================

if __name__ == "__main__":
    print("=" * 55)
    print("Tool Hub - PDF Compressor (PyMuPDF Engine)")
    print("Backend server is starting...")
    print("API: http://127.0.0.1:5000")
    print("=" * 55)

    app.run(host="127.0.0.1", port=5000, debug=True)