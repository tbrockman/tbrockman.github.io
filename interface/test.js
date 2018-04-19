let currentEmail, emailContainer, scoreTracker, hintDialog;
let answered = [];
let emails = [
  {
    url: 'dropbox.html',
    phishing: false,
    hints: [
      {
        'text':'How can you verify that an e-mail comes from a trusted source? Would a domain lookup help?',
        'putNear': '#email-info',
      },
    ],
    hintIndex: 0,
  },
  {
    url: 'afterpay.html',
    phishing: false,
    hints: [
      {
        'text': 'If all the links in the e-mail seem valid, and it comes from a valid address, it might be safe.',
        'putNear': '',
      }
    ],
    hintIndex: 0,
  },
  {
    url: 'edstem_phishing.html',
    phishing: true,
    hints: [
      {
        'text': 'Do all the links in the e-mail lead to websites on the Ed domain?',
        'putNear': '',
      },
      {
        'text': 'Is there anything out of place with the domain name of the sender?',
        'putNear': '',
      },
    ],
    hintIndex: 0,
  },
  {
    url: 'paypal_phishing.html',
    phishing: true,
    hints: [
      {
        'text':'Check out the senders e-mail, seems like a pretty weird domain for PayPal to have.',
        'putNear':'',
      },
      {
        'text':'Try inspecting the links in the e-mail, they may not lead where you think!',
        'putNear':'',
      },
      {
        'text':'Think of the tone of message, does it instill a sense of false urgency?',
        'putNear':'',
      },
    ],
    hintIndex: 0,
  },
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
  emailContainer.innerHTML = '<div>' + scoreTest() + "</div>";
  buttons = document.getElementsByClassName("email-buttons");
  buttons[0].outerHTML = "";
  delete buttons;
}

let renderAnswerFeedback = function(correct) {
  let template;
  if (correct) {
    template = "<div>\
                      <i style='margin: auto;position: absolute;top: 0; left: 0; \
                      bottom: 0; right: 0;font-size:25em;color: #3ba21f;;' \
                      class='far fa-check-circle'></i>\
                    </div>";
  }
  else {
    template = "<div>\
                      <i style='margin: auto;position: absolute;top: 0; left: 0; \
                      bottom: 0; right: 0;font-size:25em;color: #fb3d2f;' \
                      class='far fa-times-circle'></i>\
                    </div>";
  }
  let test = $(template);
  test.hide().appendTo('body').fadeIn({'duration': 100, 'done': function() {
    test.fadeOut(800);
  }});
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
