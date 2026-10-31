(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const HAM_ADS = [
    "العبطة",
    "خلف",
    "عبد",
    "مالك",
    "محمد",
    "قيس",
    "هرموز",
    "هيرين",
    "البال",
    "الخيلانيين",
    "مساك",
    "عامر"
  ];

  const QURA_ADS = [
    "عبد",
    "مالك",
    "محمد",
    "قيس",
    "هرموز",
    "هيرين",
    "البال",
    "الخيلانيين",
    "مساك",
    "عامر",
    "العبطة",
    "خلف"
  ];

  const WATER_ADS = [
    "الخيلانيين",
    "مالك",
    "محمد"
  ];

  const WATER_TIMES = [
    "صنهار",
    "الغروب",
    "نص الليل",
    "الشروق"
  ];

  const BASE_DATE = new Date(2026, 2, 6);

  const WATER_REFERENCE_DATE =
    new Date(2026, 9, 29); // 2026-10-29

  function dateOnly(date) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  }

  function localDateString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat("ar-OM", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(date);
  }

  function getCycleIndex(date) {

    const diffDays = Math.floor(
      (dateOnly(date) - BASE_DATE) / 86400000
    );

    return ((diffDays % 12) + 12) % 12;
  }

  function getWaterInfo(date) {

    const targetDate = dateOnly(date);

    const ad =
      HAM_ADS[
        getCycleIndex(targetDate)
      ];

    if (!WATER_ADS.includes(ad)) {
      return {
        hasWater: false,
        time: "-"
      };
    }

    let counter = 0;

    for (
      let d = new Date(WATER_REFERENCE_DATE);
      d < targetDate;
      d.setDate(d.getDate() + 1)
    ) {

      const idx = getCycleIndex(d);

      const currentAd =
        HAM_ADS[idx];

      if (
        WATER_ADS.includes(currentAd)
      ) {
        counter++;
      }
    }

    return {
      hasWater: true,
      time:
        WATER_TIMES[
          counter %
          WATER_TIMES.length
        ]
    };
  }

  function showTodayAds() {

    const today = dateOnly(new Date());

    const idx =
      getCycleIndex(today);

    const hamAd =
      HAM_ADS[idx];

    const quraAd =
      QURA_ADS[idx];

    const water =
      getWaterInfo(today);

    $("today-ads").innerHTML = `
      <div class="next-box">

        <p class="next-date">
          ${formatDate(today)}
        </p>

        <p>
          <strong>
            الحمام والحديث:
          </strong>
          ${hamAd}
        </p>

        <p>
          <strong>
            القري:
          </strong>
          ${quraAd}
        </p>

        <p>
          <strong>
            حصة الماء:
          </strong>
          ${water.hasWater ? "نعم" : "لا"}
        </p>

        ${
          water.hasWater
            ? `
            <p>
              <strong>
                التقليبة:
              </strong>
              ${water.time}
            </p>
            `
            : ""
        }

      </div>
    `;
  }

  function renderHamTable() {

    const rows = [];

    const today =
      dateOnly(new Date());

    for (let i = 0; i < 90; i++) {

      const date = new Date(today);

      date.setDate(
        today.getDate() + i
      );

      const ad =
        HAM_ADS[
          getCycleIndex(date)
        ];

      const water =
        getWaterInfo(date);

      rows.push(`
        <tr>
          <td>${localDateString(date)}</td>
          <td>${ad}</td>
          <td>${water.hasWater ? "نعم" : "لا"}</td>
          <td>${water.time}</td>
        </tr>
      `);
    }

    $("ham-schedule").innerHTML = `
      <table>

        <thead>
          <tr>
            <th>التاريخ</th>
            <th>آد الحمام والحديث</th>
            <th>حصة الماء</th>
            <th>التقليبة</th>
          </tr>
        </thead>

        <tbody>
          ${rows.join("")}
        </tbody>

      </table>
    `;
  }

  showTodayAds();
  renderHamTable();

})();
