# Registering

1) Client connects to Server
    - server does nothing
2) Client sends to server: 'registerClient'
    - userName
3.1) Server sends to client: 'registerAnswer'
    - player (object)
    - chamber (name)
    - powerups (list of powerups)
    - enemies (list of all players in chamber)
3.2) Server sends to other-clients: 'registerClient'
    - player (object)


# Death and Respawn

1) Server detects collision/playerdeath
2) Server sends to client: 'playerState'
    - playerState: 'dead'
    - playerStatistics (frags etc)
    - clientId
    - player (object)
3.1) Client shows death screen, with the statistics
3.2) Client sends to server: 'playerState'
    - playerState: 'wantRespawn'
4.1) Server handles playerState.
4.2) Server sends all-clients: 'playerState' 
    - playerState: 'alive'
    - clientId
    - player (object)
5) Client respawn the player, or the enemy


