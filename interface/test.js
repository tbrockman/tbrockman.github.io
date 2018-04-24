let currentEmail, emailContainer, scoreTracker, hintDialog;
let answered = [];
let emails = [
  {
    url: 'dropbox.html',
    phishing: true,
    hintIndex: 0,
    hints: [
      {
        text: 'Sometimes text isn\'t what it appears. Try copying the senders domain into your browser.',
        putNear: '',
      },
      {
        text: 'Where does the link to verify lead?',
        putNear: '',
      }
    ],
  },
  {
    url: 'afterpay.html',
    phishing: false,
    hintIndex: 0,
    hints: [
      {
        text: 'If all the links in the e-mail seem valid, and it comes from a valid address, it might be safe.',
        putNear: '',
      }
    ],
  },
  {
    url: 'edstem_phishing.html',
    phishing: true,
    hintIndex: 0,
    hints: [
      {
        text: 'Do all the links in the e-mail lead to websites on the Ed domain?',
        putNear: '',
      },
      {
        text: 'Is there anything out of place with the domain name of the sender?',
        putNear: '',
      },
    ],
  },
  {
    url: 'paypal_phishing.html',
    phishing: true,
    hintIndex: 0,
    hints: [
      {
        text:'Check out the senders e-mail, seems like a pretty weird address for PayPal to have.',
        putNear:'',
      },
      {
        text:'Try inspecting the links in the e-mail, they may not lead where you think!',
        putNear:'',
      },
      {
        text:'Think of the tone of message, does it instill a sense of false urgency?',
        putNear:'',
      },
    ],
  },
  {
    url: 'aldi_phishing.html',
    phishing: true,
    hintIndex: 0,
    hints: [
      {
        text: 'Is that the official Aldi e-mail?',
        putNear: '',
      },
      {
        text: 'The links in the e-mail could be suspicious.',
        putNear: '',
      }
    ],
  },
  {
    url: 'uofs.html',
    phishing: false,
    hintIndex: 0,
    hints: [
      {
        text: 'Amanda decided to choose a course load that varied wildly from \
        her usual business courses.',
        putNear: '',
      }
    ]
  },
  {
    url: 'commbank.html',
    phishing: false,
    hintIndex: 0,
    hints: [
      {
        text: 'Sometimes organizations will have mailservers with a different \
        domain name than the main website, but that doesn\'t necessarily mean\
        that the e-mail can\'t be trusted.',
        putNear: '',
      }
    ]
  },
  {
    url: 'yashika.html',
    phishing: false,
    hintIndex: 0,
    hints: [
      {
        text: 'If you pain-stakingly examine each link in the e-mail, you\'ll \
        probably feel pretty confident about the validity of the e-mail.',
        putNear: ''
      }
    ],
  },
  {
    url: 'spotify.html',
    phishing: true,
    hintIndex: 0,
    hints: [
      {
        text: 'Where does that verify button link lead?',
        putNear: '',
      },
      {
        text: 'Why would Spotify delegate their verifaction to SheerID?',
        putNear: '',
      },
      {
        text: 'That seems like an odd domain for an e-mail from Spotify.',
        putNear: '',
      }
    ]
  }
];

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
  buttons = document.getElementsByClassName("email-buttons");
  buttons[0].outerHTML = "";
  delete buttons;
  renderFinalScoreScreen();
}

let renderAnswerFeedback = function(correct) {
  let template;
  if (correct) {
    template = "<div>\
                      <i style='margin: auto;position: absolute;top: 0; left: 0; \
                      bottom: 0; right: 0;font-size:20em;color: #3ba21f;;' \
                      class='far fa-check-circle'></i>\
                    </div>";
  }
  else {
    template = "<div>\
                      <i style='margin: auto;position: absolute;top: 0; left: 0; \
                      bottom: 0; right: 0;font-size:20em;color: #fb3d2f;' \
                      class='far fa-times-circle'></i>\
                    </div>";
  }
  let test = $(template);
  test.appendTo('body');
  setTimeout(function() {
    test.fadeOut({
      'duration': 800,
      'done': function() {
        test.remove();

      }
    });
  }, 200);
}

let renderFinalScoreScreen = function() {
  let finalScore = scoreTest();
  let percent = finalScore * 1.0 / answered.length;
  let template = {
    'message':'',
    'score':'',
    'followup':'',
  };

  template.message += "<div class='test-message";
  template.score += "<div class='test-score";
  template.followup += "<div class='test-followup";

  if (percent == 1) {
    template.message += " ace'>Congratulations!";
    template.score += " ace'><i class='fas fa-star' id='spinner'></i>";
    template.followup += " ace'>You aced the test, there's nothing more we can teach you.";
  }
  else if (percent >= 0.70 && percent < 1) {
    template.message += " good'>Good job!";
    template.score += " good'><i class='far fa-thumbs-up'></i>";
    template.followup += " good'>You identified most e-mails correctly. There's\
                           always room for improvement, but you know your stuff!"
  }
  else if (percent >= 0.5 && percent < 0.70){
    template.message += " okay'>You survived!";
    template.score += " okay'><i class='fas fa-ambulance'></i>";
    template.followup += " okay'>... but just barely. You passed the test, \
                          but you might still want to brush up a bit on \
                          your phishing knowledge.";
  }
  else {
    template.message += " bad'>Dang.";
    template.score += " bad'><i class='far fa-frown'></i>";
    template.followup += " bad'>You failed the test, you definitely will want to\
                          learn a little bit more about phishing."
  }

  template.message += "</div>";
  template.score += "<span class='correct'>" + scoreTest() + "</span>" +
              "<span class='slash'>/</span>" +
              "<span class='fraction'>" + answered.length + "</span>" +
              "</div>";
  template.follow += "</div>";

  let combined = template.message + template.score + template.followup;
  $('#email-container').html(combined);
  $('#email-container').css('justify-content', 'center')
                       .css('position','relative');
  $('#button-container').load("endoftestbuttons.html");
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
    $('#email-container').load("emails/" + currentEmail.url);
  }
  else {
    endTest();
  }
}

let real = function() {
  currentEmail.correct = (currentEmail.phishing == false);
  answered.push(currentEmail);
  renderAnswerFeedback(currentEmail.correct);
  chooseRandomEmail();
}

let hint = function() {
  if (currentEmail.hints.length > 0) {
    hintDialog.text(currentEmail.hints[currentEmail.hintIndex].text);
    currentEmail.hintIndex = (currentEmail.hintIndex + 1) % currentEmail.hints.length;
    hintDialog.dialog("open");
  }
}

let fake = function() {
  currentEmail.correct = (currentEmail.phishing == true);
  answered.push(currentEmail);
  renderAnswerFeedback(currentEmail.correct);
  chooseRandomEmail();
}

let modalCloseOnClickOutside = function() {
  $(document.body).on("click", ".ui-widget-overlay", function()
  {
      $.each($(".ui-dialog"), function()
      {
          var $dialog;
          $dialog = $(this).children(".ui-dialog-content");
          if($dialog.dialog("option", "modal"))
          {
              $dialog.dialog("close");
          }
      });
  });;
}

window.onload = function(e) {
  modalCloseOnClickOutside();
  emailContainer = document.getElementById('email-container');
  scoreTracker = document.getElementById('score-tracker');
  hintDialog = $( "#hint" );
  hintDialog.dialog({
    dialogClass: "cust-dialog",
    autoOpen: false,
    width: 500,
    modal: true,
  });
  chooseRandomEmail();
}
