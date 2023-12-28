
function createCloneChart(times, cloneCounts) {
  const ctx = document.getElementById('myChart2').getContext('2d');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: times,
      datasets: [
        {
          label: 'Clone Creation Time',
          data: cloneCounts,
          borderColor: "green",
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
            text: 'Number of expanded clones',
          },
        },  
      },
    },
  });
}


