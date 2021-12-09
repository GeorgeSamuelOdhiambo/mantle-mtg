$(document).ready(function (e) {

  $("#upload-magic").on("submit", function (e) {
    e.preventDefault();
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
        alert(filename);
        alert(type);
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
            window.location = downloadUrl;
          }
          setTimeout(function () {
            URL.revokeObjectURL(downloadUrl);
          }, 100); // cleanup
        }
      },
    });
  });

  $("#upload-pricing").on("submit", function (e) {
    e.preventDefault();
    console.log(e);
    $.ajax({
      type: "POST",
      url: "/file/upload-pricing",
      data: new FormData(this),
      contentType: false,
      cache: false,
      processData: false,
      success: alert("Uploaded")
    });
  });

  getStatus()
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
        alert(JSON.stringify(response))
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

const getStatus = async () => {

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
      $("#execFrequency").val(response.execFrequency);
      $("#limitRecords").val(response.limitRecords);
      $("#processType").val(response.processType);
    },
  });
};

const startJob = async () => {
  $.ajax({
    method: "GET",
    url: "/start-task",
    success: function (response) {
      getStatus()
    },
    error: function (request, status, error) {
      alert(request.responseText);
    }
  });
}