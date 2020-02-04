function factorByProb(prob) {
  var factor;
  if (prob >= 0.5) {
    factor = 0.8 + (4 * 0.6 * (1 - prob));
  } else {
    factor = 2 + (Math.exp(0.5 - prob) - 1) * 10;
  }
  return factor;
}

var gameState;

const initialProbability = 0.5;

const gameStatusSpan = document.getElementById("status-span");
const pointSpan = document.getElementById("point-span");
const factorSpan = document.getElementById("factor-span");
const probabilitySpan = document.getElementById("probability-span");
const luckyPointsSpan = document.getElementById("lucky-points");
const sliderElement = document.getElementById("slider");
const resetButton = document.getElementById("reset-button");
const playButton = document.getElementById("play-button");
const saveButton = document.getElementById("save-button");
const loadButton = document.getElementById("load-button");
const submitButton = document.getElementById("submit-button");

resetButton.addEventListener("click", resetGame);
saveButton.addEventListener("click", saveState);
loadButton.addEventListener("click", sendLoadRequest);
submitButton.addEventListener("click", submitScore);
sliderElement.addEventListener("input", update);
playButton.addEventListener("click", play);
window.addEventListener("message", handleMessage);

function play() {
  const lucky = Math.random() < gameState.probability;
  gameState.points *= round(lucky ? gameState.factor : 0, 2);
  if (round(gameState.points) != 0) {
    gameState.round += 1;
  }
  render();
}

function update() {
  gameState.probability = 1 - (sliderElement.value / 999);
  gameState.factor = factorByProb(gameState.probability);
  gameState.sliderValue = sliderElement.value;
  render();
}

function render() {
  pointSpan.innerHTML = round(gameState.points, 2);
  if (round(gameState.points) == 0) {
    gameStatusSpan.innerHTML = "Game over";
  } else {
    gameStatusSpan.innerHTML = "Round " + gameState.round;
  }
  factorSpan.innerHTML = round(gameState.factor, 2);
  probabilitySpan.innerHTML = round(gameState.probability * 100) + "%";
  luckyPointsSpan.innerHTML = round(
    gameState.points * gameState.factor
  );
}

function saveState() {
  toService("SAVE", {
    gameState: gameState,
  });
}

function sendLoadRequest() {
  toService("LOAD_REQUEST", null);
}

function submitScore() {
  toService("SCORE", {
    score: gameState.points,
  });
}

function toService(msgType, payload) {
  const base = {
    messageType: msgType,
  };
  for (let key in payload) {
    base[key] = payload[key];
  }
  window.parent.postMessage(base, "*");
}

function handleMessage(evt) {
  if (evt.data.messageType == "LOAD") {
    gameState = evt.data.gameState;
    render();
    sliderElement.value = gameState.sliderValue;
  } else if (evt.data.messageType == "ERROR") {
    console.log(evt.data.info);
  }
}

function round(value, decimals=0) {
  const fixed = value.toFixed(decimals);
  return Number.parseFloat(fixed);
}

function resetGame() {
  gameState = {
    points: 150,
    round: 1,
    probability: initialProbability,
    factor: factorByProb(initialProbability),
    sliderValue: Number.parseInt(initialProbability * 999),
  };
  sliderElement.value = gameState.sliderValue;
  render();
}

resetGame();

render();
toService("SETTING", {
  options: {
    width: 350,
    height: 400,
  }
});
