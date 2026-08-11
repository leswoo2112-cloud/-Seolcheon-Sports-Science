/* =========================================================
   설천고 스포츠과학 훈련센터 PRO
   APP.JS

   PART 1
   CORE NAVIGATION SYSTEM

   목표
   1. 왼쪽 사이드바 버튼 작동
   2. 대시보드 내부 버튼 작동
   3. 페이지 전환
   4. 상단 제목 변경
   5. 모바일/iPad 사이드바
========================================================= */

"use strict";


/* =========================================================
   01. PAGE INFORMATION
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
   02. APP STATE
========================================================= */

const AppState = {

  currentPage: "dashboard"

};


/* =========================================================
   03. DOM HELPERS
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
   04. PAGE NAVIGATION
========================================================= */

function navigateTo(pageName) {

  console.log(
    "[NAVIGATION]",
    pageName
  );


  /* 페이지 이름 검사 */

  if (!PAGE_INFO[pageName]) {

    console.error(
      `[NAVIGATION ERROR] 없는 페이지: ${pageName}`
    );

    return;

  }


  /* 이동할 페이지 찾기 */

  const targetPage =
    document.querySelector(
      `[data-page-section="${pageName}"]`
    );


  if (!targetPage) {

    console.error(
      `[NAVIGATION ERROR] HTML에서 페이지를 찾을 수 없음: ${pageName}`
    );

    return;

  }


  /* =====================================================
     모든 페이지 숨기기
  ===================================================== */

  getElements(
    "[data-page-section]"
  ).forEach((page) => {

    page.classList.remove(
      "active"
    );

    /*
      CSS 충돌이 있어도 확실히 숨기기
    */

    page.style.display =
      "none";

  });


  /* =====================================================
     선택한 페이지 표시
  ===================================================== */

  targetPage.classList.add(
    "active"
  );

  /*
    CSS 오류가 있더라도
    JS에서 직접 표시
  */

  targetPage.style.display =
    "block";


  /* =====================================================
     왼쪽 메뉴 ACTIVE 변경
  ===================================================== */

  getElements(
    ".nav-item[data-page]"
  ).forEach((button) => {

    const buttonPage =
      button.getAttribute(
        "data-page"
      );


    if (
      buttonPage === pageName
    ) {

      button.classList.add(
        "active"
      );

    } else {

      button.classList.remove(
        "active"
      );

    }

  });


  /* =====================================================
     상단 제목 변경
  ===================================================== */

  const title =
    document.getElementById(
      "pageTitle"
    );


  if (title) {

    title.textContent =
      PAGE_INFO[pageName].title;

  }


  /* =====================================================
     현재 페이지 저장
  ===================================================== */

  AppState.currentPage =
    pageName;


  /* =====================================================
     모바일 사이드바 닫기
  ===================================================== */

  closeSidebar();


  /* =====================================================
     페이지 맨 위
  ===================================================== */

  try {

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  } catch (error) {

    window.scrollTo(
      0,
      0
    );

  }


  console.log(
    `[NAVIGATION SUCCESS] ${pageName}`
  );

}


/* =========================================================
   05. LEFT SIDEBAR NAVIGATION
========================================================= */

function setupSidebarNavigation() {

  const buttons =
    getElements(
      ".nav-item[data-page]"
    );


  console.log(
    `[SYSTEM] 사이드바 버튼 ${buttons.length}개 발견`
  );


  buttons.forEach((button) => {

    button.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        event.stopPropagation();


        const pageName =
          this.getAttribute(
            "data-page"
          );


        console.log(
          "[SIDEBAR CLICK]",
          pageName
        );


        if (!pageName) {

          console.error(
            "[SIDEBAR ERROR] data-page 없음"
          );

          return;

        }


        navigateTo(
          pageName
        );

      }
    );

  });

}


/* =========================================================
   06. DASHBOARD / INTERNAL NAVIGATION

   data-go-page="pose"
   같은 버튼 담당
========================================================= */

function setupInternalNavigation() {

  const buttons =
    getElements(
      "[data-go-page]"
    );


  console.log(
    `[SYSTEM] 내부 이동 버튼 ${buttons.length}개 발견`
  );


  buttons.forEach((button) => {

    button.addEventListener(
      "click",
      function (event) {

        event.preventDefault();


        const pageName =
          this.getAttribute(
            "data-go-page"
          );


        console.log(
          "[INTERNAL CLICK]",
          pageName
        );


        if (!pageName) {
          return;
        }


        navigateTo(
          pageName
        );

      }
    );

  });

}


/* =========================================================
   07. QUICK ANALYSIS BUTTON
========================================================= */

function setupQuickAnalysis() {

  const button =
    document.getElementById(
      "quickAnalysisBtn"
    );


  if (!button) {

    console.warn(
      "[SYSTEM] 빠른 자세분석 버튼 없음"
    );

    return;

  }


  button.addEventListener(
    "click",
    function () {

      navigateTo(
        "pose"
      );

    }
  );

}


/* =========================================================
   08. SIDEBAR OPEN
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


/* =========================================================
   09. SIDEBAR CLOSE
========================================================= */

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


/* =========================================================
   10. SIDEBAR TOGGLE
========================================================= */

function toggleSidebar() {

  if (
    document.body.classList.contains(
      "sidebar-open"
    )
  ) {

    closeSidebar();

  } else {

    openSidebar();

  }

}


/* =========================================================
   11. MOBILE / IPAD SIDEBAR EVENTS
========================================================= */

function setupMobileSidebar() {

  const toggleButton =
    document.getElementById(
      "sidebarToggle"
    );


  const overlay =
    document.getElementById(
      "sidebarOverlay"
    );


  if (toggleButton) {

    toggleButton.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        event.stopPropagation();

        toggleSidebar();

      }
    );

  }


  if (overlay) {

    overlay.addEventListener(
      "click",
      function () {

        closeSidebar();

      }
    );

  }


  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Escape"
      ) {

        closeSidebar();

      }

    }
  );

}


/* =========================================================
   12. NAVIGATION CHECK

   HTML의 버튼과 페이지가
   실제로 연결되어 있는지 검사
========================================================= */

function checkNavigation() {

  console.group(
    "NAVIGATION CHECK"
  );


  const buttons =
    getElements(
      ".nav-item[data-page]"
    );


  buttons.forEach((button) => {

    const pageName =
      button.getAttribute(
        "data-page"
      );


    const page =
      document.querySelector(
        `[data-page-section="${pageName}"]`
      );


    if (page) {

      console.log(
        `✅ ${pageName}`
      );

    } else {

      console.error(
        `❌ ${pageName} 페이지 없음`
      );

    }

  });


  console.groupEnd();

}


/* =========================================================
   13. INITIAL PAGE
========================================================= */

function setupInitialPage() {

  /*
    시작할 때 대시보드 표시
  */

  navigateTo(
    "dashboard"
  );

}


/* =========================================================
   14. APP INITIALIZATION
========================================================= */

function initializeApp() {

  console.log(
    "===================================="
  );

  console.log(
    "설천고 스포츠과학 훈련센터 PRO"
  );

  console.log(
    "APP.JS PART 1"
  );

  console.log(
    "NAVIGATION SYSTEM START"
  );

  console.log(
    "===================================="
  );


  /* 1. 사이드바 */

  setupSidebarNavigation();


  /* 2. 내부 버튼 */

  setupInternalNavigation();


  /* 3. 빠른 자세분석 */

  setupQuickAnalysis();


  /* 4. 모바일 메뉴 */

  setupMobileSidebar();


  /* 5. 연결 검사 */

  checkNavigation();


  /* 6. 첫 페이지 */

  setupInitialPage();


  console.log(
    "[SYSTEM] NAVIGATION READY"
  );

}


/* =========================================================
   15. START
========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeApp
  );

} else {

  initializeApp();

}


/* =========================================================
   16. GLOBAL TEST COMMAND

   콘솔에서

   SeolcheonPRO.go("winter")

   같은 식으로 직접 테스트 가능
========================================================= */

window.SeolcheonPRO = {

  go:
    navigateTo,

  state:
    AppState,

  testNavigation:
    checkNavigation

};


/* =========================================================
   APP.JS PART 1 END
========================================================= */
