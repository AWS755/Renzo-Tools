// ========================================
// Tool Hub - Main JavaScript
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // Elements
    // ========================================

    const themeToggle = document.getElementById("themeToggle");
    const toolSearch = document.getElementById("toolSearch");
    const searchBox = document.querySelector(".search-box");


    // ========================================
    // Dark Mode
    // ========================================

    themeToggle?.addEventListener("click", () => {

        document.body.classList.toggle("dark-mode");

        const isDarkMode =
            document.body.classList.contains("dark-mode");

        themeToggle.textContent = isDarkMode ? "☀️" : "🌙";

    });


    // ========================================
    // Tools Data
    // ========================================

    const tools = [

        {
            name: "مولد كلمات المرور",
            icon: "🔐",
            keywords: [
                "كلمة مرور",
                "كلمات المرور",
                "password",
                "generator",
                "مولد"
            ],
            url: "مولد كلمات المرور/index.html"
        },

        {
            name: "Color Picker",
            icon: "🎨",
            keywords: [
                "لون",
                "ألوان",
                "color",
                "picker",
                "hex",
                "rgb"
            ],
            url: "Color Picker/index.html"
        },

        {
            name: "تغيير حجم الصور",
            icon: "🖼️",
            keywords: [
                "صورة",
                "صور",
                "تغيير الحجم",
                "تغيير حجم الصور",
                "resize",
                "image",
                "resizer"
            ],
            url: "تغير حجم الصور/index.html"
        },

        {
            name: "تحويل الصور",
            icon: "🔄",
            keywords: [
                "تحويل",
                "صور",
                "صورة",
                "jpg",
                "png",
                "webp",
                "image converter"
            ],
            url: "تحويل الصور/index.html"
        },

        {
            name: "ضغط الصور",
            icon: "🗜️",
            keywords: [
                "ضغط",
                "ضغط الصور",
                "ضغط صورة",
                "تصغير الصورة",
                "تقليل الحجم",
                "image compression",
                "compress image"
            ],
            url: "ضغط صورة/index.html"
        },

        {
            name: "ضغط PDF",
            icon: "📄",
            keywords: [
                "pdf",
                "ضغط pdf",
                "ضغط ملف",
                "تصغير pdf",
                "pdf compression"
            ],
            url: "ضغط pdf/index.html"
        },

        {
            name: "PDF إلى Word",
            icon: "📄",
            keywords: [
                "pdf",
                "word",
                "تحويل pdf",
                "pdf to word",
                "تحويل ملف"
            ],
            url: "تحويل word الي pdf/index.html"
        },

        {
            name: "الحاسبة",
            icon: "🧮",
            keywords: [
                "حاسبة",
                "حساب",
                "رياضيات",
                "calculator",
                "جمع",
                "طرح",
                "ضرب",
                "قسمة"
            ],
            url: "الحاسبة/index.html"
        }

    ];


    // ========================================
    // Create Search Results
    // ========================================

    const searchResults = document.createElement("div");

    searchResults.className = "search-results";

    searchBox?.appendChild(searchResults);


    // ========================================
    // Search Function
    // ========================================

    function searchTools() {

        const query = toolSearch.value
            .trim()
            .toLowerCase();

        searchResults.innerHTML = "";


        // Hide results if search is empty
        if (query === "") {

            searchResults.classList.remove("show");

            return;
        }


        // Find matching tools
        const results = tools.filter((tool) => {

            const searchableText = [

                tool.name,

                ...tool.keywords

            ]
                .join(" ")
                .toLowerCase();


            return searchableText.includes(query);

        });


        // No results
        if (results.length === 0) {

            searchResults.innerHTML = `
                <div class="no-search-results">
                    لم يتم العثور على أداة
                </div>
            `;

        } else {

            results.forEach((tool) => {

                const result = document.createElement("a");

                result.href = tool.url;

                result.className = "search-result-item";

                result.innerHTML = `

                    <span class="search-result-icon">
                        ${tool.icon}
                    </span>

                    <span class="search-result-name">
                        ${tool.name}
                    </span>

                    <span class="search-result-arrow">
                        ←
                    </span>

                `;


                searchResults.appendChild(result);

            });

        }


        searchResults.classList.add("show");

    }


    // ========================================
    // Search While Typing
    // ========================================

    toolSearch?.addEventListener("input", searchTools);


    // ========================================
    // Close Search Results
    // ========================================

    document.addEventListener("click", (event) => {

        if (
            !searchBox?.contains(event.target)
        ) {

            searchResults.classList.remove("show");

        }

    });


    // ========================================
    // Escape Key
    // ========================================

    toolSearch?.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {

            toolSearch.value = "";

            searchResults.innerHTML = "";

            searchResults.classList.remove("show");

            toolSearch.blur();

        }

    });

});