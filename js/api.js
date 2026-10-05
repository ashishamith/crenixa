// ==========================================
// GOOGLE SHEETS API — INSTANT LOAD + LIVE UPDATE
// 1. Saved jobs show immediately (no waiting)
// 2. Fresh jobs are fetched in the background
// 3. If anything changed, the page updates itself
// ==========================================

const JOB_CACHE_KEY = "jobtide_jobs_cache";
const JOB_CACHE_TIME_KEY = "jobtide_jobs_cache_time";

let jobsRequest = null; // stops duplicate requests at the same time


function readJobCache() {
    try {
        const cached = localStorage.getItem(JOB_CACHE_KEY);
        if (!cached) return null;

        const jobs = JSON.parse(cached);
        return Array.isArray(jobs) && jobs.length ? jobs : null;
    } catch (error) {
        console.warn("Cache read failed:", error);
        return null;
    }
}


function saveJobCache(jobs) {
    try {
        localStorage.setItem(JOB_CACHE_KEY, JSON.stringify(jobs));
        localStorage.setItem(JOB_CACHE_TIME_KEY, String(Date.now()));
    } catch (error) {
        console.warn("Could not save jobs to cache:", error);
    }
}


// ------------------------------------------
// ALWAYS GET THE LATEST JOBS FROM GOOGLE SHEETS
// ------------------------------------------

function fetchJobsFromSheet() {

    if (jobsRequest) return jobsRequest;

    if (!API_URL || API_URL.includes("PASTE_YOUR")) {
        return Promise.reject(
            new Error("Google Sheets API URL has not been configured.")
        );
    }

    jobsRequest = (async () => {

        const url = API_URL + (API_URL.includes("?") ? "&" : "?") + "t=" + Date.now();
        const response = await fetch(url, { method: "GET", cache: "no-store" });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("API did not return a valid job array.");
        }

        saveJobCache(data);
        return data;

    })().finally(() => {
        jobsRequest = null;
    });

    return jobsRequest;
}


// ------------------------------------------
// FAST LOAD
// saved jobs → returned at once
// fresh jobs → loaded in background, onUpdate(newJobs) is called if changed
// ------------------------------------------

async function fetchJobs(onUpdate) {

    const cached = readJobCache();

    if (cached) {

        fetchJobsFromSheet()
            .then(fresh => {
                if (
                    typeof onUpdate === "function" &&
                    JSON.stringify(fresh) !== JSON.stringify(cached)
                ) {
                    onUpdate(fresh);
                }
            })
            .catch(error => console.warn("Background refresh failed:", error));

        return cached;
    }

    return fetchJobsFromSheet();
}