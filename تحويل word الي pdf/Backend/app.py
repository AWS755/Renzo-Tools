# =========================================================
# Tool Hub - PDF to Word API
# Flask Backend
# =========================================================

import os
import uuid
import shutil
import traceback

from flask import (
    Flask,
    request,
    send_file,
    jsonify
)

from flask_cors import CORS

from pdf2docx import Converter


# =========================================================
# 1. Flask Application
# =========================================================

app = Flask(__name__)


# =========================================================
# 2. Configuration
# =========================================================

# الحد الأقصى لحجم الملف:
# 20 MB

MAX_FILE_SIZE = 20 * 1024 * 1024


app.config["MAX_CONTENT_LENGTH"] = MAX_FILE_SIZE


# =========================================================
# 3. CORS
# =========================================================

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": "*"
        }
    }
)


# =========================================================
# 4. Directories
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    "uploads"
)


OUTPUT_FOLDER = os.path.join(
    BASE_DIR,
    "outputs"
)


# إنشاء المجلدات إذا لم تكن موجودة

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)

os.makedirs(
    OUTPUT_FOLDER,
    exist_ok=True
)


# =========================================================
# 5. Allowed File
# =========================================================

ALLOWED_EXTENSION = ".pdf"


def allowed_file(filename):

    if not filename:
        return False

    return filename.lower().endswith(
        ALLOWED_EXTENSION
    )


# =========================================================
# 6. Health Check
# =========================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "success": True,
        "message": "Tool Hub PDF to Word API is running."
    })


# =========================================================
# 7. PDF → Word
# =========================================================

@app.route(
    "/api/convert-pdf-to-word",
    methods=["POST"]
)
def convert_pdf_to_word():

    input_path = None
    output_path = None

    try:

        # -------------------------------------------------
        # Check File
        # -------------------------------------------------

        if "file" not in request.files:

            return jsonify({
                "success": False,
                "error": "لم يتم إرسال أي ملف."
            }), 400


        file = request.files["file"]


        # -------------------------------------------------
        # Check Filename
        # -------------------------------------------------

        if not file.filename:

            return jsonify({
                "success": False,
                "error": "اسم الملف غير صالح."
            }), 400


        # -------------------------------------------------
        # Check Extension
        # -------------------------------------------------

        if not allowed_file(
            file.filename
        ):

            return jsonify({
                "success": False,
                "error": "يسمح فقط برفع ملفات PDF."
            }), 400


        # -------------------------------------------------
        # Generate Unique ID
        # -------------------------------------------------

        file_id = uuid.uuid4().hex


        # -------------------------------------------------
        # Create Safe Filenames
        # -------------------------------------------------

        input_filename = (
            f"{file_id}.pdf"
        )

        output_filename = (
            f"{file_id}.docx"
        )


        input_path = os.path.join(
            UPLOAD_FOLDER,
            input_filename
        )


        output_path = os.path.join(
            OUTPUT_FOLDER,
            output_filename
        )


        # -------------------------------------------------
        # Save PDF
        # -------------------------------------------------

        file.save(
            input_path
        )


        # -------------------------------------------------
        # Verify File Size
        # -------------------------------------------------

        file_size = os.path.getsize(
            input_path
        )


        if file_size == 0:

            return jsonify({
                "success": False,
                "error": "الملف فارغ."
            }), 400


        if file_size > MAX_FILE_SIZE:

            return jsonify({
                "success": False,
                "error": "حجم الملف أكبر من 20MB."
            }), 413


        # -------------------------------------------------
        # Convert PDF → DOCX
        # -------------------------------------------------

        converter = Converter(
            input_path
        )


        try:

            converter.convert(
                output_path,
                start=0,
                end=None
            )

        finally:

            converter.close()


        # -------------------------------------------------
        # Verify Output
        # -------------------------------------------------

        if not os.path.exists(
            output_path
        ):

            raise RuntimeError(
                "لم يتم إنشاء ملف Word."
            )


        output_size = os.path.getsize(
            output_path
        )


        if output_size == 0:

            raise RuntimeError(
                "ملف Word الناتج فارغ."
            )


        # -------------------------------------------------
        # Send File
        # -------------------------------------------------

        return send_file(
            output_path,
            as_attachment=True,
            download_name="converted.docx",
            mimetype=(
                "application/vnd.openxmlformats-"
                "officedocument.wordprocessingml.document"
            )
        )


    except Exception as error:

        print(
            "\n========== ERROR =========="
        )

        print(
            str(error)
        )

        traceback.print_exc()

        print(
            "===========================\n"
        )


        return jsonify({
            "success": False,
            "error": (
                "تعذر تحويل ملف PDF. "
                "تأكد أن الملف صالح وغير تالف."
            )
        }), 500


    finally:

        # -------------------------------------------------
        # Cleanup Uploaded PDF
        # -------------------------------------------------

        if (
            input_path
            and os.path.exists(input_path)
        ):

            try:

                os.remove(
                    input_path
                )

            except Exception as cleanup_error:

                print(
                    "Upload cleanup error:",
                    cleanup_error
                )


        # -------------------------------------------------
        # Cleanup Output
        # -------------------------------------------------

        if (
            output_path
            and os.path.exists(output_path)
        ):

            try:

                os.remove(
                    output_path
                )

            except Exception as cleanup_error:

                print(
                    "Output cleanup error:",
                    cleanup_error
                )


# =========================================================
# 8. File Too Large
# =========================================================

@app.errorhandler(413)
def file_too_large(error):

    return jsonify({
        "success": False,
        "error": "حجم الملف أكبر من الحد المسموح وهو 20MB."
    }), 413


# =========================================================
# 9. General Error Handler
# =========================================================

@app.errorhandler(500)
def internal_server_error(error):

    return jsonify({
        "success": False,
        "error": "حدث خطأ داخلي في الخادم."
    }), 500


# =========================================================
# 10. Run Server
# =========================================================

if __name__ == "__main__":

    print(
        "\n=========================================="
    )

    print(
        " Tool Hub - PDF to Word API"
    )

    print(
        " Server: http://127.0.0.1:5000"
    )

    print(
        " Endpoint:"
    )

    print(
        " POST /api/convert-pdf-to-word"
    )

    print(
        "==========================================\n"
    )


    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )