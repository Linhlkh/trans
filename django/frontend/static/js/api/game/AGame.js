import { AExchangeable } from "../AExchangable.js";
import { APlayer } from "./APlayer.js";
import { Client } from "../Client.js"
import { sleep } from "../../utils/sleep.js";
import { Profile } from "../Profile.js";

export class AGame extends AExchangeable
{
    /**
     * Abstract class to create commununication between client and server
     * @param {Client} client 
     * @param {Number} id 
     * @param {CallableFunction} receiveHandler 
     * @param {CallableFunction} disconntectHandler 
     * @param {"pong"} gameType
     */
    constructor(client, id, receiveHandler, disconntectHandler, gameType)
    {
        super();
        this.client = client;
        this.id = id;
        this.gameType = gameType;
        this._receiveHandler = receiveHandler;
        this._disconntectHandler = disconntectHandler;
        this.winner;
        this.startTimestamp;
        this.stopTimestamp;
        this.started;
        this.finished;
        this.players = [];
    }

    async init()
    {
        let response = await this.client._get(`/api/games/${this.id}`);

        if (response.status !== 200)
            return response.status;
        
        let response_data = await response.json();

        this.import(response_data);
    }

    getState()
    {
        return ["waiting", "started", "finished"][this.started + this.finished];
    }

    send(data)
    {
        if (this._socket === undefined || this._socket.readyState !== WebSocket.OPEN)
            return;
        this._socket.send(data);
    }

    async join()
    {
        if (this.finished === true)
        {
            console.error("The Game is not currently ongoing.");
            return;
        }

        const url = `${window.location.protocol[4] === 's' ? 'wss' : 'ws'}://${window.location.host}/ws/games/${this.gameType}/${this.id}`;

        this._socket = new WebSocket(url);

        this._socket.onmessage = async (event) => {
			const data = JSON.parse(event.data);
			await this._receiveHandler(data);
		};

        this._socket.onclose = async () => {
            this._socket = undefined;
            await this._disconntectHandler();            
        }; 
    }

    leave()
    {
        if (this._socket)
        {
            this._socket.close();
            this._socket = undefined;
        }
    }

}