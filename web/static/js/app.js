// import {Socket} from "phoenix"

// // let socket = new Socket("/ws")
// // socket.join("topic:subtopic", {}, chan => {
// // })

// let App = {
// }

// export default App


import {Socket, LongPoller} from "phoenix"

class App {

  static init(){
    var socket     = new Socket("ws://" + location.host +  "/ws")
    socket.connect()
    var $status    = $("#status")
    var $messages  = $("#messages")
    var $input     = $("#message-input")
    var $username  = $("#username")

    socket.onClose( e => console.log("CLOSE", e))

    socket.join("rooms:lobby", {})
      .receive("ignore", () => console.log("auth error") )
      .receive("ok", chan => {

        chan.onError( e => console.log("something went wrong", e) )
        chan.onClose( e => console.log("channel closed", e) )

        $input.off("keypress").on("keypress", e => {
          if (e.keyCode == 13) {
            chan.push("new:msg", {user: $username.val(), body: $input.val()})
            $input.val("")
          }
        })

        chan.on("new:msg", msg => {
          $messages.append(this.messageTemplate(msg))
          scrollTo(0, document.body.scrollHeight)
        })
        
        chan.on("user:entered", msg => {
          var username = this.sanitize(msg.user || "anonymous")
          $messages.append(`<br/><i>[${username} entered]</i>`)
        })
      })
      .after(10000, () => console.log("Connection interruption") )
  }

  static sanitize(html){ return $("<div/>").text(html).html() }

  static messageTemplate(msg){
    let username = this.sanitize(msg.user || "anonymous")
    let body     = this.sanitize(msg.body)

    return(`<p><a href='#'>[${username}]</a>&nbsp; ${body}</p>`)
  }

}

$( () => App.init() )

export default App