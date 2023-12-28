
function createCandidateChart(times, candidateCounts) {
  const ctx = document.getElementById('myChart1').getContext('2d');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: times,
      datasets: [
        {
          label: ',Candidate Creation Time',
          data: candidateCounts,
          borderColor: "blue",
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
            text: 'No of clone candidates',
          },
        },  
      },
    },
  });
}

