<template></template>
<script>

export default {
  data() {
    return {
      crudId: this.$uid()
    }
  },
  computed: {
    crudData() {
      return {
        crudId: this.crudId,
        //entityName: config("main.qblog.entityNames.category"),
        apiRoute: 'apiRoutes.qchat.providers',
        permission: 'ichat.providers',
        extraFormFields: 'ichat.crud-fields.providers',
        create: {
          title: this.$tr('ichat.cms.newProvider'),
        },
        read: {
          columns: [
            {name: 'id', label: this.$tr('isite.cms.form.id'), field: 'id', style: 'width: 50px'},
            {name: 'name', label: this.$tr('isite.cms.form.name'), field: 'name', align: 'left'},
            {
              name: 'endPoint', label: this.$tr('isite.cms.label.endPoint'), field: 'endPoint', align: 'left',
              classes: 'ellipsis', style: 'max-width : 250px',
            },
            {
              name: 'token', label: this.$tr('isite.cms.label.token'), field: 'token', align: 'left',
              classes: 'ellipsis', style: 'max-width : 250px',
            },
            {
              name: 'created_at', label: this.$tr('isite.cms.form.createdAt'), field: 'createdAt', align: 'left',
              format: val => val ? this.$trd(val) : '-',
            },
            {
              name: 'updatedAt', label: this.$tr('isite.cms.form.updatedAt'), field: 'updatedAt', align: 'left',
              format: val => val ? this.$trd(val) : '-',
            },
            {name: 'actions', label: this.$tr('isite.cms.form.actions'), align: 'left'},
          ]
        },
        update: {
          title: this.$tr('ichat.cms.updateProvider')
        },
        delete: true,
        formLeft: {
          id: {value: ''},
          userId: {value: this.$store.state.quserAuth.userId},
          name: {
            value: '',
            type: 'input',
            props: {
              label: `${this.$tr('isite.cms.form.name')}*`,
              rules: [
                val => !!val || this.$tr('isite.cms.message.fieldRequired')
              ],
            },
          },
          endPoint: {
            value: '',
            type: 'input',
            props: {
              label: `${this.$tr('isite.cms.label.endPoint')}*`,
              rules: [
                val => !!val || this.$tr('isite.cms.message.fieldRequired')
              ],
            }
          },
          token: {
            value: '',
            type: 'input',
            props: {
              label: this.$tr('isite.cms.label.token')+"*",
              type: 'textarea',
              rows: 4,
              rules: [
                val => !!val || this.$tr('isite.cms.message.fieldRequired')
              ],
            }
          },
        }
      }
    },
    //Crud info
    crudInfo() {
      return this.$store.state.qcrudComponent.component[this.crudId] || {}
    }
  },
}
</script>
