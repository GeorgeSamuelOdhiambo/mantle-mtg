$(document).ready(function (e) {

});

const startJob = async () => {
    run_wait();
    $.ajax({
        method: "GET",
        url: "/pokemon/start-task",
        success: function (response) {
            //getStatus()
            stop_wait();
        },
        error: function (request, status, error) {
            alert(request.responseText);
            stop_wait();
        }
    });
}

function run_wait() {
    $('body > div').waitMe({
        effect: 'ios',
        text: 'Please wait...',
        bg: 'rgba(255,255,255,0.7)',
        color: '#000',
        maxSize: 30,
        waitTime: -1,
        source: 'img.svg',
        textPos: 'horizontal',
        fontSize: '18px',
        onClose: function (el) { }
    });
}

function stop_wait() {
    $('body > div').waitMe('hide');
}