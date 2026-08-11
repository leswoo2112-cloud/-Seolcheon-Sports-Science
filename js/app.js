/* =========================================================
   SEOLCHEON PERFORMANCE LAB
   app.js

   CORE SYSTEM
   Navigation / Storage / Dashboard / Utilities
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
   03. INITIALIZE APP
========================================================= */

function initializeApp() {

  if (SPL.initialized) {
    return;
  }

  cachePages();

  initializeNavigation();

  initializeSidebar();

  initializePageTargetButtons();

  initializeInitialPage();

  populateGlobalAthleteSelectors();

  updateDashboard();

  SPL.initialized = true;


  console.log(
    "%cSEOLCHEON PERFORMANCE LAB",
    "color:#4ba3ff;font-size:16px;font-weight:bold;"
  );

  console.log(
    "[SPL] System initialized"
  );
}


/* =========================================================
   04. CACHE PAGES
========================================================= */

function cachePages() {

  SPL.pages = {};

  const pages =
    document.querySelectorAll(".page");


  pages.forEach((page) => {

    if (!page.id) {
      return;
    }


    if (
      !page.id.startsWith("page-")
    ) {
      return;
    }


    const pageName =
      page.id.substring(5);


    SPL.pages[pageName] =
      page;

  });


  console.log(
    "[SPL] Pages:",
    Object.keys(SPL.pages)
  );
}


/* =========================================================
   05. NAVIGATION
========================================================= */

function initializeNavigation() {

  /*
    Event Delegation 방식.

    사이드바 버튼이 나중에 추가되더라도
    자동으로 페이지 이동이 가능하다.
  */

  document.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          ".nav-item[data-page]"
        );


      if (!button) {
        return;
      }


      const pageName =
        button.getAttribute(
          "data-page"
        );


      if (!pageName) {
        return;
      }


      event.preventDefault();

      openPage(pageName);

    }
  );

}


/* =========================================================
   06. OPEN PAGE
========================================================= */

function openPage(pageName) {

  if (!pageName) {
    return false;
  }


  /*
    캐시가 아니라 실제 DOM에서
    직접 페이지를 찾는다.

    Safari / GitHub Pages에서도
    페이지 연결이 확실하게 되도록 한다.
  */

  const targetPage =
    document.getElementById(
      `page-${pageName}`
    );


  if (!targetPage) {

    console.error(
      `[SPL] Page not found: page-${pageName}`
    );


    showToast(
      `페이지를 찾을 수 없습니다: ${pageName}`,
      "error"
    );


    return false;
  }


  /* -----------------------------------------
     모든 페이지 비활성화
  ----------------------------------------- */

  document
    .querySelectorAll(".page")
    .forEach((page) => {

      page.classList.remove(
        "active"
      );

    });


  /* -----------------------------------------
     선택 페이지 활성화
  ----------------------------------------- */

  targetPage.classList.add(
    "active"
  );


  /* -----------------------------------------
     메뉴 ACTIVE 변경
  ----------------------------------------- */

  updateActiveNavigation(
    pageName
  );


  /* -----------------------------------------
     현재 페이지 저장
  ----------------------------------------- */

  SPL.currentPage =
    pageName;


  /* -----------------------------------------
     스크롤 초기화
  ----------------------------------------- */

  const main =
    document.querySelector(
      ".main"
    );


  if (main) {

    main.scrollTop =
      0;

  }


  try {

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });

  } catch (error) {

    window.scrollTo(
      0,
      0
    );

  }


  /* -----------------------------------------
     모바일 사이드바 닫기
  ----------------------------------------- */

  closeSidebar();


  /* -----------------------------------------
     PAGE CHANGE EVENT
  ----------------------------------------- */

  document.dispatchEvent(

    new CustomEvent(
      "spl:pagechange",
      {
        detail: {
          page: pageName
        }
      }
    )

  );


  console.log(
    `[SPL] Page → ${pageName}`
  );


  return true;
}


/* =========================================================
   07. ACTIVE NAVIGATION
========================================================= */

function updateActiveNavigation(
  pageName
) {

  const navigationButtons =
    document.querySelectorAll(
      ".nav-item[data-page]"
    );


  navigationButtons.forEach(
    (button) => {

      const buttonPage =
        button.getAttribute(
          "data-page"
        );


      button.classList.toggle(
        "active",
        buttonPage === pageName
      );

    }
  );

}


/* =========================================================
   08. PAGE TARGET BUTTONS
========================================================= */

function initializePageTargetButtons() {

  /*
    대시보드 빠른 분석,
    선수 등록,
    전체 선수 보기 등

    data-page-target 속성을 가진 버튼을
    모두 여기서 처리한다.
  */

  document.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          "[data-page-target]"
        );


      if (!button) {
        return;
      }


      /*
        nav-item은 위의
        initializeNavigation에서 처리한다.
      */

      if (
        button.classList.contains(
          "nav-item"
        )
      ) {
        return;
      }


      const pageName =
        button.getAttribute(
          "data-page-target"
        );


      if (!pageName) {
        return;
      }


      event.preventDefault();

      openPage(pageName);

    }
  );

}


/* =========================================================
   09. INITIAL PAGE
========================================================= */

function initializeInitialPage() {

  const activePage =
    document.querySelector(
      ".page.active"
    );


  if (
    activePage &&
    activePage.id
  ) {

    const pageName =
      activePage.id.replace(
        "page-",
        ""
      );


    SPL.currentPage =
      pageName;


    updateActiveNavigation(
      pageName
    );


    return;
  }


  /*
    active 페이지가 없으면
    대시보드 실행
  */

  if (
    document.getElementById(
      "page-dashboard"
    )
  ) {

    openPage(
      "dashboard"
    );

    return;
  }


  /*
    대시보드도 없다면
    첫 페이지 사용
  */

  const firstPage =
    document.querySelector(
      ".page"
    );


  if (firstPage?.id) {

    openPage(
      firstPage.id.replace(
        "page-",
        ""
      )
    );

  }

}


/* =========================================================
   10. SIDEBAR
========================================================= */

function initializeSidebar() {

  const menuButton =
    document.getElementById(
      "mobileMenu"
    ) ||
    document.querySelector(
      ".mobile-menu"
    );


  const sidebar =
    document.getElementById(
      "sidebar"
    ) ||
    document.querySelector(
      ".sidebar"
    );


  if (!sidebar) {
    return;
  }


  /* -----------------------------------------
     모바일 메뉴 버튼
  ----------------------------------------- */

  if (menuButton) {

    menuButton.addEventListener(
      "click",
      (event) => {

        event.preventDefault();

        event.stopPropagation();


        sidebar.classList.toggle(
          "open"
        );


        document.body.classList.toggle(
          "no-scroll",
          sidebar.classList.contains(
            "open"
          )
        );

      }
    );

  }


  /* -----------------------------------------
     사이드바 바깥 클릭
  ----------------------------------------- */

  document.addEventListener(
    "click",
    (event) => {

      if (
        window.innerWidth > 800
      ) {
        return;
      }


      if (
        !sidebar.classList.contains(
          "open"
        )
      ) {
        return;
      }


      if (
        sidebar.contains(
          event.target
        )
      ) {
        return;
      }


      if (
        menuButton &&
        menuButton.contains(
          event.target
        )
      ) {
        return;
      }


      closeSidebar();

    }
  );


  /* -----------------------------------------
     화면 크기 변경
  ----------------------------------------- */

  window.addEventListener(
    "resize",
    () => {

      if (
        window.innerWidth > 800
      ) {

        closeSidebar();

      }

    }
  );

}


/* =========================================================
   11. CLOSE SIDEBAR
========================================================= */

function closeSidebar() {

  const sidebar =
    document.getElementById(
      "sidebar"
    ) ||
    document.querySelector(
      ".sidebar"
    );


  if (sidebar) {

    sidebar.classList.remove(
      "open"
    );

  }


  document.body.classList.remove(
    "no-scroll"
  );

}


/* =========================================================
   12. TOAST
========================================================= */

let toastTimer =
  null;


function showToast(
  message,
  type = "success",
  duration = 2400
) {

  const toast =
    document.getElementById(
      "toast"
    );


  const messageElement =
    document.getElementById(
      "toastMessage"
    );


  if (
    !toast ||
    !messageElement
  ) {

    console.log(
      "[SPL]",
      message
    );

    return;

  }


  messageElement.textContent =
    message;


  const icon =
    toast.querySelector("i");


  toast.classList.remove(
    "success",
    "warning",
    "error"
  );


  toast.classList.add(
    type
  );


  if (icon) {

    if (
      type === "error"
    ) {

      icon.className =
        "fa-solid fa-circle-exclamation";

    }

    else if (
      type === "warning"
    ) {

      icon.className =
        "fa-solid fa-triangle-exclamation";

    }

    else {

      icon.className =
        "fa-solid fa-circle-check";

    }

  }


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      duration
    );

}


/* =========================================================
   13. STORAGE GET
========================================================= */

function getStorageData(
  key,
  fallback = []
) {

  try {

    const raw =
      localStorage.getItem(
        key
      );


    if (!raw) {

      return fallback;

    }


    return JSON.parse(
      raw
    );

  }

  catch (error) {

    console.error(
      "[SPL] Storage read error:",
      error
    );


    return fallback;

  }

}


/* =========================================================
   14. STORAGE SET
========================================================= */

function setStorageData(
  key,
  value
) {

  try {

    localStorage.setItem(
      key,
      JSON.stringify(
        value
      )
    );


    return true;

  }

  catch (error) {

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
   15. ATHLETES
========================================================= */

function getAthletes() {

  const athletes =
    getStorageData(
      SPL.storageKeys.athletes,
      []
    );


  return Array.isArray(
    athletes
  )
    ? athletes
    : [];

}


function saveAthletes(
  athletes
) {

  const data =
    Array.isArray(
      athletes
    )
      ? athletes
      : [];


  const success =
    setStorageData(
      SPL.storageKeys.athletes,
      data
    );


  if (success) {

    document.dispatchEvent(

      new CustomEvent(
        "spl:athletesupdated",
        {
          detail: {
            athletes: data
          }
        }
      )

    );


    updateDashboard();

  }


  return success;
}


/* =========================================================
   16. RECORDS
========================================================= */

function getRecords() {

  const records =
    getStorageData(
      SPL.storageKeys.records,
      []
    );


  return Array.isArray(
    records
  )
    ? records
    : [];

}


function saveRecords(
  records
) {

  const data =
    Array.isArray(
      records
    )
      ? records
      : [];


  const success =
    setStorageData(
      SPL.storageKeys.records,
      data
    );


  if (success) {

    document.dispatchEvent(

      new CustomEvent(
        "spl:recordsupdated",
        {
          detail: {
            records: data
          }
        }
      )

    );


    updateDashboard();

  }


  return success;
}


/* =========================================================
   17. CREATE ID
========================================================= */

function createId(
  prefix = "SPL"
) {

  const time =
    Date.now()
      .toString(36);


  const random =
    Math.random()
      .toString(36)
      .substring(
        2,
        8
      );


  return (
    `${prefix}-${time}-${random}`
  );

}


/* =========================================================
   18. ESCAPE HTML
========================================================= */

function escapeHTML(
  value
) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    value == null
      ? ""
      : String(value);


  return div.innerHTML;
}


/* =========================================================
   19. DATE FORMAT
========================================================= */

function formatDate(
  dateValue
) {

  if (!dateValue) {
    return "-";
  }


  const date =
    new Date(
      dateValue
    );


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
  ).format(
    date
  );

}


/* =========================================================
   20. DATE TIME FORMAT
========================================================= */

function formatDateTime(
  dateValue
) {

  if (!dateValue) {
    return "-";
  }


  const date =
    new Date(
      dateValue
    );


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
  ).format(
    date
  );

}


/* =========================================================
   21. SCORE
========================================================= */

function clampScore(
  value
) {

  const number =
    Number(value);


  if (
    !Number.isFinite(
      number
    )
  ) {

    return 0;

  }


  return Math.min(
    100,
    Math.max(
      0,
      number
    )
  );

}


/* =========================================================
   22. SCORE STATUS
========================================================= */

function getScoreStatus(
  score
) {

  const value =
    clampScore(
      score
    );


  if (
    value >= 90
  ) {

    return {
      label: "매우 우수",
      className: "excellent"
    };

  }


  if (
    value >= 80
  ) {

    return {
      label: "우수",
      className: "good"
    };

  }


  if (
    value >= 70
  ) {

    return {
      label: "양호",
      className: "normal"
    };

  }


  if (
    value >= 60
  ) {

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
   23. SET TEXT
========================================================= */

function setTextByPossibleIds(
  ids,
  value
) {

  ids.forEach(
    (id) => {

      const element =
        document.getElementById(
          id
        );


      if (element) {

        element.textContent =
          String(value);

      }

    }
  );

}


/* =========================================================
   24. DASHBOARD
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


  updateRecentRecords(
    records
  );


  updateDashboardAthletes(
    athletes,
    records
  );

}


/* =========================================================
   25. DASHBOARD STATS
========================================================= */

function updateDashboardStats(
  athletes,
  records
) {

  setTextByPossibleIds(
    [
      "dashboardAthleteCount",
      "totalAthletes",
      "athleteCount"
    ],
    athletes.length
  );


  setTextByPossibleIds(
    [
      "dashboardAnalysisCount",
      "totalAnalysis",
      "analysisCount"
    ],
    records.length
  );


  /* -----------------------------------------
     평균 점수
  ----------------------------------------- */

  const validScores =
    records
      .map(
        (record) =>
          Number(
            record.score
          )
      )
      .filter(
        (score) =>
          Number.isFinite(
            score
          )
      );


  const averageScore =
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


  const averageElement =
    document.getElementById(
      "dashboardAverageScore"
    );


  if (averageElement) {

    averageElement.textContent =
      validScores.length
        ? String(
            averageScore
          )
        : "--";

  }


  /* -----------------------------------------
     이번 주 분석
  ----------------------------------------- */

  const now =
    new Date();


  const weekStart =
    new Date(
      now
    );


  const day =
    weekStart.getDay();


  const diff =
    day === 0
      ? -6
      : 1 - day;


  weekStart.setDate(
    weekStart.getDate() +
    diff
  );


  weekStart.setHours(
    0,
    0,
    0,
    0
  );


  const weeklyRecords =
    records.filter(
      (record) => {

        if (
          !record.createdAt
        ) {

          return false;

        }


        const date =
          new Date(
            record.createdAt
          );


        if (
          Number.isNaN(
            date.getTime()
          )
        ) {

          return false;

        }


        return (
          date >= weekStart &&
          date <= now
        );

      }
    );


  setTextByPossibleIds(
    [
      "dashboardWeeklyCount",
      "weeklyAnalysisCount"
    ],
    weeklyRecords.length
  );

}


/* =========================================================
   26. RECENT RECORDS
========================================================= */

function updateRecentRecords(
  records
) {

  const container =
    document.getElementById(
      "recentAnalysisList"
    );


  if (!container) {
    return;
  }


  const recent =
    [...records]
      .sort(
        (a, b) =>
          new Date(
            b.createdAt || 0
          ) -
          new Date(
            a.createdAt || 0
          )
      )
      .slice(
        0,
        4
      );


  if (
    recent.length === 0
  ) {

    container.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">
          <i class="fa-solid fa-chart-simple"></i>
        </div>

        <strong>
          아직 분석 기록이 없습니다
        </strong>

        <span>
          자세분석을 시작하면 최근 기록이 표시됩니다.
        </span>

        <button
          type="button"
          data-page-target="pose"
        >
          첫 분석 시작
        </button>

      </div>
    `;


    return;

  }


  container.innerHTML =
    recent
      .map(
        (record) => {

          const numericScore =
            Number(
              record.score
            );


          const score =
            Number.isFinite(
              numericScore
            )
              ? Math.round(
                  numericScore
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
                    record.typeLabel ||
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

        }
      )
      .join("");

}


/* =========================================================
   27. DASHBOARD ATHLETES
========================================================= */

function updateDashboardAthletes(
  athletes,
  records
) {

  const container =
    document.getElementById(
      "dashboardAthleteList"
    );


  if (!container) {
    return;
  }


  const selected =
    athletes.slice(
      0,
      4
    );


  if (
    selected.length === 0
  ) {

    container.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">
          <i class="fa-solid fa-user-plus"></i>
        </div>

        <strong>
          등록된 선수가 없습니다
        </strong>

        <span>
          선수를 등록하고 분석 데이터를 관리하세요.
        </span>

        <button
          type="button"
          data-page-target="athlete-register"
        >
          선수 등록
        </button>

      </div>
    `;


    return;

  }


  container.innerHTML =
    selected
      .map(
        (athlete) => {

          const athleteRecords =
            records
              .filter(
                (record) =>
                  record.athleteId ===
                  athlete.id
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


          const latest =
            athleteRecords[0];


          const latestScore =
            latest
              ? Number(
                  latest.score
                )
              : NaN;


          const score =
            Number.isFinite(
              latestScore
            )
              ? Math.round(
                  latestScore
                )
              : "--";


          const photo =
            athlete.photo
              ? `
                <img
                  src="${athlete.photo}"
                  alt="${escapeHTML(
                    athlete.name || ""
                  )}"
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

        }
      )
      .join("");

}


/* =========================================================
   PART 1 END

   ↓ PART 2를 이 바로 아래에 이어 붙이기
========================================================= */
/* =========================================================
   SEOLCHEON PERFORMANCE LAB
   app.js

   PART 2
   Page Events / Records / Global Selectors / Utilities
========================================================= */


/* =========================================================
   28. PAGE CHANGE EVENT
========================================================= */

document.addEventListener(
  "spl:pagechange",
  (event) => {

    const pageName =
      event.detail?.page;

    if (!pageName) {
      return;
    }

    handlePageOpened(
      pageName
    );

  }
);


/* =========================================================
   29. HANDLE PAGE OPENED
========================================================= */

function handlePageOpened(
  pageName
) {

  switch (pageName) {

    case "dashboard":

      updateDashboard();

      break;


    case "pose":

      populateGlobalAthleteSelectors();

      break;


    case "video":

      populateGlobalAthleteSelectors();

      break;


    case "weight":

      populateGlobalAthleteSelectors();

      break;


    case "winter":

      populateGlobalAthleteSelectors();

      break;


    case "summer":

      populateGlobalAthleteSelectors();

      break;


    case "pe":

      populateGlobalAthleteSelectors();

      break;


    case "athlete-register":

      break;


    case "athletes":

      requestAthleteRefresh();

      break;


    case "records":

      requestRecordRefresh();

      break;


    case "report":

      populateGlobalAthleteSelectors();

      requestReportRefresh();

      break;


    default:

      break;

  }

}


/* =========================================================
   30. MODULE REFRESH EVENTS
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
   31. ATHLETE UPDATED EVENT
========================================================= */

document.addEventListener(
  "spl:athletesupdated",
  () => {

    updateDashboard();

    populateGlobalAthleteSelectors();

    requestAthleteRefresh();

    requestReportRefresh();

  }
);


/* =========================================================
   32. RECORD UPDATED EVENT
========================================================= */

document.addEventListener(
  "spl:recordsupdated",
  () => {

    updateDashboard();

    requestRecordRefresh();

    requestReportRefresh();

  }
);


/* =========================================================
   33. GLOBAL ATHLETE SELECTORS
========================================================= */

function populateGlobalAthleteSelectors() {

  const athletes =
    getAthletes();


  const selectorIds = [

    "poseAthlete",

    "videoAthlete",

    "weightAthlete",

    "sportAthlete",

    "peAthlete",

    "reportAthlete"

  ];


  selectorIds.forEach(
    (id) => {

      const select =
        document.getElementById(
          id
        );


      if (!select) {
        return;
      }


      const currentValue =
        select.value;


      /*
        첫 번째 placeholder 보존
      */

      const firstOption =
        select.querySelector(
          "option"
        );


      const placeholderText =
        firstOption
          ? firstOption.textContent.trim()
          : "선수 선택";


      select.innerHTML = "";


      const placeholder =
        document.createElement(
          "option"
        );


      placeholder.value =
        "";


      placeholder.textContent =
        placeholderText ||
        "선수 선택";


      select.appendChild(
        placeholder
      );


      athletes.forEach(
        (athlete) => {

          const option =
            document.createElement(
              "option"
            );


          option.value =
            athlete.id;


          let label =
            athlete.name ||
            "이름 없음";


          if (
            athlete.sport
          ) {

            label +=
              ` · ${athlete.sport}`;

          }


          option.textContent =
            label;


          select.appendChild(
            option
          );

        }
      );


      /*
        기존 선택값 복원
      */

      if (
        athletes.some(
          (athlete) =>
            athlete.id ===
            currentValue
        )
      ) {

        select.value =
          currentValue;

      }

    }
  );

}


/* =========================================================
   34. SAFE NUMBER
========================================================= */

function safeNumber(
  value,
  fallback = 0
) {

  const number =
    Number(value);


  return Number.isFinite(
    number
  )
    ? number
    : fallback;

}


/* =========================================================
   35. ROUND NUMBER
========================================================= */

function roundNumber(
  value,
  digits = 0
) {

  const number =
    safeNumber(
      value
    );


  const factor =
    10 ** digits;


  return (
    Math.round(
      number * factor
    ) /
    factor
  );

}


/* =========================================================
   36. AVERAGE
========================================================= */

function average(
  values = []
) {

  const valid =
    values
      .map(Number)
      .filter(
        Number.isFinite
      );


  if (
    valid.length === 0
  ) {

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
   37. CREATE DATE ID
========================================================= */

function createDateId() {

  const now =
    new Date();


  const year =
    now.getFullYear();


  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );


  const hour =
    String(
      now.getHours()
    ).padStart(
      2,
      "0"
    );


  const minute =
    String(
      now.getMinutes()
    ).padStart(
      2,
      "0"
    );


  const second =
    String(
      now.getSeconds()
    ).padStart(
      2,
      "0"
    );


  return (
    `${year}${month}${day}-` +
    `${hour}${minute}${second}`
  );

}


/* =========================================================
   38. GET ATHLETE BY ID
========================================================= */

function getAthleteById(
  athleteId
) {

  if (!athleteId) {
    return null;
  }


  return (
    getAthletes().find(
      (athlete) =>
        athlete.id ===
        athleteId
    ) ||
    null
  );

}


/* =========================================================
   39. GET RECORD BY ID
========================================================= */

function getRecordById(
  recordId
) {

  if (!recordId) {
    return null;
  }


  return (
    getRecords().find(
      (record) =>
        record.id ===
        recordId
    ) ||
    null
  );

}


/* =========================================================
   40. GET ATHLETE RECORDS
========================================================= */

function getAthleteRecords(
  athleteId
) {

  if (!athleteId) {
    return [];
  }


  return (
    getRecords()
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
      )
  );

}


/* =========================================================
   41. ANALYSIS TYPE LABEL
========================================================= */

function getAnalysisTypeLabel(
  type
) {

  const labels = {

    pose:
      "자세분석",

    video:
      "영상분석",

    weight:
      "웨이트",

    sport:
      "종목분석",

    winter:
      "동계종목",

    summer:
      "하계종목",

    pe:
      "체대입시"

  };


  return (
    labels[type] ||
    "분석"
  );

}


/* =========================================================
   42. SCORE SUMMARY
========================================================= */

function createScoreSummary(
  score
) {

  const value =
    Math.round(
      clampScore(
        score
      )
    );


  if (
    value >= 90
  ) {

    return {

      strength:
        "전반적인 움직임 안정성과 자세 유지 능력이 매우 우수합니다.",

      improvement:
        "현재 움직임 품질을 유지하면서 종목별 세부 기술을 정교하게 다듬는 것이 좋습니다.",

      trainingNote:
        "고강도 동작에서도 현재의 정렬과 균형이 유지되는지 지속적으로 확인하세요."

    };

  }


  if (
    value >= 80
  ) {

    return {

      strength:
        "전체적인 움직임과 균형이 안정적인 수준입니다.",

      improvement:
        "일부 관절의 각도와 좌우 움직임 차이를 세부적으로 개선할 수 있습니다.",

      trainingNote:
        "기술 반복 시 정확한 자세를 유지하면서 동작 속도를 단계적으로 높여보세요."

    };

  }


  if (
    value >= 70
  ) {

    return {

      strength:
        "기본적인 움직임 패턴은 비교적 안정적으로 유지되고 있습니다.",

      improvement:
        "중심 이동과 관절 정렬에서 나타나는 차이를 줄이는 훈련이 필요합니다.",

      trainingNote:
        "낮은 강도에서 정확한 동작을 반복한 뒤 점진적으로 강도를 높이는 방식이 적합합니다."

    };

  }


  if (
    value >= 60
  ) {

    return {

      strength:
        "기본 동작 수행은 가능하며 개선 가능한 요소가 확인됩니다.",

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
   43. ADD ANALYSIS RECORD
========================================================= */

function addAnalysisRecord(
  data = {}
) {

  const records =
    getRecords();


  const athlete =
    data.athleteId
      ? getAthleteById(
          data.athleteId
        )
      : null;


  const score =
    clampScore(
      data.score ?? 0
    );


  const summary =
    createScoreSummary(
      score
    );


  const record = {

    id:
      data.id ||
      createId(
        "REC"
      ),


    athleteId:
      data.athleteId ||
      "",


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
        data.type ||
        "pose"
      ),


    sport:
      data.sport ||
      athlete?.sport ||
      "",


    score:
      score,


    stability:
      clampScore(
        data.stability ??
        score
      ),


    balance:
      clampScore(
        data.balance ??
        score
      ),


    efficiency:
      clampScore(
        data.efficiency ??
        score
      ),


    strength:
      data.strength ||
      summary.strength,


    improvement:
      data.improvement ||
      summary.improvement,


    trainingNote:
      data.trainingNote ||
      summary.trainingNote,


    details:
      data.details &&
      typeof data.details ===
      "object"
        ? data.details
        : {},


    createdAt:
      data.createdAt ||
      new Date().toISOString(),


    updatedAt:
      new Date().toISOString()

  };


  records.push(
    record
  );


  const success =
    saveRecords(
      records
    );


  if (!success) {

    return null;

  }


  showToast(
    "분석 기록이 저장되었습니다."
  );


  return record;

}


/* =========================================================
   44. CREATE RECORD FROM SCORES
========================================================= */

function createRecordFromScores(
  {
    athleteId = "",
    type = "pose",
    sport = "",
    score = 0,
    stability = null,
    balance = null,
    efficiency = null,
    details = {}
  } = {}
) {

  const finalScore =
    clampScore(
      score
    );


  const summary =
    createScoreSummary(
      finalScore
    );


  return addAnalysisRecord({

    athleteId,

    type,

    typeLabel:
      getAnalysisTypeLabel(
        type
      ),

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
   45. UPDATE ANALYSIS RECORD
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
        record.id ===
        recordId
    );


  if (
    index === -1
  ) {

    showToast(
      "수정할 분석 기록을 찾을 수 없습니다.",
      "error"
    );


    return null;

  }


  const original =
    records[index];


  records[index] = {

    ...original,

    ...changes,

    id:
      original.id,

    updatedAt:
      new Date().toISOString()

  };


  if (
    changes.score !==
    undefined
  ) {

    records[index].score =
      clampScore(
        changes.score
      );

  }


  if (
    changes.stability !==
    undefined
  ) {

    records[index].stability =
      clampScore(
        changes.stability
      );

  }


  if (
    changes.balance !==
    undefined
  ) {

    records[index].balance =
      clampScore(
        changes.balance
      );

  }


  if (
    changes.efficiency !==
    undefined
  ) {

    records[index].efficiency =
      clampScore(
        changes.efficiency
      );

  }


  const success =
    saveRecords(
      records
    );


  if (!success) {

    return null;

  }


  showToast(
    "분석 기록이 수정되었습니다."
  );


  return records[index];

}


/* =========================================================
   46. DELETE ANALYSIS RECORD
========================================================= */

function deleteAnalysisRecord(
  recordId
) {

  const records =
    getRecords();


  const target =
    records.find(
      (record) =>
        record.id ===
        recordId
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
        record.id !==
        recordId
    );


  const success =
    saveRecords(
      nextRecords
    );


  if (success) {

    showToast(
      "분석 기록이 삭제되었습니다."
    );

  }


  return success;

}


/* =========================================================
   47. BUTTON LOADING
========================================================= */

function setButtonLoading(
  button,
  loading = true,
  loadingText = "처리 중..."
) {

  if (!button) {
    return;
  }


  if (loading) {

    if (
      !button.dataset.originalHtml
    ) {

      button.dataset.originalHtml =
        button.innerHTML;

    }


    button.disabled =
      true;


    button.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin"></i>
      ${escapeHTML(
        loadingText
      )}
    `;


    return;

  }


  button.disabled =
    false;


  if (
    button.dataset.originalHtml
  ) {

    button.innerHTML =
      button.dataset.originalHtml;


    delete button.dataset.originalHtml;

  }

}


/* =========================================================
   48. FILE SIZE
========================================================= */

function formatFileSize(
  bytes
) {

  const size =
    safeNumber(
      bytes
    );


  if (
    size <= 0
  ) {

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
        Math.log(
          size
        ) /
        Math.log(
          1024
        )
      ),

      units.length - 1

    );


  const value =
    size /
    1024 ** index;


  return (
    `${roundNumber(
      value,
      index === 0
        ? 0
        : 1
    )} ${units[index]}`
  );

}


/* =========================================================
   49. FILE TO DATA URL
========================================================= */

function fileToDataURL(
  file
) {

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


      reader.onload =
        () => {

          resolve(
            reader.result
          );

        };


      reader.onerror =
        () => {

          reject(
            new Error(
              "파일을 읽을 수 없습니다."
            )
          );

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}


/* =========================================================
   50. VIDEO TIME
========================================================= */

function formatVideoTime(
  seconds
) {

  const value =
    Math.max(
      0,
      Math.floor(
        safeNumber(
          seconds
        )
      )
    );


  const minutes =
    Math.floor(
      value / 60
    );


  const remainSeconds =
    value % 60;


  return (
    `${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:` +
    `${String(
      remainSeconds
    ).padStart(
      2,
      "0"
    )}`
  );

}


/* =========================================================
   51. DEBOUNCE
========================================================= */

function debounce(
  callback,
  delay = 250
) {

  let timer =
    null;


  return (
    ...args
  ) => {

    clearTimeout(
      timer
    );


    timer =
      setTimeout(
        () => {

          callback(
            ...args
          );

        },
        delay
      );

  };

}


/* =========================================================
   52. SAFE EVENT
========================================================= */

function on(
  selector,
  eventName,
  handler
) {

  const element =
    typeof selector ===
    "string"
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
   53. QUERY HELPERS
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
   54. ESCAPE KEY
========================================================= */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key !==
      "Escape"
    ) {

      return;

    }


    closeSidebar();

    closeAllTemporaryPanels();

  }
);


/* =========================================================
   55. CLOSE TEMP PANELS
========================================================= */

function closeAllTemporaryPanels() {

  const elements =
    document.querySelectorAll(
      [
        ".modal.open",
        ".dialog.open",
        ".dropdown.open",
        ".context-menu.open"
      ].join(",")
    );


  elements.forEach(
    (element) => {

      element.classList.remove(
        "open"
      );

    }
  );

}


/* =========================================================
   56. GLOBAL ERROR HANDLER
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
   57. WINDOW LOAD
========================================================= */

window.addEventListener(
  "load",
  () => {

    /*
      다른 JS 모듈들이 로드된 후
      한 번 더 전체 동기화
    */

    cachePages();

    populateGlobalAthleteSelectors();

    updateDashboard();


    document.dispatchEvent(
      new CustomEvent(
        "spl:systemready"
      )
    );


    console.log(
      "[SPL] All modules loaded"
    );

  }
);


/* =========================================================
   58. GLOBAL API
========================================================= */

window.SPL =
  SPL;


window.SPLApp = {

  /* Navigation */

  openPage,

  closeSidebar,


  /* UI */

  showToast,

  setButtonLoading,


  /* Athlete */

  getAthletes,

  saveAthletes,

  getAthleteById,

  getAthleteRecords,

  populateGlobalAthleteSelectors,


  /* Records */

  getRecords,

  saveRecords,

  getRecordById,

  addAnalysisRecord,

  createRecordFromScores,

  updateAnalysisRecord,

  deleteAnalysisRecord,


  /* Analysis */

  getAnalysisTypeLabel,

  createScoreSummary,

  clampScore,

  getScoreStatus,


  /* Dashboard */

  updateDashboard,


  /* ID / Date */

  createId,

  createDateId,

  formatDate,

  formatDateTime,


  /* Number */

  safeNumber,

  roundNumber,

  average,


  /* File */

  formatFileSize,

  fileToDataURL,


  /* Video */

  formatVideoTime,


  /* Helpers */

  escapeHTML,

  debounce,

  on,

  $,

  $$,


  /* Refresh */

  requestAthleteRefresh,

  requestRecordRefresh,

  requestReportRefresh

};


/* =========================================================
   59. DEBUG CHECK
========================================================= */

window.SPLDebug = {

  pages() {

    return [
      ...document.querySelectorAll(
        ".page"
      )
    ].map(
      (page) => ({
        id:
          page.id,

        active:
          page.classList.contains(
            "active"
          )
      })
    );

  },


  navigation() {

    return [
      ...document.querySelectorAll(
        ".nav-item[data-page]"
      )
    ].map(
      (button) => ({
        page:
          button.dataset.page,

        exists:
          Boolean(
            document.getElementById(
              `page-${button.dataset.page}`
            )
          )
      })
    );

  },


  open(
    pageName
  ) {

    return openPage(
      pageName
    );

  }

};


/* =========================================================
   END OF app.js
========================================================= */