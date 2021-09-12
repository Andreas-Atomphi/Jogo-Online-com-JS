/**
 * @param {HTMLCanvasElement} screen
 * @param {CallableFunction} requestAnimationFrame
 */
export default function renderScreen(screen, game, requestAnimationFrame, playerId){
    /** @type {CanvasRenderingContext2D}*/
    const ctx = screen.getContext('2d')
    ctx.clearRect(0, 0, screen.width, screen.height);
    for (const playerId in game.state.players){
        const player = game.state.players[playerId]
        ctx.fillStyle = 'black'
        ctx.fillRect(player.x, player.y, 1, 1)
    }
    for (const fruitId in game.state.fruits){
        const fruit = game.state.fruits[fruitId]
        ctx.fillStyle = 'blue'
        ctx.fillRect(fruit.x, fruit.y, 1, 1)
    }

    const currentPlayer = game.state.players[playerId]
    if (currentPlayer){
        ctx.fillStyle = 'yellow'
        ctx.fillRect(currentPlayer.x, currentPlayer.y, 1, 1)
    }

    requestAnimationFrame(() => {
        renderScreen(screen, game, requestAnimationFrame, playerId)
    })
}