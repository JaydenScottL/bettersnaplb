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

const url = "https://www.marvelsnap.com/act/262304/process/exec/v2";

var pids = [
    "7301545892484553477", // global 
    "7301545174432324358", // eu 
    "7301545174432291590", // na
    "7301545892484586245",//asia 
    "7301545892484619013", //other 
];

var requestData = {
    activity_id: "30111426",
    front_params: "{\"last_season\":\"" + allArguments.season.toString() + "\"}",
    login_type: "no_login",
    process_id:"0"
};

const headers = {
    "Content-Type": "application/json",
};

const media = new Mapper(
    ["2309640753",{ttv:"sizer2654",yt:"sizer2654",ut:"bcd75866-aa12-488e-8ed7-65349ec163cf"}],
    ["3187018143",{ttv:"roramplays",yt:"RoramPlays"}],
    ["139040794",{ttv:"huskypuppies35"}],
    ["816264526",{ttv:"safetyblade"}],
    ["1995681132",{ttv:"evazord",yt:"Evazord"}],
    ["3067847376",{ttv:"derajn",yt:"derajn",ut:"596a1089-d904-4346-a5cb-14b0412c8c73"}],
    ["2590104629",{ttv:"dekkster",yt:"DekksterSnap",ut:"cfb1628e-902e-4132-ad8f-dddb9be39698"}],
    ["885105018",{ttv:"zombiezgonomnom",yt:"ZombiesGoNomNom"}],
    ["1258972432",{ttv:"andrevar14"}],
    ["3775516060",{ttv:"spyro_za",yt:"SpyroZA"}],
    ["2972997821",{ttv:"kmbestms",yt:"KMBestInASnap"}],
    ["3443758727",{ttv:"crimeafoot"}],
    ["4135298364",{ttv:"gravebees"}],
    ["1982188250",{ttv:"kx4nsnap"}],
    ["3173190486",{ttv:"cesanasz"}],
    ["962612770",{ttv:"tuccrr"}],
    ["3828390005",{ttv:"revisms",yt:"RevisSnap"}],
    ["476075167",{ttv:"bynx_plays",yt:"Bynx_Plays"}],
    ["1925444495",{ttv:"yowoodymj"}],
    ["4017919401",{ut:"8025b655-b5d7-45c4-8472-b1e7376bc3ea"}],
    ["1898717762",{ttv:"tlsgsnap",yt:"TLSGMarvelSnap",ut:"8a4e905d-fcbd-4a29-be6a-c251f7e98aca"}],
    ["1406801013",{ttv:"braude"}],
    ["2032457780",{ttv:"jeeeeet13"}],
);

var lb = new Map();

var loading_icon = document.getElementById("loading");

async function fetchData() {

    for(var k = 0;k < pids.length;k++){
        requestData.process_id = pids[k];
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
            lb.set(rankList[i].indicator_0, {
            sp: rankList[i].score1,
            server: rankList[i].server_id,
            id: rankList[i].open_id,
            role_id: rankList[i].role_id
            });
        }

        } catch (error) {
        console.error("Error:", error);
        }
    }
    
    document.getElementsByTagName("body")[0].removeChild(loading_icon);
    buildTable();
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
    headerRow.appendChild(thName);
    headerRow.appendChild(thRank);
    headerRow.appendChild(thPoints);
    thead.appendChild(headerRow);
    
    const sortedByKey = new Map([...lb.entries()].sort((a, b) => b[1].sp - a[1].sp));

    var rank = 1;

    sortedByKey.forEach((value, key) =>{
        const row = document.createElement('tr');
        const tdName = document.createElement('td');
        const tdNameSpan = document.createElement('span');
        tdNameSpan.id = 'name_span';
        tdNameSpan.textContent = key;
        tdName.appendChild(tdNameSpan);
        
        // Add onclick event to tdName
        tdName.onclick = function() {
            var details = document.getElementById("details");
            
            
            details.innerHTML = ""; // Clear the content of details

            const nameElement = document.createElement('p');
            nameElement.textContent = "Name: " + key;
            details.appendChild(nameElement);

            const rankElement = document.createElement('p');
            rankElement.textContent = "Rank: " + rank;
            details.appendChild(rankElement);

            const pointsElement = document.createElement('p');
            pointsElement.textContent = "Snap Points: " + value.sp;
            details.appendChild(pointsElement);

            const serverIdElement = document.createElement('p');
            serverIdElement.textContent = "ID: " + value.id; 
            details.appendChild(serverIdElement);

            const serverElement = document.createElement('p');
            serverElement.textContent = "Server ID: " + value.server; 
            details.appendChild(serverElement);

            const roleIdElement = document.createElement('p');
            roleIdElement.textContent = "Role ID: " + value.role_id; 
            details.appendChild(roleIdElement);

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

                if (mediaLinks.ut) {
                    const utLinkP = document.createElement('p');
                    const utLink = document.createElement('a');
                    utLink.href = "https://snap.untapped.gg/en/profile/" + mediaLinks.ut + "/" + value.role_id;
                    utLink.textContent = "https://snap.untapped.gg/en/profile/" + mediaLinks.ut + "/" + value.role_id;
                    utLinkP.appendChild(utLink);
                    details.appendChild(utLinkP);
                }
            }
            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close';
            closeButton.onclick = function() {
                details.style.visibility = 'hidden'; // Hide the details popup
            };
            details.appendChild(closeButton);

            details.style.left = event.pageX + 'px';
            details.style.top = event.pageY + 'px';
            details.style.visibility = 'visible'; // Change true to 'visible'
            
        };

        const tdRank = document.createElement('td');
        tdRank.textContent = rank;

        if(rank > 1000){
            const qm = document.createElement("img");
            qm.src = "question-icon.png";
            qm.title = "Rank below 1000 is only based on available data and may not be accurate.";
            tdRank.appendChild(qm);

        }

        const tdPoints = document.createElement('td');
        tdPoints.textContent = value.sp;
        const id = document.createElement('td');
        id.textContent = value.id;

        row.appendChild(tdName);
        row.appendChild(tdRank);
        row.appendChild(tdPoints);

        if(media.has(value.id)){
            const links = document.createElement("span");

            if(media.get(value.id).ttv !== undefined){
                
                const ttv = document.createElement("a");
                const ttv_ico = document.createElement("img");
                ttv_ico.src = "twitch-icon.png";
                ttv.target = "blank_";
                ttv.title = key + "'s Twitch Channel";
                ttv.appendChild(ttv_ico);
                ttv.href = "https://twitch.tv/" + media.get(value.id).ttv;
                
                links.appendChild(ttv);
            }

            if(media.get(value.id).yt !== undefined){
                const yt = document.createElement("a");
                const yt_ico = document.createElement("img");
                yt_ico.src = "youtube-icon.png";
                yt.target = "blank_";
                yt.title = key + "'s Youtube Channel";
                yt.appendChild(yt_ico);
                yt.href = "https://youtube.com/@" + media.get(value.id).yt;
                
                links.appendChild(yt);
            }

            if(media.get(value.id).ut !== undefined){
                const ut = document.createElement("a");
                const ut_ico = document.createElement("img");
                ut_ico.src = "untapped-icon.png";
                ut.target = "blank_";
                ut.title = key + "'s Untapped Profile";
                ut.appendChild(ut_ico);
                ut.href = "https://snap.untapped.gg/en/profile/" + media.get(value.id).ut + "/" + value.role_id;
                
                links.appendChild(ut);
            }

            

            tdName.appendChild(links);


        }

        var region = "";

        switch(value.server){
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
        }

        const region_ico = document.createElement("img");
        region_ico.src = region + "-flag.png";
        region_ico.title = region;

        tdName.appendChild(region_ico);

        tbody.appendChild(row);

        rank++;
    });

    table.appendChild(thead);
    table.appendChild(tbody);

  
    document.getElementsByTagName("body")[0].appendChild(table);

    

}

fetchData();