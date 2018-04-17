let emails = [
  {
    url:'NoAPhishing.png',
    phishing: true
  },
  {
    url:'NoAReal.png',
    phishing: false
  },
  {
    url:'NoAPhishing.png',
    phishing: true
  },
  {
    url:'NoAReal.png',
    phishing: false
  },
  {
    url:'NoAPhishing.png',
    phishing: true
  },
  {
    url:'NoAReal.png',
    phishing: false
  },
  {
    url:'NoAPhishing.png',
    phishing: true
  },
  {
    url:'NoAReal.png',
    phishing: false
  },
  {
    url:'NoAPhishing.png',
    phishing: true
  },
  {
    url:'NoAReal.png',
    phishing: false
  },
  {
    url:'NoAPhishing.png',
    phishing: true
  },
  {
    url:'NoAReal.png',
    phishing: false
  },
  {
    url:'NoAPhishing.png',
    phishing: true
  },
  {
    url:'NoAReal.png',
    phishing: false
  },
  {
    url:'NoAPhishing.png',
    phishing: true
  },
  {
    url:'NoAReal.png',
    phishing: false
  },
];

let answered = [];
let currentEmail;
let emailContainer;
let scoreTracker;

let scoreTest = function() {
  let count = 0;
  for (var i = 0; i < answered.length; i++) {
    if (answered[i].correct) {
      count++;
    }
  }
  return count;
}

let endTest = function() {
  emailContainer.innerHTML = '<div>' + scoreTest() + "</div>";
  buttons = document.getElementsByClassName("email-buttons");
  buttons[0].outerHTML = "";
  delete buttons;
}

let renderScoreTracker = function() {
  scoreTracker.innerHTML = "";
  for (var i = 0; i < emails.length + answered.length; i++) {
    let div = document.createElement("div");
    let count = document.createElement("div");
    count.innerHTML = i + 1;
    count.setAttribute("class", "test-count");
    let icon = document.createElement("i");
    if (i >= answered.length) {
      icon.setAttribute("class", "far fa-circle");
    }
    else {
      if (answered[i].correct ) {
        icon.setAttribute("class", "fas fa-check-circle");
      }
      else {
        icon.setAttribute("class", "far fa-times-circle");
      }
    }
    div.appendChild(count);
    div.appendChild(icon);
    scoreTracker.appendChild(div);
  }
}

let chooseRandomEmail = function() {
  renderScoreTracker();
  emailContainer.firstChild.remove();
  if (emails.length > 0) {
    let index = Math.floor(Math.random() * emails.length);
    currentEmail = emails[index];
    emails.splice(index, 1);
    emailContainer.appendChild(createImgForEmail(currentEmail.url));
  }
  else {
    endTest();
  }
}

let createImgForEmail = function(email) {
  let elem = document.createElement("img");
  elem.setAttribute("src", "emails/" + email);
  elem.setAttribute("alt", "Potential phishing email");
  return elem;
}

let real = function() {
  currentEmail.correct = (currentEmail.phishing == false);
  answered.push(currentEmail);
  chooseRandomEmail();
}

let hint = function() {

}

let fake = function() {
  currentEmail.correct = (currentEmail.phishing == true);
  answered.push(currentEmail);
  chooseRandomEmail();
}

window.onload = function(e) {
  emailContainer = document.getElementById('email-container');
  scoreTracker = document.getElementById('score-tracker');
  chooseRandomEmail();
}
