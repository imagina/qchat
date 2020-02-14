<template>
  <div>
    <div class="q-pa-sm" v-for="(key, index) in cant" :key="index">
      <q-item style="max-width: 300px">
        <q-item-section avatar>
          <q-skeleton type="QAvatar" animation="fade"/>
        </q-item-section>
        <q-item-section>
          <q-item-label>
            <q-skeleton type="text" animation="fade"/>
          </q-item-label>
          <q-item-label caption>
            <q-skeleton type="text" width="65%" animation="fade"/>
          </q-item-label>
        </q-item-section>
      </q-item>
    </div>
  </div>
</template>

<script>
  export default {
    props:{
      cant:{
        type: Number,
        default: 0
      }
    }
  }
</script>
