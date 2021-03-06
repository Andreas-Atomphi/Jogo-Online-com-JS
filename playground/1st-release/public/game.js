export default function createGame() {
    const state = {
        fps: 20,
        players: {},
        fruits: {},
        screen: {
            width: 10,
            height: 10
        },
        tree: []
    }
    console.log(state.players)
    function movePlayer(command){
        const player = state.players[command.playerId]
        if (player){
            notifyAll(command)
            console.log(`Moving ${command.playerId} with ${command.keyPressed}`)
            const keyPressed = command.keyPressed
            player.x += -(keyPressed == 'ArrowLeft') + (keyPressed == 'ArrowRight')
            player.y += -(keyPressed == 'ArrowUp') + (keyPressed == 'ArrowDown')
            player.x = Math.min(state.screen.width-1, Math.max(0, player.x))
            player.y = Math.min(state.screen.height-1, Math.max(0, player.y))
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
            y: playerY,
            update: function(dt){
                console.log(dt)
            }
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

    let lastFrameTimeStamp
    function start(){
        //update()
        //lastFrameTimeStamp = Date.now()
        setTimeout(addFruitFreq, 5000)
        function addFruitFreq(){
            if (Object.values(state.fruits).length < 10){
                addFruit()
                setTimeout(addFruitFreq, 5000)
            }
        }
    }
    const update = () => {
        const up = (Date.now() - lastFrameTimeStamp);
        for (gobj of state.tree) {
            lastFrameTimeStamp = Date.now()
            if (gobj.updatable)
                gobj.update(up)
        }
        setTimeout(update, 1000/state.fps)
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