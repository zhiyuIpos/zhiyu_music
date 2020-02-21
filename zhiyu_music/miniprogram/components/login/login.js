// components/login/login.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modelShow:Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onGotUserInfo(event){
      const userInfo = event.detail.userInfo
      // 允许授权的
      if(userInfo){
        this.setData({
          modelShow:false
        })
        // 组件内部往调用的地方传参
        this.triggerEvent("loginsuccess", userInfo)
      }else{
        // 拒绝授权
        this.triggerEvent('loginfail',userInfo)
      }
    }
  }
})
