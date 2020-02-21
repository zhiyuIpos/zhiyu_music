// components/blog-ctrl/blog-ctrl.js

let userInfo = {}

let db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId:String,
    blog : Object
  },
  externalClasses:[
    'iconfont',
    'icon-comment',
    'icon-fenxiang'
  ],
  /**
   * 组件的初始数据
   */
  data: {
    loginShow:false ,  //是否显示 登录组件是否显示
    modelShow:false, //底部弹出层
    content:'',  //空字符串
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment(){
      // 判断用户是否授权
      wx.getSetting({
        success:(res)=>{
          if(res.authSetting['scope.userInfo']){
            wx.getUserInfo({
              success:(res)=>{
                userInfo = res.userInfo
                // 显示评论弹出层
                this.setData({
                  modelShow:true
                })
              }
            })
          }else{
            this.setData({
              loginShow:true
            })
          }
        }
      })
    },
    onLoginSuccess(event){
      // 授权框应该消失，评论框显示
      userInfo = event.detail
      this.setData({
        loginShow:false
      },()=>{
        // 显示评论弹出层
        this.setData({
          modelShow: true
        })
      })
    },
    onLoginFail(){
      wx.showModal({
        title: '授权用户才能进行评价'
      })
    },
    onSend(event){
      console.log(event)
      let formId = event.detail.formId
      // 插入到云数据库
      let content = event.detail.value.content
      console.log(formId,content)
      if(content.trim() == ''){
        wx.showModal({
          title: '评论的内容不能为空'
        })
        return
      }
      // 当前的评论是哪个用户的
      wx.showLoading({
        title: '评价中',
        mask:true
      })

      // 
      console.log("userInfo",userInfo)
      db.collection('blog-comment').add({
        data:{
          content,
          createTime:db.serverDate(),
          blogId:this.properties.blogId,
          nickName:userInfo.nickName,
          avatarUrl:userInfo.avatarUrl
        }
      }).then((res)=>{
        // 推送对应的模板消息
        // console.log(content, formId, this.properties.blogId)
        // wx.cloud.callFunction({
        //   name: 'sendMessage',
        //   data: {
        //     content,
        //     formId,
        //     blogId: this.properties.blogId
        //   }
        // }).then(res => {
        //   console.log(res)
        // })
        
        // 父元素刷新评论
        this.triggerEvent('refreshCommentList')
        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
        })
        this.setData({
          modelShow: false,
          content: ''
        })
        
      })
    },
  }
})
