/* =========================================================
   SEOLCHEON PERFORMANCE LAB
   records.js

   PART 1 / 2
   Records / Search / Filter / Detail / Comparison
========================================================= */

"use strict";


/* =========================================================
   01. RECORD MANAGER
========================================================= */

const RecordManager = {

  initialized: false,

  selectedRecordId: null,

  compareRecordId: null,

  filters: {
    search: "",
    athlete: "",
    sport: "",
    movement: "",
    viewMode: "",
    grade: "",
    dateFrom: "",
    dateTo: "",
    sort: "latest"
  }
};


/* =========================================================
   02. INITIALIZE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    initializeRecordsModule();
  }
);


document.addEventListener(
  "spl:systemready",
  () => {
    initializeRecordsModule();
  }
);


/* =========================================================
   03. MODULE INITIALIZATION
========================================================= */

function initializeRecordsModule() {

  if (RecordManager.initialized) {

    refreshRecordsModule();

    return;
  }


  initializeRecordSearch();

  initializeRecordFilters();

  initializeRecordSort();

  initializeRecordListActions();

  initializeRecordDetailActions();

  initializeRecordComparison();

  initializeRecordReset();

  refreshRecordsModule();


  RecordManager.initialized = true;


  console.log(
    "[RECORDS] Module initialized."
  );
}


/* =========================================================
   04. DOM HELPERS
========================================================= */

function getRecordListContainer() {

  return (
    document.getElementById(
      "recordList"
    ) ||
    document.getElementById(
      "recordsList"
    )
  );
}


function getRecordDetailContainer() {

  return document.getElementById(
    "recordDetail"
  );
}


function getRecordCompareContainer() {

  return document.getElementById(
    "recordComparison"
  );
}


/* =========================================================
   05. GET POSE RECORDS
========================================================= */

function getPoseRecords() {

  const records =
    SPLApp.getRecords();

  if (
    !Array.isArray(
      records
    )
  ) {
    return [];
  }

  return records.filter(
    (record) =>
      record &&
      (
        record.type === "pose" ||
        record.score !== undefined
      )
  );
}


/* =========================================================
   06. REFRESH MODULE
========================================================= */

function refreshRecordsModule() {

  populateRecordAthleteFilter();

  populateRecordSportFilter();

  populateRecordMovementFilter();

  renderRecordStatistics();

  renderRecordList();

  updateRecordCount();
}


/* =========================================================
   07. SEARCH
========================================================= */

function initializeRecordSearch() {

  const input =
    document.getElementById(
      "recordSearch"
    );

  if (!input) {
    return;
  }


  input.addEventListener(
    "input",
    SPLApp.debounce(
      () => {

        RecordManager.filters.search =
          input.value
            .trim()
            .toLowerCase();

        renderRecordList();

        updateRecordCount();
      },
      150
    )
  );
}


/* =========================================================
   08. FILTERS
========================================================= */

function initializeRecordFilters() {

  const filterMap = {

    recordAthleteFilter:
      "athlete",

    recordSportFilter:
      "sport",

    recordMovementFilter:
      "movement",

    recordViewFilter:
      "viewMode",

    recordGradeFilter:
      "grade",

    recordDateFrom:
      "dateFrom",

    recordDateTo:
      "dateTo"
  };


  Object.entries(
    filterMap
  ).forEach(
    ([id, key]) => {

      const element =
        document.getElementById(
          id
        );

      if (!element) {
        return;
      }

      element.addEventListener(
        "change",
        () => {

          RecordManager.filters[
            key
          ] =
            element.value || "";

          renderRecordList();

          updateRecordCount();
        }
      );
    }
  );
}


/* =========================================================
   09. SORT
========================================================= */

function initializeRecordSort() {

  const selector =
    document.getElementById(
      "recordSort"
    );

  if (!selector) {
    return;
  }


  RecordManager.filters.sort =
    selector.value ||
    "latest";


  selector.addEventListener(
    "change",
    () => {

      RecordManager.filters.sort =
        selector.value ||
        "latest";

      renderRecordList();
    }
  );
}


/* =========================================================
   10. ATHLETE FILTER OPTIONS
========================================================= */

function populateRecordAthleteFilter() {

  const selector =
    document.getElementById(
      "recordAthleteFilter"
    );

  if (!selector) {
    return;
  }


  const current =
    selector.value;


  const athletes =
    SPLApp.getAthletes()
      .slice()
      .sort(
        (a, b) =>
          String(
            a.name || ""
          ).localeCompare(
            String(
              b.name || ""
            ),
            "ko"
          )
      );


  selector.innerHTML = `
    <option value="">
      전체 선수
    </option>

    ${athletes
      .map(
        (athlete) => `
          <option
            value="${SPLApp.escapeHTML(
              athlete.id
            )}"
          >
            ${SPLApp.escapeHTML(
              athlete.name ||
              "이름 없음"
            )}
          </option>
        `
      )
      .join("")}
  `;


  if (
    athletes.some(
      (athlete) =>
        athlete.id === current
    )
  ) {

    selector.value =
      current;
  }
}


/* =========================================================
   11. SPORT FILTER OPTIONS
========================================================= */

function populateRecordSportFilter() {

  const selector =
    document.getElementById(
      "recordSportFilter"
    );

  if (!selector) {
    return;
  }


  const current =
    selector.value;


  const sports =
    [
      ...new Set(
        getPoseRecords()
          .map(
            (record) =>
              record.sportLabel ||
              record.sport
          )
          .filter(Boolean)
      )
    ].sort(
      (a, b) =>
        String(a).localeCompare(
          String(b),
          "ko"
        )
    );


  selector.innerHTML = `
    <option value="">
      전체 종목
    </option>

    ${sports
      .map(
        (sport) => `
          <option
            value="${SPLApp.escapeHTML(
              sport
            )}"
          >
            ${SPLApp.escapeHTML(
              sport
            )}
          </option>
        `
      )
      .join("")}
  `;


  if (
    sports.includes(
      current
    )
  ) {

    selector.value =
      current;
  }
}


/* =========================================================
   12. MOVEMENT FILTER OPTIONS
========================================================= */

function populateRecordMovementFilter() {

  const selector =
    document.getElementById(
      "recordMovementFilter"
    );

  if (!selector) {
    return;
  }


  const current =
    selector.value;


  const movements =
    [
      ...new Set(
        getPoseRecords()
          .map(
            (record) =>
              record.movementLabel ||
              record.movement
          )
          .filter(Boolean)
      )
    ].sort(
      (a, b) =>
        String(a).localeCompare(
          String(b),
          "ko"
        )
    );


  selector.innerHTML = `
    <option value="">
      전체 동작
    </option>

    ${movements
      .map(
        (movement) => `
          <option
            value="${SPLApp.escapeHTML(
              movement
            )}"
          >
            ${SPLApp.escapeHTML(
              movement
            )}
          </option>
        `
      )
      .join("")}
  `;


  if (
    movements.includes(
      current
    )
  ) {

    selector.value =
      current;
  }
}


/* =========================================================
   13. GET FILTERED RECORDS
========================================================= */

function getFilteredRecords() {

  const filters =
    RecordManager.filters;


  let records =
    getPoseRecords()
      .filter(
        (record) => {

          if (
            filters.search
          ) {

            const searchable =
              [
                record.athleteName,
                record.sportLabel,
                record.sport,
                record.movementLabel,
                record.movement,
                record.grade,
                record.summary
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            if (
              !searchable.includes(
                filters.search
              )
            ) {

              return false;
            }
          }


          if (
            filters.athlete &&
            record.athleteId !==
              filters.athlete
          ) {

            return false;
          }


          if (
            filters.sport
          ) {

            const sport =
              record.sportLabel ||
              record.sport ||
              "";


            if (
              sport !==
              filters.sport
            ) {

              return false;
            }
          }


          if (
            filters.movement
          ) {

            const movement =
              record.movementLabel ||
              record.movement ||
              "";


            if (
              movement !==
              filters.movement
            ) {

              return false;
            }
          }


          if (
            filters.viewMode &&
            record.viewMode !==
              filters.viewMode
          ) {

            return false;
          }


          if (
            filters.grade &&
            record.grade !==
              filters.grade
          ) {

            return false;
          }


          if (
            filters.dateFrom ||
            filters.dateTo
          ) {

            const timestamp =
              new Date(
                record.createdAt || 0
              ).getTime();


            if (
              filters.dateFrom
            ) {

              const start =
                new Date(
                  `${filters.dateFrom}T00:00:00`
                ).getTime();


              if (
                timestamp < start
              ) {

                return false;
              }
            }


            if (
              filters.dateTo
            ) {

              const end =
                new Date(
                  `${filters.dateTo}T23:59:59`
                ).getTime();


              if (
                timestamp > end
              ) {

                return false;
              }
            }
          }


          return true;
        }
      );


  records =
    sortRecords(
      records,
      filters.sort
    );


  return records;
}


/* =========================================================
   14. SORT RECORDS
========================================================= */

function sortRecords(
  records,
  method
) {

  const list =
    [...records];


  switch (method) {

    case "oldest":

      return list.sort(
        (a, b) =>
          getRecordTimestamp(a) -
          getRecordTimestamp(b)
      );


    case "score-high":

      return list.sort(
        (a, b) =>
          SPLApp.safeNumber(
            b.score
          ) -
          SPLApp.safeNumber(
            a.score
          )
      );


    case "score-low":

      return list.sort(
        (a, b) =>
          SPLApp.safeNumber(
            a.score
          ) -
          SPLApp.safeNumber(
            b.score
          )
      );


    case "athlete":

      return list.sort(
        (a, b) =>
          String(
            a.athleteName || ""
          ).localeCompare(
            String(
              b.athleteName || ""
            ),
            "ko"
          )
      );


    case "latest":
    default:

      return list.sort(
        (a, b) =>
          getRecordTimestamp(b) -
          getRecordTimestamp(a)
      );
  }
}


/* =========================================================
   15. RECORD TIMESTAMP
========================================================= */

function getRecordTimestamp(
  record
) {

  const timestamp =
    new Date(
      record?.createdAt || 0
    ).getTime();

  return Number.isFinite(
    timestamp
  )
    ? timestamp
    : 0;
}


/* =========================================================
   16. RENDER RECORD LIST
========================================================= */

function renderRecordList() {

  const container =
    getRecordListContainer();

  if (!container) {
    return;
  }


  const records =
    getFilteredRecords();


  if (!records.length) {

    container.innerHTML = `
      <div class="records-empty-state">

        <div class="records-empty-icon">
          <i class="fa-solid fa-chart-line"></i>
        </div>

        <strong>
          분석 기록이 없습니다.
        </strong>

        <span>
          자세분석 결과를 저장하면 이곳에서 확인할 수 있습니다.
        </span>

      </div>
    `;

    return;
  }


  container.innerHTML =
    records
      .map(
        createRecordCardHTML
      )
      .join("");
}


/* =========================================================
   17. RECORD CARD
========================================================= */

function createRecordCardHTML(
  record
) {

  const score =
    Math.round(
      SPLApp.safeNumber(
        record.score
      )
    );


  const athlete =
    record.athleteName ||
    "미지정 선수";


  const sport =
    record.sportLabel ||
    record.sport ||
    "기본 자세";


  const movement =
    record.movementLabel ||
    record.movement ||
    "-";


  const view =
    record.viewMode ===
      "side"
      ? "측면"
      : "정면";


  const grade =
    record.grade ||
    getRecordGrade(
      score
    );


  return `
    <article
      class="record-card"
      data-record-id="${SPLApp.escapeHTML(
        record.id
      )}"
      tabindex="0"
    >

      <div class="record-card-top">

        <div class="record-athlete">

          <div class="record-avatar">
            ${SPLApp.escapeHTML(
              getInitial(
                athlete
              )
            )}
          </div>

          <div>

            <strong>
              ${SPLApp.escapeHTML(
                athlete
              )}
            </strong>

            <span>
              ${SPLApp.escapeHTML(
                sport
              )}
              ·
              ${SPLApp.escapeHTML(
                movement
              )}
            </span>

          </div>

        </div>


        <div
          class="record-grade"
          data-grade="${SPLApp.escapeHTML(
            grade
          )}"
        >
          ${SPLApp.escapeHTML(
            grade
          )}
        </div>

      </div>


      <div class="record-score-row">

        <div class="record-main-score">

          <strong>
            ${score}
          </strong>

          <span>
            SCORE
          </span>

        </div>


        <div class="record-mini-metrics">

          ${createRecordMetricHTML(
            "안정성",
            record.stability
          )}

          ${createRecordMetricHTML(
            "균형",
            record.balance
          )}

          ${createRecordMetricHTML(
            "효율",
            record.efficiency
          )}

        </div>

      </div>


      <div class="record-meta">

        <span>
          <i class="fa-solid fa-camera"></i>
          ${view}
        </span>

        <span>
          <i class="fa-regular fa-clock"></i>
          ${SPLApp.escapeHTML(
            formatRecordDate(
              record.createdAt
            )
          )}
        </span>

      </div>


      <div class="record-card-actions">

        <button
          type="button"
          class="record-action-btn"
          data-record-action="detail"
          data-record-id="${SPLApp.escapeHTML(
            record.id
          )}"
        >
          <i class="fa-solid fa-chart-simple"></i>
          상세
        </button>


        <button
          type="button"
          class="record-action-btn"
          data-record-action="compare"
          data-record-id="${SPLApp.escapeHTML(
            record.id
          )}"
        >
          <i class="fa-solid fa-code-compare"></i>
          비교
        </button>


        <button
          type="button"
          class="record-action-btn primary"
          data-record-action="report"
          data-record-id="${SPLApp.escapeHTML(
            record.id
          )}"
        >
          <i class="fa-solid fa-file-lines"></i>
          리포트
        </button>

      </div>

    </article>
  `;
}


/* =========================================================
   18. METRIC HTML
========================================================= */

function createRecordMetricHTML(
  label,
  value
) {

  const number =
    Math.round(
      SPLApp.safeNumber(
        value
      )
    );

  return `
    <div class="record-mini-metric">

      <span>
        ${SPLApp.escapeHTML(
          label
        )}
      </span>

      <strong>
        ${number}
      </strong>

    </div>
  `;
}


/* =========================================================
   19. INITIAL
========================================================= */

function getInitial(
  name
) {

  const text =
    String(
      name || ""
    ).trim();

  if (!text) {
    return "?";
  }

  return text.charAt(0);
}


/* =========================================================
   20. FORMAT DATE
========================================================= */

function formatRecordDate(
  value
) {

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
   21. RECORD GRADE
========================================================= */

function getRecordGrade(
  score
) {

  const value =
    SPLApp.safeNumber(
      score
    );


  if (value >= 90) {
    return "S";
  }

  if (value >= 85) {
    return "A+";
  }

  if (value >= 80) {
    return "A";
  }

  if (value >= 75) {
    return "B+";
  }

  if (value >= 70) {
    return "B";
  }

  if (value >= 60) {
    return "C";
  }

  return "D";
}


/* =========================================================
   22. LIST ACTIONS
========================================================= */

function initializeRecordListActions() {

  const container =
    getRecordListContainer();

  if (!container) {
    return;
  }


  container.addEventListener(
    "click",
    handleRecordListClick
  );


  container.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key !== "Enter" &&
        event.key !== " "
      ) {

        return;
      }


      if (
        event.target.closest(
          "button"
        )
      ) {

        return;
      }


      const card =
        event.target.closest(
          ".record-card"
        );


      if (!card) {
        return;
      }


      event.preventDefault();


      const recordId =
        card.dataset.recordId;


      if (recordId) {

        showRecordDetail(
          recordId
        );
      }
    }
  );
}


/* =========================================================
   23. HANDLE LIST CLICK
========================================================= */

function handleRecordListClick(
  event
) {

  const button =
    event.target.closest(
      "[data-record-action]"
    );


  if (!button) {

    const card =
      event.target.closest(
        ".record-card"
      );


    if (
      card &&
      !event.target.closest(
        "button"
      )
    ) {

      showRecordDetail(
        card.dataset.recordId
      );
    }


    return;
  }


  const action =
    button.dataset
      .recordAction;


  const recordId =
    button.dataset
      .recordId;


  if (!recordId) {
    return;
  }


  switch (action) {

    case "detail":

      showRecordDetail(
        recordId
      );

      break;


    case "compare":

      startRecordComparison(
        recordId
      );

      break;


    case "report":

      openRecordReport(
        recordId
      );

      break;
  }
}


/* =========================================================
   24. GET RECORD
========================================================= */

function getRecordById(
  recordId
) {

  return (
    getPoseRecords()
      .find(
        (record) =>
          record.id ===
          recordId
      ) ||
    null
  );
}


/* =========================================================
   25. SHOW DETAIL
========================================================= */

function showRecordDetail(
  recordId
) {

  const record =
    getRecordById(
      recordId
    );


  if (!record) {

    SPLApp.showToast(
      "분석 기록을 찾을 수 없습니다.",
      "error"
    );

    return null;
  }


  RecordManager.selectedRecordId =
    recordId;


  renderRecordDetail(
    record
  );


  document.dispatchEvent(
    new CustomEvent(
      "spl:recorddetail",
      {
        detail: record
      }
    )
  );


  return record;
}


/* =========================================================
   26. RENDER DETAIL
========================================================= */

function renderRecordDetail(
  record
) {

  const container =
    getRecordDetailContainer();


  if (!container) {
    return;
  }


  const score =
    Math.round(
      SPLApp.safeNumber(
        record.score
      )
    );


  const grade =
    record.grade ||
    getRecordGrade(
      score
    );


  const opinion =
    record.opinion?.overall ||
    record.summary ||
    "저장된 분석 의견이 없습니다.";


  const issues =
    Array.isArray(
      record.issues
    )
      ? record.issues
      : [];


  container.innerHTML = `

    <div class="record-detail-header">

      <div>

        <span class="record-detail-kicker">
          ANALYSIS RECORD
        </span>

        <h3>
          ${SPLApp.escapeHTML(
            record.athleteName ||
            "미지정 선수"
          )}
        </h3>

        <p>
          ${SPLApp.escapeHTML(
            record.sportLabel ||
            record.sport ||
            "기본 자세"
          )}
          ·
          ${SPLApp.escapeHTML(
            record.movementLabel ||
            record.movement ||
            "-"
          )}
        </p>

      </div>


      <button
        type="button"
        class="record-detail-close"
        data-record-detail-action="close"
        aria-label="닫기"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>

    </div>


    <div class="record-detail-score">

      <div
        class="record-detail-score-main"
        data-grade="${SPLApp.escapeHTML(
          grade
        )}"
      >

        <strong>
          ${score}
        </strong>

        <span>
          ${SPLApp.escapeHTML(
            grade
          )}
        </span>

      </div>


      <div class="record-detail-score-grid">

        ${createDetailMetric(
          "정렬",
          record.alignment
        )}

        ${createDetailMetric(
          "안정성",
          record.stability
        )}

        ${createDetailMetric(
          "균형",
          record.balance
        )}

        ${createDetailMetric(
          "효율",
          record.efficiency
        )}

      </div>

    </div>


    <div class="record-detail-info">

      <div>
        <span>
          촬영 방향
        </span>

        <strong>
          ${
            record.viewMode ===
            "side"
              ? "측면"
              : "정면"
          }
        </strong>
      </div>


      <div>
        <span>
          인식 정확도
        </span>

        <strong>
          ${Math.round(
            SPLApp.safeNumber(
              record.confidence
            )
          )}%
        </strong>
      </div>


      <div>
        <span>
          분석 시간
        </span>

        <strong>
          ${SPLApp.escapeHTML(
            formatDuration(
              record.duration
            )
          )}
        </strong>
      </div>


      <div>
        <span>
          분석 일시
        </span>

        <strong>
          ${SPLApp.escapeHTML(
            formatRecordDate(
              record.createdAt
            )
          )}
        </strong>
      </div>

    </div>


    ${
      record.snapshot
        ? `
          <div class="record-snapshot">

            <img
              src="${SPLApp.escapeHTML(
                record.snapshot
              )}"
              alt="자세분석 저장 이미지"
            >

          </div>
        `
        : ""
    }


    <div class="record-detail-section">

      <div class="record-detail-title">

        <i class="fa-solid fa-brain"></i>

        자동 분석 의견

      </div>

      <p class="record-opinion">
        ${SPLApp.escapeHTML(
          opinion
        )}
      </p>

    </div>


    <div class="record-detail-section">

      <div class="record-detail-title">

        <i class="fa-solid fa-triangle-exclamation"></i>

        주요 체크 항목

      </div>

      <div class="record-detail-issues">

        ${
          issues.length
            ? issues
                .slice(0, 6)
                .map(
                  (issue) => `
                    <div
                      class="record-detail-issue ${SPLApp.escapeHTML(
                        issue.level ||
                        "warning"
                      )}"
                    >

                      <span>
                        ${SPLApp.escapeHTML(
                          issue.title ||
                          "확인 필요"
                        )}
                      </span>

                      <strong>
                        ${SPLApp.escapeHTML(
                          issue.value ??
                          "-"
                        )}${SPLApp.escapeHTML(
                          issue.unit ||
                          ""
                        )}
                      </strong>

                    </div>
                  `
                )
                .join("")
            : `
              <div class="record-no-issues">
                큰 자세 이상이 기록되지 않았습니다.
              </div>
            `
        }

      </div>

    </div>


    ${createAngleSection(
      record
    )}


    <div class="record-detail-actions">

      <button
        type="button"
        data-record-detail-action="compare"
        data-record-id="${SPLApp.escapeHTML(
          record.id
        )}"
      >
        <i class="fa-solid fa-code-compare"></i>
        이전 기록 비교
      </button>


      <button
        type="button"
        class="primary"
        data-record-detail-action="report"
        data-record-id="${SPLApp.escapeHTML(
          record.id
        )}"
      >
        <i class="fa-solid fa-file-lines"></i>
        리포트 열기
      </button>

    </div>
  `;


  container.classList.add(
    "show"
  );
}


/* =========================================================
   27. DETAIL METRIC
========================================================= */

function createDetailMetric(
  label,
  value
) {

  const number =
    Math.round(
      SPLApp.safeNumber(
        value
      )
    );


  return `
    <div class="record-detail-metric">

      <span>
        ${SPLApp.escapeHTML(
          label
        )}
      </span>

      <strong>
        ${number}
      </strong>

    </div>
  `;
}


/* =========================================================
   28. ANGLE SECTION
========================================================= */

function createAngleSection(
  record
) {

  const angles =
    record.angles;


  if (
    !angles ||
    typeof angles !==
      "object"
  ) {

    return "";
  }


  const angleItems = [

    [
      "왼쪽 팔꿈치",
      angles.leftElbow
    ],

    [
      "오른쪽 팔꿈치",
      angles.rightElbow
    ],

    [
      "왼쪽 무릎",
      angles.leftKnee
    ],

    [
      "오른쪽 무릎",
      angles.rightKnee
    ],

    [
      "어깨 기울기",
      angles.shoulderTilt
    ],

    [
      "골반 기울기",
      angles.hipTilt
    ],

    [
      "몸통 기울기",
      angles.trunkLean
    ]
  ];


  return `
    <div class="record-detail-section">

      <div class="record-detail-title">

        <i class="fa-solid fa-ruler-combined"></i>

        주요 관절각

      </div>

      <div class="record-angle-grid">

        ${angleItems
          .map(
            ([label, value]) => `
              <div class="record-angle-item">

                <span>
                  ${SPLApp.escapeHTML(
                    label
                  )}
                </span>

                <strong>
                  ${SPLApp.roundNumber(
                    SPLApp.safeNumber(
                      value
                    ),
                    1
                  )}°
                </strong>

              </div>
            `
          )
          .join("")}

      </div>

    </div>
  `;
}


/* =========================================================
   29. FORMAT DURATION
========================================================= */

function formatDuration(
  seconds
) {

  const value =
    Math.max(
      0,
      Math.round(
        SPLApp.safeNumber(
          seconds
        )
      )
    );


  if (
    value < 60
  ) {

    return `${value}초`;
  }


  const minutes =
    Math.floor(
      value / 60
    );


  const remaining =
    value % 60;


  return (
    `${minutes}분 ` +
    `${remaining}초`
  );
}


/* =========================================================
   30. DETAIL ACTIONS
========================================================= */

function initializeRecordDetailActions() {

  const container =
    getRecordDetailContainer();


  if (!container) {
    return;
  }


  container.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          "[data-record-detail-action]"
        );


      if (!button) {
        return;
      }


      const action =
        button.dataset
          .recordDetailAction;


      const recordId =
        button.dataset
          .recordId ||
        RecordManager
          .selectedRecordId;


      switch (action) {

        case "close":

          closeRecordDetail();

          break;


        case "compare":

          if (recordId) {

            startRecordComparison(
              recordId
            );
          }

          break;


        case "report":

          if (recordId) {

            openRecordReport(
              recordId
            );
          }

          break;
      }
    }
  );
}


/* =========================================================
   31. CLOSE DETAIL
========================================================= */

function closeRecordDetail() {

  const container =
    getRecordDetailContainer();


  if (!container) {
    return;
  }


  container.classList.remove(
    "show"
  );


  RecordManager.selectedRecordId =
    null;
}


/* =========================================================
   32. OPEN REPORT
========================================================= */

function openRecordReport(
  recordId
) {

  const record =
    getRecordById(
      recordId
    );


  if (!record) {

    SPLApp.showToast(
      "리포트 기록을 찾을 수 없습니다.",
      "error"
    );

    return;
  }


  sessionStorage.setItem(
    "spl_report_record",
    recordId
  );


  if (
    record.athleteId
  ) {

    sessionStorage.setItem(
      "spl_report_athlete",
      record.athleteId
    );
  }


  SPLApp.openPage(
    "report"
  );


  document.dispatchEvent(
    new CustomEvent(
      "spl:reportrecord",
      {
        detail: {
          recordId,
          athleteId:
            record.athleteId ||
            ""
        }
      }
    )
  );
}


/* =========================================================
   33. START COMPARISON
========================================================= */

function startRecordComparison(
  recordId
) {

  const current =
    getRecordById(
      recordId
    );


  if (!current) {

    SPLApp.showToast(
      "비교할 기록을 찾을 수 없습니다.",
      "error"
    );

    return;
  }


  const previous =
    findPreviousRecord(
      current
    );


  if (!previous) {

    SPLApp.showToast(
      "비교할 이전 분석 기록이 없습니다.",
      "warning"
    );

    return;
  }


  RecordManager.selectedRecordId =
    current.id;


  RecordManager.compareRecordId =
    previous.id;


  renderRecordComparison(
    current,
    previous
  );
}


/* =========================================================
   34. FIND PREVIOUS RECORD
========================================================= */

function findPreviousRecord(
  current
) {

  const currentTime =
    getRecordTimestamp(
      current
    );


  const sameAthlete =
    getPoseRecords()
      .filter(
        (record) => {

          if (
            record.id ===
            current.id
          ) {
            return false;
          }


          if (
            current.athleteId
          ) {

            if (
              record.athleteId !==
              current.athleteId
            ) {

              return false;
            }

          } else if (
            record.athleteName !==
            current.athleteName
          ) {

            return false;
          }


          return (
            getRecordTimestamp(
              record
            ) <
            currentTime
          );
        }
      )
      .sort(
        (a, b) =>
          getRecordTimestamp(b) -
          getRecordTimestamp(a)
      );


  /*
    같은 종목 + 같은 동작 기록을 우선한다.
  */

  const sameMovement =
    sameAthlete.find(
      (record) => {

        const currentSport =
          current.sport ||
          current.sportLabel;

        const recordSport =
          record.sport ||
          record.sportLabel;

        const currentMovement =
          current.movement ||
          current.movementLabel;

        const recordMovement =
          record.movement ||
          record.movementLabel;


        return (
          currentSport ===
            recordSport &&
          currentMovement ===
            recordMovement &&
          current.viewMode ===
            record.viewMode
        );
      }
    );


  return (
    sameMovement ||
    sameAthlete[0] ||
    null
  );
}


/* =========================================================
   35. INITIALIZE COMPARISON
========================================================= */

function initializeRecordComparison() {

  const container =
    getRecordCompareContainer();


  if (!container) {
    return;
  }


  container.addEventListener(
    "click",
    (event) => {

      const closeButton =
        event.target.closest(
          "[data-comparison-close]"
        );


      if (closeButton) {

        closeRecordComparison();
      }
    }
  );
}


/* =========================================================
   36. RENDER COMPARISON
========================================================= */

function renderRecordComparison(
  current,
  previous
) {

  const container =
    getRecordCompareContainer();


  if (!container) {
    return;
  }


  const currentScore =
    SPLApp.safeNumber(
      current.score
    );


  const previousScore =
    SPLApp.safeNumber(
      previous.score
    );


  const scoreChange =
    currentScore -
    previousScore;


  container.innerHTML = `

    <div class="record-comparison-header">

      <div>

        <span>
          PERFORMANCE COMPARISON
        </span>

        <h3>
          이전 분석 비교
        </h3>

      </div>


      <button
        type="button"
        data-comparison-close
        aria-label="닫기"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>

    </div>


    <div class="comparison-athlete">

      <strong>
        ${SPLApp.escapeHTML(
          current.athleteName ||
          "미지정 선수"
        )}
      </strong>

      <span>
        ${SPLApp.escapeHTML(
          current.sportLabel ||
          current.sport ||
          "-"
        )}
        ·
        ${SPLApp.escapeHTML(
          current.movementLabel ||
          current.movement ||
          "-"
        )}
      </span>

    </div>


    <div class="comparison-score">

      <div>

        <span>
          이전
        </span>

        <strong>
          ${Math.round(
            previousScore
          )}
        </strong>

        <small>
          ${SPLApp.escapeHTML(
            formatRecordDate(
              previous.createdAt
            )
          )}
        </small>

      </div>


      <div class="comparison-change">

        <i class="fa-solid ${
          scoreChange > 0
            ? "fa-arrow-trend-up"
            : scoreChange < 0
              ? "fa-arrow-trend-down"
              : "fa-minus"
        }"></i>

        <strong>
          ${
            scoreChange > 0
              ? "+"
              : ""
          }${SPLApp.roundNumber(
            scoreChange,
            1
          )}
        </strong>

      </div>


      <div>

        <span>
          현재
        </span>

        <strong>
          ${Math.round(
            currentScore
          )}
        </strong>

        <small>
          ${SPLApp.escapeHTML(
            formatRecordDate(
              current.createdAt
            )
          )}
        </small>

      </div>

    </div>


    <div class="comparison-grid">

      ${createComparisonMetric(
        "정렬",
        previous.alignment,
        current.alignment
      )}

      ${createComparisonMetric(
        "안정성",
        previous.stability,
        current.stability
      )}

      ${createComparisonMetric(
        "균형",
        previous.balance,
        current.balance
      )}

      ${createComparisonMetric(
        "효율",
        previous.efficiency,
        current.efficiency
      )}

    </div>


    <div class="comparison-summary">

      <i class="fa-solid fa-chart-line"></i>

      <p>
        ${SPLApp.escapeHTML(
          createComparisonSummary(
            current,
            previous
          )
        )}
      </p>

    </div>
  `;


  container.classList.add(
    "show"
  );
}


/* =========================================================
   37. COMPARISON METRIC
========================================================= */

function createComparisonMetric(
  label,
  previous,
  current
) {

  const before =
    SPLApp.safeNumber(
      previous
    );


  const after =
    SPLApp.safeNumber(
      current
    );


  const difference =
    after -
    before;


  return `
    <div class="comparison-metric">

      <span>
        ${SPLApp.escapeHTML(
          label
        )}
      </span>

      <div>

        <small>
          ${Math.round(
            before
          )}
        </small>

        <i class="fa-solid fa-arrow-right"></i>

        <strong>
          ${Math.round(
            after
          )}
        </strong>

      </div>

      <em class="${
        difference > 0
          ? "positive"
          : difference < 0
            ? "negative"
            : "neutral"
      }">

        ${
          difference > 0
            ? "+"
            : ""
        }${SPLApp.roundNumber(
          difference,
          1
        )}

      </em>

    </div>
  `;
}


/* =========================================================
   38. COMPARISON SUMMARY
========================================================= */

function createComparisonSummary(
  current,
  previous
) {

  const metrics = [

    [
      "정렬",
      SPLApp.safeNumber(
        current.alignment
      ) -
      SPLApp.safeNumber(
        previous.alignment
      )
    ],

    [
      "안정성",
      SPLApp.safeNumber(
        current.stability
      ) -
      SPLApp.safeNumber(
        previous.stability
      )
    ],

    [
      "균형",
      SPLApp.safeNumber(
        current.balance
      ) -
      SPLApp.safeNumber(
        previous.balance
      )
    ],

    [
      "효율",
      SPLApp.safeNumber(
        current.efficiency
      ) -
      SPLApp.safeNumber(
        previous.efficiency
      )
    ]
  ];


  const improved =
    metrics
      .filter(
        ([, value]) =>
          value >= 3
      )
      .sort(
        (a, b) =>
          b[1] - a[1]
      );


  const declined =
    metrics
      .filter(
        ([, value]) =>
          value <= -3
      )
      .sort(
        (a, b) =>
          a[1] - b[1]
      );


  const scoreChange =
    SPLApp.safeNumber(
      current.score
    ) -
    SPLApp.safeNumber(
      previous.score
    );


  let summary;


  if (
    scoreChange >= 5
  ) {

    summary =
      `이전 분석보다 종합점수가 ${SPLApp.roundNumber(
        scoreChange,
        1
      )}점 향상되었습니다.`;

  } else if (
    scoreChange <= -5
  ) {

    summary =
      `이전 분석보다 종합점수가 ${Math.abs(
        SPLApp.roundNumber(
          scoreChange,
          1
        )
      )}점 낮아졌습니다.`;

  } else {

    summary =
      "이전 분석과 종합점수가 비슷한 수준입니다.";
  }


  if (
    improved.length
  ) {

    summary +=
      ` 가장 크게 향상된 항목은 ${improved[0][0]}입니다.`;
  }


  if (
    declined.length
  ) {

    summary +=
      ` ${declined[0][0]} 항목은 추가 확인이 필요합니다.`;
  }


  return summary;
}


/* =========================================================
   39. CLOSE COMPARISON
========================================================= */

function closeRecordComparison() {

  const container =
    getRecordCompareContainer();


  container?.classList.remove(
    "show"
  );


  RecordManager.compareRecordId =
    null;
}


/* =========================================================
   40. RECORD STATISTICS
========================================================= */

function calculateRecordStatistics() {

  const records =
    getPoseRecords();


  if (!records.length) {

    return {
      count: 0,
      average: 0,
      best: 0,
      athletes: 0
    };
  }


  const scores =
    records
      .map(
        (record) =>
          SPLApp.safeNumber(
            record.score
          )
      )
      .filter(
        Number.isFinite
      );


  const athletes =
    new Set(
      records
        .map(
          (record) =>
            record.athleteId ||
            record.athleteName
        )
        .filter(Boolean)
    );


  return {

    count:
      records.length,

    average:
      Math.round(
        SPLApp.average(
          scores
        )
      ),

    best:
      Math.round(
        Math.max(
          ...scores
        )
      ),

    athletes:
      athletes.size
  };
}


/* =========================================================
   41. RENDER STATISTICS
========================================================= */

function renderRecordStatistics() {

  const stats =
    calculateRecordStatistics();


  const mapping = {

    recordTotalCount:
      stats.count,

    recordAverageScore:
      stats.average,

    recordBestScore:
      stats.best,

    recordAthleteCount:
      stats.athletes
  };


  Object.entries(
    mapping
  ).forEach(
    ([id, value]) => {

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
   42. UPDATE COUNT
========================================================= */

function updateRecordCount() {

  const element =
    document.getElementById(
      "recordResultCount"
    );


  if (!element) {
    return;
  }


  const filtered =
    getFilteredRecords()
      .length;


  const total =
    getPoseRecords()
      .length;


  element.textContent =
    `${filtered} / ${total}`;
}


/* =========================================================
   43. RESET FILTERS
========================================================= */

function initializeRecordReset() {

  const button =
    document.getElementById(
      "resetRecordFilters"
    );


  button?.addEventListener(
    "click",
    () => {

      resetRecordFilters();
    }
  );
}


/* =========================================================
   44. RESET FILTERS
========================================================= */

function resetRecordFilters() {

  RecordManager.filters = {
    search: "",
    athlete: "",
    sport: "",
    movement: "",
    viewMode: "",
    grade: "",
    dateFrom: "",
    dateTo: "",
    sort: "latest"
  };


  const values = {

    recordSearch: "",

    recordAthleteFilter: "",

    recordSportFilter: "",

    recordMovementFilter: "",

    recordViewFilter: "",

    recordGradeFilter: "",

    recordDateFrom: "",

    recordDateTo: "",

    recordSort:
      "latest"
  };


  Object.entries(
    values
  ).forEach(
    ([id, value]) => {

      const element =
        document.getElementById(
          id
        );


      if (element) {

        element.value =
          value;
      }
    }
  );


  renderRecordList();

  updateRecordCount();


  SPLApp.showToast(
    "기록 필터를 초기화했습니다."
  );
}


/* =========================================================
   45. RECORDS UPDATED EVENT
========================================================= */

document.addEventListener(
  "spl:recordsupdated",
  () => {

    refreshRecordsModule();
  }
);


/* =========================================================
   46. ATHLETES UPDATED EVENT
========================================================= */

document.addEventListener(
  "spl:athletesupdated",
  () => {

    populateRecordAthleteFilter();

    renderRecordList();
  }
);


/* =========================================================
   47. PAGE CHANGE
========================================================= */

document.addEventListener(
  "spl:pagechange",
  (event) => {

    if (
      event.detail?.page ===
      "records"
    ) {

      refreshRecordsModule();
    }
  }
);


/* =========================================================
   48. GLOBAL API PART 1
========================================================= */

window.SPLRecords = {

  state:
    RecordManager,

  refresh:
    refreshRecordsModule,

  getAll:
    getPoseRecords,

  getFiltered:
    getFilteredRecords,

  getById:
    getRecordById,

  detail:
    showRecordDetail,

  compare:
    startRecordComparison,

  openReport:
    openRecordReport,

  statistics:
    calculateRecordStatistics,

  resetFilters:
    resetRecordFilters
};


/* =========================================================
   END OF records.js PART 1
========================================================= */
/* =========================================================
   SEOLCHEON PERFORMANCE LAB
   records.js

   PART 2 / 2
   Delete / Multi Select / Trends / Recent / Best / Safety
========================================================= */


/* =========================================================
   49. EXTEND RECORD STATE
========================================================= */

RecordManager.selectionMode = false;

RecordManager.selectedRecordIds =
  new Set();

RecordManager.trendAthleteId = null;


/* =========================================================
   50. DELETE SINGLE RECORD
========================================================= */

function deleteRecord(
  recordId,
  options = {}
) {

  const record =
    getRecordById(
      recordId
    );


  if (!record) {

    SPLApp.showToast(
      "삭제할 기록을 찾을 수 없습니다.",
      "error"
    );

    return false;
  }


  const skipConfirm =
    options.skipConfirm === true;


  if (!skipConfirm) {

    const confirmed =
      window.confirm(
        `${record.athleteName || "선수"}의 분석 기록을 삭제할까요?\n\n삭제한 기록은 복구할 수 없습니다.`
      );


    if (!confirmed) {
      return false;
    }
  }


  const records =
    SPLApp.getRecords();


  const updated =
    records.filter(
      (item) =>
        item.id !== recordId
    );


  const saved =
    SPLApp.saveRecords(
      updated
    );


  if (!saved) {

    SPLApp.showToast(
      "기록 삭제에 실패했습니다.",
      "error"
    );

    return false;
  }


  if (
    RecordManager.selectedRecordId ===
    recordId
  ) {

    closeRecordDetail();
  }


  if (
    RecordManager.compareRecordId ===
    recordId
  ) {

    closeRecordComparison();
  }


  RecordManager
    .selectedRecordIds
    .delete(
      recordId
    );


  document.dispatchEvent(
    new CustomEvent(
      "spl:recordsupdated",
      {
        detail: {
          action:
            "delete",

          recordId
        }
      }
    )
  );


  if (!options.silent) {

    SPLApp.showToast(
      "분석 기록을 삭제했습니다."
    );
  }


  return true;
}


/* =========================================================
   51. DELETE BUTTON IN DETAIL
========================================================= */

function addDeleteButtonToDetail() {

  const container =
    getRecordDetailContainer();


  if (!container) {
    return;
  }


  const actions =
    container.querySelector(
      ".record-detail-actions"
    );


  if (
    !actions ||
    actions.querySelector(
      '[data-record-detail-action="delete"]'
    )
  ) {

    return;
  }


  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.className =
    "danger";


  button.dataset
    .recordDetailAction =
      "delete";


  button.dataset.recordId =
    RecordManager
      .selectedRecordId ||
    "";


  button.innerHTML = `
    <i class="fa-solid fa-trash"></i>
    기록 삭제
  `;


  actions.prepend(
    button
  );
}


/* =========================================================
   52. DETAIL RENDER EXTENSION
========================================================= */

document.addEventListener(
  "spl:recorddetail",
  () => {

    addDeleteButtonToDetail();
  }
);


/* =========================================================
   53. DETAIL DELETE ACTION
========================================================= */

function initializeRecordDeleteAction() {

  const container =
    getRecordDetailContainer();


  if (!container) {
    return;
  }


  container.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          '[data-record-detail-action="delete"]'
        );


      if (!button) {
        return;
      }


      const recordId =
        button.dataset
          .recordId ||
        RecordManager
          .selectedRecordId;


      if (!recordId) {
        return;
      }


      deleteRecord(
        recordId
      );
    }
  );
}


/* =========================================================
   54. SELECTION MODE
========================================================= */

function setRecordSelectionMode(
  enabled
) {

  RecordManager.selectionMode =
    Boolean(
      enabled
    );


  if (
    !RecordManager.selectionMode
  ) {

    RecordManager
      .selectedRecordIds
      .clear();
  }


  document.body.classList.toggle(
    "record-selection-mode",
    RecordManager.selectionMode
  );


  renderRecordList();

  renderRecordSelectionBar();
}


/* =========================================================
   55. TOGGLE RECORD SELECTION
========================================================= */

function toggleRecordSelection(
  recordId
) {

  if (!recordId) {
    return;
  }


  if (
    RecordManager
      .selectedRecordIds
      .has(
        recordId
      )
  ) {

    RecordManager
      .selectedRecordIds
      .delete(
        recordId
      );

  } else {

    RecordManager
      .selectedRecordIds
      .add(
        recordId
      );
  }


  updateSelectedRecordCards();

  renderRecordSelectionBar();
}


/* =========================================================
   56. UPDATE SELECTED CARDS
========================================================= */

function updateSelectedRecordCards() {

  document
    .querySelectorAll(
      ".record-card"
    )
    .forEach(
      (card) => {

        const recordId =
          card.dataset
            .recordId;


        const selected =
          RecordManager
            .selectedRecordIds
            .has(
              recordId
            );


        card.classList.toggle(
          "selected",
          selected
        );


        const checkbox =
          card.querySelector(
            ".record-select-checkbox"
          );


        if (checkbox) {

          checkbox.checked =
            selected;
        }
      }
    );
}


/* =========================================================
   57. SELECTION BAR
========================================================= */

function getRecordSelectionBar() {

  let bar =
    document.getElementById(
      "recordSelectionBar"
    );


  if (bar) {
    return bar;
  }


  const page =
    document.getElementById(
      "recordsPage"
    ) ||
    getRecordListContainer()
      ?.parentElement;


  if (!page) {
    return null;
  }


  bar =
    document.createElement(
      "div"
    );


  bar.id =
    "recordSelectionBar";


  bar.className =
    "record-selection-bar";


  page.appendChild(
    bar
  );


  return bar;
}


/* =========================================================
   58. RENDER SELECTION BAR
========================================================= */

function renderRecordSelectionBar() {

  const bar =
    getRecordSelectionBar();


  if (!bar) {
    return;
  }


  if (
    !RecordManager.selectionMode
  ) {

    bar.classList.remove(
      "show"
    );

    bar.innerHTML =
      "";

    return;
  }


  const count =
    RecordManager
      .selectedRecordIds
      .size;


  bar.innerHTML = `

    <div class="record-selection-info">

      <strong>
        ${count}
      </strong>

      <span>
        개 기록 선택
      </span>

    </div>


    <div class="record-selection-actions">

      <button
        type="button"
        data-selection-action="all"
      >
        전체 선택
      </button>


      <button
        type="button"
        data-selection-action="clear"
      >
        선택 해제
      </button>


      <button
        type="button"
        class="danger"
        data-selection-action="delete"
        ${count ? "" : "disabled"}
      >
        <i class="fa-solid fa-trash"></i>
        선택 삭제
      </button>


      <button
        type="button"
        data-selection-action="close"
      >
        완료
      </button>

    </div>
  `;


  bar.classList.add(
    "show"
  );
}


/* =========================================================
   59. INITIALIZE SELECTION BAR
========================================================= */

function initializeRecordSelectionBar() {

  const bar =
    getRecordSelectionBar();


  if (!bar) {
    return;
  }


  bar.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          "[data-selection-action]"
        );


      if (!button) {
        return;
      }


      const action =
        button.dataset
          .selectionAction;


      switch (action) {

        case "all":

          selectAllVisibleRecords();

          break;


        case "clear":

          RecordManager
            .selectedRecordIds
            .clear();

          updateSelectedRecordCards();

          renderRecordSelectionBar();

          break;


        case "delete":

          deleteSelectedRecords();

          break;


        case "close":

          setRecordSelectionMode(
            false
          );

          break;
      }
    }
  );
}


/* =========================================================
   60. SELECT ALL VISIBLE
========================================================= */

function selectAllVisibleRecords() {

  const records =
    getFilteredRecords();


  records.forEach(
    (record) => {

      RecordManager
        .selectedRecordIds
        .add(
          record.id
        );
    }
  );


  updateSelectedRecordCards();

  renderRecordSelectionBar();
}


/* =========================================================
   61. DELETE SELECTED
========================================================= */

function deleteSelectedRecords() {

  const ids =
    [
      ...RecordManager
        .selectedRecordIds
    ];


  if (!ids.length) {

    SPLApp.showToast(
      "선택된 기록이 없습니다.",
      "warning"
    );

    return;
  }


  const confirmed =
    window.confirm(
      `선택한 ${ids.length}개의 분석 기록을 삭제할까요?\n\n삭제한 기록은 복구할 수 없습니다.`
    );


  if (!confirmed) {
    return;
  }


  const records =
    SPLApp.getRecords();


  const idSet =
    new Set(
      ids
    );


  const updated =
    records.filter(
      (record) =>
        !idSet.has(
          record.id
        )
    );


  const saved =
    SPLApp.saveRecords(
      updated
    );


  if (!saved) {

    SPLApp.showToast(
      "선택 기록 삭제에 실패했습니다.",
      "error"
    );

    return;
  }


  RecordManager
    .selectedRecordIds
    .clear();


  RecordManager.selectedRecordId =
    null;


  RecordManager.compareRecordId =
    null;


  closeRecordDetail();

  closeRecordComparison();


  document.dispatchEvent(
    new CustomEvent(
      "spl:recordsupdated",
      {
        detail: {
          action:
            "delete-multiple",

          recordIds:
            ids
        }
      }
    )
  );


  SPLApp.showToast(
    `${ids.length}개의 분석 기록을 삭제했습니다.`
  );


  renderRecordSelectionBar();
}


/* =========================================================
   62. SELECTION BUTTON
========================================================= */

function initializeRecordSelectionButton() {

  const button =
    document.getElementById(
      "recordSelectionToggle"
    );


  button?.addEventListener(
    "click",
    () => {

      setRecordSelectionMode(
        !RecordManager
          .selectionMode
      );
    }
  );
}


/* =========================================================
   63. EXTEND RECORD CARD FOR SELECTION
========================================================= */

const originalCreateRecordCardHTML =
  createRecordCardHTML;


createRecordCardHTML =
  function (
    record
  ) {

    const html =
      originalCreateRecordCardHTML(
        record
      );


    if (
      !RecordManager
        .selectionMode
    ) {

      return html;
    }


    const selected =
      RecordManager
        .selectedRecordIds
        .has(
          record.id
        );


    return html.replace(
      '<article',
      `
      <article
        data-record-selectable="true"
        class="${
          selected
            ? "selected"
            : ""
        }"
      `
    ).replace(
      '<div class="record-card-top">',
      `
      <label
        class="record-select-control"
        onclick="event.stopPropagation()"
      >

        <input
          type="checkbox"
          class="record-select-checkbox"
          data-record-select="${SPLApp.escapeHTML(
            record.id
          )}"
          ${selected ? "checked" : ""}
        >

        <span></span>

      </label>

      <div class="record-card-top">
      `
    );
  };


/* =========================================================
   64. HANDLE SELECTION CLICK
========================================================= */

document.addEventListener(
  "change",
  (event) => {

    const checkbox =
      event.target.closest(
        "[data-record-select]"
      );


    if (!checkbox) {
      return;
    }


    toggleRecordSelection(
      checkbox.dataset
        .recordSelect
    );
  }
);


/* =========================================================
   65. ATHLETE RECORDS
========================================================= */

function getAthleteRecords(
  athleteId
) {

  if (!athleteId) {
    return [];
  }


  return getPoseRecords()
    .filter(
      (record) =>
        record.athleteId ===
        athleteId
    )
    .sort(
      (a, b) =>
        getRecordTimestamp(a) -
        getRecordTimestamp(b)
    );
}


/* =========================================================
   66. LATEST RECORD
========================================================= */

function getLatestAthleteRecord(
  athleteId
) {

  const records =
    getAthleteRecords(
      athleteId
    );


  return (
    records[
      records.length - 1
    ] ||
    null
  );
}


/* =========================================================
   67. BEST RECORD
========================================================= */

function getBestAthleteRecord(
  athleteId
) {

  const records =
    getAthleteRecords(
      athleteId
    );


  if (!records.length) {
    return null;
  }


  return records
    .slice()
    .sort(
      (a, b) =>
        SPLApp.safeNumber(
          b.score
        ) -
        SPLApp.safeNumber(
          a.score
        )
    )[0];
}


/* =========================================================
   68. ATHLETE RECORD SUMMARY
========================================================= */

function getAthleteRecordSummary(
  athleteId
) {

  const records =
    getAthleteRecords(
      athleteId
    );


  if (!records.length) {

    return {
      count: 0,
      average: 0,
      best: 0,
      latest: 0,
      change: 0
    };
  }


  const scores =
    records.map(
      (record) =>
        SPLApp.safeNumber(
          record.score
        )
    );


  const first =
    scores[0];


  const latest =
    scores[
      scores.length - 1
    ];


  return {

    count:
      records.length,

    average:
      SPLApp.roundNumber(
        SPLApp.average(
          scores
        ),
        1
      ),

    best:
      SPLApp.roundNumber(
        Math.max(
          ...scores
        ),
        1
      ),

    latest:
      SPLApp.roundNumber(
        latest,
        1
      ),

    change:
      SPLApp.roundNumber(
        latest - first,
        1
      )
  };
}


/* =========================================================
   69. TREND DATA
========================================================= */

function getAthleteTrendData(
  athleteId,
  limit = 12
) {

  const records =
    getAthleteRecords(
      athleteId
    )
      .slice(
        -Math.max(
          2,
          limit
        )
      );


  return {

    labels:
      records.map(
        (record) =>
          formatShortRecordDate(
            record.createdAt
          )
      ),

    score:
      records.map(
        (record) =>
          SPLApp.safeNumber(
            record.score
          )
      ),

    stability:
      records.map(
        (record) =>
          SPLApp.safeNumber(
            record.stability
          )
      ),

    balance:
      records.map(
        (record) =>
          SPLApp.safeNumber(
            record.balance
          )
      ),

    efficiency:
      records.map(
        (record) =>
          SPLApp.safeNumber(
            record.efficiency
          )
      ),

    alignment:
      records.map(
        (record) =>
          SPLApp.safeNumber(
            record.alignment
          )
      ),

    records
  };
}


/* =========================================================
   70. SHORT DATE
========================================================= */

function formatShortRecordDate(
  value
) {

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
   71. TREND SELECTOR
========================================================= */

function initializeTrendAthleteSelector() {

  const selector =
    document.getElementById(
      "recordTrendAthlete"
    );


  if (!selector) {
    return;
  }


  populateTrendAthleteSelector();


  selector.addEventListener(
    "change",
    () => {

      RecordManager.trendAthleteId =
        selector.value ||
        null;


      renderAthleteTrend();
    }
  );
}


/* =========================================================
   72. POPULATE TREND SELECTOR
========================================================= */

function populateTrendAthleteSelector() {

  const selector =
    document.getElementById(
      "recordTrendAthlete"
    );


  if (!selector) {
    return;
  }


  const current =
    selector.value;


  const athleteIds =
    new Set(
      getPoseRecords()
        .map(
          (record) =>
            record.athleteId
        )
        .filter(Boolean)
    );


  const athletes =
    SPLApp.getAthletes()
      .filter(
        (athlete) =>
          athleteIds.has(
            athlete.id
          )
      );


  selector.innerHTML = `
    <option value="">
      선수 선택
    </option>

    ${athletes
      .map(
        (athlete) => `
          <option
            value="${SPLApp.escapeHTML(
              athlete.id
            )}"
          >
            ${SPLApp.escapeHTML(
              athlete.name ||
              "이름 없음"
            )}
          </option>
        `
      )
      .join("")}
  `;


  if (
    athletes.some(
      (athlete) =>
        athlete.id ===
        current
    )
  ) {

    selector.value =
      current;

  } else if (
    athletes.length === 1
  ) {

    selector.value =
      athletes[0].id;


    RecordManager.trendAthleteId =
      athletes[0].id;
  }
}


/* =========================================================
   73. TREND CHART INSTANCE
========================================================= */

let recordTrendChart =
  null;


/* =========================================================
   74. RENDER ATHLETE TREND
========================================================= */

function renderAthleteTrend() {

  const canvas =
    document.getElementById(
      "recordTrendChart"
    );


  if (!canvas) {
    return;
  }


  const athleteId =
    RecordManager
      .trendAthleteId ||
    document.getElementById(
      "recordTrendAthlete"
    )?.value;


  if (!athleteId) {

    destroyRecordTrendChart();

    return;
  }


  const trend =
    getAthleteTrendData(
      athleteId
    );


  if (
    trend.records.length < 1
  ) {

    destroyRecordTrendChart();

    return;
  }


  if (
    typeof Chart ===
    "undefined"
  ) {

    console.warn(
      "[RECORDS] Chart.js is not loaded."
    );

    return;
  }


  destroyRecordTrendChart();


  recordTrendChart =
    new Chart(
      canvas,
      {
        type:
          "line",

        data: {
          labels:
            trend.labels,

          datasets: [

            {
              label:
                "종합점수",

              data:
                trend.score,

              borderWidth: 3,

              tension: 0.35,

              pointRadius: 4,

              pointHoverRadius: 6
            },

            {
              label:
                "안정성",

              data:
                trend.stability,

              borderWidth: 2,

              tension: 0.35,

              pointRadius: 2
            },

            {
              label:
                "균형",

              data:
                trend.balance,

              borderWidth: 2,

              tension: 0.35,

              pointRadius: 2
            }
          ]
        },


        options: {

          responsive:
            true,

          maintainAspectRatio:
            false,

          interaction: {
            intersect:
              false,

            mode:
              "index"
          },

          scales: {

            y: {

              beginAtZero:
                false,

              suggestedMin:
                40,

              suggestedMax:
                100,

              ticks: {
                precision: 0
              }
            }
          },

          plugins: {

            legend: {
              display:
                true
            }
          }
        }
      }
    );


  renderAthleteTrendSummary(
    athleteId
  );
}


/* =========================================================
   75. DESTROY TREND CHART
========================================================= */

function destroyRecordTrendChart() {

  if (
    recordTrendChart
  ) {

    recordTrendChart.destroy();

    recordTrendChart =
      null;
  }
}


/* =========================================================
   76. TREND SUMMARY
========================================================= */

function renderAthleteTrendSummary(
  athleteId
) {

  const container =
    document.getElementById(
      "recordTrendSummary"
    );


  if (!container) {
    return;
  }


  const summary =
    getAthleteRecordSummary(
      athleteId
    );


  container.innerHTML = `

    ${createTrendSummaryItem(
      "분석 횟수",
      summary.count
    )}

    ${createTrendSummaryItem(
      "평균",
      summary.average
    )}

    ${createTrendSummaryItem(
      "최고",
      summary.best
    )}

    ${createTrendSummaryItem(
      "최근",
      summary.latest
    )}

    ${createTrendSummaryItem(
      "변화",
      `${
        summary.change > 0
          ? "+"
          : ""
      }${summary.change}`
    )}
  `;
}


/* =========================================================
   77. TREND SUMMARY ITEM
========================================================= */

function createTrendSummaryItem(
  label,
  value
) {

  return `
    <div class="record-trend-summary-item">

      <span>
        ${SPLApp.escapeHTML(
          label
        )}
      </span>

      <strong>
        ${SPLApp.escapeHTML(
          String(value)
        )}
      </strong>

    </div>
  `;
}


/* =========================================================
   78. RECENT RECORDS
========================================================= */

function getRecentRecords(
  limit = 5
) {

  return getPoseRecords()
    .slice()
    .sort(
      (a, b) =>
        getRecordTimestamp(b) -
        getRecordTimestamp(a)
    )
    .slice(
      0,
      Math.max(
        1,
        limit
      )
    );
}


/* =========================================================
   79. BEST RECORDS
========================================================= */

function getBestRecords(
  limit = 5
) {

  return getPoseRecords()
    .slice()
    .sort(
      (a, b) =>
        SPLApp.safeNumber(
          b.score
        ) -
        SPLApp.safeNumber(
          a.score
        )
    )
    .slice(
      0,
      Math.max(
        1,
        limit
      )
    );
}


/* =========================================================
   80. SPORT STATISTICS
========================================================= */

function getSportRecordStatistics() {

  const records =
    getPoseRecords();


  const map = {};


  records.forEach(
    (record) => {

      const sport =
        record.sportLabel ||
        record.sport ||
        "기타";


      if (!map[sport]) {

        map[sport] = {
          sport,
          count: 0,
          scores: []
        };
      }


      map[sport].count += 1;


      map[sport].scores.push(
        SPLApp.safeNumber(
          record.score
        )
      );
    }
  );


  return Object
    .values(
      map
    )
    .map(
      (item) => ({
        sport:
          item.sport,

        count:
          item.count,

        average:
          SPLApp.roundNumber(
            SPLApp.average(
              item.scores
            ),
            1
          ),

        best:
          SPLApp.roundNumber(
            Math.max(
              ...item.scores
            ),
            1
          )
      })
    )
    .sort(
      (a, b) =>
        b.count - a.count
    );
}


/* =========================================================
   81. ATHLETE RANKING
========================================================= */

function getRecordAthleteRanking() {

  const records =
    getPoseRecords();


  const athletes = {};


  records.forEach(
    (record) => {

      const key =
        record.athleteId ||
        record.athleteName;


      if (!key) {
        return;
      }


      if (!athletes[key]) {

        athletes[key] = {
          athleteId:
            record.athleteId ||
            "",

          athleteName:
            record.athleteName ||
            "미지정 선수",

          scores: [],

          count: 0
        };
      }


      athletes[key]
        .scores
        .push(
          SPLApp.safeNumber(
            record.score
          )
        );


      athletes[key].count +=
        1;
    }
  );


  return Object
    .values(
      athletes
    )
    .map(
      (item) => ({

        athleteId:
          item.athleteId,

        athleteName:
          item.athleteName,

        count:
          item.count,

        average:
          SPLApp.roundNumber(
            SPLApp.average(
              item.scores
            ),
            1
          ),

        best:
          SPLApp.roundNumber(
            Math.max(
              ...item.scores
            ),
            1
          )
      })
    )
    .sort(
      (a, b) =>
        b.average -
        a.average
    );
}


/* =========================================================
   82. SAFE RECORD NORMALIZATION
========================================================= */

function normalizePoseRecord(
  record
) {

  if (
    !record ||
    typeof record !==
      "object"
  ) {

    return null;
  }


  return {

    ...record,


    id:
      String(
        record.id ||
        `pose_${Date.now()}`
      ),


    type:
      "pose",


    athleteId:
      String(
        record.athleteId ||
        ""
      ),


    athleteName:
      String(
        record.athleteName ||
        "미지정 선수"
      ),


    sport:
      String(
        record.sport ||
        "general"
      ),


    sportLabel:
      String(
        record.sportLabel ||
        record.sport ||
        "기본 자세"
      ),


    movement:
      String(
        record.movement ||
        "standing"
      ),


    movementLabel:
      String(
        record.movementLabel ||
        record.movement ||
        "기본 자세"
      ),


    score:
      SPLApp.clampScore(
        record.score
      ),


    alignment:
      SPLApp.clampScore(
        record.alignment
      ),


    stability:
      SPLApp.clampScore(
        record.stability
      ),


    balance:
      SPLApp.clampScore(
        record.balance
      ),


    efficiency:
      SPLApp.clampScore(
        record.efficiency
      ),


    confidence:
      SPLApp.clampScore(
        record.confidence
      ),


    createdAt:
      record.createdAt ||
      new Date()
        .toISOString()
  };
}


/* =========================================================
   83. VALIDATE STORED RECORDS
========================================================= */

function validateStoredPoseRecords() {

  const records =
    SPLApp.getRecords();


  if (
    !Array.isArray(
      records
    )
  ) {

    return false;
  }


  let changed =
    false;


  const normalized =
    records
      .map(
        (record) => {

          if (
            record?.type !==
              "pose"
          ) {

            return record;
          }


          const clean =
            normalizePoseRecord(
              record
            );


          if (!clean) {

            changed =
              true;

            return null;
          }


          return clean;
        }
      )
      .filter(Boolean);


  if (
    changed
  ) {

    SPLApp.saveRecords(
      normalized
    );
  }


  return true;
}


/* =========================================================
   84. ESCAPE KEY
========================================================= */

function initializeRecordKeyboard() {

  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key !==
        "Escape"
      ) {

        return;
      }


      if (
        getRecordCompareContainer()
          ?.classList
          .contains(
            "show"
          )
      ) {

        closeRecordComparison();

        return;
      }


      if (
        getRecordDetailContainer()
          ?.classList
          .contains(
            "show"
          )
      ) {

        closeRecordDetail();

        return;
      }


      if (
        RecordManager
          .selectionMode
      ) {

        setRecordSelectionMode(
          false
        );
      }
    }
  );
}


/* =========================================================
   85. REFRESH EXTENSION
========================================================= */

const originalRefreshRecordsModule =
  refreshRecordsModule;


refreshRecordsModule =
  function () {

    validateStoredPoseRecords();


    originalRefreshRecordsModule();


    populateTrendAthleteSelector();


    if (
      RecordManager
        .trendAthleteId
    ) {

      renderAthleteTrend();
    }


    if (
      RecordManager
        .selectionMode
    ) {

      renderRecordSelectionBar();

      updateSelectedRecordCards();
    }
  };


/* =========================================================
   86. RECORD CARD SELECTION SAFETY
========================================================= */

document.addEventListener(
  "click",
  (event) => {

    if (
      !RecordManager
        .selectionMode
    ) {

      return;
    }


    const card =
      event.target.closest(
        ".record-card"
      );


    if (!card) {
      return;
    }


    if (
      event.target.closest(
        "button"
      ) ||
      event.target.closest(
        ".record-select-control"
      )
    ) {

      return;
    }


    event.preventDefault();

    event.stopPropagation();


    toggleRecordSelection(
      card.dataset
        .recordId
    );
  },
  true
);


/* =========================================================
   87. SECONDARY INITIALIZATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initializeRecordDeleteAction();

    initializeRecordSelectionButton();

    initializeRecordSelectionBar();

    initializeTrendAthleteSelector();

    initializeRecordKeyboard();

    validateStoredPoseRecords();
  }
);


/* =========================================================
   88. RECORD SAVED EVENT
========================================================= */

document.addEventListener(
  "spl:poserecordsaved",
  (event) => {

    const record =
      event.detail;


    if (!record) {
      return;
    }


    refreshRecordsModule();


    if (
      record.athleteId
    ) {

      RecordManager.trendAthleteId =
        record.athleteId;


      const selector =
        document.getElementById(
          "recordTrendAthlete"
        );


      if (selector) {

        selector.value =
          record.athleteId;
      }


      renderAthleteTrend();
    }
  }
);


/* =========================================================
   89. GET RECORD FOR REPORT
========================================================= */

function getRecordForReport(
  recordId = null
) {

  const id =
    recordId ||
    sessionStorage.getItem(
      "spl_report_record"
    );


  if (!id) {
    return null;
  }


  return getRecordById(
    id
  );
}


/* =========================================================
   90. EXPORT RECORD DATA
========================================================= */

function exportRecordData(
  recordId
) {

  const record =
    getRecordById(
      recordId
    );


  if (!record) {
    return null;
  }


  return {

    system:
      "SEOLCHEON PERFORMANCE LAB",

    module:
      "RECORDS",

    version:
      "1.0",

    exportedAt:
      new Date()
        .toISOString(),

    record:
      normalizePoseRecord(
        record
      )
  };
}


/* =========================================================
   91. EXTEND GLOBAL API
========================================================= */

Object.assign(
  window.SPLRecords,
  {

    delete:
      deleteRecord,

    setSelectionMode:
      setRecordSelectionMode,

    select:
      toggleRecordSelection,

    selectAll:
      selectAllVisibleRecords,

    deleteSelected:
      deleteSelectedRecords,

    athleteRecords:
      getAthleteRecords,

    athleteSummary:
      getAthleteRecordSummary,

    athleteTrend:
      getAthleteTrendData,

    latest:
      getLatestAthleteRecord,

    best:
      getBestAthleteRecord,

    recent:
      getRecentRecords,

    bestRecords:
      getBestRecords,

    sportStatistics:
      getSportRecordStatistics,

    athleteRanking:
      getRecordAthleteRanking,

    getForReport:
      getRecordForReport,

    normalize:
      normalizePoseRecord,

    export:
      exportRecordData
  }
);


/* =========================================================
   92. RECORDS READY
========================================================= */

document.dispatchEvent(
  new CustomEvent(
    "spl:recordsready",
    {
      detail: {

        module:
          "records",

        version:
          "1.0"
      }
    }
  )
);


/* =========================================================
   END OF records.js
========================================================= */