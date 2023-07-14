// import dictionarySearch from "dictionaryapi.js";

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
const audioEl = d.querySelector(".audio");
const audioUS = d.getElementById("audio-us");
const audioUK = d.getElementById("audio-uk");
const searchBtn = d.querySelector(".search-btn");

searchBtn.addEventListener("click", () => {
    let inputWord = d.getElementById("search-input").value;

    fetch(`${apiURL}${inputWord}`)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);

            wordContainer.innerHTML = `
                <h2 class="word__title">${inputWord}</h2>

                <p class="transcription">
                    <span class="transcription__dialect">US</span>  
                    <i class="ri-volume-up-line transcription__audio-btn"></i>
                    <span class="transcription__text">${data[0].phonetics[1].text}</span>
                    
                    <span class="transcription__dialect">UK</span> 
                    <i class="ri-volume-up-line transcription__audio-btn"></i>
                    <span class="transcription__text">${data[0]?.phonetics[2]?.text}</span>
                </p>

                <section class="definitions">
                    <h3 class="definition__part-of-speech">${data[0].meanings[0].partOfSpeech}</h3>
                    <h4 class="definition__meaning-label">Meaning</h4>

                    <ul class="definition__meaning-list">
                        <li>
                            <p class="definition__text">
                                ${data[0].meanings[0].definitions[0].definition}
                            </p>
                            <p class="definition__example">
                                ${data[0].meanings[0]?.definitions[0].example}
                            </p>
                        </li>
                    </ul>
                </section>
            `;

            const audioBtn = d.querySelector(".transcription__audio-btn");

            audioUS.setAttribute("src", `${data[0]?.phonetics[0].audio}`);
            audioUK.setAttribute("src", `${data[0]?.phonetics[1].audio}`);

            audioBtn.addEventListener("click", () => {
                audioEl.play();
            });
        })
        .catch(() => {
            wordContainer.innerHTML = `<h3>No Definitions Found 😕</h3>`;
        });
});