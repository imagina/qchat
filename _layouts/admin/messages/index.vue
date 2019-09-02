<template>
  <div class="row relative-position">
    <div class="row" style="min-width: 100%">
      <div
        class="col-md-8 relative-position"
        style="border-right: #9e9e9e4d solid 1px;">
        <conversation/>
      </div>
      <div class="col-md-4">
        <div class="row">
          <div class="col-md-12">
            <q-tabs inverted>
              <q-tab
                slot="title"
                name="tab-4"
                label="Conversations"
                default />
              <q-tab-pane
                name="tab-4"
                keep-alive>
                <myComversations/>
              </q-tab-pane>
            </q-tabs>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import conversation from '@imagina/qchat/_components/admin/conversation'
  import myComversations from '@imagina/qchat/_components/admin/myConversations'
  export default {
    components:{
      conversation,
      myComversations
    }
  }
</script>
