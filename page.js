const PROJECTS_LINK = "<a href='#projects' id='nav-link' class='fa fa-wrench' aria-hidden='true'><p>projects</p></a>";
const BIO_LINK = "<a href='#' id='nav-link' class='fa fa-info-circle' aria-hidden='true'><p>bio</p></a>";

const calculateAge = function() {
    const BDAY = new Date(1992, 11);
    const CURR = new Date(Date.now());
    const diff = Math.abs(CURR.getTime() - BDAY.getTime());
    const age = Math.floor(diff/31557600000)
    return age;
}

const renderProject = function(project) {
    let repo = project.data('repo');
    let owner = project.data('owner');
    if (repo && owner) {
        let apiEndpoint = `https://api.github.com/repos/${owner}/${repo}/commits`;
        $.get(apiEndpoint, function(commits) {
            var date = new Date(Date.parse(commits[0].commit.author.date));
            project.text(' - latest commit ' + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear());
            project.prepend($('<i class="fa fa-github"></i>'));
        });
    }
}

const renderProjectURLS = function() {
    let projects = $('.project-header > h2:nth-of-type(2)');

    for (var i = 0; i < projects.length; i++) {
        let project = $(projects[i]);
        renderProject(project);
    }
}

const renderAgeText = function() {
    let text = 'is a ' + calculateAge() +
    '-year-old software developer who spends most of his spare time playing \
    video games and rock climbing. \
    Sometimes he tries to be creative through music and other means. \
    He likes coffee and hip hop and has never taken a long walk on the beach.';

    $('#bio').text(text);
}

const renderProjects = function() {
    $('#text-section').load('./projects.html', renderProjectURLS);
    $('#nav-link').replaceWith(BIO_LINK);
}

const renderBio = function() {
    $('#text-section').load('./bio.html', renderAgeText);
    $('#nav-link').replaceWith(PROJECTS_LINK);
}

const renderPage = function() {
    if (window.location.hash == '') {
        renderBio();
    } else if (window.location.hash = 'projects') {
        renderProjects();
    }
}

$(window).on('load', renderPage);
$(window).on('hashchange', renderPage);
