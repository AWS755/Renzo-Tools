// ========================================
// Tool Hub
// Color Picker
// ========================================


// ----------------------------------------
// Elements
// ----------------------------------------

const colorInput =
    document.getElementById("colorInput");

const colorPreview =
    document.getElementById("colorPreview");

const colorPreviewText =
    document.getElementById("colorPreviewText");

const selectedColorText =
    document.getElementById("selectedColorText");

const hexValue =
    document.getElementById("hexValue");

const rgbValue =
    document.getElementById("rgbValue");

const hslValue =
    document.getElementById("hslValue");

const resetButton =
    document.getElementById("resetButton");

const themeToggle =
    document.getElementById("themeToggle");

const copyButtons =
    document.querySelectorAll(".copy-button");


// ----------------------------------------
// Initial Color
// ----------------------------------------

const DEFAULT_COLOR = "#2563EB";


// ----------------------------------------
// HEX → RGB
// ----------------------------------------

function hexToRgb(hex) {

    hex = hex.replace("#", "");

    const number =
        parseInt(hex, 16);

    return {
        r: (number >> 16) & 255,
        g: (number >> 8) & 255,
        b: number & 255
    };
}


// ----------------------------------------
// RGB → HSL
// ----------------------------------------

function rgbToHsl(r, g, b) {

    r /= 255;
    g /= 255;
    b /= 255;


    const max =
        Math.max(r, g, b);

    const min =
        Math.min(r, g, b);

    let h;
    let s;

    const l =
        (max + min) / 2;


    if (max === min) {

        h = 0;
        s = 0;

    } else {

        const difference =
            max - min;


        s =
            l > 0.5
                ? difference /
                    (2 - max - min)
                : difference /
                    (max + min);


        switch (max) {

            case r:

                h =
                    (g - b) /
                    difference +
                    (g < b ? 6 : 0);

                break;


            case g:

                h =
                    (b - r) /
                    difference +
                    2;

                break;


            case b:

                h =
                    (r - g) /
                    difference +
                    4;

                break;
        }


        h /= 6;
    }


    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}


// ----------------------------------------
// Update Color
// ----------------------------------------

function updateColor(hex) {

    const rgb =
        hexToRgb(hex);

    const hsl =
        rgbToHsl(
            rgb.r,
            rgb.g,
            rgb.b
        );


    const rgbString =
        `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;


    const hslString =
        `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;


    // Preview

    colorPreview.style.background =
        hex;

    colorPreviewText.textContent =
        hex.toUpperCase();


    // Selected color

    selectedColorText.textContent =
        hex.toUpperCase();


    // Values

    hexValue.value =
        hex.toUpperCase();

    rgbValue.value =
        rgbString;

    hslValue.value =
        hslString;
}


// ----------------------------------------
// Color Picker Change
// ----------------------------------------

colorInput.addEventListener(
    "input",
    () => {

        updateColor(
            colorInput.value
        );

    }
);


// ----------------------------------------
// HEX Input
// ----------------------------------------

hexValue.addEventListener(
    "change",
    () => {

        let value =
            hexValue.value.trim();


        if (!value.startsWith("#")) {
            value = "#" + value;
        }


        const validHex =
            /^#[0-9A-Fa-f]{6}$/.test(
                value
            );


        if (!validHex) {

            hexValue.value =
                colorInput.value.toUpperCase();

            return;
        }


        colorInput.value =
            value;


        updateColor(value);
    }
);


// ----------------------------------------
// Copy
// ----------------------------------------

copyButtons.forEach((button) => {

    button.addEventListener(
        "click",
        async () => {

            const targetId =
                button.dataset.copy;


            const target =
                document.getElementById(
                    targetId
                );


            if (!target) {
                return;
            }


            try {

                await navigator.clipboard.writeText(
                    target.value
                );

                button.textContent = "✓";


                setTimeout(() => {

                    button.textContent = "📋";

                }, 1200);

            } catch (error) {

                target.select();

                document.execCommand(
                    "copy"
                );

                button.textContent = "✓";


                setTimeout(() => {

                    button.textContent = "📋";

                }, 1200);
            }

        }
    );

});


// ----------------------------------------
// Reset
// ----------------------------------------

resetButton.addEventListener(
    "click",
    () => {

        colorInput.value =
            DEFAULT_COLOR;

        updateColor(
            DEFAULT_COLOR
        );

    }
);


// ----------------------------------------
// Dark Mode
// ----------------------------------------

themeToggle.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark-mode"
        );


        const isDark =
            document.body.classList.contains(
                "dark-mode"
            );


        themeToggle.textContent =
            isDark ? "☀️" : "🌙";


        themeToggle.setAttribute(
            "aria-label",
            isDark
                ? "تفعيل الوضع الفاتح"
                : "تفعيل الوضع الليلي"
        );

    }
);


// ----------------------------------------
// Initial State
// ----------------------------------------

updateColor(DEFAULT_COLOR);