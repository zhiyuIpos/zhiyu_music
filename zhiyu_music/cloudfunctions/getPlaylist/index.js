// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
// 云数据库初始化
const db = cloud.database()
const rp = require('request-promise')

const URL='http://musicapi.xiecheng.live/personalized'

const playlistCollection = db.collection('playlist')    

const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  // 去掉重复的
  //const list =await playlistCollection.get() 只能获取100条数据
  const countResult = await playlistCollection.count()
  const total = countResult.total   //条数
  // 计算需要取几次
  const batchTimes = Math.ceil(total / MAX_LIMIT) 
  const tasks = []
  for(let i =0;i<batchTimes;i++){
  let promise =  playlistCollection.skip(i*MAX_LIMIT).limit(MAX_LIMIT).get()
  tasks.push(promise)
  }
  let list ={
    data:[]
  }
  if(tasks.length>0){
    list = (await Promise.all(tasks)).reduce((acc,cur)=>{
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }
  // 云函数最多获取云数据是100 小程序是200
  
  const playlist = await rp(URL).then((res)=>{
    return JSON.parse(res).result
  })
  // console.log(playlist)
  // 循环遍历
  // 插入云数据库  并且去掉重复的
  const newData = []
  for(let i =0,len1=playlist.length;i<len1;i++){
    let flag = true  //不重复
    for(let j=0,len2=list.data.length;j<len2;j++){
      if(playlist[i].id === list.data[j].id){
        flag = false
        break
      }
    }
    if(flag){
      newData.push(playlist[i])
    }
  }
  for (let i = 0, len = newData.length;i<len;i++){
    await playlistCollection.add({
      data:{
        ...newData[i],
        createTime:db.serverDate(), //服务器时间
      }
    }).then((res)=>{
      console.log('插入成功')
    }).catch(err=>{
      console.log('插入失败')
    })
  }
  return newData.length
}