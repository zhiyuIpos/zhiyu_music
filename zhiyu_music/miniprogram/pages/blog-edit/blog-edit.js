// pages/blog-edit/blog-edit.js

// 文字最大个数
const MAX_WORDS_NUM= 140

// 图片最大数
const MAX_IMG_NUM = 9

// 云数据库中初始化
const db = wx.cloud.database()
// 输入的文字内容
let content =''

let userInfo = {} //用户信息
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsNum:0, //输入的文字个数
    footerBottom:0 ,
    images :[] , //图片的个数
    selectPhoto:true , //当前是否显示
  },
  onChooseImage(){
    let max = MAX_IMG_NUM - this.data.images.length
    wx.chooseImage({
      count:max, //还能选几张
      sizeType:['original','compressed'],
      sourceType:['album','camera'],
      success: (res)=> {
        this.setData({
          images:this.data.images.concat(res.tempFilePaths)
        })
        // 还能再选几张
        max = MAX_IMG_NUM - this.data.images.length
        this.setData({
          selectPhoto:max<=0?false:true
        })
      },
    })
  },
  onDelImage(event){
    event.target.dataset.index
    // 通过索引删除指定元素
    this.data.images.splice(event.target.dataset.index, 1)
    this.setData({
      images:this.data.images
    })

    // 判断当前图片和数组的关系
    if(this.data.images.length == MAX_IMG_NUM -1){
      this.setData({
        selectPhoto:true
      })
    }
  },
  onPreviewImage(event){
    // 显示5/9
    wx.previewImage({
      urls: this.data.images,
      current:event.target.dataset.imgsrc
    })
  },
  onFocus(event){
    console.log(event)
    this.setData({
      footerBottom:event.detail.height
    })
  },
  onBlur(){
    this.setData({
      footerBottom:0
    })
  },
  onInput(event){
    let wordsNum  = event.detail.value.length
    if(wordsNum >= MAX_WORDS_NUM){
      wordsNum=`最大字数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum
    })
    content = event.detail.value
  },
  send(){
    // 发布  数据 存储到  运输库中 json存储
    // 内容、图片
    // 图片：上传到云存储中 5g内存空间 返回fileId（云文件ID）,openId(那个用户的唯一标识)、昵称、头像、时间
    
    // 判断content
    if(content.trim() ===''){
      wx.showModal({
        title: '请输入内容',
        content: '',
      })
      return
    }
    
    wx.showLoading({
      title: '发布中...',
      mask:true , //产生一个蒙版
    })

    // 图片上传 (每次只能上传一张)

    let promiseArr= []

    let fileIds = []
    for(let i=0,len=this.data.images.length;i<len;i++){
      let p = new Promise((resolve,reject)=>{
        let item = this.data.images[i]
        // 文件扩展名
        let suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 10000000 + suffix,
          filePath: item, //路径
          success: (res) => {
            console.log("res", res)
            fileIds = fileIds.concat(res.fileID) //
            resolve()
          },
          fail: (err) => {
            reject()
          }
        })
      })
      //把这个promise对象push到prmseArr这个数组中，用promise.all 在所有异步任务都结束的时候才上传到云数据库中
      promiseArr.push(p)
    }
    // 存入到运输库中
    Promise.all(promiseArr).then((res)=>{
      // 存入到数据中 
      console.log(userInfo, content, fileIds, db.serverDate())
      db.collection('blog').add({
        data: {
          ...userInfo,
          content,
          img:fileIds,
          createTime:db.serverDate() //服务端的时间，有客户端的和服务器端的，，这个选择服务端的
        }
      }).then((res)=>{
        console.log(res)
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })

        // 返回blog页面，并且刷新
        // 调用父界面上的方法
        wx.navigateBack()
        const pages=getCurrentPages()
        console.log(pages)
        const prevPage = pages[pages.length - 2]
        prevPage.onPullDownRefresh()
      })
    }).catch(err=>{
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("options",options)
    userInfo = options
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})