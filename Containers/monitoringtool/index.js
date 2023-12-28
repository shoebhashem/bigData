const express = require('express');
const MongoClient = require('mongodb').MongoClient;

const app = express();
const port = 5000;
const mongoUrl = process.env.MONGO_URL || 'mongodb://dbstorage:27017/cloneDetector';

//declare variables
let candidateCounts = [];
let preCandidatesCount = 0;
let preClonesCount = 0;
let cloneCounts = [];
let times = [];
let preChunkCount = 0;
let chunckCounts = [];
let counter = 0;
let stopMonitoring = false;


app.set('view engine', 'ejs');
app.use('/charts', express.static('charts', { 
  setHeaders: (res, path, stat) => {
    res.set('Content-Type', 'application/javascript');
  }
}));
async function getChunkUpdates(db) {
  return new Promise((resolve, reject) => {
    db.collection('chunks').aggregate([
      {
        $group: {
          _id: "$fileName",
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          average: { $avg: "$count" }
        }
      },
      {
        $project: {
          _id: 0,
          roundedAverageChunks: { $round: ["$average", 0] }
        }
      }
    ]).toArray()
      .then(result => {
        if (result.length > 0) {
          resolve(result[0].roundedAverageChunks);
        } else {
          // Handle the case where there is no data
          resolve(0);
        }
      })
      .catch(error => {
        reject(error);
      });
  });
}


async function getCloneUpdates(db) {
  return new Promise((resolve, reject) => {
    db.collection('clones').find().toArray()
      .then(clones => {
        // Array to store the differences between endLine and startLine
        let differences = [];

        clones.forEach(clone => {
          clone.instances.forEach(instance => {
            // Calculate the difference and push it to the array
            let difference = instance.endLine - instance.startLine;
            differences.push(difference);
          });
        });

        // Calculate the average size
        let averageCloneSize = differences.reduce((total, size) => total + size, 0) / differences.length;

        // Round the averageCloneSize to the nearest integer
        let roundedAverageCloneSize = Math.round(averageCloneSize);
        // Clear the array to avoid unnecessary memory usage
        differences.length = 0;
        resolve(roundedAverageCloneSize);
      })
      .catch(error => {
        reject(error);
      });
  });
}

async function getStatusUpdates(db) {
  return new Promise((resolve, reject) => {
    db.collection('statusUpdates').find().toArray()
      .then(statusUpdates => {
        const hasSummary = statusUpdates.some(update => update.message === 'Summary');

        // If 'Summary' is found, set stopMonitoring to true
        if (hasSummary) {
          stopMonitoring = true;
        }
        resolve(statusUpdates);
      })
      .catch(error => {
        reject(error);
      });
  });
}

async function fetchData() {
  try {
    const client = await MongoClient.connect(mongoUrl);
    const db = client.db();
    const [filesCount, chunksCount, candidatesCount, clonesCount] = await Promise.all([
      db.collection('files').countDocuments(),
      db.collection('chunks').countDocuments(),
      db.collection('candidates').countDocuments(),
      db.collection('clones').countDocuments(),
    ]);
    let averageChunkSizePerFile = await getChunkUpdates(db);
    let averageCloneSize = await getCloneUpdates(db);
    let statusUpdates = await getStatusUpdates(db);

    console.log("This is counter ------------------------------------------------", times);
    let countChunks = chunksCount - preChunkCount;
    chunckCounts.push(countChunks);
    preChunkCount = chunksCount;
    let countCandidates = candidatesCount - preCandidatesCount;
    candidateCounts.push(countCandidates);
    preCandidatesCount = candidatesCount;
    let countClones = clonesCount - preClonesCount;
    cloneCounts.push(countClones);
    preClonesCount = clonesCount;

    return {
      filesCount,
      chunksCount,
      candidatesCount,
      clonesCount,
      chunckCounts,
      candidateCounts,
      cloneCounts,
      times,
      averageChunkSizePerFile,
      averageCloneSize,
      statusUpdates,
    };
  } catch (error) {
    console.error(error);
    if(client) {
      client.close();
    }
    return null;
  }
}


app.get('/', async (req, res) => {
  let data = await fetchData();
  if (data) {
    res.render('index', data);
  } else {
    res.status(500).send('Internal Server Error');
  }
});
setInterval(async () => {
  if (!stopMonitoring){
    const data = await fetchData();
    if (data) {
      console.log('Data updated:', new Date());
      counter++
      times.push(counter);
    } else {
      console.error('Failed to update data:', new Date());
    }
  }
  else{
    clearInterval;
    console.log('Monitoring stopped.')
  }
}, 60000); // 60 seconds interval

app.listen(port, () => {
  console.log(`Monitoring tool is running at http://localhost:${port}`);
});
