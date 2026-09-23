/* ========================================
   Tool Hub
   Image Resizer
======================================== */


/* ========================================
   Elements
======================================== */

const imageInput = document.getElementById("imageInput");

const uploadArea = document.getElementById("uploadArea");

const imageInfo = document.getElementById("imageInfo");

const imagePreview = document.getElementById("imagePreview");

const originalDimensions =
    document.getElementById("originalDimensions");

const imageType =
    document.getElementById("imageType");

const imageSize =
    document.getElementById("imageSize");

const removeImage =
    document.getElementById("removeImage");

const resizeSettings =
    document.getElementById("resizeSettings");

const widthInput =
    document.getElementById("widthInput");

const heightInput =
    document.getElementById("heightInput");

const aspectRatio =
    document.getElementById("aspectRatio");

const ratioInfo =
    document.getElementById("ratioInfo");

const qualityInput =
    document.getElementById("qualityInput");

const qualityValue =
    document.getElementById("qualityValue");

const formatSelect =
    document.getElementById("formatSelect");

const resizeButton =
    document.getElementById("resizeButton");

const resultSection =
    document.getElementById("resultSection");

const resultImage =
    document.getElementById("resultImage");

const resultDimensions =
    document.getElementById("resultDimensions");

const resultSize =
    document.getElementById("resultSize");

const resultFormat =
    document.getElementById("resultFormat");

const downloadButton =
    document.getElementById("downloadButton");

const newImageButton =
    document.getElementById("newImageButton");

const themeToggle =
    document.getElementById("themeToggle");


/* ========================================
   Variables
======================================== */

let currentImage = null;

let originalWidth = 0;

let originalHeight = 0;

let originalAspectRatio = 1;

let resultURL = null;


/* ========================================
   Image Selection
======================================== */

imageInput.addEventListener(
    "change",
    function () {

        const file = this.files[0];

        if (!file) {
            return;
        }

        handleImage(file);

    }
);


/* ========================================
   Handle Image
======================================== */

function handleImage(file) {

    /* ------------------------------------
       Check file type
    ------------------------------------ */

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (!allowedTypes.includes(file.type)) {

        alert(
            "يرجى اختيار صورة بصيغة JPG أو PNG أو WebP."
        );

        imageInput.value = "";

        return;
    }


    /* ------------------------------------
       Check file size
    ------------------------------------ */

    const maxSize = 25 * 1024 * 1024;


    if (file.size > maxSize) {

        alert(
            "حجم الصورة كبير جدًا. الحد الأقصى هو 25MB."
        );

        imageInput.value = "";

        return;
    }


    /* ------------------------------------
       Create image URL
    ------------------------------------ */

    const imageURL =
        URL.createObjectURL(file);


    const img = new Image();


    img.onload = function () {

        currentImage = {
            file: file,
            url: imageURL,
            image: img
        };


        originalWidth = img.naturalWidth;

        originalHeight = img.naturalHeight;


        originalAspectRatio =
            originalWidth / originalHeight;


        /* --------------------------------
           Preview
        -------------------------------- */

        imagePreview.src = imageURL;


        /* --------------------------------
           Information
        -------------------------------- */

        originalDimensions.textContent =
            `${originalWidth} × ${originalHeight}`;


        imageType.textContent =
            getFormatName(file.type);


        imageSize.textContent =
            formatFileSize(file.size);


        /* --------------------------------
           Set dimensions
        -------------------------------- */

        widthInput.value =
            originalWidth;


        heightInput.value =
            originalHeight;


        ratioInfo.textContent =
            `النسبة ${originalAspectRatio.toFixed(2)}:1`;


        /* --------------------------------
           Show settings
        -------------------------------- */

        imageInfo.hidden = false;

        resizeSettings.hidden = false;


        /* --------------------------------
           Hide old result
        -------------------------------- */

        resultSection.hidden = true;


        /* --------------------------------
           Scroll to settings
        -------------------------------- */

        setTimeout(() => {

            resizeSettings.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 150);

    };


    img.onerror = function () {

        URL.revokeObjectURL(imageURL);

        alert(
            "حدث خطأ أثناء قراءة الصورة."
        );

    };


    img.src = imageURL;
}


/* ========================================
   Width Change
======================================== */

widthInput.addEventListener(
    "input",
    function () {

        if (!aspectRatio.checked) {
            return;
        }


        const newWidth =
            parseInt(this.value);


        if (!newWidth || newWidth <= 0) {
            return;
        }


        const newHeight =
            Math.round(
                newWidth / originalAspectRatio
            );


        heightInput.value =
            newHeight;

    }
);


/* ========================================
   Height Change
======================================== */

heightInput.addEventListener(
    "input",
    function () {

        if (!aspectRatio.checked) {
            return;
        }


        const newHeight =
            parseInt(this.value);


        if (!newHeight || newHeight <= 0) {
            return;
        }


        const newWidth =
            Math.round(
                newHeight * originalAspectRatio
            );


        widthInput.value =
            newWidth;

    }
);


/* ========================================
   Aspect Ratio
======================================== */

aspectRatio.addEventListener(
    "change",
    function () {

        if (this.checked) {

            const width =
                parseInt(widthInput.value);


            if (width && width > 0) {

                heightInput.value =
                    Math.round(
                        width / originalAspectRatio
                    );

            }

        }

    }
);


/* ========================================
   Quality Slider
======================================== */

qualityInput.addEventListener(
    "input",
    function () {

        qualityValue.textContent =
            `${this.value}%`;

    }
);


/* ========================================
   Resize Image
======================================== */

resizeButton.addEventListener(
    "click",
    resizeImage
);


function resizeImage() {

    if (!currentImage) {

        alert(
            "يرجى اختيار صورة أولًا."
        );

        return;
    }


    /* ------------------------------------
       Get dimensions
    ------------------------------------ */

    const width =
        parseInt(widthInput.value);


    const height =
        parseInt(heightInput.value);


    /* ------------------------------------
       Validate dimensions
    ------------------------------------ */

    if (
        !width ||
        !height ||
        width < 1 ||
        height < 1
    ) {

        alert(
            "يرجى إدخال عرض وارتفاع صحيحين."
        );

        return;
    }


    if (
        width > 10000 ||
        height > 10000
    ) {

        alert(
            "الحد الأقصى للأبعاد هو 10000 × 10000 بكسل."
        );

        return;
    }


    /* ------------------------------------
       Disable button
    ------------------------------------ */

    resizeButton.disabled = true;

    resizeButton.textContent =
        "⏳ جارٍ تغيير حجم الصورة...";


    /* ------------------------------------
       Create Canvas
    ------------------------------------ */

    const canvas =
        document.createElement("canvas");


    const ctx =
        canvas.getContext("2d");


    canvas.width = width;

    canvas.height = height;


    /* ------------------------------------
       Improve image quality
    ------------------------------------ */

    ctx.imageSmoothingEnabled = true;

    ctx.imageSmoothingQuality = "high";


    /* ------------------------------------
       White background for JPG
    ------------------------------------ */

    const selectedFormat =
        formatSelect.value;


    if (selectedFormat === "image/jpeg") {

        ctx.fillStyle = "#FFFFFF";

        ctx.fillRect(
            0,
            0,
            width,
            height
        );

    }


    /* ------------------------------------
       Draw image
    ------------------------------------ */

    ctx.drawImage(
        currentImage.image,
        0,
        0,
        width,
        height
    );


    /* ------------------------------------
       Quality
    ------------------------------------ */

    const quality =
        parseInt(
            qualityInput.value
        ) / 100;


    /* ------------------------------------
       Convert Canvas
    ------------------------------------ */

    canvas.toBlob(
        function (blob) {

            if (!blob) {

                resetResizeButton();

                alert(
                    "حدث خطأ أثناء إنشاء الصورة."
                );

                return;
            }


            /* ----------------------------
               Revoke old result URL
            ---------------------------- */

            if (resultURL) {

                URL.revokeObjectURL(
                    resultURL
                );

            }


            resultURL =
                URL.createObjectURL(blob);


            /* ----------------------------
               Result Preview
            ---------------------------- */

            resultImage.src =
                resultURL;


            /* ----------------------------
               Result Information
            ---------------------------- */

            resultDimensions.textContent =
                `${width} × ${height}`;


            resultSize.textContent =
                formatFileSize(
                    blob.size
                );


            resultFormat.textContent =
                getFormatName(
                    selectedFormat
                );


            /* ----------------------------
               Download
            ---------------------------- */

            downloadButton.href =
                resultURL;


            downloadButton.download =
                `tool-hub-resized-image.${getExtension(selectedFormat)}`;


            /* ----------------------------
               Show Result
            ---------------------------- */

            resultSection.hidden =
                false;


            /* ----------------------------
               Reset Button
            ---------------------------- */

            resetResizeButton();


            /* ----------------------------
               Scroll Result
            ---------------------------- */

            setTimeout(() => {

                resultSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }, 150);

        },

        selectedFormat,

        quality
    );

}


/* ========================================
   Reset Resize Button
======================================== */

function resetResizeButton() {

    resizeButton.disabled =
        false;

    resizeButton.textContent =
        "🖼️ تغيير حجم الصورة";

}


/* ========================================
   Remove Image
======================================== */

removeImage.addEventListener(
    "click",
    resetTool
);


/* ========================================
   New Image
======================================== */

newImageButton.addEventListener(
    "click",
    resetTool
);


/* ========================================
   Reset Tool
======================================== */

function resetTool() {

    /* ------------------------------------
       Revoke URLs
    ------------------------------------ */

    if (currentImage) {

        URL.revokeObjectURL(
            currentImage.url
        );

    }


    if (resultURL) {

        URL.revokeObjectURL(
            resultURL
        );

        resultURL = null;

    }


    /* ------------------------------------
       Reset variables
    ------------------------------------ */

    currentImage = null;

    originalWidth = 0;

    originalHeight = 0;

    originalAspectRatio = 1;


    /* ------------------------------------
       Reset input
    ------------------------------------ */

    imageInput.value = "";


    widthInput.value = "";

    heightInput.value = "";


    /* ------------------------------------
       Reset preview
    ------------------------------------ */

    imagePreview.src = "";

    resultImage.src = "";


    /* ------------------------------------
       Reset sections
    ------------------------------------ */

    imageInfo.hidden = true;

    resizeSettings.hidden = true;

    resultSection.hidden = true;


    /* ------------------------------------
       Reset values
    ------------------------------------ */

    qualityInput.value = 80;

    qualityValue.textContent =
        "80%";


    aspectRatio.checked = true;


    formatSelect.value =
        "image/jpeg";


    ratioInfo.textContent =
        "-";


    originalDimensions.textContent =
        "-";


    imageType.textContent =
        "-";


    imageSize.textContent =
        "-";


    resultDimensions.textContent =
        "-";


    resultSize.textContent =
        "-";


    resultFormat.textContent =
        "-";


    /* ------------------------------------
       Reset button
    ------------------------------------ */

    resetResizeButton();


    /* ------------------------------------
       Scroll to top
    ------------------------------------ */

    uploadArea.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* ========================================
   Drag & Drop
======================================== */

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


        const file =
            event.dataTransfer.files[0];


        if (!file) {
            return;
        }


        handleImage(file);

    }
);


/* ========================================
   File Size Formatter
======================================== */

function formatFileSize(bytes) {

    if (bytes === 0) {
        return "0 Bytes";
    }


    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];


    const i =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    const size =
        bytes /
        Math.pow(1024, i);


    return (
        size.toFixed(
            i === 0 ? 0 : 2
        )
        + " "
        + units[i]
    );

}


/* ========================================
   Format Name
======================================== */

function getFormatName(type) {

    const formats = {

        "image/jpeg": "JPG",

        "image/png": "PNG",

        "image/webp": "WebP"

    };


    return formats[type] || type;

}


/* ========================================
   File Extension
======================================== */

function getExtension(type) {

    const extensions = {

        "image/jpeg": "jpg",

        "image/png": "png",

        "image/webp": "webp"

    };


    return extensions[type] || "png";

}


/* ========================================
   Theme Toggle
======================================== */

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

            themeToggle.textContent =
                "☀️";

            themeToggle.setAttribute(
                "aria-label",
                "تفعيل الوضع النهاري"
            );

        } else {

            themeToggle.textContent =
                "🌙";

            themeToggle.setAttribute(
                "aria-label",
                "تفعيل الوضع الليلي"
            );

        }

    }
);