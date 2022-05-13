$(document).ready(function (e) {
    $("#upload-yughio").on("submit", function (e) {
        e.preventDefault();
        run_wait();
        $.ajax({
          type: "POST",
          url: "/yugioh/file/upload",
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
          error: function(xhr, textStatus, error){
              console.log(xhr.statusText);
              console.log(textStatus);
              console.log(error);
              alert(error)
              stop_wait()
          }
        });
      });
});


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