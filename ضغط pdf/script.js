"use strict";

/* =========================================================
   Tool Hub - PDF Compressor
   script.js
========================================================= */


/* =========================================================
   Configuration
========================================================= */

const API_BASE_URL = "https://cairo1455.pythonanywhere.com";

const COMPRESS_API_URL =
    `${API_BASE_URL}/api/compress-pdf`;

const MAX_FILE_SIZE =
    50 * 1024 * 1024;


/* =========================================================
   Application State
========================================================= */

let selectedFile = null;

let downloadUrl = null;


/* =========================================================
   DOM Elements
========================================================= */

const uploadArea =
    document.getElementById("uploadArea");

const pdfInput =
    document.getElementById("pdfInput");

const chooseBtn =
    document.getElementById("chooseBtn");

const removeBtn =
    document.getElementById("removeBtn");

const anotherBtn =
    document.getElementById("anotherBtn");

const fileInfo =
    document.getElementById("fileInfo");

const settings =
    document.getElementById("settings");

const loading =
    document.getElementById("loading");

const result =
    document.getElementById("result");

const compressBtn =
    document.getElementById("compressBtn");

const downloadBtn =
    document.getElementById("downloadBtn");

const themeToggle =
    document.getElementById("themeToggle");

const menuToggle =
    document.getElementById("menuToggle");


/* =========================================================
   File Information Elements
========================================================= */

const fileName =
    document.getElementById("fileName");

const originalSize =
    document.getElementById("originalSize");


/* =========================================================
   Result Elements
========================================================= */

const resultOriginal =
    document.getElementById("resultOriginal");

const resultCompressed =
    document.getElementById("resultCompressed");

const savingPercent =
    document.getElementById("savingPercent");


/* =========================================================
   Utility - Show Element
========================================================= */

function show(element) {

    if (!element) {
        return;
    }

    element.hidden = false;

    element.style.display = "";

}


/* =========================================================
   Utility - Hide Element
========================================================= */

function hide(element) {

    if (!element) {
        return;
    }

    element.hidden = true;

    element.style.display = "none";

}


/* =========================================================
   Utility - Format File Size
========================================================= */

function formatFileSize(bytes) {

    if (
        typeof bytes !== "number" ||
        !Number.isFinite(bytes) ||
        bytes <= 0
    ) {
        return "0 Bytes";
    }


    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];


    const index = Math.min(
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        ),
        units.length - 1
    );


    const size =
        bytes /
        Math.pow(1024, index);


    return (
        size.toFixed(
            index === 0 ? 0 : 2
        )
        +
        " "
        +
        units[index]
    );

}


/* =========================================================
   Utility - Show Error
========================================================= */

function showError(message) {

    clearError();


    const errorBox =
        document.createElement("div");


    errorBox.className =
        "tool-error";


    errorBox.setAttribute(
        "role",
        "alert"
    );


    errorBox.innerHTML = `
        <div class="tool-error-content">

            <span class="tool-error-icon">
                ⚠️
            </span>

            <div>

                <strong>
                    حدث خطأ
                </strong>

                <p>
                    ${escapeHTML(message)}
                </p>

            </div>

        </div>
    `;


    const toolCard =
        document.querySelector(
            ".tool-card"
        );


    if (toolCard) {

        toolCard.prepend(
            errorBox
        );

    } else if (
        uploadArea &&
        uploadArea.parentElement
    ) {

        uploadArea.parentElement.prepend(
            errorBox
        );

    }

}


/* =========================================================
   Utility - Clear Error
========================================================= */

function clearError() {

    const errorBox =
        document.querySelector(
            ".tool-error"
        );


    if (errorBox) {
        errorBox.remove();
    }

}


/* =========================================================
   Utility - Escape HTML
========================================================= */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   Initial State
========================================================= */

function initializeTool() {

    selectedFile = null;

    downloadUrl = null;


    /*
     * تنظيف input بالكامل.
     * هذا يمنع ظهور ملف قديم أو فارغ.
     */

    if (pdfInput) {
        pdfInput.value = "";
    }


    /*
     * إخفاء جميع المراحل التي لا يجب
     * أن تظهر قبل اختيار الملف.
     */

    hide(fileInfo);

    hide(settings);

    hide(loading);

    hide(result);


    /*
     * إظهار منطقة رفع الملف.
     */

    if (uploadArea) {

        uploadArea.hidden = false;

        uploadArea.style.display = "";

        uploadArea.classList.remove(
            "drag-over",
            "dragging",
            "hidden"
        );

    }


    /*
     * إعادة زر الضغط لحالته الطبيعية.
     */

    if (compressBtn) {

        compressBtn.disabled = false;

    }


    /*
     * تنظيف بيانات النتيجة.
     */

    if (fileName) {
        fileName.textContent = "PDF";
    }

    if (originalSize) {
        originalSize.textContent = "-";
    }

    if (resultOriginal) {
        resultOriginal.textContent = "-";
    }

    if (resultCompressed) {
        resultCompressed.textContent = "-";
    }

    if (savingPercent) {
        savingPercent.textContent = "-";
    }


    clearError();


    console.log(
        "PDF Compressor initialized with no file."
    );

}


/* =========================================================
   Choose PDF Button
========================================================= */

if (
    chooseBtn &&
    pdfInput
) {

    chooseBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            /*
             * تنظيف القيمة قبل فتح النافذة.
             * يسمح أيضًا باختيار نفس الملف مرة أخرى.
             */

            pdfInput.value = "";


            console.log(
                "Opening PDF file picker..."
            );


            pdfInput.click();

        }
    );

}


/* =========================================================
   Upload Area Click
========================================================= */

if (
    uploadArea &&
    pdfInput
) {

    uploadArea.addEventListener(
        "click",
        function (event) {

            /*
             * إذا كان الضغط على زر اختيار الملف
             * فلا نفتح النافذة مرة ثانية.
             */

            if (
                event.target.closest(
                    "#chooseBtn"
                )
            ) {

                return;

            }


            /*
             * لا نفتح نافذة اختيار الملف إذا
             * تم الضغط على عنصر آخر داخل المنطقة
             * لا يمثل زر الاختيار.
             */

            if (
                event.target.closest(
                    "button, a, input"
                )
            ) {

                return;

            }


            pdfInput.value = "";

            pdfInput.click();

        }
    );

}


/* =========================================================
   PDF Input Change
========================================================= */

if (pdfInput) {

    pdfInput.addEventListener(
        "change",
        function () {

            if (
                !pdfInput.files ||
                pdfInput.files.length === 0
            ) {

                return;

            }


            const file =
                pdfInput.files[0];


            console.log(
                "Selected PDF:",
                file.name
            );


            handleSelectedFile(
                file
            );

        }
    );

}


/* =========================================================
   Handle Selected File
========================================================= */

function handleSelectedFile(file) {

    clearError();


    if (!file) {
        return;
    }


    /* -------------------------------------------------------
       Check PDF
    ------------------------------------------------------- */

    const isPDF =
        file.type === "application/pdf" ||
        file.name
            .toLowerCase()
            .endsWith(".pdf");


    if (!isPDF) {

        showError(
            "يرجى اختيار ملف PDF فقط."
        );

        resetFileInput();

        return;

    }


    /* -------------------------------------------------------
       Check File Size
    ------------------------------------------------------- */

    if (
        file.size >
        MAX_FILE_SIZE
    ) {

        showError(
            "حجم الملف أكبر من 50MB."
        );

        resetFileInput();

        return;

    }


    /* -------------------------------------------------------
       Save Selected File
    ------------------------------------------------------- */

    selectedFile =
        file;


    downloadUrl =
        null;


    /* -------------------------------------------------------
       File Name
    ------------------------------------------------------- */

    if (fileName) {

        fileName.textContent =
            file.name;

    }


    /* -------------------------------------------------------
       File Size
    ------------------------------------------------------- */

    if (originalSize) {

        originalSize.textContent =
            formatFileSize(
                file.size
            );

    }


    /* -------------------------------------------------------
       UI
    ------------------------------------------------------- */

    if (uploadArea) {

        uploadArea.hidden = true;

        uploadArea.style.display = "none";

    }


    show(fileInfo);

    show(settings);


    hide(loading);

    hide(result);


    if (compressBtn) {

        compressBtn.disabled = false;

    }


    console.log(
        "PDF is ready for compression."
    );

}


/* =========================================================
   Remove PDF
========================================================= */

if (removeBtn) {

    removeBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            resetTool();

        }
    );

}


/* =========================================================
   Compress PDF
========================================================= */

if (compressBtn) {

    compressBtn.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();


            clearError();


            if (!selectedFile) {

                showError(
                    "يرجى اختيار ملف PDF أولًا."
                );

                return;

            }


            await compressPDF();

        }
    );

}


/* =========================================================
   Compress PDF Function
========================================================= */

async function compressPDF() {

    if (!selectedFile) {

        showError(
            "يرجى اختيار ملف PDF أولًا."
        );

        return;

    }


    /*
     * الحصول على مستوى الضغط.
     * HTML الحالي يستخدم radio inputs
     * باسم compression.
     */

    const selectedCompression =
        document.querySelector(
            'input[name="compression"]:checked'
        );


    const compression =
        selectedCompression
            ? selectedCompression.value
            : "recommended";


    console.log(
        "Compression:",
        compression
    );


    /* -------------------------------------------------------
       Loading State
    ------------------------------------------------------- */

    hide(fileInfo);

    hide(settings);

    hide(result);

    show(loading);


    if (compressBtn) {

        compressBtn.disabled = true;

    }


    clearError();


    /* -------------------------------------------------------
       Form Data
    ------------------------------------------------------- */

    const formData =
        new FormData();


    formData.append(
        "file",
        selectedFile
    );


    formData.append(
        "compression",
        compression
    );


    try {

        console.log(
            "Sending PDF to Python..."
        );


        /* ---------------------------------------------------
           Send Request
        --------------------------------------------------- */

        const response =
            await fetch(
                COMPRESS_API_URL,
                {
                    method: "POST",
                    body: formData
                }
            );


        console.log(
            "Server status:",
            response.status
        );


        /* ---------------------------------------------------
           Read Response
        --------------------------------------------------- */

        let data;


        try {

            data =
                await response.json();

        } catch (error) {

            throw new Error(
                "الخادم أعاد استجابة غير صالحة."
            );

        }


        console.log(
            "Server response:",
            data
        );


        /* ---------------------------------------------------
           Check Response
        --------------------------------------------------- */

        if (!response.ok) {

            throw new Error(
                data.error ||
                "تعذر ضغط ملف PDF."
            );

        }


        if (!data.success) {

            throw new Error(
                data.error ||
                "تعذر ضغط ملف PDF."
            );

        }


        /* ---------------------------------------------------
           Display Result
        --------------------------------------------------- */

        displayResult(
            data
        );

    } catch (error) {

        console.error(
            "PDF compression error:",
            error
        );


        hide(loading);

        show(settings);


        if (compressBtn) {

            compressBtn.disabled =
                false;

        }


        /*
         * مشكلة الاتصال بالخادم.
         */

        if (
            error instanceof TypeError
        ) {

            showError(
                "تعذر الاتصال بخادم Python. تأكد من تشغيل http://127.0.0.1:5000"
            );

        } else {

            showError(
                error.message ||
                "تعذر ضغط ملف PDF حاليًا."
            );

        }

    }

}


/* =========================================================
   Display Result
========================================================= */

function displayResult(data) {

    hide(loading);

    hide(settings);

    hide(fileInfo);

    show(result);


    /* -------------------------------------------------------
       Original Size
    ------------------------------------------------------- */

    if (resultOriginal) {

        resultOriginal.textContent =
            formatFileSize(
                Number(
                    data.original_size
                )
            );

    }


    /* -------------------------------------------------------
       Compressed Size
    ------------------------------------------------------- */

    if (resultCompressed) {

        resultCompressed.textContent =
            formatFileSize(
                Number(
                    data.compressed_size
                )
            );

    }


    /* -------------------------------------------------------
       Saving Percentage
    ------------------------------------------------------- */

    if (savingPercent) {

        const saving =
            Number(
                data.saving
            );


        if (
            Number.isFinite(saving)
        ) {

            savingPercent.textContent =
                `${saving}%`;

        } else {

            savingPercent.textContent =
                "-";

        }

    }


    /* -------------------------------------------------------
       Download URL
    ------------------------------------------------------- */

    if (
        data.download_url &&
        typeof data.download_url === "string"
    ) {

        if (
            data.download_url.startsWith(
                "http://"
            ) ||
            data.download_url.startsWith(
                "https://"
            )
        ) {

            downloadUrl =
                data.download_url;

        } else {

            downloadUrl =
                API_BASE_URL +
                data.download_url;

        }

    } else {

        downloadUrl =
            null;

    }


    console.log(
        "Compression completed."
    );


    console.log(
        "Download URL:",
        downloadUrl
    );

}


/* =========================================================
   Download Button
========================================================= */

if (downloadBtn) {

    downloadBtn.addEventListener(
        "click",
        function (event) {

            if (!downloadUrl) {

                event.preventDefault();


                showError(
                    "ملف PDF المضغوط غير متوفر."
                );


                return;

            }


            /*
             * ضع الرابط النهائي في الزر.
             */

            downloadBtn.href =
                downloadUrl;


            /*
             * اسم الملف.
             */

            downloadBtn.download =
                createDownloadName();


            console.log(
                "Downloading:",
                downloadUrl
            );

        }
    );

}


/* =========================================================
   Another PDF
========================================================= */

if (anotherBtn) {

    anotherBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            resetTool();

        }
    );

}


/* =========================================================
   Reset Tool
========================================================= */

function resetTool() {

    selectedFile =
        null;


    downloadUrl =
        null;


    /*
     * تنظيف input.
     */

    resetFileInput();


    /*
     * إعادة الواجهة.
     */

    hide(fileInfo);

    hide(settings);

    hide(loading);

    hide(result);


    if (uploadArea) {

        uploadArea.hidden =
            false;

        uploadArea.style.display =
            "";

        uploadArea.classList.remove(
            "drag-over",
            "dragging",
            "hidden"
        );

    }


    if (compressBtn) {

        compressBtn.disabled =
            false;

    }


    /*
     * تنظيف البيانات.
     */

    if (fileName) {

        fileName.textContent =
            "PDF";

    }


    if (originalSize) {

        originalSize.textContent =
            "-";

    }


    if (resultOriginal) {

        resultOriginal.textContent =
            "-";

    }


    if (resultCompressed) {

        resultCompressed.textContent =
            "-";

    }


    if (savingPercent) {

        savingPercent.textContent =
            "-";

    }


    clearError();


    console.log(
        "PDF Compressor reset."
    );

}


/* =========================================================
   Reset File Input
========================================================= */

function resetFileInput() {

    if (!pdfInput) {
        return;
    }


    pdfInput.value =
        "";


    /*
     * بعض المتصفحات تتعامل بشكل مختلف
     * مع input[type=file].
     * إعادة إنشاء القيمة الفارغة تضمن
     * عدم الاحتفاظ بالملف السابق.
     */

    try {

        const dataTransfer =
            new DataTransfer();


        pdfInput.files =
            dataTransfer.files;

    } catch (error) {

        /*
         * ليس ضروريًا أن يدعم المتصفح
         * DataTransfer لتعمل الأداة.
         */

        console.log(
            "File input cleared."
        );

    }

}


/* =========================================================
   Create Download Name
========================================================= */

function createDownloadName() {

    if (!selectedFile) {

        return "compressed.pdf";

    }


    const originalName =
        selectedFile.name;


    if (
        originalName
            .toLowerCase()
            .endsWith(".pdf")
    ) {

        return (
            originalName.slice(
                0,
                -4
            )
            +
            "-compressed.pdf"
        );

    }


    return "compressed.pdf";

}


/* =========================================================
   Dark Mode
========================================================= */

if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        function () {

            document.body.classList.toggle(
                "dark-mode"
            );


            const isDark =
                document.body.classList.contains(
                    "dark-mode"
                );


            localStorage.setItem(
                "toolhub-dark-mode",
                isDark
                    ? "enabled"
                    : "disabled"
            );


            updateThemeIcon(
                isDark
            );

        }
    );

}


/* =========================================================
   Load Theme
========================================================= */

const savedTheme =
    localStorage.getItem(
        "toolhub-dark-mode"
    );


if (
    savedTheme ===
    "enabled"
) {

    document.body.classList.add(
        "dark-mode"
    );


    updateThemeIcon(
        true
    );

}


/* =========================================================
   Theme Icon
========================================================= */

function updateThemeIcon(isDark) {

    if (!themeToggle) {
        return;
    }


    themeToggle.textContent =
        isDark
            ? "☀️"
            : "🌙";


    themeToggle.setAttribute(
        "aria-label",
        isDark
            ? "تفعيل الوضع النهاري"
            : "تفعيل الوضع الليلي"
    );

}


/* =========================================================
   Mobile Menu
========================================================= */

if (menuToggle) {

    menuToggle.addEventListener(
        "click",
        function () {

            const navigation =
                document.querySelector(
                    ".main-nav"
                );


            if (!navigation) {
                return;
            }


            navigation.classList.toggle(
                "mobile-open"
            );

        }
    );

}


/* =========================================================
   Drag & Drop
========================================================= */

if (uploadArea) {

    uploadArea.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

            uploadArea.classList.add(
                "drag-over"
            );

        }
    );


    uploadArea.addEventListener(
        "dragleave",
        function () {

            uploadArea.classList.remove(
                "drag-over"
            );

        }
    );


    uploadArea.addEventListener(
        "drop",
        function (event) {

            event.preventDefault();


            uploadArea.classList.remove(
                "drag-over"
            );


            const files =
                event.dataTransfer.files;


            if (
                !files ||
                files.length === 0
            ) {

                return;

            }


            handleSelectedFile(
                files[0]
            );

        }
    );

}


/* =========================================================
   Prevent Browser Default File Drop
========================================================= */

window.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

    }
);


window.addEventListener(
    "drop",
    function (event) {

        /*
         * لا تمنع drop داخل uploadArea.
         */

        if (
            uploadArea &&
            uploadArea.contains(
                event.target
            )
        ) {

            return;

        }


        event.preventDefault();

    }
);


/* =========================================================
   Initialize
========================================================= */

initializeTool();


console.log(
    "Tool Hub PDF Compressor is ready."
);