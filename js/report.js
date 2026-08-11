/* =========================================================
   SEOLCHEON PERFORMANCE LAB
   report.js

   PART 1 / 2
   Performance Analysis Report
========================================================= */

"use strict";


/* =========================================================
   01. REPORT MANAGER
========================================================= */

const ReportManager = {

  initialized: false,

  recordId: null,

  athleteId: null,

  record: null,

  athlete: null,

  previousRecord: null,

  chart: null,

  radarChart: null
};


/* =========================================================
   02. INITIALIZE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initializeReportModule();
  }
);


document.addEventListener(
  "spl:systemready",
  () => {

    initializeReportModule();
  }
);


/* =========================================================
   03. INITIALIZE REPORT MODULE
========================================================= */

function initializeReportModule() {

  if (
    ReportManager.initialized
  ) {

    refreshReport();

    return;
  }


  initializeReportButtons();

  initializeReportEvents();

  refreshReport();


  ReportManager.initialized =
    true;


  console.log(
    "[REPORT] Module initialized."
  );
}


/* =========================================================
   04. GET REPORT ROOT
========================================================= */

function getReportRoot() {

  return (
    document.getElementById(
      "reportContent"
    ) ||
    document.getElementById(
      "reportPage"
    )
  );
}


/* =========================================================
   05. GET RECORD ID
========================================================= */

function getReportRecordId() {

  return (
    ReportManager.recordId ||
    sessionStorage.getItem(
      "spl_report_record"
    ) ||
    null
  );
}


/* =========================================================
   06. GET ATHLETE ID
========================================================= */

function getReportAthleteId() {

  return (
    ReportManager.athleteId ||
    sessionStorage.getItem(
      "spl_report_athlete"
    ) ||
    null
  );
}


/* =========================================================
   07. GET REPORT RECORD
========================================================= */

function getReportRecord() {

  const recordId =
    getReportRecordId();


  if (!recordId) {
    return null;
  }


  if (
    window.SPLRecords &&
    typeof window.SPLRecords
      .getById ===
      "function"
  ) {

    return (
      window.SPLRecords
        .getById(
          recordId
        ) ||
      null
    );
  }


  const records =
    SPLApp.getRecords();


  return (
    records.find(
      (record) =>
        record.id ===
        recordId
    ) ||
    null
  );
}


/* =========================================================
   08. GET ATHLETE
========================================================= */

function getReportAthlete(
  record
) {

  const athleteId =
    record?.athleteId ||
    getReportAthleteId();


  if (!athleteId) {
    return null;
  }


  return (
    SPLApp.getAthleteById(
      athleteId
    ) ||
    null
  );
}


/* =========================================================
   09. FIND PREVIOUS RECORD
========================================================= */

function findPreviousReportRecord(
  current
) {

  if (!current) {
    return null;
  }


  const records =
    SPLApp.getRecords()
      .filter(
        (record) => {

          if (
            !record ||
            record.id ===
              current.id
          ) {

            return false;
          }


          if (
            record.type &&
            record.type !==
              "pose"
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
            getReportTimestamp(
              record
            ) <
            getReportTimestamp(
              current
            )
          );
        }
      )
      .sort(
        (a, b) =>
          getReportTimestamp(b) -
          getReportTimestamp(a)
      );


  const sameAnalysis =
    records.find(
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
    sameAnalysis ||
    records[0] ||
    null
  );
}


/* =========================================================
   10. TIMESTAMP
========================================================= */

function getReportTimestamp(
  record
) {

  const value =
    new Date(
      record?.createdAt || 0
    ).getTime();


  return Number.isFinite(
    value
  )
    ? value
    : 0;
}


/* =========================================================
   11. REFRESH REPORT
========================================================= */

function refreshReport() {

  const root =
    getReportRoot();


  if (!root) {
    return;
  }


  const record =
    getReportRecord();


  if (!record) {

    ReportManager.record =
      null;

    ReportManager.athlete =
      null;

    ReportManager.previousRecord =
      null;


    renderEmptyReport();

    return;
  }


  ReportManager.recordId =
    record.id;


  ReportManager.athleteId =
    record.athleteId ||
    null;


  ReportManager.record =
    record;


  ReportManager.athlete =
    getReportAthlete(
      record
    );


  ReportManager.previousRecord =
    findPreviousReportRecord(
      record
    );


  renderPerformanceReport(
    record,
    ReportManager.athlete,
    ReportManager.previousRecord
  );


  renderReportCharts(
    record
  );


  document.dispatchEvent(
    new CustomEvent(
      "spl:reportrendered",
      {
        detail: {
          record,
          athlete:
            ReportManager.athlete,
          previousRecord:
            ReportManager.previousRecord
        }
      }
    )
  );
}


/* =========================================================
   12. EMPTY REPORT
========================================================= */

function renderEmptyReport() {

  const root =
    getReportRoot();


  if (!root) {
    return;
  }


  root.innerHTML = `

    <div class="spl-report-empty">

      <div class="spl-report-empty-icon">
        <i class="fa-solid fa-file-waveform"></i>
      </div>

      <h2>
        분석 리포트가 없습니다
      </h2>

      <p>
        자세분석을 완료하고 결과를 저장하면
        선수 분석 리포트를 확인할 수 있습니다.
      </p>

      <button
        type="button"
        data-report-action="records"
      >
        <i class="fa-solid fa-chart-line"></i>
        분석 기록 보기
      </button>

    </div>
  `;
}


/* =========================================================
   13. MAIN REPORT
========================================================= */

function renderPerformanceReport(
  record,
  athlete,
  previous
) {

  const root =
    getReportRoot();


  if (!root) {
    return;
  }


  const score =
    Math.round(
      safeReportNumber(
        record.score
      )
    );


  const grade =
    record.grade ||
    getReportGrade(
      score
    );


  const sport =
    record.sportLabel ||
    record.sport ||
    athlete?.sport ||
    "기본 자세";


  const movement =
    record.movementLabel ||
    record.movement ||
    "기본 자세";


  const view =
    record.viewMode ===
      "side"
      ? "측면"
      : "정면";


  const athleteName =
    record.athleteName ||
    athlete?.name ||
    "미지정 선수";


  root.innerHTML = `

    <article
      class="spl-performance-report"
      data-report-record="${escapeReportHTML(
        record.id
      )}"
    >

      ${createReportHeader(
        record,
        athlete,
        athleteName
      )}


      <section class="spl-report-hero">

        <div class="spl-report-athlete">

          ${createAthletePhoto(
            athlete,
            athleteName
          )}

          <div class="spl-report-athlete-info">

            <span class="spl-report-label">
              ATHLETE PERFORMANCE ANALYSIS
            </span>

            <h1>
              ${escapeReportHTML(
                athleteName
              )}
            </h1>

            <div class="spl-report-athlete-meta">

              <span>
                <i class="fa-solid fa-medal"></i>
                ${escapeReportHTML(
                  sport
                )}
              </span>

              <span>
                <i class="fa-solid fa-person-running"></i>
                ${escapeReportHTML(
                  movement
                )}
              </span>

              <span>
                <i class="fa-solid fa-camera"></i>
                ${view}
              </span>

            </div>

          </div>

        </div>


        <div
          class="spl-report-score"
          data-grade="${escapeReportHTML(
            grade
          )}"
        >

          <span>
            PERFORMANCE SCORE
          </span>

          <strong>
            ${score}
          </strong>

          <em>
            ${escapeReportHTML(
              grade
            )}
          </em>

          <small>
            ${escapeReportHTML(
              getReportLevel(
                score
              )
            )}
          </small>

        </div>

      </section>


      <section class="spl-report-overview">

        ${createReportMetricCard(
          "정렬",
          record.alignment,
          "fa-person-rays"
        )}

        ${createReportMetricCard(
          "안정성",
          record.stability,
          "fa-shield"
        )}

        ${createReportMetricCard(
          "균형",
          record.balance,
          "fa-scale-balanced"
        )}

        ${createReportMetricCard(
          "동작 효율",
          record.efficiency,
          "fa-bolt"
        )}

      </section>


      <section class="spl-report-grid">

        <div class="spl-report-panel spl-report-chart-panel">

          ${createReportPanelHeader(
            "Performance Profile",
            "퍼포먼스 프로파일",
            "fa-chart-radar"
          )}

          <div class="spl-report-chart-wrap">

            <canvas
              id="reportRadarChart"
            ></canvas>

          </div>

        </div>


        <div class="spl-report-panel">

          ${createReportPanelHeader(
            "Analysis Information",
            "분석 정보",
            "fa-circle-info"
          )}

          ${createReportInformation(
            record,
            athlete
          )}

        </div>

      </section>


      ${
        record.snapshot
          ? createReportSnapshot(
              record
            )
          : ""
      }


      <section class="spl-report-panel">

        ${createReportPanelHeader(
          "Biomechanical Data",
          "주요 관절각 분석",
          "fa-person"
        )}

        ${createReportAngles(
          record.angles
        )}

      </section>


      ${createSymmetrySection(
        record
      )}


      ${createSportMetricSection(
        record
      )}


      <section class="spl-report-grid">

        <div class="spl-report-panel">

          ${createReportPanelHeader(
            "Strengths",
            "우수 항목",
            "fa-circle-check"
          )}

          ${createReportStrengths(
            record
          )}

        </div>


        <div class="spl-report-panel">

          ${createReportPanelHeader(
            "Priority",
            "우선 개선 항목",
            "fa-triangle-exclamation"
          )}

          ${createReportWeaknesses(
            record
          )}

        </div>

      </section>


      <section class="spl-report-panel spl-report-opinion">

        ${createReportPanelHeader(
          "Performance Analysis",
          "종합 분석 의견",
          "fa-brain"
        )}

        ${createReportOpinion(
          record
        )}

      </section>


      ${
        previous
          ? createReportComparison(
              record,
              previous
            )
          : createNoComparison()
      }


      <section class="spl-report-panel">

        ${createReportPanelHeader(
          "Training Recommendation",
          "훈련 권장사항",
          "fa-dumbbell"
        )}

        ${createTrainingRecommendations(
          record
        )}

      </section>


      ${createReportFooter(
        record
      )}

    </article>
  `;
}


/* =========================================================
   14. REPORT HEADER
========================================================= */

function createReportHeader(
  record,
  athlete,
  athleteName
) {

  return `

    <header class="spl-report-header">

      <div class="spl-report-brand">

        <div class="spl-report-brand-mark">
          S
        </div>

        <div>

          <strong>
            설천고등학교
          </strong>

          <span>
            SEOLCHEON PERFORMANCE LAB
          </span>

        </div>

      </div>


      <div class="spl-report-header-info">

        <span>
          PERFORMANCE ANALYSIS REPORT
        </span>

        <strong>
          ${escapeReportHTML(
            formatReportDate(
              record.createdAt
            )
          )}
        </strong>

      </div>

    </header>
  `;
}


/* =========================================================
   15. ATHLETE PHOTO
========================================================= */

function createAthletePhoto(
  athlete,
  athleteName
) {

  const photo =
    athlete?.photo ||
    athlete?.image ||
    "";


  if (photo) {

    return `

      <div class="spl-report-athlete-photo">

        <img
          src="${escapeReportHTML(
            photo
          )}"
          alt="${escapeReportHTML(
            athleteName
          )}"
        >

      </div>
    `;
  }


  return `

    <div class="spl-report-athlete-photo fallback">

      <span>
        ${escapeReportHTML(
          getReportInitial(
            athleteName
          )
        )}
      </span>

    </div>
  `;
}


/* =========================================================
   16. METRIC CARD
========================================================= */

function createReportMetricCard(
  label,
  value,
  icon
) {

  const score =
    Math.round(
      safeReportNumber(
        value
      )
    );


  return `

    <div
      class="spl-report-metric-card"
      data-level="${getMetricLevel(
        score
      )}"
    >

      <div class="spl-report-metric-icon">

        <i class="fa-solid ${icon}"></i>

      </div>


      <div class="spl-report-metric-content">

        <span>
          ${escapeReportHTML(
            label
          )}
        </span>

        <strong>
          ${score}
        </strong>

      </div>


      <div class="spl-report-metric-bar">

        <span
          style="width:${Math.max(
            0,
            Math.min(
              100,
              score
            )
          )}%"
        ></span>

      </div>

    </div>
  `;
}


/* =========================================================
   17. PANEL HEADER
========================================================= */

function createReportPanelHeader(
  english,
  korean,
  icon
) {

  return `

    <div class="spl-report-panel-header">

      <div class="spl-report-panel-icon">
        <i class="fa-solid ${icon}"></i>
      </div>

      <div>

        <span>
          ${escapeReportHTML(
            english
          )}
        </span>

        <h2>
          ${escapeReportHTML(
            korean
          )}
        </h2>

      </div>

    </div>
  `;
}


/* =========================================================
   18. ANALYSIS INFORMATION
========================================================= */

function createReportInformation(
  record,
  athlete
) {

  const items = [

    [
      "선수",
      record.athleteName ||
      athlete?.name ||
      "미지정 선수"
    ],

    [
      "학년",
      athlete?.grade ||
      "-"
    ],

    [
      "종목",
      record.sportLabel ||
      record.sport ||
      athlete?.sport ||
      "-"
    ],

    [
      "분석 동작",
      record.movementLabel ||
      record.movement ||
      "-"
    ],

    [
      "촬영 방향",
      record.viewMode ===
        "side"
        ? "측면"
        : "정면"
    ],

    [
      "인식 정확도",
      `${Math.round(
        safeReportNumber(
          record.confidence
        )
      )}%`
    ],

    [
      "분석 프레임",
      `${Math.round(
        safeReportNumber(
          record.frames
        )
      )} frame`
    ],

    [
      "분석 시간",
      formatReportDuration(
        record.duration
      )
    ]
  ];


  return `

    <div class="spl-report-information">

      ${items
        .map(
          ([label, value]) => `

            <div class="spl-report-info-row">

              <span>
                ${escapeReportHTML(
                  label
                )}
              </span>

              <strong>
                ${escapeReportHTML(
                  String(value)
                )}
              </strong>

            </div>
          `
        )
        .join("")}

    </div>
  `;
}


/* =========================================================
   19. SNAPSHOT
========================================================= */

function createReportSnapshot(
  record
) {

  return `

    <section class="spl-report-panel">

      ${createReportPanelHeader(
        "Motion Capture",
        "분석 이미지",
        "fa-camera"
      )}

      <div class="spl-report-snapshot">

        <img
          src="${escapeReportHTML(
            record.snapshot
          )}"
          alt="자세분석 이미지"
        >

        <div class="spl-report-snapshot-info">

          <span>
            ${
              record.viewMode ===
              "side"
                ? "SIDE VIEW"
                : "FRONT VIEW"
            }
          </span>

          <strong>
            ${escapeReportHTML(
              record.movementLabel ||
              record.movement ||
              "POSE ANALYSIS"
            )}
          </strong>

        </div>

      </div>

    </section>
  `;
}


/* =========================================================
   20. ANGLES
========================================================= */

function createReportAngles(
  angles
) {

  if (
    !angles ||
    typeof angles !==
      "object"
  ) {

    return `

      <div class="spl-report-empty-data">
        저장된 관절각 데이터가 없습니다.
      </div>
    `;
  }


  const data = [

    [
      "왼쪽 팔꿈치",
      angles.leftElbow
    ],

    [
      "오른쪽 팔꿈치",
      angles.rightElbow
    ],

    [
      "왼쪽 어깨",
      angles.leftShoulder
    ],

    [
      "오른쪽 어깨",
      angles.rightShoulder
    ],

    [
      "왼쪽 고관절",
      angles.leftHip
    ],

    [
      "오른쪽 고관절",
      angles.rightHip
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

    <div class="spl-report-angle-grid">

      ${data
        .filter(
          ([, value]) =>
            value !== undefined &&
            value !== null
        )
        .map(
          ([label, value]) => `

            <div class="spl-report-angle">

              <span>
                ${escapeReportHTML(
                  label
                )}
              </span>

              <strong>
                ${roundReportNumber(
                  value,
                  1
                )}°
              </strong>

            </div>
          `
        )
        .join("")}

    </div>
  `;
}


/* =========================================================
   21. SYMMETRY
========================================================= */

function createSymmetrySection(
  record
) {

  const symmetry =
    record.symmetry;


  if (
    !symmetry ||
    typeof symmetry !==
      "object"
  ) {

    return "";
  }


  const score =
    Math.round(
      safeReportNumber(
        symmetry.score
      )
    );


  return `

    <section class="spl-report-panel">

      ${createReportPanelHeader(
        "Body Symmetry",
        "좌우 대칭 분석",
        "fa-arrows-left-right"
      )}

      <div class="spl-report-symmetry">

        <div class="spl-report-symmetry-score">

          <strong>
            ${score}
          </strong>

          <span>
            SYMMETRY SCORE
          </span>

        </div>


        <div class="spl-report-symmetry-data">

          ${createSymmetryItem(
            "팔꿈치 차이",
            symmetry.elbowDifference
          )}

          ${createSymmetryItem(
            "어깨 차이",
            symmetry.shoulderDifference
          )}

          ${createSymmetryItem(
            "고관절 차이",
            symmetry.hipDifference
          )}

          ${createSymmetryItem(
            "무릎 차이",
            symmetry.kneeDifference
          )}

        </div>

      </div>

    </section>
  `;
}


/* =========================================================
   22. SYMMETRY ITEM
========================================================= */

function createSymmetryItem(
  label,
  value
) {

  if (
    value === undefined ||
    value === null
  ) {

    return "";
  }


  return `

    <div class="spl-report-symmetry-item">

      <span>
        ${escapeReportHTML(
          label
        )}
      </span>

      <strong>
        ${roundReportNumber(
          value,
          1
        )}°
      </strong>

    </div>
  `;
}


/* =========================================================
   23. SPORT METRICS
========================================================= */

function createSportMetricSection(
  record
) {

  const metrics =
    record.sportMetrics;


  if (
    !metrics ||
    typeof metrics !==
      "object" ||
    !Object.keys(
      metrics
    ).length
  ) {

    return "";
  }


  return `

    <section class="spl-report-panel">

      ${createReportPanelHeader(
        "Sport Specific Metrics",
        "종목 특화 분석",
        "fa-medal"
      )}

      <div class="spl-report-sport-metrics">

        ${Object.entries(
          metrics
        )
          .map(
            ([key, value]) =>
              createSportMetric(
                key,
                value
              )
          )
          .join("")}

      </div>

    </section>
  `;
}


/* =========================================================
   24. SPORT METRIC
========================================================= */

function createSportMetric(
  key,
  value
) {

  let label =
    formatMetricKey(
      key
    );


  let displayValue =
    value;


  if (
    typeof value ===
    "number"
  ) {

    displayValue =
      roundReportNumber(
        value,
        1
      );
  }


  return `

    <div class="spl-report-sport-metric">

      <span>
        ${escapeReportHTML(
          label
        )}
      </span>

      <strong>
        ${escapeReportHTML(
          String(
            displayValue
          )
        )}
      </strong>

    </div>
  `;
}


/* =========================================================
   25. FORMAT METRIC KEY
========================================================= */

function formatMetricKey(
  key
) {

  const map = {

    kneeFlexion:
      "무릎 굴곡",

    hipFlexion:
      "고관절 굴곡",

    trunkLean:
      "몸통 기울기",

    shoulderTilt:
      "어깨 기울기",

    hipTilt:
      "골반 기울기",

    symmetry:
      "좌우 대칭",

    stability:
      "안정성",

    balance:
      "균형",

    efficiency:
      "효율",

    movementScore:
      "동작 점수"
  };


  return (
    map[key] ||
    String(key)
      .replace(
        /([A-Z])/g,
        " $1"
      )
      .trim()
  );
}


/* =========================================================
   26. STRENGTHS
========================================================= */

function createReportStrengths(
  record
) {

  const metrics =
    getReportMetrics(
      record
    );


  const strengths =
    metrics
      .filter(
        (item) =>
          item.value >= 80
      )
      .sort(
        (a, b) =>
          b.value -
          a.value
      )
      .slice(
        0,
        4
      );


  if (!strengths.length) {

    return `

      <div class="spl-report-empty-data">
        현재 분석에서는 80점 이상의
        우수 항목이 확인되지 않았습니다.
      </div>
    `;
  }


  return `

    <div class="spl-report-point-list positive">

      ${strengths
        .map(
          (item) => `

            <div class="spl-report-point">

              <i class="fa-solid fa-check"></i>

              <div>

                <strong>
                  ${escapeReportHTML(
                    item.label
                  )}
                </strong>

                <span>
                  ${Math.round(
                    item.value
                  )}점
                </span>

              </div>

            </div>
          `
        )
        .join("")}

    </div>
  `;
}


/* =========================================================
   27. WEAKNESSES
========================================================= */

function createReportWeaknesses(
  record
) {

  const metrics =
    getReportMetrics(
      record
    );


  const weaknesses =
    metrics
      .filter(
        (item) =>
          item.value < 75
      )
      .sort(
        (a, b) =>
          a.value -
          b.value
      )
      .slice(
        0,
        4
      );


  if (!weaknesses.length) {

    return `

      <div class="spl-report-empty-data">
        주요 지표가 전반적으로 안정적인 수준입니다.
      </div>
    `;
  }


  return `

    <div class="spl-report-point-list warning">

      ${weaknesses
        .map(
          (item) => `

            <div class="spl-report-point">

              <i class="fa-solid fa-arrow-trend-up"></i>

              <div>

                <strong>
                  ${escapeReportHTML(
                    item.label
                  )}
                </strong>

                <span>
                  ${Math.round(
                    item.value
                  )}점 · 개선 권장
                </span>

              </div>

            </div>
          `
        )
        .join("")}

    </div>
  `;
}


/* =========================================================
   28. REPORT METRICS
========================================================= */

function getReportMetrics(
  record
) {

  return [

    {
      key:
        "alignment",

      label:
        "신체 정렬",

      value:
        safeReportNumber(
          record.alignment
        )
    },

    {
      key:
        "stability",

      label:
        "자세 안정성",

      value:
        safeReportNumber(
          record.stability
        )
    },

    {
      key:
        "balance",

      label:
        "좌우 균형",

      value:
        safeReportNumber(
          record.balance
        )
    },

    {
      key:
        "efficiency",

      label:
        "동작 효율",

      value:
        safeReportNumber(
          record.efficiency
        )
    }
  ];
}


/* =========================================================
   29. OPINION
========================================================= */

function createReportOpinion(
  record
) {

  const overall =
    record.opinion?.overall ||
    record.summary ||
    "저장된 종합 분석 의견이 없습니다.";


  const positive =
    record.opinion?.positive ||
    "";


  const improvement =
    record.opinion?.improvement ||
    "";


  return `

    <div class="spl-report-opinion-main">

      <i class="fa-solid fa-quote-left"></i>

      <p>
        ${escapeReportHTML(
          overall
        )}
      </p>

    </div>


    ${
      positive
        ? `

          <div class="spl-report-opinion-sub positive">

            <strong>
              강점 분석
            </strong>

            <p>
              ${escapeReportHTML(
                positive
              )}
            </p>

          </div>
        `
        : ""
    }


    ${
      improvement
        ? `

          <div class="spl-report-opinion-sub warning">

            <strong>
              개선 분석
            </strong>

            <p>
              ${escapeReportHTML(
                improvement
              )}
            </p>

          </div>
        `
        : ""
    }
  `;
}


/* =========================================================
   30. COMPARISON
========================================================= */

function createReportComparison(
  current,
  previous
) {

  const scoreChange =
    safeReportNumber(
      current.score
    ) -
    safeReportNumber(
      previous.score
    );


  return `

    <section class="spl-report-panel">

      ${createReportPanelHeader(
        "Previous Comparison",
        "이전 기록 비교",
        "fa-code-compare"
      )}

      <div class="spl-report-comparison">

        <div class="spl-report-comparison-score">

          <div>

            <span>
              이전
            </span>

            <strong>
              ${Math.round(
                safeReportNumber(
                  previous.score
                )
              )}
            </strong>

            <small>
              ${escapeReportHTML(
                formatReportDate(
                  previous.createdAt
                )
              )}
            </small>

          </div>


          <div
            class="spl-report-change ${
              scoreChange > 0
                ? "positive"
                : scoreChange < 0
                  ? "negative"
                  : "neutral"
            }"
          >

            <i class="fa-solid ${
              scoreChange > 0
                ? "fa-arrow-up"
                : scoreChange < 0
                  ? "fa-arrow-down"
                  : "fa-minus"
            }"></i>

            <strong>
              ${
                scoreChange > 0
                  ? "+"
                  : ""
              }${roundReportNumber(
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
                safeReportNumber(
                  current.score
                )
              )}
            </strong>

            <small>
              ${escapeReportHTML(
                formatReportDate(
                  current.createdAt
                )
              )}
            </small>

          </div>

        </div>


        <div class="spl-report-comparison-grid">

          ${createComparisonRow(
            "정렬",
            previous.alignment,
            current.alignment
          )}

          ${createComparisonRow(
            "안정성",
            previous.stability,
            current.stability
          )}

          ${createComparisonRow(
            "균형",
            previous.balance,
            current.balance
          )}

          ${createComparisonRow(
            "효율",
            previous.efficiency,
            current.efficiency
          )}

        </div>

      </div>

    </section>
  `;
}


/* =========================================================
   31. COMPARISON ROW
========================================================= */

function createComparisonRow(
  label,
  previous,
  current
) {

  const before =
    safeReportNumber(
      previous
    );


  const after =
    safeReportNumber(
      current
    );


  const difference =
    after - before;


  return `

    <div class="spl-report-comparison-row">

      <span>
        ${escapeReportHTML(
          label
        )}
      </span>

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

      <em
        class="${
          difference > 0
            ? "positive"
            : difference < 0
              ? "negative"
              : "neutral"
        }"
      >
        ${
          difference > 0
            ? "+"
            : ""
        }${roundReportNumber(
          difference,
          1
        )}
      </em>

    </div>
  `;
}


/* =========================================================
   32. NO COMPARISON
========================================================= */

function createNoComparison() {

  return `

    <section class="spl-report-panel">

      ${createReportPanelHeader(
        "Previous Comparison",
        "이전 기록 비교",
        "fa-code-compare"
      )}

      <div class="spl-report-empty-data">
        동일 선수의 이전 분석 기록이 없습니다.
        다음 분석부터 변화 추세를 비교할 수 있습니다.
      </div>

    </section>
  `;
}


/* =========================================================
   33. TRAINING RECOMMENDATIONS
========================================================= */

function createTrainingRecommendations(
  record
) {

  const metrics =
    getReportMetrics(
      record
    )
      .sort(
        (a, b) =>
          a.value -
          b.value
      );


  const recommendations =
    [];


  metrics
    .slice(
      0,
      2
    )
    .forEach(
      (metric) => {

        recommendations.push(
          getMetricRecommendation(
            metric.key
          )
        );
      }
    );


  if (
    record.angles?.shoulderTilt >
    6
  ) {

    recommendations.push(
      "상체 안정화와 어깨선 정렬을 위한 코어 및 견갑 안정화 훈련을 권장합니다."
    );
  }


  if (
    record.angles?.hipTilt >
    5
  ) {

    recommendations.push(
      "골반 안정성과 좌우 체중 분배를 위한 단측 하체 안정화 훈련을 권장합니다."
    );
  }


  const unique =
    [
      ...new Set(
        recommendations
          .filter(Boolean)
      )
    ].slice(
      0,
      4
    );


  return `

    <div class="spl-report-training-list">

      ${unique
        .map(
          (text, index) => `

            <div class="spl-report-training-item">

              <span>
                ${String(
                  index + 1
                ).padStart(
                  2,
                  "0"
                )}
              </span>

              <p>
                ${escapeReportHTML(
                  text
                )}
              </p>

            </div>
          `
        )
        .join("")}

    </div>
  `;
}


/* =========================================================
   34. METRIC RECOMMENDATION
========================================================= */

function getMetricRecommendation(
  key
) {

  const map = {

    alignment:
      "기본 자세에서 어깨·골반·무릎 정렬을 반복 확인하고 정확한 자세를 우선한 기술 훈련을 권장합니다.",

    stability:
      "코어 안정화와 한발 지지 훈련을 활용해 동작 중 중심 흔들림을 줄이는 훈련을 권장합니다.",

    balance:
      "좌우 체중 이동과 단측 움직임을 활용해 신체 좌우 균형을 개선하는 훈련을 권장합니다.",

    efficiency:
      "불필요한 상체 움직임을 줄이고 동작 연결을 부드럽게 만드는 반복 기술 훈련을 권장합니다."
  };


  return (
    map[key] ||
    "기본 움직임 패턴을 반복 확인하며 정확도를 높이는 훈련을 권장합니다."
  );
}


/* =========================================================
   35. REPORT FOOTER
========================================================= */

function createReportFooter(
  record
) {

  return `

    <footer class="spl-report-footer">

      <div>

        <strong>
          SEOLCHEON PERFORMANCE LAB
        </strong>

        <span>
          설천고등학교 스포츠과학 퍼포먼스 분석 시스템
        </span>

      </div>


      <div>

        <span>
          REPORT ID
        </span>

        <strong>
          ${escapeReportHTML(
            record.id
          )}
        </strong>

      </div>

    </footer>
  `;
}


/* =========================================================
   36. REPORT CHARTS
========================================================= */

function renderReportCharts(
  record
) {

  if (
    typeof Chart ===
    "undefined"
  ) {

    console.warn(
      "[REPORT] Chart.js is not loaded."
    );

    return;
  }


  renderReportRadarChart(
    record
  );
}


/* =========================================================
   37. RADAR CHART
========================================================= */

function renderReportRadarChart(
  record
) {

  const canvas =
    document.getElementById(
      "reportRadarChart"
    );


  if (!canvas) {
    return;
  }


  destroyReportRadarChart();


  const metrics =
    getReportMetrics(
      record
    );


  ReportManager.radarChart =
    new Chart(
      canvas,
      {
        type:
          "radar",

        data: {

          labels:
            metrics.map(
              (item) =>
                item.label
            ),

          datasets: [

            {
              label:
                "현재 퍼포먼스",

              data:
                metrics.map(
                  (item) =>
                    item.value
                ),

              borderWidth:
                3,

              pointRadius:
                4,

              pointHoverRadius:
                6
            }
          ]
        },


        options: {

          responsive:
            true,

          maintainAspectRatio:
            false,

          scales: {

            r: {

              beginAtZero:
                true,

              min:
                0,

              max:
                100,

              ticks: {

                stepSize:
                  20
              }
            }
          },

          plugins: {

            legend: {
              display:
                false
            }
          }
        }
      }
    );
}


/* =========================================================
   38. DESTROY RADAR
========================================================= */

function destroyReportRadarChart() {

  if (
    ReportManager.radarChart
  ) {

    ReportManager
      .radarChart
      .destroy();


    ReportManager.radarChart =
      null;
  }
}


/* =========================================================
   39. REPORT BUTTONS
========================================================= */

function initializeReportButtons() {

  document.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          "[data-report-action]"
        );


      if (!button) {
        return;
      }


      const action =
        button.dataset
          .reportAction;


      switch (action) {

        case "records":

          SPLApp.openPage(
            "records"
          );

          break;


        case "pose":

          SPLApp.openPage(
            "pose"
          );

          break;


        case "print":

          printPerformanceReport();

          break;


        case "refresh":

          refreshReport();

          break;
      }
    }
  );
}


/* =========================================================
   40. REPORT EVENTS
========================================================= */

function initializeReportEvents() {

  document.addEventListener(
    "spl:reportrecord",
    (event) => {

      const recordId =
        event.detail?.recordId;


      const athleteId =
        event.detail?.athleteId;


      if (recordId) {

        ReportManager.recordId =
          recordId;
      }


      if (athleteId) {

        ReportManager.athleteId =
          athleteId;
      }


      refreshReport();
    }
  );


  document.addEventListener(
    "spl:recordsupdated",
    () => {

      if (
        ReportManager.recordId
      ) {

        refreshReport();
      }
    }
  );


  document.addEventListener(
    "spl:athletesupdated",
    () => {

      if (
        ReportManager.record
      ) {

        refreshReport();
      }
    }
  );


  document.addEventListener(
    "spl:pagechange",
    (event) => {

      if (
        event.detail?.page ===
        "report"
      ) {

        refreshReport();
      }
    }
  );
}


/* =========================================================
   41. PRINT
========================================================= */

function printPerformanceReport() {

  if (
    !ReportManager.record
  ) {

    SPLApp.showToast(
      "출력할 리포트가 없습니다.",
      "warning"
    );

    return;
  }


  window.print();
}


/* =========================================================
   42. SCORE GRADE
========================================================= */

function getReportGrade(
  score
) {

  const value =
    safeReportNumber(
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
   43. LEVEL
========================================================= */

function getReportLevel(
  score
) {

  const value =
    safeReportNumber(
      score
    );


  if (value >= 90) {
    return "ELITE";
  }

  if (value >= 80) {
    return "EXCELLENT";
  }

  if (value >= 70) {
    return "GOOD";
  }

  if (value >= 60) {
    return "DEVELOPING";
  }

  return "FOCUS";
}


/* =========================================================
   44. METRIC LEVEL
========================================================= */

function getMetricLevel(
  value
) {

  const score =
    safeReportNumber(
      value
    );


  if (score >= 85) {
    return "excellent";
  }

  if (score >= 75) {
    return "good";
  }

  if (score >= 65) {
    return "normal";
  }

  return "warning";
}


/* =========================================================
   45. SAFE NUMBER
========================================================= */

function safeReportNumber(
  value,
  fallback = 0
) {

  const number =
    Number(
      value
    );


  return Number.isFinite(
    number
  )
    ? number
    : fallback;
}


/* =========================================================
   46. ROUND NUMBER
========================================================= */

function roundReportNumber(
  value,
  digits = 1
) {

  const number =
    safeReportNumber(
      value
    );


  const factor =
    10 ** digits;


  return (
    Math.round(
      number * factor
    ) / factor
  );
}


/* =========================================================
   47. ESCAPE HTML
========================================================= */

function escapeReportHTML(
  value
) {

  if (
    window.SPLApp &&
    typeof SPLApp.escapeHTML ===
      "function"
  ) {

    return SPLApp.escapeHTML(
      value
    );
  }


  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}


/* =========================================================
   48. INITIAL
========================================================= */

function getReportInitial(
  name
) {

  const text =
    String(
      name || ""
    ).trim();


  return (
    text.charAt(0) ||
    "S"
  );
}


/* =========================================================
   49. FORMAT DATE
========================================================= */

function formatReportDate(
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
   50. FORMAT DURATION
========================================================= */

function formatReportDuration(
  seconds
) {

  const value =
    Math.max(
      0,
      Math.round(
        safeReportNumber(
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
   51. GLOBAL API PART 1
========================================================= */

window.SPLReport = {

  state:
    ReportManager,

  refresh:
    refreshReport,

  getRecord:
    getReportRecord,

  print:
    printPerformanceReport
};


/* =========================================================
   END OF report.js PART 1
========================================================= */
/* =========================================================
   SEOLCHEON PERFORMANCE LAB
   report.js

   PART 2 / 2
   Trend / Comparison / Quality / Summary / Export / Safety
========================================================= */


/* =========================================================
   52. EXTEND REPORT STATE
========================================================= */

ReportManager.trendChart = null;

ReportManager.comparisonChart = null;

ReportManager.reportReady = false;


/* =========================================================
   53. ATHLETE REPORT RECORDS
========================================================= */

function getReportAthleteRecords(
  record = ReportManager.record
) {

  if (!record) {
    return [];
  }


  const records =
    SPLApp.getRecords();


  return records
    .filter(
      (item) => {

        if (
          !item ||
          item.type !== "pose"
        ) {

          return false;
        }


        if (
          record.athleteId
        ) {

          return (
            item.athleteId ===
            record.athleteId
          );
        }


        return (
          item.athleteName ===
          record.athleteName
        );
      }
    )
    .sort(
      (a, b) =>
        getReportTimestamp(a) -
        getReportTimestamp(b)
    );
}


/* =========================================================
   54. SAME MOVEMENT RECORDS
========================================================= */

function getSameMovementReportRecords(
  record = ReportManager.record
) {

  if (!record) {
    return [];
  }


  const sport =
    record.sport ||
    record.sportLabel;


  const movement =
    record.movement ||
    record.movementLabel;


  return getReportAthleteRecords(
    record
  )
    .filter(
      (item) => {

        const itemSport =
          item.sport ||
          item.sportLabel;


        const itemMovement =
          item.movement ||
          item.movementLabel;


        return (
          itemSport === sport &&
          itemMovement === movement &&
          item.viewMode ===
            record.viewMode
        );
      }
    );
}


/* =========================================================
   55. CREATE TREND SECTION
========================================================= */

function createReportTrendSection(
  record
) {

  const records =
    getSameMovementReportRecords(
      record
    );


  if (
    records.length < 2
  ) {

    return `
      <section class="spl-report-panel">

        ${createReportPanelHeader(
          "Performance Trend",
          "퍼포먼스 변화 추세",
          "fa-chart-line"
        )}

        <div class="spl-report-empty-data">
          동일 종목·동작·촬영 방향의 분석 기록이
          2회 이상 저장되면 변화 추세가 표시됩니다.
        </div>

      </section>
    `;
  }


  return `
    <section class="spl-report-panel">

      ${createReportPanelHeader(
        "Performance Trend",
        "퍼포먼스 변화 추세",
        "fa-chart-line"
      )}

      <div class="spl-report-trend-summary">

        ${createTrendReportSummary(
          records
        )}

      </div>

      <div class="spl-report-chart-wrap trend">

        <canvas
          id="reportTrendChart"
        ></canvas>

      </div>

    </section>
  `;
}


/* =========================================================
   56. TREND SUMMARY
========================================================= */

function createTrendReportSummary(
  records
) {

  if (!records.length) {
    return "";
  }


  const first =
    records[0];


  const latest =
    records[
      records.length - 1
    ];


  const change =
    safeReportNumber(
      latest.score
    ) -
    safeReportNumber(
      first.score
    );


  const scores =
    records.map(
      (record) =>
        safeReportNumber(
          record.score
        )
    );


  const average =
    scores.reduce(
      (sum, value) =>
        sum + value,
      0
    ) /
    Math.max(
      1,
      scores.length
    );


  const best =
    Math.max(
      ...scores
    );


  return `

    <div class="spl-report-trend-stat">

      <span>
        분석 횟수
      </span>

      <strong>
        ${records.length}
      </strong>

    </div>


    <div class="spl-report-trend-stat">

      <span>
        평균
      </span>

      <strong>
        ${roundReportNumber(
          average,
          1
        )}
      </strong>

    </div>


    <div class="spl-report-trend-stat">

      <span>
        최고
      </span>

      <strong>
        ${roundReportNumber(
          best,
          1
        )}
      </strong>

    </div>


    <div
      class="spl-report-trend-stat ${
        change > 0
          ? "positive"
          : change < 0
            ? "negative"
            : ""
      }"
    >

      <span>
        최초 대비
      </span>

      <strong>
        ${
          change > 0
            ? "+"
            : ""
        }${roundReportNumber(
          change,
          1
        )}
      </strong>

    </div>
  `;
}


/* =========================================================
   57. INSERT TREND SECTION
========================================================= */

function insertReportTrendSection() {

  const report =
    document.querySelector(
      ".spl-performance-report"
    );


  if (
    !report ||
    !ReportManager.record
  ) {

    return;
  }


  const oldSection =
    document.getElementById(
      "splGeneratedTrendSection"
    );


  oldSection?.remove();


  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.id =
    "splGeneratedTrendSection";


  wrapper.innerHTML =
    createReportTrendSection(
      ReportManager.record
    );


  const footer =
    report.querySelector(
      ".spl-report-footer"
    );


  if (footer) {

    report.insertBefore(
      wrapper,
      footer
    );

  } else {

    report.appendChild(
      wrapper
    );
  }
}


/* =========================================================
   58. RENDER TREND CHART
========================================================= */

function renderReportTrendChart() {

  destroyReportTrendChart();


  const canvas =
    document.getElementById(
      "reportTrendChart"
    );


  if (
    !canvas ||
    typeof Chart ===
      "undefined" ||
    !ReportManager.record
  ) {

    return;
  }


  const records =
    getSameMovementReportRecords(
      ReportManager.record
    );


  if (
    records.length < 2
  ) {

    return;
  }


  const labels =
    records.map(
      (record) =>
        formatReportShortDate(
          record.createdAt
        )
    );


  ReportManager.trendChart =
    new Chart(
      canvas,
      {
        type:
          "line",

        data: {

          labels,

          datasets: [

            {
              label:
                "종합점수",

              data:
                records.map(
                  (record) =>
                    safeReportNumber(
                      record.score
                    )
                ),

              borderWidth:
                3,

              tension:
                0.3,

              pointRadius:
                4,

              pointHoverRadius:
                6
            },


            {
              label:
                "안정성",

              data:
                records.map(
                  (record) =>
                    safeReportNumber(
                      record.stability
                    )
                ),

              borderWidth:
                2,

              tension:
                0.3,

              pointRadius:
                2
            },


            {
              label:
                "균형",

              data:
                records.map(
                  (record) =>
                    safeReportNumber(
                      record.balance
                    )
                ),

              borderWidth:
                2,

              tension:
                0.3,

              pointRadius:
                2
            },


            {
              label:
                "효율",

              data:
                records.map(
                  (record) =>
                    safeReportNumber(
                      record.efficiency
                    )
                ),

              borderWidth:
                2,

              tension:
                0.3,

              pointRadius:
                2
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

              min:
                0,

              max:
                100,

              ticks: {

                stepSize:
                  20
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
}


/* =========================================================
   59. DESTROY TREND CHART
========================================================= */

function destroyReportTrendChart() {

  if (
    ReportManager.trendChart
  ) {

    ReportManager
      .trendChart
      .destroy();


    ReportManager.trendChart =
      null;
  }
}


/* =========================================================
   60. SHORT DATE
========================================================= */

function formatReportShortDate(
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
   61. ANALYSIS QUALITY
========================================================= */

function calculateReportQuality(
  record
) {

  if (!record) {

    return {
      score: 0,
      level: "low",
      label: "데이터 없음",
      message:
        "분석 데이터가 없습니다."
    };
  }


  const confidence =
    safeReportNumber(
      record.confidence
    );


  const frames =
    safeReportNumber(
      record.frames
    );


  const duration =
    safeReportNumber(
      record.duration
    );


  let score =
    confidence * 0.65;


  if (
    frames >= 30
  ) {

    score += 20;

  } else if (
    frames >= 15
  ) {

    score += 15;

  } else if (
    frames >= 5
  ) {

    score += 8;
  }


  if (
    duration >= 5
  ) {

    score += 15;

  } else if (
    duration >= 2
  ) {

    score += 8;
  }


  score =
    Math.max(
      0,
      Math.min(
        100,
        score
      )
    );


  if (
    score >= 85
  ) {

    return {
      score:
        roundReportNumber(
          score,
          1
        ),

      level:
        "high",

      label:
        "높음",

      message:
        "충분한 인식 데이터가 확보되어 분석 신뢰도가 높은 편입니다."
    };
  }


  if (
    score >= 65
  ) {

    return {
      score:
        roundReportNumber(
          score,
          1
        ),

      level:
        "normal",

      label:
        "보통",

      message:
        "분석 가능한 데이터가 확보되었지만 반복 측정으로 신뢰도를 높일 수 있습니다."
    };
  }


  return {
    score:
      roundReportNumber(
        score,
        1
      ),

    level:
      "low",

    label:
      "낮음",

    message:
      "인식 데이터가 부족할 수 있어 동일 동작을 다시 분석하는 것이 좋습니다."
  };
}


/* =========================================================
   62. QUALITY SECTION
========================================================= */

function createReportQualitySection(
  record
) {

  const quality =
    calculateReportQuality(
      record
    );


  return `

    <section class="spl-report-panel">

      ${createReportPanelHeader(
        "Analysis Reliability",
        "분석 신뢰도",
        "fa-shield-halved"
      )}

      <div
        class="spl-report-quality"
        data-quality="${escapeReportHTML(
          quality.level
        )}"
      >

        <div class="spl-report-quality-score">

          <strong>
            ${quality.score}
          </strong>

          <span>
            / 100
          </span>

        </div>


        <div class="spl-report-quality-content">

          <div>

            <span>
              DATA QUALITY
            </span>

            <strong>
              ${escapeReportHTML(
                quality.label
              )}
            </strong>

          </div>


          <p>
            ${escapeReportHTML(
              quality.message
            )}
          </p>


          <div class="spl-report-quality-bar">

            <span
              style="width:${quality.score}%"
            ></span>

          </div>

        </div>

      </div>

    </section>
  `;
}


/* =========================================================
   63. INSERT QUALITY
========================================================= */

function insertReportQualitySection() {

  const report =
    document.querySelector(
      ".spl-performance-report"
    );


  if (
    !report ||
    !ReportManager.record
  ) {

    return;
  }


  document
    .getElementById(
      "splGeneratedQualitySection"
    )
    ?.remove();


  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.id =
    "splGeneratedQualitySection";


  wrapper.innerHTML =
    createReportQualitySection(
      ReportManager.record
    );


  const trend =
    document.getElementById(
      "splGeneratedTrendSection"
    );


  if (trend) {

    report.insertBefore(
      wrapper,
      trend
    );

  } else {

    const footer =
      report.querySelector(
        ".spl-report-footer"
      );


    if (footer) {

      report.insertBefore(
        wrapper,
        footer
      );

    } else {

      report.appendChild(
        wrapper
      );
    }
  }
}


/* =========================================================
   64. FINAL REPORT SUMMARY
========================================================= */

function createFinalReportSummary(
  record,
  previous
) {

  if (!record) {
    return "";
  }


  const metrics =
    getReportMetrics(
      record
    )
      .slice()
      .sort(
        (a, b) =>
          b.value -
          a.value
      );


  const best =
    metrics[0];


  const weakest =
    metrics[
      metrics.length - 1
    ];


  const score =
    safeReportNumber(
      record.score
    );


  let text =
    `현재 종합 퍼포먼스 점수는 ${Math.round(
      score
    )}점으로 ${getReportKoreanLevel(
      score
    )} 수준입니다.`;


  if (best) {

    text +=
      ` 가장 높은 항목은 ${best.label} ${Math.round(
        best.value
      )}점입니다.`;
  }


  if (weakest) {

    text +=
      ` 우선 확인할 항목은 ${weakest.label} ${Math.round(
        weakest.value
      )}점입니다.`;
  }


  if (previous) {

    const change =
      score -
      safeReportNumber(
        previous.score
      );


    if (
      change >= 3
    ) {

      text +=
        ` 이전 동일 분석 대비 ${roundReportNumber(
          change,
          1
        )}점 향상되었습니다.`;

    } else if (
      change <= -3
    ) {

      text +=
        ` 이전 동일 분석 대비 ${Math.abs(
          roundReportNumber(
            change,
            1
          )
        )}점 낮아져 변화 원인을 확인할 필요가 있습니다.`;

    } else {

      text +=
        " 이전 분석과 비교하면 전체 퍼포먼스는 비슷한 수준을 유지하고 있습니다.";
    }
  }


  return text;
}


/* =========================================================
   65. KOREAN LEVEL
========================================================= */

function getReportKoreanLevel(
  score
) {

  const value =
    safeReportNumber(
      score
    );


  if (value >= 90) {
    return "매우 우수";
  }

  if (value >= 80) {
    return "우수";
  }

  if (value >= 70) {
    return "양호";
  }

  if (value >= 60) {
    return "보완 필요";
  }

  return "집중 개선 필요";
}


/* =========================================================
   66. FINAL SUMMARY SECTION
========================================================= */

function createFinalSummarySection(
  record,
  previous
) {

  return `

    <section
      class="spl-report-panel spl-report-final-summary"
    >

      ${createReportPanelHeader(
        "Executive Summary",
        "최종 분석 요약",
        "fa-clipboard-check"
      )}

      <div class="spl-report-final-summary-content">

        <div class="spl-report-final-score">

          <strong>
            ${Math.round(
              safeReportNumber(
                record.score
              )
            )}
          </strong>

          <span>
            ${
              record.grade ||
              getReportGrade(
                record.score
              )
            }
          </span>

        </div>


        <p>
          ${escapeReportHTML(
            createFinalReportSummary(
              record,
              previous
            )
          )}
        </p>

      </div>

    </section>
  `;
}


/* =========================================================
   67. INSERT FINAL SUMMARY
========================================================= */

function insertFinalSummarySection() {

  const report =
    document.querySelector(
      ".spl-performance-report"
    );


  if (
    !report ||
    !ReportManager.record
  ) {

    return;
  }


  document
    .getElementById(
      "splGeneratedFinalSummary"
    )
    ?.remove();


  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.id =
    "splGeneratedFinalSummary";


  wrapper.innerHTML =
    createFinalSummarySection(
      ReportManager.record,
      ReportManager.previousRecord
    );


  const hero =
    report.querySelector(
      ".spl-report-hero"
    );


  if (hero) {

    hero.insertAdjacentElement(
      "afterend",
      wrapper
    );

  } else {

    report.prepend(
      wrapper
    );
  }
}


/* =========================================================
   68. REPORT TOOLBAR
========================================================= */

function createReportToolbar() {

  return `

    <div
      class="spl-report-toolbar"
      id="reportToolbar"
    >

      <div class="spl-report-toolbar-left">

        <button
          type="button"
          data-report-action="records"
        >
          <i class="fa-solid fa-arrow-left"></i>
          기록
        </button>

      </div>


      <div class="spl-report-toolbar-right">

        <button
          type="button"
          data-report-action="refresh"
        >
          <i class="fa-solid fa-rotate"></i>
          새로고침
        </button>


        <button
          type="button"
          data-report-action="pose"
        >
          <i class="fa-solid fa-person-running"></i>
          다시 분석
        </button>


        <button
          type="button"
          class="primary"
          data-report-action="print"
        >
          <i class="fa-solid fa-print"></i>
          리포트 출력
        </button>

      </div>

    </div>
  `;
}


/* =========================================================
   69. INSERT TOOLBAR
========================================================= */

function insertReportToolbar() {

  const root =
    getReportRoot();


  if (
    !root ||
    !ReportManager.record
  ) {

    return;
  }


  document
    .getElementById(
      "reportToolbar"
    )
    ?.remove();


  root.insertAdjacentHTML(
    "afterbegin",
    createReportToolbar()
  );
}


/* =========================================================
   70. CURRENT VS PREVIOUS CHART SECTION
========================================================= */

function createComparisonChartSection(
  record,
  previous
) {

  if (!previous) {
    return "";
  }


  return `

    <section class="spl-report-panel">

      ${createReportPanelHeader(
        "Performance Comparison",
        "세부 퍼포먼스 비교",
        "fa-chart-column"
      )}

      <div
        class="spl-report-chart-wrap comparison"
      >

        <canvas
          id="reportComparisonChart"
        ></canvas>

      </div>

    </section>
  `;
}


/* =========================================================
   71. INSERT COMPARISON CHART
========================================================= */

function insertComparisonChartSection() {

  const report =
    document.querySelector(
      ".spl-performance-report"
    );


  if (
    !report ||
    !ReportManager.record ||
    !ReportManager.previousRecord
  ) {

    return;
  }


  document
    .getElementById(
      "splGeneratedComparisonChart"
    )
    ?.remove();


  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.id =
    "splGeneratedComparisonChart";


  wrapper.innerHTML =
    createComparisonChartSection(
      ReportManager.record,
      ReportManager.previousRecord
    );


  const quality =
    document.getElementById(
      "splGeneratedQualitySection"
    );


  if (quality) {

    quality.insertAdjacentElement(
      "beforebegin",
      wrapper
    );

  } else {

    const footer =
      report.querySelector(
        ".spl-report-footer"
      );


    if (footer) {

      report.insertBefore(
        wrapper,
        footer
      );

    } else {

      report.appendChild(
        wrapper
      );
    }
  }
}


/* =========================================================
   72. RENDER COMPARISON CHART
========================================================= */

function renderReportComparisonChart() {

  destroyReportComparisonChart();


  const canvas =
    document.getElementById(
      "reportComparisonChart"
    );


  const current =
    ReportManager.record;


  const previous =
    ReportManager.previousRecord;


  if (
    !canvas ||
    !current ||
    !previous ||
    typeof Chart ===
      "undefined"
  ) {

    return;
  }


  const currentMetrics =
    getReportMetrics(
      current
    );


  const previousMetrics =
    getReportMetrics(
      previous
    );


  ReportManager.comparisonChart =
    new Chart(
      canvas,
      {
        type:
          "bar",

        data: {

          labels:
            currentMetrics.map(
              (item) =>
                item.label
            ),

          datasets: [

            {
              label:
                "이전",

              data:
                previousMetrics.map(
                  (item) =>
                    item.value
                ),

              borderWidth:
                1
            },


            {
              label:
                "현재",

              data:
                currentMetrics.map(
                  (item) =>
                    item.value
                ),

              borderWidth:
                1
            }
          ]
        },


        options: {

          responsive:
            true,

          maintainAspectRatio:
            false,

          scales: {

            y: {

              min:
                0,

              max:
                100,

              ticks: {

                stepSize:
                  20
              }
            }
          }
        }
      }
    );
}


/* =========================================================
   73. DESTROY COMPARISON CHART
========================================================= */

function destroyReportComparisonChart() {

  if (
    ReportManager.comparisonChart
  ) {

    ReportManager
      .comparisonChart
      .destroy();


    ReportManager.comparisonChart =
      null;
  }
}


/* =========================================================
   74. REPORT EXPORT OBJECT
========================================================= */

function exportPerformanceReport() {

  const record =
    ReportManager.record;


  if (!record) {

    SPLApp.showToast(
      "내보낼 리포트가 없습니다.",
      "warning"
    );

    return null;
  }


  const athlete =
    ReportManager.athlete;


  const previous =
    ReportManager.previousRecord;


  const trend =
    getSameMovementReportRecords(
      record
    );


  return {

    system:
      "SEOLCHEON PERFORMANCE LAB",

    school:
      "설천고등학교",

    reportType:
      "PERFORMANCE ANALYSIS REPORT",

    version:
      "1.0",

    exportedAt:
      new Date()
        .toISOString(),


    athlete:
      athlete
        ? {
            id:
              athlete.id,

            name:
              athlete.name,

            grade:
              athlete.grade,

            sport:
              athlete.sport
          }
        : {
            id:
              record.athleteId ||
              "",

            name:
              record.athleteName ||
              "미지정 선수"
          },


    analysis: {
      ...record
    },


    quality:
      calculateReportQuality(
        record
      ),


    summary:
      createFinalReportSummary(
        record,
        previous
      ),


    previous:
      previous
        ? {
            id:
              previous.id,

            score:
              previous.score,

            createdAt:
              previous.createdAt
          }
        : null,


    trend:
      trend.map(
        (item) => ({
          id:
            item.id,

          score:
            item.score,

          stability:
            item.stability,

          balance:
            item.balance,

          efficiency:
            item.efficiency,

          alignment:
            item.alignment,

          createdAt:
            item.createdAt
        })
      )
  };
}


/* =========================================================
   75. DOWNLOAD JSON
========================================================= */

function downloadPerformanceReportJSON() {

  const data =
    exportPerformanceReport();


  if (!data) {
    return;
  }


  try {

    const json =
      JSON.stringify(
        data,
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


    const athleteName =
      data.athlete?.name ||
      "athlete";


    const date =
      new Date()
        .toISOString()
        .slice(
          0,
          10
        );


    link.href =
      url;


    link.download =
      `Seolcheon_${sanitizeReportFilename(
        athleteName
      )}_${date}.json`;


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


    SPLApp.showToast(
      "리포트 데이터를 내보냈습니다."
    );

  } catch (error) {

    console.error(
      "[REPORT] Export error:",
      error
    );


    SPLApp.showToast(
      "리포트 내보내기에 실패했습니다.",
      "error"
    );
  }
}


/* =========================================================
   76. SAFE FILE NAME
========================================================= */

function sanitizeReportFilename(
  value
) {

  return String(
    value || "athlete"
  )
    .trim()
    .replace(
      /[\\/:*?"<>|]/g,
      "_"
    )
    .replace(
      /\s+/g,
      "_"
    );
}


/* =========================================================
   77. EXPORT BUTTON
========================================================= */

function insertReportExportButton() {

  const toolbar =
    document.getElementById(
      "reportToolbar"
    );


  if (!toolbar) {
    return;
  }


  const right =
    toolbar.querySelector(
      ".spl-report-toolbar-right"
    );


  if (
    !right ||
    right.querySelector(
      '[data-report-action="export"]'
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


  button.dataset.reportAction =
    "export";


  button.innerHTML = `
    <i class="fa-solid fa-download"></i>
    데이터
  `;


  right.insertBefore(
    button,
    right.lastElementChild
  );
}


/* =========================================================
   78. EXPORT ACTION
========================================================= */

document.addEventListener(
  "click",
  (event) => {

    const button =
      event.target.closest(
        '[data-report-action="export"]'
      );


    if (!button) {
      return;
    }


    downloadPerformanceReportJSON();
  }
);


/* =========================================================
   79. REPORT VALIDATION
========================================================= */

function validateReportRecord(
  record
) {

  const errors = [];

  const warnings = [];


  if (!record) {

    errors.push(
      "분석 기록이 없습니다."
    );


    return {
      valid: false,
      errors,
      warnings
    };
  }


  if (!record.id) {

    errors.push(
      "기록 ID가 없습니다."
    );
  }


  if (
    record.score === undefined ||
    record.score === null
  ) {

    errors.push(
      "종합점수가 없습니다."
    );
  }


  if (!record.createdAt) {

    warnings.push(
      "분석 날짜 정보가 없습니다."
    );
  }


  if (
    !record.athleteId &&
    !record.athleteName
  ) {

    warnings.push(
      "선수 정보가 없습니다."
    );
  }


  if (
    safeReportNumber(
      record.confidence
    ) < 50
  ) {

    warnings.push(
      "신체 인식 정확도가 낮습니다."
    );
  }


  return {
    valid:
      errors.length === 0,

    errors,
    warnings
  };
}


/* =========================================================
   80. REPORT ERROR
========================================================= */

function renderReportError(
  message
) {

  const root =
    getReportRoot();


  if (!root) {
    return;
  }


  root.innerHTML = `

    <div class="spl-report-empty">

      <div class="spl-report-empty-icon">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>

      <h2>
        리포트를 불러올 수 없습니다
      </h2>

      <p>
        ${escapeReportHTML(
          message ||
          "분석 기록을 확인해주세요."
        )}
      </p>

      <button
        type="button"
        data-report-action="records"
      >
        분석 기록으로 돌아가기
      </button>

    </div>
  `;
}


/* =========================================================
   81. ENHANCED REFRESH
========================================================= */

const originalRefreshReport =
  refreshReport;


refreshReport =
  function () {

    destroyReportTrendChart();

    destroyReportComparisonChart();

    destroyReportRadarChart();


    originalRefreshReport();


    const record =
      ReportManager.record;


    if (!record) {

      ReportManager.reportReady =
        false;

      return;
    }


    const validation =
      validateReportRecord(
        record
      );


    if (
      !validation.valid
    ) {

      renderReportError(
        validation.errors.join(
          " "
        )
      );


      ReportManager.reportReady =
        false;

      return;
    }


    insertReportToolbar();

    insertFinalSummarySection();

    insertComparisonChartSection();

    insertReportQualitySection();

    insertReportTrendSection();

    insertReportExportButton();


    /*
      DOM 생성 이후 차트 생성
    */

    requestAnimationFrame(
      () => {

        renderReportCharts(
          record
        );

        renderReportComparisonChart();

        renderReportTrendChart();
      }
    );


    ReportManager.reportReady =
      true;
  };


/* =========================================================
   82. PRINT PREPARATION
========================================================= */

function prepareReportForPrint() {

  if (
    !ReportManager.record
  ) {

    return false;
  }


  document.body.classList.add(
    "spl-report-printing"
  );


  document
    .querySelectorAll(
      ".spl-report-toolbar"
    )
    .forEach(
      (element) => {

        element.setAttribute(
          "data-print-hidden",
          "true"
        );
      }
    );


  return true;
}


/* =========================================================
   83. PRINT CLEANUP
========================================================= */

function cleanupReportAfterPrint() {

  document.body.classList.remove(
    "spl-report-printing"
  );


  document
    .querySelectorAll(
      "[data-print-hidden]"
    )
    .forEach(
      (element) => {

        element.removeAttribute(
          "data-print-hidden"
        );
      }
    );
}


/* =========================================================
   84. REPLACE PRINT
========================================================= */

printPerformanceReport =
  function () {

    if (
      !ReportManager.record
    ) {

      SPLApp.showToast(
        "출력할 리포트가 없습니다.",
        "warning"
      );

      return;
    }


    prepareReportForPrint();


    setTimeout(
      () => {

        window.print();

      },
      100
    );
  };


/* =========================================================
   85. AFTER PRINT
========================================================= */

window.addEventListener(
  "afterprint",
  () => {

    cleanupReportAfterPrint();
  }
);


/* =========================================================
   86. BEFORE PRINT
========================================================= */

window.addEventListener(
  "beforeprint",
  () => {

    prepareReportForPrint();
  }
);


/* =========================================================
   87. KEYBOARD SHORTCUTS
========================================================= */

function initializeReportKeyboard() {

  document.addEventListener(
    "keydown",
    (event) => {

      const active =
        document.activeElement;


      if (
        active &&
        (
          active.tagName ===
            "INPUT" ||
          active.tagName ===
            "TEXTAREA" ||
          active.tagName ===
            "SELECT"
        )
      ) {

        return;
      }


      /*
        Ctrl / Cmd + P
      */

      if (
        (
          event.ctrlKey ||
          event.metaKey
        ) &&
        event.key
          .toLowerCase() ===
          "p"
      ) {

        if (
          ReportManager.record
        ) {

          event.preventDefault();

          printPerformanceReport();
        }
      }


      /*
        R = refresh
      */

      if (
        !event.ctrlKey &&
        !event.metaKey &&
        event.key
          .toLowerCase() ===
          "r"
      ) {

        const page =
          document.querySelector(
            '[data-page="report"].active'
          );


        if (page) {

          refreshReport();
        }
      }
    }
  );
}


/* =========================================================
   88. STORAGE CHANGE
========================================================= */

window.addEventListener(
  "storage",
  (event) => {

    if (
      event.key &&
      (
        event.key.includes(
          "record"
        ) ||
        event.key.includes(
          "athlete"
        )
      )
    ) {

      if (
        ReportManager.recordId
      ) {

        refreshReport();
      }
    }
  }
);


/* =========================================================
   89. REPORT RECORD EVENT SAFETY
========================================================= */

document.addEventListener(
  "spl:reportrecord",
  (event) => {

    const detail =
      event.detail || {};


    if (
      detail.recordId
    ) {

      ReportManager.recordId =
        detail.recordId;


      sessionStorage.setItem(
        "spl_report_record",
        detail.recordId
      );
    }


    if (
      detail.athleteId
    ) {

      ReportManager.athleteId =
        detail.athleteId;


      sessionStorage.setItem(
        "spl_report_athlete",
        detail.athleteId
      );
    }
  }
);


/* =========================================================
   90. GET REPORT STATUS
========================================================= */

function getReportStatus() {

  return {

    initialized:
      ReportManager.initialized,

    ready:
      ReportManager.reportReady,

    recordId:
      ReportManager.recordId,

    athleteId:
      ReportManager.athleteId,

    hasRecord:
      Boolean(
        ReportManager.record
      ),

    hasAthlete:
      Boolean(
        ReportManager.athlete
      ),

    hasPrevious:
      Boolean(
        ReportManager.previousRecord
      ),

    hasTrend:
      getSameMovementReportRecords()
        .length >= 2
  };
}


/* =========================================================
   91. DESTROY REPORT
========================================================= */

function destroyReport() {

  destroyReportRadarChart();

  destroyReportTrendChart();

  destroyReportComparisonChart();


  ReportManager.record =
    null;

  ReportManager.athlete =
    null;

  ReportManager.previousRecord =
    null;

  ReportManager.reportReady =
    false;
}


/* =========================================================
   92. SECONDARY INITIALIZATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initializeReportKeyboard();
  }
);


/* =========================================================
   93. EXTEND GLOBAL REPORT API
========================================================= */

Object.assign(
  window.SPLReport,
  {

    refresh:
      () => refreshReport(),

    print:
      () => printPerformanceReport(),

    export:
      exportPerformanceReport,

    downloadJSON:
      downloadPerformanceReportJSON,

    quality:
      calculateReportQuality,

    summary:
      createFinalReportSummary,

    athleteRecords:
      getReportAthleteRecords,

    movementRecords:
      getSameMovementReportRecords,

    status:
      getReportStatus,

    destroy:
      destroyReport
  }
);


/* =========================================================
   94. REPORT READY EVENT
========================================================= */

document.dispatchEvent(
  new CustomEvent(
    "spl:reportready",
    {
      detail: {

        module:
          "report",

        version:
          "1.0",

        system:
          "SEOLCHEON PERFORMANCE LAB"
      }
    }
  )
);


/* =========================================================
   END OF report.js
========================================================= */