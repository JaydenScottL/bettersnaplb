const MEDIA_URL = 'https://blue-disk-0eff.scottieofaberoth.workers.dev/';
const ALLIANCES_URL = 'https://quiet-mountain-519c.scottieofaberoth.workers.dev';
const LEADERBOARD_PROXY_URL = 'https://little-water-f222.scottieofaberoth.workers.dev';
const CHART_URL_CURRENT_SEASON = 'https://muddy-salad-4dae.ytjaycr.workers.dev/';
const CHART_URL_PREVIOUS_SEASON = 'https://nameless-haze-54d7.ytjaycr.workers.dev/';

const REGIONS = ["America", "Europe", "Oceania", "Global"];
const GLOBAL_REGION_INDEX = REGIONS.length - 1;
const UNVERIFIED_RANK_THRESHOLD = 1000;
const MAX_TRUSTED_NAME_LENGTH = 20;

const urlParams = new URLSearchParams(window.location.search);
const season = Number(urlParams.get("season") ?? 0) || 0;

const currentDate = new Date();

let media = new Map();
let alliances = new Map();
const lb = new Map();

let chartData = null;
let usedMonthRolloverRetry = false;

function buildLeaderboardUrl(month, year) {
    return `https://marvelsnap.com/wp-json/api/v1/leaderboard?month=${month}&year=${year}&region=global`;
}

let leaderboardUrl = buildLeaderboardUrl(
    currentDate.getMonth() + 1 - season,
    currentDate.getFullYear()
);

async function fetchAsMap(url) {
    const response = await fetch(url);
    const data = await response.json();
    return new Map(Object.entries(data));
}

async function fetchMedia() {
    try {
        media = await fetchAsMap(MEDIA_URL);
    } catch (error) {
        console.error("Error loading media data:", error);
    }
}

async function fetchAlliances() {
    try {
        alliances = await fetchAsMap(ALLIANCES_URL);
    } catch (error) {
        console.error("Error loading alliance data:", error);
    }
}

async function fetchChartData() {
    try {
        const chartSource = season === 0 ? CHART_URL_CURRENT_SEASON : CHART_URL_PREVIOUS_SEASON;
        const response = await fetch(chartSource);
        const responseText = await response.text();
        chartData = JSON.parse(`{${responseText}}`);
    } catch (error) {
        console.error("Error loading chart data:", error);
        chartData = null;
    }
}

async function fetchLeaderboard() {
    const proxyUrl = `${LEADERBOARD_PROXY_URL}?url=${encodeURIComponent(leaderboardUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        const data = await response.json();
        const rankList = Array.isArray(data.results) ? data.results : [];

        if ((data.code === "invalid_month" || data.total === 0) && !usedMonthRolloverRetry) {
            usedMonthRolloverRetry = true;

            const rollsIntoPreviousYear = currentDate.getMonth() === 0;
            const month = rollsIntoPreviousYear
                ? 12 - season
                : currentDate.getMonth() - season;
            const year = rollsIntoPreviousYear
                ? currentDate.getFullYear() - 1
                : currentDate.getFullYear();

            leaderboardUrl = buildLeaderboardUrl(month, year);
            return fetchLeaderboard();
        }

        rankList.forEach((entry, index) => {
            const isDuplicateName = lb.has(entry.playerName);
            const name = isDuplicateName
                ? `${entry.playerName}(${index + 1})`
                : entry.playerName;

            lb.set(name, {
                id: `not_available${index}`,
                name: name,
                sp: entry.score,
            });
        });
    } catch (error) {
        console.error("Could not fetch the Marvel Snap leaderboard via public proxy:", error);
    }
}

function hideLoading() {
    const loadingIcon = document.getElementById("loading");
    if (loadingIcon) {
        loadingIcon.remove();
    }
}

function createTextElement(text, tagName = "p") {
    const element = document.createElement(tagName);
    element.textContent = text;
    return element;
}

function createIcon(src, title, alt) {
    const icon = document.createElement("img");
    icon.className = "icon";
    icon.src = src;
    icon.title = title;
    icon.alt = alt;
    return icon;
}

function removeIconOnError(icon) {
    icon.onerror = () => {
        const parent = icon.parentElement;
        if (parent && parent.tagName === "A") {
            parent.remove();
        } else {
            icon.remove();
        }
    };
}

function resolveRegion(alliance) {
    const accountRegion = (alliance && alliance.account_region) || "";
    if (accountRegion.includes("us-")) return "america";
    if (accountRegion.includes("eu-")) return "europe";
    if (accountRegion.includes("ap-")) return "oceania";
    return "";
}

function isContentCreator(mediaEntry) {
    return Boolean(mediaEntry && (mediaEntry.ttv !== undefined || mediaEntry.yt !== undefined));
}

function buildMediaLinks(player, mediaEntry) {
    const links = document.createElement("span");

    const addLink = (href, iconSrc, title, alt) => {
        const link = document.createElement("a");
        link.href = href;
        link.title = title;
        link.target = "_blank";
        link.rel = "noopener";
        link.appendChild(createIcon(iconSrc, title, alt));
        links.appendChild(link);
    };

    if (mediaEntry.ttv !== undefined) {
        addLink(`https://twitch.tv/${mediaEntry.ttv}`, "twitch-icon.png", `${player.name}'s Twitch Channel`, "Twitch");
    }
    if (mediaEntry.yt !== undefined) {
        addLink(`https://youtube.com/@${mediaEntry.yt}`, "youtube-icon.png", `${player.name}'s Youtube Channel`, "YouTube");
    }
    if (mediaEntry.ut !== undefined) {
        addLink(`https://snap.untapped.gg/en/profile/${mediaEntry.ut}/${mediaEntry.role_id}`, "untapped-icon.png", `${player.name}'s Untapped Profile`, "Untapped");
    }
    if (mediaEntry.gg2025 !== undefined) {
        addLink("https://topdeck.gg/bracket/official-marvel-snap-tournament", "goldengauntlet2025.png", "2025 Golden Gauntlet Winner", "Golden Gauntlet 2025");
    }
    if (mediaEntry.ggII2025 !== undefined) {
        addLink("https://topdeck.gg/bracket/marvel-snap-golden-gauntlet-ii", "goldengauntletII2025.png", "2025 Golden Gauntlet II Winner", "Golden Gauntlet II 2025");
    }
    if (mediaEntry.ggIII2025 !== undefined) {
        addLink("https://topdeck.gg/bracket/marvel-snap-golden-gauntlet-world-championship", "goldengauntletIII2025.png", "2025 Golden Gauntlet World Championship Winner", "Golden Gauntlet World Championship 2025");
    }

    return links;
}

function buildAllianceBadge(alliance) {
    const tag = (alliance.tag || "").toLowerCase();
    if (!tag) return null;

    const badge = createIcon(`${tag}.png`, alliance.alliance_name, alliance.alliance_name || "Alliance");
    removeIconOnError(badge);

    if (tag === "fak") {
        const allianceLink = document.createElement("a");
        allianceLink.href = "https://x.com/FAK_SNAP";
        allianceLink.target = "_blank";
        allianceLink.rel = "noopener";
        allianceLink.appendChild(badge);
        return allianceLink;
    }

    return badge;
}

function addDetailLink(details, href) {
    const paragraph = document.createElement("p");
    const link = document.createElement("a");
    link.href = href;
    link.textContent = href;
    paragraph.appendChild(link);
    details.appendChild(paragraph);
}

function buildChartButton(player) {
    const chartButton = document.createElement("button");
    chartButton.textContent = 'Generate SP Chart';

    chartButton.onclick = () => {
        const details = document.getElementById("details");
        details.style.visibility = 'hidden';

        if (!chartData) {
            console.warn("Chart data is not available for this player.");
            return;
        }

        const dataPoints = [];
        const labels = [];
        for (const datetime in chartData) {
            const snapshot = chartData[datetime];
            if (snapshot && snapshot[player.name] !== undefined) {
                dataPoints.push(snapshot[player.name]);
                const dateObject = new Date(parseInt(datetime, 10));
                labels.push(`${dateObject.toLocaleDateString()} ${dateObject.toLocaleTimeString()}`);
            }
        }

        document.querySelectorAll(".chart_container").forEach((node) => node.remove());

        const chartContainer = document.createElement("div");
        chartContainer.className = "chart_container";

        const chartElement = document.createElement("canvas");
        chartElement.className = "chart_";
        chartElement.id = 'chart';
        chartContainer.appendChild(chartElement);

        const closeChartButton = document.createElement("button");
        closeChartButton.textContent = 'Close';
        closeChartButton.onclick = () => chartContainer.remove();
        chartContainer.appendChild(closeChartButton);

        document.body.appendChild(chartContainer);

        if (dataPoints.length === 0) {
            chartElement.remove();
            chartContainer.appendChild(createTextElement("No chart data recorded for this player yet."));
            return;
        }

        const chart = new Chart(chartElement, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    fill: {
                        target: 'origin',
                        above: 'rgb(31, 31, 117)',
                        below: 'rgb(10,10,50)'
                    },
                    pointStyle: false,
                    borderJoinStyle: "round",
                    label: `${player.name}'s SP`,
                    data: dataPoints,
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {}
                }
            }
        });

        const chartSlider = document.createElement("input");
        chartSlider.className = "slider";
        chartSlider.type = 'range';
        chartSlider.min = 0;
        chartSlider.max = Math.max(0, dataPoints.length - 10);
        chartSlider.value = 0;
        chartSlider.oninput = () => {
            const startIndex = Number(chartSlider.value);
            chart.data.datasets[0].data = dataPoints.slice(startIndex);
            chart.data.labels = labels.slice(startIndex);
            chart.update();
        };
        chartContainer.appendChild(chartSlider);
    };

    return chartButton;
}

function populateDetails(details, player, playerId, mediaEntry, alliance, rank, event) {
    details.innerHTML = "";

    details.appendChild(createTextElement(`Name: ${player.name.replaceAll("%20", " ")}`));
    details.appendChild(createTextElement(`Rank: ${rank}`));
    details.appendChild(createTextElement(`Snap Points: ${player.sp}`));
    details.appendChild(createTextElement(`ID: ${playerId}`));

    if (mediaEntry) {
        details.appendChild(createTextElement("Media Links:"));

        if (mediaEntry.ttv) {
            addDetailLink(details, `https://twitch.tv/${mediaEntry.ttv}`);
        }
        if (mediaEntry.yt) {
            addDetailLink(details, `https://youtube.com/@${mediaEntry.yt}`);
        }
        if (mediaEntry.ut && mediaEntry.role_id) {
            addDetailLink(details, `https://snap.untapped.gg/en/profile/${mediaEntry.ut}/${mediaEntry.role_id}`);
        }
    }

    if (alliance) {
        details.appendChild(createTextElement(`Server: ${alliance.account_region}`));
        details.appendChild(createTextElement(`Approximate Collection Score: ${alliance.collection_score}`));
        details.appendChild(createTextElement(`Alliance Tag: ${alliance.tag}`));
        details.appendChild(createTextElement(`Alliance Name: ${alliance.alliance_name}`));
    }

    const closeButton = document.createElement("button");
    closeButton.textContent = 'Close';
    closeButton.onclick = () => {
        details.style.visibility = 'hidden';
    };
    details.appendChild(closeButton);

    details.appendChild(buildChartButton(player));

    details.style.left = `${event.pageX}px`;
    details.style.top = `${event.pageY}px`;
    details.style.visibility = 'visible';
}

function buildTable() {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const rowRecords = [];

    const headerRow = document.createElement('tr');
    const thName = document.createElement('th');
    thName.textContent = "Name";
    const thRank = document.createElement('th');
    thRank.textContent = "Rank";
    const thPoints = document.createElement('th');
    thPoints.textContent = "Snap Points";
    headerRow.append(thName, thRank, thPoints);
    thead.appendChild(headerRow);

    const creatorToggle = document.createElement('button');
    creatorToggle.textContent = "Show Only Content Creators";

    const regionToggle = document.createElement('button');
    regionToggle.textContent = `Show Region: ${REGIONS[GLOBAL_REGION_INDEX]}`;

    const previousSeasonLink = document.createElement('a');
    const previousSeasonButton = document.createElement('button');
    previousSeasonLink.appendChild(previousSeasonButton);

    if (season === 0) {
        if (!usedMonthRolloverRetry) {
            previousSeasonLink.href = "?season=1";
            previousSeasonButton.textContent = "View Previous Season";
        } else {
            previousSeasonLink.href = "?season=2";
            previousSeasonButton.textContent = "View Current Season";
        }
    } else {
        previousSeasonLink.href = "?season=0";
        previousSeasonButton.textContent = "View Current Season";
    }

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search by Name';

    const filterState = {
        creatorsOnly: false,
        regionIndex: GLOBAL_REGION_INDEX,
        query: ""
    };

    const applyFilters = () => {
        const query = filterState.query.trim().toLowerCase();
        const regionName = REGIONS[filterState.regionIndex].toLowerCase();
        const regionFilterActive = filterState.regionIndex !== GLOBAL_REGION_INDEX;

        for (const record of rowRecords) {
            const isVisible =
                (!filterState.creatorsOnly || record.isCreator) &&
                (!regionFilterActive || record.region === regionName) &&
                (query === "" || record.searchText.toLowerCase().includes(query));

            const display = isVisible ? '' : 'none';
            if (record.row.style.display !== display) {
                record.row.style.display = display;
            }
        }
    };

    creatorToggle.onclick = () => {
        filterState.creatorsOnly = !filterState.creatorsOnly;
        creatorToggle.textContent = filterState.creatorsOnly
            ? "Show All Players"
            : "Show Only Content Creators";
        applyFilters();
    };

    regionToggle.onclick = () => {
        filterState.regionIndex = (filterState.regionIndex + 1) % REGIONS.length;
        regionToggle.textContent = `Show Region: ${REGIONS[filterState.regionIndex]}`;
        applyFilters();
    };

    searchInput.addEventListener('input', () => {
        filterState.query = searchInput.value;
        applyFilters();
    });

    thName.appendChild(searchInput);
    thName.appendChild(regionToggle);
    thName.appendChild(creatorToggle);
    thName.appendChild(previousSeasonLink);

    const sortedPlayers = [...lb.values()].sort((a, b) => b.sp - a.sp);

    if (sortedPlayers.length === 0) {
        const noticeRow = document.createElement('tr');
        const noticeCell = document.createElement('td');
        noticeCell.colSpan = 3;
        noticeCell.className = 'empty_notice';
        noticeCell.textContent = "No leaderboard data available right now. Please try again later.";
        noticeRow.appendChild(noticeCell);
        tbody.appendChild(noticeRow);
    }

    let rank = 1;
    for (const player of sortedPlayers) {
        const alliance = alliances.get(player.name) ?? null;
        const playerId = alliance ? alliance.id : player.id;
        const mediaEntry = media.get(playerId) ?? null;
        const region = resolveRegion(alliance);

        const row = document.createElement('tr');
        const tdName = document.createElement('td');
        const nameSpan = document.createElement('span');
        nameSpan.className = 'name_span';

        const searchText = player.name.length > MAX_TRUSTED_NAME_LENGTH
            ? "[Missing]"
            : player.name.replaceAll("%20", " ");
        nameSpan.textContent = searchText;
        tdName.appendChild(nameSpan);

        const rowRank = rank;
        tdName.addEventListener('click', (event) => {
            const details = document.getElementById("details");

            if (details.style.visibility === "visible") {
                details.style.visibility = "hidden";
                return;
            }

            if (event.target !== tdName) {
                return;
            }

            populateDetails(details, player, playerId, mediaEntry, alliance, rowRank, event);
        });

        const tdRank = document.createElement('td');
        tdRank.textContent = rowRank;

        if (rowRank > UNVERIFIED_RANK_THRESHOLD) {
            const questionIcon = createIcon(
                "question-icon.png",
                "Rank beyond 1000 is only based on available data and may not be accurate.",
                ""
            );
            tdRank.appendChild(questionIcon);
        }

        const tdPoints = document.createElement('td');
        tdPoints.textContent = player.sp;

        if (region) {
            tdName.appendChild(createIcon(`${region}-flag.png`, region, `${region} region`));
        }

        if (mediaEntry) {
            const links = buildMediaLinks(player, mediaEntry);
            if (links.children.length > 0) {
                tdName.appendChild(links);
            }
        }

        const allianceBadge = alliance ? buildAllianceBadge(alliance) : null;
        if (allianceBadge) {
            tdName.appendChild(allianceBadge);
        }

        row.append(tdName, tdRank, tdPoints);
        tbody.appendChild(row);

        rowRecords.push({
            row: row,
            searchText: searchText,
            isCreator: isContentCreator(mediaEntry),
            region: region
        });

        rank++;
    }

    table.appendChild(thead);
    table.appendChild(tbody);
    document.body.appendChild(table);
}

async function fetchData() {
    fetchChartData();

    await Promise.all([fetchAlliances(), fetchMedia(), fetchLeaderboard()]);

    hideLoading();
    buildTable();
}

fetchData();
