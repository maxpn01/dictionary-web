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
searchInput.addEventListener("keydown", handleSearchInputKeydown);

function initiateSearch() {
    if (searchInput.value) {
        fetch(`${apiURL}${searchInput.value}`)
            .then((response) => response.json())
            .then(handleApiData)
            .catch(err => handleError(err, "error-msg", "No Definitions Found 😕"));
    } else {
        displayMessage(wordContainer, "h3", "empty-input", "You haven't entered any word! Try again 😊");
    }
}

function handleApiData(data) {
    console.log(data);
    const phonetics = data[0]?.phonetics || [];

    wordContainer.innerHTML = `
        <h2 class="word__title">${data[0]?.word || ""}</h2>

        <p class="transcription">
            ${renderTranscription("US", phonetics[0])}
            ${renderTranscription("UK", phonetics[1])}
        </p>

        <section class="definitions">
        </section>
    `;

    searchInput.value = "";

    fillDefinitions(data);

    setAudioSource(audioUS, phonetics[0]?.audio);
    setAudioSource(audioUK, phonetics[1]?.audio);

    const audioBtnUS = d.getElementById("audio-btn-us");
    const audioBtnUK = d.getElementById("audio-btn-uk");
    const transcriptionEl = d.querySelector(".transcription");

    audioBtnUS.addEventListener("click", () => audioUS.play());
    audioBtnUK.addEventListener("click", () => audioUK.play());
}


function renderTranscription(dialect, phonetic) {
    return `
        <span class="transcription__dialect">${dialect}</span>
        <i class="ri-volume-up-line transcription__audio-btn" id="audio-btn-${dialect.toLowerCase()}"></i>
        <span class="transcription__text">${phonetic?.text}</span>
    `;
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

            const divSynonyms = element("div").addTo(definitions);
            const divAntonyms = element("div").addTo(definitions);

            partOfSpeech.definitions.forEach((def) => {
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
            });

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
                        .addTo(li)
                        .addEventListener("click", (event) => {
                            event.preventDefault();
                            initiateSearchForRelatedWord(syn);
                        });
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
                        .addTo(li)
                        .addEventListener("click", (event) => {
                            event.preventDefault();
                            initiateSearchForRelatedWord(ant);
                        });
                }
            }
        }
    }
}

function initiateSearchForRelatedWord(relatedWord) {
    fetch(`${apiURL}${relatedWord}`)
        .then((response) => response.json())
        .then((data) => {handleApiData(data)})
        .catch(handleError);
}

function setAudioSource(audioElement, source) {
    if (audioElement && source)
        audioElement.setAttribute("src", source);
}

function handleError(err, id, msg) {
    console.error(err);
    displayMessage(wordContainer, "h3", id, msg);
}

function displayMessage(el, textEl, id, msg) {
    el.innerHTML = `<${textEl} id="${id}">${msg}</${textEl}>`;
}

function handleSearchInputKeydown(event) {
    if (event.key === "Enter") {
        initiateSearch();
    }
}