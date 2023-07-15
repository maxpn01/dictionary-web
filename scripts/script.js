import element from "./element-factory.js";

const d = document;

/********* CHANGING DARK/LIGHT THEME *********/
const themeBtn = d.querySelector(".theme-btn");
const themeIcon = d.getElementById("theme-icon");
const darkTheme = "dark-theme";
const darkIcon = "ri-moon-line";
const lightIcon = "ri-sun-line";

const selectedTheme = localStorage.getItem("selected-theme");
const selectedIcon = localStorage.getItem("selected-icon");

const getCurrentTheme = () => d.body.classList.contains(darkTheme) ? "dark" : "light";
const getCurrentIcon = () => themeIcon.classList.contains(lightIcon) ? darkIcon : lightIcon;

if (selectedTheme) {
    d.body.classList[selectedTheme === "dark" ? "add" : "remove"](darkTheme);
    themeIcon.classList[selectedIcon === darkIcon ? "add" : "remove"](lightIcon);
}

themeBtn.addEventListener('click', () => {
    d.body.classList.toggle(darkTheme);
    themeIcon.classList.toggle(lightIcon);

    localStorage.setItem('selected-theme', getCurrentTheme());
    localStorage.setItem('selected-icon', getCurrentIcon());
});


/********* WORD SECTION *********/

const apiURL = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const wordContainer = d.querySelector(".main");
const audioUS = d.getElementById("audio-us");
const audioUK = d.getElementById("audio-uk");
const searchBtn = d.querySelector(".search-btn");
const searchInput = d.getElementById("search-input");

searchBtn.addEventListener("click", initiateSearch);

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        initiateSearch();
    }
});

function initiateSearch() {
    if (searchInput.value) {
        fetch(`${apiURL}${searchInput.value}`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);

                wordContainer.innerHTML = `
                    <h2 class="word__title">${searchInput.value}</h2>

                    <p class="transcription">
                        <span class="transcription__dialect">US</span>  
                        <i class="ri-volume-up-line transcription__audio-btn" id="audio-btn-us"></i>
                        <span class="transcription__text">${data[0]?.phonetics[0]?.text}</span>
                        
                        <span class="transcription__dialect">UK</span> 
                        <i class="ri-volume-up-line transcription__audio-btn" id="audio-btn-uk"></i>
                        <span class="transcription__text">${data[0]?.phonetics[1]?.text}</span>
                    </p>
                    
                    <section class="definitions">
                    </section>
                `;

                fillDefinitions(data);

                const audioBtnUS = d.getElementById("audio-btn-us");
                const audioBtnUK = d.getElementById("audio-btn-uk");

                audioUS.setAttribute("src", `${data[0]?.phonetics[0]?.audio}`);
                audioUK.setAttribute("src", `${data[0]?.phonetics[1]?.audio}`);

                audioBtnUS.addEventListener("click", () => {
                    audioUS.play();
                });
                audioBtnUK.addEventListener("click", () => {
                    audioUK.play();
                });
            })
            .catch((err) => {
                console.log(err);
                wordContainer.innerHTML = `<h3>No Definitions Found 😕</h3>`;
            });
    } 
    else {
        wordContainer.innerHTML = `<h3 id="empty-input">You haven't entered any word! Try again 🙂</h3>`;
    }
}

function fillDefinitions(data) {
    const definitions = d.querySelector(".definitions");

    for (const result of data) {
        for (const partOfSpeech of result.meanings) {
            element("h3")
                .text(partOfSpeech.partOfSpeech)
                .class("definition__part-of-speech")
                .addTo(definitions);
            element("h4")
                .text("Meaning")
                .class("definition__meaning-label")
                .addTo(definitions);
            const ul = element("ul")
                .class("definition__meaning-list")
                .addTo(definitions);

            for (const def of partOfSpeech.definitions) {
                const li = element("li").addTo(ul);
                const defText = element("p")
                    .text(def.definition)
                    .class("definition__text")
                    .addTo(li);
                
                if (def.example) {
                element("p")
                    .text(def.example)
                    .class("definition__example")
                    .addTo(li);
                }

                if (def.synonyms.length) {
                    element("h4")
                        .text("Synonyms")
                        .class("definition__synonym-label")
                        .addTo(li);
                    const defSynUl = element("ul")
                        .class("definition__synonym-list")
                        .addTo(li);
                    for (const syn of def.synonyms) {
                        const li = element("li")
                            .class("definition__synonym")
                            .addTo(defSynUl);
                        element("a")
                            .text(syn)
                            .attribute(
                                "href",
                                "#"
                            )
                            .addTo(li);
                    }
                }

                if (def.antonyms.length) {
                    element("h4")
                        .text("Antonyms")
                        .class("definition__antonym-label")
                        .addTo(li);
                    const defAntUl = element("ul")
                        .class("definition__antonym-list")
                        .addTo(li);

                    for (const ant of def.antonyms) {
                        const li = element("li").class("definition__antonym").addTo(li);
                        element("a")
                        .text(ant)
                        .attribute(
                            "href",
                            "#"
                        )
                        .addTo(li);
                    }
                }
            }

            if (partOfSpeech.synonyms.length) {
                const div = element("div").addTo(definitions);

                element("h3")
                    .text("Synonyms")
                    .class("definition__synonym-label")
                    .addTo(div);
                const synUl = element("ul")
                    .class("definition__synonym-list")
                    .addTo(div);

                for (const syn of partOfSpeech.synonyms) {
                    const li = element("li")
                        .class("definition__synonym")
                        .addTo(synUl);
                    element("a")
                        .text(syn)
                        .attribute(
                            "href",
                            "#"
                        )
                        .addTo(li);
                }
            }

            if (partOfSpeech.antonyms.length) {
                const div = element("div").addTo(definitions);
                    element("h3")
                        .text("Antonyms")
                        .class("definition__antonym-label")
                        .addTo(div);
                const antUl = element("ul")
                    .class("definition__antonym-list")
                    .addTo(div);

            for (const ant of partOfSpeech.antonyms) {
                const li = element("li")
                    .class("definition__antonym")
                    .addTo(antUl);
                element("a")
                    .text(ant)
                    .attribute(
                        "href",
                        "#"
                    )
                    .addTo(li);
            }
        }
    }
  }
}