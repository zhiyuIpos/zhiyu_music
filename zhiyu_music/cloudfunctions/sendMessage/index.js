// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const {OPENID} = cloud.getWXContext()
  console.log("openid", OPENID ,"event is ",event)
  const result = await cloud.openapi.templateMessage.send({
    touser:OPENID,
    page:`/pages/blog-comment/blog-comment?blogId=${event.blogId}`,
    data:{
      thing2:{
        value:event.content
      },
      time4:{
        value:'xxxx-xx'
      }
    },
    templateId:'ct-Ozvz8-OT4dXxGXKhlqAQd6WDVw9Mae4mZpaGvCw4',
    formId:event.formId
  })
  return result
}