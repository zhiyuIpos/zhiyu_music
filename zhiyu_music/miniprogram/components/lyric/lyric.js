// components/lyric/lyric.js
let lyricHeight = 0
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow:{
      type:Boolean,
      default:false
    },
    lyric:String,
  },
  observers:{ //数据监听
    lyric(lrc){
      // console.log(lrc)
      if(lrc == '暂无歌词'){
        this.setData({
          lyricList:[
            {
              lrc,
              time:0
            }
          ],
          nowLyricIndex : -1
        })
      }else{
        this._parseLyric(lrc)
      }
    }
  },
  /**
   * 组件的初始数据
   */ 
  data: {
    lyricList:[],
    nowLyricIndex:0 , //当前歌词索引
    scrollTop:0, //滚动条滚动的高度
  },
  lifetimes:{
    ready(){
      // 换算rpx 和 px
      wx.getSystemInfo({
        success: function(res) {
          //1rpx的大小
          lyricHeight = res.screenWidth / 750  * 64
          // console.log(lyricHeight)
        },
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    update(currentTime){
      // console.log(currentTime)
      let lrcList = this.data.lyricList
      // console.log(lrcList)
      if(lrcList.length==0){
        return
      }
      if (currentTime > lrcList[lrcList.length-1].time){
        if(this.data.nowLyricIndex != -1){
          this.setData({
            nowLyricIndex : -1,
            scrollTop:(i - 1) * lyricHeight
          })
        }
      }
      for(let i=0,len=lrcList.length;i<len;i++){
        if(currentTime <= lrcList[i].time){
          this.setData({
            nowLyricIndex : i - 1,
            scrollTop : (i - 1) * lyricHeight
          })
          break
        }
      }
    },
    // 解析歌词
    _parseLyric(sLyric){
      let line = sLyric.split('\n')
      // console.log(line)
      let _lrcList = []
      line.forEach((elem)=>{
        let time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        if(time!=null){
          let lrc = elem.split(time)[1] //歌词
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          // 把时间转换为秒
          // console.log(timeReg)
          let time2Seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000
          _lrcList.push({
            lrc,
            time : time2Seconds,
          })
        }
      })
      // 设置data里面的歌词列表
      this.setData({
        lyricList:_lrcList
      })
    }
  }
})
