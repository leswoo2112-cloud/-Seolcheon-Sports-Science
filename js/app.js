/* =========================================================
   SEOLCHEON PERFORMANCE LAB
   app.js

   PART 1
   Core / Navigation / Sidebar / Toast / Storage
========================================================= */

"use strict";


/* =========================================================
   01. APP STATE
========================================================= */

const SPL = {
  currentPage: "dashboard",

  storageKeys: {
    athletes: "spl_athletes",
    records: "spl_records",
    settings: "spl_settings"
  },

  pages: {},

  initialized: false
};


/* =========================================================
   02. DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});


/* =========================================================
   03. INITIALIZE
========================================================= */

function initializeApp() {
  if (SPL.initialized) return;

  cachePages();

  initializeNavigation();
  initializeSidebar();
  initializeQuickActions();
  initializePageTargetButtons();

  updateDashboard();

  SPL.initialized = true;

  console.log(
    "%cSEOLCHEON PERFORMANCE LAB",
    "color:#4ba3ff;font-size:16px;font-weight:bold;"
  );

  console.log("SPL system initialized.");
}


/* =========================================================
   04. CACHE PAGES
========================================================= */

function cachePages() {
  const pages = document.querySelectorAll(".page");

  pages.forEach((page) => {
    if (!page.id) return;

    const pageName = page.id.replace("page-", "");

    SPL.pages[pageName] = page;
  });
}


/* =========================================================
   05. PAGE NAVIGATION
========================================================= */

function initializeNavigation() {
  const navigationButtons =
    document.querySelectorAll(".nav-item");

  navigationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const pageName =
        button.dataset.page ||
        button.dataset.pageTarget;

      if (!pageName) return;

      openPage(pageName);
    });
  });
}


function openPage(pageName) {
  const targetPage = SPL.pages[pageName];

  if (!targetPage) {
    console.warn(
      `[SPL] Page not found: ${pageName}`
    );

    return;
  }

  Object.values(SPL.pages).forEach((page) => {
    page.classList.remove("active");
  });

  targetPage.classList.add("active");

  updateActiveNavigation(pageName);

  SPL.currentPage = pageName;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  closeSidebar();

  document.dispatchEvent(
    new CustomEvent("spl:pagechange", {
      detail: {
        page: pageName
      }
    })
  );
}


/* =========================================================
   06. ACTIVE NAVIGATION
========================================================= */

function updateActiveNavigation(pageName) {
  const navigationButtons =
    document.querySelectorAll(".nav-item");

  navigationButtons.forEach((button) => {
    const buttonPage =
      button.dataset.page ||
      button.dataset.pageTarget;

    button.classList.toggle(
      "active",
      buttonPage === pageName
    );
  });
}


/* =========================================================
   07. GENERIC PAGE TARGET BUTTONS
========================================================= */

function initializePageTargetButtons() {
  const buttons =
    document.querySelectorAll(
      "[data-page-target]:not(.nav-item)"
    );

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const target =
        button.dataset.pageTarget;

      if (!target) return;

      openPage(target);
    });
  });
}


/* =========================================================
   08. QUICK ACTIONS
========================================================= */

function initializeQuickActions() {
  const quickButtons =
    document.querySelectorAll(".quick-card");

  quickButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target =
        button.dataset.page ||
        button.dataset.pageTarget;

      if (!target) return;

      openPage(target);
    });
  });
}


/* =========================================================
   09. SIDEBAR
========================================================= */

function initializeSidebar() {
  const menuButton =
    document.querySelector(".mobile-menu");

  const sidebar =
    document.querySelector(".sidebar");

  if (!sidebar) return;

  if (menuButton) {
    menuButton.addEventListener(
      "click",
      (event) => {
        event.stopPropagation();

        sidebar.classList.toggle("open");

        document.body.classList.toggle(
          "no-scroll",
          sidebar.classList.contains("open")
        );
      }
    );
  }

  document.addEventListener(
    "click",
    (event) => {
      if (
        window.innerWidth > 800 ||
        !sidebar.classList.contains("open")
      ) {
        return;
      }

      if (
        sidebar.contains(event.target) ||
        menuButton?.contains(event.target)
      ) {
        return;
      }

      closeSidebar();
    }
  );

  window.addEventListener(
    "resize",
    () => {
      if (window.innerWidth > 800) {
        closeSidebar();
      }
    }
  );
}


function closeSidebar() {
  const sidebar =
    document.querySelector(".sidebar");

  if (!sidebar) return;

  sidebar.classList.remove("open");

  document.body.classList.remove(
    "no-scroll"
  );
}


/* =========================================================
   10. TOAST
========================================================= */

let toastTimer = null;


function showToast(
  message,
  type = "success",
  duration = 2400
) {
  const toast =
    document.getElementById("toast");

  const messageElement =
    document.getElementById("toastMessage");

  if (!toast || !messageElement) {
    console.log(message);
    return;
  }

  messageElement.textContent = message;

  const icon =
    toast.querySelector("i");

  toast.classList.remove(
    "success",
    "warning",
    "error"
  );

  toast.classList.add(type);

  if (icon) {
    if (type === "error") {
      icon.className =
        "fa-solid fa-circle-exclamation";
    } else if (type === "warning") {
      icon.className =
        "fa-solid fa-triangle-exclamation";
    } else {
      icon.className =
        "fa-solid fa-circle-check";
    }
  }

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}


/* =========================================================
   11. STORAGE - GET
========================================================= */

function getStorageData(key, fallback = []) {
  try {
    const raw =
      localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.error(
      "[SPL] Storage read error:",
      error
    );

    return fallback;
  }
}


/* =========================================================
   12. STORAGE - SET
========================================================= */

function setStorageData(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    return true;
  } catch (error) {
    console.error(
      "[SPL] Storage save error:",
      error
    );

    showToast(
      "데이터 저장 중 오류가 발생했습니다.",
      "error"
    );

    return false;
  }
}


/* =========================================================
   13. ATHLETE STORAGE HELPERS
========================================================= */

function getAthletes() {
  return getStorageData(
    SPL.storageKeys.athletes,
    []
  );
}


function saveAthletes(athletes) {
  const success =
    setStorageData(
      SPL.storageKeys.athletes,
      athletes
    );

  if (success) {
    document.dispatchEvent(
      new CustomEvent(
        "spl:athletesupdated",
        {
          detail: {
            athletes
          }
        }
      )
    );

    updateDashboard();
  }

  return success;
}


/* =========================================================
   14. RECORD STORAGE HELPERS
========================================================= */

function getRecords() {
  return getStorageData(
    SPL.storageKeys.records,
    []
  );
}


function saveRecords(records) {
  const success =
    setStorageData(
      SPL.storageKeys.records,
      records
    );

  if (success) {
    document.dispatchEvent(
      new CustomEvent(
        "spl:recordsupdated",
        {
          detail: {
            records
          }
        }
      )
    );

    updateDashboard();
  }

  return success;
}


/* =========================================================
   15. CREATE ID
========================================================= */

function createId(prefix = "SPL") {
  const time =
    Date.now().toString(36);

  const random =
    Math.random()
      .toString(36)
      .substring(2, 8);

  return `${prefix}-${time}-${random}`;
}


/* =========================================================
   16. DATE FORMAT
========================================================= */

function formatDate(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "ko-KR",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }
  ).format(date);
}


function formatDateTime(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "ko-KR",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }
  ).format(date);
}


/* =========================================================
   17. SCORE HELPERS
========================================================= */

function clampScore(value) {
  const number =
    Number(value);

  if (
    Number.isNaN(number)
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, number)
  );
}


function getScoreStatus(score) {
  const value =
    clampScore(score);

  if (value >= 90) {
    return {
      label: "매우 우수",
      className: "excellent"
    };
  }

  if (value >= 80) {
    return {
      label: "우수",
      className: "good"
    };
  }

  if (value >= 70) {
    return {
      label: "양호",
      className: "normal"
    };
  }

  if (value >= 60) {
    return {
      label: "개선 필요",
      className: "warning"
    };
  }

  return {
    label: "집중 개선",
    className: "danger"
  };
}


/* =========================================================
   18. DASHBOARD
========================================================= */

function updateDashboard() {
  const athletes =
    getAthletes();

  const records =
    getRecords();

  updateDashboardStats(
    athletes,
    records
  );

  updateRecentRecords(records);

  updateDashboardAthletes(
    athletes,
    records
  );
}


/* =========================================================
   19. DASHBOARD STATS
========================================================= */

function updateDashboardStats(
  athletes,
  records
) {
  setTextByPossibleIds(
    [
      "totalAthletes",
      "dashboardAthleteCount",
      "athleteCount"
    ],
    athletes.length
  );

  setTextByPossibleIds(
    [
      "totalAnalysis",
      "dashboardAnalysisCount",
      "analysisCount"
    ],
    records.length
  );

  const today =
    new Date();

  const todayKey =
    [
      today.getFullYear(),
      String(
        today.getMonth() + 1
      ).padStart(2, "0"),
      String(
        today.getDate()
      ).padStart(2, "0")
    ].join("-");

  const todayRecords =
    records.filter((record) => {
      if (!record.createdAt) {
        return false;
      }

      const date =
        new Date(record.createdAt);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return false;
      }

      const key =
        [
          date.getFullYear(),
          String(
            date.getMonth() + 1
          ).padStart(2, "0"),
          String(
            date.getDate()
          ).padStart(2, "0")
        ].join("-");

      return key === todayKey;
    });

  setTextByPossibleIds(
    [
      "todayAnalysis",
      "todayAnalysisCount"
    ],
    todayRecords.length
  );

  const validScores =
    records
      .map(
        (record) =>
          Number(record.score)
      )
      .filter(
        (score) =>
          Number.isFinite(score)
      );

  const average =
    validScores.length
      ? Math.round(
          validScores.reduce(
            (sum, score) =>
              sum + score,
            0
          ) /
          validScores.length
        )
      : 0;

  setTextByPossibleIds(
    [
      "averageScore",
      "dashboardAverageScore"
    ],
    average
  );
}


/* =========================================================
   20. SET TEXT USING POSSIBLE IDS
========================================================= */

function setTextByPossibleIds(
  ids,
  value
) {
  ids.forEach((id) => {
    const element =
      document.getElementById(id);

    if (element) {
      element.textContent =
        String(value);
    }
  });
}


/* =========================================================
   21. RECENT RECORDS
========================================================= */

function updateRecentRecords(records) {
  const container =
    document.getElementById(
      "recentAnalysisList"
    );

  if (!container) return;

  const recent =
    [...records]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )
      .slice(0, 4);

  if (!recent.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <i class="fa-solid fa-chart-line"></i>
        </div>

        <strong>
          분석 기록이 없습니다
        </strong>

        <span>
          선수 분석을 시작하면 최근 기록이 표시됩니다.
        </span>
      </div>
    `;

    return;
  }

  container.innerHTML =
    recent
      .map((record) => {
        const score =
          Number.isFinite(
            Number(record.score)
          )
            ? Math.round(
                Number(record.score)
              )
            : "--";

        return `
          <div class="recent-analysis-item">

            <div class="recent-analysis-icon">
              <i class="fa-solid fa-wave-square"></i>
            </div>

            <div class="recent-analysis-info">
              <strong>
                ${escapeHTML(
                  record.athleteName ||
                  "선수"
                )}
              </strong>

              <span>
                ${escapeHTML(
                  record.sport ||
                  record.type ||
                  "자세분석"
                )}
                ·
                ${formatDate(
                  record.createdAt
                )}
              </span>
            </div>

            <div class="recent-analysis-score">
              ${score}
            </div>

          </div>
        `;
      })
      .join("");
}


/* =========================================================
   22. DASHBOARD ATHLETES
========================================================= */

function updateDashboardAthletes(
  athletes,
  records
) {
  const container =
    document.getElementById(
      "dashboardAthleteList"
    );

  if (!container) return;

  const selected =
    athletes.slice(0, 4);

  if (!selected.length) {
    container.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">
          <i class="fa-solid fa-users"></i>
        </div>

        <strong>
          등록된 선수가 없습니다
        </strong>

        <span>
          선수를 등록하면 이곳에서 바로 확인할 수 있습니다.
        </span>

      </div>
    `;

    return;
  }

  container.innerHTML =
    selected
      .map((athlete) => {
        const athleteRecords =
          records.filter(
            (record) =>
              record.athleteId ===
              athlete.id
          );

        const latest =
          [...athleteRecords]
            .sort(
              (a, b) =>
                new Date(
                  b.createdAt || 0
                ) -
                new Date(
                  a.createdAt || 0
                )
            )[0];

        const score =
          latest &&
          Number.isFinite(
            Number(latest.score)
          )
            ? Math.round(
                Number(latest.score)
              )
            : "--";

        const photo =
          athlete.photo
            ? `
              <img
                src="${athlete.photo}"
                alt=""
              >
            `
            : `
              <i class="fa-solid fa-user"></i>
            `;

        return `
          <div class="dashboard-athlete-item">

            <div class="dashboard-athlete-avatar">
              ${photo}
            </div>

            <div class="dashboard-athlete-info">

              <strong>
                ${escapeHTML(
                  athlete.name ||
                  "이름 없음"
                )}
              </strong>

              <span>
                ${escapeHTML(
                  athlete.sport ||
                  "종목 미등록"
                )}
              </span>

            </div>

            <div class="dashboard-athlete-score">
              ${score}
            </div>

          </div>
        `;
      })
      .join("");
}


/* =========================================================
   23. HTML ESCAPE
========================================================= */

function escapeHTML(value) {
  const div =
    document.createElement("div");

  div.textContent =
    value == null
      ? ""
      : String(value);

  return div.innerHTML;
}


/* =========================================================
   24. GLOBAL API
========================================================= */

window.SPL = SPL;

window.SPLApp = {
  openPage,
  showToast,

  getAthletes,
  saveAthletes,

  getRecords,
  saveRecords,

  createId,

  formatDate,
  formatDateTime,

  clampScore,
  getScoreStatus,

  updateDashboard,

  escapeHTML
};


/* =========================================================
   END OF app.js PART 1
========================================================= */
/* =========================================================
   SEOLCHEON PERFORMANCE LAB
   app.js

   PART 2
   Page Events / UI Safety / Dashboard Sync / Utilities
========================================================= */


/* =========================================================
   25. INITIAL PAGE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initializeInitialPage();
});


function initializeInitialPage() {
  const activePage =
    document.querySelector(".page.active");

  if (activePage?.id) {
    const pageName =
      activePage.id.replace("page-", "");

    SPL.currentPage = pageName;

    updateActiveNavigation(pageName);

    return;
  }

  if (SPL.pages.dashboard) {
    openPage("dashboard");
    return;
  }

  const firstPage =
    Object.keys(SPL.pages)[0];

  if (firstPage) {
    openPage(firstPage);
  }
}


/* =========================================================
   26. PAGE CHANGE HANDLER
========================================================= */

document.addEventListener(
  "spl:pagechange",
  (event) => {
    const pageName =
      event.detail?.page;

    if (!pageName) return;

    handlePageOpened(pageName);
  }
);


function handlePageOpened(pageName) {
  switch (pageName) {

    case "dashboard":
      updateDashboard();
      break;

    case "athletes":
      requestAthleteRefresh();
      break;

    case "athlete-register":
      break;

    case "records":
      requestRecordRefresh();
      break;

    case "report":
      requestReportRefresh();
      break;

    default:
      break;
  }
}


/* =========================================================
   27. MODULE REFRESH EVENTS
========================================================= */

function requestAthleteRefresh() {
  document.dispatchEvent(
    new CustomEvent(
      "spl:refreshathletes"
    )
  );
}


function requestRecordRefresh() {
  document.dispatchEvent(
    new CustomEvent(
      "spl:refreshrecords"
    )
  );
}


function requestReportRefresh() {
  document.dispatchEvent(
    new CustomEvent(
      "spl:refreshreport"
    )
  );
}


/* =========================================================
   28. DATA UPDATE EVENTS
========================================================= */

document.addEventListener(
  "spl:athletesupdated",
  () => {
    updateDashboard();

    requestAthleteRefresh();

    requestReportRefresh();

    populateGlobalAthleteSelectors();
  }
);


document.addEventListener(
  "spl:recordsupdated",
  () => {
    updateDashboard();

    requestRecordRefresh();

    requestReportRefresh();
  }
);


/* =========================================================
   29. GLOBAL ATHLETE SELECTORS
========================================================= */

function populateGlobalAthleteSelectors() {
  const athletes =
    getAthletes();

  const selectors =
    document.querySelectorAll(
      [
        "#poseAthlete",
        "#videoAthlete",
        "#weightAthlete",
        "#sportAthlete",
        "#peAthlete"
      ].join(",")
    );

  selectors.forEach((select) => {
    const currentValue =
      select.value;

    const firstOption =
      select.querySelector("option");

    const placeholder =
      firstOption
        ? firstOption.outerHTML
        : `
          <option value="">
            선수 선택
          </option>
        `;

    select.innerHTML =
      placeholder +
      athletes
        .map((athlete) => {
          return `
            <option value="${escapeHTML(
              athlete.id
            )}">
              ${escapeHTML(
                athlete.name ||
                "이름 없음"
              )}
              ${
                athlete.sport
                  ? ` · ${escapeHTML(
                      athlete.sport
                    )}`
                  : ""
              }
            </option>
          `;
        })
        .join("");

    if (
      athletes.some(
        (athlete) =>
          athlete.id === currentValue
      )
    ) {
      select.value =
        currentValue;
    }
  });
}


/* =========================================================
   30. PAGE TARGET EVENT DELEGATION
========================================================= */

document.addEventListener(
  "click",
  (event) => {
    const button =
      event.target.closest(
        "[data-open-page]"
      );

    if (!button) return;

    const page =
      button.dataset.openPage;

    if (!page) return;

    openPage(page);
  }
);


/* =========================================================
   31. ESC KEY
========================================================= */

document.addEventListener(
  "keydown",
  (event) => {
    if (event.key !== "Escape") {
      return;
    }

    closeSidebar();

    closeAllTemporaryPanels();
  }
);


/* =========================================================
   32. CLOSE TEMPORARY PANELS
========================================================= */

function closeAllTemporaryPanels() {
  const temporaryElements =
    document.querySelectorAll(
      [
        ".modal.open",
        ".dialog.open",
        ".dropdown.open",
        ".context-menu.open"
      ].join(",")
    );

  temporaryElements.forEach(
    (element) => {
      element.classList.remove("open");
    }
  );
}


/* =========================================================
   33. SAFE NUMBER
========================================================= */

function safeNumber(
  value,
  fallback = 0
) {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}


/* =========================================================
   34. ROUND NUMBER
========================================================= */

function roundNumber(
  value,
  digits = 0
) {
  const number =
    safeNumber(value);

  const factor =
    10 ** digits;

  return Math.round(
    number * factor
  ) / factor;
}


/* =========================================================
   35. AVERAGE
========================================================= */

function average(values = []) {
  const valid =
    values
      .map(Number)
      .filter(Number.isFinite);

  if (!valid.length) {
    return 0;
  }

  return (
    valid.reduce(
      (sum, value) =>
        sum + value,
      0
    ) /
    valid.length
  );
}


/* =========================================================
   36. DATE ID
========================================================= */

function createDateId() {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  const hour =
    String(
      now.getHours()
    ).padStart(2, "0");

  const minute =
    String(
      now.getMinutes()
    ).padStart(2, "0");

  const second =
    String(
      now.getSeconds()
    ).padStart(2, "0");

  return (
    `${year}${month}${day}-` +
    `${hour}${minute}${second}`
  );
}


/* =========================================================
   37. GET ATHLETE BY ID
========================================================= */

function getAthleteById(id) {
  if (!id) return null;

  return (
    getAthletes().find(
      (athlete) =>
        athlete.id === id
    ) || null
  );
}


/* =========================================================
   38. GET RECORD BY ID
========================================================= */

function getRecordById(id) {
  if (!id) return null;

  return (
    getRecords().find(
      (record) =>
        record.id === id
    ) || null
  );
}


/* =========================================================
   39. GET ATHLETE RECORDS
========================================================= */

function getAthleteRecords(
  athleteId
) {
  if (!athleteId) {
    return [];
  }

  return getRecords()
    .filter(
      (record) =>
        record.athleteId ===
        athleteId
    )
    .sort(
      (a, b) =>
        new Date(
          b.createdAt || 0
        ) -
        new Date(
          a.createdAt || 0
        )
    );
}


/* =========================================================
   40. ADD RECORD
========================================================= */

function addAnalysisRecord(data = {}) {
  const records =
    getRecords();

  const athlete =
    data.athleteId
      ? getAthleteById(
          data.athleteId
        )
      : null;

  const record = {
    id:
      data.id ||
      createId("REC"),

    athleteId:
      data.athleteId || "",

    athleteName:
      data.athleteName ||
      athlete?.name ||
      "선수 미지정",

    type:
      data.type ||
      "pose",

    typeLabel:
      data.typeLabel ||
      getAnalysisTypeLabel(
        data.type
      ),

    sport:
      data.sport ||
      athlete?.sport ||
      "",

    score:
      clampScore(
        data.score ?? 0
      ),

    stability:
      clampScore(
        data.stability ??
        data.score ??
        0
      ),

    balance:
      clampScore(
        data.balance ??
        data.score ??
        0
      ),

    efficiency:
      clampScore(
        data.efficiency ??
        data.score ??
        0
      ),

    strength:
      data.strength || "",

    improvement:
      data.improvement || "",

    trainingNote:
      data.trainingNote || "",

    details:
      data.details || {},

    createdAt:
      data.createdAt ||
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString()
  };

  records.push(record);

  const success =
    saveRecords(records);

  if (!success) {
    return null;
  }

  showToast(
    "분석 기록이 저장되었습니다."
  );

  return record;
}


/* =========================================================
   41. UPDATE RECORD
========================================================= */

function updateAnalysisRecord(
  recordId,
  changes = {}
) {
  const records =
    getRecords();

  const index =
    records.findIndex(
      (record) =>
        record.id === recordId
    );

  if (index === -1) {
    showToast(
      "수정할 분석 기록을 찾을 수 없습니다.",
      "error"
    );

    return null;
  }

  records[index] = {
    ...records[index],
    ...changes,

    id:
      records[index].id,

    updatedAt:
      new Date().toISOString()
  };

  if (
    changes.score !== undefined
  ) {
    records[index].score =
      clampScore(
        changes.score
      );
  }

  const success =
    saveRecords(records);

  if (!success) {
    return null;
  }

  showToast(
    "분석 기록이 수정되었습니다."
  );

  return records[index];
}


/* =========================================================
   42. DELETE RECORD
========================================================= */

function deleteAnalysisRecord(
  recordId
) {
  const records =
    getRecords();

  const target =
    records.find(
      (record) =>
        record.id === recordId
    );

  if (!target) {
    showToast(
      "삭제할 기록을 찾을 수 없습니다.",
      "error"
    );

    return false;
  }

  const confirmed =
    window.confirm(
      `${target.athleteName || "선수"}의 분석 기록을 삭제할까요?`
    );

  if (!confirmed) {
    return false;
  }

  const nextRecords =
    records.filter(
      (record) =>
        record.id !== recordId
    );

  const success =
    saveRecords(nextRecords);

  if (success) {
    showToast(
      "분석 기록이 삭제되었습니다."
    );
  }

  return success;
}


/* =========================================================
   43. ANALYSIS TYPE LABEL
========================================================= */

function getAnalysisTypeLabel(
  type
) {
  const labels = {
    pose: "자세분석",
    video: "영상분석",
    weight: "웨이트",
    sport: "종목분석",
    winter: "동계종목",
    summer: "하계종목",
    pe: "체대입시"
  };

  return (
    labels[type] ||
    "분석"
  );
}


/* =========================================================
   44. SCORE SUMMARY
========================================================= */

function createScoreSummary(
  score
) {
  const value =
    Math.round(
      clampScore(score)
    );

  if (value >= 90) {
    return {
      strength:
        "전반적인 움직임 안정성과 자세 유지 능력이 매우 우수합니다.",

      improvement:
        "현재 움직임 품질을 유지하면서 종목별 세부 기술을 정교하게 다듬는 것이 좋습니다.",

      trainingNote:
        "고강도 동작에서도 현재의 정렬과 균형이 유지되는지 지속적으로 확인하세요."
    };
  }

  if (value >= 80) {
    return {
      strength:
        "전체적인 움직임과 균형이 안정적인 수준입니다.",

      improvement:
        "일부 관절의 각도와 좌우 움직임 차이를 세부적으로 개선할 수 있습니다.",

      trainingNote:
        "기술 반복 시 정확한 자세를 유지하면서 동작 속도를 단계적으로 높여보세요."
    };
  }

  if (value >= 70) {
    return {
      strength:
        "기본적인 움직임 패턴은 비교적 안정적으로 유지되고 있습니다.",

      improvement:
        "중심 이동과 관절 정렬에서 나타나는 차이를 줄이는 훈련이 필요합니다.",

      trainingNote:
        "낮은 강도에서 정확한 동작을 반복한 뒤 점진적으로 강도를 높이는 방식이 적합합니다."
    };
  }

  if (value >= 60) {
    return {
      strength:
        "기본 동작 수행은 가능하며 개선 가능한 요소가 명확하게 확인됩니다.",

      improvement:
        "자세 안정성, 좌우 균형, 동작 제어를 우선적으로 개선하는 것이 좋습니다.",

      trainingNote:
        "동작 속도보다 정확한 자세와 안정적인 중심 유지에 우선순위를 두세요."
    };
  }

  return {
    strength:
      "분석을 통해 우선적으로 확인해야 할 움직임 요소를 파악할 수 있습니다.",

    improvement:
      "기본 자세와 움직임 패턴부터 단계적으로 점검하는 것이 좋습니다.",

    trainingNote:
      "무리하게 강도를 높이지 말고 지도자와 함께 정확한 기본 동작부터 확인하세요."
  };
}


/* =========================================================
   45. CREATE RECORD FROM SCORES
========================================================= */

function createRecordFromScores({
  athleteId = "",
  type = "pose",
  sport = "",
  score = 0,
  stability = null,
  balance = null,
  efficiency = null,
  details = {}
} = {}) {

  const finalScore =
    clampScore(score);

  const summary =
    createScoreSummary(
      finalScore
    );

  return addAnalysisRecord({
    athleteId,

    type,

    typeLabel:
      getAnalysisTypeLabel(type),

    sport,

    score:
      finalScore,

    stability:
      stability === null
        ? finalScore
        : stability,

    balance:
      balance === null
        ? finalScore
        : balance,

    efficiency:
      efficiency === null
        ? finalScore
        : efficiency,

    strength:
      summary.strength,

    improvement:
      summary.improvement,

    trainingNote:
      summary.trainingNote,

    details
  });
}


/* =========================================================
   46. BUTTON LOADING STATE
========================================================= */

function setButtonLoading(
  button,
  loading = true,
  loadingText = "처리 중..."
) {
  if (!button) return;

  if (loading) {
    if (
      !button.dataset.originalHtml
    ) {
      button.dataset.originalHtml =
        button.innerHTML;
    }

    button.disabled = true;

    button.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      ${escapeHTML(loadingText)}
    `;

    return;
  }

  button.disabled = false;

  if (
    button.dataset.originalHtml
  ) {
    button.innerHTML =
      button.dataset.originalHtml;

    delete button.dataset.originalHtml;
  }
}


/* =========================================================
   47. FILE SIZE FORMAT
========================================================= */

function formatFileSize(bytes) {
  const size =
    safeNumber(bytes);

  if (size <= 0) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB"
  ];

  const index =
    Math.min(
      Math.floor(
        Math.log(size) /
        Math.log(1024)
      ),
      units.length - 1
    );

  const value =
    size /
    1024 ** index;

  return (
    `${roundNumber(
      value,
      index === 0 ? 0 : 1
    )} ${units[index]}`
  );
}


/* =========================================================
   48. IMAGE FILE TO DATA URL
========================================================= */

function fileToDataURL(file) {
  return new Promise(
    (resolve, reject) => {
      if (!file) {
        reject(
          new Error(
            "파일이 없습니다."
          )
        );

        return;
      }

      const reader =
        new FileReader();

      reader.onload = () => {
        resolve(
          reader.result
        );
      };

      reader.onerror = () => {
        reject(
          new Error(
            "파일을 읽을 수 없습니다."
          )
        );
      };

      reader.readAsDataURL(file);
    }
  );
}


/* =========================================================
   49. VIDEO TIME FORMAT
========================================================= */

function formatVideoTime(
  seconds
) {
  const value =
    Math.max(
      0,
      Math.floor(
        safeNumber(seconds)
      )
    );

  const minutes =
    Math.floor(
      value / 60
    );

  const remainSeconds =
    value % 60;

  return (
    `${String(minutes).padStart(2, "0")}:` +
    `${String(remainSeconds).padStart(2, "0")}`
  );
}


/* =========================================================
   50. DEBOUNCE
========================================================= */

function debounce(
  callback,
  delay = 250
) {
  let timer = null;

  return (...args) => {
    clearTimeout(timer);

    timer =
      setTimeout(
        () => {
          callback(...args);
        },
        delay
      );
  };
}


/* =========================================================
   51. SAFE EVENT LISTENER
========================================================= */

function on(
  selector,
  eventName,
  handler
) {
  const element =
    typeof selector === "string"
      ? document.querySelector(
          selector
        )
      : selector;

  if (!element) {
    return false;
  }

  element.addEventListener(
    eventName,
    handler
  );

  return true;
}


/* =========================================================
   52. SAFE QUERY
========================================================= */

function $(
  selector,
  parent = document
) {
  return parent.querySelector(
    selector
  );
}


function $$(
  selector,
  parent = document
) {
  return [
    ...parent.querySelectorAll(
      selector
    )
  ];
}


/* =========================================================
   53. PREVENT EMPTY FORM SUBMISSION
========================================================= */

document.addEventListener(
  "submit",
  (event) => {
    const form =
      event.target;

    if (
      !(form instanceof HTMLFormElement)
    ) {
      return;
    }

    if (
      form.dataset.nativeSubmit ===
      "true"
    ) {
      return;
    }

    event.preventDefault();
  }
);


/* =========================================================
   54. GLOBAL ERROR HANDLER
========================================================= */

window.addEventListener(
  "error",
  (event) => {
    console.error(
      "[SPL] Runtime error:",
      event.error ||
      event.message
    );
  }
);


window.addEventListener(
  "unhandledrejection",
  (event) => {
    console.error(
      "[SPL] Promise error:",
      event.reason
    );
  }
);


/* =========================================================
   55. FINAL INITIAL SYNC
========================================================= */

window.addEventListener(
  "load",
  () => {
    populateGlobalAthleteSelectors();

    updateDashboard();

    document.dispatchEvent(
      new CustomEvent(
        "spl:systemready"
      )
    );
  }
);


/* =========================================================
   56. EXTEND GLOBAL API
========================================================= */

Object.assign(
  window.SPLApp,
  {
    safeNumber,
    roundNumber,
    average,

    createDateId,

    getAthleteById,
    getRecordById,
    getAthleteRecords,

    addAnalysisRecord,
    updateAnalysisRecord,
    deleteAnalysisRecord,

    getAnalysisTypeLabel,
    createScoreSummary,
    createRecordFromScores,

    populateGlobalAthleteSelectors,

    setButtonLoading,

    formatFileSize,
    fileToDataURL,
    formatVideoTime,

    debounce,

    on,
    $,
    $$,

    requestAthleteRefresh,
    requestRecordRefresh,
    requestReportRefresh
  }
);


/* =========================================================
   END OF app.js
========================================================= */