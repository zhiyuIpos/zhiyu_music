// components/progress-bar/progress-bar.js
let movableAreaWidth=0
let movableViewWidth=0
const backgroundAudioManager=wx.getBackgroundAudioManager()

let currentSec = -1 //表示当前的秒数
// 当前进度条是否在拖拽，解决
// 进度条和updatetime事件有冲突
let isMoving = false 
//当前总时长
let duration = 0
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame:Boolean,
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime:{
      currentTime:"00:00",
      totalTime:"00:00"
    },
    movableDis:0,
    progress:0
  },

  /**
   * 组件的方法列表
   */
  lifetimes:{
    ready(){
      if(this.properties.isSame && this.data.showTime.totalTime=='00:00'){
        this._setTime()
      }
      this._getMovableDis()
      this._bindBGMEvent()
    }
  },
  methods: {
    onChange(event){
      if(event.detail.source == 'touch'){
        // 表示拖动
        this.data.progress= event.detail.x / (
          movableAreaWidth - movableViewWidth 
        ) * 100
        this.data.movableDis = event.detail.x
        // 如果实在拖动，就表示是
        isMoving = true
      }
    },
    onTouchEnd(){
      const currentTimeFmt = this._dateFormat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({
        progress:this.data.progress,
        movableDis:this.data.movableDis,
        ["showTime.currentTime"]:currentTimeFmt.min + ':'+currentTimeFmt.sec
      })
      // 音乐也要跳转到对应位置
      backgroundAudioManager.seek(duration*this.data.progress / 100)
      isMoving = false
    },
    _getMovableDis(){
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec((rect)=>{
        // console.log(rect)
        movableAreaWidth =rect[0].width
        movableViewWidth=rect[1].width
        // console.log(movableAreaWidth, movableViewWidth)

      })
    },

    _bindBGMEvent(){
      backgroundAudioManager.onPlay(()=>{
        // console.log('onPlay')
        isMoving= false
        this.triggerEvent('musicPlay')
      })
      backgroundAudioManager.onStop(()=>{
        // console.log('onStop')
        // 修改父元素的属性

      })
      backgroundAudioManager.onPause(() => {
        // console.log('pause')
        this.triggerEvent('musicPause')
      })
      backgroundAudioManager.onWaiting(() => {
        // console.log('onWaiting')
      })
      backgroundAudioManager.onCanplay(() => {
        // console.log('onCanplay')
        // console.log(backgroundAudioManager.duration)
        // 判断当前的值是否是未定义的
        if (typeof backgroundAudioManager.duration != 'undefined'){
          this._setTime()
        }else{
          setTimeout(()=>{
            this._setTime()
          },1000)
        }
      })
      backgroundAudioManager.onTimeUpdate(() => {
        // console.log('onTimeUpdate')
        if(!isMoving){
          const currentTime = backgroundAudioManager.currentTime
          const duration = backgroundAudioManager.duration
          const sec = currentTime.toString().split(".")[0]
          if (sec != currentSec) {
            // console.log(currentTime)
            const currentTimeFmt = this._dateFormat(currentTime)
            this.setData({
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100,
              ["showTime.currentTime"]: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
            })
            currentSec = sec

            // 联动歌词
            this.triggerEvent('timeUpdate',{
              currentTime  
            })
          } 
        }
      })
      // onended
      backgroundAudioManager.onEnded(() => {
        // console.log('onEnded')
        // 子组件如何和父元素通数据
        this.triggerEvent('musicEnd')
      })
      backgroundAudioManager.onError((res) => {
        // console.log(res.errMsg)
        // console.log(res.errCode)
        wx.showToast({
          title: '错误'+res.errCode,
        })
      })
    },
    _setTime(){
      // 把总的秒数赋值出来
      duration = backgroundAudioManager.duration
      // 毫秒数
      // console.log(duration)
      const durationFmt = this._dateFormat(duration)
      this.setData({
        ['showTime.totalTime']:`${durationFmt.min}:${durationFmt.sec}`
      })
    },
    _dateFormat(sec){
      // 格式化时间的
      const min = Math.floor(sec / 60 )
      sec = Math.floor(sec % 60 )
      return{
        'min':this._parse0(min),
        'sec':this._parse0(sec)
      }
    },
    // 添加0
    _parse0(sec){
      return sec<10 ? '0' + sec : sec
    }
  }
})
