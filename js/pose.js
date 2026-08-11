/* =========================================================
   SEOLCHEON PERFORMANCE LAB
   pose.js

   PART 1 / 4
   Camera Engine / MediaPipe / View Mode
========================================================= */

"use strict";


/* =========================================================
   01. POSE STATE
========================================================= */

const PoseManager = {

  initialized: false,

  pose: null,

  stream: null,

  cameraRunning: false,

  analyzing: false,

  processingFrame: false,

  animationFrame: null,

  facingMode: "environment",

  viewMode: "front",

  selectedAthleteId: "",

  latestLandmarks: null,

  latestWorldLandmarks: null,

  latestResult: null,

  frameCount: 0,

  lastFrameTime: 0,

  fps: 0,

  confidence: 0,

  settings: {
    minDetectionConfidence: 0.6,
    minTrackingConfidence: 0.6,
    modelComplexity: 1,
    smoothLandmarks: true
  }
};


/* =========================================================
   02. DOM READY
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    initializePoseModule();
  }
);


document.addEventListener(
  "spl:systemready",
  () => {
    initializePoseModule();
  }
);


/* =========================================================
   03. INITIALIZE MODULE
========================================================= */

function initializePoseModule() {

  if (PoseManager.initialized) {
    syncSelectedAthlete();
    return;
  }

  initializePoseControls();

  initializePoseAthlete();

  initializeViewMode();

  initializeCameraSwitch();

  initializePoseEngine();

  syncSelectedAthlete();

  resetPoseUI();

  PoseManager.initialized = true;

  console.log(
    "[POSE] Module initialized."
  );
}


/* =========================================================
   04. DOM HELPERS
========================================================= */

function getPoseVideo() {
  return document.getElementById(
    "poseVideo"
  );
}


function getPoseCanvas() {
  return document.getElementById(
    "poseCanvas"
  );
}


function getPoseStage() {
  return (
    document.getElementById(
      "poseStage"
    ) ||
    document.querySelector(
      "#page-pose .camera-stage"
    )
  );
}


function getPoseStartButton() {
  return (
    document.getElementById(
      "startPoseCamera"
    ) ||
    document.getElementById(
      "poseCameraButton"
    )
  );
}


function getPoseStopButton() {
  return (
    document.getElementById(
      "stopPoseCamera"
    ) ||
    document.getElementById(
      "poseStopButton"
    )
  );
}


function getPoseAnalyzeButton() {
  return (
    document.getElementById(
      "startPoseAnalysis"
    ) ||
    document.getElementById(
      "poseAnalyzeButton"
    )
  );
}


function getPoseSwitchButton() {
  return (
    document.getElementById(
      "switchPoseCamera"
    ) ||
    document.getElementById(
      "poseSwitchCamera"
    )
  );
}


function getPoseAthleteSelect() {
  return document.getElementById(
    "poseAthlete"
  );
}


/* =========================================================
   05. INITIALIZE CONTROLS
========================================================= */

function initializePoseControls() {

  const startButton =
    getPoseStartButton();

  const stopButton =
    getPoseStopButton();

  const analyzeButton =
    getPoseAnalyzeButton();


  startButton?.addEventListener(
    "click",
    async () => {

      if (
        PoseManager.cameraRunning
      ) {
        stopPoseCamera();

        return;
      }

      await startPoseCamera();
    }
  );


  stopButton?.addEventListener(
    "click",
    () => {
      stopPoseCamera();
    }
  );


  analyzeButton?.addEventListener(
    "click",
    () => {

      if (
        !PoseManager.cameraRunning
      ) {
        SPLApp.showToast(
          "먼저 카메라를 시작해주세요.",
          "warning"
        );

        return;
      }

      togglePoseAnalysis();
    }
  );
}


/* =========================================================
   06. ATHLETE SELECTOR
========================================================= */

function initializePoseAthlete() {

  const select =
    getPoseAthleteSelect();

  if (!select) {
    return;
  }

  select.addEventListener(
    "change",
    () => {

      PoseManager.selectedAthleteId =
        select.value || "";

      if (
        PoseManager.selectedAthleteId
      ) {
        sessionStorage.setItem(
          "spl_selected_athlete",
          PoseManager.selectedAthleteId
        );
      } else {
        sessionStorage.removeItem(
          "spl_selected_athlete"
        );
      }

      updatePoseAthleteInfo();
    }
  );
}


/* =========================================================
   07. SYNC SELECTED ATHLETE
========================================================= */

function syncSelectedAthlete() {

  const selectedId =
    sessionStorage.getItem(
      "spl_selected_athlete"
    );

  const select =
    getPoseAthleteSelect();

  if (
    selectedId &&
    SPLApp.getAthleteById(
      selectedId
    )
  ) {

    PoseManager.selectedAthleteId =
      selectedId;

    if (select) {
      select.value =
        selectedId;
    }

  } else {

    PoseManager.selectedAthleteId =
      select?.value || "";
  }

  updatePoseAthleteInfo();
}


/* =========================================================
   08. UPDATE ATHLETE INFORMATION
========================================================= */

function updatePoseAthleteInfo() {

  const athlete =
    SPLApp.getAthleteById(
      PoseManager.selectedAthleteId
    );

  const nameElements =
    document.querySelectorAll(
      "[data-pose-athlete-name]"
    );

  const sportElements =
    document.querySelectorAll(
      "[data-pose-athlete-sport]"
    );


  nameElements.forEach(
    (element) => {
      element.textContent =
        athlete?.name ||
        "선수 미선택";
    }
  );


  sportElements.forEach(
    (element) => {
      element.textContent =
        athlete?.sport ||
        "-";
    }
  );
}


/* =========================================================
   09. VIEW MODE
========================================================= */

function initializeViewMode() {

  const selector =
    document.getElementById(
      "poseViewMode"
    );

  if (selector) {

    PoseManager.viewMode =
      selector.value ||
      "front";

    selector.addEventListener(
      "change",
      () => {

        PoseManager.viewMode =
          selector.value ||
          "front";

        updateViewModeUI();

        clearPoseResult();
      }
    );
  }


  const buttons =
    document.querySelectorAll(
      "[data-pose-view]"
    );


  buttons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const mode =
            button.dataset.poseView;

          if (
            mode !== "front" &&
            mode !== "side"
          ) {
            return;
          }

          PoseManager.viewMode =
            mode;

          if (selector) {
            selector.value =
              mode;
          }

          updateViewModeUI();

          clearPoseResult();
        }
      );
    }
  );


  updateViewModeUI();
}


/* =========================================================
   10. UPDATE VIEW MODE UI
========================================================= */

function updateViewModeUI() {

  document
    .querySelectorAll(
      "[data-pose-view]"
    )
    .forEach(
      (button) => {

        button.classList.toggle(
          "active",
          button.dataset.poseView ===
          PoseManager.viewMode
        );
      }
    );


  const labels =
    document.querySelectorAll(
      "[data-pose-view-label]"
    );


  labels.forEach(
    (element) => {

      element.textContent =
        PoseManager.viewMode ===
        "side"
          ? "측면 분석"
          : "정면 분석";
    }
  );
}


/* =========================================================
   11. CAMERA SWITCH
========================================================= */

function initializeCameraSwitch() {

  const button =
    getPoseSwitchButton();

  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    async () => {

      PoseManager.facingMode =
        PoseManager.facingMode ===
        "environment"
          ? "user"
          : "environment";


      if (
        PoseManager.cameraRunning
      ) {

        await restartPoseCamera();

      } else {

        updateCameraMirror();
      }


      SPLApp.showToast(
        PoseManager.facingMode ===
        "user"
          ? "전면 카메라로 변경했습니다."
          : "후면 카메라로 변경했습니다."
      );
    }
  );
}


/* =========================================================
   12. MEDIAPIPE ENGINE
========================================================= */

function initializePoseEngine() {

  if (
    typeof window.Pose ===
    "undefined"
  ) {

    console.warn(
      "[POSE] MediaPipe Pose library not loaded."
    );

    updatePoseSystemStatus(
      "AI 엔진 확인 필요",
      false
    );

    return false;
  }


  try {

    PoseManager.pose =
      new window.Pose({

        locateFile: (file) => {

          return (
            "https://cdn.jsdelivr.net/" +
            "npm/@mediapipe/pose/" +
            file
          );
        }
      });


    PoseManager.pose.setOptions({

      modelComplexity:
        PoseManager.settings
          .modelComplexity,

      smoothLandmarks:
        PoseManager.settings
          .smoothLandmarks,

      enableSegmentation:
        false,

      smoothSegmentation:
        false,

      minDetectionConfidence:
        PoseManager.settings
          .minDetectionConfidence,

      minTrackingConfidence:
        PoseManager.settings
          .minTrackingConfidence
    });


    PoseManager.pose.onResults(
      handlePoseResults
    );


    updatePoseSystemStatus(
      "AI 엔진 준비 완료",
      true
    );


    return true;

  } catch (error) {

    console.error(
      "[POSE] Engine error:",
      error
    );


    updatePoseSystemStatus(
      "AI 엔진 오류",
      false
    );


    return false;
  }
}


/* =========================================================
   13. START CAMERA
========================================================= */

async function startPoseCamera() {

  if (
    PoseManager.cameraRunning
  ) {
    return true;
  }


  const video =
    getPoseVideo();


  if (!video) {

    SPLApp.showToast(
      "카메라 화면을 찾을 수 없습니다.",
      "error"
    );

    return false;
  }


  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices
      .getUserMedia
  ) {

    SPLApp.showToast(
      "이 브라우저에서는 카메라를 사용할 수 없습니다.",
      "error"
    );

    return false;
  }


  const startButton =
    getPoseStartButton();


  SPLApp.setButtonLoading(
    startButton,
    true,
    "카메라 연결 중"
  );


  setCameraLoading(true);


  try {

    stopMediaStream();


    const constraints = {

      audio: false,

      video: {

        facingMode: {
          ideal:
            PoseManager.facingMode
        },

        width: {
          ideal: 1280
        },

        height: {
          ideal: 720
        },

        frameRate: {
          ideal: 30,
          max: 60
        }
      }
    };


    const stream =
      await navigator.mediaDevices
        .getUserMedia(
          constraints
        );


    PoseManager.stream =
      stream;


    video.srcObject =
      stream;


    video.setAttribute(
      "playsinline",
      ""
    );


    video.muted =
      true;


    await video.play();


    await waitForVideoReady(
      video
    );


    PoseManager.cameraRunning =
      true;


    PoseManager.frameCount =
      0;


    PoseManager.lastFrameTime =
      performance.now();


    syncPoseCanvasSize();


    updateCameraMirror();


    updateCameraUI(
      true
    );


    setCameraLoading(
      false
    );


    startPoseFrameLoop();


    SPLApp.showToast(
      "카메라가 연결되었습니다."
    );


    return true;

  } catch (error) {

    console.error(
      "[POSE] Camera error:",
      error
    );


    PoseManager.cameraRunning =
      false;


    setCameraLoading(
      false
    );


    updateCameraUI(
      false
    );


    handleCameraError(
      error
    );


    return false;

  } finally {

    SPLApp.setButtonLoading(
      startButton,
      false
    );
  }
}


/* =========================================================
   14. WAIT VIDEO READY
========================================================= */

function waitForVideoReady(
  video
) {

  return new Promise(
    (resolve) => {

      if (
        video.readyState >= 2 &&
        video.videoWidth > 0
      ) {
        resolve();
        return;
      }


      const ready = () => {

        video.removeEventListener(
          "loadedmetadata",
          ready
        );

        resolve();
      };


      video.addEventListener(
        "loadedmetadata",
        ready,
        {
          once: true
        }
      );
    }
  );
}


/* =========================================================
   15. RESTART CAMERA
========================================================= */

async function restartPoseCamera() {

  const wasAnalyzing =
    PoseManager.analyzing;


  stopPoseCamera({
    silent: true
  });


  await new Promise(
    (resolve) => {
      setTimeout(
        resolve,
        200
      );
    }
  );


  const success =
    await startPoseCamera();


  if (
    success &&
    wasAnalyzing
  ) {

    startPoseAnalysis();
  }
}


/* =========================================================
   16. STOP CAMERA
========================================================= */

function stopPoseCamera(
  options = {}
) {

  const {
    silent = false
  } = options;


  stopPoseAnalysis({
    silent: true
  });


  PoseManager.cameraRunning =
    false;


  if (
    PoseManager.animationFrame
  ) {

    cancelAnimationFrame(
      PoseManager.animationFrame
    );

    PoseManager.animationFrame =
      null;
  }


  stopMediaStream();


  const video =
    getPoseVideo();


  if (video) {

    video.pause();

    video.srcObject =
      null;
  }


  clearPoseCanvas();


  updateCameraUI(
    false
  );


  setCameraLoading(
    false
  );


  if (!silent) {

    SPLApp.showToast(
      "카메라가 종료되었습니다."
    );
  }
}


/* =========================================================
   17. STOP MEDIA STREAM
========================================================= */

function stopMediaStream() {

  if (
    !PoseManager.stream
  ) {
    return;
  }


  PoseManager.stream
    .getTracks()
    .forEach(
      (track) => {
        track.stop();
      }
    );


  PoseManager.stream =
    null;
}


/* =========================================================
   18. CAMERA ERROR
========================================================= */

function handleCameraError(
  error
) {

  let message =
    "카메라를 시작하지 못했습니다.";


  if (
    error?.name ===
    "NotAllowedError"
  ) {

    message =
      "카메라 권한이 필요합니다. Safari 설정에서 카메라 접근을 허용해주세요.";

  } else if (
    error?.name ===
    "NotFoundError"
  ) {

    message =
      "사용 가능한 카메라를 찾지 못했습니다.";

  } else if (
    error?.name ===
    "NotReadableError"
  ) {

    message =
      "다른 앱에서 카메라를 사용 중일 수 있습니다.";

  } else if (
    error?.name ===
    "OverconstrainedError"
  ) {

    message =
      "현재 카메라가 요청한 촬영 설정을 지원하지 않습니다.";
  }


  SPLApp.showToast(
    message,
    "error",
    4000
  );
}


/* =========================================================
   19. CAMERA MIRROR
========================================================= */

function updateCameraMirror() {

  const video =
    getPoseVideo();


  const canvas =
    getPoseCanvas();


  const mirror =
    PoseManager.facingMode ===
    "user";


  video?.classList.toggle(
    "mirror",
    mirror
  );


  canvas?.classList.toggle(
    "mirror",
    mirror
  );
}


/* =========================================================
   20. CAMERA UI
========================================================= */

function updateCameraUI(
  active
) {

  const status =
    document.querySelector(
      "#page-pose .camera-state"
    );


  const analysisStatus =
    document.querySelector(
      "#page-pose .analysis-status"
    );


  const guide =
    document.querySelector(
      "#page-pose .body-guide"
    );


  const startButton =
    getPoseStartButton();


  const stopButton =
    getPoseStopButton();


  if (status) {

    status.classList.toggle(
      "active",
      active
    );


    const text =
      status.querySelector(
        "[data-camera-state-text]"
      );


    if (text) {

      text.textContent =
        active
          ? "CAMERA ONLINE"
          : "CAMERA OFFLINE";
    }
  }


  analysisStatus?.classList.toggle(
    "active",
    active
  );


  if (guide) {

    guide.classList.toggle(
      "hidden",
      active
    );
  }


  if (startButton) {

    if (active) {

      startButton.innerHTML = `
        <i class="fa-solid fa-video-slash"></i>
        카메라 종료
      `;

    } else {

      startButton.innerHTML = `
        <i class="fa-solid fa-video"></i>
        카메라 시작
      `;
    }
  }


  if (stopButton) {

    stopButton.disabled =
      !active;
  }
}


/* =========================================================
   21. CAMERA LOADING
========================================================= */

function setCameraLoading(
  loading
) {

  const stage =
    getPoseStage();


  if (!stage) {
    return;
  }


  stage.classList.toggle(
    "loading",
    loading
  );


  let loadingElement =
    stage.querySelector(
      ".camera-loading"
    );


  if (loading) {

    if (!loadingElement) {

      loadingElement =
        document.createElement(
          "div"
        );


      loadingElement.className =
        "camera-loading";


      loadingElement.innerHTML = `
        <div class="camera-loading-spinner"></div>

        <span>
          CAMERA CONNECTING
        </span>
      `;


      stage.appendChild(
        loadingElement
      );
    }

  } else {

    loadingElement?.remove();
  }
}


/* =========================================================
   22. CANVAS SIZE
========================================================= */

function syncPoseCanvasSize() {

  const video =
    getPoseVideo();


  const canvas =
    getPoseCanvas();


  if (
    !video ||
    !canvas
  ) {
    return;
  }


  const width =
    video.videoWidth;


  const height =
    video.videoHeight;


  if (
    !width ||
    !height
  ) {
    return;
  }


  if (
    canvas.width !== width
  ) {
    canvas.width =
      width;
  }


  if (
    canvas.height !== height
  ) {
    canvas.height =
      height;
  }
}


/* =========================================================
   23. WINDOW RESIZE
========================================================= */

window.addEventListener(
  "resize",
  SPLApp.debounce(
    () => {

      if (
        PoseManager.cameraRunning
      ) {

        syncPoseCanvasSize();
      }
    },
    100
  )
);


/* =========================================================
   24. START FRAME LOOP
========================================================= */

function startPoseFrameLoop() {

  if (
    PoseManager.animationFrame
  ) {

    cancelAnimationFrame(
      PoseManager.animationFrame
    );
  }


  const loop =
    async (timestamp) => {

      if (
        !PoseManager.cameraRunning
      ) {
        return;
      }


      updatePoseFPS(
        timestamp
      );


      if (
        PoseManager.analyzing &&
        !PoseManager.processingFrame
      ) {

        await processPoseFrame();
      }


      PoseManager.animationFrame =
        requestAnimationFrame(
          loop
        );
    };


  PoseManager.animationFrame =
    requestAnimationFrame(
      loop
    );
}


/* =========================================================
   25. PROCESS FRAME
========================================================= */

async function processPoseFrame() {

  const video =
    getPoseVideo();


  if (
    !video ||
    video.readyState < 2
  ) {
    return;
  }


  if (
    !PoseManager.pose
  ) {

    const initialized =
      initializePoseEngine();


    if (!initialized) {
      return;
    }
  }


  PoseManager.processingFrame =
    true;


  try {

    syncPoseCanvasSize();


    await PoseManager.pose.send({
      image: video
    });

  } catch (error) {

    console.error(
      "[POSE] Frame processing error:",
      error
    );

  } finally {

    PoseManager.processingFrame =
      false;
  }
}


/* =========================================================
   26. FPS
========================================================= */

function updatePoseFPS(
  timestamp
) {

  PoseManager.frameCount++;


  const elapsed =
    timestamp -
    PoseManager.lastFrameTime;


  if (
    elapsed < 1000
  ) {
    return;
  }


  PoseManager.fps =
    Math.round(
      (
        PoseManager.frameCount *
        1000
      ) /
      elapsed
    );


  PoseManager.frameCount =
    0;


  PoseManager.lastFrameTime =
    timestamp;


  document
    .querySelectorAll(
      "[data-pose-fps]"
    )
    .forEach(
      (element) => {

        element.textContent =
          `${PoseManager.fps} FPS`;
      }
    );
}


/* =========================================================
   27. START ANALYSIS
========================================================= */

function startPoseAnalysis() {

  if (
    !PoseManager.cameraRunning
  ) {

    SPLApp.showToast(
      "먼저 카메라를 시작해주세요.",
      "warning"
    );

    return false;
  }


  if (
    !PoseManager.pose
  ) {

    const success =
      initializePoseEngine();


    if (!success) {

      SPLApp.showToast(
        "AI 자세분석 엔진을 불러오지 못했습니다.",
        "error"
      );

      return false;
    }
  }


  PoseManager.analyzing =
    true;


  updateAnalysisUI(
    true
  );


  SPLApp.showToast(
    PoseManager.viewMode ===
    "front"
      ? "정면 자세분석을 시작합니다."
      : "측면 자세분석을 시작합니다."
  );


  return true;
}


/* =========================================================
   28. STOP ANALYSIS
========================================================= */

function stopPoseAnalysis(
  options = {}
) {

  const {
    silent = false
  } = options;


  PoseManager.analyzing =
    false;


  updateAnalysisUI(
    false
  );


  if (!silent) {

    SPLApp.showToast(
      "자세분석을 일시정지했습니다."
    );
  }
}


/* =========================================================
   29. TOGGLE ANALYSIS
========================================================= */

function togglePoseAnalysis() {

  if (
    PoseManager.analyzing
  ) {

    stopPoseAnalysis();

  } else {

    startPoseAnalysis();
  }
}


/* =========================================================
   30. ANALYSIS UI
========================================================= */

function updateAnalysisUI(
  active
) {

  const badge =
    document.querySelector(
      "#page-pose .live-analysis-badge"
    );


  const stage =
    getPoseStage();


  const button =
    getPoseAnalyzeButton();


  badge?.classList.toggle(
    "active",
    active
  );


  stage?.classList.toggle(
    "analysis-active",
    active
  );


  if (button) {

    if (active) {

      button.innerHTML = `
        <i class="fa-solid fa-pause"></i>
        분석 일시정지
      `;

    } else {

      button.innerHTML = `
        <i class="fa-solid fa-person-rays"></i>
        자세분석 시작
      `;
    }
  }
}


/* =========================================================
   31. MEDIAPIPE RESULTS
========================================================= */

function handlePoseResults(
  results
) {

  if (
    !PoseManager.analyzing
  ) {
    return;
  }


  PoseManager.latestLandmarks =
    results.poseLandmarks ||
    null;


  PoseManager.latestWorldLandmarks =
    results.poseWorldLandmarks ||
    null;


  if (
    !PoseManager.latestLandmarks
  ) {

    PoseManager.confidence =
      0;


    clearPoseCanvas();


    updatePoseDetectionStatus(
      false
    );


    return;
  }


  PoseManager.confidence =
    calculateLandmarkConfidence(
      PoseManager.latestLandmarks
    );


  updatePoseDetectionStatus(
    true
  );


  drawPoseSkeleton(
    PoseManager.latestLandmarks
  );


  /*
    Part 2에서 여기와 연결해서

    - 관절각도 계산
    - 정면 분석
    - 측면 분석
    - 좌우 균형
    - 자세 점수

    를 실시간으로 계산한다.
  */

  document.dispatchEvent(
    new CustomEvent(
      "spl:poselandmarks",
      {
        detail: {
          landmarks:
            PoseManager
              .latestLandmarks,

          worldLandmarks:
            PoseManager
              .latestWorldLandmarks,

          confidence:
            PoseManager
              .confidence,

          viewMode:
            PoseManager
              .viewMode
        }
      }
    )
  );
}


/* =========================================================
   32. LANDMARK CONFIDENCE
========================================================= */

function calculateLandmarkConfidence(
  landmarks
) {

  if (
    !Array.isArray(
      landmarks
    ) ||
    !landmarks.length
  ) {
    return 0;
  }


  const visible =
    landmarks
      .map(
        (landmark) =>
          Number(
            landmark.visibility ??
            0
          )
      )
      .filter(
        Number.isFinite
      );


  if (!visible.length) {
    return 0;
  }


  return SPLApp.clampScore(
    SPLApp.average(
      visible
    ) * 100
  );
}


/* =========================================================
   33. DRAW SKELETON
========================================================= */

function drawPoseSkeleton(
  landmarks
) {

  const canvas =
    getPoseCanvas();


  if (!canvas) {
    return;
  }


  const context =
    canvas.getContext(
      "2d"
    );


  if (!context) {
    return;
  }


  context.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  /*
    MediaPipe drawing_utils가
    index.html에서 로드된 경우 사용.
  */

  if (
    typeof window.drawConnectors ===
      "function" &&
    typeof window.POSE_CONNECTIONS !==
      "undefined"
  ) {

    window.drawConnectors(
      context,
      landmarks,
      window.POSE_CONNECTIONS,
      {
        color:
          "rgba(57, 156, 255, 0.88)",

        lineWidth:
          3
      }
    );
  }


  if (
    typeof window.drawLandmarks ===
    "function"
  ) {

    window.drawLandmarks(
      context,
      landmarks,
      {
        color:
          "rgba(224, 242, 255, 0.95)",

        fillColor:
          "rgba(38, 143, 255, 0.95)",

        lineWidth:
          1,

        radius:
          3
      }
    );
  }
}


/* =========================================================
   34. CLEAR CANVAS
========================================================= */

function clearPoseCanvas() {

  const canvas =
    getPoseCanvas();


  if (!canvas) {
    return;
  }


  const context =
    canvas.getContext(
      "2d"
    );


  context?.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );
}


/* =========================================================
   35. DETECTION STATUS
========================================================= */

function updatePoseDetectionStatus(
  detected
) {

  const elements =
    document.querySelectorAll(
      "[data-pose-detection]"
    );


  elements.forEach(
    (element) => {

      element.textContent =
        detected
          ? "BODY DETECTED"
          : "SEARCHING";


      element.classList.toggle(
        "active",
        detected
      );
    }
  );


  document
    .querySelectorAll(
      "[data-pose-confidence]"
    )
    .forEach(
      (element) => {

        element.textContent =
          detected
            ? `${Math.round(
                PoseManager.confidence
              )}%`
            : "--";
      }
    );
}


/* =========================================================
   36. SYSTEM STATUS
========================================================= */

function updatePoseSystemStatus(
  message,
  active
) {

  const status =
    document.querySelector(
      "#page-pose .analysis-status"
    );


  if (!status) {
    return;
  }


  status.classList.toggle(
    "active",
    active
  );


  const text =
    status.querySelector(
      "[data-analysis-status-text]"
    );


  if (text) {

    text.textContent =
      message;
  }
}


/* =========================================================
   37. CLEAR RESULT
========================================================= */

function clearPoseResult() {

  PoseManager.latestResult =
    null;


  document.dispatchEvent(
    new CustomEvent(
      "spl:poseclear"
    )
  );
}


/* =========================================================
   38. RESET UI
========================================================= */

function resetPoseUI() {

  updateCameraUI(
    false
  );


  updateAnalysisUI(
    false
  );


  updatePoseDetectionStatus(
    false
  );


  clearPoseCanvas();


  clearPoseResult();
}


/* =========================================================
   39. PAGE CHANGE
========================================================= */

document.addEventListener(
  "spl:pagechange",
  (event) => {

    const page =
      event.detail?.page;


    /*
      자세분석 화면을 벗어나도
      카메라가 계속 실행되는 문제 방지.
    */

    if (
      page !== "pose" &&
      PoseManager.cameraRunning
    ) {

      stopPoseCamera({
        silent: true
      });
    }


    if (
      page === "pose"
    ) {

      syncSelectedAthlete();

      updateViewModeUI();
    }
  }
);


/* =========================================================
   40. PAGE VISIBILITY
========================================================= */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.hidden &&
      PoseManager.analyzing
    ) {

      stopPoseAnalysis({
        silent: true
      });
    }
  }
);


/* =========================================================
   41. PAGE UNLOAD
========================================================= */

window.addEventListener(
  "beforeunload",
  () => {

    stopMediaStream();
  }
);


/* =========================================================
   42. GLOBAL POSE API
========================================================= */

window.SPLPose = {

  state:
    PoseManager,

  startCamera:
    startPoseCamera,

  stopCamera:
    stopPoseCamera,

  switchCamera:
    restartPoseCamera,

  startAnalysis:
    startPoseAnalysis,

  stopAnalysis:
    stopPoseAnalysis,

  toggleAnalysis:
    togglePoseAnalysis,

  clear:
    clearPoseResult,

  syncCanvas:
    syncPoseCanvasSize
};


/* =========================================================
   END OF pose.js PART 1
========================================================= */
/* =========================================================
   SEOLCHEON PERFORMANCE LAB
   pose.js

   PART 2 / 4
   Joint Angles / Front & Side Analysis / Symmetry / Score
========================================================= */


/* =========================================================
   43. MEDIAPIPE LANDMARK INDEX
========================================================= */

const POSE_POINT = {
  nose: 0,

  leftEyeInner: 1,
  leftEye: 2,
  leftEyeOuter: 3,

  rightEyeInner: 4,
  rightEye: 5,
  rightEyeOuter: 6,

  leftEar: 7,
  rightEar: 8,

  mouthLeft: 9,
  mouthRight: 10,

  leftShoulder: 11,
  rightShoulder: 12,

  leftElbow: 13,
  rightElbow: 14,

  leftWrist: 15,
  rightWrist: 16,

  leftPinky: 17,
  rightPinky: 18,

  leftIndex: 19,
  rightIndex: 20,

  leftThumb: 21,
  rightThumb: 22,

  leftHip: 23,
  rightHip: 24,

  leftKnee: 25,
  rightKnee: 26,

  leftAnkle: 27,
  rightAnkle: 28,

  leftHeel: 29,
  rightHeel: 30,

  leftFootIndex: 31,
  rightFootIndex: 32
};


/* =========================================================
   44. ANALYSIS STATE
========================================================= */

PoseManager.analysisHistory = [];

PoseManager.angleHistory = {};

PoseManager.lastAnalysisTime = 0;

PoseManager.analysisInterval = 100;

PoseManager.historyLimit = 30;


/* =========================================================
   45. LANDMARK EVENT
========================================================= */

document.addEventListener(
  "spl:poselandmarks",
  (event) => {

    if (
      !PoseManager.analyzing
    ) {
      return;
    }

    const now =
      performance.now();

    if (
      now -
      PoseManager.lastAnalysisTime <
      PoseManager.analysisInterval
    ) {
      return;
    }

    PoseManager.lastAnalysisTime =
      now;

    const landmarks =
      event.detail?.landmarks;

    if (
      !landmarks ||
      landmarks.length < 33
    ) {
      return;
    }

    analyzePoseLandmarks(
      landmarks
    );
  }
);


/* =========================================================
   46. MAIN ANALYSIS
========================================================= */

function analyzePoseLandmarks(
  landmarks
) {

  const quality =
    validatePoseLandmarks(
      landmarks
    );

  if (!quality.valid) {

    updatePoseQualityWarning(
      quality.message
    );

    return null;
  }

  updatePoseQualityWarning("");

  const angles =
    calculatePoseAngles(
      landmarks
    );

  const symmetry =
    calculatePoseSymmetry(
      landmarks,
      angles
    );

  let analysis;

  if (
    PoseManager.viewMode ===
    "side"
  ) {

    analysis =
      analyzeSidePose(
        landmarks,
        angles,
        symmetry
      );

  } else {

    analysis =
      analyzeFrontPose(
        landmarks,
        angles,
        symmetry
      );
  }

  analysis.timestamp =
    Date.now();

  analysis.viewMode =
    PoseManager.viewMode;

  analysis.confidence =
    PoseManager.confidence;

  analysis.angles =
    angles;

  analysis.symmetry =
    symmetry;

  PoseManager.latestResult =
    analysis;

  pushPoseHistory(
    analysis
  );

  renderPoseAnalysis(
    analysis
  );

  drawPoseMeasurements(
    landmarks,
    analysis
  );

  document.dispatchEvent(
    new CustomEvent(
      "spl:poseanalysis",
      {
        detail: analysis
      }
    )
  );

  return analysis;
}


/* =========================================================
   47. LANDMARK QUALITY
========================================================= */

function validatePoseLandmarks(
  landmarks
) {

  const importantPoints = [
    POSE_POINT.leftShoulder,
    POSE_POINT.rightShoulder,

    POSE_POINT.leftHip,
    POSE_POINT.rightHip,

    POSE_POINT.leftKnee,
    POSE_POINT.rightKnee,

    POSE_POINT.leftAnkle,
    POSE_POINT.rightAnkle
  ];

  const visible =
    importantPoints.filter(
      (index) => {

        const point =
          landmarks[index];

        return (
          point &&
          Number(
            point.visibility ?? 1
          ) >= 0.45
        );
      }
    );

  if (
    visible.length <
    6
  ) {

    return {
      valid: false,

      message:
        "전신이 화면에 들어오도록 카메라 위치를 조정해주세요."
    };
  }

  if (
    PoseManager.confidence <
    45
  ) {

    return {
      valid: false,

      message:
        "신체 인식 정확도가 낮습니다. 조명과 촬영 위치를 확인해주세요."
    };
  }

  return {
    valid: true,
    message: ""
  };
}


/* =========================================================
   48. POINT HELPERS
========================================================= */

function getPosePoint(
  landmarks,
  index
) {

  return landmarks[index] || {
    x: 0,
    y: 0,
    z: 0,
    visibility: 0
  };
}


function pointDistance(
  a,
  b
) {

  if (
    !a ||
    !b
  ) {
    return 0;
  }

  const dx =
    SPLApp.safeNumber(
      b.x
    ) -
    SPLApp.safeNumber(
      a.x
    );

  const dy =
    SPLApp.safeNumber(
      b.y
    ) -
    SPLApp.safeNumber(
      a.y
    );

  return Math.sqrt(
    dx * dx +
    dy * dy
  );
}


/* =========================================================
   49. MID POINT
========================================================= */

function midpoint(
  a,
  b
) {

  return {
    x:
      (
        SPLApp.safeNumber(a?.x) +
        SPLApp.safeNumber(b?.x)
      ) / 2,

    y:
      (
        SPLApp.safeNumber(a?.y) +
        SPLApp.safeNumber(b?.y)
      ) / 2,

    z:
      (
        SPLApp.safeNumber(a?.z) +
        SPLApp.safeNumber(b?.z)
      ) / 2
  };
}


/* =========================================================
   50. ANGLE BETWEEN THREE POINTS
========================================================= */

function calculateAngle(
  a,
  b,
  c
) {

  if (
    !a ||
    !b ||
    !c
  ) {
    return 0;
  }

  const radians =
    Math.atan2(
      c.y - b.y,
      c.x - b.x
    ) -
    Math.atan2(
      a.y - b.y,
      a.x - b.x
    );

  let angle =
    Math.abs(
      radians *
      180 /
      Math.PI
    );

  if (
    angle > 180
  ) {
    angle =
      360 - angle;
  }

  return SPLApp.roundNumber(
    angle,
    1
  );
}


/* =========================================================
   51. LINE ANGLE
========================================================= */

function calculateLineAngle(
  a,
  b
) {

  if (
    !a ||
    !b
  ) {
    return 0;
  }

  const angle =
    Math.atan2(
      b.y - a.y,
      b.x - a.x
    ) *
    180 /
    Math.PI;

  return SPLApp.roundNumber(
    angle,
    1
  );
}


/* =========================================================
   52. DEVIATION FROM HORIZONTAL
========================================================= */

function horizontalDeviation(
  a,
  b
) {

  let angle =
    Math.abs(
      calculateLineAngle(
        a,
        b
      )
    );

  while (
    angle > 180
  ) {
    angle -= 180;
  }

  if (
    angle > 90
  ) {
    angle =
      180 - angle;
  }

  return SPLApp.roundNumber(
    angle,
    1
  );
}


/* =========================================================
   53. DEVIATION FROM VERTICAL
========================================================= */

function verticalDeviation(
  a,
  b
) {

  const horizontal =
    horizontalDeviation(
      a,
      b
    );

  return SPLApp.roundNumber(
    Math.abs(
      90 -
      horizontal
    ),
    1
  );
}


/* =========================================================
   54. CALCULATE ALL JOINT ANGLES
========================================================= */

function calculatePoseAngles(
  landmarks
) {

  const leftShoulder =
    getPosePoint(
      landmarks,
      POSE_POINT.leftShoulder
    );

  const rightShoulder =
    getPosePoint(
      landmarks,
      POSE_POINT.rightShoulder
    );

  const leftElbow =
    getPosePoint(
      landmarks,
      POSE_POINT.leftElbow
    );

  const rightElbow =
    getPosePoint(
      landmarks,
      POSE_POINT.rightElbow
    );

  const leftWrist =
    getPosePoint(
      landmarks,
      POSE_POINT.leftWrist
    );

  const rightWrist =
    getPosePoint(
      landmarks,
      POSE_POINT.rightWrist
    );

  const leftHip =
    getPosePoint(
      landmarks,
      POSE_POINT.leftHip
    );

  const rightHip =
    getPosePoint(
      landmarks,
      POSE_POINT.rightHip
    );

  const leftKnee =
    getPosePoint(
      landmarks,
      POSE_POINT.leftKnee
    );

  const rightKnee =
    getPosePoint(
      landmarks,
      POSE_POINT.rightKnee
    );

  const leftAnkle =
    getPosePoint(
      landmarks,
      POSE_POINT.leftAnkle
    );

  const rightAnkle =
    getPosePoint(
      landmarks,
      POSE_POINT.rightAnkle
    );

  const leftFoot =
    getPosePoint(
      landmarks,
      POSE_POINT.leftFootIndex
    );

  const rightFoot =
    getPosePoint(
      landmarks,
      POSE_POINT.rightFootIndex
    );

  const shoulderCenter =
    midpoint(
      leftShoulder,
      rightShoulder
    );

  const hipCenter =
    midpoint(
      leftHip,
      rightHip
    );

  return {

    leftElbow:
      smoothPoseAngle(
        "leftElbow",
        calculateAngle(
          leftShoulder,
          leftElbow,
          leftWrist
        )
      ),

    rightElbow:
      smoothPoseAngle(
        "rightElbow",
        calculateAngle(
          rightShoulder,
          rightElbow,
          rightWrist
        )
      ),

    leftShoulder:
      smoothPoseAngle(
        "leftShoulder",
        calculateAngle(
          leftElbow,
          leftShoulder,
          leftHip
        )
      ),

    rightShoulder:
      smoothPoseAngle(
        "rightShoulder",
        calculateAngle(
          rightElbow,
          rightShoulder,
          rightHip
        )
      ),

    leftHip:
      smoothPoseAngle(
        "leftHip",
        calculateAngle(
          leftShoulder,
          leftHip,
          leftKnee
        )
      ),

    rightHip:
      smoothPoseAngle(
        "rightHip",
        calculateAngle(
          rightShoulder,
          rightHip,
          rightKnee
        )
      ),

    leftKnee:
      smoothPoseAngle(
        "leftKnee",
        calculateAngle(
          leftHip,
          leftKnee,
          leftAnkle
        )
      ),

    rightKnee:
      smoothPoseAngle(
        "rightKnee",
        calculateAngle(
          rightHip,
          rightKnee,
          rightAnkle
        )
      ),

    leftAnkle:
      smoothPoseAngle(
        "leftAnkle",
        calculateAngle(
          leftKnee,
          leftAnkle,
          leftFoot
        )
      ),

    rightAnkle:
      smoothPoseAngle(
        "rightAnkle",
        calculateAngle(
          rightKnee,
          rightAnkle,
          rightFoot
        )
      ),

    shoulderTilt:
      smoothPoseAngle(
        "shoulderTilt",
        horizontalDeviation(
          leftShoulder,
          rightShoulder
        )
      ),

    hipTilt:
      smoothPoseAngle(
        "hipTilt",
        horizontalDeviation(
          leftHip,
          rightHip
        )
      ),

    trunkLean:
      smoothPoseAngle(
        "trunkLean",
        verticalDeviation(
          hipCenter,
          shoulderCenter
        )
      )
  };
}


/* =========================================================
   55. ANGLE SMOOTHING
========================================================= */

function smoothPoseAngle(
  key,
  value
) {

  if (
    !Number.isFinite(
      value
    )
  ) {
    return 0;
  }

  if (
    !PoseManager.angleHistory[
      key
    ]
  ) {
    PoseManager.angleHistory[
      key
    ] = [];
  }

  const history =
    PoseManager.angleHistory[
      key
    ];

  history.push(
    value
  );

  if (
    history.length > 5
  ) {
    history.shift();
  }

  return SPLApp.roundNumber(
    SPLApp.average(
      history
    ),
    1
  );
}


/* =========================================================
   56. SYMMETRY
========================================================= */

function calculatePoseSymmetry(
  landmarks,
  angles
) {

  const leftShoulder =
    getPosePoint(
      landmarks,
      POSE_POINT.leftShoulder
    );

  const rightShoulder =
    getPosePoint(
      landmarks,
      POSE_POINT.rightShoulder
    );

  const leftHip =
    getPosePoint(
      landmarks,
      POSE_POINT.leftHip
    );

  const rightHip =
    getPosePoint(
      landmarks,
      POSE_POINT.rightHip
    );

  const leftKnee =
    getPosePoint(
      landmarks,
      POSE_POINT.leftKnee
    );

  const rightKnee =
    getPosePoint(
      landmarks,
      POSE_POINT.rightKnee
    );

  const leftAnkle =
    getPosePoint(
      landmarks,
      POSE_POINT.leftAnkle
    );

  const rightAnkle =
    getPosePoint(
      landmarks,
      POSE_POINT.rightAnkle
    );

  const elbowDifference =
    Math.abs(
      angles.leftElbow -
      angles.rightElbow
    );

  const shoulderDifference =
    Math.abs(
      angles.leftShoulder -
      angles.rightShoulder
    );

  const hipDifference =
    Math.abs(
      angles.leftHip -
      angles.rightHip
    );

  const kneeDifference =
    Math.abs(
      angles.leftKnee -
      angles.rightKnee
    );

  const ankleDifference =
    Math.abs(
      angles.leftAnkle -
      angles.rightAnkle
    );

  const shoulderHeightDifference =
    Math.abs(
      leftShoulder.y -
      rightShoulder.y
    );

  const hipHeightDifference =
    Math.abs(
      leftHip.y -
      rightHip.y
    );

  const kneeHeightDifference =
    Math.abs(
      leftKnee.y -
      rightKnee.y
    );

  const ankleHeightDifference =
    Math.abs(
      leftAnkle.y -
      rightAnkle.y
    );

  const anglePenalty =
    (
      elbowDifference +
      shoulderDifference +
      hipDifference +
      kneeDifference +
      ankleDifference
    ) / 5;

  const positionPenalty =
    (
      shoulderHeightDifference +
      hipHeightDifference +
      kneeHeightDifference +
      ankleHeightDifference
    ) / 4 * 300;

  const totalPenalty =
    anglePenalty * 1.4 +
    positionPenalty;

  const score =
    SPLApp.clampScore(
      100 -
      totalPenalty
    );

  return {

    score:
      SPLApp.roundNumber(
        score,
        1
      ),

    elbowDifference:
      SPLApp.roundNumber(
        elbowDifference,
        1
      ),

    shoulderDifference:
      SPLApp.roundNumber(
        shoulderDifference,
        1
      ),

    hipDifference:
      SPLApp.roundNumber(
        hipDifference,
        1
      ),

    kneeDifference:
      SPLApp.roundNumber(
        kneeDifference,
        1
      ),

    ankleDifference:
      SPLApp.roundNumber(
        ankleDifference,
        1
      ),

    shoulderTilt:
      angles.shoulderTilt,

    hipTilt:
      angles.hipTilt
  };
}


/* =========================================================
   57. FRONT ANALYSIS
========================================================= */

function analyzeFrontPose(
  landmarks,
  angles,
  symmetry
) {

  const shoulderScore =
    scoreFromDeviation(
      angles.shoulderTilt,
      2,
      12
    );

  const hipScore =
    scoreFromDeviation(
      angles.hipTilt,
      2,
      10
    );

  const trunkScore =
    scoreFromDeviation(
      angles.trunkLean,
      3,
      15
    );

  const symmetryScore =
    symmetry.score;

  const kneeScore =
    calculateFrontKneeScore(
      landmarks
    );

  const alignmentScore =
    SPLApp.clampScore(
      shoulderScore * 0.22 +
      hipScore * 0.22 +
      trunkScore * 0.16 +
      kneeScore * 0.20 +
      symmetryScore * 0.20
    );

  const stability =
    SPLApp.clampScore(
      symmetryScore * 0.45 +
      shoulderScore * 0.20 +
      hipScore * 0.20 +
      kneeScore * 0.15
    );

  const balance =
    SPLApp.clampScore(
      symmetryScore * 0.50 +
      hipScore * 0.25 +
      shoulderScore * 0.25
    );

  const efficiency =
    SPLApp.clampScore(
      alignmentScore * 0.65 +
      trunkScore * 0.35
    );

  const overall =
    SPLApp.clampScore(
      alignmentScore * 0.40 +
      stability * 0.25 +
      balance * 0.20 +
      efficiency * 0.15
    );

  const issues =
    createFrontIssues(
      angles,
      symmetry,
      kneeScore
    );

  return {

    type:
      "front",

    score:
      SPLApp.roundNumber(
        overall,
        1
      ),

    alignment:
      SPLApp.roundNumber(
        alignmentScore,
        1
      ),

    stability:
      SPLApp.roundNumber(
        stability,
        1
      ),

    balance:
      SPLApp.roundNumber(
        balance,
        1
      ),

    efficiency:
      SPLApp.roundNumber(
        efficiency,
        1
      ),

    kneeScore:
      SPLApp.roundNumber(
        kneeScore,
        1
      ),

    issues
  };
}


/* =========================================================
   58. FRONT KNEE ALIGNMENT
========================================================= */

function calculateFrontKneeScore(
  landmarks
) {

  const leftHip =
    getPosePoint(
      landmarks,
      POSE_POINT.leftHip
    );

  const rightHip =
    getPosePoint(
      landmarks,
      POSE_POINT.rightHip
    );

  const leftKnee =
    getPosePoint(
      landmarks,
      POSE_POINT.leftKnee
    );

  const rightKnee =
    getPosePoint(
      landmarks,
      POSE_POINT.rightKnee
    );

  const leftAnkle =
    getPosePoint(
      landmarks,
      POSE_POINT.leftAnkle
    );

  const rightAnkle =
    getPosePoint(
      landmarks,
      POSE_POINT.rightAnkle
    );

  const leftDeviation =
    calculateLateralJointDeviation(
      leftHip,
      leftKnee,
      leftAnkle
    );

  const rightDeviation =
    calculateLateralJointDeviation(
      rightHip,
      rightKnee,
      rightAnkle
    );

  const averageDeviation =
    (
      leftDeviation +
      rightDeviation
    ) / 2;

  return scoreFromDeviation(
    averageDeviation,
    0.015,
    0.12
  );
}


/* =========================================================
   59. LATERAL JOINT DEVIATION
========================================================= */

function calculateLateralJointDeviation(
  upper,
  joint,
  lower
) {

  if (
    !upper ||
    !joint ||
    !lower
  ) {
    return 0;
  }

  const expectedX =
    (
      upper.x +
      lower.x
    ) / 2;

  return Math.abs(
    joint.x -
    expectedX
  );
}


/* =========================================================
   60. SIDE ANALYSIS
========================================================= */

function analyzeSidePose(
  landmarks,
  angles,
  symmetry
) {

  const side =
    detectVisibleSide(
      landmarks
    );

  const prefix =
    side === "right"
      ? "right"
      : "left";

  const kneeAngle =
    angles[
      `${prefix}Knee`
    ];

  const hipAngle =
    angles[
      `${prefix}Hip`
    ];

  const shoulderAngle =
    angles[
      `${prefix}Shoulder`
    ];

  const trunkLean =
    angles.trunkLean;

  const kneeScore =
    scoreJointRange(
      kneeAngle,
      165,
      180,
      125,
      180
    );

  const hipScore =
    scoreJointRange(
      hipAngle,
      160,
      180,
      120,
      180
    );

  const trunkScore =
    scoreFromDeviation(
      trunkLean,
      4,
      25
    );

  const headScore =
    calculateHeadAlignmentScore(
      landmarks,
      side
    );

  const alignment =
    SPLApp.clampScore(
      kneeScore * 0.25 +
      hipScore * 0.25 +
      trunkScore * 0.30 +
      headScore * 0.20
    );

  const stability =
    SPLApp.clampScore(
      alignment * 0.65 +
      symmetry.score * 0.35
    );

  const balance =
    SPLApp.clampScore(
      trunkScore * 0.45 +
      headScore * 0.25 +
      hipScore * 0.30
    );

  const efficiency =
    SPLApp.clampScore(
      kneeScore * 0.25 +
      hipScore * 0.30 +
      trunkScore * 0.30 +
      headScore * 0.15
    );

  const overall =
    SPLApp.clampScore(
      alignment * 0.40 +
      stability * 0.20 +
      balance * 0.20 +
      efficiency * 0.20
    );

  const issues =
    createSideIssues({
      kneeAngle,
      hipAngle,
      trunkLean,
      headScore,
      side
    });

  return {

    type:
      "side",

    detectedSide:
      side,

    score:
      SPLApp.roundNumber(
        overall,
        1
      ),

    alignment:
      SPLApp.roundNumber(
        alignment,
        1
      ),

    stability:
      SPLApp.roundNumber(
        stability,
        1
      ),

    balance:
      SPLApp.roundNumber(
        balance,
        1
      ),

    efficiency:
      SPLApp.roundNumber(
        efficiency,
        1
      ),

    kneeAngle,

    hipAngle,

    shoulderAngle,

    trunkLean,

    headScore:
      SPLApp.roundNumber(
        headScore,
        1
      ),

    issues
  };
}


/* =========================================================
   61. DETECT VISIBLE SIDE
========================================================= */

function detectVisibleSide(
  landmarks
) {

  const leftIndexes = [
    POSE_POINT.leftShoulder,
    POSE_POINT.leftHip,
    POSE_POINT.leftKnee,
    POSE_POINT.leftAnkle
  ];

  const rightIndexes = [
    POSE_POINT.rightShoulder,
    POSE_POINT.rightHip,
    POSE_POINT.rightKnee,
    POSE_POINT.rightAnkle
  ];

  const leftVisibility =
    SPLApp.average(
      leftIndexes.map(
        (index) =>
          SPLApp.safeNumber(
            landmarks[index]
              ?.visibility
          )
      )
    );

  const rightVisibility =
    SPLApp.average(
      rightIndexes.map(
        (index) =>
          SPLApp.safeNumber(
            landmarks[index]
              ?.visibility
          )
      )
    );

  return (
    rightVisibility >
    leftVisibility
  )
    ? "right"
    : "left";
}


/* =========================================================
   62. HEAD ALIGNMENT
========================================================= */

function calculateHeadAlignmentScore(
  landmarks,
  side
) {

  const ear =
    getPosePoint(
      landmarks,
      side === "right"
        ? POSE_POINT.rightEar
        : POSE_POINT.leftEar
    );

  const shoulder =
    getPosePoint(
      landmarks,
      side === "right"
        ? POSE_POINT.rightShoulder
        : POSE_POINT.leftShoulder
    );

  const hip =
    getPosePoint(
      landmarks,
      side === "right"
        ? POSE_POINT.rightHip
        : POSE_POINT.leftHip
    );

  const bodyLength =
    pointDistance(
      shoulder,
      hip
    );

  if (
    bodyLength <= 0
  ) {
    return 0;
  }

  const forwardOffset =
    Math.abs(
      ear.x -
      shoulder.x
    ) /
    bodyLength;

  return scoreFromDeviation(
    forwardOffset,
    0.05,
    0.35
  );
}


/* =========================================================
   63. SCORE FROM DEVIATION
========================================================= */

function scoreFromDeviation(
  value,
  ideal,
  bad
) {

  const deviation =
    Math.abs(
      SPLApp.safeNumber(
        value
      )
    );

  if (
    deviation <= ideal
  ) {
    return 100;
  }

  if (
    deviation >= bad
  ) {
    return 40;
  }

  const ratio =
    (
      deviation -
      ideal
    ) /
    (
      bad -
      ideal
    );

  return SPLApp.clampScore(
    100 -
    ratio * 60
  );
}


/* =========================================================
   64. SCORE JOINT RANGE
========================================================= */

function scoreJointRange(
  value,
  idealMin,
  idealMax,
  limitMin,
  limitMax
) {

  const angle =
    SPLApp.safeNumber(
      value
    );

  if (
    angle >= idealMin &&
    angle <= idealMax
  ) {
    return 100;
  }

  if (
    angle < limitMin ||
    angle > limitMax
  ) {
    return 40;
  }

  let distance;

  let maximumDistance;

  if (
    angle < idealMin
  ) {

    distance =
      idealMin -
      angle;

    maximumDistance =
      idealMin -
      limitMin;

  } else {

    distance =
      angle -
      idealMax;

    maximumDistance =
      limitMax -
      idealMax;
  }

  if (
    maximumDistance <= 0
  ) {
    return 100;
  }

  return SPLApp.clampScore(
    100 -
    (
      distance /
      maximumDistance
    ) * 60
  );
}


/* =========================================================
   65. FRONT ISSUES
========================================================= */

function createFrontIssues(
  angles,
  symmetry,
  kneeScore
) {

  const issues = [];

  if (
    angles.shoulderTilt > 6
  ) {
    issues.push({
      level: "warning",
      joint: "shoulder",
      title: "어깨 높이 차이",
      value:
        angles.shoulderTilt,
      unit: "°"
    });
  }

  if (
    angles.hipTilt > 5
  ) {
    issues.push({
      level: "warning",
      joint: "hip",
      title: "골반 높이 차이",
      value:
        angles.hipTilt,
      unit: "°"
    });
  }

  if (
    symmetry.kneeDifference >
    12
  ) {
    issues.push({
      level: "warning",
      joint: "knee",
      title: "좌우 무릎 각도 차이",
      value:
        symmetry.kneeDifference,
      unit: "°"
    });
  }

  if (
    kneeScore < 70
  ) {
    issues.push({
      level: "danger",
      joint: "knee",
      title: "무릎 정렬 확인 필요",
      value:
        Math.round(
          kneeScore
        ),
      unit: "점"
    });
  }

  if (
    angles.trunkLean > 10
  ) {
    issues.push({
      level: "warning",
      joint: "trunk",
      title: "상체 기울기",
      value:
        angles.trunkLean,
      unit: "°"
    });
  }

  if (
    symmetry.score < 70
  ) {
    issues.push({
      level: "warning",
      joint: "symmetry",
      title: "좌우 비대칭",
      value:
        Math.round(
          symmetry.score
        ),
      unit: "점"
    });
  }

  return issues;
}


/* =========================================================
   66. SIDE ISSUES
========================================================= */

function createSideIssues({
  kneeAngle,
  hipAngle,
  trunkLean,
  headScore,
  side
}) {

  const issues = [];

  if (
    kneeAngle < 155
  ) {
    issues.push({
      level: "warning",
      joint: "knee",
      title:
        `${side === "left" ? "왼쪽" : "오른쪽"} 무릎 굴곡`,
      value:
        kneeAngle,
      unit: "°"
    });
  }

  if (
    hipAngle < 150
  ) {
    issues.push({
      level: "warning",
      joint: "hip",
      title: "고관절 굴곡 확인",
      value:
        hipAngle,
      unit: "°"
    });
  }

  if (
    trunkLean > 15
  ) {
    issues.push({
      level: "warning",
      joint: "trunk",
      title: "상체 전후 기울기",
      value:
        trunkLean,
      unit: "°"
    });
  }

  if (
    headScore < 70
  ) {
    issues.push({
      level: "warning",
      joint: "head",
      title: "머리-어깨 정렬 확인",
      value:
        Math.round(
          headScore
        ),
      unit: "점"
    });
  }

  return issues;
}


/* =========================================================
   67. ANALYSIS HISTORY
========================================================= */

function pushPoseHistory(
  result
) {

  PoseManager.analysisHistory.push(
    {
      score:
        result.score,

      stability:
        result.stability,

      balance:
        result.balance,

      efficiency:
        result.efficiency,

      timestamp:
        result.timestamp
    }
  );

  if (
    PoseManager.analysisHistory
      .length >
    PoseManager.historyLimit
  ) {

    PoseManager.analysisHistory
      .shift();
  }
}


/* =========================================================
   68. STABILIZED RESULT
========================================================= */

function getStabilizedPoseResult() {

  const history =
    PoseManager.analysisHistory;

  if (!history.length) {
    return null;
  }

  return {

    score:
      SPLApp.roundNumber(
        SPLApp.average(
          history.map(
            (item) =>
              item.score
          )
        ),
        1
      ),

    stability:
      SPLApp.roundNumber(
        SPLApp.average(
          history.map(
            (item) =>
              item.stability
          )
        ),
        1
      ),

    balance:
      SPLApp.roundNumber(
        SPLApp.average(
          history.map(
            (item) =>
              item.balance
          )
        ),
        1
      ),

    efficiency:
      SPLApp.roundNumber(
        SPLApp.average(
          history.map(
            (item) =>
              item.efficiency
          )
        ),
        1
      )
  };
}


/* =========================================================
   69. RENDER ANALYSIS
========================================================= */

function renderPoseAnalysis(
  result
) {

  setPoseText(
    [
      "poseOverallScore",
      "poseScore"
    ],
    Math.round(
      result.score
    )
  );

  setPoseText(
    [
      "poseStabilityScore",
      "poseStability"
    ],
    Math.round(
      result.stability
    )
  );

  setPoseText(
    [
      "poseBalanceScore",
      "poseBalance"
    ],
    Math.round(
      result.balance
    )
  );

  setPoseText(
    [
      "poseEfficiencyScore",
      "poseEfficiency"
    ],
    Math.round(
      result.efficiency
    )
  );

  setPoseText(
    [
      "poseShoulderAngle"
    ],
    `${result.angles.shoulderTilt}°`
  );

  setPoseText(
    [
      "poseHipAngle"
    ],
    `${result.angles.hipTilt}°`
  );

  setPoseText(
    [
      "poseLeftKneeAngle"
    ],
    `${result.angles.leftKnee}°`
  );

  setPoseText(
    [
      "poseRightKneeAngle"
    ],
    `${result.angles.rightKnee}°`
  );

  renderPoseIssueList(
    result.issues
  );

  updatePoseScoreRing(
    result.score
  );
}


/* =========================================================
   70. SET POSE TEXT
========================================================= */

function setPoseText(
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
   71. SCORE RING
========================================================= */

function updatePoseScoreRing(
  score
) {

  const rings =
    document.querySelectorAll(
      "[data-pose-score-ring]"
    );

  const value =
    SPLApp.clampScore(
      score
    );

  rings.forEach(
    (ring) => {

      ring.style.setProperty(
        "--score",
        `${value}`
      );

      ring.setAttribute(
        "data-score",
        Math.round(value)
      );
    }
  );
}


/* =========================================================
   72. ISSUE LIST
========================================================= */

function renderPoseIssueList(
  issues = []
) {

  const container =
    document.getElementById(
      "poseIssueList"
    );

  if (!container) {
    return;
  }

  if (!issues.length) {

    container.innerHTML = `
      <div class="pose-good-state">

        <i class="fa-solid fa-circle-check"></i>

        <div>
          <strong>
            안정적인 자세
          </strong>

          <span>
            현재 프레임에서 큰 정렬 이상이 감지되지 않았습니다.
          </span>
        </div>

      </div>
    `;

    return;
  }

  container.innerHTML =
    issues
      .slice(0, 5)
      .map(
        (issue) => `
          <div
            class="pose-issue ${SPLApp.escapeHTML(
              issue.level
            )}"
          >

            <div class="pose-issue-icon">
              <i class="fa-solid fa-triangle-exclamation"></i>
            </div>

            <div class="pose-issue-info">

              <strong>
                ${SPLApp.escapeHTML(
                  issue.title
                )}
              </strong>

              <span>
                ${SPLApp.escapeHTML(
                  issue.joint
                )}
              </span>

            </div>

            <div class="pose-issue-value">
              ${SPLApp.escapeHTML(
                issue.value
              )}${SPLApp.escapeHTML(
                issue.unit
              )}
            </div>

          </div>
        `
      )
      .join("");
}


/* =========================================================
   73. QUALITY WARNING
========================================================= */

function updatePoseQualityWarning(
  message
) {

  const element =
    document.getElementById(
      "poseQualityWarning"
    );

  if (!element) {
    return;
  }

  if (!message) {

    element.classList.remove(
      "show"
    );

    element.textContent = "";

    return;
  }

  element.textContent =
    message;

  element.classList.add(
    "show"
  );
}


/* =========================================================
   74. DRAW MEASUREMENTS
========================================================= */

function drawPoseMeasurements(
  landmarks,
  result
) {

  const canvas =
    getPoseCanvas();

  if (!canvas) {
    return;
  }

  const context =
    canvas.getContext(
      "2d"
    );

  if (!context) {
    return;
  }

  drawJointAngleLabel(
    context,
    canvas,
    landmarks[
      POSE_POINT.leftKnee
    ],
    result.angles.leftKnee
  );

  drawJointAngleLabel(
    context,
    canvas,
    landmarks[
      POSE_POINT.rightKnee
    ],
    result.angles.rightKnee
  );

  drawJointAngleLabel(
    context,
    canvas,
    landmarks[
      POSE_POINT.leftElbow
    ],
    result.angles.leftElbow
  );

  drawJointAngleLabel(
    context,
    canvas,
    landmarks[
      POSE_POINT.rightElbow
    ],
    result.angles.rightElbow
  );
}


/* =========================================================
   75. DRAW ANGLE LABEL
========================================================= */

function drawJointAngleLabel(
  context,
  canvas,
  point,
  angle
) {

  if (
    !point ||
    Number(
      point.visibility ?? 1
    ) < 0.45
  ) {
    return;
  }

  const x =
    point.x *
    canvas.width;

  const y =
    point.y *
    canvas.height;

  const text =
    `${Math.round(
      angle
    )}°`;

  context.save();

  context.font =
    "600 14px Arial";

  const metrics =
    context.measureText(
      text
    );

  const width =
    metrics.width + 14;

  const height =
    24;

  context.fillStyle =
    "rgba(5, 16, 28, 0.82)";

  context.fillRect(
    x + 8,
    y - 28,
    width,
    height
  );

  context.fillStyle =
    "rgba(232, 245, 255, 0.98)";

  context.fillText(
    text,
    x + 15,
    y - 11
  );

  context.restore();
}


/* =========================================================
   76. RESET ANALYSIS HISTORY
========================================================= */

function resetPoseAnalysisHistory() {

  PoseManager.analysisHistory =
    [];

  PoseManager.angleHistory =
    {};

  PoseManager.latestResult =
    null;
}


/* =========================================================
   77. CLEAR EVENT
========================================================= */

document.addEventListener(
  "spl:poseclear",
  () => {

    resetPoseAnalysisHistory();

    renderPoseIssueList(
      []
    );

    setPoseText(
      [
        "poseOverallScore",
        "poseScore",
        "poseStabilityScore",
        "poseStability",
        "poseBalanceScore",
        "poseBalance",
        "poseEfficiencyScore",
        "poseEfficiency"
      ],
      "--"
    );

    setPoseText(
      [
        "poseShoulderAngle",
        "poseHipAngle",
        "poseLeftKneeAngle",
        "poseRightKneeAngle"
      ],
      "--"
    );
  }
);


/* =========================================================
   78. EXTEND POSE API
========================================================= */

Object.assign(
  window.SPLPose,
  {

    analyze:
      analyzePoseLandmarks,

    calculateAngles:
      calculatePoseAngles,

    calculateSymmetry:
      calculatePoseSymmetry,

    getStableResult:
      getStabilizedPoseResult,

    resetHistory:
      resetPoseAnalysisHistory
  }
);


/* =========================================================
   END OF pose.js PART 2
========================================================= */
/* =========================================================
   SEOLCHEON PERFORMANCE LAB
   pose.js

   PART 3 / 4
   Sport Profiles / Movement Detection / Sport Scoring
========================================================= */


/* =========================================================
   79. SPORT ANALYSIS STATE
========================================================= */

PoseManager.sportMode = "general";

PoseManager.movementMode = "auto";

PoseManager.detectedMovement = "standing";

PoseManager.sportResult = null;


/* =========================================================
   80. SPORT PROFILES
========================================================= */

const POSE_SPORT_PROFILES = {

  general: {
    label: "기본 자세",

    category: "general",

    weights: {
      alignment: 0.30,
      stability: 0.25,
      balance: 0.25,
      efficiency: 0.20
    }
  },


  biathlon: {
    label: "바이애슬론",

    category: "winter",

    weights: {
      alignment: 0.20,
      stability: 0.30,
      balance: 0.25,
      efficiency: 0.25
    }
  },


  rollerski: {
    label: "롤러스키",

    category: "winter",

    weights: {
      alignment: 0.20,
      stability: 0.25,
      balance: 0.25,
      efficiency: 0.30
    }
  },


  crosscountry: {
    label: "크로스컨트리",

    category: "winter",

    weights: {
      alignment: 0.20,
      stability: 0.25,
      balance: 0.25,
      efficiency: 0.30
    }
  },


  running: {
    label: "러닝",

    category: "summer",

    weights: {
      alignment: 0.25,
      stability: 0.20,
      balance: 0.20,
      efficiency: 0.35
    }
  },


  soccer: {
    label: "축구",

    category: "summer",

    weights: {
      alignment: 0.20,
      stability: 0.25,
      balance: 0.30,
      efficiency: 0.25
    }
  },


  basketball: {
    label: "농구",

    category: "summer",

    weights: {
      alignment: 0.20,
      stability: 0.25,
      balance: 0.30,
      efficiency: 0.25
    }
  },


  volleyball: {
    label: "배구",

    category: "summer",

    weights: {
      alignment: 0.20,
      stability: 0.25,
      balance: 0.30,
      efficiency: 0.25
    }
  },


  squat: {
    label: "스쿼트",

    category: "weight",

    weights: {
      alignment: 0.30,
      stability: 0.25,
      balance: 0.25,
      efficiency: 0.20
    }
  },


  deadlift: {
    label: "데드리프트",

    category: "weight",

    weights: {
      alignment: 0.35,
      stability: 0.25,
      balance: 0.20,
      efficiency: 0.20
    }
  },


  lunge: {
    label: "런지",

    category: "weight",

    weights: {
      alignment: 0.25,
      stability: 0.25,
      balance: 0.30,
      efficiency: 0.20
    }
  },


  press: {
    label: "오버헤드 프레스",

    category: "weight",

    weights: {
      alignment: 0.30,
      stability: 0.25,
      balance: 0.20,
      efficiency: 0.25
    }
  },


  jump: {
    label: "점프",

    category: "functional",

    weights: {
      alignment: 0.20,
      stability: 0.25,
      balance: 0.25,
      efficiency: 0.30
    }
  }
};


/* =========================================================
   81. SPORT SELECTOR
========================================================= */

function initializePoseSportSelector() {

  const selector =
    document.getElementById(
      "poseSport"
    );

  if (!selector) {
    return;
  }

  if (
    POSE_SPORT_PROFILES[
      selector.value
    ]
  ) {

    PoseManager.sportMode =
      selector.value;
  }

  selector.addEventListener(
    "change",
    () => {

      const value =
        selector.value;

      PoseManager.sportMode =
        POSE_SPORT_PROFILES[value]
          ? value
          : "general";

      resetPoseAnalysisHistory();

      updateSportModeUI();

      SPLApp.showToast(
        `${getCurrentSportProfile().label} 분석 모드로 변경했습니다.`
      );
    }
  );
}


/* =========================================================
   82. MOVEMENT SELECTOR
========================================================= */

function initializeMovementSelector() {

  const selector =
    document.getElementById(
      "poseMovement"
    );

  if (!selector) {
    return;
  }

  PoseManager.movementMode =
    selector.value ||
    "auto";

  selector.addEventListener(
    "change",
    () => {

      PoseManager.movementMode =
        selector.value ||
        "auto";

      PoseManager.detectedMovement =
        "standing";

      resetPoseAnalysisHistory();

      updateMovementUI();
    }
  );
}


/* =========================================================
   83. CURRENT SPORT PROFILE
========================================================= */

function getCurrentSportProfile() {

  return (
    POSE_SPORT_PROFILES[
      PoseManager.sportMode
    ] ||
    POSE_SPORT_PROFILES.general
  );
}


/* =========================================================
   84. SPORT MODE UI
========================================================= */

function updateSportModeUI() {

  const profile =
    getCurrentSportProfile();

  document
    .querySelectorAll(
      "[data-pose-sport]"
    )
    .forEach(
      (element) => {

        element.textContent =
          profile.label;
      }
    );

  document
    .querySelectorAll(
      "[data-pose-category]"
    )
    .forEach(
      (element) => {

        element.textContent =
          profile.category
            .toUpperCase();
      }
    );
}


/* =========================================================
   85. MOVEMENT UI
========================================================= */

function updateMovementUI() {

  const movement =
    getCurrentMovement();

  const label =
    getMovementLabel(
      movement
    );

  document
    .querySelectorAll(
      "[data-pose-movement]"
    )
    .forEach(
      (element) => {

        element.textContent =
          label;
      }
    );
}


/* =========================================================
   86. MOVEMENT LABEL
========================================================= */

function getMovementLabel(
  movement
) {

  const labels = {
    auto: "자동 감지",

    standing: "기본 자세",

    squat: "스쿼트",

    lunge: "런지",

    running: "러닝",

    skiing: "스키 주행",

    shooting: "사격 자세",

    jump: "점프",

    press: "오버헤드",

    hinge: "힙 힌지"
  };

  return (
    labels[movement] ||
    movement ||
    "기본 자세"
  );
}


/* =========================================================
   87. CURRENT MOVEMENT
========================================================= */

function getCurrentMovement() {

  if (
    PoseManager.movementMode &&
    PoseManager.movementMode !==
      "auto"
  ) {

    return PoseManager
      .movementMode;
  }

  return (
    PoseManager.detectedMovement ||
    "standing"
  );
}


/* =========================================================
   88. MOVEMENT DETECTION
========================================================= */

function detectMovement(
  landmarks,
  angles
) {

  if (
    PoseManager.movementMode !==
    "auto"
  ) {

    return PoseManager
      .movementMode;
  }

  const averageKnee =
    SPLApp.average([
      angles.leftKnee,
      angles.rightKnee
    ]);

  const averageHip =
    SPLApp.average([
      angles.leftHip,
      angles.rightHip
    ]);

  const averageShoulder =
    SPLApp.average([
      angles.leftShoulder,
      angles.rightShoulder
    ]);

  const wristHeight =
    getAverageWristHeight(
      landmarks
    );

  const shoulderHeight =
    getAverageShoulderHeight(
      landmarks
    );

  const ankleDistance =
    pointDistance(
      landmarks[
        POSE_POINT.leftAnkle
      ],
      landmarks[
        POSE_POINT.rightAnkle
      ]
    );

  const hipDistance =
    pointDistance(
      landmarks[
        POSE_POINT.leftHip
      ],
      landmarks[
        POSE_POINT.rightHip
      ]
    );


  /*
    깊은 무릎 굴곡
  */

  if (
    averageKnee <
      125 &&
    averageHip <
      140
  ) {

    return "squat";
  }


  /*
    한쪽 무릎이 굽고
    반대쪽 다리가 상대적으로 펴진 상태
  */

  if (
    Math.abs(
      angles.leftKnee -
      angles.rightKnee
    ) > 28 &&
    Math.min(
      angles.leftKnee,
      angles.rightKnee
    ) < 145
  ) {

    return "lunge";
  }


  /*
    양손이 어깨보다 위
  */

  if (
    wristHeight <
      shoulderHeight -
      0.06 &&
    averageShoulder >
      120
  ) {

    return "press";
  }


  /*
    상체가 앞으로 기울고
    고관절 굴곡이 큰 경우
  */

  if (
    angles.trunkLean >
      20 &&
    averageHip <
      150 &&
    averageKnee >
      135
  ) {

    return "hinge";
  }


  /*
    다리 간격과 좌우 무릎 차이가
    동시에 커지면 이동 동작 가능성
  */

  if (
    ankleDistance >
      hipDistance * 1.7 &&
    Math.abs(
      angles.leftKnee -
      angles.rightKnee
    ) > 15
  ) {

    if (
      PoseManager.sportMode ===
        "rollerski" ||
      PoseManager.sportMode ===
        "crosscountry" ||
      PoseManager.sportMode ===
        "biathlon"
    ) {

      return "skiing";
    }

    return "running";
  }


  return "standing";
}


/* =========================================================
   89. AVERAGE WRIST HEIGHT
========================================================= */

function getAverageWristHeight(
  landmarks
) {

  return SPLApp.average([
    landmarks[
      POSE_POINT.leftWrist
    ]?.y,

    landmarks[
      POSE_POINT.rightWrist
    ]?.y
  ]);
}


/* =========================================================
   90. AVERAGE SHOULDER HEIGHT
========================================================= */

function getAverageShoulderHeight(
  landmarks
) {

  return SPLApp.average([
    landmarks[
      POSE_POINT.leftShoulder
    ]?.y,

    landmarks[
      POSE_POINT.rightShoulder
    ]?.y
  ]);
}


/* =========================================================
   91. SPORT SCORE
========================================================= */

function calculateSportScore(
  baseResult,
  landmarks
) {

  const profile =
    getCurrentSportProfile();

  const weights =
    profile.weights;

  let score =
    baseResult.alignment *
      weights.alignment +

    baseResult.stability *
      weights.stability +

    baseResult.balance *
      weights.balance +

    baseResult.efficiency *
      weights.efficiency;

  const movement =
    getCurrentMovement();

  const movementResult =
    evaluateMovement(
      movement,
      baseResult,
      landmarks
    );

  score =
    score * 0.72 +
    movementResult.score *
      0.28;

  return {

    sport:
      PoseManager.sportMode,

    sportLabel:
      profile.label,

    category:
      profile.category,

    movement,

    movementLabel:
      getMovementLabel(
        movement
      ),

    baseScore:
      SPLApp.roundNumber(
        baseResult.score,
        1
      ),

    movementScore:
      SPLApp.roundNumber(
        movementResult.score,
        1
      ),

    score:
      SPLApp.roundNumber(
        SPLApp.clampScore(
          score
        ),
        1
      ),

    feedback:
      movementResult.feedback,

    metrics:
      movementResult.metrics
  };
}


/* =========================================================
   92. MOVEMENT EVALUATION
========================================================= */

function evaluateMovement(
  movement,
  result,
  landmarks
) {

  switch (movement) {

    case "squat":
      return evaluateSquat(
        result,
        landmarks
      );

    case "lunge":
      return evaluateLunge(
        result,
        landmarks
      );

    case "running":
      return evaluateRunning(
        result,
        landmarks
      );

    case "skiing":
      return evaluateSkiing(
        result,
        landmarks
      );

    case "shooting":
      return evaluateShootingPose(
        result,
        landmarks
      );

    case "press":
      return evaluateOverhead(
        result,
        landmarks
      );

    case "hinge":
      return evaluateHinge(
        result,
        landmarks
      );

    case "jump":
      return evaluateJump(
        result,
        landmarks
      );

    case "standing":
    default:
      return evaluateStanding(
        result
      );
  }
}


/* =========================================================
   93. STANDING
========================================================= */

function evaluateStanding(
  result
) {

  const score =
    SPLApp.clampScore(
      result.alignment *
        0.35 +
      result.stability *
        0.25 +
      result.balance *
        0.25 +
      result.efficiency *
        0.15
    );

  return {

    score,

    feedback:
      score >= 85
        ? "기본 자세 정렬이 안정적입니다."
        : "어깨·골반·무릎의 좌우 정렬을 확인하세요.",

    metrics: {
      alignment:
        result.alignment,

      balance:
        result.balance
    }
  };
}


/* =========================================================
   94. SQUAT
========================================================= */

function evaluateSquat(
  result
) {

  const angles =
    result.angles;

  const knee =
    SPLApp.average([
      angles.leftKnee,
      angles.rightKnee
    ]);

  const hip =
    SPLApp.average([
      angles.leftHip,
      angles.rightHip
    ]);

  const kneeSymmetry =
    100 -
    Math.min(
      60,
      Math.abs(
        angles.leftKnee -
        angles.rightKnee
      ) * 3
    );

  const depthScore =
    scoreTargetRange(
      knee,
      75,
      120,
      45
    );

  const hipScore =
    scoreTargetRange(
      hip,
      65,
      125,
      50
    );

  const trunkScore =
    scoreFromDeviation(
      angles.trunkLean,
      15,
      45
    );

  const score =
    SPLApp.clampScore(
      depthScore * 0.25 +
      hipScore * 0.20 +
      kneeSymmetry * 0.25 +
      trunkScore * 0.15 +
      result.balance * 0.15
    );

  let feedback =
    "스쿼트 동작이 안정적입니다.";

  if (
    kneeSymmetry < 75
  ) {

    feedback =
      "좌우 무릎 굴곡 차이가 큽니다.";
  }

  if (
    angles.trunkLean > 35
  ) {

    feedback =
      "상체 기울기가 커지고 있습니다.";
  }

  return {

    score,

    feedback,

    metrics: {
      kneeAngle:
        SPLApp.roundNumber(
          knee,
          1
        ),

      hipAngle:
        SPLApp.roundNumber(
          hip,
          1
        ),

      kneeSymmetry:
        SPLApp.roundNumber(
          kneeSymmetry,
          1
        ),

      trunkLean:
        angles.trunkLean
    }
  };
}


/* =========================================================
   95. LUNGE
========================================================= */

function evaluateLunge(
  result
) {

  const angles =
    result.angles;

  const frontKnee =
    Math.min(
      angles.leftKnee,
      angles.rightKnee
    );

  const rearKnee =
    Math.max(
      angles.leftKnee,
      angles.rightKnee
    );

  const frontScore =
    scoreTargetRange(
      frontKnee,
      75,
      120,
      50
    );

  const rearScore =
    scoreTargetRange(
      rearKnee,
      130,
      180,
      50
    );

  const trunkScore =
    scoreFromDeviation(
      angles.trunkLean,
      8,
      35
    );

  const score =
    SPLApp.clampScore(
      frontScore * 0.30 +
      rearScore * 0.20 +
      trunkScore * 0.20 +
      result.balance * 0.30
    );

  return {

    score,

    feedback:
      score >= 80
        ? "런지 중심 이동이 비교적 안정적입니다."
        : "앞다리 무릎 정렬과 중심 이동을 확인하세요.",

    metrics: {
      frontKnee:
        frontKnee,

      rearKnee:
        rearKnee,

      trunkLean:
        angles.trunkLean
    }
  };
}


/* =========================================================
   96. RUNNING
========================================================= */

function evaluateRunning(
  result
) {

  const angles =
    result.angles;

  const kneeDifference =
    Math.abs(
      angles.leftKnee -
      angles.rightKnee
    );

  const elbowDifference =
    Math.abs(
      angles.leftElbow -
      angles.rightElbow
    );

  const trunkScore =
    scoreTargetRange(
      angles.trunkLean,
      3,
      18,
      30
    );

  const armScore =
    SPLApp.clampScore(
      100 -
      elbowDifference * 2
    );

  const legActivity =
    SPLApp.clampScore(
      55 +
      kneeDifference * 1.5
    );

  const score =
    SPLApp.clampScore(
      trunkScore * 0.30 +
      armScore * 0.20 +
      legActivity * 0.20 +
      result.balance * 0.15 +
      result.efficiency * 0.15
    );

  return {

    score,

    feedback:
      score >= 82
        ? "러닝 자세의 상체 안정성과 팔다리 협응이 좋습니다."
        : "상체 흔들림과 좌우 팔 동작 차이를 확인하세요.",

    metrics: {
      trunkLean:
        angles.trunkLean,

      kneeDifference:
        kneeDifference,

      elbowDifference:
        elbowDifference
    }
  };
}


/* =========================================================
   97. SKIING / ROLLERSKI
========================================================= */

function evaluateSkiing(
  result
) {

  const angles =
    result.angles;

  const knee =
    SPLApp.average([
      angles.leftKnee,
      angles.rightKnee
    ]);

  const hip =
    SPLApp.average([
      angles.leftHip,
      angles.rightHip
    ]);

  const kneeScore =
    scoreTargetRange(
      knee,
      125,
      175,
      45
    );

  const hipScore =
    scoreTargetRange(
      hip,
      120,
      175,
      45
    );

  const trunkScore =
    scoreTargetRange(
      angles.trunkLean,
      5,
      35,
      35
    );

  const symmetryScore =
    result.symmetry.score;

  const score =
    SPLApp.clampScore(
      kneeScore * 0.20 +
      hipScore * 0.20 +
      trunkScore * 0.25 +
      symmetryScore * 0.15 +
      result.balance * 0.20
    );

  let feedback =
    "스키 주행 자세의 중심과 상체 각도가 안정적입니다.";

  if (
    result.balance < 70
  ) {

    feedback =
      "좌우 체중 이동과 중심 안정성을 확인하세요.";

  } else if (
    angles.trunkLean > 35
  ) {

    feedback =
      "상체가 과도하게 기울지 않도록 확인하세요.";
  }

  return {

    score,

    feedback,

    metrics: {
      kneeAngle:
        SPLApp.roundNumber(
          knee,
          1
        ),

      hipAngle:
        SPLApp.roundNumber(
          hip,
          1
        ),

      trunkLean:
        angles.trunkLean,

      symmetry:
        symmetryScore
    }
  };
}


/* =========================================================
   98. BIATHLON SHOOTING POSTURE
========================================================= */

function evaluateShootingPose(
  result
) {

  const angles =
    result.angles;

  const shoulderDifference =
    Math.abs(
      angles.leftShoulder -
      angles.rightShoulder
    );

  const elbowDifference =
    Math.abs(
      angles.leftElbow -
      angles.rightElbow
    );

  const shoulderLevel =
    scoreFromDeviation(
      angles.shoulderTilt,
      3,
      15
    );

  const hipLevel =
    scoreFromDeviation(
      angles.hipTilt,
      3,
      12
    );

  const trunkScore =
    scoreFromDeviation(
      angles.trunkLean,
      10,
      40
    );

  const upperBodyControl =
    SPLApp.clampScore(
      100 -
      shoulderDifference *
        1.2 -
      elbowDifference *
        0.5
    );

  const score =
    SPLApp.clampScore(
      shoulderLevel * 0.25 +
      hipLevel * 0.20 +
      trunkScore * 0.20 +
      upperBodyControl * 0.20 +
      result.stability * 0.15
    );

  return {

    score,

    feedback:
      score >= 82
        ? "사격 자세의 상체 정렬과 안정성이 좋습니다."
        : "어깨선과 몸통 안정성을 중심으로 자세를 확인하세요.",

    metrics: {
      shoulderTilt:
        angles.shoulderTilt,

      hipTilt:
        angles.hipTilt,

      trunkLean:
        angles.trunkLean,

      upperBodyControl:
        SPLApp.roundNumber(
          upperBodyControl,
          1
        )
    }
  };
}


/* =========================================================
   99. OVERHEAD
========================================================= */

function evaluateOverhead(
  result
) {

  const angles =
    result.angles;

  const shoulder =
    SPLApp.average([
      angles.leftShoulder,
      angles.rightShoulder
    ]);

  const elbow =
    SPLApp.average([
      angles.leftElbow,
      angles.rightElbow
    ]);

  const shoulderScore =
    scoreTargetRange(
      shoulder,
      145,
      180,
      45
    );

  const elbowScore =
    scoreTargetRange(
      elbow,
      155,
      180,
      40
    );

  const trunkScore =
    scoreFromDeviation(
      angles.trunkLean,
      5,
      30
    );

  const score =
    SPLApp.clampScore(
      shoulderScore * 0.30 +
      elbowScore * 0.25 +
      trunkScore * 0.20 +
      result.stability * 0.15 +
      result.balance * 0.10
    );

  return {

    score,

    feedback:
      score >= 80
        ? "오버헤드 자세의 팔과 몸통 정렬이 안정적입니다."
        : "팔의 좌우 높이와 몸통 기울기를 확인하세요.",

    metrics: {
      shoulderAngle:
        SPLApp.roundNumber(
          shoulder,
          1
        ),

      elbowAngle:
        SPLApp.roundNumber(
          elbow,
          1
        ),

      trunkLean:
        angles.trunkLean
    }
  };
}


/* =========================================================
   100. HIP HINGE
========================================================= */

function evaluateHinge(
  result
) {

  const angles =
    result.angles;

  const hip =
    SPLApp.average([
      angles.leftHip,
      angles.rightHip
    ]);

  const knee =
    SPLApp.average([
      angles.leftKnee,
      angles.rightKnee
    ]);

  const hipScore =
    scoreTargetRange(
      hip,
      80,
      145,
      50
    );

  const kneeScore =
    scoreTargetRange(
      knee,
      135,
      180,
      40
    );

  const symmetry =
    result.symmetry.score;

  const score =
    SPLApp.clampScore(
      hipScore * 0.30 +
      kneeScore * 0.20 +
      symmetry * 0.20 +
      result.stability * 0.15 +
      result.balance * 0.15
    );

  return {

    score,

    feedback:
      score >= 80
        ? "힙 힌지 동작의 고관절 사용과 균형이 안정적입니다."
        : "무릎보다 고관절 중심으로 움직이는지 확인하세요.",

    metrics: {
      hipAngle:
        SPLApp.roundNumber(
          hip,
          1
        ),

      kneeAngle:
        SPLApp.roundNumber(
          knee,
          1
        ),

      symmetry
    }
  };
}


/* =========================================================
   101. JUMP
========================================================= */

function evaluateJump(
  result
) {

  const angles =
    result.angles;

  const knee =
    SPLApp.average([
      angles.leftKnee,
      angles.rightKnee
    ]);

  const kneeDifference =
    Math.abs(
      angles.leftKnee -
      angles.rightKnee
    );

  const symmetryScore =
    SPLApp.clampScore(
      100 -
      kneeDifference * 3
    );

  const landingScore =
    scoreTargetRange(
      knee,
      80,
      165,
      60
    );

  const score =
    SPLApp.clampScore(
      landingScore * 0.30 +
      symmetryScore * 0.30 +
      result.balance * 0.25 +
      result.stability * 0.15
    );

  return {

    score,

    feedback:
      score >= 80
        ? "점프 동작의 좌우 균형이 안정적입니다."
        : "착지 시 좌우 무릎 정렬과 균형을 확인하세요.",

    metrics: {
      kneeAngle:
        SPLApp.roundNumber(
          knee,
          1
        ),

      kneeDifference:
        SPLApp.roundNumber(
          kneeDifference,
          1
        )
    }
  };
}


/* =========================================================
   102. TARGET RANGE SCORE
========================================================= */

function scoreTargetRange(
  value,
  minimum,
  maximum,
  tolerance = 30
) {

  const number =
    SPLApp.safeNumber(
      value
    );

  if (
    number >= minimum &&
    number <= maximum
  ) {

    return 100;
  }

  const distance =
    number < minimum
      ? minimum - number
      : number - maximum;

  return SPLApp.clampScore(
    100 -
    (
      distance /
      Math.max(
        tolerance,
        1
      )
    ) * 60
  );
}


/* =========================================================
   103. APPLY SPORT ANALYSIS
========================================================= */

document.addEventListener(
  "spl:poseanalysis",
  (event) => {

    const result =
      event.detail;

    if (!result) {
      return;
    }

    const landmarks =
      PoseManager.latestLandmarks;

    if (!landmarks) {
      return;
    }

    PoseManager.detectedMovement =
      detectMovement(
        landmarks,
        result.angles
      );

    const sportResult =
      calculateSportScore(
        result,
        landmarks
      );

    PoseManager.sportResult =
      sportResult;

    /*
      종목 점수를 최종 실시간 점수로 사용.
    */

    result.basePoseScore =
      result.score;

    result.score =
      sportResult.score;

    result.sport =
      sportResult.sport;

    result.sportLabel =
      sportResult.sportLabel;

    result.movement =
      sportResult.movement;

    result.movementLabel =
      sportResult.movementLabel;

    result.movementScore =
      sportResult.movementScore;

    result.sportFeedback =
      sportResult.feedback;

    result.sportMetrics =
      sportResult.metrics;

    updateMovementUI();

    renderSportAnalysis(
      sportResult
    );
  }
);


/* =========================================================
   104. RENDER SPORT RESULT
========================================================= */

function renderSportAnalysis(
  result
) {

  if (!result) {
    return;
  }

  setPoseText(
    [
      "poseOverallScore",
      "poseScore"
    ],
    Math.round(
      result.score
    )
  );

  setPoseText(
    [
      "poseMovementScore"
    ],
    Math.round(
      result.movementScore
    )
  );

  setPoseText(
    [
      "poseSportName"
    ],
    result.sportLabel
  );

  setPoseText(
    [
      "poseMovementName"
    ],
    result.movementLabel
  );


  const feedback =
    document.getElementById(
      "poseSportFeedback"
    );

  if (feedback) {

    feedback.textContent =
      result.feedback ||
      "분석 중입니다.";
  }


  updatePoseScoreRing(
    result.score
  );


  renderSportMetrics(
    result.metrics
  );
}


/* =========================================================
   105. SPORT METRICS
========================================================= */

function renderSportMetrics(
  metrics = {}
) {

  const container =
    document.getElementById(
      "poseSportMetrics"
    );

  if (!container) {
    return;
  }

  const entries =
    Object.entries(
      metrics
    );

  if (!entries.length) {

    container.innerHTML = `
      <div class="empty-state">
        종목별 측정값을 분석 중입니다.
      </div>
    `;

    return;
  }

  container.innerHTML =
    entries
      .slice(0, 6)
      .map(
        ([key, value]) => {

          return `
            <div class="pose-metric-item">

              <span>
                ${SPLApp.escapeHTML(
                  getMetricLabel(
                    key
                  )
                )}
              </span>

              <strong>
                ${SPLApp.escapeHTML(
                  formatMetricValue(
                    key,
                    value
                  )
                )}
              </strong>

            </div>
          `;
        }
      )
      .join("");
}


/* =========================================================
   106. METRIC LABEL
========================================================= */

function getMetricLabel(
  key
) {

  const labels = {

    alignment:
      "정렬",

    balance:
      "균형",

    kneeAngle:
      "무릎 각도",

    hipAngle:
      "고관절 각도",

    shoulderAngle:
      "어깨 각도",

    elbowAngle:
      "팔꿈치 각도",

    trunkLean:
      "몸통 기울기",

    symmetry:
      "좌우 대칭",

    kneeSymmetry:
      "무릎 대칭",

    kneeDifference:
      "무릎 좌우차",

    elbowDifference:
      "팔꿈치 좌우차",

    shoulderTilt:
      "어깨 기울기",

    hipTilt:
      "골반 기울기",

    upperBodyControl:
      "상체 안정",

    frontKnee:
      "앞 무릎",

    rearKnee:
      "뒤 무릎"
  };

  return (
    labels[key] ||
    key
  );
}


/* =========================================================
   107. METRIC VALUE
========================================================= */

function formatMetricValue(
  key,
  value
) {

  if (
    !Number.isFinite(
      Number(value)
    )
  ) {

    return String(
      value ?? "-"
    );
  }

  const number =
    SPLApp.roundNumber(
      value,
      1
    );

  const angleKeys = [
    "kneeAngle",
    "hipAngle",
    "shoulderAngle",
    "elbowAngle",
    "trunkLean",
    "kneeDifference",
    "elbowDifference",
    "shoulderTilt",
    "hipTilt",
    "frontKnee",
    "rearKnee"
  ];

  if (
    angleKeys.includes(
      key
    )
  ) {

    return `${number}°`;
  }

  return `${number}`;
}


/* =========================================================
   108. BIATHLON SHOOTING MODE
========================================================= */

function setBiathlonShootingMode() {

  PoseManager.sportMode =
    "biathlon";

  PoseManager.movementMode =
    "shooting";

  const sportSelector =
    document.getElementById(
      "poseSport"
    );

  const movementSelector =
    document.getElementById(
      "poseMovement"
    );

  if (sportSelector) {

    sportSelector.value =
      "biathlon";
  }

  if (movementSelector) {

    movementSelector.value =
      "shooting";
  }

  resetPoseAnalysisHistory();

  updateSportModeUI();

  updateMovementUI();

  SPLApp.showToast(
    "바이애슬론 사격 자세 분석 모드입니다."
  );
}


/* =========================================================
   109. ROLLERSKI MODE
========================================================= */

function setRollerskiMode() {

  PoseManager.sportMode =
    "rollerski";

  PoseManager.movementMode =
    "skiing";

  const sportSelector =
    document.getElementById(
      "poseSport"
    );

  const movementSelector =
    document.getElementById(
      "poseMovement"
    );

  if (sportSelector) {

    sportSelector.value =
      "rollerski";
  }

  if (movementSelector) {

    movementSelector.value =
      "skiing";
  }

  resetPoseAnalysisHistory();

  updateSportModeUI();

  updateMovementUI();

  SPLApp.showToast(
    "롤러스키 자세 분석 모드입니다."
  );
}


/* =========================================================
   110. SPORT PRESET BUTTONS
========================================================= */

function initializeSportPresetButtons() {

  document
    .querySelectorAll(
      "[data-pose-sport-preset]"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            const preset =
              button.dataset
                .poseSportPreset;

            if (
              preset ===
              "biathlon-shooting"
            ) {

              setBiathlonShootingMode();

              return;
            }

            if (
              preset ===
              "rollerski"
            ) {

              setRollerskiMode();

              return;
            }

            if (
              POSE_SPORT_PROFILES[
                preset
              ]
            ) {

              PoseManager.sportMode =
                preset;

              const selector =
                document.getElementById(
                  "poseSport"
                );

              if (selector) {

                selector.value =
                  preset;
              }

              resetPoseAnalysisHistory();

              updateSportModeUI();

              SPLApp.showToast(
                `${getCurrentSportProfile().label} 분석 모드입니다.`
              );
            }
          }
        );
      }
    );
}


/* =========================================================
   111. SPORT SUMMARY
========================================================= */

function getPoseSportSummary() {

  const result =
    PoseManager.sportResult;

  if (!result) {

    return {
      sport:
        getCurrentSportProfile()
          .label,

      movement:
        getMovementLabel(
          getCurrentMovement()
        ),

      score: 0,

      feedback:
        "아직 분석 결과가 없습니다."
    };
  }

  return {
    ...result
  };
}


/* =========================================================
   112. RESET SPORT RESULT
========================================================= */

document.addEventListener(
  "spl:poseclear",
  () => {

    PoseManager.sportResult =
      null;

    PoseManager.detectedMovement =
      "standing";

    updateMovementUI();

    const feedback =
      document.getElementById(
        "poseSportFeedback"
      );

    if (feedback) {

      feedback.textContent =
        "카메라를 시작하고 자세를 분석해주세요.";
    }

    const metrics =
      document.getElementById(
        "poseSportMetrics"
      );

    if (metrics) {

      metrics.innerHTML = "";
    }
  }
);


/* =========================================================
   113. INITIALIZE PART 3
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initializePoseSportSelector();

    initializeMovementSelector();

    initializeSportPresetButtons();

    updateSportModeUI();

    updateMovementUI();
  }
);


/* =========================================================
   114. EXTEND POSE API
========================================================= */

Object.assign(
  window.SPLPose,
  {

    sportProfiles:
      POSE_SPORT_PROFILES,

    setSport(
      sport
    ) {

      if (
        !POSE_SPORT_PROFILES[
          sport
        ]
      ) {

        return false;
      }

      PoseManager.sportMode =
        sport;

      updateSportModeUI();

      resetPoseAnalysisHistory();

      return true;
    },


    setMovement(
      movement
    ) {

      PoseManager.movementMode =
        movement || "auto";

      updateMovementUI();

      resetPoseAnalysisHistory();
    },


    getSportSummary:
      getPoseSportSummary,

    setBiathlonShooting:
      setBiathlonShootingMode,

    setRollerski:
      setRollerskiMode
  }
);


/* =========================================================
   END OF pose.js PART 3
========================================================= */
/* =========================================================
   SEOLCHEON PERFORMANCE LAB
   pose.js

   PART 4 / 4
   Final Result / Save / Auto Opinion / Report Integration
========================================================= */


/* =========================================================
   115. FINAL ANALYSIS STATE
========================================================= */

PoseManager.finalResult = null;

PoseManager.analysisStartedAt = null;

PoseManager.lastSavedRecordId = null;

PoseManager.captureCanvas = null;


/* =========================================================
   116. ANALYSIS START TIME
========================================================= */

document.addEventListener(
  "spl:poselandmarks",
  () => {

    if (
      PoseManager.analyzing &&
      !PoseManager.analysisStartedAt
    ) {

      PoseManager.analysisStartedAt =
        Date.now();
    }
  }
);


/* =========================================================
   117. GET FINAL ANALYSIS RESULT
========================================================= */

function getFinalPoseResult() {

  const latest =
    PoseManager.latestResult;

  const stable =
    getStabilizedPoseResult();

  const sport =
    PoseManager.sportResult;

  if (
    !latest ||
    !stable
  ) {

    return null;
  }

  const finalScore =
    sport
      ? SPLApp.roundNumber(
          sport.score * 0.60 +
          stable.score * 0.40,
          1
        )
      : stable.score;

  return {

    score:
      SPLApp.clampScore(
        finalScore
      ),

    stability:
      stable.stability,

    balance:
      stable.balance,

    efficiency:
      stable.efficiency,

    alignment:
      SPLApp.roundNumber(
        latest.alignment,
        1
      ),

    confidence:
      SPLApp.roundNumber(
        PoseManager.confidence,
        1
      ),

    viewMode:
      PoseManager.viewMode,

    sport:
      PoseManager.sportMode,

    sportLabel:
      sport?.sportLabel ||
      getCurrentSportProfile()
        .label,

    movement:
      sport?.movement ||
      getCurrentMovement(),

    movementLabel:
      sport?.movementLabel ||
      getMovementLabel(
        getCurrentMovement()
      ),

    movementScore:
      sport?.movementScore ||
      latest.score,

    angles: {
      ...latest.angles
    },

    symmetry: {
      ...latest.symmetry
    },

    issues:
      Array.isArray(
        latest.issues
      )
        ? [...latest.issues]
        : [],

    sportMetrics: {
      ...(
        sport?.metrics ||
        {}
      )
    },

    sportFeedback:
      sport?.feedback ||
      "",

    frames:
      PoseManager.analysisHistory
        .length,

    duration:
      getPoseAnalysisDuration(),

    createdAt:
      new Date()
        .toISOString()
  };
}


/* =========================================================
   118. ANALYSIS DURATION
========================================================= */

function getPoseAnalysisDuration() {

  if (
    !PoseManager.analysisStartedAt
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.round(
      (
        Date.now() -
        PoseManager.analysisStartedAt
      ) / 1000
    )
  );
}


/* =========================================================
   119. FINALIZE ANALYSIS
========================================================= */

function finalizePoseAnalysis() {

  if (
    !PoseManager.latestResult
  ) {

    SPLApp.showToast(
      "아직 분석된 자세 데이터가 없습니다.",
      "warning"
    );

    return null;
  }

  if (
    PoseManager.analysisHistory
      .length < 3
  ) {

    SPLApp.showToast(
      "분석 데이터가 부족합니다. 자세를 잠시 유지한 뒤 다시 시도해주세요.",
      "warning"
    );

    return null;
  }

  const result =
    getFinalPoseResult();

  if (!result) {

    SPLApp.showToast(
      "최종 분석 결과를 생성하지 못했습니다.",
      "error"
    );

    return null;
  }

  result.opinion =
    createPoseAutoOpinion(
      result
    );

  result.grade =
    getPoseGrade(
      result.score
    );

  result.summary =
    createPoseSummary(
      result
    );

  PoseManager.finalResult =
    result;

  stopPoseAnalysis({
    silent: true
  });

  renderFinalPoseResult(
    result
  );

  document.dispatchEvent(
    new CustomEvent(
      "spl:posefinalized",
      {
        detail: result
      }
    )
  );

  SPLApp.showToast(
    "자세분석 결과가 확정되었습니다."
  );

  return result;
}


/* =========================================================
   120. SCORE GRADE
========================================================= */

function getPoseGrade(
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
   121. SCORE LEVEL
========================================================= */

function getPoseLevelText(
  score
) {

  const value =
    SPLApp.safeNumber(
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

  return "집중 점검";
}


/* =========================================================
   122. AUTO OPINION
========================================================= */

function createPoseAutoOpinion(
  result
) {

  const positives = [];

  const improvements = [];

  if (
    result.stability >= 85
  ) {

    positives.push(
      "자세 안정성이 우수합니다."
    );

  } else if (
    result.stability < 70
  ) {

    improvements.push(
      "동작 중 중심 흔들림을 줄이고 자세 안정성을 높일 필요가 있습니다."
    );
  }


  if (
    result.balance >= 85
  ) {

    positives.push(
      "좌우 균형이 안정적으로 유지되고 있습니다."
    );

  } else if (
    result.balance < 70
  ) {

    improvements.push(
      "좌우 체중 분배와 신체 정렬을 확인하세요."
    );
  }


  if (
    result.efficiency >= 85
  ) {

    positives.push(
      "동작 효율이 좋은 수준입니다."
    );

  } else if (
    result.efficiency < 70
  ) {

    improvements.push(
      "불필요한 상체 움직임을 줄이고 동작 연결을 부드럽게 만드는 것이 좋습니다."
    );
  }


  if (
    result.alignment >= 85
  ) {

    positives.push(
      "주요 관절 정렬이 안정적입니다."
    );

  } else if (
    result.alignment < 70
  ) {

    improvements.push(
      "어깨·골반·무릎의 정렬을 우선적으로 점검하세요."
    );
  }


  if (
    result.symmetry?.score >= 85
  ) {

    positives.push(
      "좌우 관절 움직임의 대칭성이 좋습니다."
    );

  } else if (
    result.symmetry?.score < 70
  ) {

    improvements.push(
      "좌우 관절 각도 차이가 커지지 않는지 확인할 필요가 있습니다."
    );
  }


  if (
    result.angles?.shoulderTilt > 6
  ) {

    improvements.push(
      "어깨선의 좌우 높이 차이를 줄이는 데 집중하세요."
    );
  }


  if (
    result.angles?.hipTilt > 5
  ) {

    improvements.push(
      "골반이 한쪽으로 기울어지지 않도록 중심을 확인하세요."
    );
  }


  if (
    result.angles?.trunkLean > 20
  ) {

    improvements.push(
      "몸통 기울기가 커지고 있으므로 상체 중심 위치를 점검하세요."
    );
  }


  if (
    result.sportFeedback
  ) {

    improvements.push(
      result.sportFeedback
    );
  }


  const positiveText =
    positives.length
      ? positives
          .slice(0, 3)
          .join(" ")
      : "전반적인 자세 데이터를 정상적으로 분석했습니다.";


  const improvementText =
    improvements.length
      ? improvements
          .filter(
            (
              value,
              index,
              array
            ) =>
              array.indexOf(
                value
              ) === index
          )
          .slice(0, 4)
          .join(" ")
      : "현재 분석에서는 큰 보완 항목이 확인되지 않았습니다.";


  return {
    positive:
      positiveText,

    improvement:
      improvementText,

    overall:
      `${getPoseLevelText(
        result.score
      )} 수준입니다. ${positiveText} ${improvementText}`
  };
}


/* =========================================================
   123. CREATE SUMMARY
========================================================= */

function createPoseSummary(
  result
) {

  const view =
    result.viewMode ===
      "side"
      ? "측면"
      : "정면";

  return (
    `${result.sportLabel} / ` +
    `${result.movementLabel} / ` +
    `${view} 분석 / ` +
    `종합 ${Math.round(
      result.score
    )}점 / ` +
    `${result.grade} 등급`
  );
}


/* =========================================================
   124. RENDER FINAL RESULT
========================================================= */

function renderFinalPoseResult(
  result
) {

  setPoseText(
    [
      "poseOverallScore",
      "poseScore",
      "poseFinalScore"
    ],
    Math.round(
      result.score
    )
  );


  setPoseText(
    [
      "poseFinalGrade"
    ],
    result.grade
  );


  setPoseText(
    [
      "poseFinalLevel"
    ],
    getPoseLevelText(
      result.score
    )
  );


  setPoseText(
    [
      "poseFinalSport"
    ],
    result.sportLabel
  );


  setPoseText(
    [
      "poseFinalMovement"
    ],
    result.movementLabel
  );


  setPoseText(
    [
      "poseFinalStability"
    ],
    Math.round(
      result.stability
    )
  );


  setPoseText(
    [
      "poseFinalBalance"
    ],
    Math.round(
      result.balance
    )
  );


  setPoseText(
    [
      "poseFinalEfficiency"
    ],
    Math.round(
      result.efficiency
    )
  );


  setPoseText(
    [
      "poseFinalAlignment"
    ],
    Math.round(
      result.alignment
    )
  );


  const opinion =
    document.getElementById(
      "poseAutoOpinion"
    );

  if (opinion) {

    opinion.textContent =
      result.opinion.overall;
  }


  const summary =
    document.getElementById(
      "poseFinalSummary"
    );

  if (summary) {

    summary.textContent =
      result.summary;
  }


  updatePoseScoreRing(
    result.score
  );


  document
    .querySelectorAll(
      "[data-pose-final-panel]"
    )
    .forEach(
      (element) => {

        element.classList.add(
          "show"
        );
      }
    );
}


/* =========================================================
   125. CAPTURE CURRENT FRAME
========================================================= */

function capturePoseFrame() {

  const video =
    getPoseVideo();

  if (
    !video ||
    !video.videoWidth ||
    !video.videoHeight
  ) {

    return null;
  }

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    video.videoWidth;

  canvas.height =
    video.videoHeight;

  const context =
    canvas.getContext(
      "2d"
    );

  if (!context) {
    return null;
  }


  if (
    PoseManager.facingMode ===
    "user"
  ) {

    context.translate(
      canvas.width,
      0
    );

    context.scale(
      -1,
      1
    );
  }


  context.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height
  );


  PoseManager.captureCanvas =
    canvas;

  try {

    return canvas.toDataURL(
      "image/jpeg",
      0.78
    );

  } catch (error) {

    console.warn(
      "[POSE] Capture failed:",
      error
    );

    return null;
  }
}


/* =========================================================
   126. CREATE RECORD
========================================================= */

function createPoseRecord(
  result
) {

  const athleteId =
    PoseManager
      .selectedAthleteId ||
    sessionStorage.getItem(
      "spl_selected_athlete"
    );


  const athlete =
    athleteId
      ? SPLApp.getAthleteById(
          athleteId
        )
      : null;


  const image =
    capturePoseFrame();


  return {

    id:
      SPLApp.createId
        ? SPLApp.createId(
            "pose"
          )
        : `pose_${Date.now()}`,


    type:
      "pose",


    athleteId:
      athlete?.id || "",


    athleteName:
      athlete?.name ||
      "미지정 선수",


    sport:
      result.sport,


    sportLabel:
      result.sportLabel,


    movement:
      result.movement,


    movementLabel:
      result.movementLabel,


    viewMode:
      result.viewMode,


    score:
      Math.round(
        result.score
      ),


    stability:
      Math.round(
        result.stability
      ),


    balance:
      Math.round(
        result.balance
      ),


    efficiency:
      Math.round(
        result.efficiency
      ),


    alignment:
      Math.round(
        result.alignment
      ),


    confidence:
      Math.round(
        result.confidence
      ),


    grade:
      result.grade,


    summary:
      result.summary,


    opinion:
      result.opinion,


    angles:
      result.angles,


    symmetry:
      result.symmetry,


    issues:
      result.issues,


    sportMetrics:
      result.sportMetrics,


    movementScore:
      Math.round(
        result.movementScore
      ),


    duration:
      result.duration,


    frames:
      result.frames,


    snapshot:
      image,


    createdAt:
      result.createdAt ||
      new Date()
        .toISOString()
  };
}


/* =========================================================
   127. SAVE ANALYSIS
========================================================= */

function savePoseAnalysis() {

  let result =
    PoseManager.finalResult;


  if (!result) {

    result =
      finalizePoseAnalysis();
  }


  if (!result) {
    return null;
  }


  const record =
    createPoseRecord(
      result
    );


  let saved = false;


  if (
    typeof SPLApp.addRecord ===
    "function"
  ) {

    const response =
      SPLApp.addRecord(
        record
      );

    saved =
      response !== false;

  } else {

    const records =
      SPLApp.getRecords();

    records.unshift(
      record
    );

    saved =
      SPLApp.saveRecords(
        records
      );
  }


  if (!saved) {

    SPLApp.showToast(
      "분석 결과 저장에 실패했습니다.",
      "error"
    );

    return null;
  }


  PoseManager.lastSavedRecordId =
    record.id;


  document.dispatchEvent(
    new CustomEvent(
      "spl:poserecordsaved",
      {
        detail: record
      }
    )
  );


  document.dispatchEvent(
    new CustomEvent(
      "spl:recordsupdated",
      {
        detail: {
          record
        }
      }
    )
  );


  SPLApp.showToast(
    record.athleteId
      ? `${record.athleteName} 선수의 분석 결과를 저장했습니다.`
      : "자세분석 결과를 저장했습니다."
  );


  return record;
}


/* =========================================================
   128. SAVE & OPEN REPORT
========================================================= */

function savePoseAndOpenReport() {

  const record =
    savePoseAnalysis();

  if (!record) {
    return;
  }


  sessionStorage.setItem(
    "spl_report_record",
    record.id
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
          recordId:
            record.id,

          athleteId:
            record.athleteId
        }
      }
    )
  );
}


/* =========================================================
   129. OPEN LATEST REPORT
========================================================= */

function openLatestPoseReport() {

  const recordId =
    PoseManager
      .lastSavedRecordId;


  if (!recordId) {

    SPLApp.showToast(
      "저장된 자세분석 결과가 없습니다.",
      "warning"
    );

    return;
  }


  sessionStorage.setItem(
    "spl_report_record",
    recordId
  );


  SPLApp.openPage(
    "report"
  );
}


/* =========================================================
   130. FINALIZE BUTTON
========================================================= */

function initializePoseFinalizeButton() {

  const button =
    document.getElementById(
      "finalizePoseAnalysis"
    );

  button?.addEventListener(
    "click",
    () => {

      finalizePoseAnalysis();
    }
  );
}


/* =========================================================
   131. SAVE BUTTON
========================================================= */

function initializePoseSaveButton() {

  const button =
    document.getElementById(
      "savePoseAnalysis"
    );

  button?.addEventListener(
    "click",
    () => {

      savePoseAnalysis();
    }
  );
}


/* =========================================================
   132. REPORT BUTTON
========================================================= */

function initializePoseReportButton() {

  const button =
    document.getElementById(
      "poseOpenReport"
    );

  button?.addEventListener(
    "click",
    () => {

      if (
        PoseManager
          .lastSavedRecordId
      ) {

        openLatestPoseReport();

      } else {

        savePoseAndOpenReport();
      }
    }
  );
}


/* =========================================================
   133. RESET BUTTON
========================================================= */

function initializePoseResetButton() {

  const button =
    document.getElementById(
      "resetPoseAnalysis"
    );

  button?.addEventListener(
    "click",
    () => {

      resetCompletePoseAnalysis();
    }
  );
}


/* =========================================================
   134. COMPLETE RESET
========================================================= */

function resetCompletePoseAnalysis() {

  stopPoseAnalysis({
    silent: true
  });


  resetPoseAnalysisHistory();


  PoseManager.finalResult =
    null;

  PoseManager.sportResult =
    null;

  PoseManager.analysisStartedAt =
    null;

  PoseManager.lastSavedRecordId =
    null;

  PoseManager.detectedMovement =
    "standing";

  PoseManager.latestLandmarks =
    null;

  PoseManager.latestWorldLandmarks =
    null;


  clearPoseCanvas();

  clearPoseResult();

  updateMovementUI();


  document
    .querySelectorAll(
      "[data-pose-final-panel]"
    )
    .forEach(
      (element) => {

        element.classList.remove(
          "show"
        );
      }
    );


  const opinion =
    document.getElementById(
      "poseAutoOpinion"
    );

  if (opinion) {

    opinion.textContent =
      "분석 결과가 확정되면 자동 분석 의견이 표시됩니다.";
  }


  SPLApp.showToast(
    "자세분석을 초기화했습니다."
  );
}


/* =========================================================
   135. RESULT QUALITY CHECK
========================================================= */

function getPoseResultQuality(
  result
) {

  if (!result) {

    return {
      valid: false,
      level: "none",
      message:
        "분석 결과가 없습니다."
    };
  }


  if (
    result.confidence < 50
  ) {

    return {
      valid: false,
      level: "low",
      message:
        "신체 인식 정확도가 낮아 다시 촬영하는 것이 좋습니다."
    };
  }


  if (
    result.frames < 5
  ) {

    return {
      valid: false,
      level: "low",
      message:
        "분석 프레임이 부족합니다."
    };
  }


  if (
    result.confidence >= 80 &&
    result.frames >= 15
  ) {

    return {
      valid: true,
      level: "high",
      message:
        "분석 신뢰도가 높습니다."
    };
  }


  return {
    valid: true,
    level: "normal",
    message:
      "분석 가능한 데이터입니다."
  };
}


/* =========================================================
   136. FINAL RESULT EXPORT
========================================================= */

function exportPoseResult() {

  const result =
    PoseManager.finalResult ||
    getFinalPoseResult();


  if (!result) {
    return null;
  }


  const athlete =
    SPLApp.getAthleteById(
      PoseManager
        .selectedAthleteId
    );


  return {

    system:
      "SEOLCHEON PERFORMANCE LAB",

    module:
      "POSE ANALYSIS",

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

            sport:
              athlete.sport,

            grade:
              athlete.grade
          }
        : null,

    result,

    quality:
      getPoseResultQuality(
        result
      )
  };
}


/* =========================================================
   137. ANALYSIS STATUS SUMMARY
========================================================= */

function getPoseAnalysisStatus() {

  return {

    initialized:
      PoseManager.initialized,

    cameraRunning:
      PoseManager.cameraRunning,

    analyzing:
      PoseManager.analyzing,

    athleteId:
      PoseManager
        .selectedAthleteId,

    sport:
      PoseManager.sportMode,

    movement:
      getCurrentMovement(),

    viewMode:
      PoseManager.viewMode,

    confidence:
      PoseManager.confidence,

    fps:
      PoseManager.fps,

    hasResult:
      Boolean(
        PoseManager.latestResult
      ),

    finalized:
      Boolean(
        PoseManager.finalResult
      ),

    savedRecordId:
      PoseManager
        .lastSavedRecordId
  };
}


/* =========================================================
   138. SELECT ATHLETE EVENT
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


    PoseManager.selectedAthleteId =
      athleteId;


    const selector =
      getPoseAthleteSelect();


    if (selector) {

      selector.value =
        athleteId;
    }


    updatePoseAthleteInfo();
  }
);


/* =========================================================
   139. ATHLETE DELETED SAFETY
========================================================= */

document.addEventListener(
  "spl:athletesupdated",
  () => {

    if (
      !PoseManager
        .selectedAthleteId
    ) {
      return;
    }


    const athlete =
      SPLApp.getAthleteById(
        PoseManager
          .selectedAthleteId
      );


    if (!athlete) {

      PoseManager.selectedAthleteId =
        "";

      updatePoseAthleteInfo();
    }
  }
);


/* =========================================================
   140. FINALIZED EVENT UI
========================================================= */

document.addEventListener(
  "spl:posefinalized",
  (event) => {

    const result =
      event.detail;

    if (!result) {
      return;
    }


    const quality =
      getPoseResultQuality(
        result
      );


    const element =
      document.getElementById(
        "poseResultQuality"
      );


    if (element) {

      element.textContent =
        quality.message;

      element.dataset.level =
        quality.level;
    }
  }
);


/* =========================================================
   141. KEYBOARD SHORTCUTS
========================================================= */

function initializePoseKeyboardShortcuts() {

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
        Space
        분석 시작 / 정지
      */

      if (
        event.code ===
        "Space" &&
        PoseManager.cameraRunning
      ) {

        event.preventDefault();

        togglePoseAnalysis();

        return;
      }


      /*
        R
        분석 초기화
      */

      if (
        event.key
          .toLowerCase() ===
        "r"
      ) {

        resetCompletePoseAnalysis();

        return;
      }


      /*
        S
        결과 저장
      */

      if (
        event.key
          .toLowerCase() ===
        "s" &&
        PoseManager.latestResult
      ) {

        event.preventDefault();

        savePoseAnalysis();
      }
    }
  );
}


/* =========================================================
   142. FINAL INITIALIZATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initializePoseFinalizeButton();

    initializePoseSaveButton();

    initializePoseReportButton();

    initializePoseResetButton();

    initializePoseKeyboardShortcuts();
  }
);


/* =========================================================
   143. EXTEND GLOBAL POSE API
========================================================= */

Object.assign(
  window.SPLPose,
  {

    finalize:
      finalizePoseAnalysis,

    save:
      savePoseAnalysis,

    saveAndReport:
      savePoseAndOpenReport,

    openReport:
      openLatestPoseReport,

    reset:
      resetCompletePoseAnalysis,

    capture:
      capturePoseFrame,

    getFinalResult:
      getFinalPoseResult,

    getQuality:
      getPoseResultQuality,

    getStatus:
      getPoseAnalysisStatus,

    exportResult:
      exportPoseResult
  }
);


/* =========================================================
   144. READY EVENT
========================================================= */

document.dispatchEvent(
  new CustomEvent(
    "spl:poseready",
    {
      detail: {
        module:
          "pose",

        version:
          "1.0"
      }
    }
  )
);


/* =========================================================
   END OF pose.js
========================================================= */