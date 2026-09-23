/* =========================================================
   Tool Hub - Mathematical Calculator
   JavaScript
========================================================= */

"use strict";


/* =========================================================
   1. Elements
========================================================= */

const displayExpression =
    document.getElementById("displayExpression");

const displayValue =
    document.getElementById("displayValue");

const calculatorGrid =
    document.getElementById("calculatorGrid");

const clearBtn =
    document.getElementById("clearBtn");

const deleteBtn =
    document.getElementById("deleteBtn");

const equalsBtn =
    document.getElementById("equalsBtn");

const copyResultBtn =
    document.getElementById("copyResultBtn");

const advancedButtons =
    document.querySelector(".advanced-buttons");

const percentageValue =
    document.getElementById("percentageValue");

const percentageBase =
    document.getElementById("percentageBase");

const percentageBtn =
    document.getElementById("percentageBtn");

const percentageResult =
    document.getElementById("percentageResult");

const percentageResultValue =
    document.getElementById("percentageResultValue");

const mathQuestion =
    document.getElementById("mathQuestion");

const solveQuestionBtn =
    document.getElementById("solveQuestionBtn");

const questionResult =
    document.getElementById("questionResult");

const questionResultValue =
    document.getElementById("questionResultValue");

const exampleQuestions =
    document.querySelectorAll(".example-question");

const themeToggle =
    document.getElementById("themeToggle");


/* =========================================================
   2. Calculator State
========================================================= */

let expression = "";

let lastResult = null;

let justCalculated = false;


/* =========================================================
   3. Display
========================================================= */

function updateDisplay() {

    if (!displayValue) {
        return;
    }


    if (expression === "") {

        displayValue.textContent = "0";

    } else {

        displayValue.textContent =
            formatExpressionForDisplay(expression);
    }


    if (displayExpression) {

        if (lastResult !== null && justCalculated) {

            displayExpression.textContent =
                expression;

        } else {

            displayExpression.textContent = "";
        }
    }
}


/* =========================================================
   4. Display Expression Formatting
========================================================= */

function formatExpressionForDisplay(value) {

    return value
        .replace(/\*/g, " × ")
        .replace(/\//g, " ÷ ")
        .replace(/\+/g, " + ")
        .replace(/-/g, " − ")
        .replace(/\s+/g, " ")
        .trim();
}


/* =========================================================
   5. Add Number
========================================================= */

function addNumber(number) {

    if (justCalculated) {

        expression = "";

        lastResult = null;

        justCalculated = false;
    }


    expression += number;

    updateDisplay();
}


/* =========================================================
   6. Add Decimal
========================================================= */

function addDecimal() {

    if (justCalculated) {

        expression = "";

        lastResult = null;

        justCalculated = false;
    }


    /*
       Find the last number in the expression.
    */

    const parts =
        expression.split(/[+\-*/()]/);

    const currentNumber =
        parts[parts.length - 1];


    /*
       Prevent more than one decimal
       point inside the same number.
    */

    if (currentNumber.includes(".")) {
        return;
    }


    /*
       If the expression is empty or the
       last character is an operator,
       start with 0.
    */

    if (
        expression === "" ||
        /[+\-*/(]$/.test(expression)
    ) {

        expression += "0.";
    } else {

        expression += ".";
    }


    updateDisplay();
}


/* =========================================================
   7. Add Operator
========================================================= */

function addOperator(operator) {

    if (expression === "") {

        /*
           Allow negative numbers.
        */

        if (operator === "-") {

            expression = "-";

            updateDisplay();
        }

        return;
    }


    /*
       If the last character is already an
       operator, replace it.
    */

    if (/[+\-*/]$/.test(expression)) {

        expression =
            expression.slice(0, -1) + operator;

    } else {

        expression += operator;
    }


    justCalculated = false;

    updateDisplay();
}


/* =========================================================
   8. Add Parentheses
========================================================= */

function addParenthesis(value) {

    if (justCalculated) {

        expression = "";

        lastResult = null;

        justCalculated = false;
    }


    if (value === "(") {

        /*
           Add multiplication automatically when
           something like 5(2+3) is entered.
        */

        if (
            expression !== "" &&
            /[\d)]$/.test(expression)
        ) {

            expression += "*";
        }


        expression += "(";

    } else if (value === ")") {

        /*
           Don't allow a closing parenthesis if
           there is no matching opening one.
        */

        const opens =
            (expression.match(/\(/g) || []).length;

        const closes =
            (expression.match(/\)/g) || []).length;


        if (
            opens <= closes ||
            expression === "" ||
            /[+\-*/(]$/.test(expression)
        ) {

            return;
        }


        expression += ")";
    }


    updateDisplay();
}


/* =========================================================
   9. Clear Calculator
========================================================= */

function clearCalculator() {

    expression = "";

    lastResult = null;

    justCalculated = false;

    updateDisplay();
}


/* =========================================================
   10. Delete Last Character
========================================================= */

function deleteLastCharacter() {

    if (justCalculated) {

        expression = "";

        lastResult = null;

        justCalculated = false;

    } else {

        expression =
            expression.slice(0, -1);
    }


    updateDisplay();
}


/* =========================================================
   11. Calculate
========================================================= */

function calculate() {

    if (!expression) {
        return;
    }


    try {

        const result =
            evaluateExpression(expression);


        if (!Number.isFinite(result)) {

            throw new Error(
                "نتيجة غير صالحة"
            );
        }


        const cleanResult =
            roundResult(result);


        lastResult =
            cleanResult;


        const originalExpression =
            expression;


        expression =
            numberToString(cleanResult);


        justCalculated = true;


        if (displayExpression) {

            displayExpression.textContent =
                formatExpressionForDisplay(
                    originalExpression
                );
        }


        updateDisplay();


    } catch (error) {

        showCalculatorError(
            error.message
        );
    }
}


/* =========================================================
   12. Safe Mathematical Expression Evaluator
========================================================= */

function evaluateExpression(input) {

    let normalized =
        input
            .replace(/\s+/g, "")
            .replace(/×/g, "*")
            .replace(/÷/g, "/");


    /*
       Basic validation.
    */

    if (!/^[0-9+\-*/().%]+$/.test(normalized)) {

        throw new Error(
            "العملية تحتوي على رموز غير صحيحة"
        );
    }


    /*
       Parentheses validation.
    */

    if (!hasBalancedParentheses(normalized)) {

        throw new Error(
            "تأكد من إغلاق الأقواس بشكل صحيح"
        );
    }


    /*
       Convert percentages.
    */

    normalized =
        convertPercentages(normalized);


    /*
       Tokenize expression.
    */

    const tokens =
        tokenize(normalized);


    if (tokens.length === 0) {

        throw new Error(
            "أدخل عملية حسابية أولًا"
        );
    }


    /*
       Parse using recursive descent.
    */

    const parser =
        createParser(tokens);

    const result =
        parser.parseExpression();


    if (!parser.isAtEnd()) {

        throw new Error(
            "تعذر قراءة العملية"
        );
    }


    return result;
}


/* =========================================================
   13. Parentheses Validation
========================================================= */

function hasBalancedParentheses(value) {

    let count = 0;


    for (const char of value) {

        if (char === "(") {

            count++;

        } else if (char === ")") {

            count--;

            if (count < 0) {
                return false;
            }
        }
    }


    return count === 0;
}


/* =========================================================
   14. Percentage Conversion
========================================================= */

function convertPercentages(value) {

    /*
       Example:

       20%  -> 0.2
       50%  -> 0.5
    */

    return value.replace(
        /(\d+(?:\.\d+)?)%/g,
        "($1/100)"
    );
}


/* =========================================================
   15. Tokenizer
========================================================= */

function tokenize(value) {

    const tokens = [];

    let index = 0;


    while (index < value.length) {

        const char =
            value[index];


        /*
           Number
        */

        if (
            /\d/.test(char) ||
            char === "."
        ) {

            let number = "";

            let dotCount = 0;


            while (
                index < value.length &&
                /[\d.]/.test(value[index])
            ) {

                if (value[index] === ".") {

                    dotCount++;

                    if (dotCount > 1) {

                        throw new Error(
                            "رقم عشري غير صحيح"
                        );
                    }
                }


                number +=
                    value[index];

                index++;
            }


            if (number === ".") {

                throw new Error(
                    "رقم غير صحيح"
                );
            }


            tokens.push({
                type: "number",
                value: Number(number)
            });


            continue;
        }


        /*
           Operators
        */

        if (
            char === "+" ||
            char === "-" ||
            char === "*" ||
            char === "/"
        ) {

            tokens.push({
                type: "operator",
                value: char
            });

            index++;

            continue;
        }


        /*
           Parentheses
        */

        if (
            char === "(" ||
            char === ")"
        ) {

            tokens.push({
                type: "parenthesis",
                value: char
            });

            index++;

            continue;
        }


        throw new Error(
            "رمز غير معروف في العملية"
        );
    }


    return tokens;
}


/* =========================================================
   16. Recursive Descent Parser
========================================================= */

function createParser(tokens) {

    let current = 0;


    function peek() {

        return tokens[current];
    }


    function advance() {

        return tokens[current++];
    }


    function isAtEnd() {

        return current >= tokens.length;
    }


    /*
       expression
       =
       addition/subtraction
    */

    function parseExpression() {

        let value =
            parseTerm();


        while (!isAtEnd()) {

            const token =
                peek();


            if (
                token.value !== "+" &&
                token.value !== "-"
            ) {

                break;
            }


            advance();


            const right =
                parseTerm();


            if (token.value === "+") {

                value += right;

            } else {

                value -= right;
            }
        }


        return value;
    }


    /*
       term
       =
       multiplication/division
    */

    function parseTerm() {

        let value =
            parseFactor();


        while (!isAtEnd()) {

            const token =
                peek();


            if (
                token.value !== "*" &&
                token.value !== "/"
            ) {

                break;
            }


            advance();


            const right =
                parseFactor();


            if (token.value === "*") {

                value *= right;

            } else {

                if (right === 0) {

                    throw new Error(
                        "لا يمكن القسمة على صفر"
                    );
                }


                value /= right;
            }
        }


        return value;
    }


    /*
       factor
       =
       number
       negative number
       parentheses
    */

    function parseFactor() {

        if (isAtEnd()) {

            throw new Error(
                "العملية غير مكتملة"
            );
        }


        const token =
            peek();


        /*
           Unary minus
        */

        if (
            token.type === "operator" &&
            token.value === "-"
        ) {

            advance();

            return -parseFactor();
        }


        /*
           Unary plus
        */

        if (
            token.type === "operator" &&
            token.value === "+"
        ) {

            advance();

            return parseFactor();
        }


        /*
           Number
        */

        if (token.type === "number") {

            advance();

            return token.value;
        }


        /*
           Parentheses
        */

        if (
            token.type === "parenthesis" &&
            token.value === "("
        ) {

            advance();


            const value =
                parseExpression();


            if (
                isAtEnd() ||
                peek().value !== ")"
            ) {

                throw new Error(
                    "قوس غير مغلق"
                );
            }


            advance();


            return value;
        }


        throw new Error(
            "تعذر فهم العملية"
        );
    }


    return {

        parseExpression,

        isAtEnd
    };
}


/* =========================================================
   17. Round Result
========================================================= */

function roundResult(value) {

    /*
       Prevent floating point issues such as:

       0.1 + 0.2
       = 0.30000000000000004
    */

    return Number(
        value.toFixed(12)
    );
}


/* =========================================================
   18. Number To String
========================================================= */

function numberToString(value) {

    return String(value);
}


/* =========================================================
   19. Calculator Error
========================================================= */

function showCalculatorError(message) {

    const oldValue =
        displayValue.textContent;


    displayValue.textContent =
        message || "خطأ";


    displayValue.style.fontSize =
        "1rem";


    setTimeout(() => {

        displayValue.style.fontSize =
            "";


        displayValue.textContent =
            oldValue || "0";

    }, 1500);
}


/* =========================================================
   20. Copy Result
========================================================= */

async function copyResult() {

    const value =
        displayValue.textContent;


    if (
        !value ||
        value === "0" ||
        value === "خطأ"
    ) {

        return;
    }


    try {

        await navigator.clipboard.writeText(
            value
        );


        showCopyFeedback();

    } catch (error) {

        /*
           Fallback for browsers where
           Clipboard API is unavailable.
        */

        fallbackCopy(value);
    }
}


/* =========================================================
   21. Copy Fallback
========================================================= */

function fallbackCopy(value) {

    const textarea =
        document.createElement("textarea");


    textarea.value =
        value;


    textarea.style.position =
        "fixed";

    textarea.style.opacity =
        "0";


    document.body.appendChild(
        textarea
    );


    textarea.select();


    try {

        document.execCommand("copy");

        showCopyFeedback();

    } catch (error) {

        console.error(
            "Copy failed:",
            error
        );

    } finally {

        document.body.removeChild(
            textarea
        );
    }
}


/* =========================================================
   22. Copy Feedback
========================================================= */

function showCopyFeedback() {

    const originalText =
        copyResultBtn.textContent;


    copyResultBtn.textContent =
        "✓";


    setTimeout(() => {

        copyResultBtn.textContent =
            originalText;

    }, 1200);
}


/* =========================================================
   23. Percentage Calculator
========================================================= */

function calculatePercentage() {

    const percentage =
        Number(
            percentageValue.value
        );

    const base =
        Number(
            percentageBase.value
        );


    if (
        percentageValue.value.trim() === "" ||
        percentageBase.value.trim() === ""
    ) {

        showPercentageError(
            "أدخل النسبة والرقم أولًا"
        );

        return;
    }


    if (
        !Number.isFinite(percentage) ||
        !Number.isFinite(base)
    ) {

        showPercentageError(
            "أدخل أرقامًا صحيحة"
        );

        return;
    }


    const result =
        (percentage / 100) * base;


    percentageResultValue.textContent =
        formatNumber(roundResult(result));


    percentageResult.hidden =
        false;
}


/* =========================================================
   24. Percentage Error
========================================================= */

function showPercentageError(message) {

    percentageResultValue.textContent =
        message;


    percentageResult.hidden =
        false;
}


/* =========================================================
   25. Format Number
========================================================= */

function formatNumber(value) {

    if (!Number.isFinite(value)) {

        return "غير صالح";
    }


    return new Intl.NumberFormat(
        "en-US",
        {
            maximumFractionDigits: 12
        }
    ).format(value);
}


/* =========================================================
   26. Solve Math Question
========================================================= */

function solveMathQuestion() {

    const question =
        mathQuestion.value.trim();


    if (!question) {

        showQuestionResult(
            "اكتب سؤالًا رياضيًا أولًا"
        );

        return;
    }


    try {

        const result =
            parseMathQuestion(question);


        if (!Number.isFinite(result)) {

            throw new Error(
                "تعذر حساب النتيجة"
            );
        }


        showQuestionResult(
            formatNumber(
                roundResult(result)
            )
        );

    } catch (error) {

        showQuestionResult(
            error.message ||
            "لم أتمكن من فهم السؤال"
        );
    }
}


/* =========================================================
   27. Parse Math Question
========================================================= */

function parseMathQuestion(question) {

    let text =
        question
            .toLowerCase()
            .trim();


    /*
       Normalize Arabic digits.
    */

    text =
        convertArabicNumbers(text);


    /*
       Normalize common Arabic mathematical
       expressions.
    */

    text =
        text
            .replace(/ما هو/g, "")
            .replace(/كم هو/g, "")
            .replace(/كم يساوي/g, "")
            .replace(/يساوي/g, "")
            .replace(/احسب/g, "")
            .replace(/حساب/g, "")
            .replace(/من/g, " من ");


    /*
       Pattern:
       20% من 500
    */

    const percentageMatch =
        text.match(
            /(-?\d+(?:\.\d+)?)\s*%\s*(?:من|of)\s*(-?\d+(?:\.\d+)?)/i
        );


    if (percentageMatch) {

        const percentage =
            Number(
                percentageMatch[1]
            );

        const base =
            Number(
                percentageMatch[2]
            );


        return (
            percentage / 100
        ) * base;
    }


    /*
       Pattern:
       150 - 35
    */

    const expressionText =
        normalizeMathOperators(text);


    const expressionMatch =
        expressionText.match(
            /[0-9+\-*/().%\s]+/
        );


    if (expressionMatch) {

        const candidate =
            expressionMatch[0].trim();


        if (
            candidate &&
            /[0-9]/.test(candidate)
        ) {

            return evaluateExpression(
                candidate
            );
        }
    }


    /*
       Arabic word problems:
       "معي 150 ودفعت 35"
    */

    const numbers =
        text.match(
            /-?\d+(?:\.\d+)?/g
        );


    if (
        numbers &&
        numbers.length >= 2
    ) {

        const first =
            Number(numbers[0]);

        const second =
            Number(numbers[1]);


        /*
           Remaining / paid / spent
        */

        if (
            text.includes("دفعت") ||
            text.includes("دفعتُ") ||
            text.includes("صرف") ||
            text.includes("انفق")
        ) {

            return first - second;
        }


        /*
           Plus / added
        */

        if (
            text.includes("اضاف") ||
            text.includes("أضاف") ||
            text.includes("معي") &&
            text.includes("وأ")
        ) {

            return first + second;
        }
    }


    throw new Error(
        "اكتب عملية مثل: 25 + 10 × 3 أو 20% من 500"
    );
}


/* =========================================================
   28. Arabic Number Conversion
========================================================= */

function convertArabicNumbers(text) {

    const arabicNumbers = {
        "٠": "0",
        "١": "1",
        "٢": "2",
        "٣": "3",
        "٤": "4",
        "٥": "5",
        "٦": "6",
        "٧": "7",
        "٨": "8",
        "٩": "9"
    };


    return text.replace(
        /[٠-٩]/g,
        character =>
            arabicNumbers[character]
    );
}


/* =========================================================
   29. Normalize Math Operators
========================================================= */

function normalizeMathOperators(text) {

    return text
        .replace(/×/g, "*")
        .replace(/x/g, "*")
        .replace(/÷/g, "/")
        .replace(/٪/g, "%")
        .replace(/،/g, ".")
        .replace(/,/g, ".")
        .replace(/−/g, "-");
}


/* =========================================================
   30. Question Result
========================================================= */

function showQuestionResult(value) {

    questionResultValue.textContent =
        value;


    questionResult.hidden =
        false;
}


/* =========================================================
   31. Example Questions
========================================================= */

exampleQuestions.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const question =
                button.dataset.question;


            mathQuestion.value =
                question;


            mathQuestion.focus();

        }
    );

});


/* =========================================================
   32. Number Buttons
========================================================= */

document
    .querySelectorAll(".number-key")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const value =
                    button.dataset.value;


                if (value === ".") {

                    addDecimal();

                } else {

                    addNumber(value);
                }

            }
        );

    });


/* =========================================================
   33. Operator Buttons
========================================================= */

document
    .querySelectorAll(
        ".operator-key, .operator-action"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const operator =
                    button.dataset.operation;


                if (operator === "%") {

                    addPercentageOperator();

                } else {

                    addOperator(operator);
                }

            }
        );

    });


/* =========================================================
   34. Percentage Operator
========================================================= */

function addPercentageOperator() {

    if (!expression) {
        return;
    }


    /*
       Convert the last number into
       a percentage marker.
    */

    const match =
        expression.match(
            /(\d+(?:\.\d+)?)$/
        );


    if (!match) {
        return;
    }


    expression += "%";

    updateDisplay();
}


/* =========================================================
   35. Parentheses Buttons
========================================================= */

document
    .querySelectorAll(".advanced-key")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                addParenthesis(
                    button.dataset.value
                );

            }
        );

    });


/* =========================================================
   36. Clear
========================================================= */

clearBtn.addEventListener(
    "click",
    clearCalculator
);


/* =========================================================
   37. Delete
========================================================= */

deleteBtn.addEventListener(
    "click",
    deleteLastCharacter
);


/* =========================================================
   38. Equals
========================================================= */

equalsBtn.addEventListener(
    "click",
    calculate
);


/* =========================================================
   39. Copy
========================================================= */

copyResultBtn.addEventListener(
    "click",
    copyResult
);


/* =========================================================
   40. Percentage Calculator
========================================================= */

percentageBtn.addEventListener(
    "click",
    calculatePercentage
);


/* =========================================================
   41. Solve Question
========================================================= */

solveQuestionBtn.addEventListener(
    "click",
    solveMathQuestion
);


/* =========================================================
   42. Keyboard Support
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /*
           Don't interfere with textareas/inputs.
        */

        const target =
            event.target.tagName;


        if (
            target === "INPUT" ||
            target === "TEXTAREA"
        ) {

            /*
               Allow Enter inside question textarea
               only through the dedicated button.
            */

            return;
        }


        const key =
            event.key;


        /*
           Numbers
        */

        if (/^\d$/.test(key)) {

            event.preventDefault();

            addNumber(key);

            return;
        }


        /*
           Decimal
        */

        if (key === ".") {

            event.preventDefault();

            addDecimal();

            return;
        }


        /*
           Operators
        */

        if (
            key === "+" ||
            key === "-" ||
            key === "*" ||
            key === "/"
        ) {

            event.preventDefault();

            addOperator(key);

            return;
        }


        /*
           Parentheses
        */

        if (
            key === "(" ||
            key === ")"
        ) {

            event.preventDefault();

            addParenthesis(key);

            return;
        }


        /*
           Enter / =
        */

        if (
            key === "Enter" ||
            key === "="
        ) {

            event.preventDefault();

            calculate();

            return;
        }


        /*
           Backspace
        */

        if (key === "Backspace") {

            event.preventDefault();

            deleteLastCharacter();

            return;
        }


        /*
           Escape
        */

        if (key === "Escape") {

            event.preventDefault();

            clearCalculator();

        }

    }
);


/* =========================================================
   43. Dark Mode
========================================================= */

function initializeTheme() {

    const savedTheme =
        localStorage.getItem(
            "toolHubTheme"
        );


    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark-mode"
        );

        updateThemeIcon(true);

    } else {

        updateThemeIcon(false);
    }
}


/* =========================================================
   44. Theme Icon
========================================================= */

function updateThemeIcon(isDark) {

    if (!themeToggle) {
        return;
    }


    themeToggle.textContent =
        isDark ? "☀️" : "🌙";


    themeToggle.setAttribute(
        "aria-label",
        isDark
            ? "تفعيل الوضع النهاري"
            : "تفعيل الوضع الليلي"
    );
}


/* =========================================================
   45. Toggle Theme
========================================================= */

if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        () => {

            const isDark =
                document.body.classList.toggle(
                    "dark-mode"
                );


            localStorage.setItem(
                "toolHubTheme",
                isDark
                    ? "dark"
                    : "light"
            );


            updateThemeIcon(
                isDark
            );

        }
    );

}


/* =========================================================
   46. Initialize
========================================================= */

initializeTheme();

updateDisplay();