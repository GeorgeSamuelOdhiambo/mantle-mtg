let dataES = [
  {
    name: "samuel",
    date: "11th june",
    number: 78,
    download: "download",
  },
  {
    name: "samuel",
    date: "11th june",
    number: 78,
    download: "download",
  },
  {
    name: "samuel",
    date: "11th june",
    number: 78,
    download: "download",
  },
];

fetch("https://jsonplaceholder.typicode.com/posts/1", { method: "GET" })
  .then((response) => response.json())
  .then((json) => {
    console.log(json)
    window.onload = () => {
  show(json);
};
  });


  window.onload = () => {
    show(dataES);
  };


function show(dataD) {
  var table = document.getElementById("tableData");
  // console.log(dataD);
  for (let data of dataD) {
    var row = `<tr>
  <td>${data.name}</td>
  <td>${data.date}</td>
  <td>${data.number}</td>
  <td><button>${data.download}</button></td>
</tr>`;
    table.innerHTML += row;
  }
}




const button = document.getElementById('button-addon2');

button.addEventListener('click', async _ => {
  console.log("Samuel");
  // try {     
  //   const response = await fetch('yourUrl', {
  //     method: 'post',
  //     body: {
  //       // Your body
  //     }
  //   });
  //   console.log('Completed!', response);
  // } catch(err) {
  //   console.error(`Error: ${err}`);
  // }
});
