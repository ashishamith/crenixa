// ==========================================
// REUSABLE JOB COMPONENTS
// ==========================================

const PLACEHOLDER_CARD = "https://placehold.co/800x450/eaf3ff/17377a?text=Job";
const PLACEHOLDER_SMALL = "https://placehold.co/400x250/eaf3ff/17377a?text=Job";

function escapeHTML(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ------------------------------------------
// GOOGLE DRIVE THUMBNAIL URL
// (/file/d/ID/view, /open?id=ID, /uc?id=ID or a direct image link)
// ------------------------------------------

function getThumbnailUrl(value) {
    if (!value) return PLACEHOLDER_CARD;

    const url = String(value).trim();

    const match =
        url.match(/drive\.google\.com\/file\/d\/([^/]+)/) ||
        url.match(/drive\.google\.com\/open\?id=([^&]+)/) ||
        url.match(/drive\.google\.com\/uc\?.*id=([^&]+)/);

    return match
        ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`
        : url;
}


// ------------------------------------------
// CATEGORY CLASS
// ------------------------------------------

function getCategoryClass(category) {
    const value = String(category || "").toLowerCase();
    if (value.includes("non-it")) return "non-it";
    if (value.includes("intern")) return "internship";
    return "";
}


// ------------------------------------------
// JOB CARD
// ------------------------------------------

function createJobCard(job) {

    const categoryClass = getCategoryClass(job.Category);
    const thumbnail = getThumbnailUrl(job["Thumbnail URL"]);

    const title = escapeHTML(job.Title);
    const company = escapeHTML(job.Company);
    const category = escapeHTML(job.Category);
    const location = escapeHTML(job.Location);
    const experience = escapeHTML(job.Experience);
    const jobType = escapeHTML(job["Job Type"]);
    const salary = escapeHTML(job.Salary);
    const lastDate = escapeHTML(job["Last Date"]);

    return `
        <article class="job-card" data-category="${category}">

            <div class="job-image">
                <img src="${escapeHTML(thumbnail)}" alt="${title}" loading="lazy"
                     onerror="this.src='${PLACEHOLDER_CARD}'">
                ${category ? `<span class="job-category ${categoryClass}">${category}</span>` : ""}
                ${lastDate ? `<span class="job-date">${lastDate}</span>` : ""}
            </div>

            <div class="job-body">
                <h3 class="job-title">${title}</h3>

                ${company ? `<div class="job-company">${company}</div>` : ""}

                <div class="job-meta">
                    ${location ? `<span>${location}</span>` : ""}
                    ${experience ? `<span>${experience}</span>` : ""}
                </div>

                <div class="job-pills">
                    ${jobType ? `<span class="job-pill">${jobType}</span>` : ""}
                    ${salary ? `<span class="job-pill">${salary}</span>` : ""}
                </div>

                <button class="view-job" type="button"
                        data-job-title="${title}" data-job-company="${company}">
                    View Job →
                </button>
            </div>

        </article>
    `;
}


// ------------------------------------------
// POPULAR ARTICLE  (clickable → opens that job)
// ------------------------------------------

function createPopularItem(job) {

    const thumbnail = getThumbnailUrl(job["Thumbnail URL"]);

    const company = escapeHTML(job.Company);
    const experience = escapeHTML(job.Experience);
    const info = [company, experience].filter(Boolean).join(" · ");

    const href =
        `job.html?title=${encodeURIComponent(job.Title || "")}&company=${encodeURIComponent(job.Company || "")}`;

    return `
        <a class="popular-item" href="${href}">
            <img src="${escapeHTML(thumbnail)}" alt="" loading="lazy"
                 onerror="this.src='${PLACEHOLDER_SMALL}'">
            <div>
                <h4>${escapeHTML(job.Title)}</h4>
                ${info ? `<span>${info}</span>` : ""}
            </div>
        </a>
    `;
}