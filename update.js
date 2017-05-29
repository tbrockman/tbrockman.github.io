var BDAY = new Date(1992, 11);
var CURR = new Date(Date.now());

function query_age() {
    var diff = Math.abs(CURR.getTime() - BDAY.getTime());
    var age = Math.floor(diff/31557600000)
    return age;
}

function update_age_text(age) {
    var text = "I'm a " + age +
    "-year-old software developer who spends most of his time playing video games and rock climbing. \
    Sometimes I try to be creative through music and other mediums. \
    I like coffee and hip hop and have never taken a long walk on the beach.";

    var ele = document.getElementById("bio");
    ele.innerHTML = text;
    return text;
}

function update_copyright_text() {
    var text = "copyright © " + (CURR.getYear() + 1900) + " thedoore brockman";
    var ele = document.getElementById("copyright");
    ele.innerHTML = text;
    return text;
}

window.onload = function() {
    var age = query_age();
    update_age_text(age);
    update_copyright_text();
}
