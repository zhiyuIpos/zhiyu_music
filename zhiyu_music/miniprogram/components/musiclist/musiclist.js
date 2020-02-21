// components/musiclist/musiclist.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist:Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    playingId:-1
  },
  pageLifetimes:{
    show() {
      // 组件的什么周期，页面的生命周期
      this.setData({
        playingId: parseInt(app.getPlayingMusicId())
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(event){
      // 事件源 ：事件源头
      // 时间处理函数  
      // 时间对象
      // 事件类型
      let ds = event.currentTarget.dataset
      let musicId = ds.musicid
      this.setData({
        playingId: musicId
      })
      wx.navigateTo({
        url: `../../pages/player/player?musicId=${musicId}&index=${ds.index}`,
      })
    }
  }
})
