class Mapper {
    constructor(...initialEntries) {
      this.map = new Map(initialEntries);
    }

    set(key, value) {
      this.map.set(key, value);
    }

    get(key) {
      return this.map.get(key);
    }

    has(key) {
      return this.map.has(key);
    }

    delete(key) {
      this.map.delete(key);
    }

    size() {
      return this.map.size;
    }
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const allArguments = {};
urlParams.forEach((value, key) => {
  allArguments[key] = value;
});

if(allArguments.season === undefined){
    allArguments.season = 0;
}

const currentDate = new Date();
//console.log(((currentDate.getMonth() + 1) - allArguments.season));
var url = "https://marvelsnap.com/wp-json/api/v1/leaderboard?month=" + ((currentDate.getMonth() + 1) - allArguments.season) + " &year=" + currentDate.getYear() + "&region=global";



/*var pids = [
    "7301545892484553477", // global 
    "7301545174432324358", // eu 
    "7301545174432291590", // na
    "7301545892484586245",//asia 
    "7301545892484619013", //other 
];*/

var requestData = {
    activity_id: "30111426",
    front_params: "{\"last_season\":\"" + allArguments.season.toString() + "\"}",
    login_type: "no_login",
    process_id:"0"
};


const headers = {
    "Content-Type": "application/json",
};

var media = new Mapper();
var season_data = new Mapper();
var alliances = new Mapper();

async function fetchMedia(){
    try {
        const response = await fetch('https://raw.githubusercontent.com/jaydenscottl/bettersnaplb/main/media.txt');
        const data = await response.json();

        for(const key in data){
            if(data.hasOwnProperty(key)){
                media.set(key,data[key]);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }


}

async function fetchAlliances(){
    try {
        const response = await fetch('https://quiet-mountain-519c.scottieofaberoth.workers.dev');
        const data = await response.json();

        for(const key in data){
            if(data.hasOwnProperty(key)){
                alliances.set(key,data[key]);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

async function fetchBadgeData(){
    try {
        const response = await fetch('https://raw.githubusercontent.com/jaydenscottl/bettersnaplb/main/season_data/season_data.txt');
        const data = await response.json();

        for(const key in data){
            if(data.hasOwnProperty(key)){
                console.log(data[key][0]);
                season_data.set(data[key][0],data[key][1]);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }
}



var lb = new Map();
var na_lb = new Map();
var eu_lb = new Map();
var oc_lb = new Map();

var loading_icon = document.getElementById("loading");

async function fetchViaProxy(rl = true) {
    const targetUrl = encodeURIComponent(url);
    //const proxyUrl = `https://corsproxy.io/?${targetUrl}`; 
    const proxyUrl = `https://little-water-f222.scottieofaberoth.workers.dev?url=${targetUrl}`; 
    try {
      const response = await fetch(proxyUrl);
  
        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const rankList = data.results;

        for (let i = 0; i < rankList.length; i++) {
            lb.set(rankList[i].playerId, {
                id: rankList[i].playerId,
                name: rankList[i].playerName,
                sp: rankList[i].score,
                //server: rankList[i].server_id, will add later. by data saved
            });
        }

        if(rankList.length == 0 && rl){
            url = "https://marvelsnap.com/wp-json/api/v1/leaderboard?month=" + ((currentDate.getMonth()) - allArguments.season) + " &year=" + currentDate.getYear() + "&region=global";
            fetchViaProxy(false);
            return;
        }

      //console.log(data);
  
    } catch (error) {
      console.error("Could not fetch the Marvel Snap leaderboard via public proxy:", error);
    }

    document.getElementsByTagName("body")[0].removeChild(loading_icon);
    buildTable();
  }

  

async function fetchData() {

    /*try {
        const response = await fetch(url, {
            body: JSON.stringify(requestData),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        console.log(response);
    } catch (error) {
        console.error("Error:", error);
    }*/

    /*for(var k = 0;k < pids.length;k++){
        //requestData.process_id = pids[k];
        
        try {
        const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify(requestData),
            headers: headers
        });
    
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
    
        const data = await response.json();
        const rankList = data.data.at_data_source_output.value.data;
        
    
        for (let i = 0; i < rankList.length; i++) {
            lb.set(rankList[i].open_id, {
            name: rankList[i].indicator_0,
            sp: rankList[i].score1,
            server: rankList[i].server_id,
            id: rankList[i].open_id,
            role_id: rankList[i].role_id,
            timestamp: rankList[i].score2
            });

            /*switch(rankList[i].server_id){
                case "1005":
                    region = "europe";
                    eu_lb.set(rankList[i].open_id, {
                    name: rankList[i].indicator_0,
                    sp: rankList[i].score1,
                    server: rankList[i].server_id,
                    id: rankList[i].open_id,
                    role_id: rankList[i].role_id,
                    timestamp: rankList[i].score2
                    });
                break;
    
                case "1006":
                    region = "europe"; // ?
                    eu_lb.set(rankList[i].open_id, {
                    name: rankList[i].indicator_0,
                    sp: rankList[i].score1,
                    server: rankList[i].server_id,
                    id: rankList[i].open_id,
                    role_id: rankList[i].role_id,
                    timestamp: rankList[i].score2
                    });
                break;
    
                case "1004":
                    region = "oceania"; // ?
                    oc_lb.set(rankList[i].open_id, {
                    name: rankList[i].indicator_0,
                    sp: rankList[i].score1,
                    server: rankList[i].server_id,
                    id: rankList[i].open_id,
                    role_id: rankList[i].role_id,
                    timestamp: rankList[i].score2
                    });
                break;
    
                case "1002":
                    na_lb.set(rankList[i].open_id, {
                    name: rankList[i].indicator_0,
                    sp: rankList[i].score1,
                    server: rankList[i].server_id,
                    id: rankList[i].open_id,
                    role_id: rankList[i].role_id,
                    timestamp: rankList[i].score2
                    });
                break;
    
                case "1003":
                    oc_lb.set(rankList[i].open_id, {
                    name: rankList[i].indicator_0,
                    sp: rankList[i].score1,
                    server: rankList[i].server_id,
                    id: rankList[i].open_id,
                    role_id: rankList[i].role_id,
                    timestamp: rankList[i].score2
                    });
                break;
    
                case "1001":
                    na_lb.set(rankList[i].open_id, {
                    name: rankList[i].indicator_0,
                    sp: rankList[i].score1,
                    server: rankList[i].server_id,
                    id: rankList[i].open_id,
                    role_id: rankList[i].role_id,
                    timestamp: rankList[i].score2
                    });
                break;
            }*/
            
            //console.log(`Name: ${rankList[i].indicator_0}, Rank: ${i + 1} ID:${rankList[i].open_id}, RoleID: ${rankList[i].role_id}`);
/*
        }

        
        } catch (error) {
            console.error("Error:", error);
        }
    /*}
    */
    document.getElementsByTagName("body")[0].removeChild(loading_icon);
    buildTable();
}

function downloadMapObject(mapObj, fileName) {
    // Convert the map object to a JSON string
    const mapJson = JSON.stringify(mapObj);
  
    // Create a hidden anchor element
    const link = document.createElement('a');
    link.href = `data:text/json;charset=utf-8,${encodeURIComponent(mapJson)}`;
    link.download = fileName || 'map.json';
  
    // Trigger a click event to initiate the download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

function buildTable(){
    
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headerRow = document.createElement('tr');
    const thName = document.createElement('th');
    thName.textContent = "Name";
    const thRank = document.createElement('th');
    thRank.textContent = "Rank";
    const thPoints = document.createElement('th');
    thPoints.textContent = "Snap Points";
    //const thRegion = document.createElement('th');
    //thRegion.textContent = "Region";
    headerRow.appendChild(thName);
    headerRow.appendChild(thRank);
    headerRow.appendChild(thPoints);
    //headerRow.appendChild(thRegion);
    thead.appendChild(headerRow);

    const toggleButton = document.createElement('button');
    toggleButton.textContent = "Show Only Content Creators";
    let showOnlyLinks = false;

    const imageToggleButton = document.createElement('button');
    const regions = ["America", "Europe", "Oceania", "Global"];
    let currentRegionIndex = 3;

    const previousSeasonLink = document.createElement('a')
    const previousSeasonButton = document.createElement('button');
    previousSeasonLink.appendChild(previousSeasonButton);
    if(allArguments.season == 0){
        previousSeasonLink.href = "https://jaydenscottl.github.io/bettersnaplb/public/index.html?season=1";
        previousSeasonButton.textContent = "View Previous Season";
    }else{
        previousSeasonLink.href = "https://jaydenscottl.github.io/bettersnaplb/public/index.html?season=0";
        previousSeasonButton.textContent = "View Current Season";
    }

    toggleButton.onclick = function() {
        showOnlyLinks = !showOnlyLinks;
        currentRegionIndex = 3;
        imageToggleButton.textContent = `Show Region: ${regions[currentRegionIndex]}`;

        if(showOnlyLinks){
            toggleButton.textContent = "Show All Players";
        }else{   
            toggleButton.textContent = "Show Only Content Creators";
        }

        const rows = tbody.getElementsByTagName('tr');
        for (let row of rows) {
            const nameCell = row.getElementsByTagName('td')[0];
            if (showOnlyLinks && !nameCell.querySelector('a')) {
                row.style.display = 'none';
            } else if(showOnlyLinks){
                
                if(!(nameCell.innerHTML.includes("https://youtube.com") || nameCell.innerHTML.includes("https://twitch.tv"))){
                    row.style.display = 'none';
                }else{             
                    row.style.display = '';
                }
            }else{
                row.style.display = '';
            }
        }
    };
    
    imageToggleButton.textContent = `Show Region: ${regions[currentRegionIndex]}`;
    
    imageToggleButton.onclick = function() {

        toggleButton.textContent = "Show Only Content Creators";
        showOnlyLinks = false;

        currentRegionIndex = (currentRegionIndex + 1) % regions.length;
        imageToggleButton.textContent = `Show Region: ${regions[currentRegionIndex]}`;
        
        const rows = tbody.getElementsByTagName('tr');
        for (let row of rows) {
            const nameCell = row.getElementsByTagName('td')[0];
            const img = nameCell.querySelector(`img[title="${regions[currentRegionIndex].toLowerCase()}"]`);
            if (currentRegionIndex < 3 && !img) {
                row.style.display = 'none';
                
            } else {
                row.style.display = '';
            }
        }

        //console.log("Number of top 1k players in " + regions[currentRegionIndex] + " region:", Array.from(tbody.getElementsByTagName('tr')).filter(row => row.style.display !== 'none').length);
    };

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search by Name';

    searchInput.addEventListener('input', function() {

        toggleButton.textContent = "Show Only Content Creators";
        showOnlyLinks = false;
        currentRegionIndex = 3;
        imageToggleButton.textContent = `Show Region: ${regions[currentRegionIndex]}`;


        const filter = searchInput.value.toLowerCase();
        const rows = tbody.getElementsByTagName('tr');
        for (let row of rows) {
            const nameCell = row.getElementsByTagName('td')[0];
            if (nameCell) {
                const nameText = nameCell.textContent || nameCell.innerText;
                row.style.display = nameText.toLowerCase().includes(filter) ? '' : 'none';
            }
        }
    });

    thName.appendChild(searchInput);
    
    thName.appendChild(imageToggleButton);

    thName.appendChild(toggleButton);

    thName.appendChild(previousSeasonLink);

    
    const sortedByKey = new Map([...lb.entries()].sort((a, b) => b[1].sp - a[1].sp));
    
    
    /*table.onclick = function(){
        console.log(Array.from(lb));
        downloadMapObject(Array.from(lb),"output.txt");
    }*/

    createTable(sortedByKey,tbody);
    

    table.appendChild(thead);
    table.appendChild(tbody);

  
    document.getElementsByTagName("body")[0].appendChild(table);

    
}

function createTable(sortedByKey,tbody){

    if(sortedByKey.size == 0){
        const apiErrorImage = document.createElement("img");
        apiErrorImage.position = "relative";
        apiErrorImage.src = "ApiError.png";
        apiErrorImage.title = "Empty array received.";
        apiErrorImage.style.width = "80%";
        apiErrorImage.style.height = "80%";
        apiErrorImage.style.paddingLeft = "5px";
        apiErrorImage.style.paddingTop = "15px";
        tbody.appendChild(apiErrorImage);
        return;
    }
    while (tbody.firstChild) {
        tbody.removeChild(tbody.lastChild);
    }

    var rank = 1;

    sortedByKey.forEach((value, key) =>{

        if(rank > 1000){
            return;
        }

        const row = document.createElement('tr');
        const tdName = document.createElement('td');
        const tdNameSpan = document.createElement('span');
        tdNameSpan.id = 'name_span';
        let tempName = value.name.replace("%20"," ")
        if(value.name.length > 20){
            tempName = "[Missing]"
        }
        tdNameSpan.textContent = tempName;
        tdName.appendChild(tdNameSpan);

        var tempRank = rank;
        
        tdName.addEventListener('click',(event) => {
            
            var details = document.getElementById("details");
            
            if(details.style.visibility === "visible"){
                details.style.visibility = "hidden";
                return;
            }

            if (!(event.target === tdName)) {
                return;
            }
            
            details.innerHTML = ""; 

            const nameElement = document.createElement('p');
            nameElement.textContent = "Name: " + value.name.replace("%20"," ");
            details.appendChild(nameElement);

            const rankElement = document.createElement('p');
            rankElement.textContent = "Rank: " + tempRank;
            details.appendChild(rankElement);

            const pointsElement = document.createElement('p');
            pointsElement.textContent = "Snap Points: " + value.sp;
            details.appendChild(pointsElement);

            const serverIdElement = document.createElement('p');
            serverIdElement.textContent = "ID: " + value.id; 
            details.appendChild(serverIdElement);

            if (media.has(value.id)) {
                const mediaElement = document.createElement('p');
                mediaElement.textContent = "Media Links:";
                details.appendChild(mediaElement);
                
                const mediaLinks = media.get(value.id);
                if (mediaLinks.ttv) {
                    const ttvLinkP = document.createElement('p');
                    const ttvLink = document.createElement('a');
                    ttvLink.href = "https://twitch.tv/" + mediaLinks.ttv;
                    ttvLink.textContent = "https://twitch.tv/" + mediaLinks.ttv;
                    ttvLinkP.appendChild(ttvLink);
                    details.appendChild(ttvLinkP);
                }
                if (mediaLinks.yt) {
                    const ytLinkP = document.createElement('p');
                    const ytLink = document.createElement('a');
                    ytLink.href = "https://youtube.com/@" + mediaLinks.yt;
                    ytLink.textContent = "https://youtube.com/@" + mediaLinks.yt;
                    ytLinkP.appendChild(ytLink);
                    details.appendChild(ytLinkP);
                }

                if (mediaLinks.ut && mediaLinks.role_id) {
                    const utLinkP = document.createElement('p');
                    const utLink = document.createElement('a');
                    utLink.href = "https://snap.untapped.gg/en/profile/" + mediaLinks.ut + "/" + mediaLinks.role_id;
                    utLink.textContent = "https://snap.untapped.gg/en/profile/" + mediaLinks.ut + "/" + mediaLinks.role_id;
                    utLinkP.appendChild(utLink);
                    details.appendChild(utLinkP);
                }
            }

            if(alliances.has(value.name)){
                const accountRegionElement = document.createElement('p');
                accountRegionElement.textContent = "Server: " + alliances.get(value.name).account_region; 
                details.appendChild(accountRegionElement);

                const approxCollectionScoreElement = document.createElement('p');
                approxCollectionScoreElement.textContent = "Approximate Collection Score: " + alliances.get(value.name).collection_score; 
                details.appendChild(approxCollectionScoreElement);

                const allianceTagElement = document.createElement('p');
                allianceTagElement.textContent = "Alliance Tag: " + alliances.get(value.name).tag; 
                details.appendChild(allianceTagElement);

                const allianceNameElement = document.createElement('p');
                allianceNameElement.textContent = "Alliance Name: " + alliances.get(value.name).alliance_name; 
                details.appendChild(allianceNameElement);
            }

            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close';
            closeButton.onclick = function() {
                details.style.visibility = 'hidden'; 
            };
            details.appendChild(closeButton);

            details.style.left = event.pageX + 'px';
            details.style.top = event.pageY + 'px';
            details.style.visibility = 'visible'; 
        });

        const tdRank = document.createElement('td');
        tdRank.textContent = rank;
        value.rank = rank.toString();

        if(rank > 1000){
            const qm = document.createElement("img");
            qm.src = "question-icon.png";
            qm.title = "Rank beyond 1000 is only based on available data and may not be accurate.";
            tdRank.appendChild(qm);

        }

        const tdPoints = document.createElement('td');
        tdPoints.textContent = value.sp;
        const id = document.createElement('td');
        id.textContent = value.id;

        row.appendChild(tdName);
        row.appendChild(tdRank);
        row.appendChild(tdPoints);

        var region = "";

        if(alliances.has(value.name)){
            if(alliances.get(value.name).account_region.includes("us-")){
                region = "america";
            }else if(alliances.get(value.name).account_region.includes("eu-")){
                region = "europe";
            }else if(alliances.get(value.name).account_region.includes("ap-")){
                region = "oceania";
            }

            const region_ico = document.createElement("img");
            region_ico.src = region + "-flag.png";
            region_ico.id = "icon";
            region_ico.title = region;

            tdName.appendChild(region_ico);
        }

        /*switch(value.server){
            case "1005":
                region = "europe";
            break;

            case "1006":
                region = "europe"; // ?
            break;

            case "1004":
                region = "oceania"; // ?
            break;

            case "1002":
                region = "america";
            break;

            case "1003":
                region = "oceania";
            break;

            case "1001":
                region = "america";
            break;
        }*/

        /**const region_ico = document.createElement("img");
        region_ico.src = region + "-flag.png";
        region_ico.id = "icon";
        region_ico.title = region;

        tdName.appendChild(region_ico);**/

        //const tdRegion = document.createElement("td");
        //tdRegion.textContent = region;
        //row.appendChild(tdRegion);

        

        if(media.has(value.id)){
            const links = document.createElement("span");

            if(media.get(value.id).ttv !== undefined){
                
                const ttv = document.createElement("a");
                const ttv_ico = document.createElement("img");
                ttv_ico.id = "icon";
                ttv_ico.src = "twitch-icon.png";
                ttv.target = "blank_";
                ttv.title = value.name + "'s Twitch Channel";
                ttv.appendChild(ttv_ico);
                ttv.href = "https://twitch.tv/" + media.get(value.id).ttv;
                
                links.appendChild(ttv);
            }

            if(media.get(value.id).yt !== undefined){
                const yt = document.createElement("a");
                const yt_ico = document.createElement("img");
                yt_ico.id = "icon";
                yt_ico.src = "youtube-icon.png";
                yt.target = "blank_";
                yt.title = value.name + "'s Youtube Channel";
                yt.appendChild(yt_ico);
                yt.href = "https://youtube.com/@" + media.get(value.id).yt;
                
                links.appendChild(yt);
            }

            if(media.get(value.id).ut !== undefined){
                const ut = document.createElement("a");
                const ut_ico = document.createElement("img");
                ut_ico.id = "icon";
                ut_ico.src = "untapped-icon.png";
                ut.target = "blank_";
                ut.title = value.name + "'s Untapped Profile";
                ut.appendChild(ut_ico);
                ut.href = "https://snap.untapped.gg/en/profile/" + media.get(value.id).ut + "/" + media.get(value.id).role_id;
                
                links.appendChild(ut);
            } 
            
            if(media.get(value.id).gg2025 !== undefined){
                const gg2025 = document.createElement("a");
                const gg2025_ico = document.createElement("img");
                gg2025_ico.id = "icon";
                gg2025_ico.src = "goldengauntlet2025.png";
                gg2025.target = "blank_";
                gg2025.title = "2025 Golden Gauntlet Winner";
                gg2025.appendChild(gg2025_ico);
                gg2025.href = "https://topdeck.gg/bracket/official-marvel-snap-tournament";
                links.appendChild(gg2025);
            }

            if(media.get(value.id).ggII2025 !== undefined){
                const gg2025 = document.createElement("a");
                const gg2025_ico = document.createElement("img");
                gg2025_ico.id = "icon";
                gg2025_ico.src = "goldengauntletII2025.png";
                gg2025.target = "blank_";
                gg2025.title = "2025 Golden Gauntlet II Winner";
                gg2025.appendChild(gg2025_ico);
                gg2025.href = "https://topdeck.gg/bracket/marvel-snap-golden-gauntlet-ii";
                links.appendChild(gg2025);
            }

            tdName.appendChild(links);


        }

        if(alliances.has(value.name)){
            const alliance = document.createElement("img");
            alliance.src = alliances.get(value.name).tag.toLowerCase() + ".png";
            alliance.id = "icon";
            alliance.title = alliances.get(value.name).alliance_name;
            tdName.appendChild(alliance);

            const accountRegionElement = document.createElement('p');
            accountRegionElement.textContent = "Server: " + alliances.get(value.name).account_region; 
            details.appendChild(accountRegionElement);
        }

        /*if(season_data.get(value.id) !== undefined){
            //const ps = document.createElement("span");
            //ps.className = "rankSpan";
            //ps.title = "Previous Season";
            const psImg = document.createElement("img");
            psImg.src = "previous_season.png";
            //ps.appendChild(psImg);
            console.log(season_data.get(value.id));
            psImg.textContent = season_data.get(value.id).rank;
            tdName.appendChild(psImg);
        }*/

        tbody.appendChild(row);

        rank++;
    });
}

fetchAlliances();
fetchMedia();
//fetchBadgeData();
//fetchData();
fetchViaProxy();
