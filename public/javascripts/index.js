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
        var blob = new Blob([response], { type: type });

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

  $.ajax({
    method: "GET",
    url: "/file",
    success: function (response) {
      buildTable(response);
    },
  });

  const buildTable = (data) => {
    var table = document.getElementById("tableData");

    for (var i = 0; i < data.length; i++) {
      var row = `<tr>
                    <td>${data[i].name}</td>
                    <td>${data[i].date}</td>
                    <td>${i}</td>
                    <td><input onclick="location.href = '${data[i].url}'" type="submit"  name="submit" class="btn btn-success btn-sm w-2" value="DOWNLOAD"/></td>
                </tr>`;
      table.innerHTML += row;
    }
  };
});
