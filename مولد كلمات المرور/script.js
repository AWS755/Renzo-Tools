// ========================================
// Tool Hub
// Password Generator
// ========================================


// ----------------------------------------
// Elements
// ----------------------------------------

const passwordOutput =
    document.getElementById("passwordOutput");

const copyButton =
    document.getElementById("copyButton");

const generateButton =
    document.getElementById("generateButton");

const lengthInput =
    document.getElementById("length");

const lengthValue =
    document.getElementById("lengthValue");

const uppercaseInput =
    document.getElementById("uppercase");

const lowercaseInput =
    document.getElementById("lowercase");

const numbersInput =
    document.getElementById("numbers");

const symbolsInput =
    document.getElementById("symbols");

const strengthText =
    document.getElementById("strengthText");

const strengthBar =
    document.getElementById("strengthBar");

const themeToggle =
    document.getElementById("themeToggle");


// ----------------------------------------
// Character Sets
// ----------------------------------------

const CHARACTERS = {

    uppercase:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ",

    lowercase:
        "abcdefghijklmnopqrstuvwxyz",

    numbers:
        "0123456789",

    symbols:
        "!@#$%^&*()_+-=[]{}|;:,.<>?"
};


// ----------------------------------------
// Secure Random Number
// ----------------------------------------

function secureRandom(max) {

    const array =
        new Uint32Array(1);

    crypto.getRandomValues(array);

    return array[0] % max;
}


// ----------------------------------------
// Get Selected Characters
// ----------------------------------------

function getCharacterPool() {

    let pool = "";

    if (uppercaseInput.checked) {
        pool += CHARACTERS.uppercase;
    }

    if (lowercaseInput.checked) {
        pool += CHARACTERS.lowercase;
    }

    if (numbersInput.checked) {
        pool += CHARACTERS.numbers;
    }

    if (symbolsInput.checked) {
        pool += CHARACTERS.symbols;
    }

    return pool;
}


// ----------------------------------------
// Generate Password
// ----------------------------------------

function generatePassword() {

    const length =
        Number(lengthInput.value);

    const pool =
        getCharacterPool();


    // No options selected
    if (!pool) {

        passwordOutput.value = "";

        strengthText.textContent =
            "اختر نوعًا واحدًا على الأقل";

        strengthBar.style.width = "0%";

        return;
    }


    let password = "";


    // Guarantee at least one
    // character from each selected type

    const selectedSets = [];

    if (uppercaseInput.checked) {
        selectedSets.push(
            CHARACTERS.uppercase
        );
    }

    if (lowercaseInput.checked) {
        selectedSets.push(
            CHARACTERS.lowercase
        );
    }

    if (numbersInput.checked) {
        selectedSets.push(
            CHARACTERS.numbers
        );
    }

    if (symbolsInput.checked) {
        selectedSets.push(
            CHARACTERS.symbols
        );
    }


    // Add one character
    // from every selected group

    for (const set of selectedSets) {

        password +=
            set[
                secureRandom(set.length)
            ];
    }


    // Fill remaining length

    while (password.length < length) {

        password +=
            pool[
                secureRandom(pool.length)
            ];
    }


    // Shuffle password

    password =
        shuffleString(password);


    passwordOutput.value =
        password;


    updateStrength(password);
}


// ----------------------------------------
// Shuffle
// ----------------------------------------

function shuffleString(value) {

    const array =
        value.split("");

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            secureRandom(i + 1);

        [
            array[i],
            array[j]
        ] = [
            array[j],
            array[i]
        ];
    }

    return array.join("");
}


// ----------------------------------------
// Password Strength
// ----------------------------------------

function updateStrength(password) {

    let score = 0;


    // Length

    if (password.length >= 8) {
        score++;
    }

    if (password.length >= 12) {
        score++;
    }

    if (password.length >= 16) {
        score++;
    }


    // Character diversity

    if (/[A-Z]/.test(password)) {
        score++;
    }

    if (/[a-z]/.test(password)) {
        score++;
    }

    if (/[0-9]/.test(password)) {
        score++;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
        score++;
    }


    if (score <= 2) {

        strengthText.textContent =
            "ضعيفة";

        strengthBar.style.width =
            "30%";

        strengthBar.style.background =
            "#DC2626";

    } else if (score <= 4) {

        strengthText.textContent =
            "متوسطة";

        strengthBar.style.width =
            "60%";

        strengthBar.style.background =
            "#F59E0B";

    } else {

        strengthText.textContent =
            "قوية";

        strengthBar.style.width =
            "100%";

        strengthBar.style.background =
            "#16A34A";
    }
}


// ----------------------------------------
// Copy
// ----------------------------------------

copyButton.addEventListener(
    "click",
    async () => {

        const password =
            passwordOutput.value;

        if (!password) {
            return;
        }


        try {

            await navigator.clipboard.writeText(
                password
            );

            copyButton.textContent = "✓";

            setTimeout(() => {

                copyButton.textContent = "📋";

            }, 1500);

        } catch (error) {

            passwordOutput.select();

            document.execCommand("copy");

            copyButton.textContent = "✓";

            setTimeout(() => {

                copyButton.textContent = "📋";

            }, 1500);
        }
    }
);


// ----------------------------------------
// Length
// ----------------------------------------

lengthInput.addEventListener(
    "input",
    () => {
        lengthValue.textContent =
            lengthInput.value;
    }
);

// ----------------------------------------
// Options
// ----------------------------------------

[
    uppercaseInput,
    lowercaseInput,
    numbersInput,
    symbolsInput
].forEach((input) => {

    input.addEventListener(
        "change",
        () => {
            // لا يتم إنشاء كلمة مرور هنا
        }
    );

});


// ----------------------------------------
// Generate Button
// ----------------------------------------

generateButton.addEventListener(
    "click",
    generatePassword
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
// Initial Password
// ----------------------------------------
