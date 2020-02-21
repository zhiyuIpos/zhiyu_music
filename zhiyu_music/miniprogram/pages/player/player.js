// pages/player/player.js
let musiclist= []
// 正在播放歌曲的索引
let nowPlayingIndex = 0
// 获取位移的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl:'',
    isPlaying:false, //表示不播放 true表示播放
    isLyricShow:false , //表示当前的歌词是否显示
    lyric : '',  //歌词空字符串
    isSame:false,  //表示是否为同一首歌曲
  },
  // 切换播放暂停状态
  togglePlaying(){
     if(this.data.isPlaying){
       backgroundAudioManager.pause()
     }else{
       backgroundAudioManager.play()
     }
     this.setData({
       isPlaying:!this.data.isPlaying
     })
  },
  // 上一首 下一首
  onPrev(){
    nowPlayingIndex--
    if(nowPlayingIndex < 0){
      nowPlayingIndex = musiclist.length - 1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  onNext(){ 
    nowPlayingIndex++
    if(nowPlayingIndex == musiclist.length){
      nowPlayingIndex = 0
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  // 判断歌词组件是否显示
  onChangeLyricShow(){
    this.setData({
      isLyricShow:!this.data.isLyricShow
    })
  },

  timeUpdate(event){
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log("options is", options)
    nowPlayingIndex= options.index
    musiclist = wx.getStorageSync('musiclist')
    this._loadMusicDetail(options.musicId)
  },
  _loadMusicDetail(musicId){
    // 加载音乐详情

    // 判断是否是同一首歌曲
    if (musicId == app.getPlayingMusicId()){
      this.setData({
        isSame : true
      })
    }else{
      this.setData({
        isSame : false
      })
    }
    app.setPlayingMusicId(musicId) //设置当前播放的歌曲的id
    if (!this.data.isSame) {
      backgroundAudioManager.stop()
    }
    let music = musiclist[nowPlayingIndex]
    // console.log("music is " , music)
    wx.setNavigationBarTitle({
      title: music.name,
    })
    this.setData({
      piccUrl:music.al.picUrl,
      isPlaying : false
    })
    // console.log(musicId , typeof musicId)
    wx.showLoading({
      title: '歌曲加载中...',
    })
    wx.cloud.callFunction({
      name:'music',
      data:{
        musicId,
        $url:'musicUrl'
      }
    }).then(res=>{
      let result = JSON.parse(res.result)
      // 如果是不是同一首歌曲 才需要设置值
      // vip的歌曲播放不了
      if(result.data[0].url == null){
        wx.showToast({
          title: '无权限播放',
        })
        return
      }
      if (!this.data.isSame) {
        backgroundAudioManager.src = result.data[0].url
        backgroundAudioManager.title = music.name //必须设置title
        backgroundAudioManager.coverImgUrl = music.al.picUrl
        backgroundAudioManager.singer = music.ar[0].name
        backgroundAudioManager.epname = music.al.name

        // 保存播放历史
        this.savePlayHistory()
      }
      this.setData({
        isPlaying:true
      })
      wx.hideLoading()
      // 加载歌词
      wx.cloud.callFunction({
        name : 'music',
        data:{
          musicId,
          $url:'lyric',
        }
      }).then(res=>{
        let lyric = '暂无歌词'
        const lrc = JSON.parse(res.result)
        if (lrc.lrc && lrc.lrc.lyric){
          // console.log(lrc.lrc.lyric)
          lyric = lrc.lrc.lyric
        }
        // console.log('lyric', lyric)
        this.setData({
          lyric
        })
      })
    })
  },
  onPlay(){
    this.setData({
      isPlaying:true
    })
  },
  onPause(){
    this.setData({
      isPlaying:false
    })
  },
  // 保存播放历史
  savePlayHistory(){
    // 获取播放的那首歌曲 正在播放的歌曲
    let music = musiclist[nowPlayingIndex]
    // 
    const openid = app.globalData.openid
    const history = wx.getStorageSync(openid)
    // 判断当前歌曲是否存在历史记录里面了
    let bHave = false
    for(let i =0,len=history.length;i<len;i++){
      if(history[i].id == music.id){
        bHave = true
        break
      }
    }
    // 如果shifalse表示不存在
    if(!bHave){
      history.unshift(music)
      wx.setStorage({
        key: openid,
        data: history,
      })
    }
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