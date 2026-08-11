/* =========================================================
   설천고 스포츠과학 훈련센터 PRO
   APP.JS
   PART 1 / 3

   CORE SYSTEM
   - Page Navigation
   - Mobile Sidebar
   - Quick Analysis
   - Local Storage
========================================================= */

"use strict";


/* =========================================================
   01. APP CONFIG
========================================================= */

const APP_CONFIG = {

  name: "설천고 스포츠과학 훈련센터 PRO",

  version: "1.0.0",

  storageKeys: {

    athletes: "seolcheon_pro_athletes",

    analyses: "seolcheon_pro_analyses",

    reports: "seolcheon_pro_reports",

    settings: "seolcheon_pro_settings",

    universityGoal: "seolcheon_pro_university_goal"

  }

};


/* =========================================================
   02. PAGE INFORMATION
========================================================= */

const PAGE_INFO = {

  dashboard: {
    title: "대시보드"
  },

  athletes: {
    title: "선수 등록 · 관리"
  },

  weight: {
    title: "웨이트"
  },

  summer: {
    title: "하계종목"
  },

  winter: {
    title: "동계종목"
  },

  "pe-entrance": {
    title: "체대입시"
  },

  pose: {
    title: "AI 자세분석"
  },

  comparison: {
    title: "엘리트 기준 비교"
  },

  records: {
    title: "분석 기록"
  },

  reports: {
    title: "리포트"
  },

  statistics: {
    title: "통계"
  },

  settings: {
    title: "설정"
  }

};


/* =========================================================
   03. APP STATE
========================================================= */

const AppState = {

  currentPage: "dashboard",

  athletes: [],

  analyses: [],

  reports: [],

  settings: {},

  universityGoal: null,

  chart: null

};


/* =========================================================
   04. SAFE LOCAL STORAGE
========================================================= */

const Storage = {

  get(key, fallback = null) {

    try {

      const value = localStorage.getItem(key);

      if (value === null) {
        return fallback;
      }

      return JSON.parse(value);

    } catch (error) {

      console.warn(
        `[Storage] 데이터를 읽지 못했습니다: ${key}`,
        error
      );

      return fallback;

    }

  },


  set(key, value) {

    try {

      localStorage.setItem(
        key,
        JSON.stringify(value)
      );

      return true;

    } catch (error) {

      console.warn(
        `[Storage] 데이터를 저장하지 못했습니다: ${key}`,
        error
      );

      return false;

    }

  },


  remove(key) {

    try {

      localStorage.removeItem(key);

      return true;

    } catch (error) {

      console.warn(
        `[Storage] 데이터를 삭제하지 못했습니다: ${key}`,
        error
      );

      return false;

    }

  }

};


/* =========================================================
   05. LOAD APP DATA
========================================================= */

function loadAppData() {

  AppState.athletes = Storage.get(
    APP_CONFIG.storageKeys.athletes,
    []
  );


  AppState.analyses = Storage.get(
    APP_CONFIG.storageKeys.analyses,
    []
  );


  AppState.reports = Storage.get(
    APP_CONFIG.storageKeys.reports,
    []
  );


  AppState.settings = Storage.get(
    APP_CONFIG.storageKeys.settings,
    {}
  );


  AppState.universityGoal = Storage.get(
    APP_CONFIG.storageKeys.universityGoal,
    null
  );


  if (!Array.isArray(AppState.athletes)) {
    AppState.athletes = [];
  }


  if (!Array.isArray(AppState.analyses)) {
    AppState.analyses = [];
  }


  if (!Array.isArray(AppState.reports)) {
    AppState.reports = [];
  }


  if (
    typeof AppState.settings !== "object" ||
    AppState.settings === null
  ) {

    AppState.settings = {};

  }

}


/* =========================================================
   06. DOM HELPERS
========================================================= */

function getElement(selector) {

  return document.querySelector(selector);

}


function getElements(selector) {

  return Array.from(
    document.querySelectorAll(selector)
  );

}


/* =========================================================
   07. PAGE NAVIGATION
========================================================= */

function navigateTo(pageName) {

  if (!PAGE_INFO[pageName]) {

    console.warn(
      `[Navigation] 존재하지 않는 페이지: ${pageName}`
    );

    return;

  }


  const targetPage = getElement(
    `[data-page-section="${pageName}"]`
  );


  if (!targetPage) {

    console.warn(
      `[Navigation] HTML 페이지를 찾지 못했습니다: ${pageName}`
    );

    return;

  }


  /* -----------------------------------------
     모든 페이지 숨기기
  ----------------------------------------- */

  getElements(
    "[data-page-section]"
  ).forEach((page) => {

    page.classList.remove("active");

  });


  /* -----------------------------------------
     선택 페이지 표시
  ----------------------------------------- */

  targetPage.classList.add("active");


  /* -----------------------------------------
     사이드바 ACTIVE 변경
  ----------------------------------------- */

  getElements(
    ".nav-item"
  ).forEach((button) => {

    const buttonPage =
      button.dataset.page;

    button.classList.toggle(
      "active",
      buttonPage === pageName
    );

  });


  /* -----------------------------------------
     상단 페이지 제목 변경
  ----------------------------------------- */

  const pageTitle =
    document.getElementById("pageTitle");


  if (pageTitle) {

    pageTitle.textContent =
      PAGE_INFO[pageName].title;

  }


  /* -----------------------------------------
     상태 저장
  ----------------------------------------- */

  AppState.currentPage = pageName;


  /* -----------------------------------------
     모바일 사이드바 닫기
  ----------------------------------------- */

  closeSidebar();


  /* -----------------------------------------
     화면 위로 이동
  ----------------------------------------- */

  try {

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  } catch {

    window.scrollTo(0, 0);

  }


  /* -----------------------------------------
     페이지별 업데이트
  ----------------------------------------- */

  onPageOpened(pageName);

}


/* =========================================================
   08. PAGE OPEN EVENT
========================================================= */

function onPageOpened(pageName) {

  switch (pageName) {

    case "dashboard":

      refreshDashboard();

      break;


    case "athletes":

      console.log(
        "[Page] 선수 관리"
      );

      break;


    case "weight":

      console.log(
        "[Page] 웨이트"
      );

      break;


    case "summer":

      console.log(
        "[Page] 하계종목"
      );

      break;


    case "winter":

      console.log(
        "[Page] 동계종목"
      );

      break;


    case "pe-entrance":

      console.log(
        "[Page] 체대입시"
      );

      break;


    case "pose":

      console.log(
        "[Page] 자세분석"
      );

      break;


    case "comparison":

      console.log(
        "[Page] 엘리트 기준 비교"
      );

      break;


    case "records":

      console.log(
        "[Page] 분석 기록"
      );

      break;


    case "reports":

      console.log(
        "[Page] 리포트"
      );

      break;


    case "statistics":

      console.log(
        "[Page] 통계"
      );

      break;


    case "settings":

      console.log(
        "[Page] 설정"
      );

      break;

  }

}


/* =========================================================
   09. SIDEBAR
========================================================= */

function openSidebar() {

  document.body.classList.add(
    "sidebar-open"
  );


  const overlay =
    document.getElementById(
      "sidebarOverlay"
    );


  if (overlay) {

    overlay.classList.add(
      "active"
    );

  }

}


function closeSidebar() {

  document.body.classList.remove(
    "sidebar-open"
  );


  const overlay =
    document.getElementById(
      "sidebarOverlay"
    );


  if (overlay) {

    overlay.classList.remove(
      "active"
    );

  }

}


function toggleSidebar() {

  const isOpen =
    document.body.classList.contains(
      "sidebar-open"
    );


  if (isOpen) {

    closeSidebar();

  } else {

    openSidebar();

  }

}


/* =========================================================
   10. NAVIGATION EVENTS
========================================================= */

function setupNavigation() {

  /* -----------------------------------------
     LEFT MENU
  ----------------------------------------- */

  getElements(
    ".nav-item[data-page]"
  ).forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        const page =
          button.dataset.page;


        navigateTo(page);

      }
    );

  });


  /* -----------------------------------------
     DASHBOARD / QUICK BUTTONS
  ----------------------------------------- */

  getElements(
    "[data-go-page]"
  ).forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        const page =
          button.dataset.goPage;


        navigateTo(page);

      }
    );

  });


  /* -----------------------------------------
     MOBILE MENU BUTTON
  ----------------------------------------- */

  const sidebarToggle =
    document.getElementById(
      "sidebarToggle"
    );


  if (sidebarToggle) {

    sidebarToggle.addEventListener(
      "click",
      toggleSidebar
    );

  }


  /* -----------------------------------------
     MOBILE OVERLAY
  ----------------------------------------- */

  const sidebarOverlay =
    document.getElementById(
      "sidebarOverlay"
    );


  if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
      "click",
      closeSidebar
    );

  }


  /* -----------------------------------------
     ESC CLOSE
  ----------------------------------------- */

  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Escape") {

        closeSidebar();

      }

    }
  );

}


/* =========================================================
   11. QUICK ANALYSIS
========================================================= */

function setupQuickAnalysis() {

  const button =
    document.getElementById(
      "quickAnalysisBtn"
    );


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    () => {

      navigateTo("pose");

    }
  );

}


/* =========================================================
   12. BASIC DASHBOARD UPDATE
========================================================= */

function refreshDashboard() {

  /* -----------------------------------------
     ATHLETE COUNT
  ----------------------------------------- */

  const athleteCount =
    document.getElementById(
      "dashboardAthleteCount"
    );


  if (athleteCount) {

    athleteCount.textContent =
      AppState.athletes.length;

  }


  /* -----------------------------------------
     ANALYSIS COUNT
  ----------------------------------------- */

  const analysisCount =
    document.getElementById(
      "dashboardAnalysisCount"
    );


  if (analysisCount) {

    analysisCount.textContent =
      AppState.analyses.length;

  }


  /* -----------------------------------------
     REPORT COUNT
  ----------------------------------------- */

  const reportCount =
    document.getElementById(
      "dashboardReportCount"
    );


  if (reportCount) {

    reportCount.textContent =
      AppState.reports.length;

  }


  /* -----------------------------------------
     AVERAGE SCORE
  ----------------------------------------- */

  const averageScore =
    calculateAverageAnalysisScore();


  const averageElement =
    document.getElementById(
      "dashboardAverageScore"
    );


  if (averageElement) {

    averageElement.textContent =
      averageScore === null
        ? "--"
        : averageScore;

  }


  const mainScore =
    document.getElementById(
      "performanceMainScore"
    );


  if (mainScore) {

    mainScore.textContent =
      averageScore === null
        ? "--"
        : averageScore;

  }

}


/* =========================================================
   13. CALCULATE AVERAGE SCORE
========================================================= */

function calculateAverageAnalysisScore() {

  if (
    !Array.isArray(AppState.analyses) ||
    AppState.analyses.length === 0
  ) {

    return null;

  }


  const validScores =
    AppState.analyses
      .map((analysis) => {

        const score =
          Number(
            analysis.score
          );


        return Number.isFinite(score)
          ? score
          : null;

      })
      .filter(
        (score) =>
          score !== null
      );


  if (validScores.length === 0) {

    return null;

  }


  const total =
    validScores.reduce(
      (sum, score) =>
        sum + score,
      0
    );


  return Math.round(
    total / validScores.length
  );

}


/* =========================================================
   14. WINDOW RESIZE
========================================================= */

function setupResponsiveEvents() {

  window.addEventListener(
    "resize",
    () => {

      /*
        데스크톱 크기로 돌아가면
        모바일 사이드바 상태 제거
      */

      if (window.innerWidth > 900) {

        closeSidebar();

      }

    }
  );

}


/* =========================================================
   15. GLOBAL ERROR LOG
========================================================= */

window.addEventListener(
  "error",
  (event) => {

    console.error(
      "[SEOLCHEON PRO ERROR]",
      event.error || event.message
    );

  }
);


/* =========================================================
   16. APP INITIALIZATION
========================================================= */

function initializeApp() {

  console.log(
    `${APP_CONFIG.name} v${APP_CONFIG.version}`
  );


  /* 데이터 불러오기 */

  loadAppData();


  /* 이벤트 연결 */

  setupNavigation();

  setupQuickAnalysis();

  setupResponsiveEvents();


  /* 대시보드 초기화 */

  refreshDashboard();


  /* 첫 페이지 */

  navigateTo(
    AppState.currentPage
  );


  console.log(
    "[SYSTEM] READY"
  );

}


/* =========================================================
   17. START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);


/* =========================================================
   APP.JS PART 1 END
   PART 2를 바로 아래에 이어 붙입니다.
========================================================= */
/* =========================================================
   설천고 스포츠과학 훈련센터 PRO
   APP.JS
   PART 2 / 3

   DASHBOARD DATA SYSTEM
   - Performance Scores
   - Recent Analysis
   - Development Chart
   - University Goal
========================================================= */


/* =========================================================
   18. NUMBER HELPERS
========================================================= */

function clampNumber(
  value,
  min = 0,
  max = 100
) {

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  return Math.min(
    max,
    Math.max(min, number)
  );

}


function averageNumbers(values = []) {

  const validValues =
    values
      .map(Number)
      .filter(Number.isFinite);


  if (validValues.length === 0) {
    return null;
  }


  const total =
    validValues.reduce(
      (sum, value) => sum + value,
      0
    );


  return Math.round(
    total / validValues.length
  );

}


/* =========================================================
   19. DATE FORMAT
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


/* =========================================================
   20. SAFE TEXT
========================================================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   21. FIND ATHLETE
========================================================= */

function findAthleteById(athleteId) {

  if (!athleteId) {
    return null;
  }


  return (
    AppState.athletes.find(
      (athlete) =>
        String(athlete.id) ===
        String(athleteId)
    ) || null
  );

}


/* =========================================================
   22. GET ANALYSIS SCORE
========================================================= */

function getAnalysisScore(
  analysis,
  key
) {

  if (!analysis) {
    return null;
  }


  /*
    여러 버전의 분석 데이터와
    호환되도록 후보 필드를 확인
  */

  const candidates = {

    stability: [
      analysis.stability,
      analysis.stabilityScore,
      analysis.scores?.stability
    ],

    symmetry: [
      analysis.symmetry,
      analysis.symmetryScore,
      analysis.scores?.symmetry
    ],

    technique: [
      analysis.technique,
      analysis.techniqueScore,
      analysis.scores?.technique
    ],

    elite: [
      analysis.elite,
      analysis.eliteScore,
      analysis.eliteSimilarity,
      analysis.scores?.elite
    ]

  };


  const values =
    candidates[key] || [];


  for (const value of values) {

    const score =
      clampNumber(value);


    if (score !== null) {
      return score;
    }

  }


  return null;

}


/* =========================================================
   23. CATEGORY AVERAGE
========================================================= */

function calculateCategoryAverage(key) {

  if (
    !Array.isArray(
      AppState.analyses
    ) ||
    AppState.analyses.length === 0
  ) {

    return null;

  }


  const scores =
    AppState.analyses
      .map(
        (analysis) =>
          getAnalysisScore(
            analysis,
            key
          )
      )
      .filter(
        (value) =>
          value !== null
      );


  return averageNumbers(scores);

}


/* =========================================================
   24. UPDATE SCORE BAR
========================================================= */

function updateScoreBar(
  textId,
  barId,
  score
) {

  const text =
    document.getElementById(
      textId
    );


  const bar =
    document.getElementById(
      barId
    );


  if (text) {

    text.textContent =
      score === null
        ? "--"
        : `${Math.round(score)}`;

  }


  if (bar) {

    const safeScore =
      score === null
        ? 0
        : clampNumber(score) ?? 0;


    bar.style.width =
      `${safeScore}%`;

  }

}


/* =========================================================
   25. REFRESH PERFORMANCE SCORES
========================================================= */

function refreshPerformanceScores() {

  const stability =
    calculateCategoryAverage(
      "stability"
    );


  const symmetry =
    calculateCategoryAverage(
      "symmetry"
    );


  const technique =
    calculateCategoryAverage(
      "technique"
    );


  const elite =
    calculateCategoryAverage(
      "elite"
    );


  updateScoreBar(
    "stabilityScoreText",
    "stabilityScoreBar",
    stability
  );


  updateScoreBar(
    "symmetryScoreText",
    "symmetryScoreBar",
    symmetry
  );


  updateScoreBar(
    "techniqueScoreText",
    "techniqueScoreBar",
    technique
  );


  updateScoreBar(
    "eliteScoreText",
    "eliteScoreBar",
    elite
  );

}


/* =========================================================
   26. RECENT ANALYSIS
========================================================= */

function refreshRecentAnalysis() {

  const container =
    document.getElementById(
      "recentAnalysisList"
    );


  if (!container) {
    return;
  }


  if (
    !Array.isArray(
      AppState.analyses
    ) ||
    AppState.analyses.length === 0
  ) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          ◎
        </div>

        <strong>
          아직 분석 기록이 없습니다
        </strong>

        <p>
          첫 번째 AI 자세분석을 시작해보세요.
        </p>

        <button
          class="primary-btn"
          type="button"
          data-dashboard-pose
        >
          자세분석 시작
        </button>

      </div>

    `;


    const button =
      container.querySelector(
        "[data-dashboard-pose]"
      );


    if (button) {

      button.addEventListener(
        "click",
        () => navigateTo("pose")
      );

    }


    return;

  }


  const recent =
    [...AppState.analyses]
      .sort(
        (a, b) => {

          const dateA =
            new Date(
              a.createdAt ||
              a.date ||
              0
            ).getTime();


          const dateB =
            new Date(
              b.createdAt ||
              b.date ||
              0
            ).getTime();


          return dateB - dateA;

        }
      )
      .slice(0, 4);


  container.innerHTML =
    recent
      .map(
        (analysis) => {

          const athlete =
            findAthleteById(
              analysis.athleteId
            );


          const athleteName =
            athlete?.name ||
            analysis.athleteName ||
            "선수 미지정";


          const sport =
            analysis.sport ||
            analysis.exercise ||
            "자세분석";


          const score =
            clampNumber(
              analysis.score
            );


          const date =
            formatDate(
              analysis.createdAt ||
              analysis.date
            );


          return `

            <div
              class="recent-analysis-item"
            >

              <div
                class="recent-analysis-avatar"
              >
                ${escapeHTML(
                  athleteName
                    .slice(0, 1)
                )}
              </div>


              <div
                class="recent-analysis-main"
              >

                <strong>
                  ${escapeHTML(
                    athleteName
                  )}
                </strong>

                <span>
                  ${escapeHTML(
                    sport
                  )}
                  ·
                  ${escapeHTML(
                    date
                  )}
                </span>

              </div>


              <div
                class="recent-analysis-score"
              >

                <strong>
                  ${
                    score === null
                      ? "--"
                      : Math.round(score)
                  }
                </strong>

                <small>
                  SCORE
                </small>

              </div>

            </div>

          `;

        }
      )
      .join("");

}


/* =========================================================
   27. UNIVERSITY GOAL
========================================================= */

function refreshUniversityGoal() {

  const container =
    document.getElementById(
      "universityGoalEmpty"
    );


  if (!container) {
    return;
  }


  const goal =
    AppState.universityGoal;


  if (
    !goal ||
    !goal.university
  ) {

    container.innerHTML = `

      <div class="university-icon">
        🎓
      </div>

      <strong>
        목표 대학교를 설정하세요
      </strong>

      <p>
        대학 · 학과 · 전형을 선택하면
        실기종목과 기준을 관리할 수 있습니다.
      </p>

      <button
        class="primary-btn"
        type="button"
        data-open-university
      >
        목표 대학 설정
      </button>

    `;


    const button =
      container.querySelector(
        "[data-open-university]"
      );


    if (button) {

      button.addEventListener(
        "click",
        () =>
          navigateTo(
            "pe-entrance"
          )
      );

    }


    return;

  }


  container.innerHTML = `

    <div class="university-icon">
      🎓
    </div>

    <strong>
      ${escapeHTML(
        goal.university
      )}
    </strong>

    <p>
      ${
        goal.department
          ? escapeHTML(
              goal.department
            )
          : "학과 미설정"
      }

      <br>

      ${
        goal.admission
          ? escapeHTML(
              goal.admission
            )
          : "전형 미설정"
      }
    </p>

    <button
      class="secondary-btn"
      type="button"
      data-open-university
    >
      체대입시 분석 열기
    </button>

  `;


  const button =
    container.querySelector(
      "[data-open-university]"
    );


  if (button) {

    button.addEventListener(
      "click",
      () =>
        navigateTo(
          "pe-entrance"
        )
    );

  }

}


/* =========================================================
   28. PERFORMANCE CHART DATA
========================================================= */

function getChartAnalysisData() {

  const select =
    document.getElementById(
      "dashboardChartRange"
    );


  const range =
    Number(
      select?.value || 7
    );


  return [...AppState.analyses]
    .filter(
      (analysis) =>
        clampNumber(
          analysis.score
        ) !== null
    )
    .sort(
      (a, b) => {

        const dateA =
          new Date(
            a.createdAt ||
            a.date ||
            0
          ).getTime();


        const dateB =
          new Date(
            b.createdAt ||
            b.date ||
            0
          ).getTime();


        return dateA - dateB;

      }
    )
    .slice(-range);

}


/* =========================================================
   29. DESTROY CHART
========================================================= */

function destroyPerformanceChart() {

  if (AppState.chart) {

    try {

      AppState.chart.destroy();

    } catch (error) {

      console.warn(
        "[Chart] 기존 그래프 제거 실패",
        error
      );

    }


    AppState.chart = null;

  }

}


/* =========================================================
   30. REFRESH PERFORMANCE CHART
========================================================= */

function refreshPerformanceChart() {

  const canvas =
    document.getElementById(
      "performanceChart"
    );


  const empty =
    document.getElementById(
      "chartEmptyState"
    );


  if (
    !canvas ||
    typeof Chart === "undefined"
  ) {

    return;

  }


  const analyses =
    getChartAnalysisData();


  if (
    analyses.length === 0
  ) {

    destroyPerformanceChart();


    canvas.style.display =
      "none";


    if (empty) {

      empty.style.display =
        "flex";

    }


    return;

  }


  canvas.style.display =
    "block";


  if (empty) {

    empty.style.display =
      "none";

  }


  const labels =
    analyses.map(
      (analysis) =>
        formatDate(
          analysis.createdAt ||
          analysis.date
        )
    );


  const scores =
    analyses.map(
      (analysis) =>
        clampNumber(
          analysis.score
        ) ?? 0
    );


  destroyPerformanceChart();


  const context =
    canvas.getContext("2d");


  AppState.chart =
    new Chart(
      context,
      {

        type: "line",

        data: {

          labels,

          datasets: [

            {

              label:
                "퍼포먼스 점수",

              data:
                scores,

              borderWidth:
                2,

              tension:
                0.35,

              pointRadius:
                3,

              pointHoverRadius:
                5,

              fill:
                false

            }

          ]

        },


        options: {

          responsive:
            true,

          maintainAspectRatio:
            false,

          animation: {
            duration: 350
          },

          plugins: {

            legend: {
              display: false
            },

            tooltip: {

              callbacks: {

                label(context) {

                  return (
                    ` 점수: ${context.parsed.y}`
                  );

                }

              }

            }

          },

          scales: {

            y: {

              beginAtZero:
                true,

              min:
                0,

              max:
                100,

              ticks: {

                color:
                  "#60758a",

                font: {
                  size: 9
                }

              },

              grid: {

                color:
                  "rgba(148,163,184,0.07)"

              }

            },


            x: {

              ticks: {

                color:
                  "#60758a",

                font: {
                  size: 8
                }

              },

              grid: {

                display:
                  false

              }

            }

          }

        }

      }
    );

}


/* =========================================================
   31. CHART RANGE EVENT
========================================================= */

function setupDashboardChartEvents() {

  const select =
    document.getElementById(
      "dashboardChartRange"
    );


  if (!select) {
    return;
  }


  select.addEventListener(
    "change",
    refreshPerformanceChart
  );

}


/* =========================================================
   32. EXTEND DASHBOARD REFRESH
========================================================= */

const originalRefreshDashboard =
  refreshDashboard;


refreshDashboard =
  function () {

    /*
      Part 1의 기본 대시보드 업데이트
    */

    originalRefreshDashboard();


    /*
      세부 점수
    */

    refreshPerformanceScores();


    /*
      최근 분석
    */

    refreshRecentAnalysis();


    /*
      체대입시 목표
    */

    refreshUniversityGoal();


    /*
      그래프
    */

    refreshPerformanceChart();

  };


/* =========================================================
   33. SAVE ATHLETES
========================================================= */

function saveAthletes() {

  return Storage.set(
    APP_CONFIG.storageKeys.athletes,
    AppState.athletes
  );

}


/* =========================================================
   34. SAVE ANALYSES
========================================================= */

function saveAnalyses() {

  return Storage.set(
    APP_CONFIG.storageKeys.analyses,
    AppState.analyses
  );

}


/* =========================================================
   35. SAVE REPORTS
========================================================= */

function saveReports() {

  return Storage.set(
    APP_CONFIG.storageKeys.reports,
    AppState.reports
  );

}


/* =========================================================
   36. SAVE UNIVERSITY GOAL
========================================================= */

function saveUniversityGoal() {

  return Storage.set(
    APP_CONFIG.storageKeys.universityGoal,
    AppState.universityGoal
  );

}


/* =========================================================
   37. UNIQUE ID
========================================================= */

function createId(prefix = "item") {

  if (
    window.crypto &&
    typeof crypto.randomUUID ===
      "function"
  ) {

    return (
      `${prefix}_` +
      crypto.randomUUID()
    );

  }


  return (
    `${prefix}_` +
    Date.now() +
    "_" +
    Math.random()
      .toString(36)
      .slice(2, 9)
  );

}


/* =========================================================
   38. CREATE ANALYSIS OBJECT
========================================================= */

function createAnalysisRecord({

  athleteId = null,

  athleteName = "",

  category = "",

  sport = "",

  exercise = "",

  score = null,

  stability = null,

  symmetry = null,

  technique = null,

  elite = null,

  angles = {},

  feedback = []

} = {}) {

  return {

    id:
      createId(
        "analysis"
      ),

    athleteId,

    athleteName,

    category,

    sport,

    exercise,

    score:
      clampNumber(score),

    stability:
      clampNumber(stability),

    symmetry:
      clampNumber(symmetry),

    technique:
      clampNumber(technique),

    elite:
      clampNumber(elite),

    angles:
      angles &&
      typeof angles === "object"
        ? angles
        : {},

    feedback:
      Array.isArray(feedback)
        ? feedback
        : [],

    createdAt:
      new Date().toISOString()

  };

}


/* =========================================================
   39. ADD ANALYSIS
========================================================= */

function addAnalysis(
  analysisData
) {

  const record =
    createAnalysisRecord(
      analysisData
    );


  AppState.analyses.push(
    record
  );


  saveAnalyses();


  refreshDashboard();


  return record;

}


/* =========================================================
   40. DASHBOARD STYLES FOR DYNAMIC ITEMS
========================================================= */

function injectDynamicDashboardStyles() {

  if (
    document.getElementById(
      "dynamicDashboardStyles"
    )
  ) {

    return;

  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "dynamicDashboardStyles";


  style.textContent = `

    .recent-analysis-item {

      min-height: 58px;

      display: flex;
      align-items: center;

      gap: 11px;

      padding:
        10px
        4px;

      border-bottom:
        1px solid
        rgba(148,163,184,0.07);

    }


    .recent-analysis-item:last-child {

      border-bottom: 0;

    }


    .recent-analysis-avatar {

      width: 36px;
      height: 36px;

      flex: 0 0 36px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 10px;

      background:
        rgba(40,168,255,0.08);

      color:
        #50baff;

      font-size:
        12px;

      font-weight:
        900;

    }


    .recent-analysis-main {

      min-width: 0;

      flex: 1;

      display: flex;
      flex-direction: column;

      gap: 3px;

    }


    .recent-analysis-main strong {

      color:
        #cbd8e5;

      font-size:
        10px;

    }


    .recent-analysis-main span {

      overflow: hidden;

      color:
        #5d748b;

      font-size:
        8px;

      text-overflow:
        ellipsis;

      white-space:
        nowrap;

    }


    .recent-analysis-score {

      min-width: 45px;

      display: flex;
      flex-direction: column;
      align-items: flex-end;

      gap: 1px;

    }


    .recent-analysis-score strong {

      color:
        #5fc1ff;

      font-size:
        17px;

      font-weight:
        900;

    }


    .recent-analysis-score small {

      color:
        #4b6279;

      font-size:
        6px;

      font-weight:
        900;

      letter-spacing:
        0.8px;

    }

  `;


  document.head.appendChild(
    style
  );

}


/* =========================================================
   41. PART 2 INITIALIZATION

   중요:
   Part 1의 DOMContentLoaded와 별개로
   필요한 이벤트만 추가 연결합니다.
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    injectDynamicDashboardStyles();

    setupDashboardChartEvents();


    /*
      Part 1 initializeApp 실행 후
      다시 한번 최신 화면을 반영
    */

    requestAnimationFrame(
      () => {

        refreshDashboard();

      }
    );

  }
);


/* =========================================================
   APP.JS PART 2 END
   PART 3를 바로 아래에 이어 붙입니다.
========================================================= */
/* =========================================================
   설천고 스포츠과학 훈련센터 PRO
   APP.JS
   PART 3 / 3

   STABILITY / VALIDATION / SAFETY
   - DOM Validation
   - Data Validation
   - Chart.js Safety
   - Safari / iPad Support
   - System Diagnostics
========================================================= */


/* =========================================================
   42. REQUIRED DOM CHECK
========================================================= */

const REQUIRED_DOM = [

  "#app",

  ".sidebar",

  ".main-area",

  "#pageContent",

  "#pageTitle",

  "#sidebarToggle",

  "#sidebarOverlay",

  '[data-page-section="dashboard"]',

  '[data-page-section="athletes"]',

  '[data-page-section="weight"]',

  '[data-page-section="summer"]',

  '[data-page-section="winter"]',

  '[data-page-section="pe-entrance"]',

  '[data-page-section="pose"]',

  '[data-page-section="comparison"]',

  '[data-page-section="records"]',

  '[data-page-section="reports"]',

  '[data-page-section="statistics"]',

  '[data-page-section="settings"]'

];


function validateRequiredDOM() {

  const missing = [];


  REQUIRED_DOM.forEach(
    (selector) => {

      if (
        !document.querySelector(
          selector
        )
      ) {

        missing.push(
          selector
        );

      }

    }
  );


  if (
    missing.length > 0
  ) {

    console.warn(
      "[SYSTEM] 누락된 HTML 요소:",
      missing
    );


    return false;

  }


  console.log(
    "[SYSTEM] HTML 구조 정상"
  );


  return true;

}


/* =========================================================
   43. NAVIGATION VALIDATION
========================================================= */

function validateNavigation() {

  const buttons =
    getElements(
      ".nav-item[data-page]"
    );


  let valid = true;


  buttons.forEach(
    (button) => {

      const page =
        button.dataset.page;


      const target =
        document.querySelector(
          `[data-page-section="${page}"]`
        );


      if (!target) {

        valid = false;


        console.warn(
          `[Navigation] 연결되지 않은 메뉴: ${page}`
        );

      }

    }
  );


  if (valid) {

    console.log(
      "[SYSTEM] 메뉴 연결 정상"
    );

  }


  return valid;

}


/* =========================================================
   44. DATA VALIDATION
========================================================= */

function validateStoredData() {

  let changed = false;


  if (
    !Array.isArray(
      AppState.athletes
    )
  ) {

    AppState.athletes = [];

    changed = true;

  }


  if (
    !Array.isArray(
      AppState.analyses
    )
  ) {

    AppState.analyses = [];

    changed = true;

  }


  if (
    !Array.isArray(
      AppState.reports
    )
  ) {

    AppState.reports = [];

    changed = true;

  }


  /*
    깨진 분석 데이터 제거
  */

  AppState.analyses =
    AppState.analyses.filter(
      (analysis) => {

        return (
          analysis &&
          typeof analysis ===
            "object"
        );

      }
    );


  /*
    깨진 선수 데이터 제거
  */

  AppState.athletes =
    AppState.athletes.filter(
      (athlete) => {

        return (
          athlete &&
          typeof athlete ===
            "object"
        );

      }
    );


  if (changed) {

    saveAthletes();

    saveAnalyses();

    saveReports();

  }


  return true;

}


/* =========================================================
   45. CHART.JS CHECK
========================================================= */

function checkChartLibrary() {

  if (
    typeof window.Chart ===
    "undefined"
  ) {

    console.warn(
      "[Chart] Chart.js가 로드되지 않았습니다."
    );


    const empty =
      document.getElementById(
        "chartEmptyState"
      );


    if (empty) {

      empty.textContent =
        "그래프 라이브러리를 불러오지 못했습니다.";

      empty.style.display =
        "flex";

    }


    return false;

  }


  console.log(
    "[SYSTEM] Chart.js 정상"
  );


  return true;

}


/* =========================================================
   46. SAFE PAGE NAVIGATION
========================================================= */

function safeNavigateTo(
  pageName
) {

  if (
    !PAGE_INFO[pageName]
  ) {

    console.warn(
      `[Navigation] 잘못된 페이지 요청: ${pageName}`
    );


    return false;

  }


  const target =
    document.querySelector(
      `[data-page-section="${pageName}"]`
    );


  if (!target) {

    console.warn(
      `[Navigation] 페이지 HTML 없음: ${pageName}`
    );


    return false;

  }


  navigateTo(
    pageName
  );


  return true;

}


/* =========================================================
   47. PREVENT RAPID BUTTON TAPS

   iPad에서 같은 버튼을 빠르게 여러 번 눌러
   이벤트가 겹치는 문제를 줄입니다.
========================================================= */

let lastNavigationTime = 0;


function canNavigateNow() {

  const now =
    Date.now();


  if (
    now -
    lastNavigationTime <
    180
  ) {

    return false;

  }


  lastNavigationTime =
    now;


  return true;

}


/* =========================================================
   48. SAFE DATA EXPORT
========================================================= */

function getAppBackupData() {

  return {

    application: {
      name:
        APP_CONFIG.name,

      version:
        APP_CONFIG.version
    },


    exportedAt:
      new Date()
        .toISOString(),


    athletes:
      AppState.athletes,


    analyses:
      AppState.analyses,


    reports:
      AppState.reports,


    universityGoal:
      AppState.universityGoal,


    settings:
      AppState.settings

  };

}


/* =========================================================
   49. BACKUP JSON
========================================================= */

function downloadBackupJSON() {

  try {

    const backup =
      getAppBackupData();


    const json =
      JSON.stringify(
        backup,
        null,
        2
      );


    const blob =
      new Blob(
        [json],
        {
          type:
            "application/json;charset=utf-8"
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    link.href =
      url;


    link.download =
      `seolcheon-pro-backup-${Date.now()}.json`;


    document.body.appendChild(
      link
    );


    link.click();


    link.remove();


    setTimeout(
      () => {

        URL.revokeObjectURL(
          url
        );

      },
      1000
    );


    return true;

  } catch (error) {

    console.error(
      "[Backup] 백업 생성 실패",
      error
    );


    return false;

  }

}


/* =========================================================
   50. STORAGE TEST
========================================================= */

function testLocalStorage() {

  const testKey =
    "__seolcheon_storage_test__";


  try {

    localStorage.setItem(
      testKey,
      "1"
    );


    const result =
      localStorage.getItem(
        testKey
      );


    localStorage.removeItem(
      testKey
    );


    if (
      result !== "1"
    ) {

      throw new Error(
        "Storage verification failed"
      );

    }


    console.log(
      "[SYSTEM] LocalStorage 정상"
    );


    return true;

  } catch (error) {

    console.warn(
      "[SYSTEM] LocalStorage 사용 불가",
      error
    );


    return false;

  }

}


/* =========================================================
   51. DEVICE DETECTION
========================================================= */

function getDeviceInfo() {

  const userAgent =
    navigator.userAgent || "";


  const platform =
    navigator.platform || "";


  const touchPoints =
    navigator.maxTouchPoints || 0;


  const isIOS =
    /iPhone|iPad|iPod/i.test(
      userAgent
    );


  /*
    최신 iPadOS는 Mac처럼 보이는 경우가 있어서
    터치 포인트도 같이 확인
  */

  const isIPad =
    /iPad/i.test(
      userAgent
    ) ||
    (
      platform === "MacIntel" &&
      touchPoints > 1
    );


  const isSafari =
    /Safari/i.test(
      userAgent
    ) &&
    !/Chrome|CriOS|FxiOS|EdgiOS/i.test(
      userAgent
    );


  return {

    isIOS,

    isIPad,

    isSafari,

    touchPoints,

    width:
      window.innerWidth,

    height:
      window.innerHeight

  };

}


/* =========================================================
   52. DEVICE CLASS
========================================================= */

function applyDeviceClasses() {

  const info =
    getDeviceInfo();


  document.documentElement
    .classList.toggle(
      "device-ipad",
      info.isIPad
    );


  document.documentElement
    .classList.toggle(
      "device-ios",
      info.isIOS
    );


  document.documentElement
    .classList.toggle(
      "browser-safari",
      info.isSafari
    );


  if (info.isIPad) {

    console.log(
      "[SYSTEM] iPad 환경 감지"
    );

  }

}


/* =========================================================
   53. ORIENTATION SUPPORT
========================================================= */

function handleOrientationChange() {

  /*
    iPad Safari에서 회전 직후
    레이아웃 계산이 늦는 경우가 있어
    약간 뒤에 다시 계산
  */

  setTimeout(
    () => {

      if (
        window.innerWidth >
        900
      ) {

        closeSidebar();

      }


      if (
        AppState.currentPage ===
        "dashboard"
      ) {

        if (
          AppState.chart &&
          typeof AppState.chart.resize ===
            "function"
        ) {

          try {

            AppState.chart.resize();

          } catch (error) {

            console.warn(
              "[Chart] resize 실패",
              error
            );

          }

        }

      }

    },
    250
  );

}


/* =========================================================
   54. ORIENTATION EVENT
========================================================= */

function setupOrientationSupport() {

  window.addEventListener(
    "orientationchange",
    handleOrientationChange
  );


  window.addEventListener(
    "resize",
    () => {

      clearTimeout(
        window.__seolcheonResizeTimer
      );


      window.__seolcheonResizeTimer =
        setTimeout(
          handleOrientationChange,
          150
        );

    }
  );

}


/* =========================================================
   55. VISIBILITY EVENT
========================================================= */

function setupVisibilitySupport() {

  document.addEventListener(
    "visibilitychange",
    () => {

      if (
        document.visibilityState ===
        "visible"
      ) {

        /*
          Safari에서 다른 앱 갔다 돌아왔을 때
          대시보드 데이터 재표시
        */

        if (
          AppState.currentPage ===
          "dashboard"
        ) {

          refreshDashboard();

        }

      }

    }
  );

}


/* =========================================================
   56. SYSTEM STATUS
========================================================= */

function setSystemStatus(
  status = "READY"
) {

  const elements = [

    document.querySelector(
      ".sidebar-footer .system-status small"
    ),

    document.querySelector(
      ".top-status-card strong"
    )

  ];


  elements.forEach(
    (element) => {

      if (element) {

        element.textContent =
          status;

      }

    }
  );

}


/* =========================================================
   57. CAMERA STATUS
========================================================= */

function setCameraSystemStatus(
  status = "STANDBY"
) {

  const element =
    document.getElementById(
      "cameraSystemStatus"
    );


  if (element) {

    element.textContent =
      status;

  }

}


/* =========================================================
   58. SYSTEM DIAGNOSTIC
========================================================= */

function runSystemDiagnostic() {

  console.group(
    "설천고 스포츠과학 PRO 진단"
  );


  const dom =
    validateRequiredDOM();


  const navigation =
    validateNavigation();


  const storage =
    testLocalStorage();


  const chart =
    checkChartLibrary();


  console.log(
    "DOM:",
    dom ? "OK" : "ERROR"
  );


  console.log(
    "Navigation:",
    navigation
      ? "OK"
      : "ERROR"
  );


  console.log(
    "Storage:",
    storage
      ? "OK"
      : "WARNING"
  );


  console.log(
    "Chart:",
    chart
      ? "OK"
      : "WARNING"
  );


  console.log(
    "Device:",
    getDeviceInfo()
  );


  console.groupEnd();


  /*
    핵심 HTML 또는 메뉴가 깨졌으면 ERROR
  */

  if (
    !dom ||
    !navigation
  ) {

    setSystemStatus(
      "ERROR"
    );


    return false;

  }


  setSystemStatus(
    "READY"
  );


  return true;

}


/* =========================================================
   59. APP HEALTH OBJECT

   나중에 오류가 생기면 Safari 개발자 콘솔에서

   SeolcheonPRO.diagnostic()

   실행 가능
========================================================= */

window.SeolcheonPRO = {

  version:
    APP_CONFIG.version,


  diagnostic:
    runSystemDiagnostic,


  state:
    AppState,


  navigate:
    safeNavigateTo,


  refresh:
    refreshDashboard,


  backup:
    downloadBackupJSON,


  addAnalysis:
    addAnalysis,


  device:
    getDeviceInfo

};


/* =========================================================
   60. FINAL INITIALIZATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    /*
      저장 데이터 검사
    */

    validateStoredData();


    /*
      기기 정보 적용
    */

    applyDeviceClasses();


    /*
      iPad 회전 대응
    */

    setupOrientationSupport();


    /*
      Safari 복귀 대응
    */

    setupVisibilitySupport();


    /*
      카메라는 아직 연결 전
    */

    setCameraSystemStatus(
      "STANDBY"
    );


    /*
      기존 초기화가 끝난 다음
      시스템 진단 실행
    */

    requestAnimationFrame(
      () => {

        runSystemDiagnostic();


        refreshDashboard();

      }
    );

  }
);


/* =========================================================
   61. UNHANDLED PROMISE ERROR
========================================================= */

window.addEventListener(
  "unhandledrejection",
  (event) => {

    console.error(
      "[SEOLCHEON PRO PROMISE ERROR]",
      event.reason
    );

  }
);


/* =========================================================
   62. FINAL READY LOG
========================================================= */

window.addEventListener(
  "load",
  () => {

    console.log(
      "===================================="
    );

    console.log(
      "설천고 스포츠과학 훈련센터 PRO"
    );

    console.log(
      `VERSION ${APP_CONFIG.version}`
    );

    console.log(
      "BASE SYSTEM READY"
    );

    console.log(
      "===================================="
    );

  }
);


/* =========================================================
   APP.JS END
========================================================= */