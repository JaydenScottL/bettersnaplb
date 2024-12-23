class Mapper {
    constructor(...initialEntries) {
      this.map = new Map(initialEntries);
    }
  
    // Example: Add a key-value pair
    set(key, value) {
      this.map.set(key, value);
    }
  
    // Example: Get the value associated with a key
    get(key) {
      return this.map.get(key);
    }
  
    // Example: Check if a key exists
    has(key) {
      return this.map.has(key);
    }
  
    // Example: Remove a key-value pair
    delete(key) {
      this.map.delete(key);
    }
  
    // Example: Get the size of the map
    size() {
      return this.map.size;
    }
}

const url = "https://www.marvelsnap.com/act/262304/process/exec/v2";

const requestData = {
    activity_id: "30111426",
    front_params: "{\"last_season\":\"0\"}",
    login_type: "no_login",
    process_id: "7301545892484553477"
};

const headers = {
    "Content-Type": "application/json",
};

const media = new Mapper(
    ["2309640753",{ttv:"sizer2654",yt:"sizer2654"}],
    ["3187018143",{ttv:"roramplays",yt:"RoramPlays"}],
    ["139040794",{ttv:"huskypuppies35"}],
    ["816264526",{ttv:"safetyblade"}],
    ["1995681132",{ttv:"evazord",yt:"Evazord"}],
    ["3067847376",{ttv:"derajn",yt:"derajn"}],
    ["2590104629",{ttv:"dekkster",yt:"DekksterSnap"}],
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
    ["1925444495",{ttv:"yowoodymj"}]
    
);

fetch(url, {
    method: "POST",
    body: JSON.stringify(requestData),
    headers: headers
})
.then(response => {
    if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
    }
    
    return response.json();
})
.then(data => {
    var rankList = data.data.at_data_source_output.value.data;

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

    for(var i = 0;i < rankList.length;i++){
        const row = document.createElement('tr');
        const tdName = document.createElement('td');
        tdName.textContent = rankList[i].indicator_0;

        const tdRank = document.createElement('td');
        tdRank.textContent = rankList[i].rank;
        const tdPoints = document.createElement('td');
        tdPoints.textContent = rankList[i].score1;
        const id = document.createElement('td');
        id.textContent = rankList[i].open_id;

        row.appendChild(tdName);
        row.appendChild(tdRank);
        row.appendChild(tdPoints);
        //row.appendChild(id);

        if(media.has(rankList[i].open_id)){
            const links = document.createElement("span");

            if(media.get(rankList[i].open_id).ttv !== undefined){
                
                const ttv = document.createElement("a");
                const ttv_ico = document.createElement("img");
                ttv_ico.src = "twitch-icon.png";
                ttv.target = "blank_";
                ttv.appendChild(ttv_ico);
                ttv.href = "https://twitch.tv/" + media.get(rankList[i].open_id).ttv;
                
                links.appendChild(ttv);
            }

            if(media.get(rankList[i].open_id).yt !== undefined){
                const yt = document.createElement("a");
                const yt_ico = document.createElement("img");
                yt_ico.src = "youtube-icon.png";
                yt.target = "blank_";
                yt.appendChild(yt_ico);
                yt.href = "https://youtube.com/@" + media.get(rankList[i].open_id).yt;
                
                links.appendChild(yt);
            }

            tdName.appendChild(links);


        }

        var region = "";

        switch(rankList[i].server_id){
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

        
    }

    table.appendChild(thead);
    table.appendChild(tbody);

  
    document.getElementsByTagName("body")[0].appendChild(table);
})
.catch(error => {
    console.error("Error:", error);
});

