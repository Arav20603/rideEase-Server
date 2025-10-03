export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected', socket.id)

    socket.on('user_request', (msg) => {
      console.log('user request', msg)
    })
    socket.on('disconnect', () => {
      console.log('user disconnected')
    })
  })
}