$(document).ready(function (e) {

  $("#upload-magic").on("submit", function (e) {
    e.preventDefault();
    run_wait();
    $.ajax({
      type: "POST",
      url: "/file/upload",
      data: new FormData(this),
      contentType: false,
      cache: false,
      processData: false,
      success: function (response, textStatus, request) {
        var filename = "";
        var disposition = request.getResponseHeader("Content-Disposition");
        if (disposition && disposition.indexOf("attachment") !== -1) {
          var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          var matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1])
            filename = matches[1].replace(/['"]/g, "");
        }
        var type = request.getResponseHeader("Content-Type");
        
        var blob = new Blob([response], {
          type: type
        });

        if (typeof window.navigator.msSaveBlob !== "undefined") {
          // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
          window.navigator.msSaveBlob(blob, filename);
        } else {
          var URL = window.URL || window.webkitURL;
          var downloadUrl = URL.createObjectURL(blob);

          if (filename) {
            // use HTML5 a[download] attribute to specify filename
            var a = document.createElement("a");
            // safari doesn't support this yet
            if (typeof a.download === "undefined") {
              window.location = downloadUrl;
            } else {
              a.href = downloadUrl;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
            }
          } else {
            //window.location = downloadUrl;
            alert("Error")
          }
          setTimeout(function () {
            URL.revokeObjectURL(downloadUrl);
          }, 100); // cleanup
        }
        stop_wait();
      },
    });
  });

  $("#upload-pricing").on("submit", function (e) {
    e.preventDefault();
    run_wait();
    $.ajax({
      type: "POST",
      url: "/file/upload-pricing",
      data: new FormData(this),
      contentType: false,
      cache: false,
      processData: false,
      success: function (response, textStatus, request) {
        alert(JSON.stringify(response))
        stop_wait();
      }
    });
  });

  getStatus(true)
  setInterval(function () {
    getStatus();
  }, 5000);

  $.ajax({
    method: "GET",
    url: "/file",
    success: function (response) {
      buildTable(response);
    },
  });

  $("#config-form").on("submit", function (e) {
    e.preventDefault();
    run_wait();
    var formData = {
      execFrequency: $("#execFrequency").val(),
      limitRecords: $("#limitRecords").val(),
      processType: $("#processType").val(),
    };
    console.log(formData)

    $.ajax({
      method: "POST",
      dataType: 'json',
      url: "/config",
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
    url: "/status",
    success: function (response) {

      if (response.status) {
        $("#jobstatus").html(`<div class="alert alert-danger" role="alert">
        System job execution in progress - Kindly wait until completion before uploading MTG files! (Checked Every 5 seconds)
      </div>`)
      } else {
        $("#jobstatus").html(`<div class="alert alert-success" role="alert">
        No Job execution in progress! <button type="button" class="brn btn-primary btn-sm ml-6" onclick="startJob()">Start Job</button>
      </div>`)
      }
      if (init) {
        $("#execFrequency").val(response.execFrequency);
        $("#limitRecords").val(response.limitRecords);
        $("#processType").val(response.processType);
      }
    },
  });
};

const startJob = async () => {
  run_wait();
  $.ajax({
    method: "GET",
    url: "/start-task",
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
    onClose: function (el) {}
  });
}

function stop_wait(){
  $('body > div').waitMe('hide');
}