let firstCard = undefined;
let secondCard = undefined;
var difficulty_setting = "easy";
var numElements = 6;
var numMatches = 0;
var numClicks = 0;
var numMatchesRemaining = 0;
var darktheme = false;
var playing = false;
let boardLocked = false;
let timerInterval = null;
let timeLeft = 0;
var timerLength = 100;

document.getElementById("start").addEventListener("click", () => {
  console.log("start");
  document.getElementById("difficulty").style.visibility = "hidden";
  document.getElementById("textinfo").style.visibility = "visible";
  document.getElementById("game_grid").style.visibility = "visible";

  numMatchesRemaining = numElements / 2;
  document.getElementById("numNotMatched").textContent =
    `Number of Pairs left: ${numMatchesRemaining}`;
  playing = true;
  setup();
});

document.getElementById("restart").addEventListener("click", () => {
  console.log("restart");
  document.getElementById("difficulty").style.visibility = "visible";
  document.getElementById("textinfo").style.visibility = "hidden";
  document.getElementById("game_grid").style.visibility = "hidden";

  resetPlaying();
  setNumTotal();

  document.getElementById("numClicks").textContent = "Number of Clicks: 0";
  document.getElementById("numMatched").textContent =
    "Number of Pairs Matched: 0";
  document.getElementById("numNotMatched").textContent =
    `Number of Pairs left: ${numMatchesRemaining}`;
});

document.getElementById("easy").addEventListener("click", () => {
  console.log("easy");
  difficulty_setting = "easy";
  timerLength = 100;
  numElements = 6;
  numMatchesRemaining = numElements / 2;
});

document.getElementById("medium").addEventListener("click", () => {
  console.log("medium");

  difficulty_setting = "medium";
  timerLength = 200;
  numElements = 12;
  numMatchesRemaining = numElements / 2;
});

document.getElementById("hard").addEventListener("click", () => {
  console.log("hard");
  difficulty_setting = "hard";
  timerLength = 300;
  numElements = 30;
  numMatchesRemaining = numElements / 2;
});

document.getElementById("theme").addEventListener("click", setTheme);

async function setup() {
  if (playing) {
    await gameLoop();
  }
}

function setTheme() {
  darktheme = !darktheme;

  if (darktheme === true) {
    document.getElementById("game_grid").style.backgroundColor = "black";
    document.getElementById("theme").textContent = "Toogle Light Mode";
  } else {
    document.getElementById("game_grid").style.backgroundColor = "white";
    document.getElementById("theme").textContent = "Toogle Dark Mode";
  }
}

function resetPlaying() {
  stopTimer();
  document.getElementById("game_grid").innerHTML = "";
  firstCard = undefined;
  secondCard = undefined;
  playing = false;
  boardLocked = false;
  document.getElementById("timer").textContent = "";

  numMatches = 0;
  numClicks = 0;
  numMatchesRemaining = numElements / 2;
}

function setPlaying() {
  playing = true;
}

function styleCards() {
  let cols = 3;
  if (difficulty_setting === "easy") {
    cols = 3;
  }

  if (difficulty_setting === "medium") {
    cols = 4;
  }
  if (difficulty_setting === "hard") {
    cols = 6;
  }

  const cardWidth = 100 / cols + "%";

  document.querySelectorAll(".card").forEach((card) => {
    card.style.width = cardWidth;
  });
}

function startTimer() {
  clearInterval(timerInterval);

  timeLeft = timerLength;
  document.getElementById("timer").textContent =
    `Total time: ${timerLength}. Time Left: ${timeLeft}`;

  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent =
      `Total time: ${timerLength}. Time Left: ${timeLeft}`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      boardLocked = true;
      alert("Game Over");
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

async function populateGrid() {
  const randomPokemon = function () {
    return Math.floor(Math.random() * 1024) + 1;
  };

  let currentPokemonNumber;
  let pokeArr = [];

  while (pokeArr.length < numElements) {
    currentPokemonNumber = randomPokemon();
    if (pokeArr.includes(currentPokemonNumber)) {
      continue;
    }
    pokeArr.push(currentPokemonNumber);
    pokeArr.push(currentPokemonNumber);
  }

  //basically randomizing it.
  pokeArr.sort(() => Math.random() - 0.5);

  await createCards(pokeArr);
  styleCards();
}

async function createCards(pokeArr) {
  document.getElementById("game_grid").innerHTML = "";
  let counter = 0;
  let cardCollection = "";
  for (let pokemonNum of pokeArr) {
    let response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonNum}`,
    );

    let jsonObj = await response.json();

    let card = `      
    <div class="card">
        <img id="${counter}img${pokemonNum}" class="front_face" src="${jsonObj.sprites.other["official-artwork"].front_default}" alt="pokemon ${pokemonNum}" />
        <img class="back_face" src="back.webp" alt="pokemon ${pokemonNum}" />
    </div>`;
    cardCollection += card;
    counter++;
  }
  document.getElementById("game_grid").innerHTML += cardCollection;
}

async function gameLoop() {
  setNumTotal();
  await populateGrid();
  startTimer();

  $(".card")
    .off("click")
    .on("click", function () {
      if (boardLocked) return;
      if ($(this).hasClass("flip")) return;
      if ($(this).hasClass("matched")) return;

      $(this).addClass("flip");

      if (!firstCard) {
        firstCard = $(this).find(".front_face")[0];
        return;
      }

      secondCard = $(this).find(".front_face")[0];

      boardLocked = true;
      incrementNumClicks();

      // clicked same card twice
      if (firstCard === secondCard) {
        secondCard = undefined;
        boardLocked = false;
        return;
      }

      // match
      if (firstCard.src === secondCard.src) {
        $(firstCard).parent().addClass("matched").off("click");
        $(secondCard).parent().addClass("matched").off("click");

        firstCard = undefined;
        secondCard = undefined;

        incrementNumMatches();
        boardLocked = false;
        return;
      }

      // no match
      setTimeout(() => {
        $(firstCard).parent().removeClass("flip");
        $(secondCard).parent().removeClass("flip");

        firstCard = undefined;
        secondCard = undefined;

        boardLocked = false;
      }, 1000);
    });
}

function setNumTotal() {
  document.getElementById("numTotal").textContent =
    `Total number of pairs: ${numElements / 2}`;
}
function incrementNumClicks() {
  numClicks++;
  document.getElementById("numClicks").textContent =
    `Number of Clicks: ${numClicks}`;
}

function incrementNumMatches() {
  numMatches++;
  decrementNumMatchesRemaining();

  document.getElementById("numMatched").textContent =
    `Number of Pairs Matched: ${numMatches}`;

  // power-up: every 3 matches add 20 seconds
  if (numMatches % 3 === 0) {
    timeLeft += 20;
    document.getElementById("timer").textContent =
      `Total time: ${timerLength}. Time Left: ${timeLeft}`;
  }

  // win check
  if (numMatchesRemaining === 0) {
    stopTimer();
    boardLocked = true;
    alert("You Win!");
  }
}

function decrementNumMatchesRemaining() {
  numMatchesRemaining--;

  document.getElementById("numNotMatched").textContent =
    `Number of Pairs left: ${numMatchesRemaining}`;
}

$(document).ready(setup);
