
function createChunkChart(times, chunckCounts) {
  const ctx = document.getElementById('myChart').getContext('2d');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: times,
      datasets: [
        {
          label: 'Chunk Creation Time',
          data: chunckCounts,
          borderColor: "red",
          borderWidth: 1,
          fill: false,
        },
      ],
    },    
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Every 60 seconds',
          },
        },
        y: {
          title: {
            display: true,
            text: 'No of chunks',
          },
        },  
      },
    },
  });
}

