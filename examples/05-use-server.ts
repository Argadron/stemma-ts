import type { IServer, IServerCallbackReturn } from "stemma-ts";
import createGame, { NetworkPlguin, useServer } from "stemma-s";

const [game] = createGame()

let signature: string;

const server: IServer = {
    emit: (cmd, data) => {
        switch (cmd) {
            case 'nextSignature':
                signature = data as string
                break
            case 'serverCommand':
                const serverData = data as IServerCallbackReturn

                if (serverData.signature !== signature) throw new Error()
                else eval(serverData.cmd)
                break
        }
    },
    on: (event, cb) => {}
}

game.registerPlugin(new NetworkPlguin(server))

useServer(signature => ({
    signature,
    cmd: 'console.log(true)'
}))