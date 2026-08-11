/* =========================================================
   SEOLCHEON PERFORMANCE LAB
   app.js

   CORE SYSTEM
   Navigation / Storage / Toast / Global API
========================================================= */

"use strict";


/* =========================================================
   01. APP STATE
========================================================= */

const SPL = {

  currentPage: "dashboard",

  pages: {},

  storageKeys: {
    athletes: "spl_athletes",
    records: "spl_records",
    settings: "spl_settings"
  }

};


/* =========================================================
   02. START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    console.log(
      "[SPL] Starting..."
    );

    cachePages();

    initializeNavigation();

    initializeMobileMenu();

    initializeGlobalPageButtons();

    updateActiveNavigation(
      "dashboard"
    );

    updateDashboard();

    console.log(
      "[SPL] Ready"
    );

  }
);


/* =========================================================
   03. CACHE ALL PAGES
========================================================= */

function cachePages() {

  SPL.pages = {};

  const pages =
    document.querySelectorAll(
      ".page"
    );


  pages.forEach(
    (page) => {

      if (!page.id) {
        return;
      }


      if (
        !page.id.startsWith(
          "page-"
        )
      ) {
        return;
      }


      const pageName =
        page.id.substring(
          5
        );


      SPL.pages[
        pageName
      ] = page;

    }
  );


  console.log(
    "[SPL] Pages:",
    Object.keys(
      SPL.pages
    )
  );

}


/* =========================================================
   04. SIDEBAR NAVIGATION
========================================================= */

function initializeNavigation() {

  const buttons =
    document.querySelectorAll(
      ".nav-item[data-page]"
    );


  console.log(
    "[SPL] Navigation buttons:",
    buttons.length
  );


  buttons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        (event) => {

          event.preventDefault();

          event.stopPropagation();


          const pageName =
            button.getAttribute(
              "data-page"
            );


          console.log(
            "[SPL] CLICK:",
            pageName
          );


          if (!pageName) {
            return;
          }


          openPage(
            pageName
          );

        }
      );

    }
  );

}


/* =========================================================
   05. GLOBAL PAGE BUTTONS

   대시보드의 빠른 분석,
   선수 등록 버튼 등 처리
========================================================= */

function initializeGlobalPageButtons() {

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
        사이드바 버튼은
        initializeNavigation에서 처리
      */

      if (
        button.classList.contains(
          "nav-item"
        )
      ) {
        return;
      }


      const target =
        button.getAttribute(
          "data-page-target"
        );


      if (!target) {
        return;
      }


      event.preventDefault();


      console.log(
        "[SPL] TARGET:",
        target
      );


      openPage(
        target
      );

    }
  );

}


/* =========================================================
   06. OPEN PAGE
========================================================= */

function openPage(
  pageName
) {

  console.log(
    "[SPL] Opening:",
    pageName
  );


  /*
    캐시에 없으면
    DOM에서 직접 다시 검색
  */

  let targetPage =
    SPL.pages[
      pageName
    ];


  if (!targetPage) {

    targetPage =
      document.getElementById(
        `page-${pageName}`
      );


    if (targetPage) {

      SPL.pages[
        pageName
      ] = targetPage;

    }

  }


  /*
    페이지를 못 찾았을 경우
  */

  if (!targetPage) {

    console.error(
      `[SPL] PAGE NOT FOUND: page-${pageName}`
    );


    showToast(
      `페이지를 찾을 수 없습니다: ${pageName}`,
      "error"
    );


    return false;

  }


  /*
    모든 페이지 숨기기
  */

  const allPages =
    document.querySelectorAll(
      ".page"
    );


  allPages.forEach(
    (page) => {

      page.classList.remove(
        "active"
      );

      /*
        CSS 문제까지 방지하기 위해
        직접 display 처리
      */

      page.style.display =
        "none";

    }
  );


  /*
    선택 페이지 표시
  */

  targetPage.classList.add(
    "active"
  );


  targetPage.style.display =
    "block";


  SPL.currentPage =
    pageName;


  /*
    메뉴 active 변경
  */

  updateActiveNavigation(
    pageName
  );


  /*
    모바일 메뉴 닫기
  */

  closeSidebar();


  /*
    화면 맨 위로
  */

  try {

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });

  } catch {

    window.scrollTo(
      0,
      0
    );

  }


  /*
    다른 JS 파일에
    페이지 변경 알림
  */

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
    "[SPL] OPEN SUCCESS:",
    pageName
  );


  return true;

}


/* =========================================================
   07. ACTIVE NAVIGATION
========================================================= */

function updateActiveNavigation(
  pageName
) {

  const buttons =
    document.querySelectorAll(
      ".nav-item[data-page]"
    );


  buttons.forEach(
    (button) => {

      const buttonPage =
        button.getAttribute(
          "data-page"
        );


      if (
        buttonPage ===
        pageName
      ) {

        button.classList.add(
          "active"
        );

      } else {

        button.classList.remove(
          "active"
        );

      }

    }
  );

}


/* =========================================================
   08. MOBILE MENU
========================================================= */

function initializeMobileMenu() {

  const menuButton =
    document.getElementById(
      "mobileMenu"
    );


  const sidebar =
    document.getElementById(
      "sidebar"
    );


  if (
    !menuButton ||
    !sidebar
  ) {
    return;
  }


  menuButton.addEventListener(
    "click",
    (event) => {

      event.preventDefault();

      event.stopPropagation();


      sidebar.classList.toggle(
        "open"
      );

    }
  );

}


/* =========================================================
   09. CLOSE SIDEBAR
========================================================= */

function closeSidebar() {

  const sidebar =
    document.getElementById(
      "sidebar"
    );


  if (!sidebar) {
    return;
  }


  sidebar.classList.remove(
    "open"
  );

}


/* =========================================================
   10. STORAGE GET
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

  } catch (
    error
  ) {

    console.error(
      "[SPL] Storage read error:",
      error
    );


    return fallback;

  }

}


/* =========================================================
   11. STORAGE SAVE
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

  } catch (
    error
  ) {

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
   12. ATHLETES
========================================================= */

function getAthletes() {

  return getStorageData(
    SPL.storageKeys.athletes,
    []
  );

}


function saveAthletes(
  athletes
) {

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
   13. RECORDS
========================================================= */

function getRecords() {

  return getStorageData(
    SPL.storageKeys.records,
    []
  );

}


function saveRecords(
  records
) {

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
   14. CREATE ID
========================================================= */

function createId(
  prefix = "SPL"
) {

  return (
    prefix +
    "-" +
    Date.now()
      .toString(
        36
      ) +
    "-" +
    Math.random()
      .toString(
        36
      )
      .substring(
        2,
        8
      )
  );

}


/* =========================================================
   15. HTML ESCAPE
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
      : String(
          value
        );


  return div.innerHTML;

}


/* =========================================================
   16. DATE FORMAT
========================================================= */

function formatDate(
  value
) {

  if (!value) {
    return "-";
  }


  const date =
    new Date(
      value
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
      year:
        "numeric",

      month:
        "2-digit",

      day:
        "2-digit"
    }
  ).format(
    date
  );

}


/* =========================================================
   17. DATE TIME FORMAT
========================================================= */

function formatDateTime(
  value
) {

  if (!value) {
    return "-";
  }


  const date =
    new Date(
      value
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
      year:
        "numeric",

      month:
        "2-digit",

      day:
        "2-digit",

      hour:
        "2-digit",

      minute:
        "2-digit"
    }
  ).format(
    date
  );

}


/* =========================================================
   18. SCORE
========================================================= */

function clampScore(
  value
) {

  const number =
    Number(
      value
    );


  if (
    !Number.isFinite(
      number
    )
  ) {
    return 0;
  }


  return Math.max(
    0,
    Math.min(
      100,
      number
    )
  );

}


/* =========================================================
   19. SCORE STATUS
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
      label:
        "매우 우수",

      className:
        "excellent"
    };

  }


  if (
    value >= 80
  ) {

    return {
      label:
        "우수",

      className:
        "good"
    };

  }


  if (
    value >= 70
  ) {

    return {
      label:
        "양호",

      className:
        "normal"
    };

  }


  if (
    value >= 60
  ) {

    return {
      label:
        "개선 필요",

      className:
        "warning"
    };

  }


  return {
    label:
      "집중 개선",

    className:
      "danger"
  };

}


/* =========================================================
   20. GET ATHLETE BY ID
========================================================= */

function getAthleteById(
  id
) {

  if (!id) {
    return null;
  }


  return (
    getAthletes().find(
      (athlete) =>
        athlete.id ===
        id
    ) ||
    null
  );

}


/* =========================================================
   21. GET RECORD BY ID
========================================================= */

function getRecordById(
  id
) {

  if (!id) {
    return null;
  }


  return (
    getRecords().find(
      (record) =>
        record.id ===
        id
    ) ||
    null
  );

}


/* =========================================================
   22. ATHLETE RECORDS
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
   23. ANALYSIS TYPE
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
    labels[
      type
    ] ||
    "분석"
  );

}


/* =========================================================
   24. ADD RECORD
========================================================= */

function addAnalysisRecord(
  data = {}
) {

  const records =
    getRecords();


  const athlete =
    getAthleteById(
      data.athleteId
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
        data.type
      ),

    sport:
      data.sport ||
      athlete?.sport ||
      "",

    score:
      clampScore(
        data.score
      ),

    stability:
      clampScore(
        data.stability ??
        data.score
      ),

    balance:
      clampScore(
        data.balance ??
        data.score
      ),

    efficiency:
      clampScore(
        data.efficiency ??
        data.score
      ),

    strength:
      data.strength ||
      "",

    improvement:
      data.improvement ||
      "",

    trainingNote:
      data.trainingNote ||
      "",

    details:
      data.details ||
      {},

    createdAt:
      data.createdAt ||
      new Date()
        .toISOString(),

    updatedAt:
      new Date()
        .toISOString()

  };


  records.push(
    record
  );


  if (
    !saveRecords(
      records
    )
  ) {
    return null;
  }


  showToast(
    "분석 결과가 저장되었습니다."
  );


  return record;

}


/* =========================================================
   25. DELETE RECORD
========================================================= */

function deleteAnalysisRecord(
  recordId
) {

  const records =
    getRecords();


  const next =
    records.filter(
      (record) =>
        record.id !==
        recordId
    );


  if (
    next.length ===
    records.length
  ) {

    return false;

  }


  const success =
    saveRecords(
      next
    );


  if (success) {

    showToast(
      "분석 기록을 삭제했습니다."
    );

  }


  return success;

}


/* =========================================================
   26. UPDATE RECORD
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
    return null;
  }


  records[
    index
  ] = {

    ...records[
      index
    ],

    ...changes,

    id:
      records[
        index
      ].id,

    updatedAt:
      new Date()
        .toISOString()

  };


  if (
    changes.score !==
    undefined
  ) {

    records[
      index
    ].score =
      clampScore(
        changes.score
      );

  }


  if (
    !saveRecords(
      records
    )
  ) {
    return null;
  }


  return records[
    index
  ];

}


/* =========================================================
   27. GLOBAL ATHLETE SELECTORS
========================================================= */

function populateGlobalAthleteSelectors() {

  const athletes =
    getAthletes();


  const ids = [

    "poseAthlete",

    "videoAthlete",

    "weightAthlete",

    "sportAthlete",

    "peAthlete",

    "reportAthlete"

  ];


  ids.forEach(
    (id) => {

      const select =
        document.getElementById(
          id
        );


      if (!select) {
        return;
      }


      const current =
        select.value;


      select.innerHTML =
        `<option value="">선수 선택</option>`;


      athletes.forEach(
        (athlete) => {

          const option =
            document.createElement(
              "option"
            );


          option.value =
            athlete.id;


          option.textContent =
            athlete.sport
              ? `${athlete.name} · ${athlete.sport}`
              : athlete.name;


          select.appendChild(
            option
          );

        }
      );


      if (
        athletes.some(
          (athlete) =>
            athlete.id ===
            current
        )
      ) {

        select.value =
          current;

      }

    }
  );

}


/* =========================================================
   28. DASHBOARD
========================================================= */

function updateDashboard() {

  const athletes =
    getAthletes();


  const records =
    getRecords();


  setElementText(
    "dashboardAthleteCount",
    athletes.length
  );


  setElementText(
    "dashboardAnalysisCount",
    records.length
  );


  const scores =
    records
      .map(
        (record) =>
          Number(
            record.score
          )
      )
      .filter(
        Number.isFinite
      );


  const average =
    scores.length
      ? Math.round(
          scores.reduce(
            (sum, value) =>
              sum + value,
            0
          ) /
          scores.length
        )
      : "--";


  setElementText(
    "dashboardAverageScore",
    average
  );


  updateWeeklyCount(
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
   29. WEEKLY COUNT
========================================================= */

function updateWeeklyCount(
  records
) {

  const now =
    new Date();


  const start =
    new Date(
      now
    );


  start.setHours(
    0,
    0,
    0,
    0
  );


  start.setDate(
    start.getDate() -
    start.getDay()
  );


  const count =
    records.filter(
      (record) => {

        const date =
          new Date(
            record.createdAt
          );


        return (
          Number.isFinite(
            date.getTime()
          ) &&
          date >= start
        );

      }
    ).length;


  setElementText(
    "dashboardWeeklyCount",
    count
  );

}


/* =========================================================
   30. SET TEXT
========================================================= */

function setElementText(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (element) {

    element.textContent =
      String(
        value
      );

  }

}


/* =========================================================
   31. RECENT RECORDS
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
    !recent.length
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
    recent.map(
      (record) => `
        <div class="recent-analysis-item">

          <div class="recent-analysis-info">

            <strong>
              ${escapeHTML(
                record.athleteName
              )}
            </strong>

            <span>
              ${escapeHTML(
                record.typeLabel ||
                getAnalysisTypeLabel(
                  record.type
                )
              )}
              ·
              ${formatDate(
                record.createdAt
              )}
            </span>

          </div>

          <strong>
            ${Math.round(
              Number(
                record.score
              ) || 0
            )}
          </strong>

        </div>
      `
    ).join("");

}


/* =========================================================
   32. DASHBOARD ATHLETES
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


  if (
    !athletes.length
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
    athletes
      .slice(
        0,
        4
      )
      .map(
        (athlete) => {

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
            latest
              ? Math.round(
                  Number(
                    latest.score
                  ) || 0
                )
              : "--";


          return `
            <div class="dashboard-athlete-item">

              <div class="dashboard-athlete-avatar">

                ${
                  athlete.photo
                    ? `
                      <img
                        src="${athlete.photo}"
                        alt=""
                      >
                    `
                    : `
                      <i class="fa-solid fa-user"></i>
                    `
                }

              </div>

              <div class="dashboard-athlete-info">

                <strong>
                  ${escapeHTML(
                    athlete.name
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
   33. TOAST
========================================================= */

let toastTimer =
  null;


function showToast(
  message,
  type = "success"
) {

  const toast =
    document.getElementById(
      "toast"
    );


  const text =
    document.getElementById(
      "toastMessage"
    );


  if (
    !toast ||
    !text
  ) {

    console.log(
      message
    );

    return;

  }


  text.textContent =
    message;


  toast.classList.remove(
    "success",
    "warning",
    "error"
  );


  toast.classList.add(
    type
  );


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
      2500
    );

}


/* =========================================================
   34. PAGE CHANGE MODULE REFRESH
========================================================= */

document.addEventListener(
  "spl:pagechange",
  (event) => {

    const page =
      event.detail?.page;


    if (
      page ===
      "dashboard"
    ) {

      updateDashboard();

    }


    if (
      page ===
      "athletes"
    ) {

      document.dispatchEvent(
        new CustomEvent(
          "spl:refreshathletes"
        )
      );

    }


    if (
      page ===
      "records"
    ) {

      document.dispatchEvent(
        new CustomEvent(
          "spl:refreshrecords"
        )
      );

    }


    if (
      page ===
      "report"
    ) {

      document.dispatchEvent(
        new CustomEvent(
          "spl:refreshreport"
        )
      );

    }


    populateGlobalAthleteSelectors();

  }
);


/* =========================================================
   35. DATA UPDATE EVENTS
========================================================= */

document.addEventListener(
  "spl:athletesupdated",
  () => {

    populateGlobalAthleteSelectors();

    updateDashboard();

  }
);


document.addEventListener(
  "spl:recordsupdated",
  () => {

    updateDashboard();

  }
);


/* =========================================================
   36. WINDOW LOAD SAFETY
========================================================= */

window.addEventListener(
  "load",
  () => {

    /*
      다른 JS가 DOM을 건드렸더라도
      페이지를 다시 캐시
    */

    cachePages();


    populateGlobalAthleteSelectors();


    /*
      첫 화면 강제 설정
    */

    if (
      SPL.currentPage ===
      "dashboard"
    ) {

      openPage(
        "dashboard"
      );

    }


    console.log(
      "[SPL] FULL LOAD COMPLETE"
    );

  }
);


/* =========================================================
   37. GLOBAL API

   athletes.js / pose.js / records.js /
   sports.js / report.js에서 사용
========================================================= */

window.SPL =
  SPL;


window.SPLApp = {

  /* navigation */

  openPage,

  closeSidebar,


  /* UI */

  showToast,


  /* athletes */

  getAthletes,

  saveAthletes,

  getAthleteById,

  getAthleteRecords,

  populateGlobalAthleteSelectors,


  /* records */

  getRecords,

  saveRecords,

  getRecordById,

  addAnalysisRecord,

  updateAnalysisRecord,

  deleteAnalysisRecord,


  /* helpers */

  createId,

  formatDate,

  formatDateTime,

  clampScore,

  getScoreStatus,

  getAnalysisTypeLabel,

  escapeHTML,


  /* dashboard */

  updateDashboard

};


/* =========================================================
   38. DEBUG TOOL

   콘솔에서:
   SPLDebug.test()
========================================================= */

window.SPLDebug = {

  test() {

    const result = [];


    document
      .querySelectorAll(
        ".nav-item[data-page]"
      )
      .forEach(
        (button) => {

          const page =
            button.dataset.page;


          const target =
            document.getElementById(
              `page-${page}`
            );


          result.push({
            button:
              page,

            target:
              Boolean(
                target
              )
          });

        }
      );


    console.table(
      result
    );


    return result;

  },


  open(
    page
  ) {

    return openPage(
      page
    );

  },


  pages() {

    return Object.keys(
      SPL.pages
    );

  }

};


/* =========================================================
   END
========================================================= */