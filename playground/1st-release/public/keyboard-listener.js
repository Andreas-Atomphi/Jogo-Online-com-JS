export default function createKeyboardListener(document){
            
    const state = {
        observers: [],
        playerId: null
    }

    function registerPlayerId(playerId){
        state.playerId = playerId
    }

    function subscribe(observerFunction){
        state.observers.push(observerFunction)
    }

    function notifyAll (command){
        console.log(`Notifying ${state.observers.length} observers`)

        for (const obsFunc of state.observers){
            obsFunc(command)
        }
    }
    
    document.addEventListener('keydown', handleKeyDown)

    function handleKeyDown(kevt){
        const keyPressed = kevt.key
        const command = {
            type: 'move-player',
            playerId: state.playerId,
            keyPressed
        }
        notifyAll(command)
    }
    return {
        subscribe,
        registerPlayerId
    }
}