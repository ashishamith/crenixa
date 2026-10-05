// ==========================================
// JOBTIDE HOME PAGE
// ==========================================

let allJobs = [];
let currentFilter = "All";
let currentSearch = "";


// ==========================================
// DOM ELEMENTS
// ==========================================

const jobGrid = document.getElementById("jobGrid");
const jobsLoading = document.getElementById("jobsLoading");
const jobsEmpty = document.getElementById("jobsEmpty");
const mobileMenuButton = document.getElementById("mobileMenuButton");
const mobileMenu = document.getElementById("mobileMenu");


// ==========================================
// LOAD JOBS
// saved jobs appear instantly, then the page
// updates itself when Google Sheets has changes
// ==========================================

function applyJobs(jobs) {
    allJobs = jobs;
    renderJobs();
    renderPopularJobs();
}

async function loadJobs() {

    try {
        showLoading();

        applyJobs(await fetchJobs(applyJobs));

    } catch (error) {
        console.error("Unable to load jobs:", error);

        jobGrid.innerHTML = "";
        jobsLoading.hidden = true;
        jobsEmpty.hidden = false;
        jobsEmpty.textContent = "Unable to load jobs. Please try again.";
    }
}


// ==========================================
// FILTER + SEARCH
// ==========================================

function getFilteredJobs() {

    const search = currentSearch.trim().toLowerCase();

    return allJobs.filter(job => {

        const categoryMatch =
            currentFilter === "All" ||
            String(job.Category || "").trim() === currentFilter;

        const searchableText = [
            job.Title,
            job.Company,
            job.Category,
            job.Location,
            job.Experience,
            job["Job Type"],
            job.Salary
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return categoryMatch && (!search || searchableText.includes(search));
    });
}


// ==========================================
// RENDER JOBS
// ==========================================

function renderJobs() {

    const jobs = getFilteredJobs();

    jobsLoading.hidden = true;

    if (!jobs.length) {
        jobGrid.innerHTML = "";
        jobsEmpty.hidden = false;
        jobsEmpty.textContent = "No jobs found.";
        return;
    }

    jobsEmpty.hidden = true;
    jobGrid.innerHTML = jobs.map(createJobCard).join("");
}


// ==========================================
// POPULAR JOBS
// ==========================================

function renderPopularJobs() {

    const popularList = document.getElementById("popularList");
    if (!popularList) return;

    popularList.innerHTML = allJobs.slice(0, 5).map(createPopularItem).join("");
}


// ==========================================
// LOADING
// ==========================================

function showLoading() {
    jobsLoading.hidden = false;
    jobsEmpty.hidden = true;
    jobGrid.innerHTML = "";
}


// ==========================================
// SCROLL TO JOBS
// ==========================================

function scrollToJobs() {
    document.getElementById("jobs")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ==========================================
// FILTER BUTTONS
// ==========================================

document.querySelectorAll(".filter-button").forEach(button => {
    button.addEventListener("click", () => {

        document.querySelectorAll(".filter-button")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        currentFilter = button.dataset.filter || "All";
        renderJobs();
    });
});


// ==========================================
// HERO SEARCH (button + Enter key)
// ==========================================

function performSearch() {

    const heroSearch = document.getElementById("heroSearch");
    currentSearch = heroSearch ? heroSearch.value : "";

    renderJobs();
    scrollToJobs();
}

document.getElementById("heroSearchButton")
    ?.addEventListener("click", performSearch);

document.getElementById("heroSearch")
    ?.addEventListener("keydown", event => {
        if (event.key === "Enter") performSearch();
    });


// ==========================================
// CATEGORY CARDS
// ==========================================

document.querySelectorAll(".category-card").forEach(card => {
    card.addEventListener("click", () => {

        currentFilter = card.dataset.category || "All";

        document.querySelectorAll(".filter-button").forEach(button => {
            button.classList.toggle("active", button.dataset.filter === currentFilter);
        });

        renderJobs();
        scrollToJobs();
    });
});


// ==========================================
// VIEW JOB  → job.html?title=...&company=...
// ==========================================

document.addEventListener("click", event => {

    const button = event.target.closest(".view-job");
    if (!button) return;

    const title = String(button.dataset.jobTitle || "").trim();
    const company = String(button.dataset.jobCompany || "").trim();

    const job = allJobs.find(item =>
        String(item.Title || "").trim() === title &&
        String(item.Company || "").trim() === company
    );

    if (!job) {
        console.error("Job could not be found.");
        return;
    }

    window.location.href =
        `job.html?title=${encodeURIComponent(job.Title || "")}&company=${encodeURIComponent(job.Company || "")}`;
});


// ==========================================
// MOBILE MENU
// ==========================================

mobileMenuButton?.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
});

mobileMenu?.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => mobileMenu.classList.remove("open"));
});


// ==========================================
// LIVE UPDATE  (every 30 seconds + when you return to the tab)
// ==========================================

async function refreshJobs() {
    try {
        const fresh = await fetchJobsFromSheet();
        if (JSON.stringify(fresh) !== JSON.stringify(allJobs)) applyJobs(fresh);
    } catch (error) {
        console.warn("Live refresh failed:", error);
    }
}

setInterval(() => {
    if (!document.hidden) refreshJobs();
}, 30000);

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshJobs();
});


// ==========================================
// START HOME PAGE
// ==========================================

loadJobs();