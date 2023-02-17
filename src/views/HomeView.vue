<template>
  <img class="logo" src="@/assets/logo.png" alt="LOGO">
  <div class="container cal-body" v-if="loaded">
    <div class="row month-nav-row">
      <div class="col-2">
        <button class="btn btn-nav" :class="{'btn-nav-disabled': !canDoPrev}" @click="prevMonth"><i class="fa-solid fa-chevron-left"></i></button>
      </div>
      <div class="col-8">
        <h5 class="month">{{ month }} ({{ yearNum }})</h5>
      </div>
      <div class="col-2">
        <button class="btn btn-nav" :class="{'btn-nav-disabled': !canDoNext}" @click="nextMonth"><i class="fa-solid fa-chevron-right"></i></button>
      </div>
    </div>

    <div class="row weekdays-row">
      <h6 class="weekday">Пн</h6>
      <h6 class="weekday">Вт</h6>
      <h6 class="weekday">Ср</h6>
      <h6 class="weekday">Чт</h6>
      <h6 class="weekday">Пт</h6>
      <h6 class="weekday weekend">Сб</h6>
      <h6 class="weekday weekend">Вс</h6>
    </div>
    <div class="container-fluid items">
      <CalendarItem @click="selectDay(day, index)" v-for="(day, index) in days" :label="day.label" :type="day.type" :key="Date.now() + day.label"/>
    </div>
  </div>
  <div class="row legend-row">
    <div class="col legend">
      <button class="container legend-day" :class="{'legend-day-active': currMarker === 'day'}" @click="selectMarker('day')"><i class="fa-solid fa-sun icon-day"></i></button>
      <h6 class="legend-heading">День</h6>
    </div>
    <div class="col legend">
      <button class="container legend-night" :class="{'legend-day-active': currMarker === 'night'}" @click="selectMarker('night')"><i class="fa-solid fa-moon icon-night"></i></button>
      <h6 class="legend-heading">Ночь</h6>
    </div>

  </div>
  <div class="row button-save-row">
    <div class="col button-save-col">
      <button type="button" @click="save" class="btn btn-primary">Сохранить</button>
    </div>
  </div>
  <Transition
      enter-active-class="animate__animated animate__fadeIn"
      leave-active-class="animate__animated animate__fadeOut"
  >
    <PopUp :popup="popup" v-if="popup.show" />
  </Transition>
</template>

<script>

// за 3 дня
// Если сегодня 4 то начинать выбирать можно с 8
//


import CalendarItem from "@/components/CalendarItem.vue";
import {Api} from "@/api/Api";
import PopUp from "@/components/PopUp.vue";
import axios from 'axios'

export default {
  name: 'HomeView',
  components: {
    PopUp,
    CalendarItem
  },
  data() {
    return {
      monthLabels: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
      currMonth: "",
      monthNum: 0,
      yearNum: 0,
      currMarker: 'day',
      diff: 0,
      startedMonth: 0,
      startedDate: 0,
      loaded: false,
      months: [{month: 0, days: []},{month: 0, days: []},],
      old: [{month: 0, days: []},{month: 0, days: []},],
      popup: {
        failed: false,
        show: false,
        text: ""
      },
      endOfMonthSelection: 25,
    }
  },
  async created() {
    this.monthNum = (new Date()).getMonth();
    this.startedMonth = this.monthNum;
    this.startedDate = (new Date()).getDate();
    if (this.startedDate >= this.endOfMonthSelection) {
      this.monthNum++;
      this.startedMonth++
      this.startedDate = -3;
    }
    this.yearNum = (new Date()).getFullYear();
    this.loaded = false;
    await this.calculate();
    // this.nextMonth();
    // await this.calculate();
    // this.prevMonth();
    this.loaded = true;
  },
  methods: {
    showPopup(failed, text) {
      this.popup = {
        failed,
        text,
        show: true,
      };
      setTimeout(() => {
        this.popup.show = false;
      }, 5000);
    },
    save() {
      const api = new Api();
      api.saveData(JSON.stringify(this.months));
      this.dima();
      this.showPopup(false, "Данные сохранены!")
    },
    prevMonth() {
      if (!this.canDoPrev) {
        return;
      }

      this.diff--;

      if (this.monthNum < 1) {
        this.yearNum--;
        this.monthNum = 11;
        return;
      }
      this.monthNum--;
    },
    nextMonth() {
      if (!this.canDoNext) {
        this.showPopup(true, "Вы можете выбрать даты на следующий месяц только после 25 числа.")
        return;
      }

      this.diff++;

      if (this.monthNum > 10) {
        this.yearNum++;
        this.monthNum = 0;
        return;
      }
      this.monthNum++;
    },
    async calculate() {
      const api = new Api();
      const fromServer = await api.getData(this.monthNum);
      if (fromServer.length) {
        this.months[this.diff] = {
          month: fromServer[0].month,
          days: JSON.parse(fromServer[0].days)
        }
        this.old[this.diff] = {
          month: fromServer[0].month,
          days: JSON.parse(fromServer[0].days)
        };
        return;
      }
      const days = [];
      const date = new Date ();
      const year = date.getFullYear()
      const month = this.monthNum;
      const firstDay = new Date(year,month,1)
      const firstWeekDay = firstDay.getDay()
      // const prevMonthLastDay = new Date(year, month, 0).getDate();
      let lastDayCurMonth = new Date(year,month+1,-1).getDate()

      console.log(lastDayCurMonth);
      if (lastDayCurMonth == 27 && this.yearNum % 4 == 0) {
        lastDayCurMonth = 28;
      }

      for (let i = 0; i < lastDayCurMonth + 1; i++) {
        days.push({
          month: this.monthNum,
          day: i,
          label: i + 1,
          type: this.calculateType(i)
        });
      }

      // console.log('PREV MONTH', prevMonthLastDay)

      for (let i = 0; i < firstWeekDay - 1; i++) {
        days.unshift({
          month: false,
          day: false,
          label: "",
          type: "disabled"
        })
      }

      // const daysDiff = 42 - days.length;

      // for (let i = 0; i < daysDiff; i++) {
      //   days.push({
      //     month: this.monthNum + 1,
      //     day: i,
      //     label: i + 1,
      //     type: this.calculateType(i)
      //   });
      //
      //   if (days.length % 7 == 0) {
      //     break;
      //   }
      // }

      console.log('calculation');

      this.months[this.diff].month = this.monthNum;
      this.old[this.diff].month = this.monthNum;
      this.months[this.diff].days = days;
      this.old[this.diff].days = days;
      console.log(this.old);
    },
    calculateType(day) {
      if (this.startedMonth < this.monthNum) {
        return 'default';
      }
      if (this.startedDate + 3 <= day) {
        return 'default'
      }
      return 'disabled';
    },
    selectMarker(type) {
      if (type === this.currMarker) {
        this.currMarker = 'default';
        return;
      }
      this.currMarker = type;
    },
    getFirstDay(monthIndex){
      for (const day in this.months[0].days) {
        if (this.months[0].days[day].month !== false)
          return this.months[0].days[day];
      }
    },
    selectDay(day, index) {
      console.log(day.day, this.startedDate);
      if (day.day < this.startedDate + 3) {
        this.showPopup(true, "Вы не можете менять смены в уже прошедших днях, а также ранее 3 дней до начала смены.")
        return;
      }
      if (day.type == this.currMarker) {
        day.type = 'default';
        return;
      }
      if (day.month === false)
        return;
      if (this.days[index - 1].type === 'night' && this.currMarker === 'day') {
        this.showPopup(true, "Вы не можете выбрать дневную смену сразу после ночной!");
        return;
      }
      if (this.diff > 0 && day.day == 0) {
        if (this.months[0].days[this.months[0].days.length - 1].type === 'night' && this.currMarker === 'day') {
          this.showPopup(true, "Вы не можете выбрать дневную смену сразу после ночной!");
          return;
        }
      }
      console.log(index + 1, this.days.length);
      if (index + 1 < this.days.length) {
        if (this.days[index + 1].type === 'day' && this.currMarker === 'night') {
          this.showPopup(true, "Вы не можете выбрать дневную смену сразу после ночной!");
          return;
        }
      }
      console.log('INDEX', index, this.days.length - 1, this.diff, this.getFirstDay(1));
      if (index == this.days.length - 1 && this.diff == 0) {
        if (this.getFirstDay(1).type === 'day' && this.currMarker === 'night') {
          this.showPopup(true, "Вы не можете выбрать дневную смену сразу после ночной!");
          return;
        }
      }
      day.type = this.currMarker;
    },
    getDimaType(el) {
      return el.type == 'night' ? 20 : (el.type == 'day') ? 8 : 0;
    },
    dima() {
      let all = {};
      this.months[0].days.forEach(el => {
        all[el.day + 1] = this.getDimaType(el);
      });
      let changed = {};
      console.log(this.old[0].days);
      this.old[0].days.forEach((el, index) => {
        const actual = this.months[0].days[index];
        console.log(el.day, el.type, actual.type);
        if (el.type != actual.type) {
          changed[el.day + 1] = `было: ${this.getDimaType(el)}, стало: ${this.getDimaType(actual)}`
        }
      });
      const data = {
        object: localStorage.getItem('object'),
        tlgid: localStorage.getItem('telegramId'),
        jbid: localStorage.getItem('jetBotId'),
        month: this.monthLabels[this.monthNum],
        all,
        changed
      };

      axios.post('https://hook.eu1.make.com/mebpqgpxpmv7rdysjcllx4n6bd9av64l', {
        data
      }).then(res => {
        console.log(res);
      })
    }
  },
  computed: {
    month() {
      return this.monthLabels[this.months[this.diff].month]
    },
    days() {
      return this.months[this.diff].days;
    },
    canDoPrev() {
      // return this.diff > 0
      return false;
    },
    canDoNext() {
      // return this.diff < 1;
      return false;
    },
  },
}
</script>

<style>
.month-nav-row {
  width: 100%;
}
.btn-nav {
  max-width: 10vw;
  color: white;
  border-radius: 50%;
  padding: 0;
  width: 2rem!important;
  height: 2rem;
}
.btn-nav-disabled {
  max-width: 10vw;
  color: white;
  border-radius: 50%;
  padding: 0;
  width: 2rem!important;
  height: 2rem;
  opacity: 0.3;
}
.legend-row {
  display: flex;
  width: 100%;
  justify-content: space-between;
}
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap');
#app {
  font-family: 'Open Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.btn {
  width: 90vw;
  background-color: #96b963;
  border: 1px solid #f1ffdb;
}
.btn:hover {
  width: 90vw;
  background-color: #7e9857!important;
  border: 1px solid #8aa85a;
}
.btn:focus {
  width: 90vw;
  background-color: #7e9857!important;
  border: 1px solid #8aa85a;
}
.btn:active {
  width: 90vw;
  background-color: #7e9857;
  border: 1px solid #8aa85a;
}
.button-save-col {
  display: flex;
  justify-content: center;
}
.button-save-row {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
}
.legend {
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo {
  width: 15rem;
  margin-bottom: 2rem;
}
.legend-day {
  background: #619fa8;
  color: #619fa8;
  border: none;
  padding: 0;
  height: 2rem;
  width: 2rem;
  margin-left: 0;
  margin-right: 1rem;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 1s ease
}
.legend-day-active {
  background: transparent !important;
  border: 1px solid #619fa8 !important;
  color: #619fa8 !important;
}
.legend-day:hover {
  background: transparent;
  border: 1px solid #619fa8;
  color: #619fa8;
  transition: all 1s ease;
}
.legend-day:focus {
  background: transparent;
  border: 1px solid #619fa8;
  color: #619fa8;
  transition: all 1s ease
}

.legend-day:focus-within {
  background: transparent;
  border: 1px solid #619fa8;
  color: #619fa8;
  transition: all 1s ease
}
.legend-day:active {
  background: transparent;
  border: 1px solid #619fa8;
  color: #619fa8;
  transition: all 1s ease
}

.legend-night {
  background: #283b42;
  color: #283b42;
  padding: 0;
  height: 2rem;
  border: none;
  width: 2rem;
  margin-left: 0;
  margin-right: 1rem;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 1s ease
}
.legend-night-active {
  background: transparent !important;
  border: 1px solid #283b42 !important;
  color: #283b42 !important;
}
.legend-night:hover {
  background: transparent;
  border: 1px solid #283b42;
  color: #283b42;
  transition: all 1s ease;
}
.legend-night:focus {
  background: transparent;
  border: 1px solid #283b42;
  color: #283b42;
  transition: all 1s ease
}
.legend-night:focus-within {
  background: transparent;
  border: 1px solid #283b42;
  color: #283b42;
  transition: all 1s ease
}
.legend-night:active {
  background: transparent;
  border: 1px solid #283b42;
  color: #283b42;
  transition: all 1s ease
}

.row {
  margin-top: 1rem;
}
.legend-heading {
  margin: 0;
}

.month {
  width: 100%;
  text-align: center;
  font-weight: 700;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.13);
}
.weekdays-row {
  display: grid;
  grid-template-columns: auto auto auto auto auto auto auto;
  align-items: center;
  gap: 0;
  width: 100%;
}
.weekday {
  padding: 0;
  width: 3rem;
  font-weight: 700;
  font-size: 1rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.weekend {
  color: #a0c779;
  font-weight: 700;
}
.cal-body {
  border-radius: 0.5rem;
  background: #ffffff;
  box-shadow:  20px 20px 60px #d9d9d9,
  -20px -20px 60px #ffffff;
  padding-top: 2rem;
  padding-left: 0;
  padding-right: 0;
  width: 90vw;
  padding-bottom: 0.3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.items {
  display: inline-grid;
  height: 33vh;
  width: 100%;
  padding: 0;
  min-width: 100%;
  grid-template-columns: auto auto auto auto auto auto auto;
}

</style>
