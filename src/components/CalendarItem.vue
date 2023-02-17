<template>
  <div class="container" :class="type">
    <h6 class="number">{{label}}</h6>
  </div>
</template>

<script>
export default {
  name: "CalendarItem",
  props: {
    label: Number,
    type: String
  }
}
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
}
.default {
  background: transparent;
  font-weight: 600;
  padding: 0;
  cursor: pointer;
}
.day {
  background: #619fa8;
  color: white;
  padding: 0;
  cursor: pointer;
}
.night {
  background: #283b42;
  color: white;
  padding: 0;
  cursor: pointer;
}
.disabled {
  opacity: 0.3;
  padding: 0;
  cursor: default;
}
.number {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 500;
  user-select: none;
}
</style>