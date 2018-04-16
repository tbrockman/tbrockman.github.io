let emails = [
  {
    url:'NoAPhishing.png',
    phishing: true
  },
  {
    url:'NoAReal.png',
    phishing: false
  }
];

let currentIndex = 0;
let currentEmail;
let scores = [];

let populateScores = function() {
  for (var i = 0; i < emails.length; i++) {
    scores.push(0);
  }
}

let chooseRandomEmail = function() {
  let emailDiv = document.getElementById('email-container');
  emailDiv.firstChild.remove();
  if (emails.length > 0) {
    currentIndex = Math.floor(Math.random() * emails.length);
    currentEmail = emails[currentIndex];
    emails.splice(currentIndex, 1);
    emailDiv.appendChild(createImgForEmail(currentEmail.url));
  }
  else {
    emailDiv.innerHTML = '<div>' + scores + "</div>";
  }
}

let createImgForEmail = function(email) {
  let elem = document.createElement("img");
  elem.setAttribute("src", "emails/" + email);
  elem.setAttribute("height", "768");
  elem.setAttribute("width", "1024");
  elem.setAttribute("alt", "Potential phishing email");
  return elem;
}

let real = function() {
  if (!currentEmail.phishing) {
    scores[currentIndex] = 1;
  }
  chooseRandomEmail();
}

let hint = function() {

}

let fake = function() {
  if (currentEmail.phishing) {
    scores[currentIndex] = 1;
  }
  chooseRandomEmail();
}

window.onload = function(e) {
  populateScores();
  chooseRandomEmail();
}
