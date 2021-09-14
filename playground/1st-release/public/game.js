export class GObject{
    updatable = false
    update(delta) { }
    input(command) { }
    events = { "entered": [], "ready": [], "exited": [] }
    connect(event, callback) {
        this.events[event].push(callback)
    }

    emitEvent(event) {
        for (fn of this.events[event])
            fn()
    }

    newEvents(...args) {
        if (args.length == 1) {
            this.events[args[0]] = []
            return
        }
        for (i of args) {
            this.events[i] = []
        }
    }
}

export class Timer extends GObject{
    constructor(timeLeft) {
        this.timeLeft = timeLeft
        this.newEvents('timeout')
    }
    start(timeLeft = this.timeLeft) {
        this.updatable = true
        this.timeLeft = timeLeft
    }

    update(delta) {
        this.timeLeft -= delta
        if (this.timeLeft <= 0) {
            this.emitEvent('timeout')
            this.updatable = false
            this.timeLeft = 0
        }
    }

}

export class Player extends GObject{
    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Number} speedX
     * @param {Number} speedY
     */
    constructor(x, y, width, height, speedX, speedY){
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.speedX = speedX
        this.speedY = speedY
    }

    /** @param {{x, y}} pos */
    set position(pos){
        this.x = pos.x
        this.y = pos.y
    }

    /**@param {{w, h}} size */
    set size(size){
        this.width = size.w
        this.height = size.h
    }

    /**@param {{x, y}} speed */
    set speed(speed) {
        const max = 20
        const sp = Math.min(max, Math.max(-max, sp))
        this.speedX = speed.x
        this.speedY = speed.y
    }
    
    input(command) {
        console.log(command)
    }
}

export default function createGame() {
    const state = {
        fps: 60,
        players: {},
        fruits: {},
        screen: {
            width: 480,
            height: 480
        },
        tree: []
    }
    function movePlayer(command){
        const player = state.players[command.playerId]
        if (player){
            notifyAll(command)
            console.log(`Moving ${command.playerId} with ${command.keyPressed}`)
            const keyPressed = command.keyPressed
            player.input(command)
            checkForFruitCollision(command.playerId)
        }
        //console.log(player)
    }

    function setState(newState){
        Object.assign(state, newState)
    }

    function addPlayer(command){
        const playerId = command.playerId
        const floorRand = (val) => Math.floor(Math.random()*val)
        const playerX = ('playerX' in command) ? command.playerX : floorRand(state.screen.width-1)
        const playerY = ('playerY' in command) ? command.playerY : floorRand(state.screen.height-1)

        state.players[playerId] = {
            x: playerX,
            y: playerY
        }
        notifyAll({
            type: 'add-player',
            playerId: playerId,
            playerX: playerX,
            playerY: playerY
        })
    }
    
    function removePlayer(command){
        const playerId = command.playerId
        delete state.players[playerId]
        notifyAll({
            type: 'remove-player',
            playerId: playerId,
        })
    }

    function addFruit(command={}){
        const floorRand = (val) => Math.floor(Math.random()*val)
        const fruitId = ('fruitId' in command) ? command.fruitId : floorRand(15890) 
        const fruitX = ('fruitX' in command) ? command.fruitX : floorRand(state.screen.width-1)
        const fruitY = ('fruitY' in command) ? command.fruitY : floorRand(state.screen.height-1)

        state.fruits[fruitId] = {
            x: fruitX,
            y: fruitY
        }

        notifyAll({
            type: 'add-fruit',
            fruitId: fruitId,
            fruitX: fruitX,
            fruitY: fruitY
        })
    }
    
    function removeFruit(command){
        const fruitId = command.fruitId
        delete state.fruits[fruitId]
        notifyAll({
            type: 'remove-fruit',
            fruitId: fruitId,
        })
    }

    function checkForFruitCollision(playerId){
        const player = state.players[playerId]
        for (let fruitId in state.fruits){
            console.log(`${playerId} and ${fruitId} collision check`)
            const fruit = state.fruits[fruitId]
            if (player.x === fruit.x && player.y === fruit.y){
                console.log(`${playerId} collided with ${fruitId}`)
                removeFruit({fruitId: fruitId})
            }
        }
    }

    const observers = []

    function subscribe(observerFunction){
        observers.push(observerFunction)
    }

    function notifyAll (command){
        console.log(`Notifying ${observers.length} observers`)

        for (const obsFunc of observers){
            obsFunc(command)
        }
    }

    function start(){
        update()
    }
    var lastFrameTimeStamp = new Date().getTime()
    const update = () => {
        const up = (new Date().getTime() - lastFrameTimeStamp);
        for (gobj of state.tree) {
            if (gobj.updatable)
                gobj.update(up)
        }
        lastFrameTimeStamp = new Date().getTime()
        setInterval(update, 1000 / state.fps)
    }

    return {
        movePlayer,
        addPlayer,
        removePlayer,
        addFruit,
        removeFruit,
        checkForFruitCollision,
        state,
        setState,
        subscribe,
        start
    }
}