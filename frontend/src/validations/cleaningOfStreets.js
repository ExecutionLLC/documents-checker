import moment from 'moment';
import config from '../config';

class CleaningOfStreets {
  static durationHoursMoment(momentBeg, momentEnd) {
    const diff = moment.duration(momentEnd.diff(momentBeg));
    return diff.hours() + (diff.minutes() / 60);
  }

  static durationHours(hhmm1, hhmm2) {
    const beg = moment(`2018-01-01 ${hhmm1}`);
    let end = moment(`2018-01-01 ${hhmm2}`);
    if (beg > end) {
      return this.durationHours(hhmm1, '24:00')
        + this.durationHours('00:00', hhmm2);
      // end = moment(`2018-01-02 ${hhmm2}`);
    }
    return this.durationHoursMoment(beg, end);
    // const diff = moment.duration(end.diff(beg));
    // return diff.hours() + (diff.minutes() / 60);
  }

  static nightDurationHours(hhmm1, hhmm2) {
    return this.durationHours(hhmm1, hhmm2) - this.dayDurationHours(hhmm1, hhmm2);
  }

  static dayDurationHours(hhmm1, hhmm2) {

    const calcIn24Hours = (moment1, moment2) => {
      const dayTimeBeg = moment1.clone().hour(config.DAY_TIME_BEG).minute(0);
      const dayTimeEnd = moment1.clone().hour(config.DAY_TIME_END).minute(0);

      if (moment1 > dayTimeEnd || moment2 < dayTimeBeg) { // интвервал снаружи интервала дневного времени
        return 0;
      } else if (moment1 <= dayTimeBeg && moment2 >= dayTimeEnd) { // интвервал покрывает весь интервал дневного времени
        return this.durationHoursMoment(dayTimeBeg, dayTimeEnd);
      } else if (moment1 > dayTimeBeg && moment2 < dayTimeEnd) { // интервал находится внутри дневного времени
        return this.durationHoursMoment(moment1, moment2);
      } else if (moment1 < dayTimeBeg && moment2 < dayTimeEnd) {
        return this.durationHoursMoment(dayTimeBeg, moment2);
      } else if (moment1 > dayTimeBeg && moment2 > dayTimeEnd) {
        return this.durationHoursMoment(moment1, dayTimeEnd);
      }
    };

    const beg = moment(`2018-01-01 ${hhmm1}`);
    const end = moment(`2018-01-01 ${hhmm2}`);
    if (beg > end) {
      const beg1 = moment(`2018-01-01 ${hhmm1}`);
      const end1 = moment(`2018-01-01 24:00`);

      const beg2 = moment(`2018-01-02 00:00`);
      const end2 = moment(`2018-01-02 ${hhmm2}`);

      // console.log(`[${beg1.toString()}, ${end1.toString()}] and [${beg2.toString()}, ${end2.toString()}]`);
      // console.log(calcIn24Hours(beg1, end1), calcIn24Hours(beg2, end2));

      return calcIn24Hours(beg1, end1) +
        calcIn24Hours(beg2, end2);
    } else {
      return calcIn24Hours(beg, end);
    }
  }

  static processJobItem(routingSheetJob, reportJob, stats) {

    let approved = true;


    if (routingSheetJob.geozone !== reportJob.geozone) {
      console.log(routingSheetJob.geozone, reportJob.geozone);
      approved = false;
    }

    const routingSheetJobTotalTime =
      CleaningOfStreets.durationHours(routingSheetJob.startTime, routingSheetJob.endTime);

    const hourDiffRatio = Math.abs((reportJob.totalTime - routingSheetJobTotalTime) / routingSheetJobTotalTime);
    if (hourDiffRatio > config.ALLOWED_TIME_DELTA) {
      console.log('hourDiffRatio: ', hourDiffRatio);
      approved = false;
    }

    // fill stats
    stats.materials += reportJob.result;
    stats.approved = stats.approved && approved;

    const reportDayHours = CleaningOfStreets.dayDurationHours(reportJob.startTime, reportJob.endTime);
    console.log(reportDayHours, reportJob.startTime, reportJob.endTime);
    const routingSheetDayHours = CleaningOfStreets.dayDurationHours(routingSheetJob.startTime, routingSheetJob.endTime);
    stats.approvedDayHours += reportDayHours;
    stats.diffDayHours += reportDayHours - routingSheetDayHours;

    const reportNightHours = CleaningOfStreets.nightDurationHours(reportJob.startTime, reportJob.endTime);
    const routingSheetNightHours = CleaningOfStreets.nightDurationHours(routingSheetJob.startTime, routingSheetJob.endTime);
    stats.approvedNightHours += reportNightHours;
    stats.diffNightHours += reportNightHours - routingSheetNightHours;

    return {
      geozone: routingSheetJob.geozone,
      // dayOrNight: "День",
      hoursByRoutingSheet: routingSheetJobTotalTime,
      hoursApproved: reportJob.totalTime,
      approved: approved ? "Да" : "Нет",
      materials: reportJob.result,
    };
  }

  static verify(routingSheet, report) {
    const stats = {
      approvedDayHours: 0,
      diffDayHours: 0,
      approvedNightHours: 0,
      diffNightHours: 0,
      materials: 0, // вывезено снега на полигон
      approved: true,
    };
    console.log('verifying...');
    // compare job list
    const compareJobsList = [];
    for (let i = 0; i < routingSheet.jobsList.length; i++) {
      const routingSheetJob = routingSheet.jobsList[i];
      const reportJob = report.jobsList[i];
      compareJobsList.push(CleaningOfStreets.processJobItem(routingSheetJob, reportJob, stats));
      console.log(stats);
    }

    return {
      compareDocHeader: {
        jobType: routingSheet.jobsListHeader.jobType,
        approvedDayHours: stats.approvedDayHours,
        diffDayHours: stats.diffDayHours,
        approvedNightHours: stats.approvedNightHours,
        diffNightHours: stats.diffNightHours,
        materials: stats.materials,
        approved: stats.approved ? "Да" : "Нет",
      },
      compareJobsList,
    };
  }

  static verifyActs(routingSheet, report, act) {

    // статистика по отчету
    const stats = report.jobsList.reduce((acc, job) => {
      return {
        ...acc,
        approvedDayHours: acc.approvedDayHours + CleaningOfStreets.dayDurationHours(job.startTime, job.endTime),
        approvedNightHours: acc.approvedNightHours + CleaningOfStreets.nightDurationHours(job.startTime, job.endTime),
      };
      },
      {
        approvedDayHours: 0,
        approvedNightHours: 0,
      },
    );

    const diffDayHours = stats.approvedDayHours - act.actDayHours;
    const diffDayHoursRatio = Math.abs(diffDayHours/act.actDayHours);

    const diffNightHours = stats.approvedNightHours - act.actNightHours;
    const diffNightHoursRatio = Math.abs(diffNightHours/act.actNightHours);

    const approved =
      (diffDayHoursRatio > config.ALLOWED_TIME_DELTA || diffNightHoursRatio > config.ALLOWED_TIME_DELTA)
        ? "Не успешно"
        : "Успешно";

    return {
      approvedDayHours: stats.approvedDayHours,
      diffDayHours: diffDayHours,
      approvedNightHours: stats.approvedNightHours,
      diffNightHours: diffNightHours,
      approved,
    };
  }
}

export default CleaningOfStreets;