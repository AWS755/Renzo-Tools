/* =========================================================
   Tool Hub - PDF to Word
   Main JavaScript
========================================================= */

"use strict";


/* =========================================================
   1. DOM Elements
========================================================= */

const fileInput = document.getElementById("fileInput");
const selectFileBtn = document.getElementById("selectFileBtn");
const uploadArea = document.getElementById("uploadArea");

const uploadCard = document.getElementById("uploadCard");
const fileCard = document.getElementById("fileCard");

const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");

const removeFileBtn = document.getElementById("removeFileBtn");

const convertBtn = document.getElementById("convertBtn");
const convertText = document.getElementById("convertText");

const progressCard = document.getElementById("progressCard");
const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");

const resultCard = document.getElementById("resultCard");
const downloadBtn = document.getElementById("downloadBtn");
const newFileBtn = document.getElementById("newFileBtn");

const errorCard = document.getElementById("errorCard");
const errorMessage = document.getElementById("errorMessage");
const retryBtn = document.getElementById("retryBtn");

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

const menuToggle = document.getElementById("menuToggle");
const nav = document.querySelector(".nav");


/* =========================================================
   2. Configuration
========================================================= */

/*
    هذا هو عنوان Backend.

    عندما نشغل Flask محليًا:
    http://127.0.0.1:5000

    Endpoint التحويل:
    /api/convert-pdf-to-word
*/

const API_URL = "https://abdulrahman777.pythonanywhere.com/";


/*
    الحد الأقصى لحجم الملف.

    20 MB
*/

const MAX_FILE_SIZE = 20 * 1024 * 1024;


/*
    الملف الحالي الذي اختاره المستخدم.
*/

let selectedFile = null;


/*
    رابط التحميل السابق.
    نستخدمه حتى لا تتراكم روابط Blob في الذاكرة.
*/

let currentDownloadUrl = null;


/* =========================================================
   3. Helper Functions
========================================================= */


/*
    إظهار عنصر
*/

function showElement(element) {

    if (!element) {
        return;
    }

    element.classList.remove("hidden");
}


/*
    إخفاء عنصر
*/

function hideElement(element) {

    if (!element) {
        return;
    }

    element.classList.add("hidden");
}


/*
    إظهار رسالة خطأ
*/

function showError(message) {

    errorMessage.textContent =
        message || "حدث خطأ غير متوقع.";

    showElement(errorCard);
}


/*
    إخفاء رسالة الخطأ
*/

function hideError() {

    hideElement(errorCard);
}


/*
    تحويل حجم الملف إلى صيغة مفهومة.
*/

function formatFileSize(bytes) {

    if (!bytes || bytes <= 0) {
        return "0 KB";
    }


    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];


    const index = Math.floor(
        Math.log(bytes) / Math.log(1024)
    );


    const size =
        bytes / Math.pow(1024, index);


    return `${size.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}


/*
    التحقق من أن الملف PDF.
*/

function isPDF(file) {

    if (!file) {
        return false;
    }


    const fileNameLower =
        file.name.toLowerCase();


    return (
        file.type === "application/pdf" ||
        fileNameLower.endsWith(".pdf")
    );
}


/* =========================================================
   4. File Selection
========================================================= */


/*
    فتح نافذة اختيار الملفات.

    هذه الطريقة تمنع مشكلة أن الضغط على الزر
    لا يفتح File Picker.
*/

selectFileBtn.addEventListener("click", function (event) {

    event.preventDefault();

    event.stopPropagation();

    fileInput.click();

});


/*
    أيضًا يسمح بالنقر على منطقة الرفع نفسها.
*/

uploadArea.addEventListener("click", function (event) {

    /*
        إذا ضغط المستخدم على الزر نفسه،
        لا نحتاج إلى تشغيل click مرة أخرى.
    */

    if (
        event.target.closest("#selectFileBtn")
    ) {
        return;
    }


    fileInput.click();

});


/*
    عند اختيار ملف من الجهاز.
*/

fileInput.addEventListener("change", function () {

    const file = fileInput.files[0];

    if (!file) {
        return;
    }

    handleSelectedFile(file);

});


/* =========================================================
   5. Handle Selected File
========================================================= */

function handleSelectedFile(file) {

    hideError();


    /*
        التحقق من نوع الملف.
    */

    if (!isPDF(file)) {

        resetFileInput();

        showError(
            "الملف الذي اخترته ليس ملف PDF. يرجى اختيار ملف PDF صالح."
        );

        return;
    }


    /*
        التحقق من حجم الملف.
    */

    if (file.size > MAX_FILE_SIZE) {

        resetFileInput();

        showError(
            "حجم الملف أكبر من 20MB. يرجى اختيار ملف أصغر."
        );

        return;
    }


    /*
        حفظ الملف.
    */

    selectedFile = file;


    /*
        عرض معلومات الملف.
    */

    fileName.textContent =
        file.name;

    fileSize.textContent =
        formatFileSize(file.size);


    /*
        تغيير الواجهة.
    */

    hideElement(uploadCard);

    showElement(fileCard);

    showElement(convertBtn);

    hideElement(resultCard);

    hideElement(progressCard);

}


/* =========================================================
   6. Remove File
========================================================= */

removeFileBtn.addEventListener(
    "click",
    function () {

        resetTool();

    }
);


/* =========================================================
   7. Reset File Input
========================================================= */

function resetFileInput() {

    /*
        إعادة input إلى حالته الأصلية.

        هذه الخطوة مهمة جدًا حتى يستطيع المستخدم
        اختيار نفس الملف مرة أخرى.
    */

    fileInput.value = "";

}


/* =========================================================
   8. Reset Tool
========================================================= */

function resetTool() {

    selectedFile = null;


    resetFileInput();


    /*
        إلغاء رابط التحميل السابق.
    */

    if (currentDownloadUrl) {

        URL.revokeObjectURL(
            currentDownloadUrl
        );

        currentDownloadUrl = null;
    }


    /*
        إعادة العناصر إلى الوضع الأول.
    */

    showElement(uploadCard);

    hideElement(fileCard);

    hideElement(convertBtn);

    hideElement(progressCard);

    hideElement(resultCard);

    hideElement(errorCard);


    /*
        إعادة Progress.
    */

    updateProgress(0);


    /*
        إعادة نص الزر.
    */

    convertText.textContent =
        "تحويل إلى Word";


    /*
        تفعيل الزر.
    */

    convertBtn.disabled = false;

}


/* =========================================================
   9. Drag & Drop
========================================================= */


/*
    منع المتصفح من فتح الملف مباشرة.
*/

[
    "dragenter",
    "dragover",
    "dragleave",
    "drop"
].forEach(function (eventName) {

    uploadArea.addEventListener(
        eventName,
        preventDefaults,
        false
    );

});


function preventDefaults(event) {

    event.preventDefault();

    event.stopPropagation();

}


/*
    إضافة شكل Drag Over.
*/

[
    "dragenter",
    "dragover"
].forEach(function (eventName) {

    uploadArea.addEventListener(
        eventName,
        function () {

            uploadArea.classList.add(
                "drag-over"
            );

        }
    );

});


/*
    إزالة الشكل.
*/

[
    "dragleave",
    "drop"
].forEach(function (eventName) {

    uploadArea.addEventListener(
        eventName,
        function () {

            uploadArea.classList.remove(
                "drag-over"
            );

        }
    );

});


/*
    عند إسقاط الملف.
*/

uploadArea.addEventListener(
    "drop",
    function (event) {

        const files =
            event.dataTransfer.files;


        if (!files || files.length === 0) {
            return;
        }


        handleSelectedFile(
            files[0]
        );

    }
);


/* =========================================================
   10. Progress
========================================================= */

function updateProgress(percent) {

    const safePercent =
        Math.max(
            0,
            Math.min(
                100,
                percent
            )
        );


    progressFill.style.width =
        `${safePercent}%`;


    progressPercent.textContent =
        `${Math.round(safePercent)}%`;

}


/* =========================================================
   11. Start Conversion
========================================================= */

convertBtn.addEventListener(
    "click",
    async function () {

        if (!selectedFile) {

            showError(
                "يرجى اختيار ملف PDF أولًا."
            );

            return;
        }


        await convertPDF();

    }
);


/* =========================================================
   12. Convert PDF
========================================================= */

async function convertPDF() {

    hideError();

    hideElement(resultCard);

    showElement(progressCard);


    /*
        تعطيل الزر أثناء التحويل.
    */

    convertBtn.disabled = true;


    convertText.textContent =
        "جاري التحويل...";


    updateProgress(10);


    /*
        FormData لإرسال الملف.
    */

    const formData =
        new FormData();


    formData.append(
        "file",
        selectedFile
    );


    try {

        updateProgress(20);


        /*
            إرسال الملف إلى Flask.
        */

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",
                    body: formData
                }
            );


        updateProgress(70);


        /*
            إذا كان السيرفر أرسل خطأ.
        */

        if (!response.ok) {

            let message =
                "تعذر تحويل الملف.";

            try {

                const errorData =
                    await response.json();

                if (
                    errorData &&
                    errorData.error
                ) {

                    message =
                        errorData.error;
                }

            } catch (error) {

                /*
                    لا يوجد JSON.
                    نستخدم الرسالة الافتراضية.
                */

            }


            throw new Error(message);

        }


        /*
            استقبال ملف Word.
        */

        const blob =
            await response.blob();


        updateProgress(90);


        /*
            التأكد من وجود ملف فعلي.
        */

        if (!blob || blob.size === 0) {

            throw new Error(
                "الخادم أرجع ملفًا فارغًا."
            );

        }


        /*
            إنشاء رابط تحميل.
        */

        currentDownloadUrl =
            URL.createObjectURL(blob);


        downloadBtn.href =
            currentDownloadUrl;


        /*
            اسم ملف Word.

            نحاول إزالة .pdf
            وإضافة .docx
        */

        const originalName =
            selectedFile.name
                .replace(
                    /\.pdf$/i,
                    ""
                );


        downloadBtn.download =
            `${originalName}.docx`;


        updateProgress(100);


        /*
            إخفاء Progress.
        */

        setTimeout(
            function () {

                hideElement(progressCard);

                hideElement(convertBtn);

                showElement(resultCard);

            },
            300
        );

    } catch (error) {

        console.error(
            "PDF conversion error:",
            error
        );


        hideElement(progressCard);


        /*
            إظهار رسالة مناسبة.
        */

        showError(
            getFriendlyErrorMessage(error)
        );


        /*
            إعادة الزر.
        */

        convertBtn.disabled = false;

        convertText.textContent =
            "تحويل إلى Word";

    }

}


/* =========================================================
   13. Friendly Error Messages
========================================================= */

function getFriendlyErrorMessage(error) {

    if (!error) {

        return (
            "حدث خطأ غير معروف أثناء تحويل الملف."
        );

    }


    const message =
        error.message || "";


    /*
        السيرفر غير متاح.
    */

    if (
        message.includes(
            "Failed to fetch"
        ) ||
        message.includes(
            "NetworkError"
        )
    ) {

        return (
            "تعذر الاتصال بالخادم. تأكد من تشغيل Python Backend ثم حاول مرة أخرى."
        );

    }


    return message ||
        "تعذر تحويل الملف. يرجى المحاولة مرة أخرى.";

}


/* =========================================================
   14. Retry
========================================================= */

retryBtn.addEventListener(
    "click",
    function () {

        hideError();

        if (selectedFile) {

            showElement(convertBtn);

            convertBtn.disabled =
                false;

            convertText.textContent =
                "تحويل إلى Word";

        } else {

            resetTool();

        }

    }
);


/* =========================================================
   15. New File
========================================================= */

newFileBtn.addEventListener(
    "click",
    function () {

        resetTool();

        /*
            نضع المؤشر على زر اختيار الملف.
        */

        setTimeout(
            function () {

                selectFileBtn.focus();

            },
            100
        );

    }
);


/* =========================================================
   16. Dark Mode
========================================================= */


/*
    قراءة الوضع المحفوظ.
*/

const savedTheme =
    localStorage.getItem(
        "toolhub-theme"
    );


/*
    تطبيق الوضع المحفوظ.
*/

if (savedTheme === "dark") {

    document.body.classList.add(
        "dark-mode"
    );

    themeIcon.textContent =
        "🌙";

} else {

    themeIcon.textContent =
        "☀️";

}


/*
    زر تغيير الوضع.
*/

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


        if (isDark) {

            localStorage.setItem(
                "toolhub-theme",
                "dark"
            );

            themeIcon.textContent =
                "🌙";

        } else {

            localStorage.setItem(
                "toolhub-theme",
                "light"
            );

            themeIcon.textContent =
                "☀️";

        }

    }
);


/* =========================================================
   17. Mobile Navigation
========================================================= */

menuToggle.addEventListener(
    "click",
    function () {

        nav.classList.toggle(
            "active"
        );

    }
);


/*
    إغلاق القائمة بعد الضغط على أحد الروابط.
*/

document
    .querySelectorAll(".nav-link")
    .forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                nav.classList.remove(
                    "active"
                );

            }
        );

    });


/* =========================================================
   18. Close Mobile Menu Outside
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        if (
            !nav.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {

            nav.classList.remove(
                "active"
            );

        }

    }
);


/* =========================================================
   19. Prevent Accidental Page Drop
========================================================= */

document.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

    }
);


document.addEventListener(
    "drop",
    function (event) {

        /*
            السماح فقط لمنطقة الرفع
            بالتعامل مع الملفات.
        */

        if (
            !uploadArea.contains(
                event.target
            )
        ) {

            event.preventDefault();

        }

    }
);


/* =========================================================
   20. Initial State
========================================================= */

function initializeTool() {

    hideElement(fileCard);

    hideElement(convertBtn);

    hideElement(progressCard);

    hideElement(resultCard);

    hideElement(errorCard);

    updateProgress(0);

}


/*
    تشغيل التهيئة.
*/

initializeTool();