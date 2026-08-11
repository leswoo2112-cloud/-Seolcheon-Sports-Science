/* =========================================================
   SEOLCHEON PERFORMANCE LAB
   athletes.js

   PART 1
   Athlete Registration / Photo / Save / Athlete List
========================================================= */

"use strict";


/* =========================================================
   01. ATHLETE MODULE STATE
========================================================= */

const AthleteManager = {
  photoData: "",
  editingId: null,
  initialized: false
};


/* =========================================================
   02. INITIALIZE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    initializeAthleteManager();
  }
);


document.addEventListener(
  "spl:systemready",
  () => {
    initializeAthleteManager();
  }
);


function initializeAthleteManager() {
  if (AthleteManager.initialized) {
    refreshAthleteModule();
    return;
  }

  initializeAthletePhoto();
  initializeAthleteForm();
  initializeAthleteSearch();
  initializeAthleteFilters();
  initializeAthleteListActions();

  refreshAthleteModule();

  AthleteManager.initialized = true;
}


/* =========================================================
   03. DOM HELPERS
========================================================= */

function getAthleteForm() {
  return document.getElementById(
    "athleteRegisterForm"
  );
}


function getAthletePhotoInput() {
  return document.getElementById(
    "athletePhoto"
  );
}


function getAthleteAvatarPreview() {
  return document.getElementById(
    "athleteAvatarPreview"
  );
}


function getAthleteListContainer() {
  return document.getElementById(
    "athleteList"
  );
}


/* =========================================================
   04. PHOTO INPUT
========================================================= */

function initializeAthletePhoto() {
  const input =
    getAthletePhotoInput();

  if (!input) return;

  input.addEventListener(
    "change",
    handleAthletePhotoChange
  );
}


async function handleAthletePhotoChange(
  event
) {
  const file =
    event.target.files?.[0];

  if (!file) {
    return;
  }

  if (
    !file.type.startsWith("image/")
  ) {
    SPLApp.showToast(
      "이미지 파일을 선택해주세요.",
      "warning"
    );

    event.target.value = "";

    return;
  }

  /*
    LocalStorage에 사진을 저장하므로
    지나치게 큰 사진은 제한한다.
  */

  const maxSize =
    4 * 1024 * 1024;

  if (file.size > maxSize) {
    SPLApp.showToast(
      "선수 사진은 4MB 이하로 선택해주세요.",
      "warning"
    );

    event.target.value = "";

    return;
  }

  try {
    const dataURL =
      await SPLApp.fileToDataURL(
        file
      );

    AthleteManager.photoData =
      dataURL;

    renderAthletePhotoPreview(
      dataURL
    );

    SPLApp.showToast(
      "선수 사진이 선택되었습니다."
    );
  } catch (error) {
    console.error(
      "[ATHLETE] Photo error:",
      error
    );

    SPLApp.showToast(
      "사진을 불러오지 못했습니다.",
      "error"
    );
  }
}


/* =========================================================
   05. PHOTO PREVIEW
========================================================= */

function renderAthletePhotoPreview(
  photo
) {
  const preview =
    getAthleteAvatarPreview();

  if (!preview) return;

  if (!photo) {
    preview.innerHTML = `
      <i class="fa-solid fa-user"></i>
    `;

    return;
  }

  preview.innerHTML = `
    <img
      src="${photo}"
      alt="선수 프로필 사진"
    >
  `;
}


/* =========================================================
   06. ATHLETE FORM
========================================================= */

function initializeAthleteForm() {
  const form =
    getAthleteForm();

  if (!form) return;

  form.addEventListener(
    "submit",
    handleAthleteSubmit
  );

  form.addEventListener(
    "reset",
    () => {
      /*
        reset 이벤트 직후에는
        input 값이 아직 초기화 전일 수 있어서
        다음 프레임에서 상태를 정리한다.
      */

      setTimeout(
        () => {
          resetAthleteEditor();
        },
        0
      );
    }
  );
}


/* =========================================================
   07. READ FORM DATA
========================================================= */

function readAthleteFormData() {
  const name =
    document
      .getElementById(
        "athleteName"
      )
      ?.value
      .trim() || "";

  const number =
    document
      .getElementById(
        "athleteNumber"
      )
      ?.value
      .trim() || "";

  const grade =
    document
      .getElementById(
        "athleteGrade"
      )
      ?.value || "";

  const gender =
    document
      .getElementById(
        "athleteGender"
      )
      ?.value || "";

  const sport =
    document
      .getElementById(
        "athleteSport"
      )
      ?.value
      .trim() || "";

  const position =
    document
      .getElementById(
        "athletePosition"
      )
      ?.value
      .trim() || "";

  const height =
    SPLApp.safeNumber(
      document
        .getElementById(
          "athleteHeight"
        )
        ?.value,
      0
    );

  const weight =
    SPLApp.safeNumber(
      document
        .getElementById(
          "athleteWeight"
        )
        ?.value,
      0
    );

  const memo =
    document
      .getElementById(
        "athleteMemo"
      )
      ?.value
      .trim() || "";

  return {
    name,
    number,
    grade,
    gender,
    sport,
    position,
    height,
    weight,
    memo,
    photo:
      AthleteManager.photoData
  };
}


/* =========================================================
   08. FORM VALIDATION
========================================================= */

function validateAthleteData(
  data
) {
  if (!data.name) {
    SPLApp.showToast(
      "선수 이름을 입력해주세요.",
      "warning"
    );

    document
      .getElementById(
        "athleteName"
      )
      ?.focus();

    return false;
  }

  if (
    data.height < 0 ||
    data.weight < 0
  ) {
    SPLApp.showToast(
      "신장과 체중을 다시 확인해주세요.",
      "warning"
    );

    return false;
  }

  return true;
}


/* =========================================================
   09. SUBMIT ATHLETE
========================================================= */

function handleAthleteSubmit(
  event
) {
  event.preventDefault();

  const data =
    readAthleteFormData();

  if (
    !validateAthleteData(data)
  ) {
    return;
  }

  if (
    AthleteManager.editingId
  ) {
    updateAthlete(
      AthleteManager.editingId,
      data
    );

    return;
  }

  createAthlete(data);
}


/* =========================================================
   10. CREATE ATHLETE
========================================================= */

function createAthlete(data) {
  const athletes =
    SPLApp.getAthletes();

  const athlete = {
    id:
      SPLApp.createId(
        "ATH"
      ),

    ...data,

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString()
  };

  athletes.push(
    athlete
  );

  const success =
    SPLApp.saveAthletes(
      athletes
    );

  if (!success) {
    return;
  }

  SPLApp.showToast(
    `${athlete.name} 선수가 등록되었습니다.`
  );

  resetAthleteForm();

  refreshAthleteModule();
}


/* =========================================================
   11. UPDATE ATHLETE
========================================================= */

function updateAthlete(
  athleteId,
  data
) {
  const athletes =
    SPLApp.getAthletes();

  const index =
    athletes.findIndex(
      (athlete) =>
        athlete.id === athleteId
    );

  if (index === -1) {
    SPLApp.showToast(
      "수정할 선수를 찾을 수 없습니다.",
      "error"
    );

    resetAthleteEditor();

    return;
  }

  const original =
    athletes[index];

  athletes[index] = {
    ...original,
    ...data,

    id:
      original.id,

    createdAt:
      original.createdAt,

    updatedAt:
      new Date().toISOString()
  };

  const success =
    SPLApp.saveAthletes(
      athletes
    );

  if (!success) {
    return;
  }

  /*
    기존 분석 기록에 저장되어 있던
    선수 이름도 함께 변경한다.
  */

  syncAthleteNameInRecords(
    athleteId,
    data.name
  );

  SPLApp.showToast(
    `${data.name} 선수 정보가 수정되었습니다.`
  );

  resetAthleteForm();

  refreshAthleteModule();
}


/* =========================================================
   12. SYNC ATHLETE NAME IN RECORDS
========================================================= */

function syncAthleteNameInRecords(
  athleteId,
  athleteName
) {
  const records =
    SPLApp.getRecords();

  let changed = false;

  const nextRecords =
    records.map(
      (record) => {
        if (
          record.athleteId !==
          athleteId
        ) {
          return record;
        }

        changed = true;

        return {
          ...record,

          athleteName,

          updatedAt:
            new Date().toISOString()
        };
      }
    );

  if (changed) {
    SPLApp.saveRecords(
      nextRecords
    );
  }
}


/* =========================================================
   13. RESET FORM
========================================================= */

function resetAthleteForm() {
  const form =
    getAthleteForm();

  if (form) {
    form.reset();
  }

  resetAthleteEditor();
}


function resetAthleteEditor() {
  AthleteManager.editingId =
    null;

  AthleteManager.photoData =
    "";

  const photoInput =
    getAthletePhotoInput();

  if (photoInput) {
    photoInput.value = "";
  }

  renderAthletePhotoPreview(
    ""
  );

  updateAthleteSubmitButton();
}


/* =========================================================
   14. SUBMIT BUTTON STATE
========================================================= */

function updateAthleteSubmitButton() {
  const form =
    getAthleteForm();

  if (!form) return;

  const submitButton =
    form.querySelector(
      'button[type="submit"]'
    );

  if (!submitButton) return;

  if (
    AthleteManager.editingId
  ) {
    submitButton.innerHTML = `
      <i class="fa-solid fa-floppy-disk"></i>
      수정 저장
    `;
  } else {
    submitButton.innerHTML = `
      <i class="fa-solid fa-user-plus"></i>
      선수 등록
    `;
  }
}


/* =========================================================
   15. REFRESH ATHLETE MODULE
========================================================= */

function refreshAthleteModule() {
  populateSportFilter();

  renderAthleteList();

  if (
    window.SPLApp
      ?.populateGlobalAthleteSelectors
  ) {
    SPLApp
      .populateGlobalAthleteSelectors();
  }
}


/* =========================================================
   16. EXTERNAL REFRESH EVENT
========================================================= */

document.addEventListener(
  "spl:refreshathletes",
  () => {
    refreshAthleteModule();
  }
);


/* =========================================================
   17. ATHLETE DATA UPDATE EVENT
========================================================= */

document.addEventListener(
  "spl:athletesupdated",
  () => {
    refreshAthleteModule();
  }
);


/* =========================================================
   18. SEARCH
========================================================= */

function initializeAthleteSearch() {
  const searchInput =
    document.getElementById(
      "athleteSearch"
    );

  if (!searchInput) return;

  searchInput.addEventListener(
    "input",
    SPLApp.debounce(
      () => {
        renderAthleteList();
      },
      120
    )
  );
}


/* =========================================================
   19. FILTERS
========================================================= */

function initializeAthleteFilters() {
  const sportFilter =
    document.getElementById(
      "athleteSportFilter"
    );

  const gradeFilter =
    document.getElementById(
      "athleteGradeFilter"
    );

  sportFilter?.addEventListener(
    "change",
    renderAthleteList
  );

  gradeFilter?.addEventListener(
    "change",
    renderAthleteList
  );
}


/* =========================================================
   20. POPULATE SPORT FILTER
========================================================= */

function populateSportFilter() {
  const filter =
    document.getElementById(
      "athleteSportFilter"
    );

  if (!filter) return;

  const athletes =
    SPLApp.getAthletes();

  const current =
    filter.value;

  const sports =
    [
      ...new Set(
        athletes
          .map(
            (athlete) =>
              athlete.sport?.trim()
          )
          .filter(Boolean)
      )
    ].sort(
      (a, b) =>
        a.localeCompare(
          b,
          "ko"
        )
    );

  filter.innerHTML = `
    <option value="all">
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
    current === "all" ||
    sports.includes(current)
  ) {
    filter.value =
      current;
  }
}


/* =========================================================
   21. GET FILTERED ATHLETES
========================================================= */

function getFilteredAthletes() {
  const athletes =
    SPLApp.getAthletes();

  const search =
    document
      .getElementById(
        "athleteSearch"
      )
      ?.value
      .trim()
      .toLowerCase() || "";

  const sport =
    document
      .getElementById(
        "athleteSportFilter"
      )
      ?.value || "all";

  const grade =
    document
      .getElementById(
        "athleteGradeFilter"
      )
      ?.value || "all";

  return athletes.filter(
    (athlete) => {
      const searchable =
        [
          athlete.name,
          athlete.number,
          athlete.sport,
          athlete.position
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

      const matchesSearch =
        !search ||
        searchable.includes(
          search
        );

      const matchesSport =
        sport === "all" ||
        athlete.sport === sport;

      const matchesGrade =
        grade === "all" ||
        String(
          athlete.grade
        ) === grade;

      return (
        matchesSearch &&
        matchesSport &&
        matchesGrade
      );
    }
  );
}


/* =========================================================
   22. RENDER ATHLETE LIST
========================================================= */

function renderAthleteList() {
  const container =
    getAthleteListContainer();

  if (!container) return;

  const athletes =
    getFilteredAthletes();

  if (!athletes.length) {
    renderAthleteEmptyState(
      container
    );

    return;
  }

  container.innerHTML =
    athletes
      .map(
        (athlete) =>
          createAthleteCardHTML(
            athlete
          )
      )
      .join("");
}


/* =========================================================
   23. EMPTY STATE
========================================================= */

function renderAthleteEmptyState(
  container
) {
  const total =
    SPLApp.getAthletes()
      .length;

  if (total === 0) {
    container.innerHTML = `
      <div class="large-empty-state">

        <i class="fa-solid fa-users"></i>

        <h2>
          등록된 선수가 없습니다
        </h2>

        <p>
          첫 선수를 등록하고 자세 분석을 시작하세요.
        </p>

        <button
          class="primary-analysis-button"
          type="button"
          data-athlete-action="register"
        >
          <i class="fa-solid fa-user-plus"></i>
          선수 등록
        </button>

      </div>
    `;

    return;
  }

  container.innerHTML = `
    <div class="large-empty-state">

      <i class="fa-solid fa-magnifying-glass"></i>

      <h2>
        검색 결과가 없습니다
      </h2>

      <p>
        검색어나 필터 조건을 변경해주세요.
      </p>

    </div>
  `;
}


/* =========================================================
   24. ATHLETE CARD HTML
========================================================= */

function createAthleteCardHTML(
  athlete
) {
  const name =
    SPLApp.escapeHTML(
      athlete.name ||
      "이름 없음"
    );

  const sport =
    SPLApp.escapeHTML(
      athlete.sport ||
      "종목 미등록"
    );

  const position =
    SPLApp.escapeHTML(
      athlete.position ||
      "세부종목 미등록"
    );

  const grade =
    athlete.grade
      ? `${SPLApp.escapeHTML(
          athlete.grade
        )}학년`
      : "-";

  const height =
    athlete.height
      ? `${SPLApp.roundNumber(
          athlete.height,
          1
        )} cm`
      : "-";

  const weight =
    athlete.weight
      ? `${SPLApp.roundNumber(
          athlete.weight,
          1
        )} kg`
      : "-";

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
    <article
      class="athlete-card"
      data-athlete-id="${SPLApp.escapeHTML(
        athlete.id
      )}"
    >

      <div class="athlete-card-top">

        <div class="athlete-card-avatar">
          ${photo}
        </div>

        <div class="athlete-card-info">

          <strong>
            ${name}
          </strong>

          <span>
            ${sport}
            ·
            ${position}
          </span>

        </div>

      </div>


      <div class="athlete-card-data">

        <div>
          <span>학년</span>
          <strong>
            ${grade}
          </strong>
        </div>

        <div>
          <span>신장</span>
          <strong>
            ${height}
          </strong>
        </div>

        <div>
          <span>체중</span>
          <strong>
            ${weight}
          </strong>
        </div>

      </div>


      <div class="athlete-card-actions">

        <button
          type="button"
          data-athlete-action="analyze"
          data-athlete-id="${SPLApp.escapeHTML(
            athlete.id
          )}"
        >
          <i class="fa-solid fa-person-running"></i>
          자세분석
        </button>

        <button
          type="button"
          data-athlete-action="edit"
          data-athlete-id="${SPLApp.escapeHTML(
            athlete.id
          )}"
        >
          <i class="fa-solid fa-pen"></i>
          수정
        </button>

        <button
          type="button"
          data-athlete-action="delete"
          data-athlete-id="${SPLApp.escapeHTML(
            athlete.id
          )}"
        >
          <i class="fa-solid fa-trash"></i>
        </button>

      </div>

    </article>
  `;
}


/* =========================================================
   25. LIST ACTION EVENT
========================================================= */

function initializeAthleteListActions() {
  const container =
    getAthleteListContainer();

  if (!container) return;

  container.addEventListener(
    "click",
    handleAthleteListClick
  );
}


function handleAthleteListClick(
  event
) {
  const button =
    event.target.closest(
      "[data-athlete-action]"
    );

  if (!button) return;

  const action =
    button.dataset.athleteAction;

  const athleteId =
    button.dataset.athleteId;

  if (
    action === "register"
  ) {
    SPLApp.openPage(
      "athlete-register"
    );

    return;
  }

  if (!athleteId) {
    return;
  }

  if (
    action === "analyze"
  ) {
    openAthletePoseAnalysis(
      athleteId
    );

    return;
  }

  if (
    action === "edit"
  ) {
    startAthleteEdit(
      athleteId
    );

    return;
  }

  if (
    action === "delete"
  ) {
    deleteAthlete(
      athleteId
    );
  }
}


/* =========================================================
   26. OPEN POSE ANALYSIS
========================================================= */

function openAthletePoseAnalysis(
  athleteId
) {
  const athlete =
    SPLApp.getAthleteById(
      athleteId
    );

  if (!athlete) {
    SPLApp.showToast(
      "선수 정보를 찾을 수 없습니다.",
      "error"
    );

    return;
  }

  /*
    pose.js에서 이 값을 읽어
    해당 선수를 자동 선택할 수 있다.
  */

  sessionStorage.setItem(
    "spl_selected_athlete",
    athleteId
  );

  SPLApp.openPage(
    "pose"
  );

  setTimeout(
    () => {
      const selector =
        document.getElementById(
          "poseAthlete"
        );

      if (selector) {
        selector.value =
          athleteId;

        selector.dispatchEvent(
          new Event(
            "change",
            {
              bubbles: true
            }
          )
        );
      }
    },
    0
  );

  SPLApp.showToast(
    `${athlete.name} 선수 자세분석을 준비했습니다.`
  );
}


/* =========================================================
   27. START EDIT
========================================================= */

function startAthleteEdit(
  athleteId
) {
  const athlete =
    SPLApp.getAthleteById(
      athleteId
    );

  if (!athlete) {
    SPLApp.showToast(
      "선수 정보를 찾을 수 없습니다.",
      "error"
    );

    return;
  }

  AthleteManager.editingId =
    athlete.id;

  AthleteManager.photoData =
    athlete.photo || "";

  fillAthleteForm(
    athlete
  );

  renderAthletePhotoPreview(
    athlete.photo || ""
  );

  updateAthleteSubmitButton();

  SPLApp.openPage(
    "athlete-register"
  );

  setTimeout(
    () => {
      document
        .getElementById(
          "athleteName"
        )
        ?.focus();
    },
    100
  );

  SPLApp.showToast(
    `${athlete.name} 선수 정보를 불러왔습니다.`
  );
}


/* =========================================================
   28. FILL FORM
========================================================= */

function fillAthleteForm(
  athlete
) {
  setFormValue(
    "athleteName",
    athlete.name
  );

  setFormValue(
    "athleteNumber",
    athlete.number
  );

  setFormValue(
    "athleteGrade",
    athlete.grade
  );

  setFormValue(
    "athleteGender",
    athlete.gender
  );

  setFormValue(
    "athleteSport",
    athlete.sport
  );

  setFormValue(
    "athletePosition",
    athlete.position
  );

  setFormValue(
    "athleteHeight",
    athlete.height || ""
  );

  setFormValue(
    "athleteWeight",
    athlete.weight || ""
  );

  setFormValue(
    "athleteMemo",
    athlete.memo
  );
}


function setFormValue(
  id,
  value
) {
  const element =
    document.getElementById(
      id
    );

  if (!element) return;

  element.value =
    value ?? "";
}


/* =========================================================
   END OF athletes.js PART 1
========================================================= */
/* =========================================================
   SEOLCHEON PERFORMANCE LAB
   athletes.js

   PART 2
   Delete / Duplicate Check / Detail / Report / Final Safety
========================================================= */


/* =========================================================
   29. DELETE ATHLETE
========================================================= */

function deleteAthlete(athleteId) {
  const athlete =
    SPLApp.getAthleteById(athleteId);

  if (!athlete) {
    SPLApp.showToast(
      "삭제할 선수를 찾을 수 없습니다.",
      "error"
    );

    return false;
  }

  const records =
    SPLApp.getAthleteRecords(
      athleteId
    );

  let message =
    `${athlete.name} 선수를 삭제할까요?`;

  if (records.length > 0) {
    message +=
      `\n\n이 선수의 분석 기록 ${records.length}개도 함께 삭제됩니다.`;
  }

  const confirmed =
    window.confirm(message);

  if (!confirmed) {
    return false;
  }

  const athletes =
    SPLApp
      .getAthletes()
      .filter(
        (item) =>
          item.id !== athleteId
      );

  const nextRecords =
    SPLApp
      .getRecords()
      .filter(
        (record) =>
          record.athleteId !==
          athleteId
      );

  const athleteSaved =
    SPLApp.saveAthletes(
      athletes
    );

  if (!athleteSaved) {
    return false;
  }

  if (records.length > 0) {
    SPLApp.saveRecords(
      nextRecords
    );
  }

  if (
    AthleteManager.editingId ===
    athleteId
  ) {
    resetAthleteForm();
  }

  refreshAthleteModule();

  SPLApp.showToast(
    `${athlete.name} 선수가 삭제되었습니다.`
  );

  return true;
}


/* =========================================================
   30. DUPLICATE NUMBER CHECK
========================================================= */

function isDuplicateAthleteNumber(
  number,
  ignoreId = null
) {
  const normalized =
    String(number || "")
      .trim()
      .toLowerCase();

  if (!normalized) {
    return false;
  }

  return SPLApp
    .getAthletes()
    .some(
      (athlete) => {
        if (
          ignoreId &&
          athlete.id === ignoreId
        ) {
          return false;
        }

        return (
          String(
            athlete.number || ""
          )
            .trim()
            .toLowerCase() ===
          normalized
        );
      }
    );
}


/* =========================================================
   31. EXTENDED VALIDATION
========================================================= */

const originalValidateAthleteData =
  validateAthleteData;


validateAthleteData =
  function (data) {
    const basicValid =
      originalValidateAthleteData(
        data
      );

    if (!basicValid) {
      return false;
    }

    if (
      data.number &&
      isDuplicateAthleteNumber(
        data.number,
        AthleteManager.editingId
      )
    ) {
      SPLApp.showToast(
        "이미 등록된 선수번호입니다.",
        "warning"
      );

      document
        .getElementById(
          "athleteNumber"
        )
        ?.focus();

      return false;
    }

    if (
      data.height &&
      (
        data.height < 100 ||
        data.height > 230
      )
    ) {
      SPLApp.showToast(
        "신장 입력값을 다시 확인해주세요.",
        "warning"
      );

      return false;
    }

    if (
      data.weight &&
      (
        data.weight < 20 ||
        data.weight > 250
      )
    ) {
      SPLApp.showToast(
        "체중 입력값을 다시 확인해주세요.",
        "warning"
      );

      return false;
    }

    return true;
  };


/* =========================================================
   32. ATHLETE DETAIL
========================================================= */

function showAthleteDetail(
  athleteId
) {
  const athlete =
    SPLApp.getAthleteById(
      athleteId
    );

  if (!athlete) {
    SPLApp.showToast(
      "선수 정보를 찾을 수 없습니다.",
      "error"
    );

    return;
  }

  const records =
    SPLApp.getAthleteRecords(
      athleteId
    );

  const latest =
    records[0] || null;

  const scores =
    records
      .map(
        (record) =>
          Number(record.score)
      )
      .filter(
        Number.isFinite
      );

  const averageScore =
    scores.length
      ? Math.round(
          SPLApp.average(scores)
        )
      : null;

  const detail = {
    athlete,
    records,
    latest,
    averageScore
  };

  document.dispatchEvent(
    new CustomEvent(
      "spl:athletedetail",
      {
        detail
      }
    )
  );

  return detail;
}


/* =========================================================
   33. OPEN ATHLETE REPORT
========================================================= */

function openAthleteReport(
  athleteId
) {
  const athlete =
    SPLApp.getAthleteById(
      athleteId
    );

  if (!athlete) {
    SPLApp.showToast(
      "선수 정보를 찾을 수 없습니다.",
      "error"
    );

    return;
  }

  sessionStorage.setItem(
    "spl_report_athlete",
    athleteId
  );

  SPLApp.openPage(
    "report"
  );

  document.dispatchEvent(
    new CustomEvent(
      "spl:reportathlete",
      {
        detail: {
          athleteId
        }
      }
    )
  );
}


/* =========================================================
   34. ATHLETE STATISTICS
========================================================= */

function getAthleteStatistics(
  athleteId
) {
  const records =
    SPLApp.getAthleteRecords(
      athleteId
    );

  if (!records.length) {
    return {
      count: 0,
      average: 0,
      best: 0,
      latest: 0,
      stability: 0,
      balance: 0,
      efficiency: 0
    };
  }

  const scores =
    records.map(
      (record) =>
        SPLApp.safeNumber(
          record.score
        )
    );

  const stability =
    records.map(
      (record) =>
        SPLApp.safeNumber(
          record.stability
        )
    );

  const balance =
    records.map(
      (record) =>
        SPLApp.safeNumber(
          record.balance
        )
    );

  const efficiency =
    records.map(
      (record) =>
        SPLApp.safeNumber(
          record.efficiency
        )
    );

  return {
    count:
      records.length,

    average:
      Math.round(
        SPLApp.average(scores)
      ),

    best:
      Math.round(
        Math.max(...scores)
      ),

    latest:
      Math.round(
        SPLApp.safeNumber(
          records[0]?.score
        )
      ),

    stability:
      Math.round(
        SPLApp.average(
          stability
        )
      ),

    balance:
      Math.round(
        SPLApp.average(
          balance
        )
      ),

    efficiency:
      Math.round(
        SPLApp.average(
          efficiency
        )
      )
  };
}


/* =========================================================
   35. EXTEND ATHLETE CARD ACTIONS
========================================================= */

const originalHandleAthleteListClick =
  handleAthleteListClick;


handleAthleteListClick =
  function (event) {
    const button =
      event.target.closest(
        "[data-athlete-action]"
      );

    if (!button) {
      return;
    }

    const action =
      button.dataset
        .athleteAction;

    const athleteId =
      button.dataset
        .athleteId;

    if (
      action === "detail" &&
      athleteId
    ) {
      showAthleteDetail(
        athleteId
      );

      return;
    }

    if (
      action === "report" &&
      athleteId
    ) {
      openAthleteReport(
        athleteId
      );

      return;
    }

    originalHandleAthleteListClick(
      event
    );
  };


/* =========================================================
   36. CARD DOUBLE CLICK
========================================================= */

function initializeAthleteCardDoubleClick() {
  const container =
    getAthleteListContainer();

  if (!container) return;

  container.addEventListener(
    "dblclick",
    (event) => {
      const card =
        event.target.closest(
          ".athlete-card"
        );

      if (!card) {
        return;
      }

      if (
        event.target.closest(
          "button"
        )
      ) {
        return;
      }

      const athleteId =
        card.dataset.athleteId;

      if (!athleteId) {
        return;
      }

      openAthletePoseAnalysis(
        athleteId
      );
    }
  );
}


/* =========================================================
   37. ATHLETE CARD KEYBOARD ACCESS
========================================================= */

function initializeAthleteCardKeyboard() {
  const container =
    getAthleteListContainer();

  if (!container) return;

  container.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key !== "Enter" &&
        event.key !== " "
      ) {
        return;
      }

      const card =
        event.target.closest(
          ".athlete-card"
        );

      if (!card) {
        return;
      }

      if (
        event.target.closest(
          "button"
        )
      ) {
        return;
      }

      event.preventDefault();

      const athleteId =
        card.dataset.athleteId;

      if (athleteId) {
        openAthletePoseAnalysis(
          athleteId
        );
      }
    }
  );
}


/* =========================================================
   38. ADD CARD ACCESSIBILITY
========================================================= */

const originalCreateAthleteCardHTML =
  createAthleteCardHTML;


createAthleteCardHTML =
  function (athlete) {
    const html =
      originalCreateAthleteCardHTML(
        athlete
      );

    /*
      기존 article 시작 태그에
      keyboard 접근성을 추가한다.
    */

    return html.replace(
      "<article\n      class=\"athlete-card\"",
      `<article
      class="athlete-card"
      tabindex="0"
      role="button"
      aria-label="${SPLApp.escapeHTML(
        athlete.name ||
        "선수"
      )} 자세분석 열기"`
    );
  };


/* =========================================================
   39. SELECT ATHLETE FROM EXTERNAL MODULE
========================================================= */

document.addEventListener(
  "spl:selectedathlete",
  (event) => {
    const athleteId =
      event.detail?.athleteId;

    if (!athleteId) {
      return;
    }

    const athlete =
      SPLApp.getAthleteById(
        athleteId
      );

    if (!athlete) {
      return;
    }

    sessionStorage.setItem(
      "spl_selected_athlete",
      athleteId
    );
  }
);


/* =========================================================
   40. CLEAR SELECTED ATHLETE IF DELETED
========================================================= */

document.addEventListener(
  "spl:athletesupdated",
  () => {
    const selectedId =
      sessionStorage.getItem(
        "spl_selected_athlete"
      );

    if (
      selectedId &&
      !SPLApp.getAthleteById(
        selectedId
      )
    ) {
      sessionStorage.removeItem(
        "spl_selected_athlete"
      );
    }

    const reportId =
      sessionStorage.getItem(
        "spl_report_athlete"
      );

    if (
      reportId &&
      !SPLApp.getAthleteById(
        reportId
      )
    ) {
      sessionStorage.removeItem(
        "spl_report_athlete"
      );
    }
  }
);


/* =========================================================
   41. DATA EXPORT
========================================================= */

function exportAthleteData(
  athleteId
) {
  const athlete =
    SPLApp.getAthleteById(
      athleteId
    );

  if (!athlete) {
    return null;
  }

  const records =
    SPLApp.getAthleteRecords(
      athleteId
    );

  return {
    system:
      "SEOLCHEON PERFORMANCE LAB",

    exportedAt:
      new Date().toISOString(),

    athlete,

    statistics:
      getAthleteStatistics(
        athleteId
      ),

    records
  };
}


/* =========================================================
   42. SORT ATHLETES
========================================================= */

function sortAthletes(
  athletes,
  method = "name"
) {
  const list =
    [...athletes];

  switch (method) {

    case "recent":
      return list.sort(
        (a, b) =>
          new Date(
            b.createdAt || 0
          ) -
          new Date(
            a.createdAt || 0
          )
      );

    case "sport":
      return list.sort(
        (a, b) =>
          String(
            a.sport || ""
          ).localeCompare(
            String(
              b.sport || ""
            ),
            "ko"
          )
      );

    case "grade":
      return list.sort(
        (a, b) =>
          SPLApp.safeNumber(
            a.grade
          ) -
          SPLApp.safeNumber(
            b.grade
          )
      );

    case "name":
    default:
      return list.sort(
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
  }
}


/* =========================================================
   43. SORT SELECT
========================================================= */

function initializeAthleteSort() {
  const sortSelect =
    document.getElementById(
      "athleteSort"
    );

  if (!sortSelect) {
    return;
  }

  sortSelect.addEventListener(
    "change",
    renderAthleteList
  );
}


/* =========================================================
   44. EXTEND FILTERED ATHLETES WITH SORT
========================================================= */

const originalGetFilteredAthletes =
  getFilteredAthletes;


getFilteredAthletes =
  function () {
    const athletes =
      originalGetFilteredAthletes();

    const sort =
      document
        .getElementById(
          "athleteSort"
        )
        ?.value ||
      "name";

    return sortAthletes(
      athletes,
      sort
    );
  };


/* =========================================================
   45. CURRENT ATHLETE
========================================================= */

function getCurrentAthlete() {
  const athleteId =
    sessionStorage.getItem(
      "spl_selected_athlete"
    );

  if (!athleteId) {
    return null;
  }

  return SPLApp.getAthleteById(
    athleteId
  );
}


/* =========================================================
   46. MODULE FINAL INITIALIZATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    initializeAthleteCardDoubleClick();

    initializeAthleteCardKeyboard();

    initializeAthleteSort();
  }
);


/* =========================================================
   47. ATHLETE GLOBAL API
========================================================= */

window.SPLAthletes = {
  refresh:
    refreshAthleteModule,

  create:
    createAthlete,

  update:
    updateAthlete,

  delete:
    deleteAthlete,

  edit:
    startAthleteEdit,

  analyze:
    openAthletePoseAnalysis,

  report:
    openAthleteReport,

  detail:
    showAthleteDetail,

  getStatistics:
    getAthleteStatistics,

  getCurrent:
    getCurrentAthlete,

  exportData:
    exportAthleteData
};


/* =========================================================
   END OF athletes.js
========================================================= */