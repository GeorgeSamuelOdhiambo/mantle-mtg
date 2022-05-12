$(document).ready(function (e) {

  getStatus(true)
  setInterval(function () {
    getStatus();
  }, 5000);

  /* $.ajax({
    method: "GET",
    url: "/file",
    success: function (response) {
      buildTable(response);
    },
  }); */

  $("#config-form").on("submit", function (e) {
    e.preventDefault();
    run_wait();
    var formData = {
      execFrequency: $("#execFrequency").val(),
      limitRecords: $("#limitRecords").val()
    };
    console.log(formData)

    $.ajax({
      method: "POST",
      dataType: 'json',
      url: "/images/config",
      data: JSON.stringify(formData),
      contentType: "application/json",
      processData: false,
      success: function (response) {
        alert(JSON.stringify(response));
        stop_wait();
      }
    })
  });

  const buildTable = (data) => {
    var table = document.getElementById("tableData");

    for (var i = 0; i < data.length; i++) {
      var row = `<tr>
                    <td>${data[i].name}</td>
                    <td>${data[i].dateTime}</td>
                    <td>${data[i].recordsCount}</td>
                    <td><input onclick="location.href = '${data[i].url}'" type="submit"  name="submit" class="btn btn-success btn-sm w-2" value="DOWNLOAD"/></td>
                </tr>`;
      table.innerHTML += row;
    }
  };


});

const getStatus = async (init = false) => {

  $.ajax({
    method: "GET",
    url: "/images/status",
    success: function (response) {

      if (response.status) {
        if (init) {
          run_wait()
        }
        $("#jobstatus").html(`<div class="alert alert-danger" role="alert">
        Images download job execution in progress ${response.recordCount} - Kindly wait until completion! 
      </div>`)

      //============
      $("#jobstatus_ygo").html(`<div class="alert alert-danger" role="alert">
      Images download job execution in progress ${response.recordCount} - Kindly wait until completion! 
    </div>`)

      } else {
        stop_wait()
        $("#jobstatus").html(`<div class="alert alert-success" role="alert">
        No download job execution in progress! <button type="button" class="brn btn-primary btn-sm ml-6" onclick="startJob()">Start Downloads</button>
      </div>`)

      //============
        $("#jobstatus_ygo").html(`<div class="alert alert-success" role="alert">
        No download job execution in progress! <button type="button" class="brn btn-primary btn-sm ml-6" onclick="startJobYgo()">Start Downloads</button>
      </div>`)
      
      }
      if (init) {
        $("#execFrequency").val(response.execFrequency);
        $("#limitRecords").val(response.limitRecords);
        //$("#processType").val(response.processType);
      }
    },
  });
};

const startJob = async () => {
  run_wait();
  $.ajax({
    method: "GET",
    url: "/images/start-task",
    success: function (response) {
      getStatus()
      stop_wait();
    },
    error: function (request, status, error) {
      alert(request.responseText);
      stop_wait();
    }
  });
}

const startJobYgo = async () => {
  run_wait();
  $.ajax({
    method: "GET",
    url: "/yughio_images/start-task",
    success: function (response) {
      getStatus()
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