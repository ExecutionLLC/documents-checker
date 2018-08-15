import config from '../config';

class CleaningOfStreets {
  static compare(routingSheetJob, reportJob, stats) {

    // fill stats
    stats.materialsTotal += reportJob.result;

    if (routingSheetJob.geozone !== reportJob.geozone) {
      console.log(routingSheetJob.geozone, reportJob.geozone);
      return false;
    }

    const hourDiffRatio = Math.abs((reportJob.totalTime - routingSheetJob.totalTime) / routingSheetJob.totalTime);
    if (hourDiffRatio > config.ALLOWED_TIME_DELTA) {
      console.log('hourDiffRatio: ', hourDiffRatio);
      return false;
    }

    return true;
  }

  static verify(routingSheet, report) {
    const stats = {
      materialsTotal: 0, // вывезено снега на полигон
    };
    console.log('verifying...');
    // compare job list
    const compareJobsList = [];
    for (let i = 0; i < routingSheet.jobsList.length; i++) {
      const routingSheetJob = routingSheet.jobsList[i];
      const reportJob = report.jobsList[i];

      const approved = CleaningOfStreets.compare(routingSheetJob, reportJob, stats);

      compareJobsList.push({
        geozone: routingSheetJob.geozone,
        // dayOrNight: "День",
        hoursByRoutingSheet: routingSheetJob.totalTime,
        hoursApproved: reportJob.totalTime,
        approved: approved ? "Да" : "Нет",
        materials: reportJob.result,
      });
    }

    return {
      compareDocHeader: {
        materials: stats.materialsTotal,
      },
      compareJobsList,
    };
  }
}

export default CleaningOfStreets;