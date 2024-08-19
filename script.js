let currentSong = new Audio();
let songs = [];
let currFolder;



function formatSeconds(seconds) {
  const totalSeconds = Math.floor(seconds); // Round down to the nearest whole second
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  // Pad minutes and seconds with leading zeros if necessary
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

function playMusic(track) {
  const decodedTrack = decodeURIComponent(track);
  currentSong.src = `/${currFolder}/` + track;
  currentSong.play();
  document.getElementById("play").src = "pause.svg";
  document.querySelector(".songinfo").innerHTML = decodedTrack;
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

function addSongEventListeners() {
  // Add event listeners for each song in the list
  Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML);
    });
  });
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith("mp3")) {
      let songName = element.href.split(`${folder}`)[1];
      songName = songName.startsWith("/") ? songName.substring(1) : songName; // Remove leading slash if it exists
      songs.push(songName);
    }
  }

  let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0];
  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML += `
      <li>
        <img src="music.svg" class="invert">
        <div class="info">
          <div>${decodeURIComponent(song)}</div>
          <div> By Rex </div>
        </div>
        <div class="playnow">
          <img src="play.svg" class="invert">
        </div>
      </li>`;
  }

  addSongEventListeners(); // Add event listeners for the newly generated songs
}

async function displayAlbums(){
  try {
    let a = await fetch("SONGS/");
    let response = await a.text();
    let div = document.createElement("div");
    let cardContainer = document.querySelector(".cardcontainer");
    div.innerHTML = response;
    let allas = div.getElementsByTagName("a");
    let array = Array.from(allas);

    for (let index = 0; index < array.length; index++) {
      const e = array[index];

      if(e.href.includes("/SONGS")){
        let folder = e.href.split("/").slice(-1)[0];

        // Fetch the metadata of folders
        let metadataResponse = await fetch(`SONGS/${folder}/info.json`);
        
        // Check if the response is OK
        if (!metadataResponse.ok) {
          console.error(`Failed to load metadata for ${folder}: ${metadataResponse.status}`);
          continue; // Skip this folder if there's an error
        }

        let metadata;
        try {
          metadata = await metadataResponse.json();
        } catch (jsonError) {
          console.error(`Failed to parse JSON for ${folder}:`, jsonError);
          continue; // Skip this folder if JSON is not valid
        }

        console.log("Album Info:", metadata);
        cardContainer.innerHTML += `
          <div class="card" data-folder="${folder}">
            <img src="SONGS/${folder}/cover.jpeg"/>
            <div class="playbutton">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="black">
                <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2>${metadata.title}</h2>
            <p>${metadata.description}</p>
          </div>`;
      }
    }

    // Add event listeners to the dynamically created album cards
    Array.from(document.getElementsByClassName("card")).forEach(e => {
      e.addEventListener("click", async item => {
        console.log("Album card clicked, folder:", item.currentTarget.dataset.folder);
        await getSongs(`SONGS/${item.currentTarget.dataset.folder}`);
      });
    });

  } catch (error) {
    console.error("Error displaying albums:", error);
  }
}


  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      await getSongs(`SONGS/${item.currentTarget.dataset.folder}`);
    })
  });
  


async function main() {
  // await getSongs(`SONGS/`);

  // Display card containers for albums
 displayAlbums();

  let play = document.getElementById("play");

  // Add event listener for play button
  play.addEventListener("click", () => {

    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });

  // Listen for time update event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${formatSeconds(currentSong.currentTime)}/${formatSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add event listener for seekbar
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector('.circle').style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100;
  });

  // Add event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Add event listener for previous button
  let previous = document.getElementById("previous");
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Add event listener for next button
  let next = document.getElementById("next");
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });


}

main();


