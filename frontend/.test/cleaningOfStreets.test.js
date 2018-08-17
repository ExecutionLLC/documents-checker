import CleaningOfStreets from "../src/validations/cleaningOfStreets";

console.log(`23:30, 03:00 :`, CleaningOfStreets.durationHours('23:30', '03:00'));
console.log(`23:30, 23:31 :`, CleaningOfStreets.durationHours('23:30', '23:31'));
console.log(`00:00, 00:00 :`, CleaningOfStreets.durationHours('00:00', '00:00'));


console.log(' ----------- dayDurationHours ----------- ');
console.log(`23:30, 08:30 :`, CleaningOfStreets.dayDurationHours('23:30', '08:30'));
console.log(`23:30, 03:00 :`, CleaningOfStreets.dayDurationHours('23:30', '03:00'));
console.log(`07:00, 23:00 :`, CleaningOfStreets.dayDurationHours('07:00', '23:00'));
console.log(`00:00, 00:00 :`, CleaningOfStreets.dayDurationHours('00:00', '00:00'));
console.log(`10:00, 11:30 :`, CleaningOfStreets.dayDurationHours('10:00', '11:30'));


console.log(' ----------- nightDurationHours ----------- ');
console.log(`23:30, 08:30 :`, CleaningOfStreets.nightDurationHours('23:30', '08:30'));
console.log(`23:30, 03:00 :`, CleaningOfStreets.nightDurationHours('23:30', '03:00'));
console.log(`07:00, 23:00 :`, CleaningOfStreets.nightDurationHours('07:00', '23:00'));
console.log(`00:00, 00:00 :`, CleaningOfStreets.nightDurationHours('00:00', '00:00'));
console.log(`23:00, 07:00 :`, CleaningOfStreets.nightDurationHours('23:00', '07:00'));
console.log(`10:00, 11:30 :`, CleaningOfStreets.nightDurationHours('10:00', '11:30'));