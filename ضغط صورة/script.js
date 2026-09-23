// ========================================
// Tool Hub
// Image Compressor
// ========================================


// ========================================
// Elements
// ========================================

const uploadArea =
    document.getElementById("uploadArea");

const imageInput =
    document.getElementById("imageInput");

const chooseBtn =
    document.getElementById("chooseBtn");

const removeBtn =
    document.getElementById("removeBtn");

const anotherBtn =
    document.getElementById("anotherBtn");

const imageInfo =
    document.getElementById("imageInfo");

const settings =
    document.getElementById("settings");

const loading =
    document.getElementById("loading");

const result =
    document.getElementById("result");

const compressBtn =
    document.getElementById("compressBtn");

const quality =
    document.getElementById("quality");

const qualityValue =
    document.getElementById("qualityValue");

const format =
    document.getElementById("format");

const fileName =
    document.getElementById("fileName");

const originalSize =
    document.getElementById("originalSize");

const resultOriginal =
    document.getElementById("resultOriginal");

const resultCompressed =
    document.getElementById("resultCompressed");

const savingPercent =
    document.getElementById("savingPercent");

const previewImage =
    document.getElementById("previewImage");

const downloadBtn =
    document.getElementById("downloadBtn");

const themeToggle =
    document.getElementById("themeToggle");


// ========================================
// Variables
// ========================================

let selectedFile = null;

let compressedBlob = null;

let compressedUrl = null;


// ========================================
// Constants
// ========================================

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

const MAX_FILE_SIZE =
    20 * 1024 * 1024;


// ========================================
// Initialize Tool
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        resetTool();

        initializeTheme();

    }
);


// ========================================
// Choose Image
// ========================================

chooseBtn.addEventListener(
    "click",
    function () {

        imageInput.click();

    }
);


// ========================================
// Input Change
// ========================================

imageInput.addEventListener(
    "change",
    function () {

        const file =
            imageInput.files[0];

        if (!file) {
            return;
        }

        handleFile(file);

    }
);


// ========================================
// Handle Selected File
// ========================================

function handleFile(file) {

    // ------------------------------------
    // Check File Type
    // ------------------------------------

    if (!ALLOWED_TYPES.includes(file.type)) {

        showError(
            "نوع الملف غير مدعوم. يرجى اختيار JPG أو PNG أو WebP."
        );

        resetFileInput();

        return;
    }


    // ------------------------------------
    // Check File Size
    // ------------------------------------

    if (file.size > MAX_FILE_SIZE) {

        showError(
            "حجم الصورة كبير جدًا. الحد الأقصى المسموح به هو 20MB."
        );

        resetFileInput();

        return;
    }


    // ------------------------------------
    // Store File
    // ------------------------------------

    selectedFile = file;


    // ------------------------------------
    // Update Information
    // ------------------------------------

    fileName.textContent =
        file.name;


    originalSize.textContent =
        formatBytes(file.size);


    // ------------------------------------
    // Reset Previous Result
    // ------------------------------------

    clearPreviousResult();


    // ------------------------------------
    // Update Interface
    // ------------------------------------

    uploadArea.hidden = true;

    imageInfo.hidden = false;

    settings.hidden = false;

    loading.hidden = true;

    result.hidden = true;


    // ------------------------------------
    // Scroll To Settings
    // ------------------------------------

    setTimeout(
        function () {

            settings.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });

        },
        100
    );

}


// ========================================
// Remove Selected Image
// ========================================

removeBtn.addEventListener(
    "click",
    resetTool
);


// ========================================
// Another Image
// ========================================

anotherBtn.addEventListener(
    "click",
    resetTool
);


// ========================================
// Quality Slider
// ========================================

quality.addEventListener(
    "input",
    function () {

        qualityValue.textContent =
            `${quality.value}%`;

    }
);


// ========================================
// Drag & Drop
// ========================================

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


        if (!files || !files.length) {
            return;
        }


        handleFile(files[0]);

    }
);


// ========================================
// Prevent Browser From Opening Dropped File
// ========================================

document.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

    }
);


document.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();

    }
);


// ========================================
// Compress Image
// ========================================

compressBtn.addEventListener(
    "click",
    async function () {

        // --------------------------------
        // Check Selected File
        // --------------------------------

        if (!selectedFile) {

            showError(
                "يرجى اختيار صورة أولًا."
            );

            return;
        }


        // --------------------------------
        // Prepare UI
        // --------------------------------

        compressBtn.disabled = true;

        settings.hidden = true;

        result.hidden = true;

        loading.hidden = false;


        try {

            // --------------------------------
            // Compress
            // --------------------------------

            const blob =
                await compressImage(
                    selectedFile,
                    Number(quality.value) / 100,
                    format.value
                );


            // --------------------------------
            // Validate Result
            // --------------------------------

            if (!blob || blob.size === 0) {

                throw new Error(
                    "تعذر إنشاء الصورة المضغوطة."
                );

            }


            compressedBlob = blob;


            // --------------------------------
            // Release Old URL
            // --------------------------------

            revokeCompressedUrl();


            // --------------------------------
            // Create New URL
            // --------------------------------

            compressedUrl =
                URL.createObjectURL(
                    compressedBlob
                );


            // --------------------------------
            // Calculate Statistics
            // --------------------------------

            const originalBytes =
                selectedFile.size;

            const compressedBytes =
                compressedBlob.size;


            const saving =
                calculateSaving(
                    originalBytes,
                    compressedBytes
                );


            // --------------------------------
            // Update Result
            // --------------------------------

            resultOriginal.textContent =
                formatBytes(
                    originalBytes
                );


            resultCompressed.textContent =
                formatBytes(
                    compressedBytes
                );


            savingPercent.textContent =
                `${saving}%`;


            // --------------------------------
            // Preview
            // --------------------------------

            previewImage.src =
                compressedUrl;


            // --------------------------------
            // Download
            // --------------------------------

            downloadBtn.href =
                compressedUrl;


            downloadBtn.download =
                createDownloadName(
                    selectedFile.name,
                    format.value
                );


            // --------------------------------
            // Show Result
            // --------------------------------

            loading.hidden = true;

            result.hidden = false;


            // --------------------------------
            // Scroll To Result
            // --------------------------------

            setTimeout(
                function () {

                    result.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                },
                100
            );


        } catch (error) {

            console.error(
                "Image compression error:",
                error
            );


            loading.hidden = true;

            settings.hidden = false;


            showError(
                "حدث خطأ أثناء ضغط الصورة. حاول مرة أخرى."
            );


        } finally {

            compressBtn.disabled = false;

        }

    }
);


// ========================================
// Compress Function
// ========================================

function compressImage(
    file,
    imageQuality,
    outputType
) {

    return new Promise(
        function (resolve, reject) {

            const image =
                new Image();

            const reader =
                new FileReader();


            // --------------------------------
            // Reader Error
            // --------------------------------

            reader.onerror =
                function () {

                    reject(
                        new Error(
                            "تعذر قراءة الصورة."
                        )
                    );

                };


            // --------------------------------
            // File Loaded
            // --------------------------------

            reader.onload =
                function (event) {

                    image.src =
                        event.target.result;

                };


            // --------------------------------
            // Image Error
            // --------------------------------

            image.onerror =
                function () {

                    reject(
                        new Error(
                            "تعذر تحميل الصورة."
                        )
                    );

                };


            // --------------------------------
            // Image Loaded
            // --------------------------------

            image.onload =
                function () {

                    try {

                        const canvas =
                            document.createElement(
                                "canvas"
                            );


                        const context =
                            canvas.getContext(
                                "2d"
                            );


                        if (!context) {

                            reject(
                                new Error(
                                    "المتصفح لا يدعم Canvas."
                                )
                            );

                            return;

                        }


                        // --------------------------------
                        // Canvas Size
                        // --------------------------------

                        canvas.width =
                            image.naturalWidth;

                        canvas.height =
                            image.naturalHeight;


                        // --------------------------------
                        // Improve Image Rendering
                        // --------------------------------

                        context.imageSmoothingEnabled =
                            true;

                        context.imageSmoothingQuality =
                            "high";


                        // --------------------------------
                        // Draw Image
                        // --------------------------------

                        context.drawImage(
                            image,
                            0,
                            0
                        );


                        // --------------------------------
                        // Convert To Blob
                        // --------------------------------

                        canvas.toBlob(
                            function (blob) {

                                if (!blob) {

                                    reject(
                                        new Error(
                                            "تعذر إنشاء الصورة المضغوطة."
                                        )
                                    );

                                    return;
                                }


                                resolve(blob);

                            },
                            outputType,
                            imageQuality
                        );


                    } catch (error) {

                        reject(error);

                    }

                };


            // --------------------------------
            // Read File
            // --------------------------------

            reader.readAsDataURL(file);

        }
    );

}


// ========================================
// Calculate Saving
// ========================================

function calculateSaving(
    original,
    compressed
) {

    if (
        !original ||
        original <= 0
    ) {

        return "0.0";

    }


    const saving =
        (
            1 -
            compressed / original
        ) * 100;


    return Math.max(
        0,
        saving
    ).toFixed(1);

}


// ========================================
// Format Bytes
// ========================================

function formatBytes(bytes) {

    if (!bytes || bytes === 0) {

        return "0 Bytes";

    }


    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    const safeIndex =
        Math.min(
            index,
            units.length - 1
        );


    const value =
        bytes /
        Math.pow(
            1024,
            safeIndex
        );


    return (
        parseFloat(
            value.toFixed(2)
        )
        +
        " "
        +
        units[safeIndex]
    );

}


// ========================================
// Create Download Name
// ========================================

function createDownloadName(
    originalName,
    outputType
) {

    const baseName =
        originalName
            .replace(
                /\.[^/.]+$/,
                ""
            );


    let extension =
        "jpg";


    switch (outputType) {

        case "image/webp":

            extension = "webp";

            break;


        case "image/png":

            extension = "png";

            break;


        case "image/jpeg":

        default:

            extension = "jpg";

            break;

    }


    return (
        `${baseName}-compressed.${extension}`
    );

}


// ========================================
// Clear Previous Result
// ========================================

function clearPreviousResult() {

    compressedBlob = null;

    revokeCompressedUrl();


    previewImage.src = "";

    downloadBtn.href = "#";

    downloadBtn.removeAttribute(
        "download"
    );


    resultOriginal.textContent =
        "-";

    resultCompressed.textContent =
        "-";

    savingPercent.textContent =
        "-";

}


// ========================================
// Revoke Compressed URL
// ========================================

function revokeCompressedUrl() {

    if (!compressedUrl) {
        return;
    }


    URL.revokeObjectURL(
        compressedUrl
    );


    compressedUrl = null;

}


// ========================================
// Reset File Input
// ========================================

function resetFileInput() {

    imageInput.value = "";

}


// ========================================
// Reset Tool
// ========================================

function resetTool() {

    // ------------------------------------
    // Clear Variables
    // ------------------------------------

    selectedFile = null;

    compressedBlob = null;


    // ------------------------------------
    // Release Memory
    // ------------------------------------

    revokeCompressedUrl();


    // ------------------------------------
    // Reset Input
    // ------------------------------------

    resetFileInput();


    // ------------------------------------
    // Reset Text
    // ------------------------------------

    fileName.textContent =
        "image.jpg";


    originalSize.textContent =
        "-";


    resultOriginal.textContent =
        "-";


    resultCompressed.textContent =
        "-";


    savingPercent.textContent =
        "-";


    // ------------------------------------
    // Reset Preview
    // ------------------------------------

    previewImage.src = "";

    downloadBtn.href = "#";

    downloadBtn.removeAttribute(
        "download"
    );


    // ------------------------------------
    // Reset Settings
    // ------------------------------------

    quality.value = 80;

    qualityValue.textContent =
        "80%";


    format.value =
        "image/jpeg";


    // ------------------------------------
    // Reset Loading
    // ------------------------------------

    loading.hidden = true;


    // ------------------------------------
    // Reset Sections
    // ------------------------------------

    uploadArea.hidden = false;

    imageInfo.hidden = true;

    settings.hidden = true;

    result.hidden = true;


    // ------------------------------------
    // Reset Button
    // ------------------------------------

    compressBtn.disabled = false;


    // ------------------------------------
    // Remove Drag State
    // ------------------------------------

    uploadArea.classList.remove(
        "drag-over"
    );

}


// ========================================
// Error Message
// ========================================

function showError(message) {

    alert(message);

}


// ========================================
// Theme
// ========================================

function initializeTheme() {

    if (!themeToggle) {
        return;
    }


    const savedTheme =
        localStorage.getItem(
            "toolhub-theme"
        );


    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark-mode"
        );

        themeToggle.textContent =
            "☀️";

        themeToggle.setAttribute(
            "aria-label",
            "تفعيل الوضع النهاري"
        );

    }

}


// ========================================
// Theme Toggle
// ========================================

if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        function () {

            const isDark =
                document.body.classList.toggle(
                    "dark-mode"
                );


            if (isDark) {

                themeToggle.textContent =
                    "☀️";

                themeToggle.setAttribute(
                    "aria-label",
                    "تفعيل الوضع النهاري"
                );


                localStorage.setItem(
                    "toolhub-theme",
                    "dark"
                );

            } else {

                themeToggle.textContent =
                    "🌙";

                themeToggle.setAttribute(
                    "aria-label",
                    "تفعيل الوضع الليلي"
                );


                localStorage.setItem(
                    "toolhub-theme",
                    "light"
                );

            }

        }
    );

}


// ========================================
// Cleanup Before Leaving Page
// ========================================

window.addEventListener(
    "beforeunload",
    function () {

        revokeCompressedUrl();

    }
);