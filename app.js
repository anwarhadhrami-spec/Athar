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

  const WATER_REFERENCE = {

    "الخيلانيين": {
      date: "2026-10-29",
      timeIndex: 0
    },

    "مالك": {
      date: "2026-11-04",
      timeIndex: 1
    },

    "محمد": {
      date: "2026-11-05",
      timeIndex: 0
    }

  };

  const QURA_WATER_ADS = [
    "هرموز"
  ];

  const QURA_TIMES = [
    "صنهار",
    "الغدو"
  ];

  const QURA_REFERENCE = {

    "هرموز": {
      date: "2026-11-05",
      timeIndex: 0
    }

  };

  const BASE_DATE =
    new Date(2026, 2, 6);

  function formatDate(date) {

    return new Intl.DateTimeFormat(
      "ar-OM",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }
    ).format(date);
  }

  function dateOnly(date) {

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  }

  function localDateString(date) {

    const y =
      date.getFullYear();

    const m = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const d = String(
      date.getDate()
    ).padStart(2, "0");

    return `${y}-${m}-${d}`;
  }

  function getCycleIndex(date) {

    const diffDays = Math.floor(

      (
        dateOnly(date) -
        BASE_DATE

      ) / 86400000

    );

    return (

      (diffDays % 12) + 12

    ) % 12;
  }

  function getWaterTime(
    adName,
    targetDate
  ) {

    const ref =
      WATER_REFERENCE[adName];

    if (!ref) {
      return "-";
    }

    let occurrences = 0;

    const startDate =
      new Date(ref.date);

    for (

      let d =
        new Date(startDate);

      d <= targetDate;

      d.setDate(
        d.getDate() + 1
      )

    ) {

      const idx =
        getCycleIndex(d);

      if (
        HAM_ADS[idx] === adName
      ) {

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

  function getQuraTime(
    adName,
    targetDate
  ) {

    const ref =
      QURA_REFERENCE[adName];

    if (!ref) {
      return "-";
    }

    let occurrences = 0;

    const startDate =
      new Date(ref.date);

    for (

      let d =
        new Date(startDate);

      d <= targetDate;

      d.setDate(
        d.getDate() + 1
      )

    ) {

      const idx =
        getCycleIndex(d);

      if (
        QURA_ADS[idx] === adName
      ) {

        occurrences++;

      }

    }

    return QURA_TIMES[

      (
        ref.timeIndex +
        occurrences -
        1
      ) % QURA_TIMES.length

    ];
  }

function formatTurnTime(time) {

  switch (time) {

    case "صنهار":
      return "☀️ صنهار (11:30 ص)";

    case "الشروق":
      return "🌅 الشروق (5:30 ص اليوم التالي)";

    case "الغروب":
      return "🌇 الغروب (5:30 م)";

    case "نص الليل":
      return "🌙 نص الليل (11:00 م)";

    case "الغدو":
      return "🌤️ الغدو (5:30 ص)";

    default:
      return time;
  }
}

  function showTodayAds() {

    const today =
      new Date();

    const idx =
      getCycleIndex(today);

    const hamAd =
      HAM_ADS[idx];

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

        <p>
          <strong>الحمام والحديث</strong>
        </p>

        <p class="next-date">
          ${formatDate(today)}
        </p>

        <p>
          <strong>الآد:</strong>
          ${hamAd}
        </p>

        <p>
          <strong>حصة الماء:</strong>
          ${hasWater ? "نعم" : "لا"}
        </p>

        ${
          hasWater
            ? `
            <p class="today-turn">
              <strong>التقليبة:</strong>
              ${formatTurnTime(waterTime)}
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
        startDate.getDate() + i
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

        time =
          getWaterTime(
            ad,
            date
          );
      }

      rows.push(`
        <tr>
          <td>${localDateString(date)}</td>
          <td>${ad}</td>
          <td>${water}</td>
          <td>${formatTurnTime(time)}</td>
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

  function showQuraToday() {

    const today =
      new Date();

    const idx =
      getCycleIndex(today);

    const ad =
      QURA_ADS[idx];

    const hasWater =
      QURA_WATER_ADS.includes(
        ad
      );

    const time =
      hasWater
        ? getQuraTime(
            ad,
            today
          )
        : "-";

    $("qura-next").innerHTML = `
      <div class="next-box">

        <p>
          <strong>القري</strong>
        </p>

        <p class="next-date">
          ${formatDate(today)}
        </p>

        <p>
          <strong>الآد:</strong>
          ${ad}
        </p>

        <p>
          <strong>حصة الماء:</strong>
          ${hasWater ? "نعم" : "لا"}
        </p>

        ${
          hasWater
            ? `
            <p class="today-turn">
              <strong>التقليبة:</strong>
              ${formatTurnTime(time)}
            </p>
            `
            : ""
        }

      </div>
    `;
  }

  function renderQuraTable() {

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
        startDate.getDate() + i
      );

      const idx =
        getCycleIndex(date);

      const ad =
        QURA_ADS[idx];

      let water = "لا";
      let time = "-";

      if (
        QURA_WATER_ADS.includes(
          ad
        )
      ) {

        water = "نعم";

        time =
          getQuraTime(
            ad,
            date
          );
      }

      rows.push(`
        <tr>
          <td>${localDateString(date)}</td>
          <td>${ad}</td>
          <td>${water}</td>
          <td>${formatTurnTime(time)}</td>
        </tr>
      `);
    }

    $("qura-schedule").innerHTML = `
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

  showQuraToday();

  renderQuraTable();

})();
