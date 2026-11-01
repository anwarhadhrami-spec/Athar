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
    "الشروق",
    "الغروب",
    "نص الليل"
  ];

  /*
   * التواريخ المرجعية المؤكدة
   */
  const WATER_REFERENCE = {
    "الخيلانيين": {
      date: "2026-10-29",
      timeIndex: 0 // صنهار
    },

    "مالك": {
      date: "2026-11-04",
      timeIndex: 1 // الشروق
    },

    "محمد": {
      date: "2026-11-05",
      timeIndex: 0 // صنهار
    }
  };

  const BASE_DATE = new Date(2026, 2, 6);

  function formatDate(date) {
    return new Intl.DateTimeFormat("ar-OM", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(date);
  }

  function dateOnly(date) {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  }

  function localDateString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1)
      .padStart(2, "0");
    const d = String(date.getDate())
      .padStart(2, "0");

    return `${y}-${m}-${d}`;
  }

  function getCycleIndex(date) {

    const diffDays = Math.floor(
      (dateOnly(date) - BASE_DATE) /
      86400000
    );

    return ((diffDays % 12) + 12) % 12;
  }

  /*
   * حساب التقليبة لكل آد
   */
  function getWaterTime(adName, targetDate) {

    const ref = WATER_REFERENCE[adName];

    if (!ref) {
      return "-";
    }

    let occurrences = 0;

    const startDate =
      new Date(ref.date);

    for (
      let d = new Date(startDate);
      d <= targetDate;
      d.setDate(d.getDate() + 1)
    ) {

      const idx = getCycleIndex(d);

      if (HAM_ADS[idx] === adName) {
        occurrences++;
      }
    }

    return WATER_TIMES[
      (
        ref.timeIndex +
        occurrences -
        1
      ) % WATER_TIMES.length
    ];
  }

  function showTodayAds() {

    const today = new Date();

    const idx =
      getCycleIndex(today);

    const hamAd =
      HAM_ADS[idx];

    const quraAd =
      QURA_ADS[idx];

    const hasWater =
      WATER_ADS.includes(
        hamAd
      );

    const waterTime =
      hasWater
        ? getWaterTime(
            hamAd,
            today
          )
        : "-";

    $("today-ads").innerHTML = `
      <div class="next-box">

        <p class="next-date">
          ${formatDate(today)}
        </p>

        <p>
          <strong>الحمام والحديث:</strong>
          ${hamAd}
        </p>

        <p>
          <strong>القري:</strong>
          ${quraAd}
        </p>

        <p>
          <strong>حصة الماء:</strong>
          ${hasWater ? "نعم" : "لا"}
        </p>

        ${
          hasWater
          ? `
          <p>
            <strong>التقليبة:</strong>
            ${waterTime}
          </p>
          `
          : ""
        }

      </div>
    `;
  }

  function renderHamTable() {

    const rows = [];

    const startDate =
      new Date();

    for (
      let i = 0;
      i < 90;
      i++
    ) {

      const date =
        new Date(startDate);

      date.setDate(
        startDate.getDate() +
        i
      );

      const idx =
        getCycleIndex(date);

      const ad =
        HAM_ADS[idx];

      let water = "لا";
      let time = "-";

      if (
        WATER_ADS.includes(ad)
      ) {

        water = "نعم";

        time = getWaterTime(
          ad,
          date
        );
      }

      rows.push(`
        <tr>
          <td>${localDateString(date)}</td>
          <td>${ad}</td>
          <td>${water}</td>
          <td>${time}</td>
        </tr>
      `);
    }

    $("ham-schedule").innerHTML = `
      <table>

        <thead>
          <tr>
            <th>التاريخ</th>
            <th>الآد</th>
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
