/* ========================================
   Tool Hub
   Image Converter
======================================== */


/* ========================================
   Elements
======================================== */

const imageInput = document.getElementById("imageInput");

const uploadArea = document.getElementById("uploadArea");

const imageInfo = document.getElementById("imageInfo");

const conversionSettings =
    document.getElementById("conversionSettings");

const resultSection =
    document.getElementById("resultSection");

const imagePreview =
    document.getElementById("imagePreview");

const resultImage =
    document.getElementById("resultImage");

const removeImage =
    document.getElementById("removeImage");

const newImageButton =
    document.getElementById("newImageButton");

const convertButton =
    document.getElementById("convertButton");

const downloadButton =
    document.getElementById("downloadButton");

const formatSelect =
    document.getElementById("formatSelect");

const qualityInput =
    document.getElementById("qualityInput");

const qualityValue =
    document.getElementById("qualityValue");

const qualitySection =
    document.getElementById("qualitySection");

const themeToggle =
    document.getElementById("themeToggle");


/* ========================================
   Image Information Elements
======================================== */

const originalDimensions =
    document.getElementById("originalDimensions");

const imageType =
    document.getElementById("imageType");

const imageSize =
    document.getElementById("imageSize");


/* ========================================
   Result Information Elements
======================================== */

const resultDimensions =
    document.getElementById("resultDimensions");

const resultFormat =
    document.getElementById("resultFormat");

const resultSize =
    document.getElementById("resultSize");


/* ========================================
   Variables
======================================== */

let selectedFile = null;

let originalImage = null;

let resultUrl = null;


/* ========================================
   Supported Formats
======================================== */

const formatNames = {

    "image/jpeg": "JPG",

    "image/png": "PNG",

    "image/webp": "WebP"

};


/* ========================================
   File Input
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

    /* Check file type */

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (!allowedTypes.includes(file.type)) {

        alert(
            "من فضلك اختر صورة بصيغة JPG أو PNG أو WebP."
        );

        resetTool();

        return;
    }


    /* Check file size */

    const maxSize = 25 * 1024 * 1024;


    if (file.size > maxSize) {

        alert(
            "حجم الصورة كبير جدًا. الحد الأقصى هو 25MB."
        );

        resetTool();

        return;
    }


    selectedFile = file;


    /* Create temporary image */

    const reader = new FileReader();


    reader.onload = function (event) {

        const img = new Image();


        img.onload = function () {

            originalImage = img;


            /* Show preview */

            imagePreview.src =
                event.target.result;


            /* Image dimensions */

            originalDimensions.textContent =
                `${img.width} × ${img.height}`;


            /* Image type */

            imageType.textContent =
                formatNames[file.type] || "غير معروف";


            /* Image size */

            imageSize.textContent =
                formatFileSize(file.size);


            /* Select default output */

            setDefaultOutputFormat(file.type);


            /* Show interface */

            imageInfo.hidden = false;

            conversionSettings.hidden = false;

            resultSection.hidden = true;

        };


        img.src = event.target.result;

    };


    reader.readAsDataURL(file);

}


/* ========================================
   Default Output Format
======================================== */

function setDefaultOutputFormat(type) {

    if (type === "image/jpeg") {

        formatSelect.value =
            "image/png";

    }

    else if (type === "image/png") {

        formatSelect.value =
            "image/webp";

    }

    else if (type === "image/webp") {

        formatSelect.value =
            "image/png";

    }


    updateQualityVisibility();

}


/* ========================================
   Format Change
======================================== */

formatSelect.addEventListener(
    "change",
    function () {

        updateQualityVisibility();

    }
);


/* ========================================
   Quality Visibility
======================================== */

function updateQualityVisibility() {

    const selectedFormat =
        formatSelect.value;


    /*
        PNG does not use the same
        quality parameter in Canvas
        as JPG/WebP.
    */

    if (selectedFormat === "image/png") {

        qualitySection.style.display =
            "none";

    }

    else {

        qualitySection.style.display =
            "block";

    }

}


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
   Convert Button
======================================== */

convertButton.addEventListener(
    "click",
    function () {

        if (!selectedFile || !originalImage) {

            alert(
                "يرجى اختيار صورة أولًا."
            );

            return;
        }


        convertImage();

    }
);


/* ========================================
   Convert Image
======================================== */

function convertImage() {

    /* Disable button */

    convertButton.disabled = true;

    convertButton.textContent =
        "⏳ جارٍ تحويل الصورة...";


    /*
        Use setTimeout so the browser
        can update the interface before
        starting the conversion.
    */

    setTimeout(function () {

        try {

            /* Create Canvas */

            const canvas =
                document.createElement("canvas");


            canvas.width =
                originalImage.naturalWidth;


            canvas.height =
                originalImage.naturalHeight;


            const context =
                canvas.getContext("2d");


            /*
                JPG does not support transparency.

                Therefore, when converting
                transparent PNG/WebP to JPG,
                we place a white background.
            */

            const targetFormat =
                formatSelect.value;


            if (targetFormat === "image/jpeg") {

                context.fillStyle = "#FFFFFF";

                context.fillRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

            }


            /* Draw image */

            context.drawImage(
                originalImage,
                0,
                0,
                canvas.width,
                canvas.height
            );


            /* Quality */

            const quality =
                Number(qualityInput.value) / 100;


            /*
                Convert Canvas to Blob
            */

            canvas.toBlob(
                function (blob) {

                    if (!blob) {

                        showConversionError();

                        return;
                    }


                    showResult(
                        blob,
                        canvas,
                        targetFormat
                    );

                },
                targetFormat,
                quality
            );


        }

        catch (error) {

            console.error(error);

            showConversionError();

        }


        finally {

            convertButton.disabled = false;

            convertButton.textContent =
                "🔄 تحويل الصورة";

        }

    }, 100);

}


/* ========================================
   Show Result
======================================== */

function showResult(
    blob,
    canvas,
    targetFormat
) {

    /* Remove old result URL */

    if (resultUrl) {

        URL.revokeObjectURL(resultUrl);

    }


    /* Create new URL */

    resultUrl =
        URL.createObjectURL(blob);


    /* Result image */

    resultImage.src =
        resultUrl;


    /* Dimensions */

    resultDimensions.textContent =
        `${canvas.width} × ${canvas.height}`;


    /* Format */

    resultFormat.textContent =
        formatNames[targetFormat];


    /* File size */

    resultSize.textContent =
        formatFileSize(blob.size);


    /* Download link */

    downloadButton.href =
        resultUrl;


    downloadButton.download =
        createFileName(targetFormat);


    /*
        IMPORTANT:
        Result is only displayed
        after pressing Convert.
    */

    resultSection.hidden = false;


    /* Scroll smoothly */

    setTimeout(function () {

        resultSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 100);

}


/* ========================================
   Create File Name
======================================== */

function createFileName(type) {

    let originalName =
        selectedFile.name;


    /*
        Remove the original extension
    */

    originalName =
        originalName.replace(
            /\.[^/.]+$/,
            ""
        );


    let extension;


    switch (type) {

        case "image/jpeg":

            extension = "jpg";

            break;


        case "image/png":

            extension = "png";

            break;


        case "image/webp":

            extension = "webp";

            break;


        default:

            extension = "png";

    }


    return `${originalName}-toolhub.${extension}`;

}


/* ========================================
   Format File Size
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


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    const size =
        bytes /
        Math.pow(1024, index);


    return (
        `${size.toFixed(index === 0 ? 0 : 2)} ${units[index]}`
    );

}


/* ========================================
   Remove Image
======================================== */

removeImage.addEventListener(
    "click",
    function () {

        resetTool();

    }
);


/* ========================================
   New Image
======================================== */

newImageButton.addEventListener(
    "click",
    function () {

        resetTool();


        /*
            Open file selector
            after resetting.
        */

        setTimeout(function () {

            imageInput.click();

        }, 100);

    }
);


/* ========================================
   Reset Tool
======================================== */

function resetTool() {

    selectedFile = null;

    originalImage = null;


    /* Remove result URL */

    if (resultUrl) {

        URL.revokeObjectURL(resultUrl);

        resultUrl = null;

    }


    /* Clear input */

    imageInput.value = "";


    /* Clear previews */

    imagePreview.src = "";

    resultImage.src = "";


    /* Reset information */

    originalDimensions.textContent = "-";

    imageType.textContent = "-";

    imageSize.textContent = "-";


    resultDimensions.textContent = "-";

    resultFormat.textContent = "-";

    resultSize.textContent = "-";


    /* Hide sections */

    imageInfo.hidden = true;

    conversionSettings.hidden = true;

    resultSection.hidden = true;


    /* Reset settings */

    qualityInput.value = 80;

    qualityValue.textContent = "80%";

    formatSelect.value =
        "image/png";


    updateQualityVisibility();

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
   Theme
======================================== */

themeToggle.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "dark-mode"
        );


        const darkMode =
            document.body.classList.contains(
                "dark-mode"
            );


        if (darkMode) {

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

        }

        else {

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


/* ========================================
   Load Saved Theme
======================================== */

function loadTheme() {

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


/* ========================================
   Conversion Error
======================================== */

function showConversionError() {

    alert(
        "حدث خطأ أثناء تحويل الصورة. حاول مرة أخرى."
    );

}


/* ========================================
   Initialize
======================================== */

loadTheme();

updateQualityVisibility();